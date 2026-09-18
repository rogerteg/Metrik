import React from 'react';

export interface DeleteBoardModalProps {
  isOpen: boolean;
  boardName: string;
  tasksCount: number;
  isSoleBoard: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({
  isOpen,
  boardName,
  tasksCount,
  isSoleBoard,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="manage-boards-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="manage-boards-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="manage-boards-modal-header">
          <h2 id="delete-modal-title">Excluir Quadro</h2>
          <button
            type="button"
            className="manage-boards-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <div className="manage-boards-modal-body">
          {isSoleBoard ? (
            <div className="delete-board-warning-sole" role="alert">
              <p>
                <strong>Operação bloqueada:</strong> Este é o único quadro disponível no momento.
                O Metrik exige ao menos um quadro ativo para navegação e trabalho.
              </p>
              <p className="delete-board-note">
                Para excluir este quadro, crie um novo quadro primeiro.
              </p>
            </div>
          ) : (
            <div className="delete-board-content">
              <p>
                Tem certeza de que deseja excluir permanentemente o quadro{' '}
                <strong>&quot;{boardName}&quot;</strong>?
              </p>
              {tasksCount > 0 ? (
                <div className="delete-board-tasks-impact" role="alert">
                  <span className="impact-icon">⚠️</span>
                  <span>
                    Este quadro contém <strong>{tasksCount} tarefa(s)</strong> associada(s) que serão
                    permanentemente excluídas.
                  </span>
                </div>
              ) : (
                <p className="delete-board-empty-hint">Este quadro não contém nenhuma tarefa.</p>
              )}
              <p className="delete-board-danger-hint">Esta ação não pode ser desfeita.</p>
            </div>
          )}
        </div>

        <div className="manage-boards-modal-footer">
          <button
            type="button"
            className="manage-modal-btn manage-modal-btn-cancel"
            onClick={onClose}
          >
            {isSoleBoard ? 'Voltar' : 'Cancelar'}
          </button>

          {!isSoleBoard && (
            <button
              type="button"
              className="manage-modal-btn manage-modal-btn-danger"
              onClick={onConfirm}
            >
              Confirmar Exclusão
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
