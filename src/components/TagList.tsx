import React, { useState, useRef, useEffect } from 'react';
import { getTagTheme } from '../utils/tagColors';

export interface TagListProps {
  tags?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  readOnly?: boolean;
}

export const TagList: React.FC<TagListProps> = ({
  tags = [],
  onAddTag,
  onRemoveTag,
  readOnly = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const submitTag = () => {
    const clean = inputValue.replace(/,/g, '').trim();
    if (clean && onAddTag) {
      onAddTag(clean);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      submitTag();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleBlur = () => {
    submitTag();
    setIsAdding(false);
  };

  return (
    <div
      className="tag-list"
      aria-label="Lista de etiquetas"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {tags.map((tag) => {
        const theme = getTagTheme(tag);
        return (
          <span
            key={tag}
            className="tag-chip"
            style={{
              color: theme.color,
              backgroundColor: theme.bg,
              borderColor: theme.border,
            }}
          >
            <span className="tag-chip__label">{tag}</span>
            {!readOnly && onRemoveTag && (
              <button
                type="button"
                className="tag-chip__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(tag);
                }}
                aria-label={`Remover tag ${tag}`}
                title={`Remover tag ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        );
      })}

      {!readOnly && onAddTag && (
        isAdding ? (
          <input
            ref={inputRef}
            type="text"
            className="tag-input-inline"
            placeholder="Nova tag..."
            maxLength={20}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            aria-label="Nova tag"
          />
        ) : (
          <button
            type="button"
            className="tag-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            aria-label="Adicionar tag"
            title="Adicionar tag"
          >
            + Tag
          </button>
        )
      )}
    </div>
  );
};
