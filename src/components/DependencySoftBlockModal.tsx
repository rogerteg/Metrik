import React from 'react';
import { CrossSquadTaskSummary } from '../types/taskTypes';
import { Modal } from './Modal';

export interface DependencySoftBlockModalProps {
  isOpen: boolean;
  taskTitle: string;
  blockingTasks: CrossSquadTaskSummary[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DependencySoftBlockModal: React.FC<DependencySoftBlockModalProps> = ({
  isOpen,
  taskTitle,
  blockingTasks,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Atenção: Dependência Pendente 🔒">
      <div className="soft-block-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '6px 0' }}>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          A tarefa <strong>"{taskTitle}"</strong> possui dependências que ainda não foram concluídas:
        </p>

        <div
          className="soft-block-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {blockingTasks.map((bt) => (
            <div
              key={bt.taskId}
              className="soft-block-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span aria-hidden="true">🔒</span>
                <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                  {bt.taskTitle}
                </span>
                {bt.teamName && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                    }}
                  >
                    🏢 {bt.teamName}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                {bt.columnTitle || 'Pendente'}
              </span>
            </div>
          ))}
        </div>

        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Deseja marcar esta tarefa como concluída mesmo com itens bloqueadores em aberto?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              backgroundColor: '#ef4444',
              borderColor: '#dc2626',
            }}
          >
            Confirmar Conclusão
          </button>
        </div>
      </div>
    </Modal>
  );
};
