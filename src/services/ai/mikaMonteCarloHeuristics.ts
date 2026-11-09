/**
 * mikaMonteCarloHeuristics.ts - Sub-motor analítico determinístico de Monte Carlo para a Mika (Feature 057)
 * Interpreta intenções de prazos, iniciativas, capacidade de sprint e backlog.
 * Opera 100% offline em < 10ms, sem chamadas externas nem consumo de tokens (Princípios VIII e X).
 */

import { MikaBoardTelemetryContext, TargetDateRiskLevel } from '../../types/mika';
import { MikaHeuristicChatResult, normalizeQuery } from './mikaChatHeuristicEngine';

function formatRiskBadge(level?: TargetDateRiskLevel): string {
  switch (level) {
    case 'low':
      return '🟢 Baixo Risco';
    case 'moderate':
      return '🟡 Risco Moderado';
    case 'high':
      return '🔴 Alto Risco';
    case 'critical':
      return '⚠️ Risco Crítico';
    default:
      return '⚪ Risco Indefinido';
  }
}

function getNistWarning(context: MikaBoardTelemetryContext): string {
  const sampleValidation = context.monteCarloTelemetry?.sampleValidation;
  if (sampleValidation && !sampleValidation.isSampleSufficient) {
    return `\n\n⚠️ **Amostra Estatística Reduzida (NIST)**: O quadro possui apenas **${sampleValidation.deliveryDays} dias** com entregas registradas (mínimo de 10 dias recomendado). As estimativas probabilísticas possuem margem de erro ampliada.`;
  }
  return '';
}

/**
 * Avalia se a consulta do usuário corresponde a uma intenção de previsão de Monte Carlo
 */
export function matchMonteCarloForecastIntent(
  query: string,
  context: MikaBoardTelemetryContext,
): MikaHeuristicChatResult | null {
  const normalized = normalizeQuery(query);
  const mc = context.monteCarloTelemetry;

  const isForecastQuery =
    normalized.includes('previs') ||
    normalized.includes('monte carlo') ||
    normalized.includes('quando') ||
    normalized.includes('prazo') ||
    normalized.includes('capacidade') ||
    normalized.includes('quantos itens') ||
    normalized.includes('quantas tarefas') ||
    normalized.includes('cabem') ||
    normalized.includes('atras') ||
    normalized.includes('termino') ||
    normalized.includes('iniciativa') ||
    normalized.includes('projeto') ||
    normalized.includes('epico') ||
    normalized.includes('sprint') ||
    normalized.includes('backlog');

  if (!isForecastQuery || !mc) {
    return null;
  }

  const nistAlert = getNistWarning(context);

  // 1. Intenção: Capacidade / How Many (Quantos itens cabem na sprint/período)
  if (
    normalized.includes('capacidade') ||
    normalized.includes('quantos itens') ||
    normalized.includes('quantas tarefas') ||
    normalized.includes('cabem') ||
    normalized.includes('puxar')
  ) {
    const customDaysMatch = normalized.match(/\b(\d+)\s*(?:dias?|d)\b/);
    const windowDays = customDaysMatch ? parseInt(customDaysMatch[1], 10) : 14;

    const cap = mc.defaultCapacity14Days;
    const p50 =
      cap && windowDays === 14
        ? cap.p50Items
        : Math.round(windowDays * (context.throughputLast14Days / 14));
    const p85 = cap && windowDays === 14 ? cap.p85Items : Math.max(0, Math.round(p50 * 0.75));
    const p95 = cap && windowDays === 14 ? cap.p95Items : Math.max(0, Math.round(p50 * 0.5));

    const content = `🎯 **Capacidade de Entrega (Simulação de Monte Carlo)**\n\nConsiderando uma sprint de **${windowDays} dias corridos** baseada no ritmo empírico de vazão do quadro:\n\n- **${p85} itens** com **85% de certeza** (Recomendação Lean / SLE)\n- **${p50} itens** com **50% de certeza** (Cenário otimista)\n- **${p95} itens** com **95% de certeza** (Compromisso de alta confiança)\n\n💡 **Recomendação**: Puxe no máximo **${p85} itens** para o próximo ciclo para proteger o fluxo contra variabilidade e gargalos.${nistAlert}`;

    return {
      content,
      referencedTaskIds: [],
      category: 'forecast_capacity',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: '📊 Ver Simulação de Capacidade no Painel',
        scopeType: 'sprint',
      },
    };
  }

  // 2. Intenção: Risco / Prazo da Sprint Ativa
  if (
    normalized.includes('sprint') &&
    (normalized.includes('atras') ||
      normalized.includes('prazo') ||
      normalized.includes('quando') ||
      normalized.includes('previs'))
  ) {
    if (!mc.activeSprint) {
      return {
        content: `ℹ️ Não identifiquei nenhuma sprint ativa com tarefas pendentes no quadro no momento. Cadastre ou vincule itens a uma sprint para habilitar previsões específicas.`,
        referencedTaskIds: [],
        category: 'forecast_sprint',
      };
    }

    const sprint = mc.activeSprint;
    const probText =
      sprint.targetProbability !== undefined
        ? `\n- Probabilidade de término até ${sprint.targetDate || 'a data meta'}: **${sprint.targetProbability}%** (${formatRiskBadge(sprint.riskLevel)})`
        : '';

    const recommendation =
      sprint.riskLevel === 'high' || sprint.riskLevel === 'critical'
        ? '💡 **Ação recomendada**: Risco estatístico elevado de estouro de prazo. Recomendo negociar o corte preventivo dos itens de menor prioridade da sprint.'
        : '💡 **Ação recomendada**: Ritmo de entrega favorável. Mantenha os limites de WIP para assegurar a cadência.';

    const content = `📅 **Diagnóstico de Prazo da ${sprint.title}**\n\n- Itens restantes: **${sprint.pendingCount} pendentes** (e ${sprint.completedCount} concluídos)\n- Previsão P85 (SLE): **~${sprint.p85Days} dias corridos** (projeção: **${sprint.p85Date}**)${probText}\n\n${recommendation}${nistAlert}`;

    return {
      content,
      referencedTaskIds: [],
      category: 'forecast_sprint',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: `📊 Ver Simulação da ${sprint.title}`,
        scopeType: 'sprint',
        scopeId: sprint.id,
      },
    };
  }

  // 3. Intenção: Iniciativa Específica
  const matchedInit = mc.initiatives.find((init) => {
    const normTitle = normalizeQuery(init.title);
    if (normalized.includes(normTitle) || normalized.includes(init.id.toLowerCase())) {
      return true;
    }
    const titleWords = normTitle.split(/\s+/).filter((w) => w.length >= 3);
    return titleWords.some((w) => normalized.includes(w));
  });

  if (matchedInit) {
    const probText =
      matchedInit.targetProbability !== undefined
        ? `\n- Confiança de Data Meta (${matchedInit.targetDate}): **${matchedInit.targetProbability}%** (${formatRiskBadge(matchedInit.riskLevel)})`
        : '';

    const content = `📦 **Previsão Estocástica da Iniciativa: #${matchedInit.id} "${matchedInit.title}"**\n\n- Escopo: **${matchedInit.pendingCount} tarefas pendentes** (${matchedInit.completedCount} já concluídas)\n- **P50 (Otimista)**: ~${matchedInit.p50Days} dias corridos (projeção: ${matchedInit.p50Date})\n- **P85 (Recomendado/SLE)**: ~${matchedInit.p85Days} dias corridos (projeção: **${matchedInit.p85Date}**)\n- **P95 (Conservador)**: ~${matchedInit.p95Days} dias corridos (projeção: ${matchedInit.p95Date})${probText}\n\n💡 **Diagnóstico Lean**: Para compromissos com clientes ou diretoria, utilize sempre o percentil **P85 (${matchedInit.p85Date})** para absorver a variabilidade natural do fluxo.${nistAlert}`;

    return {
      content,
      referencedTaskIds: [matchedInit.id],
      category: 'forecast_initiative',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: `📊 Ver Simulação Completa da Iniciativa "${matchedInit.title}"`,
        scopeType: 'initiative',
        scopeId: matchedInit.id,
      },
    };
  }

  // 4. Intenção: Panorama Geral de Portfólio (Clarificação 1 - Opção A)
  const isPortfolioQuery =
    normalized.includes('iniciativas') ||
    normalized.includes('projetos') ||
    normalized.includes('epicos') ||
    normalized.includes('como estao');

  if (isPortfolioQuery && mc.initiatives.length > 0) {
    const list = mc.initiatives
      .map((init) => {
        const risk = formatRiskBadge(init.riskLevel);
        const dateTarget = init.targetDate ? ` (Meta: ${init.targetDate})` : '';
        return `- #${init.id} **${init.title}**\n  📍 ${init.pendingCount} tarefas pendentes | P85: **~${init.p85Days} dias** (${init.p85Date})${dateTarget}\n  🏷️ Nível de Risco: ${risk}`;
      })
      .join('\n\n');

    const content = `📋 **Panorama Consolidado de Iniciativas (Monte Carlo)**\n\nIdentifiquei **${mc.initiatives.length} iniciativas ativas** com previsões estocásticas calculadas:\n\n${list}\n\n💡 Recomendo focar a atenção do time nas iniciativas sinalizadas com risco elevado antes de puxar novos épicos.${nistAlert}`;

    return {
      content,
      referencedTaskIds: mc.initiatives.map((i) => i.id),
      category: 'forecast_initiative',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: '📊 Ver Previsão de Épicos no Painel',
        scopeType: 'initiative',
      },
    };
  }

  // 5. Intenção: Previsão Geral do Backlog Aberto
  if (
    normalized.includes('backlog') ||
    normalized.includes('tudo') ||
    normalized.includes('todo o quadro') ||
    normalized.includes('todas as tarefas') ||
    normalized.includes('quando terminamos')
  ) {
    const content = `📦 **Previsão Global de Conclusão do Backlog**\n\n- Tarefas em aberto no quadro: **${mc.generalBacklogPendingCount} tarefas pendentes**\n- Estimativa P85 de conclusão total: **~${mc.generalBacklogP85Days} dias corridos** (projeção estimada: **${mc.generalBacklogP85Date}**)\n\n💡 Esta estimativa assume a vazão histórica atual do quadro e não contempla novas tarefas adicionadas futuramente.${nistAlert}`;

    return {
      content,
      referencedTaskIds: [],
      category: 'forecast_general',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: '📊 Ver Simulação do Backlog Completo',
        scopeType: 'all',
      },
    };
  }

  // Fallback para primeira iniciativa se houver
  if (mc.initiatives.length > 0) {
    const first = mc.initiatives[0];
    return {
      content: `📦 **Previsão Estocástica para a Iniciativa #${first.id} "${first.title}"**\n\n- Pendências: **${first.pendingCount} tarefas**\n- P85 (SLE): **~${first.p85Days} dias** (projeção: **${first.p85Date}**)\n- Situação: ${formatRiskBadge(first.riskLevel)}${nistAlert}`,
      referencedTaskIds: [first.id],
      category: 'forecast_initiative',
      action: {
        type: 'NAVIGATE_TO_FORECAST',
        label: `📊 Ver Simulação de "${first.title}"`,
        scopeType: 'initiative',
        scopeId: first.id,
      },
    };
  }

  return null;
}
