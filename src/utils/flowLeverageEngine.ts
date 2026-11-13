/**
 * Metrik - Flow Leverage Engine (Feature 058)
 * Motor puro de cálculo para o Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso.
 * Governança: Constituição Artigo II (<= 400 linhas), Local-First e 100% determinístico.
 */

import { TaskModel, ColumnModel } from '../types/kanban';
import { CardSlePrediction } from '../types/sle';
import {
  CascadeImpactResult,
  SimulatedPolicyScenario,
  TopLeveragesSummary,
  FlowLeverageItem,
} from '../types/analytics';

/**
 * Constrói o mapa de adjacências de dependências a jusante (downstream).
 * Mapeia cada tarefa para as tarefas que ela bloqueia ou retém.
 */
function buildDownstreamMap(tasks: TaskModel[]): Map<string, Set<string>> {
  const downstream = new Map<string, Set<string>>();
  for (const t of tasks) {
    if (!downstream.has(t.id)) downstream.set(t.id, new Set());
  }

  for (const t of tasks) {
    if (!t.links || t.links.length === 0) continue;
    for (const link of t.links) {
      const targetId = link.targetTaskId;
      if (!downstream.has(targetId)) downstream.set(targetId, new Set());

      if (link.relationType === 'blocks' || link.relationType === 'child') {
        downstream.get(t.id)?.add(targetId);
      } else if (link.relationType === 'is_blocked_by' || link.relationType === 'parent') {
        downstream.get(targetId)?.add(t.id);
      }
    }
  }

  return downstream;
}

/**
 * Calcula o tempo decorrido (em dias) em bloqueio ou aging ativo.
 */
function getAgingDays(task: TaskModel): number {
  const now = Date.now();
  if (task.blockedAt) {
    const ms = now - new Date(task.blockedAt).getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }
  if (task.totalBlockedMs && task.totalBlockedMs > 0) {
    return Math.max(1, Math.round(task.totalBlockedMs / 86400000));
  }
  if (task.startedAt) {
    const ms = now - new Date(task.startedAt).getTime();
    return Math.max(1, Math.round(ms / 86400000));
  }
  const ms = now - new Date(task.createdAt).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

/**
 * Calcula o impacto em cascata de um impedimento utilizando Busca em Profundidade (DFS).
 * Detecta ciclos circulares sem travar e quantifica o Custo do Atraso em dias extras P85.
 */
export function calculateCascadeImpact(
  tasks: TaskModel[],
  rootTaskId: string,
  _slePredictions?: Record<string, CardSlePrediction>,
): CascadeImpactResult {
  const rootTask = tasks.find((t) => t.id === rootTaskId);
  if (!rootTask) {
    return {
      rootTaskId,
      dependentTaskIds: [],
      maxDepth: 0,
      hasCycle: false,
      estimatedDelayDaysP85: 0,
    };
  }

  const downstreamMap = buildDownstreamMap(tasks);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleNodes = new Set<string>();
  const dependents: string[] = [];
  let maxDepth = 0;
  let hasCycle = false;

  function dfs(currentId: string, currentDepth: number) {
    if (recursionStack.has(currentId)) {
      hasCycle = true;
      cycleNodes.add(currentId);
      return;
    }
    if (visited.has(currentId)) return;

    visited.add(currentId);
    recursionStack.add(currentId);
    if (currentDepth > maxDepth) maxDepth = currentDepth;

    const children = downstreamMap.get(currentId);
    if (children) {
      for (const childId of children) {
        if (!dependents.includes(childId) && childId !== rootTaskId) {
          dependents.push(childId);
        }
        dfs(childId, currentDepth + 1);
      }
    }

    recursionStack.delete(currentId);
  }

  recursionStack.add(rootTaskId);
  const rootChildren = downstreamMap.get(rootTaskId);
  if (rootChildren) {
    for (const childId of rootChildren) {
      if (!dependents.includes(childId)) dependents.push(childId);
      dfs(childId, 1);
    }
  }
  recursionStack.delete(rootTaskId);

  // Custo do Atraso (Cost of Delay) em dias extras no prazo P85:
  // agingDays(bloqueador) * min(1.5, 1 + 0.15 * dependentCount)
  const agingDays = getAgingDays(rootTask);
  const multiplier = Math.min(1.5, 1 + 0.15 * dependents.length);
  const estimatedDelayDaysP85 = Math.max(1, Math.round(agingDays * multiplier));

  return {
    rootTaskId,
    dependentTaskIds: dependents,
    maxDepth,
    hasCycle,
    cycleTaskIds: hasCycle ? Array.from(cycleNodes) : undefined,
    estimatedDelayDaysP85,
  };
}

export interface SimulatePolicyParams {
  boardId: string;
  tasks: TaskModel[];
  columns: ColumnModel[];
  scopeType: 'all' | 'initiative' | 'sprint' | 'tag';
  scopeId?: string;
  simulatedLimits: Record<string, number | null>;
  swarmingEnabled: boolean;
  baselineThroughput?: number;
  baselineCycleTimeP50?: number;
  baselineCycleTimeP85?: number;
  deliveryDaysCount?: number;
}

/**
 * Simula no modo Sandbox o impacto de alterar limites de WIP ou ativar Swarming.
 * Utiliza a Lei de Little (WIP = Throughput x Cycle Time) com piso de segurança.
 */
export function simulatePolicyScenario(params: SimulatePolicyParams): SimulatedPolicyScenario {
  const {
    boardId,
    tasks,
    columns,
    scopeType,
    scopeId,
    simulatedLimits,
    swarmingEnabled,
    baselineThroughput = 1.0,
    baselineCycleTimeP50 = 7.0,
    baselineCycleTimeP85 = 14.0,
    deliveryDaysCount = 0,
  } = params;

  const currentWipByColumn: Record<string, number> = {};
  const configuredLimits: Record<string, number | null> = {};

  for (const col of columns) {
    currentWipByColumn[col.id] = 0;
    configuredLimits[col.id] = col.wipLimit;
  }

  for (const t of tasks) {
    if (currentWipByColumn[t.column] !== undefined && !t.completedAt) {
      currentWipByColumn[t.column] += 1;
    }
  }

  const inProgressCols = columns.filter((c) => c.category === 'in_progress');
  let currentWipInProgress = 0;
  let simulatedWipInProgress = 0;

  for (const col of inProgressCols) {
    const count = currentWipByColumn[col.id] || 0;
    currentWipInProgress += count;
    const simLimit = simulatedLimits[col.id];
    if (simLimit !== undefined && simLimit !== null && simLimit > 0) {
      simulatedWipInProgress += Math.min(count, simLimit);
    } else {
      simulatedWipInProgress += count;
    }
  }

  // Lei de Little: CT_sim = CT_base * (WIP_sim / WIP_cur)
  const wipRatio =
    currentWipInProgress > 0 ? Math.max(0.4, simulatedWipInProgress / currentWipInProgress) : 1.0;

  const simP50 = Math.max(1.0, Math.round(baselineCycleTimeP50 * wipRatio * 10) / 10);
  let simP85 = Math.max(1.5, Math.round(baselineCycleTimeP85 * wipRatio * 10) / 10);

  // Swarming em itens críticos reduz a cauda longa em ~15%
  if (swarmingEnabled) {
    simP85 = Math.max(1.0, Math.round(simP85 * 0.85 * 10) / 10);
  }

  const deltaDaysP85 = Math.round((simP85 - baselineCycleTimeP85) * 10) / 10;
  const isSampleSufficient = deliveryDaysCount >= 10;

  return {
    boardId,
    scopeType,
    scopeId,
    currentWipByColumn,
    configuredLimits,
    simulatedLimits,
    swarmingEnabled,
    currentCycleTimeP50: baselineCycleTimeP50,
    currentCycleTimeP85: baselineCycleTimeP85,
    simulatedCycleTimeP50: simP50,
    simulatedCycleTimeP85: simP85,
    deltaDaysP85,
    averageDailyThroughput: baselineThroughput,
    isSampleSufficient,
  };
}

export interface RankTopLeveragesParams {
  boardId: string;
  tasks: TaskModel[];
  columns: ColumnModel[];
  slePredictions?: Record<string, CardSlePrediction>;
  deliveryDaysCount?: number;
}

/**
 * Ranqueia as Top 3 Alavancas de Fluxo acionáveis para o dia com justificativa consultiva.
 */
export function rankTopLeverages(params: RankTopLeveragesParams): TopLeveragesSummary {
  const { boardId, tasks, columns, slePredictions = {}, deliveryDaysCount = 0 } = params;
  const candidates: FlowLeverageItem[] = [];
  const colMap = new Map(columns.map((c) => [c.id, c]));

  // 1. Alavancas de Desbloqueio em Cascata (cascade_unblock)
  const blockedTasks = tasks.filter((t) => t.blocked && !t.completedAt);
  for (const task of blockedTasks) {
    const impact = calculateCascadeImpact(tasks, task.id, slePredictions);
    const col = colMap.get(task.column);
    const aging = getAgingDays(task);
    const depCount = impact.dependentTaskIds.length;
    const rationale =
      depCount > 0
        ? `Desbloquear este item destrava ${depCount} tarefa(s) a jusante e pode economizar ~${impact.estimatedDelayDaysP85} dias no prazo P85.`
        : `Resolver o bloqueio deste item (${aging}d parado) evita atrasos cumulativos de ~${impact.estimatedDelayDaysP85} dias no prazo P85.`;

    candidates.push({
      id: `lev-unblock-${task.id}`,
      taskId: task.id,
      taskTitle: task.title,
      category: 'cascade_unblock',
      impactDaysP85: impact.estimatedDelayDaysP85,
      dependentTaskCount: depCount,
      dependentTaskIds: impact.dependentTaskIds,
      currentAgingDays: aging,
      rationale,
      columnId: col?.id,
      columnTitle: col?.title,
    });
  }

  // 2. Alavancas de Swarming em Aging Crítico (aging_swarming)
  const inProgressTasks = tasks.filter(
    (t) => !t.completedAt && !t.blocked && colMap.get(t.column)?.category === 'in_progress',
  );
  for (const task of inProgressTasks) {
    const sle = slePredictions[task.id];
    const aging = getAgingDays(task);
    const isSleViolated =
      Boolean(sle) &&
      (sle.riskLevel === 'risk_p85' ||
        sle.riskLevel === 'critical_p95' ||
        (sle.thresholds && sle.agingDays > sle.thresholds.p85Days));

    if (isSleViolated) {
      const p85Target = sle.thresholds?.p85Days || sle.effectiveTargetDays || 8;
      const excess = Math.max(1, Math.round(aging - p85Target));
      const impactDays = Math.max(1, Math.round(excess * 0.8));
      const col = colMap.get(task.column);

      candidates.push({
        id: `lev-aging-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        category: 'aging_swarming',
        impactDaysP85: impactDays,
        dependentTaskCount: 0,
        dependentTaskIds: [],
        currentAgingDays: aging,
        rationale: `Aplicar swarming neste item com aging crítico (${aging}d) pode reduzir ~${impactDays} dias de cauda longa no P85.`,
        columnId: col?.id,
        columnTitle: col?.title,
      });
    }
  }

  // Ordenação determinística:
  // 1. impactDaysP85 (desc)
  // 2. dependentTaskCount (desc)
  // 3. currentAgingDays (desc)
  // 4. taskId (asc)
  candidates.sort((a, b) => {
    if (b.impactDaysP85 !== a.impactDaysP85) return b.impactDaysP85 - a.impactDaysP85;
    if (b.dependentTaskCount !== a.dependentTaskCount)
      return b.dependentTaskCount - a.dependentTaskCount;
    if (b.currentAgingDays !== a.currentAgingDays) return b.currentAgingDays - a.currentAgingDays;
    return a.taskId.localeCompare(b.taskId);
  });

  return {
    boardId,
    calculatedAt: new Date().toISOString(),
    items: candidates.slice(0, 3),
    isSampleSufficient: deliveryDaysCount >= 10,
    deliveryDaysCount,
  };
}
