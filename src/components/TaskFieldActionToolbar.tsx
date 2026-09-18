import React from 'react';
import { FieldEditStatus } from '../types/taskEdit';
import './TaskFieldActionToolbar.css';

export interface TaskFieldActionToolbarProps {
  /** Estado de ciclo de vida do campo */
  status: FieldEditStatus;
  /** Se o conteúdo atual difere do conteúdo original */
  isDirty: boolean;
  /** Callback acionado ao clicar no botão "Salvar" */
  onSave: () => void;
  /** Callback acionado ao clicar no botão "Descartar" */
  onDiscard: () => void;
  /** Se o componente deve renderizar em modo somente leitura (perfil guest) */
  isReadOnly?: boolean;
  /** Prefixo descritivo para leitores de tela e ARIA (ex.: "da descrição") */
  ariaLabelPrefix?: string;
  /** Estilo de layout compacto para exibição dentro do cartão do quadro */
  compact?: boolean;
}

export const TaskFieldActionToolbar: React.FC<TaskFieldActionToolbarProps> = ({
  status,
  isDirty,
  onSave,
  onDiscard,
  isReadOnly = false,
  ariaLabelPrefix = '',
  compact = false,
}) => {
  // Se não há alterações e o status é inativo, a barra fica recolhida para manter a limpeza visual
  if (status === 'idle' && !isDirty) {
    return null;
  }

  const labelSuffix = ariaLabelPrefix ? ` ${ariaLabelPrefix}` : '';
  const isSaving = status === 'saving';

  return (
    <div
      className={`task-field-action-toolbar ${compact ? 'toolbar-compact' : ''}`}
      role="toolbar"
      aria-label={`Ações de edição${labelSuffix}`}
    >
      <div className="task-field-status-area" aria-live="polite">
        {status === 'dirty' && (
          <span className="task-field-status status-dirty">
            <span className="status-dot dot-dirty" aria-hidden="true" />
            Alterações não salvas
          </span>
        )}
        {status === 'saving' && (
          <span className="task-field-status status-saving">
            <span className="status-spinner" aria-hidden="true" />
            Salvando...
          </span>
        )}
        {status === 'saved' && (
          <span className="task-field-status status-saved">
            ✓ Salvo
          </span>
        )}
      </div>

      {!isReadOnly && (
        <div className="task-field-buttons-area">
          <button
            type="button"
            className="btn-field-action btn-action-discard"
            onClick={onDiscard}
            disabled={isSaving}
            title="Descartar alterações (Esc)"
            aria-label={`Descartar alterações${labelSuffix}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="btn-action-text">Descartar</span>
            <kbd className="action-kbd-hint" aria-hidden="true">Esc</kbd>
          </button>

          <button
            type="button"
            className="btn-field-action btn-action-save"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            title="Salvar alterações (Ctrl+S / Cmd+S)"
            aria-label={`Salvar alterações${labelSuffix}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="btn-action-text">Salvar</span>
            <kbd className="action-kbd-hint" aria-hidden="true">Ctrl+S</kbd>
          </button>
        </div>
      )}
    </div>
  );
};
