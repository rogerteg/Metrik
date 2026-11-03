import React from 'react';
import { FlowRule } from '../../types/flowRules';
import { ColumnModel } from '../../types/kanban';

export interface FlowRuleListItemProps {
  rule: FlowRule;
  columns: ColumnModel[];
  onToggle: (id: string) => void;
  onEdit: (rule: FlowRule) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FlowRuleListItem: React.FC<FlowRuleListItemProps> = ({
  rule,
  columns,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const getTriggerLabel = () => {
    switch (rule.trigger.type) {
      case 'card_moved': {
        const targetCol = columns.find((c) => c.id === rule.trigger.config.targetColumnId);
        if (targetCol) return `Mover para "${targetCol.title}"`;
        if (rule.trigger.config.targetColumnCategory) {
          return `Mover para etapa "${rule.trigger.config.targetColumnCategory}"`;
        }
        return 'Mover para qualquer coluna';
      }
      case 'block_status_changed':
        return rule.trigger.config.blockStatus === 'blocked'
          ? 'Cartão Bloqueado'
          : 'Cartão Desbloqueado';
      case 'aging_threshold_exceeded':
        return `Tempo em coluna > ${rule.trigger.config.agingThresholdDays || 3} dias`;
      case 'due_date_approaching':
        return `Vencimento em menos de ${rule.trigger.config.dueHoursThreshold || 24}h`;
      case 'card_created':
        return 'Novo Cartão Criado';
      default:
        return 'Evento Personalizado';
    }
  };

  return (
    <div className={`flow-rule-item ${rule.enabled ? 'is-enabled' : 'is-disabled'}`}>
      <div className="flow-rule-header">
        <div className="flow-rule-title-group">
          <label className="flow-rule-toggle-switch">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={() => onToggle(rule.id)}
              aria-label={`Ativar ou desativar regra ${rule.name}`}
            />
            <span className="flow-rule-toggle-slider" />
          </label>
          <div className="flow-rule-info">
            <h4 className="flow-rule-name">{rule.name}</h4>
            {rule.description && <p className="flow-rule-desc">{rule.description}</p>}
          </div>
        </div>

        <div className="flow-rule-actions-toolbar">
          <span className="flow-rule-exec-badge" title="Total de execuções com sucesso">
            ⚡ {rule.executionCount || 0} execuções
          </span>
          <button
            type="button"
            className="flow-rule-icon-btn"
            onClick={() => onEdit(rule)}
            title="Editar Regra"
            aria-label={`Editar regra ${rule.name}`}
          >
            ✏️
          </button>
          <button
            type="button"
            className="flow-rule-icon-btn"
            onClick={() => onDuplicate(rule.id)}
            title="Duplicar Regra"
            aria-label={`Duplicar regra ${rule.name}`}
          >
            📋
          </button>
          <button
            type="button"
            className="flow-rule-icon-btn is-danger"
            onClick={() => onDelete(rule.id)}
            title="Excluir Regra"
            aria-label={`Excluir regra ${rule.name}`}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flow-rule-summary-row">
        <span className="flow-rule-pill trigger-pill">
          <strong>Gatilho:</strong> {getTriggerLabel()}
        </span>
        {rule.conditions && rule.conditions.length > 0 && (
          <span className="flow-rule-pill condition-pill">
            <strong>Filtros:</strong> {rule.conditions.length} condição(ões)
          </span>
        )}
        <span className="flow-rule-pill action-pill">
          <strong>Ações:</strong> {rule.actions.length} ação(ões)
        </span>
      </div>
    </div>
  );
};
