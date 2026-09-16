import React from 'react';

interface DataPortabilityTabProps {
  onExportData: () => void;
  onImportData: () => void;
  onClearTasks: () => void;
}

export const DataPortabilityTab: React.FC<DataPortabilityTabProps> = ({
  onExportData,
  onImportData,
  onClearTasks,
}) => {
  return (
    <div className="settings-tab-panel" role="tabpanel" aria-label="Portabilidade & Dados">
      <div className="settings-panel-header">
        <h3 className="settings-panel-title">Portabilidade, Backup & Soberania de Dados</h3>
        <p className="settings-panel-desc">
          Controle total dos seus dados. Exportação e restauração local no formato JSON aberto.
        </p>
      </div>

      {/* Seção 1: Backup e Exportação */}
      <section className="settings-section">
        <h4 className="settings-section-title">Exportar Backup JSON</h4>
        <p className="settings-section-desc">
          Faça o download de todos os quadros, tarefas, configurações e métricas em um arquivo estruturado.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onExportData}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar Arquivo de Backup
        </button>
      </section>

      {/* Seção 2: Importação e Restauração */}
      <section className="settings-section">
        <h4 className="settings-section-title">Importar Arquivo de Backup</h4>
        <p className="settings-section-desc">
          Carregue um arquivo JSON previamente exportado para restaurar ou migrar seus quadros de tarefas.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onImportData}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Selecionar Arquivo JSON
        </button>
      </section>

      {/* Seção 3: Zona de Perigo / Limpeza */}
      <section className="settings-section danger-zone">
        <h4 className="settings-section-title text-danger">Zona Crítica</h4>
        <div className="danger-card">
          <div>
            <strong>Limpar Todas as Tarefas do Quadro Ativo</strong>
            <p>Remove permanentemente as tarefas do quadro em foco. Esta operação é irreversível.</p>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onClearTasks}
          >
            Limpar Tarefas
          </button>
        </div>
      </section>
    </div>
  );
};
