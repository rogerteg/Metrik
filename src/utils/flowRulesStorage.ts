/**
 * Metrik — Armazenamento Local-First de Regras de Fluxo e Políticas
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { FlowRule } from '../types/flowRules';
import { ColumnPoliciesMap } from '../types/columnPolicy';

export const getFlowRulesStorageKey = (boardId: string): string => `metrik_flow_rules_${boardId}`;

export const getColumnPoliciesStorageKey = (boardId: string): string =>
  `metrik_column_policies_${boardId}`;

/**
 * Carrega com resiliência defensiva as regras de fluxo de um quadro.
 */
export function loadFlowRules(boardId: string): FlowRule[] {
  if (!boardId || typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(getFlowRulesStorageKey(boardId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[Metrik][FlowRules] Conteúdo inválido para board ${boardId}, redefinindo.`);
      return [];
    }

    // Sanitiza e valida integridade mínima
    return parsed.filter((rule): rule is FlowRule =>
      Boolean(rule && typeof rule.id === 'string' && typeof rule.name === 'string' && rule.trigger),
    );
  } catch (error) {
    console.error(`[Metrik][FlowRules] Falha ao carregar regras do board ${boardId}:`, error);
    return [];
  }
}

/**
 * Salva as regras de fluxo do quadro no localStorage.
 */
export function saveFlowRules(boardId: string, rules: FlowRule[]): void {
  if (!boardId || typeof window === 'undefined') return;

  try {
    localStorage.setItem(getFlowRulesStorageKey(boardId), JSON.stringify(rules));
  } catch (error) {
    console.error(`[Metrik][FlowRules] Falha ao salvar regras do board ${boardId}:`, error);
  }
}

/**
 * Carrega o mapa de políticas de coluna de um quadro.
 */
export function loadColumnPolicies(boardId: string): ColumnPoliciesMap {
  if (!boardId || typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(getColumnPoliciesStorageKey(boardId));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return parsed as ColumnPoliciesMap;
  } catch (error) {
    console.error(
      `[Metrik][ColumnPolicies] Falha ao carregar políticas do board ${boardId}:`,
      error,
    );
    return {};
  }
}

/**
 * Salva o mapa de políticas de coluna no localStorage.
 */
export function saveColumnPolicies(boardId: string, policies: ColumnPoliciesMap): void {
  if (!boardId || typeof window === 'undefined') return;

  try {
    localStorage.setItem(getColumnPoliciesStorageKey(boardId), JSON.stringify(policies));
  } catch (error) {
    console.error(`[Metrik][ColumnPolicies] Falha ao salvar políticas do board ${boardId}:`, error);
  }
}

/**
 * Serializa regras em formato JSON exportável com metadados.
 */
export function exportFlowRulesAsJson(rules: FlowRule[]): string {
  const exportPayload = {
    metrikVersion: '1.0',
    exportedAt: new Date().toISOString(),
    ruleCount: rules.length,
    rules,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Importa regras a partir de uma string JSON, reatribuindo IDs e vinculando ao boardId de destino.
 */
export function importFlowRulesFromJson(jsonStr: string, targetBoardId: string): FlowRule[] {
  try {
    const parsed = JSON.parse(jsonStr);
    const candidateRules = Array.isArray(parsed) ? parsed : parsed.rules;

    if (!Array.isArray(candidateRules)) {
      throw new Error('Formato JSON não contém lista de regras válida.');
    }

    const now = new Date().toISOString();
    return candidateRules
      .filter((r) => r && typeof r.name === 'string' && r.trigger)
      .map((r, index) => ({
        ...r,
        id: `rule_imported_${Date.now()}_${index}`,
        boardId: targetBoardId,
        createdAt: now,
        updatedAt: now,
        executionCount: 0,
        lastTriggeredAt: null,
      }));
  } catch (error) {
    console.error('[Metrik][FlowRules] Erro ao importar regras JSON:', error);
    throw error;
  }
}
