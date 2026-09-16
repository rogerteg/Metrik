import React, { useState, useEffect } from 'react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (name: string, color: string, description?: string) => void;
}

const COLOR_PRESETS = [
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#eab308', // Amarelo
  '#10b981', // Esmeralda
  '#06b6d4', // Ciano
  '#38bdf8', // Azul Claro
  '#6366f1', // Índigo
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkspace,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[1]); // Laranja default
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor(COLOR_PRESETS[1]);
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('O nome do espaço é obrigatório.');
      return;
    }

    onCreateWorkspace(trimmedName, color, description.trim() || undefined);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content create-workspace-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
      >
        <div className="modal-header">
          <div className="modal-title-with-color">
            <span
              className="workspace-color-bullet large"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <h2 id="create-workspace-title">Novo Espaço de Trabalho</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal de criação de espaço"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="workspace-name-input">Nome do Espaço *</label>
            <input
              id="workspace-name-input"
              type="text"
              className="form-control"
              placeholder="Ex.: Projetos Estratégicos, P&D, Vendas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="workspace-desc-input">Descrição / Propósito</label>
            <input
              id="workspace-desc-input"
              type="text"
              className="form-control"
              placeholder="Breve descrição dos objetivos deste espaço"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Cor do Marcador</label>
            <div className="color-presets-row" role="radiogroup" aria-label="Paleta de cores">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim()}
            >
              Criar Espaço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
