/**
 * Tipos e interfaces analíticas para o Metrik (Features 011 & 030)
 * Categorização e Distribuição Analítica de Fluxo
 */

import { ColumnModel } from './kanban';

export interface CfdDataPoint {
  /** Data no formato ISO 'YYYY-MM-DD' */
  date: string;
  /** Quantidade acumulada de tarefas concluídas até esta data */
  done: number;
  /** Quantidade acumulada em progresso (WIP) nesta data */
  inProgress: number;
  /** Quantidade acumulada em backlog/a fazer nesta data */
  todo: number;
  /** Total de itens criados no sistema até esta data */
  total: number;
  /** Total acumulado de itens que ingressaram no fluxo (in_progress + done) */
  cumulativeStarted: number;
  /** Total acumulado de itens que saíram do fluxo (done) */
  cumulativeDone: number;
  /** Quantidade de itens em cada etapa/coluna específica do quadro nesta data */
  stageCounts?: Record<string, number>;
  /** Quantidade acumulada a partir desta etapa até o final do fluxo */
  cumulativeStages?: Record<string, number>;
}

export interface CfdData {
  points: CfdDataPoint[];
  maxTotal: number;
  isEmpty: boolean;
  columns?: ColumnModel[];
}

/**
 * Categorias da Barra de Navegação Analítica do Metrik (Feature 030)
 * Inclui alias de retrocompatibilidade 'cfd' mapeado para 'flow'.
 */
export type AnalyticsCategory =
  | 'dashboard'
  | 'cycle-time'
  | 'throughput'
  | 'wip'
  | 'flow'
  | 'blockers'
  | 'sles'
  | 'forecasting'
  | 'cfd';

/** Modos de visualização para a categoria Cycle Time */
export type CycleTimeViewMode = 'scatter' | 'histogram';

/** Modos de visualização para a categoria Blockers */
export type BlockerViewMode = 'clustering' | 'dynamics';

/**
 * Indicador de Expectativa de Nível de Serviço (SLE)
 * Baseado em percentis padronizados (NIST) e metas de entrega da equipe.
 */
export interface ServiceLevelExpectation {
  /** Percentil estatístico de referência (padrão: 85) */
  targetPercentile: number;
  /** Prazo em dias calculado a partir do histórico (NIST Nearest Rank) */
  observedDays: number;
  /** Meta de dias configurada manualmente pela equipe (opcional) */
  targetDays?: number | null;
  /** Taxa percentual de conformidade real observada (0 a 100%) */
  complianceRate: number;
  /** Total de itens concluídos analisados na amostra */
  sampleSize: number;
  /** Data mais recente considerada no cálculo */
  calculatedAt: string;
}

/**
 * Item agregado de agrupamento de impedimentos (Blocker Clustering)
 */
export interface BlockerClusterItem {
  /** Causa raiz ou motivo textual normalizado do bloqueio */
  reason: string;
  /** Quantidade de tarefas que sofreram este impedimento */
  occurrenceCount: number;
  /** Percentual do total de ocorrências registradas */
  percentage: number;
  /** Duração total acumulada em bloqueio (milissegundos) */
  totalDurationMs: number;
  /** Duração média retida em dias por ocorrência */
  avgDurationDays: number;
}

/**
 * Sumário da Dinâmica de Bloqueios e Impacto Temporal no Quadro
 */
export interface BlockerDynamicsSummary {
  /** Total de tarefas que já foram ou estão bloqueadas */
  totalBlockedTasks: number;
  /** Duração total acumulada em bloqueio no quadro (ms) */
  accumulatedBlockedMs: number;
  /** Percentual de impacto do bloqueio no Lead Time total das tarefas */
  impactOnLeadTimePercentage: number;
  /** Lista ordenada de clusters por frequência e impacto decrescente */
  clusters: BlockerClusterItem[];
}

/**
 * Janela temporal predefinida para amostragem do conjunto de dados
 */
export type DatasetTimeWindow = 14 | 30 | 90 | 180 | 'all' | 'custom';

/**
 * Configuração ativa do conjunto de dados (Dataset Configuration Drawer)
 */
export interface DatasetFilterConfig {
  /** Janela temporal de amostragem */
  timeWindow: DatasetTimeWindow;
  /** Data inicial ISO para intervalo customizado */
  customStartDate?: string;
  /** Data final ISO para intervalo customizado */
  customEndDate?: string;
  /** Filtro opcional por tipo de item ('card' | 'subtask' | 'initiative') */
  selectedTypes?: string[];
  /** Identificador de visualização salva ativa (opcional) */
  savedViewId?: string;
}
