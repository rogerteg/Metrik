import React, { useState, useMemo } from 'react';
import { BoardModel } from '../../types/kanban';
import { Team, User } from '../../types/team';
import { BoardViewMode, DeleteBoardModalState } from '../../types/boardManagement';
import { computeBoardSummaryMetrics } from '../../utils/boardMetrics';
import { BoardCardGrid } from './BoardCardGrid';
import { BoardTableView } from './BoardTableView';
import { DeleteBoardModal } from './DeleteBoardModal';
import './ManageBoards.css';

export interface ManageBoardsViewProps {
  /** Lista completa de quadros acessíveis pelo usuário ativo */
  boards: BoardModel[];
  /** Identificador do quadro atualmente ativo */
  activeBoardId: string | null;
  /** Lista de squads/times disponíveis */
  teams: Team[];
  /** Usuário atualmente autenticado/selecionado na sessão */
  activeUser?: User | null;
  /** Callback para selecionar e alternar para o quadro desejado */
  onSelectBoard: (boardId: string) => void;
  /** Callback para criar um novo quadro (com nome e squad opcional) */
  onCreateBoard: (name: string, teamId?: string) => void;
  /** Callback para renomear um quadro */
  onRenameBoard: (boardId: string, newName: string) => void;
  /** Callback para excluir permanentemente um quadro */
  onDeleteBoard: (boardId: string) => void;
  /** Callback para navegar diretamente para os gráficos analíticos do quadro */
  onOpenAnalytics?: (boardId: string) => void;
}

const VIEW_MODE_STORAGE_KEY = 'metrik-manage-boards-viewmode';

export const ManageBoardsView: React.FC<ManageBoardsViewProps> = ({
  boards,
  activeBoardId,
  teams,
  activeUser,
  onSelectBoard,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
  onOpenAnalytics,
}) => {
  // Identificar se usuário ativo possui papel de convidado
  const isGuest = useMemo(() => {
    if (!activeUser) return false;
    return teams.some((t) =>
      t.members?.some((m) => m.userId === activeUser.id && m.role === 'guest')
    );
  }, [activeUser, teams]);

  // Modo de visualização dual (Grade ou Tabela)
  const [viewMode, setViewMode] = useState<BoardViewMode>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === 'grid' || saved === 'table') return saved;
    }
    return 'grid';
  });

  // Salvar preferência de modo
  const handleViewModeChange = (mode: BoardViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    }
  };

  // Filtros de busca e squad
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | 'all'>('all');

  // Formulário de criação rápida
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardTeamId, setNewBoardTeamId] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Estado do modal de exclusão segura
  const [deleteModalState, setDeleteModalState] = useState<DeleteBoardModalState>({
    isOpen: false,
    targetBoardId: null,
    targetBoardName: '',
    tasksCount: 0,
    isSoleBoard: false,
  });

  // Filtragem instantânea dos quadros
  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      const matchesQuery = board.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesTeam = selectedTeamId === 'all' || board.teamId === selectedTeamId;
      return matchesQuery && matchesTeam;
    });
  }, [boards, searchQuery, selectedTeamId]);

  // Estatísticas globais do header hero
  const totalStats = useMemo(() => {
    let totalTasks = 0;
    let totalWip = 0;
    for (const board of boards) {
      const metrics = computeBoardSummaryMetrics(board, activeBoardId);
      totalTasks += metrics.totalTasksCount;
      totalWip += metrics.wipTasksCount;
    }
    return {
      totalBoards: boards.length,
      totalTasks,
      totalWip,
    };
  }, [boards, activeBoardId]);

  // Abertura do modal de exclusão segura
  const handleRequestDelete = (boardId: string, boardName: string) => {
    const isSoleBoard = boards.length <= 1;
    const targetBoard = boards.find((b) => b.id === boardId);
    const metrics = targetBoard
      ? computeBoardSummaryMetrics(targetBoard, activeBoardId)
      : { totalTasksCount: 0 };

    setDeleteModalState({
      isOpen: true,
      targetBoardId: boardId,
      targetBoardName: boardName,
      tasksCount: metrics.totalTasksCount,
      isSoleBoard,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModalState.targetBoardId && !deleteModalState.isSoleBoard) {
      onDeleteBoard(deleteModalState.targetBoardId);
    }
    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Submissão do novo quadro
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBoardName.trim();
    if (!trimmed) {
      setCreateError('O nome do quadro não pode estar vazio.');
      return;
    }

    setCreateError(null);
    onCreateBoard(trimmed, newBoardTeamId || undefined);
    setNewBoardName('');
    setNewBoardTeamId('');
  };

  return (
    <div className="manage-boards-container" role="main" aria-label="Gerenciamento de Quadros">
      {/* Hero Header Corporativo */}
      <header className="manage-boards-hero">
        <div className="hero-content">
          <div className="hero-badge">Central de Governança</div>
          <h1 className="hero-title">Gerenciar Quadros</h1>
          <p className="hero-subtitle">
            Visualize telemetria de fluxo em tempo real, gerencie quadros por Squad e alterne
            instantaneamente entre espaços de trabalho.
          </p>
        </div>

        {/* Contadores Globais */}
        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <span className="stat-label">Quadros Acessíveis</span>
            <span className="stat-value">{totalStats.totalBoards}</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-label">Total de Tarefas</span>
            <span className="stat-value">{totalStats.totalTasks}</span>
          </div>
          <div className="hero-stat-card stat-highlight">
            <span className="stat-label">Tarefas em Andamento</span>
            <span className="stat-value">{totalStats.totalWip}</span>
          </div>
        </div>
      </header>

      {/* Painel de Criação Rápida */}
      <section className="manage-boards-create-section" aria-labelledby="create-board-heading">
        <h2 id="create-board-heading" className="section-title">Criar Novo Quadro</h2>
        <form className="create-board-form" onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="manage-input board-name-input"
              placeholder="Nome do novo quadro..."
              value={newBoardName}
              onChange={(e) => {
                setNewBoardName(e.target.value);
                if (createError) setCreateError(null);
              }}
              aria-label="Nome do novo quadro"
            />
          </div>

          <div className="form-group">
            <select
              className="manage-select squad-select"
              value={newBoardTeamId}
              onChange={(e) => setNewBoardTeamId(e.target.value)}
              aria-label="Selecionar squad do quadro"
            >
              <option value="">Sem Squad (Geral)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="manage-btn manage-btn-primary">
            + Criar Quadro
          </button>
        </form>
        {createError && <p className="create-error-text" role="alert">{createError}</p>}
      </section>

      {/* Barra de Filtros & Alternador Dual Grade/Tabela */}
      <section className="manage-boards-toolbar" aria-label="Filtros e Visualização">
        <div className="toolbar-filters">
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="manage-input search-input"
              placeholder="Buscar quadro por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar quadro por nome"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-team-box">
            <label htmlFor="filter-squad-select" className="filter-label">Squad:</label>
            <select
              id="filter-squad-select"
              className="manage-select"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="all">Todas as Squads ({boards.length})</option>
              {teams.map((t) => {
                const count = boards.filter((b) => b.teamId === t.id).length;
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Alternador Dual de Visualização */}
        <div className="toolbar-view-toggle" role="radiogroup" aria-label="Modo de Visualização">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('grid')}
            role="radio"
            aria-checked={viewMode === 'grid'}
            title="Visualização em Grade de Cartões"
          >
            <span className="mode-icon">▦</span> Grade
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('table')}
            role="radio"
            aria-checked={viewMode === 'table'}
            title="Visualização em Tabela de Alta Densidade"
          >
            <span className="mode-icon">▤</span> Tabela
          </button>
        </div>
      </section>

      {/* Exibição Principal: Grade ou Tabela */}
      <section className="manage-boards-view-canvas">
        {viewMode === 'grid' ? (
          <BoardCardGrid
            boards={filteredBoards}
            activeBoardId={activeBoardId}
            teams={teams}
            onSelectBoard={onSelectBoard}
            onRenameBoard={onRenameBoard}
            onRequestDeleteBoard={handleRequestDelete}
            onOpenAnalytics={onOpenAnalytics}
            isGuest={isGuest}
          />
        ) : (
          <BoardTableView
            boards={filteredBoards}
            activeBoardId={activeBoardId}
            teams={teams}
            onSelectBoard={onSelectBoard}
            onRenameBoard={onRenameBoard}
            onRequestDeleteBoard={handleRequestDelete}
            onOpenAnalytics={onOpenAnalytics}
            isGuest={isGuest}
          />
        )}
      </section>

      {/* Modal de Exclusão Segura */}
      <DeleteBoardModal
        isOpen={deleteModalState.isOpen}
        boardName={deleteModalState.targetBoardName}
        tasksCount={deleteModalState.tasksCount}
        isSoleBoard={deleteModalState.isSoleBoard}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
