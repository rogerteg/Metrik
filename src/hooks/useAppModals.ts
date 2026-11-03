import { useState, useCallback } from 'react';
import { FlowReportSnapshot } from '../types/reports';

export function useAppModals() {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
  const [isSprintManagerOpen, setIsSprintManagerOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFlowRulesModalOpen, setIsFlowRulesModalOpen] = useState(false);
  const [headerPrintSnapshot, setHeaderPrintSnapshot] = useState<FlowReportSnapshot | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openTeamModal = useCallback(() => setIsTeamModalOpen(true), []);
  const closeTeamModal = useCallback(() => setIsTeamModalOpen(false), []);

  const openBoardModal = useCallback(() => setIsBoardModalOpen(true), []);
  const closeBoardModal = useCallback(() => setIsBoardModalOpen(false), []);

  const openNewColumnModal = useCallback(() => setIsNewColumnModalOpen(true), []);
  const closeNewColumnModal = useCallback(() => setIsNewColumnModalOpen(false), []);

  const openSprintManager = useCallback(() => setIsSprintManagerOpen(true), []);
  const closeSprintManager = useCallback(() => setIsSprintManagerOpen(false), []);

  const openCreateWorkspaceModal = useCallback(() => setIsCreateWorkspaceModalOpen(true), []);
  const closeCreateWorkspaceModal = useCallback(() => setIsCreateWorkspaceModalOpen(false), []);

  const openExportModal = useCallback(() => setIsExportModalOpen(true), []);
  const closeExportModal = useCallback(() => setIsExportModalOpen(false), []);

  const openFlowRulesModal = useCallback(() => setIsFlowRulesModalOpen(true), []);
  const closeFlowRulesModal = useCallback(() => setIsFlowRulesModalOpen(false), []);

  const closeTaskModal = useCallback(() => setSelectedTaskId(null), []);
  const closeToast = useCallback(() => setToastMessage(null), []);

  return {
    isTeamModalOpen,
    openTeamModal,
    closeTeamModal,

    isBoardModalOpen,
    openBoardModal,
    closeBoardModal,

    isNewColumnModalOpen,
    openNewColumnModal,
    closeNewColumnModal,

    isSprintManagerOpen,
    openSprintManager,
    closeSprintManager,

    isCreateWorkspaceModalOpen,
    openCreateWorkspaceModal,
    closeCreateWorkspaceModal,

    isExportModalOpen,
    openExportModal,
    closeExportModal,

    isFlowRulesModalOpen,
    openFlowRulesModal,
    closeFlowRulesModal,

    headerPrintSnapshot,
    setHeaderPrintSnapshot,

    selectedTaskId,
    setSelectedTaskId,
    closeTaskModal,

    toastMessage,
    setToastMessage,
    closeToast,
  };
}
