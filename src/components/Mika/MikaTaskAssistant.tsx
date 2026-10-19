/**
 * MikaTaskAssistant - Assistente contextual de refinamento e decomposição de tarefas (Feature 048)
 * Integrado ao TaskDetailsModal para quebra técnica em subtarefas e geração de critérios BDD.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-004, FR-005, SC-003)
 */

import React, { useState, useEffect } from 'react';
import { TaskModel } from '../../types/kanban';
import { MikaDecomposition, MikaSubtaskSuggestion } from '../../types/mika';
import { mikaService } from '../../services/ai/mikaService';

export interface MikaTaskAssistantProps {
  task: TaskModel;
  onAcceptSubtasks: (subtasks: { id: string; title: string; completed: boolean }[]) => void;
  onAcceptCriteria: (criteriaText: string) => void;
  onClose: () => void;
}

export const MikaTaskAssistant: React.FC<MikaTaskAssistantProps> = ({
  task,
  onAcceptSubtasks,
  onAcceptCriteria,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [decomposition, setDecomposition] = useState<MikaDecomposition | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    mikaService
      .decomposeTask(task)
      .then((decomp) => {
        if (isMounted) {
          setDecomposition(decomp);
          // Pré-seleciona todas as subtarefas sugeridas por padrão
          setSelectedIds(new Set(decomp.suggestedSubtasks.map((st) => st.id)));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[MikaTaskAssistant] Erro ao decompor tarefa:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [task]);

  const handleToggleSubtask = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAcceptSelected = () => {
    if (!decomposition) return;
    const itemsToInsert = decomposition.suggestedSubtasks
      .filter((st) => selectedIds.has(st.id))
      .map((st) => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: st.title || st.text || 'Subtarefa',
        completed: false,
      }));

    if (itemsToInsert.length > 0) {
      onAcceptSubtasks(itemsToInsert);
    }
    onClose();
  };

  const handleApplyCriteria = () => {
    if (!decomposition || !decomposition.suggestedAcceptanceCriteria) return;
    const text = decomposition.suggestedAcceptanceCriteria.join('\n\n');
    onAcceptCriteria(text);
  };

  return (
    <div className="mika-task-assistant" aria-label="Assistente de Refinamento da Mika">
      <div className="mika-insight-toolbar-title" style={{ marginBottom: '0.75rem' }}>
        <div className="mika-avatar-badge" title="Mika AI Flow Copilot">
          M
        </div>
        <strong style={{ color: 'var(--color-text, #f8fafc)', fontSize: '0.95rem' }}>
          Mika — Refinamento & Decomposição de Escopo
        </strong>
      </div>

      {loading && (
        <div
          style={{ padding: '1rem', color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.9rem' }}
        >
          ⏳ Analisando escopo com Mika...
        </div>
      )}

      {!loading && decomposition && (
        <>
          {decomposition.explanation && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary, #cbd5e1)',
                margin: '0 0 0.75rem 0',
              }}
            >
              {decomposition.explanation}
            </p>
          )}

          {decomposition.suggestedSubtasks.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--color-text, #f8fafc)',
                  marginBottom: '0.5rem',
                }}
              >
                Subtarefas sugeridas para o checklist:
              </div>
              {decomposition.suggestedSubtasks.map((st: MikaSubtaskSuggestion) => (
                <label key={st.id} className="mika-subtask-item">
                  <input
                    type="checkbox"
                    className="mika-subtask-checkbox"
                    checked={selectedIds.has(st.id)}
                    onChange={() => handleToggleSubtask(st.id)}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text, #e2e8f0)' }}>
                    {st.title || st.text}
                  </span>
                </label>
              ))}
            </div>
          )}

          {decomposition.suggestedAcceptanceCriteria &&
            decomposition.suggestedAcceptanceCriteria.length > 0 && (
              <div
                style={{
                  marginBottom: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '0.625rem',
                  borderRadius: '0.375rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#38bdf8',
                    marginBottom: '0.35rem',
                  }}
                >
                  Critérios de Aceitação Sugeridos (BDD):
                </div>
                {decomposition.suggestedAcceptanceCriteria.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--color-text-secondary, #cbd5e1)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    • {c}
                  </div>
                ))}
                <button
                  type="button"
                  className="mika-btn-secondary"
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                  onClick={handleApplyCriteria}
                >
                  Aplicar Critérios de Aceite
                </button>
              </div>
            )}

          <div className="mika-action-row">
            <button
              type="button"
              className="mika-btn-primary"
              onClick={handleAcceptSelected}
              disabled={selectedIds.size === 0}
            >
              Inserir Selecionadas no Checklist ({selectedIds.size})
            </button>
            <button type="button" className="mika-btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
};
