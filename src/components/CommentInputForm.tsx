import React, { useState } from 'react';

export interface CommentInputFormProps {
  onSubmitComment: (text: string) => void;
  disabled?: boolean;
}

const SendIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const CommentInputForm: React.FC<CommentInputFormProps> = ({
  onSubmitComment,
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || disabled) return;

    onSubmitComment(cleanText);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = text.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-slate-700/60 bg-slate-900/50 p-3 shadow-inner">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Visualização apenas (perfil Convidado)' : 'Escreva um comentário... (Ctrl+Enter para enviar)'}
        rows={3}
        data-testid="comment-input-textarea"
        className="w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
        style={{ whiteSpace: 'pre-wrap' }}
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Preserva quebras de linha (Ctrl+Enter envia)</span>
        <button
          type="submit"
          disabled={!isValid || disabled}
          data-testid="comment-submit-button"
          className="inline-flex items-center gap-1.5 rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
        >
          <SendIcon />
          Comentar
        </button>
      </div>
    </form>
  );
};
