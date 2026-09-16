import React from 'react';

interface BoardPoliciesTabProps {
  showWipLimits?: boolean;
  onToggleWipLimits?: (enabled: boolean) => void;
}

export const BoardPoliciesTab: React.FC<BoardPoliciesTabProps> = ({
  showWipLimits = true,
  onToggleWipLimits,
}) => {
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
          Controlar a quantidade de itens simultâneos em etapas ativas reduz o tempo de ciclo e elimina gargalos.
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
            Quando o número de cartões em uma coluna ultrapassa o limite definido pelo time, a coluna recebe um destaque visual de advertência âmbar/vermelho.
          </p>
        </div>
      </section>

      {/* Seção 2: Padrões de Colunas Recomendadas */}
      <section className="settings-section">
        <h4 className="settings-section-title">Estrutura Canônica de Colunas</h4>
        <div className="policy-columns-grid">
          <div className="policy-col-item">
            <span className="policy-col-cat cat-todo">A Fazer (Backlog)</span>
            <p>Itens priorizados aguardando início. Não há limite de WIP estrito, mas deve refletir compromissos do ciclo.</p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-progress">Em Andamento (WIP)</span>
            <p>Trabalho ativo. Limite recomendado: máximo de 1 a 2 itens por integrante da squad.</p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-review">Revisão / QA</span>
            <p>Garantia de qualidade e validação de critérios de aceite. Evite acumular itens para não bloquear a entrega.</p>
          </div>
          <div className="policy-col-item">
            <span className="policy-col-cat cat-done">Concluído (Done)</span>
            <p>Itens entregues em produção ou com valor real gerado. Base para cálculo de Throughput e Lead Time.</p>
          </div>
        </div>
      </section>

      {/* Seção 3: Boas Práticas Ágeis */}
      <section className="settings-section">
        <h4 className="settings-section-title">Princípios Ágeis Embutidos</h4>
        <ul className="settings-principles-list">
          <li>
            <strong>Puxar em vez de Empurrar:</strong> Integrantes só iniciam uma nova tarefa quando houver capacidade disponível na coluna seguinte.
          </li>
          <li>
            <strong>Parar para Corrigir:</strong> Tarefas bloqueadas têm prioridade absoluta de desbloqueio para evitar acúmulo de débito de fluxo.
          </li>
          <li>
            <strong>Transparência Local:</strong> Todos os dados de fluxo e métricas residem no navegador local, sem dependência de servidores externos.
          </li>
        </ul>
      </section>
    </div>
  );
};
