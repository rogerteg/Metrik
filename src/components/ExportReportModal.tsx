import React, { useState, useEffect } from 'react';
import { TaskModel } from '../types/kanban';
import { MikaInsight } from '../types/mika';
import { ExportFormat, FlowReportSnapshot } from '../types/reports';
import {
  buildFlowReportSnapshot,
  exportTasksToSpreadsheet,
  ReportBoardLike,
  ReportTaskLike,
} from '../utils/flowReportExporter';
import './ExportReportModal.css';

export interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: ReportBoardLike;
  tasks: (TaskModel | ReportTaskLike)[];
  filteredTasks: (TaskModel | ReportTaskLike)[];
  mikaInsights?: MikaInsight[];
  activeDateFilterLabel?: string;
  hasActiveFilters?: boolean;
  onGeneratePdf: (snapshot: FlowReportSnapshot) => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  board,
  tasks,
  filteredTasks,
  mikaInsights = [],
  activeDateFilterLabel = 'Todos os dados do quadro',
  hasActiveFilters = false,
  onGeneratePdf,
}) => {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [useFilteredScope, setUseFilteredScope] = useState<boolean>(hasActiveFilters);
  const [includeMika, setIncludeMika] = useState<boolean>(true);
  const [includeBlockers, setIncludeBlockers] = useState<boolean>(true);
  const [includeSubtasks, setIncludeSubtasks] = useState<boolean>(false);

  useEffect(() => {
    setUseFilteredScope(hasActiveFilters);
  }, [hasActiveFilters]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const activeTaskSet = useFilteredScope ? filteredTasks : tasks;
  const scopeLabel = useFilteredScope
    ? activeDateFilterLabel || 'Amostragem ativa'
    : 'Todos os dados do quadro';

  const handleExecuteExport = () => {
    if (format === 'pdf') {
      const snapshot = buildFlowReportSnapshot(
        board,
        activeTaskSet,
        {
          format: 'pdf',
          includeMikaInsights: includeMika,
          includeBlockerBreakdown: includeBlockers,
          includeSubtasks,
        },
        mikaInsights,
        scopeLabel,
      );
      onGeneratePdf(snapshot);
      onClose();
    } else {
      exportTasksToSpreadsheet(activeTaskSet, board, includeSubtasks, scopeLabel);
      onClose();
    }
  };

  return (
    <div
      className="export-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      data-testid="export-report-modal"
    >
      <div className="export-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="export-modal-header">
          <div>
            <h2 id="export-modal-title" className="export-modal-title">
              Exportar Relatório de Fluxo
            </h2>
            <p className="export-modal-subtitle">
              Gere documentos executivos ou planilhas analíticas dos cartões do quadro.
            </p>
          </div>
          <button
            type="button"
            className="export-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
            data-testid="btn-close-export-modal"
          >
            ✕
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="export-modal-body">
          {/* 1. Escolha do Formato */}
          <div>
            <label className="export-scope-label" style={{ marginBottom: '8px', display: 'block' }}>
              Formato de Exportação
            </label>
            <div className="export-format-options">
              <button
                type="button"
                className={`export-format-card ${format === 'pdf' ? 'is-selected' : ''}`}
                onClick={() => setFormat('pdf')}
                data-testid="format-pdf"
              >
                <div className="export-format-card-header">
                  <span className="export-format-icon">📄</span>
                  <span className="export-format-name">Relatório PDF (A4)</span>
                </div>
                <div className="export-format-desc">
                  Layout executivo diagramado com KPIs consolidados, gráficos e diagnósticos da Mika AI.
                </div>
              </button>

              <button
                type="button"
                className={`export-format-card ${format === 'excel' ? 'is-selected' : ''}`}
                onClick={() => setFormat('excel')}
                data-testid="format-excel"
              >
                <div className="export-format-card-header">
                  <span className="export-format-icon">📊</span>
                  <span className="export-format-name">Planilha Excel / CSV</span>
                </div>
                <div className="export-format-desc">
                  Exportação tabular completa de 18 colunas com Lead/Cycle Time compatível com Excel pt-BR.
                </div>
              </button>
            </div>
          </div>

          {/* 2. Resumo do Escopo Avaliado */}
          <div className="export-scope-summary">
            <div className="export-scope-row">
              <span className="export-scope-label">Quadro:</span>
              <span className="export-scope-value">{board.title || board.name || 'Quadro'}</span>
            </div>
            <div className="export-scope-row">
              <span className="export-scope-label">Escopo Selecionado:</span>
              <span className="export-scope-value">
                {scopeLabel}{' '}
                {hasActiveFilters && (
                  <span className="export-filter-badge" title="Filtros aplicados">
                    🎛️ Filtros Ativos
                  </span>
                )}
              </span>
            </div>
            <div className="export-scope-row">
              <span className="export-scope-label">Total de Tarefas Exportadas:</span>
              <span className="export-scope-value">
                {activeTaskSet.length} {activeTaskSet.length === 1 ? 'cartão' : 'cartões'}
              </span>
            </div>
          </div>

          {/* 3. Opções e Customizações de Escopo */}
          <div className="export-custom-options">
            {hasActiveFilters && (
              <label className="export-checkbox-label">
                <input
                  type="checkbox"
                  checked={useFilteredScope}
                  onChange={(e) => setUseFilteredScope(e.target.checked)}
                  data-testid="toggle-use-filters"
                />
                <span>Utilizar amostragem de dados filtrada atual</span>
              </label>
            )}

            {format === 'pdf' && (
              <>
                <label className="export-checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeMika}
                    onChange={(e) => setIncludeMika(e.target.checked)}
                    data-testid="toggle-mika-insights"
                  />
                  <span>Incluir diagnósticos ativos da Mika AI Flow Copilot</span>
                </label>

                <label className="export-checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeBlockers}
                    onChange={(e) => setIncludeBlockers(e.target.checked)}
                    data-testid="toggle-blockers"
                  />
                  <span>Incluir análise detalhada de impedimentos</span>
                </label>
              </>
            )}

            {format === 'excel' && (
              <label className="export-checkbox-label">
                <input
                  type="checkbox"
                  checked={includeSubtasks}
                  onChange={(e) => setIncludeSubtasks(e.target.checked)}
                  data-testid="toggle-subtasks"
                />
                <span>Incluir subtarefas como linhas individuais na planilha</span>
              </label>
            )}
          </div>
        </div>

        {/* Rodapé e Gatilho */}
        <div className="export-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-compact"
            onClick={onClose}
            data-testid="btn-cancel-export"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-compact"
            onClick={handleExecuteExport}
            data-testid="btn-confirm-export"
          >
            {format === 'pdf' ? '🖨️ Gerar Relatório Executivo' : '📥 Baixar Planilha (.csv)'}
          </button>
        </div>
      </div>
    </div>
  );
};
