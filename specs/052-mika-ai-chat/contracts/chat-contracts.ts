/**
 * Contratos de Interface e Tipos: Mika Conversational AI Chat Copilot (Feature 052)
 * specs/052-mika-ai-chat/contracts/chat-contracts.ts
 */

import {
  MikaChatMessage,
  MikaChatSession,
  MikaBoardTelemetryContext,
  MikaQuickPrompt,
} from '../../src/types/mika';

/**
 * Contrato do Motor Analítico Heurístico Local para Chat
 */
export interface IMikaChatHeuristicEngine {
  /**
   * Processa uma pergunta em linguagem natural usando palavras-chave e telemetria do quadro
   */
  processQuery(
    query: string,
    context: MikaBoardTelemetryContext
  ): {
    content: string;
    referencedTaskIds: string[];
    category: string;
  };
}

/**
 * Contrato do Construtor de Telemetria Dinâmica do Quadro
 */
export interface IMikaContextBuilder {
  /**
   * Extrai e formata o snapshot de telemetria do quadro ativo
   */
  buildTelemetryContext(
    board: any,
    tasks: any[],
    columns: any[]
  ): MikaBoardTelemetryContext;

  /**
   * Monta o System Prompt para a API Google Gemini contendo as regras e a telemetria
   */
  buildSystemPrompt(context: MikaBoardTelemetryContext): string;
}

/**
 * Contrato do Gerenciador de Histórico de Conversas (Local-First)
 */
export interface IMikaChatStorageManager {
  /**
   * Carrega a sessão de chat vinculada ao quadro ativo
   */
  loadSession(boardId: string): MikaChatSession;

  /**
   * Salva uma nova mensagem no histórico respeitando a janela deslizante de 30 itens
   */
  appendMessage(boardId: string, message: MikaChatMessage): MikaChatSession;

  /**
   * Limpa o histórico de conversa do quadro especificado
   */
  clearSession(boardId: string): void;
}

/**
 * Contrato de Props para o componente MikaChatInterface
 */
export interface MikaChatInterfaceProps {
  boardId: string;
  boardTitle: string;
  telemetryContext: MikaBoardTelemetryContext;
  onOpenTaskDetails?: (taskId: string) => void;
  providerName: string;
  isOnline: boolean;
}

/**
 * Contrato de Props estendido para o MikaDrawer com navegação por abas
 */
export interface MikaDrawerExtendedProps {
  isOpen: boolean;
  onClose: () => void;
  insights: any[];
  onRefresh?: () => void;
  isLoading?: boolean;
  providerName?: string;
  boardId: string;
  boardTitle: string;
  telemetryContext: MikaBoardTelemetryContext;
  onOpenTaskDetails?: (taskId: string) => void;
  activeTab?: 'chat' | 'insights';
  onTabChange?: (tab: 'chat' | 'insights') => void;
}
