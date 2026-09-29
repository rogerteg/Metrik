import React from 'react';
import { BoardModel } from '../types/kanban';
import { Team, User } from '../types/team';
import { ThemeMode } from '../types/theme';
import { BoardSwitcher } from './BoardSwitcher';
import { ThemeSelector } from './ThemeSelector';
import { UserProfileMenu } from './UserProfileMenu';
import metrikLogo from '../assets/metrik-logo.png';

export type AppView = 'workspaces' | 'board' | 'analytics' | 'manage' | 'settings';

export interface AppHeaderProps {
  boards: BoardModel[];
  activeBoardId: string | null;
  onSwitchBoard: (id: string) => void;
  teams: Team[];
  activeUserId: string;
  view: AppView;
  onSelectView: (view: AppView) => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  users: User[];
  activeUser: User | null;
  onSelectUser: (userId: string) => void;
  onCreateUser: (name: string, email: string) => void;
  onOpenTeamsModal: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportClick: () => void;
  onExport: () => void;
  onResetDemo: () => void;
  onClearBoard: () => void;
  isGuest: boolean;
}

/** Cabeçalho do aplicativo (extraído de App.tsx — P3/SRP). */
export const AppHeader: React.FC<AppHeaderProps> = ({
  boards,
  activeBoardId,
  onSwitchBoard,
  teams,
  activeUserId,
  view,
  onSelectView,
  theme,
  onSelectTheme,
  users,
  activeUser,
  onSelectUser,
  onCreateUser,
  onOpenTeamsModal,
  fileInputRef,
  onFileChange,
  onImportClick,
  onExport,
  onResetDemo,
  onClearBoard,
  isGuest,
}) => (
  <header className="app-header">
    <div className="brand-section" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="brand-logo-container" aria-label="Logotipo Metrik">
        <img src={metrikLogo} alt="Metrik — Métricas para Gestão Ágil" className="brand-logo-img" />
      </div>
      <div>
        <h1 className="brand-title">Metrik</h1>
        <p className="brand-subtitle">Métricas para Gestão Ágil</p>
      </div>

      <BoardSwitcher
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitchBoard={onSwitchBoard}
        teams={teams}
        activeUserId={activeUserId}
      />
    </div>

    <div className="header-actions">
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Cluster 1: Navegação & Tema */}
      <div className="header-cluster header-nav-cluster">
        <div className="view-toggle">
          <button
            type="button"
            className={`btn ${view === 'workspaces' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelectView('workspaces')}
          >
            Espaços
          </button>
          <button
            type="button"
            className={`btn ${view === 'board' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelectView('board')}
          >
            Quadro
          </button>
          <button
            type="button"
            className={`btn ${view === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelectView('analytics')}
          >
            Analytics
          </button>
          <button
            type="button"
            className={`btn ${view === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelectView('manage')}
          >
            Gerenciar
          </button>
        </div>

        <button
          type="button"
          className={`btn ${view === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-compact btn-settings-trigger`}
          onClick={() => onSelectView('settings')}
          aria-label="Configurações do Sistema"
          title="Abrir Configurações do Sistema"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 6 }}
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>Configurações</span>
        </button>

        <ThemeSelector currentTheme={theme} onSelectTheme={onSelectTheme} />
      </div>

      <div className="header-cluster-divider" aria-hidden="true" />

      {/* Cluster 2: Perfil & Sessão */}
      <div className="header-cluster header-session-cluster">
        <UserProfileMenu
          users={users}
          activeUser={activeUser}
          onSelectUser={onSelectUser}
          onCreateUser={onCreateUser}
          onOpenTeamsModal={onOpenTeamsModal}
          onOpenSettings={() => onSelectView('settings')}
        />
      </div>

      <div className="header-cluster-divider" aria-hidden="true" />

      {/* Cluster 3: Ações do Quadro */}
      <div className="header-cluster header-board-ops-cluster">
        {!isGuest && (
          <button
            type="button"
            className="btn btn-secondary btn-compact"
            onClick={onImportClick}
            aria-label="Importar Quadro"
            title="Importar dados do quadro a partir de um arquivo JSON"
          >
            Importar
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-compact"
          onClick={onExport}
          aria-label="Exportar Quadro"
          title="Exportar dados do quadro para um arquivo JSON"
        >
          Exportar
        </button>
        {!isGuest && (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              onClick={onResetDemo}
              aria-label="Restaurar Demo"
              title="Restaurar tarefas de demonstração"
            >
              Restaurar Demo
            </button>
            <button
              type="button"
              className="btn btn-danger btn-compact"
              onClick={onClearBoard}
              aria-label="Limpar Quadro"
              title="Limpar todas as tarefas do quadro"
            >
              Limpar Quadro
            </button>
          </>
        )}
      </div>
    </div>
  </header>
);
