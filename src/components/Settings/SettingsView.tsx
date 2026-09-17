import React, { useState } from 'react';
import { AppSettings, Workspace } from '../../types/workspace';
import { Team, User } from '../../types/team';
import { BoardModel, BoardState } from '../../types/kanban';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { WorkspacesSettingsTab } from './WorkspacesSettingsTab';
import { BoardPoliciesTab } from './BoardPoliciesTab';
import { DataPortabilityTab } from './DataPortabilityTab';
import { CloudSyncTab } from './CloudSyncTab';

export type SettingsTabId = 'general' | 'workspaces' | 'policies' | 'data' | 'cloud';

export interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  workspaces: Workspace[];
  onUpdateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  onCreateWorkspace?: () => void;
  boards?: BoardModel[];
  teams: Team[];
  users: User[];
  onBackToBoard: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onClearTasks: () => void;
  onShowToast?: (message: string, type: 'success' | 'warning' | 'error') => void;
  onApplyRemoteData?: (payload: {
    workspaces: Workspace[];
    boards: BoardModel[];
    tasksByBoardId: Record<string, BoardState>;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  workspaces,
  onUpdateWorkspace,
  onCreateWorkspace,
  boards = [],
  teams,
  users,
  onBackToBoard,
  onExportData,
  onImportData,
  onClearTasks,
  onShowToast,
  onApplyRemoteData,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

  return (
    <div className="settings-view-container" role="main" aria-label="Tela de Configurações">
      {/* Cabeçalho da Tela de Configurações */}
      <div className="settings-view-header">
        <div className="settings-header-left">
          <button
            type="button"
            className="settings-back-btn"
            onClick={onBackToBoard}
            aria-label="Voltar ao Quadro"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Voltar ao Quadro</span>
          </button>
          <div>
            <h2 className="settings-view-title">Configurações do Sistema</h2>
            <p className="settings-view-subtitle">
              Administração de preferências, espaços de trabalho, políticas de fluxo e dados.
            </p>
          </div>
        </div>
      </div>

      {/* Layout em 2 Colunas */}
      <div className="settings-layout-grid">
        {/* Coluna Esquerda: Navegação de Abas */}
        <aside className="settings-nav-column" aria-label="Categorias de Configuração">
          <nav className="settings-nav-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              id="tab-general"
              aria-controls="panel-general"
              aria-selected={activeTab === 'general'}
              className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <span className="tab-icon" aria-hidden="true">⚙️</span>
              <span className="tab-text">Geral & Aparência</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-workspaces"
              aria-controls="panel-workspaces"
              aria-selected={activeTab === 'workspaces'}
              className={`settings-tab-btn ${activeTab === 'workspaces' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspaces')}
            >
              <span className="tab-icon" aria-hidden="true">🏢</span>
              <span className="tab-text">Espaços & Squads</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-policies"
              aria-controls="panel-policies"
              aria-selected={activeTab === 'policies'}
              className={`settings-tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
            >
              <span className="tab-icon" aria-hidden="true">📊</span>
              <span className="tab-text">Políticas de Fluxo</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-data"
              aria-controls="panel-data"
              aria-selected={activeTab === 'data'}
              className={`settings-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <span className="tab-icon" aria-hidden="true">💾</span>
              <span className="tab-text">Portabilidade & Dados</span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-cloud"
              aria-controls="panel-cloud"
              aria-selected={activeTab === 'cloud'}
              className={`settings-tab-btn ${activeTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveTab('cloud')}
            >
              <span className="tab-icon" aria-hidden="true">☁️</span>
              <span className="tab-text">Nuvem & Supabase</span>
            </button>
          </nav>
        </aside>

        {/* Coluna Direita: Conteúdo da Aba Ativa */}
        <main className="settings-content-column">
          {activeTab === 'general' && (
            <GeneralSettingsTab
              settings={settings}
              onUpdateSettings={onUpdateSettings}
            />
          )}

          {activeTab === 'workspaces' && (
            <WorkspacesSettingsTab
              workspaces={workspaces}
              onUpdateWorkspace={onUpdateWorkspace}
              onCreateWorkspace={onCreateWorkspace}
              teams={teams}
              users={users}
            />
          )}

          {activeTab === 'policies' && (
            <BoardPoliciesTab
              showWipLimits={settings.showWipLimits}
              onToggleWipLimits={(enabled) =>
                onUpdateSettings({ showWipLimits: enabled })
              }
            />
          )}

          {activeTab === 'data' && (
            <DataPortabilityTab
              onExportData={onExportData}
              onImportData={onImportData}
              onClearTasks={onClearTasks}
            />
          )}

          {activeTab === 'cloud' && (
            <CloudSyncTab
              workspaces={workspaces}
              boards={boards}
              onShowToast={onShowToast}
              onApplyRemoteData={onApplyRemoteData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
