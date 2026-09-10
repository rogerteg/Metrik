import React, { useState, useEffect } from 'react';
import { ColumnCategory, MAX_COLUMNS, PRESET_COLUMN_COLORS } from '../types/kanban';
import './Modal.css';

export interface NewColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (title: string, category: ColumnCategory, wipLimit: number | null, color?: string) => void;
  currentColumnCount: number;
}

export const NewColumnModal: React.FC<NewColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  currentColumnCount,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ColumnCategory>('in_progress');
  const [wipLimit, setWipLimit] = useState<string>('');
  const [color, setColor] = useState<string>(PRESET_COLUMN_COLORS[1].hex);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory('in_progress');
      setWipLimit('');
      setColor(PRESET_COLUMN_COLORS[1].hex); // Sky Blue default
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAtLimit = currentColumnCount >= MAX_COLUMNS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('O título da coluna é obrigatório.');
      return;
    }

    if (isAtLimit) {
      setError(`Limite de ${MAX_COLUMNS} colunas atingido.`);
      return;
    }

    let parsedWip: number | null = null;
    if (wipLimit.trim() !== '') {
      const parsed = parseInt(wipLimit, 10);
      if (isNaN(parsed) || parsed < 1) {
        setError('O limite de WIP deve ser um número inteiro maior que zero.');
        return;
      }
      parsedWip = parsed;
    }

    onAddColumn(cleanTitle, category, parsedWip, color);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content new-column-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-column-modal-title"
      >
        <div className="modal-header">
          <h2 id="new-column-modal-title" className="modal-title">
            Nova Coluna no Quadro
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        {isAtLimit && (
          <div className="modal-warning-banner" role="alert">
            ⚠️ <strong>Excesso de colunas, cuidado.</strong>
            <span>O quadro já atingiu o teto máximo de {MAX_COLUMNS} colunas.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-message" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="column-title-input" className="form-label">
              Título da Coluna *
            </label>
            <input
              id="column-title-input"
              type="text"
              className="form-input"
              placeholder="Ex: Code Review, QA, Homologação..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isAtLimit}
              autoFocus
              maxLength={40}
            />
          </div>

          <div className="form-group">
            <label htmlFor="column-category-select" className="form-label">
              Categoria de Fluxo
            </label>
            <select
              id="column-category-select"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ColumnCategory)}
              disabled={isAtLimit}
            >
              <option value="todo">A Fazer (Backlog / Não Iniciado)</option>
              <option value="in_progress">Em Progresso (Execução Ativa)</option>
              <option value="done">Concluído (Entrega Finalizada)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="column-wip-input" className="form-label">
              Limite de WIP (opcional)
            </label>
            <input
              id="column-wip-input"
              type="number"
              className="form-input"
              placeholder="Sem limite"
              min="1"
              max="99"
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
              disabled={isAtLimit}
            />
            <small className="form-helper-text">
              Quantidade máxima de cartões simultâneos permitidos nesta coluna.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Cor da Coluna
            </label>
            <div className="modal-color-presets-row">
              {PRESET_COLUMN_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  className={`color-preset-swatch ${color.toLowerCase() === preset.hex.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => setColor(preset.hex)}
                  title={preset.name}
                  aria-label={`Cor ${preset.name}`}
                  disabled={isAtLimit}
                />
              ))}
              <input
                type="color"
                className="column-native-color-picker modal-color-input"
                value={color.startsWith('#') ? color : '#38bdf8'}
                onChange={(e) => setColor(e.target.value)}
                title="Cor personalizada"
                aria-label="Cor personalizada"
                disabled={isAtLimit}
              />
            </div>
            <small className="form-helper-text">
              Os cartões inseridos nesta coluna herdarão sua cor configurada.
            </small>
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
              disabled={isAtLimit || !title.trim()}
            >
              Criar Coluna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
