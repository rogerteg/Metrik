/**
 * MikaMessageContent.tsx - Renderizador de conteúdo de mensagem com links interativos de tarefas (Feature 052)
 * Detecta referências no formato #ID e as renderiza como chips interativos (FR-013).
 */

import React from 'react';
import { MikaForecastActionPayload } from '../../types/mika';

export interface MikaMessageContentProps {
  content: string;
  onOpenTaskDetails?: (taskId: string) => void;
  availableTaskIds?: string[] | Set<string>;
  action?: MikaForecastActionPayload;
  onNavigateToForecast?: (
    scopeType: 'initiative' | 'sprint' | 'all' | 'tag',
    scopeId?: string,
  ) => void;
}

export const MikaMessageContent: React.FC<MikaMessageContentProps> = ({
  content,
  onOpenTaskDetails,
  availableTaskIds,
  action,
  onNavigateToForecast,
}) => {
  const taskSet = React.useMemo(() => {
    if (!availableTaskIds) return null;
    return availableTaskIds instanceof Set ? availableTaskIds : new Set(availableTaskIds);
  }, [availableTaskIds]);

  // Função para processar texto linha a linha e identificar markdown simples + chips de tarefas
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Se linha vazia
      if (!line.trim()) {
        return <div key={`empty-${lineIdx}`} className="mika-msg-spacing" />;
      }

      // Processa marcadores de negrito e chips de tarefa na linha
      const renderedLine = parseLineFragments(line, onOpenTaskDetails, taskSet);

      if (line.trim().startsWith('- ')) {
        return (
          <div key={`li-${lineIdx}`} className="mika-msg-list-item">
            <span className="mika-msg-bullet">•</span>
            <div className="mika-msg-list-body">{renderedLine}</div>
          </div>
        );
      }

      return (
        <p key={`p-${lineIdx}`} className="mika-msg-paragraph">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className="mika-message-content-wrapper">
      {renderFormattedText(content)}
      {action && action.type === 'NAVIGATE_TO_FORECAST' && onNavigateToForecast && (
        <div className="mika-action-cta-container" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="mika-forecast-action-btn"
            onClick={() => onNavigateToForecast(action.scopeType, action.scopeId)}
            title={action.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.5rem',
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.25) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Fragmenta a linha identificando negrito (**texto**) e referências a tarefas (#ID)
 */
function parseLineFragments(
  line: string,
  onOpenTaskDetails?: (taskId: string) => void,
  taskSet?: Set<string> | null,
): React.ReactNode[] {
  // Regex que captura tokens de negrito (**...**) ou tokens de tarefas (#ID)
  // Exemplo: "#42" ou "#task-123" ou "**texto**"
  const tokenRegex = /(\*\*[^*]+\*\*|#[\w-]+)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Negrito: **conteúdo**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={`bold-${idx}`} className="mika-msg-bold">
          {parseTaskReferencesOnly(boldText, onOpenTaskDetails, taskSet)}
        </strong>
      );
    }

    // Chip de tarefa: #ID
    if (part.startsWith('#') && part.length > 1) {
      const taskId = part.substring(1);
      const isKnownTask = taskSet ? taskSet.has(taskId) : true;

      if (isKnownTask && onOpenTaskDetails) {
        return (
          <button
            key={`chip-${idx}`}
            type="button"
            className="mika-task-chip"
            onClick={() => onOpenTaskDetails(taskId)}
            title={`Abrir detalhes da tarefa #${taskId}`}
            aria-label={`Ver detalhes da tarefa número ${taskId}`}
          >
            <span className="mika-task-chip-hash">#</span>
            <span className="mika-task-chip-id">{taskId}</span>
          </button>
        );
      }

      return (
        <span key={`text-id-${idx}`} className="mika-task-chip mika-task-chip-static">
          #{taskId}
        </span>
      );
    }

    return <span key={`txt-${idx}`}>{part}</span>;
  });
}

/**
 * Processa apenas menções a tarefas dentro de blocos de negrito
 */
function parseTaskReferencesOnly(
  text: string,
  onOpenTaskDetails?: (taskId: string) => void,
  taskSet?: Set<string> | null,
): React.ReactNode {
  const parts = text.split(/(#[\w-]+)/g);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (part.startsWith('#') && part.length > 1) {
      const taskId = part.substring(1);
      const isKnownTask = taskSet ? taskSet.has(taskId) : true;

      if (isKnownTask && onOpenTaskDetails) {
        return (
          <button
            key={`nested-chip-${idx}`}
            type="button"
            className="mika-task-chip"
            onClick={() => onOpenTaskDetails(taskId)}
            title={`Abrir detalhes da tarefa #${taskId}`}
          >
            #{taskId}
          </button>
        );
      }
    }
    return part;
  });
}
