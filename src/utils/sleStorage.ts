/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE
 * Armazenamento e persistência Local-First das preferências de SLE por quadro Kanban.
 */

import { DEFAULT_SLE_CONFIG, SleConfig } from '../types/sle';

export const getSleStorageKey = (boardId: string): string => `metrik_sle_config_${boardId}`;

/**
 * Cria a configuração padrão de SLE ancorada ao boardId.
 */
export function getDefaultSleConfig(boardId: string): SleConfig {
  return {
    ...DEFAULT_SLE_CONFIG,
    boardId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Carrega a configuração de SLE do quadro no localStorage com validação defensiva de esquema.
 */
export function loadSleConfig(boardId: string): SleConfig {
  const fallback = getDefaultSleConfig(boardId);
  if (!boardId || typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(getSleStorageKey(boardId));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    // Validação defensiva de esquema
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed.customTargetDays !== null && typeof parsed.customTargetDays !== 'number') ||
      (typeof parsed.customTargetDays === 'number' && parsed.customTargetDays <= 0)
    ) {
      console.warn(`[Metrik][SLE] Configuração de SLE inválida para o quadro ${boardId}.`);
      return fallback;
    }

    return {
      boardId,
      customTargetDays: parsed.customTargetDays ?? null,
      enableP50Alert: typeof parsed.enableP50Alert === 'boolean' ? parsed.enableP50Alert : true,
      enableP95Alert: typeof parsed.enableP95Alert === 'boolean' ? parsed.enableP95Alert : true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : fallback.updatedAt,
    };
  } catch (error) {
    console.warn(
      `[Metrik][SLE] Falha ao analisar configuração de SLE do quadro ${boardId}:`,
      error,
    );
    return fallback;
  }
}

/**
 * Persiste a configuração de SLE do quadro no localStorage.
 */
export function saveSleConfig(config: SleConfig): void {
  if (!config?.boardId || typeof window === 'undefined') return;

  try {
    const updated: SleConfig = {
      ...config,
      updatedAt: config.updatedAt || new Date().toISOString(),
    };
    localStorage.setItem(getSleStorageKey(config.boardId), JSON.stringify(updated));
  } catch (error) {
    console.error(
      `[Metrik][SLE] Erro ao persistir configuração de SLE do quadro ${config.boardId}:`,
      error,
    );
  }
}

/**
 * Remove a configuração de SLE salva para o quadro, restaurando os padrões.
 */
export function resetSleConfig(boardId: string): void {
  if (!boardId || typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getSleStorageKey(boardId));
  } catch (error) {
    console.error(`[Metrik][SLE] Erro ao remover configuração de SLE do quadro ${boardId}:`, error);
  }
}
