import React from 'react';
import { FlowRuleTemplate, FLOW_RULE_TEMPLATES } from '../../utils/flowRulesTemplates';

export interface FlowRuleTemplatesProps {
  onSelectTemplate: (template: FlowRuleTemplate) => void;
}

export const FlowRuleTemplates: React.FC<FlowRuleTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="flow-templates-grid">
      {FLOW_RULE_TEMPLATES.map((tmpl) => (
        <div key={tmpl.id} className="flow-template-card">
          <div className="flow-template-header">
            <span className={`flow-cat-badge is-${tmpl.category}`}>{tmpl.category}</span>
            <h4>{tmpl.name}</h4>
          </div>
          <p className="flow-template-desc">{tmpl.description}</p>
          <button
            type="button"
            className="flow-btn-secondary btn-sm full-width"
            onClick={() => onSelectTemplate(tmpl)}
          >
            Usar este Modelo
          </button>
        </div>
      ))}
    </div>
  );
};
