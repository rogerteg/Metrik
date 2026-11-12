/**
 * mikaMonteCarloContext.ts - Compilador de Telemetria Estocástica para Mika AI (Feature 057)
 * Extrai amostras de vazão histórica, avalia suficiência NIST, compila previsões de iniciativas,
 * sprint ativa, capacidade e backlog geral.
 */

import { TaskModel, ColumnModel } from '../../types/kanban';
import { CardSlePrediction } from '../../types/sle';
import {
  MikaMonteCarloTelemetry,
  MikaInitiativeForecastSummary,
  MikaSprintForecastSummary,
  MikaCapacityForecastSummary,
} from '../../types/mika';
import { extractDailyThroughput, runMonteCarloHowMany } from '../../utils/monteCarlo';
import {
  resolveBacklogScope,
  validateThroughputSample,
  runBacklogMonteCarloForecast,
} from '../../utils/monteCarloForecast';
import { rankTopLeverages } from '../../utils/flowLeverageEngine';

/**
 * Constrói o snapshot de telemetria estocástica de Monte Carlo para o contexto da Mika.
 */
export function buildMikaMonteCarloTelemetry(
  tasks: TaskModel[],
  referenceDate: Date = new Date(),
  trials: number = 2000,
  columns: ColumnModel[] = [],
  boardId: string = 'default-board',
  slePredictions: Record<string, CardSlePrediction> = {},
): MikaMonteCarloTelemetry {
  const refDateStr = referenceDate.toISOString().split('T')[0];

  // 1. Extração da vazão histórica (últimos 60 dias)
  const throughputSamples = extractDailyThroughput(tasks, 60, referenceDate);
  const throughputHistory = throughputSamples.map((s) => s.count);
  const sampleValidation = validateThroughputSample(throughputHistory);

  // 2. Previsão de Iniciativas / Épicos
  const initiatives: MikaInitiativeForecastSummary[] = [];
  const initiativeTasks = tasks.filter((t) => t.type === 'initiative');

  for (const init of initiativeTasks) {
    const scope = resolveBacklogScope(tasks, {
      type: 'initiative',
      scopeId: init.id,
    });

    const targetDate = init.dueDate || init.endDate;
    const forecast = runBacklogMonteCarloForecast({
      scope,
      throughputHistory,
      targetDate,
      referenceDate,
      trials,
    });

    initiatives.push({
      id: init.id,
      title: init.title,
      pendingCount: scope.pendingTasks.length,
      completedCount: scope.completedTasks.length,
      targetDate,
      p50Days: forecast.p50.days,
      p50Date: forecast.p50.projectedDate,
      p85Days: forecast.p85.days,
      p85Date: forecast.p85.projectedDate,
      p95Days: forecast.p95.days,
      p95Date: forecast.p95.projectedDate,
      targetProbability: forecast.targetDateAnalysis?.probability,
      riskLevel: forecast.targetDateAnalysis?.riskLevel,
    });
  }

  // 3. Previsão da Sprint Ativa
  let activeSprint: MikaSprintForecastSummary | undefined;
  // Localiza o ID da sprint ativa (itens com sprintId e não concluídos ou presentes no quadro)
  const sprintTask =
    tasks.find((t) => Boolean(t.sprintId) && !t.completedAt) ||
    tasks.find((t) => Boolean(t.sprintId));
  if (sprintTask && sprintTask.sprintId) {
    const sprintId = sprintTask.sprintId;
    const sprintScope = resolveBacklogScope(tasks, {
      type: 'sprint',
      scopeId: sprintId,
    });

    const sprintForecast = runBacklogMonteCarloForecast({
      scope: sprintScope,
      throughputHistory,
      targetDate: sprintScope.inferredTargetDate,
      referenceDate,
      trials,
    });

    activeSprint = {
      id: sprintId,
      title: `Sprint ${sprintId}`,
      pendingCount: sprintScope.pendingTasks.length,
      completedCount: sprintScope.completedTasks.length,
      targetDate: sprintScope.inferredTargetDate,
      p85Days: sprintForecast.p85.days,
      p85Date: sprintForecast.p85.projectedDate,
      targetProbability: sprintForecast.targetDateAnalysis?.probability,
      riskLevel: sprintForecast.targetDateAnalysis?.riskLevel,
    };
  }

  // 4. Capacidade Padrão para 14 dias (How Many)
  let defaultCapacity14Days: MikaCapacityForecastSummary | undefined;
  if (sampleValidation.isSampleSufficient) {
    const howManyResult = runMonteCarloHowMany(throughputHistory, 14, trials);
    defaultCapacity14Days = {
      windowDays: 14,
      p50Items: howManyResult.p50,
      p85Items: howManyResult.p85,
      p95Items: howManyResult.p95,
    };
  }

  // 5. Previsão do Backlog Geral Aberto
  const generalScope = resolveBacklogScope(tasks, { type: 'all' });
  const generalForecast = runBacklogMonteCarloForecast({
    scope: generalScope,
    throughputHistory,
    referenceDate,
    trials,
  });

  // 6. Alavancas de Fluxo (Feature 058)
  const topLeverages = rankTopLeverages({
    boardId,
    tasks,
    columns,
    slePredictions,
    deliveryDaysCount: throughputHistory.length,
  });

  return {
    sampleValidation,
    initiatives,
    activeSprint,
    defaultCapacity14Days,
    generalBacklogPendingCount: generalScope.pendingTasks.length,
    generalBacklogP85Days: generalForecast.p85.days,
    generalBacklogP85Date: generalForecast.p85.projectedDate || refDateStr,
    topLeverages,
  };
}
