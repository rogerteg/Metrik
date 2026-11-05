/**
 * Metrik — Motor de Previsão de Backlog & Épicos com Monte Carlo
 * Feature: 056-monte-carlo-backlog-forecast
 *
 * Funções puras para resolução de escopo, validação amostral NIST
 * e avaliação estocástica de probabilidade de cumprimento de datas meta.
 */

import { TaskModel } from '../types/kanban';
import {
  BacklogScopeType,
  BacklogForecastScope,
  TargetDateProbabilityResult,
  TargetDateRiskLevel,
  BacklogMonteCarloForecastResult,
} from '../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
import { addDaysToDate } from './monteCarlo';

export interface ResolveScopeOptions {
  type: BacklogScopeType;
  scopeId?: string;
  selectedTaskIds?: string[];
}

export interface ThroughputSampleValidation {
  isSampleSufficient: boolean;
  deliveryDays: number;
  totalDelivered: number;
  warningReason?: string;
}

/**
 * Agrupa as tarefas do quadro com base no tipo de escopo e identifica pendências e conclusões.
 */
export function resolveBacklogScope(
  tasks: TaskModel[],
  options: ResolveScopeOptions,
): BacklogForecastScope {
  const { type, scopeId, selectedTaskIds } = options;

  let allTasks: TaskModel[] = [];
  let scopeTitle = 'Backlog Geral do Quadro';
  let inferredTargetDate: string | undefined;

  switch (type) {
    case 'initiative': {
      const initiative = tasks.find((t) => t.id === scopeId && t.type === 'initiative');
      if (initiative) {
        scopeTitle = `Épico: ${initiative.title}`;
        inferredTargetDate = initiative.dueDate || initiative.endDate;
        // Localiza tarefas vinculadas diretamente via links ou iniciativa
        allTasks = tasks.filter((t) => {
          if (t.id === initiative.id) return false; // a própria iniciativa é o contêiner
          const hasLink = t.links?.some((l) => l.targetTaskId === initiative.id);
          const hasInitiativeId =
            (t as unknown as { initiativeId?: string }).initiativeId === initiative.id;
          return hasLink || hasInitiativeId;
        });
      } else {
        allTasks = [];
      }
      break;
    }

    case 'sprint': {
      scopeTitle = `Sprint: ${scopeId || 'Ativa'}`;
      allTasks = tasks.filter((t) => t.sprintId === scopeId);
      // Inspeciona se alguma tarefa da sprint possui dueDate como alvo
      const taskWithDueDate = allTasks.find((t) => Boolean(t.dueDate));
      inferredTargetDate = taskWithDueDate?.dueDate;
      break;
    }

    case 'tag': {
      scopeTitle = `Tag: #${scopeId}`;
      allTasks = tasks.filter((t) => Boolean(t.tags?.includes(scopeId || '')));
      break;
    }

    case 'all':
    default: {
      scopeTitle = 'Todas as Tarefas em Aberto';
      // Considera todas as tarefas que não estão finalizadas ou que estão no fluxo
      allTasks = tasks.filter((t) => t.type !== 'initiative');
      break;
    }
  }

  const completedTasks = allTasks.filter((t) => Boolean(t.completedAt));
  const pendingTasks = allTasks.filter((t) => !t.completedAt);

  // Inicializa a seleção de IDs: se o usuário já customizou, filtra pelas pendentes existentes;
  // senão, seleciona 100% das tarefas pendentes por padrão.
  let activeSelectedIds: string[];
  if (selectedTaskIds && Array.isArray(selectedTaskIds)) {
    const validPendingIds = new Set(pendingTasks.map((t) => t.id));
    activeSelectedIds = selectedTaskIds.filter((id) => validPendingIds.has(id));
  } else {
    activeSelectedIds = pendingTasks.map((t) => t.id);
  }

  return {
    type,
    scopeId,
    scopeTitle,
    allTasks,
    completedTasks,
    pendingTasks,
    selectedTaskIds: activeSelectedIds,
    inferredTargetDate,
  };
}

/**
 * Valida o tamanho da amostra histórica de Throughput segundo as diretrizes NIST.
 * Exige no mínimo 10 dias com entregas registradas para declarar significância estatística.
 */
export function validateThroughputSample(throughputHistory: number[]): ThroughputSampleValidation {
  if (!throughputHistory || throughputHistory.length === 0) {
    return {
      isSampleSufficient: false,
      deliveryDays: 0,
      totalDelivered: 0,
      warningReason: 'Histórico de Throughput vazio. Nenhuma entrega registrada.',
    };
  }

  const totalDelivered = throughputHistory.reduce((acc, curr) => acc + curr, 0);
  const deliveryDays = throughputHistory.filter((count) => count > 0).length;

  if (totalDelivered === 0) {
    return {
      isSampleSufficient: false,
      deliveryDays: 0,
      totalDelivered: 0,
      warningReason: 'Nenhuma entrega registrada no período selecionado.',
    };
  }

  if (deliveryDays < 10) {
    return {
      isSampleSufficient: false,
      deliveryDays,
      totalDelivered,
      warningReason: `Amostra estatística com menos de 10 dias com entregas (apenas ${deliveryDays} de 10 dias mínimos).`,
    };
  }

  return {
    isSampleSufficient: true,
    deliveryDays,
    totalDelivered,
  };
}

/**
 * Avalia a probabilidade estocástica percentual (0..100) de concluir o lote em ou antes da Data Meta.
 * Executa uma contagem da Função de Distribuição Acumulada (CDF) sobre os ensaios de Monte Carlo.
 */
export function calculateTargetDateProbability(
  trialDaysResults: number[],
  targetDate: string,
  referenceDate: Date = new Date(),
): TargetDateProbabilityResult {
  if (!targetDate || !trialDaysResults || trialDaysResults.length === 0) {
    return {
      targetDate: targetDate || '',
      availableDays: 0,
      probability: 0,
      successfulTrials: 0,
      totalTrials: trialDaysResults?.length || 0,
      riskLevel: 'critical',
      statusMessage: 'Data meta não especificada ou simulação sem ensaios.',
    };
  }

  // Normaliza a data de referência para início do dia
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  // Normaliza a data meta para fim do dia
  const target = new Date(targetDate);
  target.setHours(23, 59, 59, 999);

  const diffMs = target.getTime() - ref.getTime();
  const availableDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (availableDays <= 0) {
    return {
      targetDate,
      availableDays,
      probability: 0,
      successfulTrials: 0,
      totalTrials: trialDaysResults.length,
      riskLevel: 'critical',
      statusMessage: 'A data meta informada já expirou ou é anterior à data de referência.',
    };
  }

  const totalTrials = trialDaysResults.length;
  let successfulTrials = 0;

  for (let i = 0; i < totalTrials; i++) {
    if (trialDaysResults[i] <= availableDays) {
      successfulTrials++;
    }
  }

  const probability = Number(((successfulTrials / totalTrials) * 100).toFixed(1));

  let riskLevel: TargetDateRiskLevel = 'critical';
  let statusMessage = '';

  if (probability >= 85) {
    riskLevel = 'low';
    statusMessage = `Excelente probabilidade (${probability}%). Compromisso de prazo estatisticamente seguro.`;
  } else if (probability >= 50) {
    riskLevel = 'moderate';
    statusMessage = `Probabilidade moderada (${probability}%). Prazo factível, mas sujeito a variabilidade de fluxo.`;
  } else if (probability >= 20) {
    riskLevel = 'high';
    statusMessage = `Alto risco (${probability}%). Probabilidade acentuada de atraso com a vazão atual.`;
  } else {
    riskLevel = 'critical';
    statusMessage = `Risco crítico (${probability}%). Prazo estatisticamente inviável sem redução de escopo.`;
  }

  return {
    targetDate,
    availableDays,
    probability,
    successfulTrials,
    totalTrials,
    riskLevel,
    statusMessage,
  };
}

export interface BacklogForecastRunOptions {
  scope: BacklogForecastScope;
  throughputHistory: number[];
  targetDate?: string;
  referenceDate?: Date;
  trials?: number;
  rng?: () => number;
}

/**
 * Executa simulação preditiva estocástica completa para o escopo selecionado.
 */
export function runBacklogMonteCarloForecast(
  options: BacklogForecastRunOptions,
): BacklogMonteCarloForecastResult {
  const {
    scope,
    throughputHistory,
    targetDate,
    referenceDate = new Date(),
    trials = 10000,
    rng = Math.random,
  } = options;

  const sampleValidation = validateThroughputSample(throughputHistory);
  const itemCount = scope.selectedTaskIds.length;
  const refDateStr = referenceDate.toISOString().split('T')[0];

  const baseResult: BacklogMonteCarloForecastResult = {
    scope,
    itemCount,
    p50: { days: 0, projectedDate: refDateStr },
    p85: { days: 0, projectedDate: refDateStr },
    p95: { days: 0, projectedDate: refDateStr },
    sampleDays: sampleValidation.deliveryDays,
    totalDelivered: sampleValidation.totalDelivered,
    isSampleSufficient: sampleValidation.isSampleSufficient,
    warningReason: sampleValidation.warningReason,
  };

  if (!sampleValidation.isSampleSufficient || itemCount <= 0 || trials <= 0) {
    if (targetDate && itemCount === 0) {
      baseResult.targetDateAnalysis = {
        targetDate,
        availableDays: 0,
        probability: 100,
        successfulTrials: trials,
        totalTrials: trials,
        riskLevel: 'low',
        statusMessage: 'Todas as tarefas do escopo já estão concluídas (100% de sucesso).',
      };
    }
    return baseResult;
  }

  const historyLength = throughputHistory.length;
  const trialDays: number[] = new Array(trials);
  const MAX_DAYS_SAFETY = 1000;

  for (let t = 0; t < trials; t++) {
    let accumulated = 0;
    let daysPassed = 0;

    while (accumulated < itemCount && daysPassed < MAX_DAYS_SAFETY) {
      daysPassed++;
      const randomIndex = Math.floor(rng() * historyLength);
      accumulated += throughputHistory[randomIndex];
    }
    trialDays[t] = daysPassed;
  }

  const sortedAsc = [...trialDays].sort((a, b) => a - b);
  const idxP50 = Math.min(Math.floor(0.5 * trials), trials - 1);
  const idxP85 = Math.min(Math.floor(0.85 * trials), trials - 1);
  const idxP95 = Math.min(Math.floor(0.95 * trials), trials - 1);

  const p50Days = sortedAsc[idxP50];
  const p85Days = sortedAsc[idxP85];
  const p95Days = sortedAsc[idxP95];

  baseResult.p50 = { days: p50Days, projectedDate: addDaysToDate(referenceDate, p50Days) };
  baseResult.p85 = { days: p85Days, projectedDate: addDaysToDate(referenceDate, p85Days) };
  baseResult.p95 = { days: p95Days, projectedDate: addDaysToDate(referenceDate, p95Days) };

  if (targetDate) {
    baseResult.targetDateAnalysis = calculateTargetDateProbability(
      trialDays,
      targetDate,
      referenceDate,
    );
  }

  return baseResult;
}
