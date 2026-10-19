/**
 * Serviço unificado de orquestração da Mika AI Copilot (Feature 048)
 * Implementa a camada de aplicação / fachada conectando cache, motor heurístico e cliente Gemini.
 * Atende às especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-006, FR-007, FR-009)
 */

import { ColumnModel, TaskModel } from '../../types/kanban';
import { MikaDecomposition, MikaInsight, MikaPreferences } from '../../types/mika';
import { mikaCacheManager } from './mikaCacheManager';
import { mikaHeuristicEngine } from './mikaHeuristicEngine';
import { mikaGeminiClient } from './mikaGeminiClient';
import { deobfuscateApiKey } from '../../utils/mikaSecurity';

const PREFERENCES_STORAGE_KEY = 'metrik_mika_preferences';

const DEFAULT_PREFERENCES: MikaPreferences = {
  enabled: true,
  provider: 'heuristic-offline',
  apiKeyObfuscated: '',
  autoDiagnoseOnLoad: true,
  tone: 'consultative',
};

export class MikaService {
  /**
   * Obtém as preferências da Mika persistidas localmente.
   */
  public getPreferences(): MikaPreferences {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // Ignora erro de JSON e usa defaults
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Salva as preferências atualizadas no localStorage.
   */
  public savePreferences(updates: Partial<MikaPreferences>): MikaPreferences {
    const current = this.getPreferences();
    const next = { ...current, ...updates };
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignora erro de cota
    }
    return next;
  }

  /**
   * Remove a chave de API e reverte para o modo heurístico offline seguro em 1 clique.
   */
  public clearApiKey(): MikaPreferences {
    return this.savePreferences({
      apiKeyObfuscated: '',
      provider: 'heuristic-offline',
    });
  }

  /**
   * Obtém diagnósticos analíticos do quadro com cache reativo e fallback automático.
   */
  public async getBoardInsights(
    boardId: string,
    columns: ColumnModel[],
    tasks: TaskModel[],
    forceRefresh: boolean = false,
  ): Promise<MikaInsight[]> {
    if (!boardId) return [];

    // 1. Checa cache reativo por checksum se não for forçado
    if (!forceRefresh) {
      const cached = mikaCacheManager.get(boardId, tasks);
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const prefs = this.getPreferences();

    // 2. Se o usuário configurou Gemini e possui chave, tenta chamar a API remota
    if (prefs.provider === 'gemini' && prefs.apiKeyObfuscated) {
      const realKey = deobfuscateApiKey(prefs.apiKeyObfuscated);
      if (realKey) {
        try {
          const contextPrompt = this.buildContextPrompt(columns, tasks);
          const insights = await mikaGeminiClient.generateInsights(realKey, contextPrompt);
          if (insights && insights.length > 0) {
            mikaCacheManager.set(boardId, tasks, insights);
            return insights;
          }
        } catch (err) {
          // Fallback silencioso e transparente para o motor heurístico
          console.warn(
            '[MikaService] Fallback para motor heurístico local após falha no Gemini:',
            err,
          );
        }
      }
    }

    // 3. Execução determinística local via MikaHeuristicEngine
    const fallbackInsights = mikaHeuristicEngine.generateBoardInsights(columns, tasks);
    mikaCacheManager.set(boardId, tasks, fallbackInsights);
    return fallbackInsights;
  }

  /**
   * Decompõe uma tarefa em subtarefas atômicas e critérios de aceite.
   */
  public async decomposeTask(task: TaskModel): Promise<MikaDecomposition> {
    const prefs = this.getPreferences();

    if (prefs.provider === 'gemini' && prefs.apiKeyObfuscated) {
      const realKey = deobfuscateApiKey(prefs.apiKeyObfuscated);
      if (realKey) {
        try {
          return await mikaGeminiClient.decomposeTask(realKey, task);
        } catch (err) {
          console.warn('[MikaService] Fallback para decomposição local após falha no Gemini:', err);
        }
      }
    }

    return mikaHeuristicEngine.decomposeTask(task);
  }

  /**
   * Monta o resumo estatístico textual injetado no prompt do Gemini para evitar alucinações.
   */
  private buildContextPrompt(columns: ColumnModel[], tasks: TaskModel[]): string {
    const colSummary = columns
      .map((c) => {
        const count = tasks.filter((t) => t.column === c.id).length;
        return `- ${c.title} (Categoria: ${c.category}, WIP Limit: ${c.wipLimit ?? 'Nenhum'}, Tarefas: ${count})`;
      })
      .join('\n');

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => !!t.completedAt).length;

    return `Total de Tarefas: ${totalTasks}\nConcluídas: ${doneTasks}\nColunas do Quadro:\n${colSummary}`;
  }
}

export const mikaService = new MikaService();
