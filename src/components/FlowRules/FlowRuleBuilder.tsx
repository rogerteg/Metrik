import React, { useState, useEffect, useCallback } from 'react';
import {
  FlowRule,
  FlowTriggerType,
  FlowCondition,
  FlowAction,
  FlowActionType,
  FlowConditionField,
  FlowConditionOperator,
} from '../../types/flowRules';
import { ColumnCategory, ColumnModel, PriorityLevel } from '../../types/kanban';
import { NewFlowRuleInput } from '../../hooks/useFlowRules';

export interface FlowRuleBuilderProps {
  initialRule?: FlowRule | null;
  columns: ColumnModel[];
  onSave: (ruleData: NewFlowRuleInput) => void;
  onCancel: () => void;
}

export const FlowRuleBuilder: React.FC<FlowRuleBuilderProps> = ({
  initialRule,
  columns,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialRule?.name || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [enabled, setEnabled] = useState(initialRule?.enabled ?? true);

  const [triggerType, setTriggerType] = useState<FlowTriggerType>(
    initialRule?.trigger.type || 'card_moved',
  );
  const [targetColumnId, setTargetColumnId] = useState(
    initialRule?.trigger.config.targetColumnId || '',
  );
  const [targetColumnCategory, setTargetColumnCategory] = useState(
    initialRule?.trigger.config.targetColumnCategory || 'in_progress',
  );
  const [agingDays, setAgingDays] = useState(initialRule?.trigger.config.agingThresholdDays || 3);
  const [dueHours, setDueHours] = useState(initialRule?.trigger.config.dueHoursThreshold || 24);
  const [blockStatus, setBlockStatus] = useState<'blocked' | 'unblocked' | 'any'>(
    initialRule?.trigger.config.blockStatus || 'blocked',
  );

  const [conditions, setConditions] = useState<FlowCondition[]>(initialRule?.conditions || []);
  const [actions, setActions] = useState<FlowAction[]>(initialRule?.actions || []);

  const handleAddCondition = () => {
    const newCond: FlowCondition = {
      id: `cond_${Date.now()}`,
      field: 'priority',
      operator: 'equals',
      value: 'urgent',
    };
    setConditions((prev) => [...prev, newCond]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<FlowCondition>) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddAction = () => {
    const newAction: FlowAction = {
      id: `action_${Date.now()}`,
      type: 'add_tag',
      payload: { tag: '' },
    };
    setActions((prev) => [...prev, newAction]);
  };

  const handleUpdateAction = (id: string, updates: Partial<FlowAction>) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const isDirty =
    name !== (initialRule?.name || '') ||
    description !== (initialRule?.description || '') ||
    triggerType !== (initialRule?.trigger.type || 'card_moved') ||
    conditions.length !== (initialRule?.conditions?.length || 0) ||
    actions.length !== (initialRule?.actions?.length || 0);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (
        window.confirm(
          'Existem configurações não salvas nesta regra. Deseja realmente descartar as alterações?',
        )
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancel]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ruleData: NewFlowRuleInput = {
      name: name.trim(),
      description: description.trim(),
      enabled,
      trigger: {
        type: triggerType,
        config: {
          ...(triggerType === 'card_moved' && {
            targetColumnId: targetColumnId || undefined,
            targetColumnCategory: targetColumnCategory || undefined,
          }),
          ...(triggerType === 'aging_threshold_exceeded' && {
            agingThresholdDays: Number(agingDays),
            targetColumnCategory: targetColumnCategory || undefined,
          }),
          ...(triggerType === 'due_date_approaching' && {
            dueHoursThreshold: Number(dueHours),
          }),
          ...(triggerType === 'block_status_changed' && {
            blockStatus,
          }),
        },
      },
      conditions,
      actions:
        actions.length > 0
          ? actions
          : [
              {
                id: `action_default_${Date.now()}`,
                type: 'add_tag',
                payload: { tag: 'automatizado' },
              },
            ],
    };

    onSave(ruleData);
  };

  return (
    <form className="flow-rule-builder-form" onSubmit={handleSave}>
      <div className="flow-builder-header">
        <h3>{initialRule ? 'Editar Regra de Fluxo' : 'Nova Regra de Fluxo'}</h3>
        <p className="flow-builder-sub">
          Configure a lógica declarativa (Gatilho → Condições → Ações)
        </p>
      </div>

      <div className="flow-builder-section">
        <label className="flow-label" htmlFor="rule-name">
          Nome da Regra <span className="required-star">*</span>
        </label>
        <input
          id="rule-name"
          type="text"
          className="flow-input"
          placeholder="Ex: Alerta de Aging em Progresso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="flow-label" htmlFor="rule-desc">
          Descrição (opcional)
        </label>
        <textarea
          id="rule-desc"
          className="flow-textarea"
          rows={2}
          placeholder="Explique o propósito deste acordo de trabalho..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label
          className="flow-checkbox-label"
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span style={{ fontSize: '0.875rem' }}>Regra Ativa</span>
        </label>
      </div>

      {/* Seção 1: Gatilho */}
      <div className="flow-builder-card">
        <div className="flow-card-title">
          <span className="step-badge">1</span>
          <h4>Gatilho (Quando acontecer...)</h4>
        </div>

        <label className="flow-label" htmlFor="trigger-type">
          Gatilho
        </label>
        <select
          id="trigger-type"
          className="flow-select"
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value as FlowTriggerType)}
        >
          <option value="card_moved">Cartão movido para coluna</option>
          <option value="aging_threshold_exceeded">Tempo em coluna excede limiar (Aging)</option>
          <option value="due_date_approaching">Prazo limite se aproximando (Due Date)</option>
          <option value="block_status_changed">Status de impedimento alterado</option>
          <option value="card_created">Novo cartão criado</option>
        </select>

        {triggerType === 'card_moved' && (
          <div className="trigger-params-grid">
            <div>
              <label className="flow-label">Coluna Destino Específica</label>
              <select
                className="flow-select"
                value={targetColumnId}
                onChange={(e) => setTargetColumnId(e.target.value)}
              >
                <option value="">Qualquer coluna</option>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flow-label">Ou Categoria de Coluna</label>
              <select
                className="flow-select"
                value={targetColumnCategory}
                onChange={(e) => setTargetColumnCategory(e.target.value as ColumnCategory)}
              >
                <option value="todo">A Fazer (Todo)</option>
                <option value="in_progress">Em Progresso (In Progress)</option>
                <option value="done">Concluído (Done)</option>
              </select>
            </div>
          </div>
        )}

        {triggerType === 'aging_threshold_exceeded' && (
          <div className="trigger-params-grid">
            <div>
              <label className="flow-label">Dias de permanência</label>
              <input
                type="number"
                min={1}
                max={90}
                className="flow-input"
                value={agingDays}
                onChange={(e) => setAgingDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="flow-label">Na categoria</label>
              <select
                className="flow-select"
                value={targetColumnCategory}
                onChange={(e) => setTargetColumnCategory(e.target.value as ColumnCategory)}
              >
                <option value="in_progress">Em Progresso</option>
                <option value="todo">A Fazer</option>
              </select>
            </div>
          </div>
        )}

        {triggerType === 'due_date_approaching' && (
          <div>
            <label className="flow-label">Horas antes do vencimento</label>
            <input
              type="number"
              min={1}
              max={168}
              className="flow-input"
              value={dueHours}
              onChange={(e) => setDueHours(Number(e.target.value))}
            />
          </div>
        )}

        {triggerType === 'block_status_changed' && (
          <div>
            <label className="flow-label">Quando o cartão for</label>
            <select
              className="flow-select"
              value={blockStatus}
              onChange={(e) => setBlockStatus(e.target.value as 'blocked' | 'unblocked' | 'any')}
            >
              <option value="blocked">Marcado como Bloqueado</option>
              <option value="unblocked">Desbloqueado</option>
              <option value="any">Qualquer alteração de bloqueio</option>
            </select>
          </div>
        )}
      </div>

      {/* Seção 2: Condições */}
      <div className="flow-builder-card">
        <div className="flow-card-title justify-between">
          <div className="flex-align">
            <span className="step-badge">2</span>
            <h4>Condições Adicionais (Se...)</h4>
          </div>
          <button type="button" className="flow-btn-secondary btn-sm" onClick={handleAddCondition}>
            + Adicionar Condição
          </button>
        </div>

        {conditions.length === 0 ? (
          <p className="flow-empty-hint">
            Nenhuma condição. O gatilho aplicará para todos os cartões.
          </p>
        ) : (
          <div className="flow-item-list">
            {conditions.map((cond) => (
              <div key={cond.id} className="flow-condition-row">
                <select
                  className="flow-select select-sm"
                  value={cond.field}
                  onChange={(e) =>
                    handleUpdateCondition(cond.id, {
                      field: e.target.value as FlowConditionField,
                    })
                  }
                >
                  <option value="priority">Prioridade</option>
                  <option value="tags">Tags</option>
                  <option value="type">Tipo</option>
                  <option value="assignee">Responsável</option>
                </select>

                <select
                  className="flow-select select-sm"
                  value={cond.operator}
                  onChange={(e) =>
                    handleUpdateCondition(cond.id, {
                      operator: e.target.value as FlowConditionOperator,
                    })
                  }
                >
                  <option value="equals">É igual a</option>
                  <option value="not_equals">Não é igual a</option>
                  <option value="contains">Contém</option>
                  <option value="not_contains">Não contém</option>
                  <option value="is_empty">Está vazio</option>
                  <option value="is_not_empty">Não está vazio</option>
                </select>

                <input
                  type="text"
                  className="flow-input input-sm"
                  placeholder="Valor..."
                  value={String(cond.value || '')}
                  onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                />

                <button
                  type="button"
                  className="flow-rule-icon-btn is-danger"
                  onClick={() => handleRemoveCondition(cond.id)}
                  title="Remover Condição"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção 3: Ações */}
      <div className="flow-builder-card">
        <div className="flow-card-title justify-between">
          <div className="flex-align">
            <span className="step-badge">3</span>
            <h4>Ações (Então faça...)</h4>
          </div>
          <button type="button" className="flow-btn-secondary btn-sm" onClick={handleAddAction}>
            Adicionar Ação
          </button>
        </div>

        {actions.length === 0 ? (
          <p className="flow-empty-hint">Nenhuma ação configurada. Clique em "Adicionar Ação".</p>
        ) : (
          <div className="flow-item-list">
            {actions.map((act) => (
              <div key={act.id} className="flow-action-row">
                <select
                  className="flow-select select-sm"
                  value={act.type}
                  onChange={(e) =>
                    handleUpdateAction(act.id, {
                      type: e.target.value as FlowActionType,
                    })
                  }
                >
                  <option value="add_tag">Adicionar Tag</option>
                  <option value="remove_tag">Remover Tag</option>
                  <option value="set_priority">Definir Prioridade</option>
                  <option value="set_blocked">Bloquear Cartão</option>
                  <option value="set_unblocked">Desbloquear Cartão</option>
                  <option value="notify_toast">Exibir Notificação Toast</option>
                </select>

                {act.type === 'add_tag' && (
                  <input
                    type="text"
                    className="flow-input input-sm"
                    placeholder="Nome da tag (ex: needs-qa)"
                    value={act.payload.tag || ''}
                    onChange={(e) =>
                      handleUpdateAction(act.id, {
                        payload: { ...act.payload, tag: e.target.value },
                      })
                    }
                  />
                )}

                {act.type === 'remove_tag' && (
                  <input
                    type="text"
                    className="flow-input input-sm"
                    placeholder="Tag a remover"
                    value={act.payload.tag || ''}
                    onChange={(e) =>
                      handleUpdateAction(act.id, {
                        payload: { ...act.payload, tag: e.target.value },
                      })
                    }
                  />
                )}

                {act.type === 'set_priority' && (
                  <select
                    className="flow-select select-sm"
                    value={act.payload.priority || 'medium'}
                    onChange={(e) =>
                      handleUpdateAction(act.id, {
                        payload: {
                          ...act.payload,
                          priority: e.target.value as PriorityLevel,
                        },
                      })
                    }
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                )}

                {act.type === 'set_blocked' && (
                  <input
                    type="text"
                    className="flow-input input-sm"
                    placeholder="Motivo do bloqueio..."
                    value={act.payload.blockReason || ''}
                    onChange={(e) =>
                      handleUpdateAction(act.id, {
                        payload: { ...act.payload, blockReason: e.target.value },
                      })
                    }
                  />
                )}

                {act.type === 'notify_toast' && (
                  <input
                    type="text"
                    className="flow-input input-sm"
                    placeholder="Mensagem da notificação..."
                    value={act.payload.toastMessage || ''}
                    onChange={(e) =>
                      handleUpdateAction(act.id, {
                        payload: { ...act.payload, toastMessage: e.target.value },
                      })
                    }
                  />
                )}

                <button
                  type="button"
                  className="flow-rule-icon-btn is-danger"
                  onClick={() => handleRemoveAction(act.id)}
                  title="Remover Ação"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flow-builder-footer">
        <button type="button" className="flow-btn-secondary" onClick={handleCancel}>
          Cancelar
        </button>
        <button type="submit" className="flow-btn-primary" disabled={!name.trim()}>
          Salvar Regra
        </button>
      </div>
    </form>
  );
};
