import React from 'react';
import { SleConfig } from '../../types/sle';

interface BoardPoliciesTabProps {
  showWipLimits?: boolean;
  onToggleWipLimits?: (enabled: boolean) => void;
  sleConfig?: SleConfig;
  onUpdateSleConfig?: (updates: Partial<Omit<SleConfig, 'boardId'>>) => void;
  onResetSleConfig?: () => void;
}

export const BoardPoliciesTab: React.FC<BoardPoliciesTabProps> = ({
  showWipLimits = true,
  onToggleWipLimits,
  sleConfig,
  onUpdateSleConfig,
  onResetSleConfig,
}) => {
  const handleTargetDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUpdateSleConfig) return;
    const val = e.target.value.trim();
    if (!val) {
      onUpdateSleConfig({ customTargetDays: null });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onUpdateSleConfig({ customTargetDays: num });
    }
  };

  return (
    <div className="settings-tab-panel" role="tabpanel" aria-label="Políticas de Fluxo">
      <div className="settings-panel-header">
        <h3 className="settings-panel-title">Políticas de Fluxo & Governança</h3>
        <p className="settings-panel-desc">
          Diretrizes ágeis baseadas na Lei de Little para otimizar Throughput, Cycle Time e WIP.
        </p>
      </div>

      {/* Seção 1: Limites de WIP */}
      <section className="settings-section">
        <h4 className="settings-section-title">Limites de Trabalho em Progresso (WIP)</h4>
        <p className="settings-section-desc">
          Controlar a quantidade de itens simultâneos em etapas ativas reduz o tempo de ciclo e
          elimina gargalos.
        </p>

        <div className="policy-rule-card">
          <div className="policy-rule-header">
            <strong>Alerta Visual de Estouro de WIP</strong>
            {onToggleWipLimits && (
              <label className="settings-switch-label inline">
                <input
                  type="checkbox"
                  checked={showWipLimits}
                  onChange={(e) => onToggleWipLimits(e.target.checked)}
                />
                <span className="switch-text">{showWipLimits ? 'Ativo' : 'Inativo'}</span>
              </label>
            )}
          </div>
          <p className="policy-rule-desc">
            Quando o número de cartões em uma coluna ultrapassa o limite definido pelo time, a
            coluna recebe um destaque visual de advertência âmbar/vermelho.
          </p>
        </div>
      </section>

      {/* Seção 2: Previsibilidade Dinâmica & Alertas de SLE (Feature 054) */}
      <section className="settings-section">
        <h4 className="settings-section-title">
          Expectativa de Nível de Serviço (SLE) & Previsibilidade
        </h4>
        <p className="settings-section-desc">
          Sinalização preditiva nos cartões antes do estouro dos percentis históricos de tempo de
          ciclo (P50, P85, P95).
        </p>

        <div className="policy-rule-card" style={{ marginBottom: '12px' }}>
          <div className="policy-rule-header">
            <strong>Meta Estipulada em Dias (SLE Fixo)</strong>
          </div>
          <p className="policy-rule-desc">
            Define um valor de dias fixos como meta de SLE da equipe, substituindo o percentil P85
            observado automaticamente.
          </p>
          <div style={{ marginTop: '8px' }}>
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Ex: 4.5 (deixe em branco para usar o P85 observado)"
              value={sleConfig?.customTargetDays ?? ''}
              onChange={handleTargetDaysChange}
              disabled={!onUpdateSleConfig}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                fontSize: '0.8125rem',
              }}
            />
          </div>
        </div>

        <div className="policy-rule-card" style={{ marginBottom: '12px' }}>
          <div className="policy-rule-header">
            <strong>Alerta Preventivo de Mediana (P50)</strong>
            <label className="settings-switch-label inline">
              <input
                type="checkbox"
                aria-label="Alerta Preventivo de Mediana (P50)"
                checked={sleConfig?.enableP50Alert !== false}
                disabled={!onUpdateSleConfig}
                onChange={(e) => onUpdateSleConfig?.({ enableP50Alert: e.target.checked })}
              />
              <span className="switch-text">
                {sleConfig?.enableP50Alert !== false ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>
          <p className="policy-rule-desc">
            Exibe o badge amarelo de atenção quando o envelhecimento do cartão ultrapassar o tempo
            mediano das tarefas concluídas do time.
          </p>
        </div>

        <div className="policy-rule-card" style={{ marginBottom: '12px' }}>
          <div className="policy-rule-header">
            <strong>Alerta Crítico de Cauda Longa (P95)</strong>
            <label className="settings-switch-label inline">
              <input
                type="checkbox"
                aria-label="Alerta Crítico de Cauda Longa (P95)"
                checked={sleConfig?.enableP95Alert !== false}
                disabled={!onUpdateSleConfig}
                onChange={(e) => onUpdateSleConfig?.({ enableP95Alert: e.target.checked })}
              />
              <span className="switch-text">
                {sleConfig?.enableP95Alert !== false ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>
          <p className="policy-rule-desc">
            Exibe destaque e pulso vermelho de advertência quando o tempo decorrido ultrapassar o
            percentil de 95% do histórico.
          </p>
        </div>

        {onResetSleConfig && (
          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onResetSleConfig}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Restaurar Padrões de SLE
            </button>
          </div>
        )}
      </section>

      {/* Seção 3: Padrões de Colunas Recomendadas */}
      <section className="settings-section">
        <h4 className="settings-section-title">Estrutura Canônica de Colunas</h4>
        <div className="policy-columns-grid">
          <div className="policy-col-item">
            <span className="policy-col-cat cat-todo">A Fazer (Backlog)</span>
            <p>
              Itens priorizados aguardando início. Não há limite de WIP estrito, mas deve refletir
              compromissos do ciclo.
            </p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-progress">Em Andamento (WIP)</span>
            <p>
              Trabalho ativo. Limite recomendado: máximo de 1 a 2 itens por integrante da squad.
            </p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-review">Revisão / QA</span>
            <p>
              Garantia de qualidade e validação de critérios de aceite. Evite acumular itens para
              não bloquear a entrega.
            </p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-done">Concluído (Done)</span>
            <p>
              Itens entregues em produção ou com valor real gerado. Base para cálculo de Throughput
              e Lead Time.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 4: Boas Práticas Ágeis */}
      <section className="settings-section">
        <h4 className="settings-section-title">Princípios Ágeis Embutidos</h4>
        <ul className="settings-principles-list">
          <li>
            <strong>Puxar em vez de Empurrar:</strong> Integrantes só iniciam uma nova tarefa quando
            houver capacidade disponível na coluna seguinte.
          </li>
          <li>
            <strong>Parar para Corrigir:</strong> Tarefas bloqueadas têm prioridade absoluta de
            desbloqueio para evitar acúmulo de débito de fluxo.
          </li>
          <li>
            <strong>Transparência Local:</strong> Todos os dados de fluxo e métricas residem no
            navegador local, sem dependência de servidores externos.
          </li>
        </ul>
      </section>
    </div>
  );
};
