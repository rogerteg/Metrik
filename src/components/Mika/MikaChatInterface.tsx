/**
 * MikaChatInterface.tsx - Componente de chat conversacional da Mika AI (Feature 052)
 * Suporte a diálogo interativo, chips de perguntas rápidas, indicador de digitação,
 * links clicáveis de tarefas, cópia de resposta e fallback offline Local-First.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MikaChatMessage,
  MikaQuickPrompt,
  MikaBoardTelemetryContext,
} from '../../types/mika';
import { TaskModel } from '../../types/kanban';
import {
  loadChatSession,
  appendChatMessage,
  clearChatSession,
} from '../../services/ai/mikaChatStorageManager';
import { buildMikaSystemPrompt } from '../../services/ai/mikaContextBuilder';
import { processMikaHeuristicChat } from '../../services/ai/mikaChatHeuristicEngine';
import { mikaGeminiClient } from '../../services/ai/mikaGeminiClient';
import { MikaMessageContent } from './MikaMessageContent';
import './MikaChatInterface.css';

export interface MikaChatInterfaceProps {
  boardId: string;
  boardTitle: string;
  telemetryContext: MikaBoardTelemetryContext;
  onOpenTaskDetails?: (taskId: string) => void;
  providerName?: string;
  apiKey?: string;
  availableTasks?: TaskModel[];
}

export const QUICK_PROMPTS: MikaQuickPrompt[] = [
  {
    id: 'qp-bottleneck',
    label: '🚨 Onde está o gargalo?',
    query: 'Onde está o principal gargalo do fluxo?',
    category: 'bottleneck',
  },
  {
    id: 'qp-blocked',
    label: '🛑 Cartões bloqueados',
    query: 'Quais tarefas estão bloqueadas?',
    category: 'blocked',
  },
  {
    id: 'qp-sle',
    label: '🎯 SLE de 85%',
    query: 'Qual é o nosso SLE de 85%?',
    category: 'sle',
  },
  {
    id: 'qp-throughput',
    label: '📈 Previsão de entrega',
    query: 'Qual é a nossa previsão de entrega e ritmo?',
    category: 'throughput',
  },
];

export const MikaChatInterface: React.FC<MikaChatInterfaceProps> = ({
  boardId,
  boardTitle,
  telemetryContext,
  onOpenTaskDetails,
  providerName = 'Local-First (Offline)',
  apiKey,
  availableTasks = [],
}) => {
  const [messages, setMessages] = useState<MikaChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mapeia IDs de tarefas disponíveis para verificação de links clicáveis
  const availableTaskIds = React.useMemo(() => {
    return new Set(availableTasks.map((t) => t.id));
  }, [availableTasks]);

  // Carrega histórico persistido ao montar ou alternar de quadro
  useEffect(() => {
    if (boardId) {
      const session = loadChatSession(boardId);
      setMessages(session.messages);
    }
  }, [boardId]);

  // Rola suavemente para o final ao receber novas mensagens ou digitar
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // Envio de mensagem (usuário ou chip rápido)
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputText;
    const trimmed = rawText.trim();
    if (!trimmed || isGenerating) return;

    const userMessage: MikaChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      provider: apiKey ? 'gemini' : 'heuristic',
    };

    // Atualiza estado local e storage
    setMessages((prev) => [...prev, userMessage]);
    appendChatMessage(boardId, userMessage);
    setInputText('');
    setIsGenerating(true);

    try {
      let assistantText = '';
      let assistantProvider: 'gemini' | 'heuristic' = 'heuristic';
      let referencedTaskIds: string[] = [];

      const hasGeminiKey = Boolean(apiKey && apiKey.trim());

      if (hasGeminiKey) {
        try {
          const systemPrompt = buildMikaSystemPrompt(telemetryContext);
          assistantText = await mikaGeminiClient.sendMessage(
            apiKey!,
            systemPrompt,
            messages,
            trimmed
          );
          assistantProvider = 'gemini';
        } catch (apiError) {
          console.warn('[Metrik Mika Chat] Falha na chamada da API Gemini, executando fallback local:', apiError);
          // Fallback gracioso para a heurística local
          const localResult = processMikaHeuristicChat(trimmed, telemetryContext);
          assistantText = `⚠️ *(Resposta gerada via Local-First por indisponibilidade momentânea da rede)*\n\n${localResult.content}`;
          assistantProvider = 'heuristic';
          referencedTaskIds = localResult.referencedTaskIds;
        }
      } else {
        // Modo 100% Local-First Offline
        const localResult = processMikaHeuristicChat(trimmed, telemetryContext);
        assistantText = localResult.content;
        assistantProvider = 'heuristic';
        referencedTaskIds = localResult.referencedTaskIds;
      }

      const assistantMessage: MikaChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toISOString(),
        provider: assistantProvider,
        referencedTaskIds,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      appendChatMessage(boardId, assistantMessage);
    } catch (err) {
      console.error('[Metrik Mika Chat] Erro ao processar mensagem:', err);
    } finally {
      setIsGenerating(false);
      textareaRef.current?.focus();
    }
  };

  // Tratamento do teclado no campo de entrada
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cópia rápida da resposta
  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (err) {
      console.warn('[Metrik Mika Chat] Falha ao copiar texto:', err);
    }
  };

  // Limpeza de histórico
  const handleConfirmClear = () => {
    clearChatSession(boardId);
    setMessages([]);
    setShowClearConfirm(false);
  };

  const isOffline = !apiKey || providerName.toLowerCase().includes('offline');

  return (
    <div className="mika-chat-container" data-testid="mika-chat-container">
      {/* Barra superior de status e ações */}
      <div className="mika-chat-topbar">
        <div className="mika-provider-status" title={`Inteligência ativa: ${providerName}`}>
          <span className={`mika-status-dot ${isOffline ? 'offline' : ''}`} />
          <span>{providerName}</span>
        </div>

        {messages.length > 0 && (
          <div>
            {!showClearConfirm ? (
              <button
                type="button"
                className="mika-clear-chat-btn"
                onClick={() => setShowClearConfirm(true)}
                title="Limpar histórico da conversa neste quadro"
                aria-label="Limpar histórico da conversa"
              >
                🗑️ Limpar Conversa
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ color: '#f87171', fontSize: '0.7rem' }}>Apagar tudo?</span>
                <button
                  type="button"
                  className="mika-clear-chat-btn"
                  onClick={handleConfirmClear}
                  style={{ color: '#f87171', fontWeight: 700 }}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className="mika-clear-chat-btn"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Não
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de Mensagens */}
      <div className="mika-chat-messages" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              background: 'var(--mika-gradient-subtle)',
              border: '1px solid var(--mika-card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              color: 'var(--color-text, #f8fafc)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>👋</span>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Olá! Sou a Mika, sua copiloto.</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)' }}>
                  Analiso em tempo real o fluxo do quadro <strong>{boardTitle}</strong>.
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: '#cbd5e1' }}>
              Pergunte qualquer coisa sobre gargalos de WIP, tempos de ciclo, tarefas travadas ou
              previsões estatísticas. Escolha um dos atalhos abaixo para começar:
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mika-message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="mika-message-bubble">
              {msg.role === 'user' ? (
                <span>{msg.content}</span>
              ) : (
                <MikaMessageContent
                  content={msg.content}
                  onOpenTaskDetails={onOpenTaskDetails}
                  availableTaskIds={availableTaskIds}
                />
              )}
            </div>

            <div className="mika-message-footer">
              <span className="mika-msg-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {msg.role === 'assistant' && (
                <button
                  type="button"
                  className={`mika-msg-copy-btn ${copiedMsgId === msg.id ? 'copied' : ''}`}
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  title="Copiar recomendação para a área de transferência"
                  aria-label="Copiar resposta para a área de transferência"
                >
                  {copiedMsgId === msg.id ? '✓ Copiado!' : '📋 Copiar'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="mika-message-row assistant">
            <div className="mika-typing-bubble" aria-label="Mika está formulando a resposta...">
              <span className="mika-typing-dot" />
              <span className="mika-typing-dot" />
              <span className="mika-typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chips de Perguntas Rápidas */}
      <div className="mika-quick-prompts-wrapper">
        <div className="mika-quick-prompts-title">Sugestões de Análise:</div>
        <div className="mika-quick-prompts-chips">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.id}
              type="button"
              className="mika-prompt-chip"
              disabled={isGenerating}
              onClick={() => handleSendMessage(qp.query)}
              title={qp.query}
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Entrada de Texto */}
      <div className="mika-chat-input-bar">
        <div className="mika-input-row">
          <textarea
            ref={textareaRef}
            className="mika-chat-textarea"
            rows={1}
            value={inputText}
            disabled={isGenerating}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre gargalos, SLE ou previsão... (Enter para enviar)"
            aria-label="Mensagem para a Mika AI"
          />

          <button
            type="button"
            className="mika-chat-send-btn"
            disabled={isGenerating || !inputText.trim()}
            onClick={() => handleSendMessage()}
            title="Enviar mensagem (Enter)"
            aria-label="Enviar pergunta para Mika"
          >
            ➔
          </button>
        </div>

        <div className="mika-input-hint">
          <span>Enter para enviar • Shift + Enter para quebrar linha</span>
        </div>
      </div>
    </div>
  );
};
