import React from 'react';

export interface TaskModalCloseGuardProps {
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
  onContinueEditing: () => void;
}

export const TaskModalCloseGuard: React.FC<TaskModalCloseGuardProps> = ({
  onSaveAndClose,
  onDiscardAndClose,
  onContinueEditing,
}) => {
  return (
    <div
      className="td-close-guard-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="guard-title"
    >
      <div className="td-close-guard-dialog">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <h3
            id="guard-title"
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Existem alterações não salvas
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Você possui modificações pendentes nesta tarefa. Deseja salvar antes de fechar?
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn btn-primary" onClick={onSaveAndClose}>
            Salvar e Fechar
          </button>
          <button type="button" className="btn btn-danger" onClick={onDiscardAndClose}>
            Descartar
          </button>
          <button type="button" className="btn btn-secondary" onClick={onContinueEditing}>
            Continuar Editando
          </button>
        </div>
      </div>
    </div>
  );
};
