import React, { useState } from 'react';

export interface TaskActivityCommentFormProps {
  taskId: string;
  onSubmitComment: (commentText: string) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

const SendIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const TaskActivityCommentForm: React.FC<TaskActivityCommentFormProps> = ({
  taskId: _taskId,
  onSubmitComment,
  onDirtyStateChange,
}) => {
  const [commentText, setCommentText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);
    if (onDirtyStateChange) {
      onDirtyStateChange(val.trim().length > 0);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    onSubmitComment(trimmed);
    setCommentText('');
    if (onDirtyStateChange) {
      onDirtyStateChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = commentText.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700/60 bg-slate-900/80">
      <div className="border border-slate-700/80 bg-slate-950/60 rounded-xl p-2.5 focus-within:border-indigo-500/80 transition-colors shadow-inner flex flex-col gap-2">
        <textarea
          rows={2}
          placeholder="Escreva um comentário..."
          value={commentText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-500 font-mono">Pressione Ctrl+Enter para enviar</span>
          <button
            type="submit"
            disabled={!isValid}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isValid
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Enviar</span>
            <SendIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
};
