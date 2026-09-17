import React from 'react';
import { DatasetFilterConfig, DatasetTimeWindow } from '../types/analytics';

export interface DatasetConfigurationDrawerProps {
  /** Estado de visibilidade da gaveta retrátil */
  isOpen: boolean;
  /** Callback para fechar a gaveta */
  onClose: () => void;
  /** Configuração ativa de filtros do conjunto de dados */
  config: DatasetFilterConfig;
  /** Callback para atualizar parâmetros da configuração */
  onUpdateConfig: (patch: Partial<DatasetFilterConfig>) => void;
  /** Callback para redefinir aos padrões do quadro */
  onResetToDefaults: () => void;
}

export const DatasetConfigurationDrawer: React.FC<DatasetConfigurationDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetToDefaults,
}) => {
  if (!isOpen) {
    return null;
  }

  const timeWindows: { label: string; value: DatasetTimeWindow; testId: string }[] = [
    { label: '14 dias', value: 14, testId: 'window-btn-14' },
    { label: '30 dias', value: 30, testId: 'window-btn-30' },
    { label: '90 dias', value: 90, testId: 'window-btn-90' },
    { label: '180 dias', value: 180, testId: 'window-btn-180' },
    { label: 'Todo o histórico', value: 'all', testId: 'window-btn-all' },
    { label: 'Personalizado', value: 'custom', testId: 'window-btn-custom' },
  ];

  const handleTimeWindowSelect = (window: DatasetTimeWindow) => {
    onUpdateConfig({ timeWindow: window });
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = config.selectedTypes || ['card', 'subtask', 'initiative'];
    const exists = currentTypes.includes(type);
    let updatedTypes: string[];

    if (exists) {
      // Garantir que não remove todos os tipos
      if (currentTypes.length > 1) {
        updatedTypes = currentTypes.filter((t) => t !== type);
      } else {
        return; // não permite lista vazia
      }
    } else {
      updatedTypes = [...currentTypes, type];
    }

    onUpdateConfig({ selectedTypes: updatedTypes });
  };

  const isTypeSelected = (type: string) => {
    if (!config.selectedTypes || config.selectedTypes.length === 0) return true;
    return config.selectedTypes.includes(type);
  };

  return (
    <div
      className="dataset-drawer-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Configuração do Conjunto de Dados"
    >
      <div className="dataset-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho da Gaveta */}
        <div className="dataset-drawer-header">
          <div className="drawer-header-titles">
            <h2 className="drawer-title">Configuração do Conjunto de Dados</h2>
            <p className="drawer-subtitle">
              Ajuste o escopo amostral e selecione os tipos de cartões analisados nos gráficos.
            </p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Fechar painel de dados"
          >
            ✕
          </button>
        </div>

        {/* Corpo da Gaveta */}
        <div className="dataset-drawer-body">
          {/* Seção 1: Janela Temporal */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Janela Temporal de Amostragem</h3>
            <p className="drawer-section-hint">
              Recorta o período de dados históricos para isolar sazonalidades e ciclos recentes.
            </p>

            <div className="drawer-window-chips-grid">
              {timeWindows.map((tw) => (
                <button
                  key={tw.value}
                  type="button"
                  className={`drawer-window-chip ${config.timeWindow === tw.value ? 'is-selected' : ''}`}
                  onClick={() => handleTimeWindowSelect(tw.value)}
                  data-testid={tw.testId}
                >
                  {tw.label}
                </button>
              ))}
            </div>

            {/* Campos de intervalo customizado */}
            {config.timeWindow === 'custom' && (
              <div className="drawer-custom-dates-row">
                <div className="custom-date-field">
                  <label htmlFor="custom-start-date">Data Inicial</label>
                  <input
                    id="custom-start-date"
                    type="date"
                    value={config.customStartDate || ''}
                    onChange={(e) => onUpdateConfig({ customStartDate: e.target.value })}
                  />
                </div>
                <div className="custom-date-field">
                  <label htmlFor="custom-end-date">Data Final</label>
                  <input
                    id="custom-end-date"
                    type="date"
                    value={config.customEndDate || ''}
                    onChange={(e) => onUpdateConfig({ customEndDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Tipos de Item */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Tipos de Cartão Analisados</h3>
            <p className="drawer-section-hint">
              Filtre quais níveis de trabalho devem compor o cálculo das métricas.
            </p>

            <div className="drawer-types-list">
              <label className="drawer-type-checkbox-label">
                <input
                  type="checkbox"
                  checked={isTypeSelected('card')}
                  onChange={() => handleTypeToggle('card')}
                />
                <span className="type-name">📄 Cartões / Histórias Padrão</span>
              </label>

              <label className="drawer-type-checkbox-label">
                <input
                  type="checkbox"
                  checked={isTypeSelected('subtask')}
                  onChange={() => handleTypeToggle('subtask')}
                />
                <span className="type-name">🧩 Subtarefas Técnicas</span>
              </label>

              <label className="drawer-type-checkbox-label">
                <input
                  type="checkbox"
                  checked={isTypeSelected('initiative')}
                  onChange={() => handleTypeToggle('initiative')}
                />
                <span className="type-name">🚀 Iniciativas & Épicos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="dataset-drawer-footer">
          <button
            type="button"
            className="drawer-btn-reset"
            onClick={onResetToDefaults}
          >
            Redefinir aos Padrões
          </button>
          <button
            type="button"
            className="drawer-btn-apply"
            onClick={onClose}
          >
            Concluir e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
