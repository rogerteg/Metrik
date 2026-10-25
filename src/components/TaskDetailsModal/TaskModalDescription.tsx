import React from 'react';
import { TaskFieldActionToolbar } from '../TaskFieldActionToolbar';
import { TaskModalDescriptionProps } from './types';

export const TaskModalDescription: React.FC<TaskModalDescriptionProps> = ({
  descEdit,
  acEdit,
  tsEdit,
  isReadOnly,
}) => {
  return (
    <>
      {/* Description Section */}
      <section className="td-section">
        <div className="td-section-header">
          <label htmlFor="td-description" className="td-label">
            Descrição
          </label>
          <TaskFieldActionToolbar
            status={descEdit.status}
            isDirty={descEdit.isDirty}
            onSave={descEdit.saveNow}
            onDiscard={descEdit.discard}
            isReadOnly={isReadOnly}
            ariaLabelPrefix="da descrição"
          />
        </div>
        <textarea
          id="td-description"
          className="td-textarea"
          placeholder="Adicione uma descrição detalhada..."
          value={descEdit.value}
          onChange={(e) => descEdit.setValue(e.target.value)}
          onBlur={descEdit.handleBlur}
          onKeyDown={descEdit.handleKeyDown}
          rows={4}
        />
      </section>

      {/* Acceptance Criteria */}
      <section className="td-section">
        <div className="td-section-header">
          <label htmlFor="td-acceptance-criteria" className="td-label">
            Critérios de Aceitação
          </label>
          <TaskFieldActionToolbar
            status={acEdit.status}
            isDirty={acEdit.isDirty}
            onSave={acEdit.saveNow}
            onDiscard={acEdit.discard}
            isReadOnly={isReadOnly}
            ariaLabelPrefix="dos critérios de aceitação"
          />
        </div>
        <textarea
          id="td-acceptance-criteria"
          className="td-textarea"
          placeholder="Defina os critérios para aceitação..."
          value={acEdit.value}
          onChange={(e) => acEdit.setValue(e.target.value)}
          onBlur={acEdit.handleBlur}
          onKeyDown={acEdit.handleKeyDown}
          rows={3}
        />
      </section>

      {/* Test Scenarios */}
      <section className="td-section">
        <div className="td-section-header">
          <label htmlFor="td-test-scenarios" className="td-label">
            Cenários de Testes
          </label>
          <TaskFieldActionToolbar
            status={tsEdit.status}
            isDirty={tsEdit.isDirty}
            onSave={tsEdit.saveNow}
            onDiscard={tsEdit.discard}
            isReadOnly={isReadOnly}
            ariaLabelPrefix="dos cenários de testes"
          />
        </div>
        <textarea
          id="td-test-scenarios"
          className="td-textarea"
          placeholder="Descreva os cenários de testes..."
          value={tsEdit.value}
          onChange={(e) => tsEdit.setValue(e.target.value)}
          onBlur={tsEdit.handleBlur}
          onKeyDown={tsEdit.handleKeyDown}
          rows={3}
        />
      </section>
    </>
  );
};
