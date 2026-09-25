import React, { useState } from 'react';
import './TaskActivityFeed.css';

export interface CommentInputFormProps {
  onSubmitComment: (text: string, isDecision?: boolean) => void;
  disabled?: boolean;
}

const SendIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const AwardIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const CommentInputForm: React.FC<CommentInputFormProps> = ({
  onSubmitComment,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [isDecision, setIsDecision] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || disabled) return;

    onSubmitComment(cleanText, isDecision);
    setText('');
    setIsDecision(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (disabled) return;
    setText((prev) => `${prev}${prefix}texto${suffix}`);
  };

  const isValid = text.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="mrf-composer">
      {/* Format toolbar */}
      <div className="mrf-composer__toolbar">
        <div className="mrf-composer__tools">
          <button
            type="button"
            onClick={() => insertFormatting('**')}
            disabled={disabled}
            title="Negrito (**negrito**)"
            className="mrf-composer__fmt-btn"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*')}
            disabled={disabled}
            title="Itálico (*itálico*)"
            className="mrf-composer__fmt-btn"
            style={{ fontStyle: 'italic' }}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            disabled={disabled}
            title="Lista (- item)"
            className="mrf-composer__fmt-btn"
          >
            • Lista
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`')}
            disabled={disabled}
            title="Código (`código`)"
            className="mrf-composer__fmt-btn font-mono"
          >
            &lt;/&gt;
          </button>
        </div>

        {/* Toggle Decision */}
        <label className="mrf-composer__decision">
          <input
            type="checkbox"
            checked={isDecision}
            onChange={(e) => setIsDecision(e.target.checked)}
            disabled={disabled}
            data-testid="comment-is-decision-checkbox"
          />
          <AwardIcon />
          <span>Decisão de Projeto</span>
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Visualização apenas (perfil Convidado)' : 'Escreva um comentário... (Markdown suportado • Ctrl+Enter para enviar)'}
        rows={3}
        data-testid="comment-input-textarea"
        className="mrf-composer__textarea"
      />

      <div className="mrf-composer__footer">
        <span className="mrf-composer__hint">
          Suporta Markdown simples (**negrito**, *itálico*, `código`, - listas)
        </span>
        <button
          type="submit"
          disabled={!isValid || disabled}
          data-testid="comment-submit-button"
          className={`mrf-composer__submit ${isDecision ? 'mrf-composer__submit--decision' : ''}`}
        >
          <SendIcon />
          {isDecision ? 'Registrar Decisão' : 'Comentar'}
        </button>
      </div>
    </form>
  );
};
