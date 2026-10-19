/**
 * Gerenciador de cache reativo para a Mika AI Flow Copilot (Feature 048)
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-009)
 * Invalidação automática por checksum de tarefas do quadro ativo.
 */

import { MikaCacheEntry, MikaInsight } from '../../types/mika';
import { TaskModel } from '../../types/kanban';

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutos por default
const STORAGE_PREFIX = 'metrik_mika_cache_';

export class MikaCacheManager {
  private memoryCache: Map<string, MikaCacheEntry> = new Map();

  /**
   * Calcula um checksum determinístico e rápido para o conjunto de tarefas de um quadro.
   * Considera: IDs, colunas atuais, datas de atualização/movimentação e contagem.
   */
  public computeBoardChecksum(boardId: string, tasks: TaskModel[]): string {
    if (!boardId) return 'empty_board';
    if (!tasks || tasks.length === 0) return `${boardId}_empty_0`;

    // Ordenação estável por ID para garantir determinismo independente da ordem de renderização
    const sorted = [...tasks].sort((a, b) => a.id.localeCompare(b.id));

    let hash = 0;
    const tokens: string[] = [];

    for (const t of sorted) {
      const token = `${t.id}:${t.column}:${t.updatedAt || t.createdAt || ''}:${t.lastMovedAt || ''}`;
      tokens.push(token);
    }

    const joined = `${boardId}:${tokens.join('|')}`;
    for (let i = 0; i < joined.length; i++) {
      hash = (hash << 5) - hash + joined.charCodeAt(i);
      hash |= 0; // Converte para inteiro de 32 bits
    }

    return `${boardId}_${tasks.length}_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Obtém os insights cacheados se o checksum for idêntico e o TTL válido.
   */
  public get(boardId: string, tasks: TaskModel[]): MikaInsight[] | null {
    if (!boardId) return null;
    const currentKey = this.computeBoardChecksum(boardId, tasks);

    // 1. Tenta recuperar da memória
    const inMem = this.memoryCache.get(currentKey);
    if (inMem && Date.now() - inMem.generatedAt < CACHE_TTL_MS) {
      return inMem.insights;
    }

    // 2. Tenta recuperar do localStorage
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${boardId}`);
      if (stored) {
        const parsed: MikaCacheEntry = JSON.parse(stored);
        if (parsed.cacheKey === currentKey && Date.now() - parsed.generatedAt < CACHE_TTL_MS) {
          // Atualiza memória
          this.memoryCache.set(currentKey, parsed);
          return parsed.insights;
        }
      }
    } catch {
      // Ignora erro de storage
    }

    return null;
  }

  /**
   * Armazena os insights no cache em memória e no localStorage.
   */
  public set(boardId: string, tasks: TaskModel[], insights: MikaInsight[]): void {
    if (!boardId || !insights) return;
    const currentKey = this.computeBoardChecksum(boardId, tasks);
    const entry: MikaCacheEntry = {
      cacheKey: currentKey,
      insights,
      generatedAt: Date.now(),
    };

    this.memoryCache.set(currentKey, entry);

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${boardId}`, JSON.stringify(entry));
    } catch {
      // Ignora erro se storage exceder cota
    }
  }

  /**
   * Invalida explicitamente o cache de um quadro ou de todos.
   */
  public invalidate(boardId?: string): void {
    if (boardId) {
      // Limpa chaves do Map que começam com o boardId
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(boardId)) {
          this.memoryCache.delete(key);
        }
      }
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${boardId}`);
      } catch {
        // Ignora
      }
    } else {
      this.memoryCache.clear();
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignora
      }
    }
  }
}

export const mikaCacheManager = new MikaCacheManager();
