/**
 * mikaChatStorageManager.ts - Gerenciador de persistência local para o Chat da Mika (Feature 052)
 * Garante soberania Local-First (Princípio VIII) e controle estrito de janela FIFO (30 mensagens).
 */

import { MikaChatMessage, MikaChatSession } from '../../types/mika';

export const MAX_CHAT_HISTORY = 30;
export const CHAT_STORAGE_PREFIX = 'metrik_mika_chat_';
export const DRAWER_TAB_KEY = 'metrik_mika_drawer_tab';

export const getChatStorageKey = (boardId: string): string => {
  return `${CHAT_STORAGE_PREFIX}${boardId}`;
};

/**
 * Carrega o histórico de mensagens vinculado a um quadro específico
 */
export const loadChatSession = (boardId: string): MikaChatSession => {
  if (!boardId) {
    return {
      boardId: '',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const rawData = localStorage.getItem(getChatStorageKey(boardId));
    if (!rawData) {
      return {
        boardId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
    }

    const parsed: MikaChatSession = JSON.parse(rawData);
    if (!Array.isArray(parsed.messages)) {
      return {
        boardId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
    }

    // Garante que o histórico respeite o limite de 30 mensagens em caso de dados legados
    const messages = parsed.messages.slice(-MAX_CHAT_HISTORY);
    return {
      boardId,
      messages,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.warn(
      `[Metrik Mika Chat] Falha ao carregar histórico local para o quadro ${boardId}:`,
      err,
    );
    return {
      boardId,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Adiciona uma mensagem ao histórico e persiste em localStorage sob regime FIFO (máx 30)
 */
export const appendChatMessage = (boardId: string, message: MikaChatMessage): MikaChatSession => {
  if (!boardId) {
    return {
      boardId: '',
      messages: [message],
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const currentSession = loadChatSession(boardId);
    const updatedMessages = [...currentSession.messages, message].slice(-MAX_CHAT_HISTORY);

    const newSession: MikaChatSession = {
      boardId,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(getChatStorageKey(boardId), JSON.stringify(newSession));
    return newSession;
  } catch (err) {
    console.warn(
      `[Metrik Mika Chat] Falha ao salvar mensagem no storage local para o quadro ${boardId}:`,
      err,
    );
    return {
      boardId,
      messages: [message],
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Limpa o histórico de conversa do quadro especificado
 */
export const clearChatSession = (boardId: string): void => {
  if (!boardId) return;
  try {
    localStorage.removeItem(getChatStorageKey(boardId));
  } catch (err) {
    console.warn(`[Metrik Mika Chat] Falha ao limpar sessão do quadro ${boardId}:`, err);
  }
};

/**
 * Recupera a aba ativa da gaveta ('chat' ou 'insights')
 */
export const loadDrawerActiveTab = (): 'chat' | 'insights' => {
  try {
    const tab = localStorage.getItem(DRAWER_TAB_KEY);
    if (tab === 'insights' || tab === 'chat') {
      return tab;
    }
    return 'chat';
  } catch {
    return 'chat';
  }
};

/**
 * Salva a aba ativa da gaveta
 */
export const saveDrawerActiveTab = (tab: 'chat' | 'insights'): void => {
  try {
    localStorage.setItem(DRAWER_TAB_KEY, tab);
  } catch (err) {
    console.warn('[Metrik Mika Chat] Falha ao salvar aba ativa da gaveta:', err);
  }
};
