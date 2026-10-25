import { useState, useCallback } from 'react';

export function useAppModals() {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
  const [isSprintManagerOpen, setIsSprintManagerOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
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

    selectedTaskId,
    setSelectedTaskId,
    closeTaskModal,

    toastMessage,
    setToastMessage,
    closeToast,
  };
}
