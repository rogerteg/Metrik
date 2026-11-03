import React, { useState, useRef } from 'react';
import { FlowRule } from '../../types/flowRules';
import { ColumnModel } from '../../types/kanban';
import { FlowRuleListItem } from './FlowRuleListItem';
import { FlowRuleBuilder } from './FlowRuleBuilder';
import { FlowRuleTemplates } from './FlowRuleTemplates';
import { FlowRuleTemplate } from '../../utils/flowRulesTemplates';
import { exportFlowRulesAsJson, importFlowRulesFromJson } from '../../utils/flowRulesStorage';
import { NewFlowRuleInput } from '../../hooks/useFlowRules';
import './FlowRules.css';

export interface FlowRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columns: ColumnModel[];
  rules: FlowRule[];
  onAddRule: (input: NewFlowRuleInput) => FlowRule;
  onUpdateRule: (id: string, updates: Partial<FlowRule>) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onDuplicateRule: (id: string) => void;
  onSetRules: (rules: FlowRule[]) => void;
  onToast?: (message: string) => void;
}

export const FlowRulesModal: React.FC<FlowRulesModalProps> = ({
  isOpen,
  onClose,
  boardId,
  columns,
  rules,
  onAddRule,
  onUpdateRule,
  onToggleRule,
  onDeleteRule,
  onDuplicateRule,
  onSetRules,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'templates'>('rules');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FlowRule | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsBuilderOpen(true);
  };

  const handleEditRule = (rule: FlowRule) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const handleSaveRule = (data: NewFlowRuleInput) => {
    if (editingRule) {
      onUpdateRule(editingRule.id, data);
      onToast?.(`Regra "${data.name}" atualizada com sucesso.`);
    } else {
      onAddRule(data);
      onToast?.(`Regra "${data.name}" criada e ativada.`);
    }
    setIsBuilderOpen(false);
    setEditingRule(null);
  };

  const handleUseTemplate = (template: FlowRuleTemplate) => {
    onAddRule(template.ruleTemplate as NewFlowRuleInput);
    setActiveTab('rules');
    onToast?.(`Modelo "${template.name}" adicionado com sucesso!`);
  };

  const handleExport = () => {
    const jsonStr = exportFlowRulesAsJson(rules);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrik-flow-rules-${boardId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.('Regras exportadas com sucesso em formato JSON.');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importFlowRulesFromJson(text, boardId);
        onSetRules([...rules, ...imported]);
        onToast?.(`${imported.length} regra(s) importada(s) com sucesso.`);
      } catch {
        onToast?.('Erro ao importar arquivo. Verifique se o formato JSON é válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flow-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="flow-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="flow-modal-header">
          <div className="flow-modal-title-row">
            <div className="flow-modal-title-badge">⚡</div>
            <div>
              <h2 className="flow-modal-heading">Regras de Fluxo & Automações</h2>
              <p className="flow-modal-subheading">
                Governança visual, alertas e acordos de trabalho sem código
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flow-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal de automações"
          >
            ✕
          </button>
        </div>

        {/* Abas e Ações */}
        {!isBuilderOpen && (
          <div className="flow-modal-nav-bar">
            <div className="flow-nav-tabs">
              <button
                type="button"
                className={`flow-nav-tab ${activeTab === 'rules' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                Regras Ativas ({rules.length})
              </button>
              <button
                type="button"
                className={`flow-nav-tab ${activeTab === 'templates' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                Modelos Prontos
              </button>
            </div>

            <div className="flow-nav-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="flow-btn-secondary btn-sm"
                onClick={handleImportClick}
                title="Importar regras de arquivo JSON"
              >
                📥 Importar
              </button>
              <button
                type="button"
                className="flow-btn-secondary btn-sm"
                onClick={handleExport}
                title="Exportar regras ativas para backup"
              >
                📤 Exportar
              </button>
              <button
                type="button"
                className="flow-btn-primary btn-sm"
                onClick={handleOpenCreate}
              >
                + Nova Regra
              </button>
            </div>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="flow-modal-body">
          {isBuilderOpen ? (
            <FlowRuleBuilder
              initialRule={editingRule}
              columns={columns}
              onSave={handleSaveRule}
              onCancel={() => {
                setIsBuilderOpen(false);
                setEditingRule(null);
              }}
            />
          ) : activeTab === 'rules' ? (
            rules.length === 0 ? (
              <div className="flow-empty-state">
                <div className="flow-empty-icon">⚙️</div>
                <h3>Nenhuma regra configurada neste quadro</h3>
                <p>
                  Automatize movimentações, sinalize itens parados há muito tempo ou
                  aplique tags de QA automaticamente.
                </p>
                <div className="flow-empty-actions">
                  <button
                    type="button"
                    className="flow-btn-primary"
                    onClick={handleOpenCreate}
                  >
                    Criar Primeira Regra
                  </button>
                  <button
                    type="button"
                    className="flow-btn-secondary"
                    onClick={() => setActiveTab('templates')}
                  >
                    Explorar Modelos Prontos
                  </button>
                </div>
              </div>
            ) : (
              <div className="flow-rules-list">
                {rules.map((rule) => (
                  <FlowRuleListItem
                    key={rule.id}
                    rule={rule}
                    columns={columns}
                    onToggle={onToggleRule}
                    onEdit={handleEditRule}
                    onDuplicate={onDuplicateRule}
                    onDelete={onDeleteRule}
                  />
                ))}
              </div>
            )
          ) : (
            <FlowRuleTemplates onSelectTemplate={handleUseTemplate} />
          )}
        </div>
      </div>
    </div>
  );
};
