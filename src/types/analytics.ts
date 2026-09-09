/**
 * Tipos e interfaces analíticas para o Metrik (Feature 011)
 */

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
}

export interface CfdData {
  points: CfdDataPoint[];
  maxTotal: number;
  isEmpty: boolean;
}
