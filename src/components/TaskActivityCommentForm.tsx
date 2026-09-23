import React, { useState } from 'react';

export interface TaskActivityCommentFormProps {
  taskId: string;
  onSubmitComment: (commentText: string) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

const SendIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <form onSubmit={handleSubmit} className="task-activity-comment-form-container">
      <div className="task-activity-comment-box">
        <textarea
          rows={2}
          placeholder="Escreva um comentário..."
          value={commentText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="task-activity-comment-textarea"
        />

        <div className="task-activity-comment-footer">
          <span className="task-activity-comment-hint">Ctrl+Enter para enviar</span>
          <button
            type="submit"
            disabled={!isValid}
            className="task-activity-submit-btn"
          >
            <span>Enviar</span>
            <SendIcon />
          </button>
        </div>
      </div>
    </form>
  );
};
