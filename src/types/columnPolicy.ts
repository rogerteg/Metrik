/**
 * Metrik — Tipos de Políticas Explícitas de Coluna (Definition of Ready / Done)
 * Specification: specs/053-flow-automation-policies/spec.md
 */

export interface ColumnPolicy {
  /** Identificador da coluna correspondente */
  columnId: string;
  /** Critérios de entrada acordados (Definition of Ready) */
  entryCriteria: string;
  /** Critérios de saída acordados (Definition of Done) */
  exitCriteria: string;
  /** ISO 8601 da última alteração */
  updatedAt: string;
}

export type ColumnPoliciesMap = Record<string, ColumnPolicy>;
