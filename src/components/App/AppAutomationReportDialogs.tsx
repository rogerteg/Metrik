import React from 'react';
import { BoardState, TaskModel } from '../../types/kanban';
import { MikaInsight } from '../../types/mika';
import { FlowReportSnapshot } from '../../types/reports';
import { ReportBoardLike } from '../../utils/flowReportExporter';
import { ExportReportModal } from '../ExportReportModal';
import { ExecutiveReportPrintView } from '../ExecutiveReportPrintView';
import { FlowRulesModal } from '../FlowRules/FlowRulesModal';
import { FlowRule } from '../../types/flowRules';
import { NewFlowRuleInput } from '../../hooks/useFlowRules';

export interface AppAutomationReportDialogsProps {
  board: BoardState;
  allBoardTasks: TaskModel[];
  filteredTasks: TaskModel[];
  mikaInsights: MikaInsight[];
  hasActiveFilters: boolean;
  isExportModalOpen: boolean;
  onCloseExportModal: () => void;
  headerPrintSnapshot: FlowReportSnapshot | null;
  onCloseHeaderPrint: () => void;
  onGeneratePdf: (snapshot: FlowReportSnapshot) => void;

  isFlowRulesModalOpen: boolean;
  onCloseFlowRulesModal: () => void;
  activeBoardId: string;
  flowRules: FlowRule[];
  onAddFlowRule: (input: NewFlowRuleInput) => FlowRule;
  onUpdateFlowRule: (id: string, updates: Partial<FlowRule>) => void;
  onToggleFlowRule: (id: string) => void;
  onDeleteFlowRule: (id: string) => void;
  onDuplicateFlowRule: (id: string) => void;
  onSetFlowRules: (rules: FlowRule[]) => void;
  onToast?: (message: string) => void;
}

export const AppAutomationReportDialogs: React.FC<AppAutomationReportDialogsProps> = ({
  board,
  allBoardTasks,
  filteredTasks,
  mikaInsights,
  hasActiveFilters,
  isExportModalOpen,
  onCloseExportModal,
  headerPrintSnapshot,
  onCloseHeaderPrint,
  onGeneratePdf,
  isFlowRulesModalOpen,
  onCloseFlowRulesModal,
  activeBoardId,
  flowRules,
  onAddFlowRule,
  onUpdateFlowRule,
  onToggleFlowRule,
  onDeleteFlowRule,
  onDuplicateFlowRule,
  onSetFlowRules,
  onToast,
}) => {
  return (
    <>
      {/* Modal de Exportação de Relatórios disparado pelo AppHeaderBar (Feature 051) */}
      {board && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          onClose={onCloseExportModal}
          board={board as unknown as ReportBoardLike}
          tasks={allBoardTasks}
          filteredTasks={filteredTasks}
          mikaInsights={mikaInsights}
          hasActiveFilters={hasActiveFilters}
          activeDateFilterLabel={
            hasActiveFilters ? 'Filtros do Quadro Ativos' : 'Todos os dados do quadro'
          }
          onGeneratePdf={onGeneratePdf}
        />
      )}

      {/* Visualização de Impressão Executiva disparada pelo AppHeaderBar */}
      {headerPrintSnapshot && (
        <ExecutiveReportPrintView
          snapshot={headerPrintSnapshot}
          onClose={onCloseHeaderPrint}
          autoPrint={true}
        />
      )}

      {/* Modal de Regras de Fluxo e Automações (Feature 053) */}
      <FlowRulesModal
        isOpen={isFlowRulesModalOpen}
        onClose={onCloseFlowRulesModal}
        boardId={activeBoardId}
        columns={board.columns}
        rules={flowRules}
        onAddRule={onAddFlowRule}
        onUpdateRule={onUpdateFlowRule}
        onToggleRule={onToggleFlowRule}
        onDeleteRule={onDeleteFlowRule}
        onDuplicateRule={onDuplicateFlowRule}
        onSetRules={onSetFlowRules}
        onToast={onToast}
      />
    </>
  );
};
