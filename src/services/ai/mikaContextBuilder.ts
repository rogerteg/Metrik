/**
 * mikaContextBuilder.ts - Extrator de telemetria do quadro e construtor de prompts (Feature 052)
 * Compila colunas, limites de WIP, tempo de permanência, tarefas bloqueadas, SLE P85 e regras de marca.
 */

import { ColumnModel, TaskModel } from '../../types/kanban';
import { MikaBoardTelemetryContext } from '../../types/mika';
import { calculatePercentile } from '../../utils/statistics';

/**
 * Constrói o snapshot de telemetria do quadro ativo a partir dos dados do estado
 */
export function buildBoardTelemetryContext(
  board: { id: string; title: string },
  tasks: TaskModel[] = [],
  columns: ColumnModel[] = [],
): MikaBoardTelemetryContext {
  const now = Date.now();
  const columnMap = new Map<string, ColumnModel>();
  columns.forEach((col) => columnMap.set(col.id, col));

  // 1. Processamento das Colunas e WIP
  const columnsTelemetry = columns.map((col) => {
    const columnTasks = tasks.filter((t) => t.column === col.id);
    const taskCount = columnTasks.length;
    const wipLimit =
      typeof col.wipLimit === 'number' && col.wipLimit > 0 ? col.wipLimit : undefined;
    const isOverWip = wipLimit !== undefined ? taskCount > wipLimit : false;

    // Cálculo do tempo médio de permanência na coluna (em horas)
    let totalStageHours = 0;
    if (taskCount > 0) {
      columnTasks.forEach((t) => {
        const referenceTime = t.lastMovedAt || t.createdAt;
        const timeDiffMs = referenceTime ? Math.max(0, now - new Date(referenceTime).getTime()) : 0;
        totalStageHours += timeDiffMs / (1000 * 60 * 60);
      });
    }

    const avgStageTimeHours =
      taskCount > 0 ? Math.round((totalStageHours / taskCount) * 10) / 10 : 0;

    return {
      id: col.id,
      title: col.title,
      wipLimit,
      taskCount,
      isOverWip,
      avgStageTimeHours,
    };
  });

  // 2. Tarefas Bloqueadas
  const blockedTasksTelemetry = tasks
    .filter((t) => Boolean(t.blocked))
    .map((t) => {
      const col = columnMap.get(t.column);
      const blockedMs = t.blockedAt
        ? Math.max(0, now - new Date(t.blockedAt).getTime())
        : t.totalBlockedMs || 0;
      const blockedHours = Math.round((blockedMs / (1000 * 60 * 60)) * 10) / 10;

      return {
        id: t.id,
        title: t.title,
        columnTitle: col ? col.title : 'Desconhecida',
        reason: t.blockedReason || 'Sem justificativa informada',
        blockedHours,
      };
    });

  // 3. Cálculo de SLE 85% do Tempo de Ciclo (tarefas concluídas)
  const doneColumnIds = new Set(columns.filter((c) => c.category === 'done').map((c) => c.id));

  const completedTasks = tasks.filter((t) => doneColumnIds.has(t.column) || Boolean(t.completedAt));

  const cycleTimesDays: number[] = [];
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  let throughputLast14Days = 0;

  completedTasks.forEach((t) => {
    const startTimeStr = t.startedAt || t.createdAt;
    const endTimeStr = t.completedAt || t.lastMovedAt || t.updatedAt;

    if (startTimeStr && endTimeStr) {
      const startMs = new Date(startTimeStr).getTime();
      const endMs = new Date(endTimeStr).getTime();
      if (endMs >= startMs) {
        const cycleDays = (endMs - startMs) / (1000 * 60 * 60 * 24);
        cycleTimesDays.push(cycleDays);
      }
      if (endMs >= fourteenDaysAgo) {
        throughputLast14Days++;
      }
    }
  });

  const cycleTimeP85Days =
    cycleTimesDays.length > 0 ? calculatePercentile(cycleTimesDays, 85) : null;

  const totalActiveTasks = tasks.length - completedTasks.length;

  return {
    boardId: board.id,
    boardTitle: board.title || 'Quadro Atual',
    columns: columnsTelemetry,
    blockedTasks: blockedTasksTelemetry,
    cycleTimeP85Days,
    throughputLast14Days,
    totalActiveTasks: Math.max(0, totalActiveTasks),
    totalCompletedTasks: completedTasks.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Constrói o System Prompt institucional da Mika para o Google Gemini com telemetria fresca
 */
export function buildMikaSystemPrompt(context: MikaBoardTelemetryContext): string {
  const columnsSummary = context.columns
    .map((c) => {
      const wipInfo = c.wipLimit
        ? `WIP: ${c.taskCount}/${c.wipLimit}${c.isOverWip ? ' (VIOLADO)' : ''}`
        : `Tarefas: ${c.taskCount} (sem limite)`;
      return `- **${c.title}**: ${wipInfo}, permanência média: ~${c.avgStageTimeHours}h`;
    })
    .join('\n');

  const blockedSummary =
    context.blockedTasks.length > 0
      ? context.blockedTasks
          .map(
            (b) =>
              `- #${b.id} "${b.title}" na coluna "${b.columnTitle}" há ${b.blockedHours}h (Motivo: ${b.reason})`,
          )
          .join('\n')
      : 'Nenhuma tarefa bloqueada no momento.';

  const sleText =
    context.cycleTimeP85Days !== null
      ? `${context.cycleTimeP85Days} dias (85% das tarefas são concluídas neste período)`
      : 'Amostra insuficiente de tarefas concluídas para SLE estatístico.';

  return `Você é a Mika, a copiloto analítica de IA nativa do Metrik, especialista em dinâmica de trabalho e métricas de fluxo Lean/Kanban.

DIRETRIZES CONSTITUCIONAIS OBRIGATÓRIAS (Metrik Constitution):
1. IDIOMA E TOM: Responda em Português do Brasil (pt-BR) com tom consultivo, amigável, técnico, conciso e focado em fluxo e previsibilidade.
2. INDEPENDÊNCIA DE MARCA (Princípio VII): NUNCA mencione marcas ou produtos de concorrentes ou de terceiros (ex.: Jira, ClickUp, Trello, Businessmap, ActionableAgile, etc.). Use estritamente terminologia padronizada de fluxo e agilidade: Limites de WIP, Lei de Little, Tempo de Ciclo (Cycle Time), Lead Time, Expectativa de Nível de Serviço (SLE P85), Diagrama de Fluxo Cumulativo (CFD), Throughput e Simulação de Monte Carlo.
3. PAPEL CONSULTIVO (Princípio IX): Você analisa dados, aponta anomalias e recomenda melhorias técnicas, mas opera em modo ESTRITAMENTE LEITURA (read-only). Você não tem poder de alterar cartões autonomamente.
4. REFERÊNCIA A TAREFAS: Sempre que mencionar tarefas específicas no texto, cite no formato #ID (ex.: "#1", "#42") seguido do título resumido. A interface do Metrik transforma essa notação em um link interativo clicável que permite ao usuário inspecionar o cartão diretamente.
5. FORMATAÇÃO: Use Markdown elegante (tópicos com marcadores, listas curtas e negrito em métricas-chave). Seja direta e evite rodeios prolixos.

TELEMETRIA ATUAL DO QUADRO ("${context.boardTitle}"):
- Total de tarefas ativas em progresso: ${context.totalActiveTasks}
- Total de tarefas concluídas: ${context.totalCompletedTasks}
- Throughput dos últimos 14 dias: ${context.throughputLast14Days} tarefas entregues
- SLE de 85% do Tempo de Ciclo: ${sleText}

ESTADO DAS COLUNAS:
${columnsSummary}

TAREFAS BLOQUEADAS ATUALMENTE:
${blockedSummary}

Use esta telemetria real para responder com exatidão matemática às perguntas do usuário sobre o fluxo.`;
}
