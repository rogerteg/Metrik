/**
 * Tipos de domínio e modelos de dados para a Mika AI Flow Copilot (Feature 048)
 * Conforme especificações em specs/048-mika-ai-flow-copilot/data-model.md
 */

export type MikaInsightSeverity = 'info' | 'warning' | 'critical';
export type MikaInsightCategory =
  'cycle-time' | 'wip-bottleneck' | 'monte-carlo' | 'sle-risk' | 'throughput';

export interface MikaInsight {
  /** Identificador único (ex: "insight-monte-carlo-123") */
  id: string;
  /** Título sintetizado (ex: "Previsibilidade de Entrega: 85% até 24/10") */
  title: string;
  /** Diagnóstico em linguagem natural (pt-BR) */
  summary: string;
  /** Ação consultiva recomendada (ex: "Reduzir o limite de WIP na coluna Testes") */
  recommendation?: string;
  /** Nível de criticidade visual (azul, âmbar, vermelho) */
  severity: MikaInsightSeverity;
  /** Domínio da métrica analisada */
  category: MikaInsightCategory;
  /** Valor quantitativo de suporte (ex: "4.2 dias", "85%") */
  metricValue?: number | string;
  /** ISO 8601 da geração do insight */
  timestamp: string;
  /** IDs de tarefas relacionadas (ex: tarefas em risco de SLE) */
  affectedTaskIds?: string[];
  /** ID da coluna afetada pelo gargalo (se aplicável) */
  affectedColumnId?: string;
}

export interface MikaSubtaskSuggestion {
  /** ID temporário para seleção na interface */
  id: string;
  /** Texto/Título acionável da subtarefa */
  title: string;
  /** Texto alternativo para compatibilidade */
  text?: string;
  /** Inicialmente false */
  completed: boolean;
}

export interface MikaDecomposition {
  /** ID da tarefa de origem */
  taskId: string;
  /** Subtarefas sugeridas para o checklist */
  suggestedSubtasks: MikaSubtaskSuggestion[];
  /** Critérios no formato Dado/Quando/Então */
  suggestedAcceptanceCriteria?: string[];
  /** Breve justificativa da quebra de escopo */
  explanation?: string;
  /** ISO 8601 da criação */
  timestamp: string;
}

export type MikaProvider = 'gemini' | 'heuristic-offline';

export interface MikaPreferences {
  /** Se a Mika está ativa na interface */
  enabled: boolean;
  /** Provedor ativo ('gemini' ou 'heuristic-offline') */
  provider: MikaProvider;
  /** Chave do Gemini ofuscada (se configurada) */
  apiKeyObfuscated?: string;
  /** Se deve gerar insights automaticamente ao abrir dashboards */
  autoDiagnoseOnLoad: boolean;
  /** Tom de comunicação da Mika */
  tone: 'consultative' | 'direct';
}

export interface MikaCacheEntry {
  /** Hash composto por boardId + tasksChecksum */
  cacheKey: string;
  /** Lista de insights cacheados */
  insights: MikaInsight[];
  /** Timestamp epoch em milissegundos */
  generatedAt: number;
}
