import React from 'react';
import { AppSettings } from '../../types/workspace';

interface GeneralSettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="settings-tab-panel" role="tabpanel" aria-label="Geral & Aparência">
      <div className="settings-panel-header">
        <h3 className="settings-panel-title">Geral & Aparência</h3>
        <p className="settings-panel-desc">
          Personalize temas visuais, densidade de informações e preferências de inicialização.
        </p>
      </div>

      {/* Seção 1: Tema Visual */}
      <section className="settings-section">
        <h4 className="settings-section-title">Tema Visual</h4>
        <p className="settings-section-desc">
          Escolha a paleta cromática ideal para o seu ambiente de trabalho.
        </p>

        <div className="theme-options-grid">
          <button
            type="button"
            className={`theme-option-card ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            aria-label="Tema Escuro"
          >
            <div className="theme-preview dark-preview">
              <span className="preview-dot dot-cyan" />
              <span className="preview-dot dot-yellow" />
            </div>
            <span className="theme-option-label">Escuro (Dark)</span>
          </button>

          <button
            type="button"
            className={`theme-option-card ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ theme: 'light' })}
            aria-label="Tema Claro"
          >
            <div className="theme-preview light-preview">
              <span className="preview-dot dot-blue" />
              <span className="preview-dot dot-green" />
            </div>
            <span className="theme-option-label">Claro (Light)</span>
          </button>

          <button
            type="button"
            className={`theme-option-card ${settings.theme === 'slate' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ theme: 'slate' })}
            aria-label="Tema Ardósia"
          >
            <div className="theme-preview slate-preview">
              <span className="preview-dot dot-slate" />
              <span className="preview-dot dot-teal" />
            </div>
            <span className="theme-option-label">Ardósia (Slate)</span>
          </button>
        </div>
      </section>

      {/* Seção 2: Densidade de Layout */}
      <section className="settings-section">
        <h4 className="settings-section-title">Densidade da Interface</h4>
        <p className="settings-section-desc">
          Ajuste o espaçamento e tamanho dos cartões no quadro Kanban.
        </p>
        <div className="settings-toggle-group">
          <button
            type="button"
            className={`btn ${settings.density === 'comfortable' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateSettings({ density: 'comfortable' })}
          >
            Confortável (Padrão)
          </button>
          <button
            type="button"
            className={`btn ${settings.density === 'compact' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateSettings({ density: 'compact' })}
          >
            Compacta (Mais itens por tela)
          </button>
        </div>
      </section>

      {/* Seção 3: Visualização Padrão */}
      <section className="settings-section">
        <h4 className="settings-section-title">Visualização Padrão</h4>
        <p className="settings-section-desc">
          Tela inicial carregada ao abrir o Metrik.
        </p>
        <div className="settings-toggle-group">
          <button
            type="button"
            className={`btn ${settings.defaultView === 'board' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateSettings({ defaultView: 'board' })}
          >
            Quadro Kanban
          </button>
          <button
            type="button"
            className={`btn ${settings.defaultView === 'workspaces' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateSettings({ defaultView: 'workspaces' })}
          >
            Hub de Espaços
          </button>
          <button
            type="button"
            className={`btn ${settings.defaultView === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateSettings({ defaultView: 'analytics' })}
          >
            Analytics & Métricas
          </button>
        </div>
      </section>

      {/* Seção 4: Switches de Recursos Visuais */}
      <section className="settings-section">
        <h4 className="settings-section-title">Preferências Visuais de Fluxo</h4>
        <div className="settings-switches-list">
          <label className="settings-switch-label">
            <input
              type="checkbox"
              checked={settings.enableAnimations}
              onChange={(e) => onUpdateSettings({ enableAnimations: e.target.checked })}
            />
            <span className="switch-text">
              <strong>Habilitar micro-animações</strong>
              <small>Transições suaves ao mover tarefas e abrir modais</small>
            </span>
          </label>

          <label className="settings-switch-label">
            <input
              type="checkbox"
              checked={settings.showWipLimits}
              onChange={(e) => onUpdateSettings({ showWipLimits: e.target.checked })}
            />
            <span className="switch-text">
              <strong>Destacar limites de WIP nas colunas</strong>
              <small>Exibe alertas visuais quando colunas excedem o limite estabelecido</small>
            </span>
          </label>

          <label className="settings-switch-label">
            <input
              type="checkbox"
              checked={settings.showCycleTimeBadges}
              onChange={(e) => onUpdateSettings({ showCycleTimeBadges: e.target.checked })}
            />
            <span className="switch-text">
              <strong>Exibir badges de Lead Time e Cycle Time</strong>
              <small>Mostra tempo decorrido diretamente no rodapé dos cartões</small>
            </span>
          </label>
        </div>
      </section>
    </div>
  );
};
