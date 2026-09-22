import React, { useState } from 'react';

export interface CommentInputFormProps {
  onSubmitComment: (text: string, isDecision?: boolean) => void;
  disabled?: boolean;
}

const SendIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const AwardIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 rounded-xl border border-slate-700/60 bg-slate-900/50 p-3.5 shadow-inner">
      {/* Format toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**')}
            disabled={disabled}
            title="Negrito (**negrito**)"
            className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*')}
            disabled={disabled}
            title="Itálico (*itálico*)"
            className="rounded px-2 py-1 text-xs italic text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            disabled={disabled}
            title="Lista (- item)"
            className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            • Lista
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`')}
            disabled={disabled}
            title="Código (`código`)"
            className="rounded font-mono px-2 py-1 text-xs text-cyan-300 hover:bg-slate-800 hover:text-cyan-200 disabled:opacity-50"
          >
            &lt;/&gt;
          </button>
        </div>

        {/* Toggle Decision */}
        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-300 hover:text-amber-300 select-none">
          <input
            type="checkbox"
            checked={isDecision}
            onChange={(e) => setIsDecision(e.target.checked)}
            disabled={disabled}
            data-testid="comment-is-decision-checkbox"
            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 disabled:opacity-50"
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
        placeholder={disabled ? 'Visualização apenas (perfil Convidado)' : 'Escreva um comentário com Markdown... (Ctrl+Enter para enviar)'}
        rows={3}
        data-testid="comment-input-textarea"
        className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
        style={{ whiteSpace: 'pre-wrap' }}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="hidden sm:inline">Suporta Markdown simples (**negrito**, *itálico*, `código`, - listas)</span>
        <button
          type="submit"
          disabled={!isValid || disabled}
          data-testid="comment-submit-button"
          className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 ${
            isDecision
              ? 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-400'
              : 'bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-400'
          }`}
        >
          <SendIcon />
          {isDecision ? 'Registrar Decisão' : 'Comentar'}
        </button>
      </div>
    </form>
  );
};
