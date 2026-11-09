/**
 * mikaQuickPrompts.ts - Sugestões de perguntas rápidas para o chat da Mika (Feature 052 & Feature 057)
 */

import { MikaQuickPrompt } from '../../types/mika';

export const QUICK_PROMPTS: MikaQuickPrompt[] = [
  {
    id: 'qp-bottleneck',
    label: '🚨 Onde está o gargalo?',
    query: 'Onde está o principal gargalo do fluxo?',
    category: 'bottleneck',
  },
  {
    id: 'qp-blocked',
    label: '🛑 Cartões bloqueados',
    query: 'Quais tarefas estão bloqueadas?',
    category: 'blocked',
  },
  {
    id: 'qp-sle',
    label: '🎯 SLE de 85%',
    query: 'Qual é o nosso SLE de 85%?',
    category: 'sle',
  },
  {
    id: 'qp-throughput',
    label: '📈 Previsão de entrega',
    query: 'Qual é a nossa previsão de entrega e ritmo?',
    category: 'throughput',
  },
  {
    id: 'qp-forecast-init',
    label: '🎲 Previsão da Iniciativa',
    query: 'Como estão as iniciativas ativas?',
    category: 'forecast_initiative',
  },
  {
    id: 'qp-forecast-sprint',
    label: '📅 Risco da Sprint',
    query: 'A sprint atual vai atrasar?',
    category: 'forecast_sprint',
  },
  {
    id: 'qp-forecast-capacity',
    label: '🎯 Capacidade (85% SLE)',
    query: 'Quantos itens cabem na próxima sprint?',
    category: 'forecast_capacity',
  },
];
