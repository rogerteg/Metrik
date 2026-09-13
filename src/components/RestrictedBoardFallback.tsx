import React from 'react';

export interface RestrictedBoardFallbackProps {
  teamName?: string;
  onRedirectDefault: () => void;
  onOpenJoinCode?: () => void;
}

export const RestrictedBoardFallback: React.FC<RestrictedBoardFallbackProps> = ({
  teamName,
  onRedirectDefault,
  onOpenJoinCode,
}) => {
  return (
    <div className="restricted-board-container" role="alert" aria-live="polite">
      <div className="restricted-board-card">
        <div className="restricted-board-icon" aria-hidden="true">
          🔒
        </div>
        <h2 className="restricted-board-title">Acesso Restrito: Requer Convite da Squad</h2>
        <p className="restricted-board-description">
          Este quadro Kanban pertence à <strong>{teamName || 'uma Squad específica'}</strong> e não está acessível
          para o seu usuário atual. Membros de outros times não possuem visibilidade sobre os cartões e métricas
          desta equipe a menos que sejam formalmente convidados.
        </p>

        <div className="restricted-board-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRedirectDefault}
          >
            Voltar para Meu Quadro Principal
          </button>
          {onOpenJoinCode && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenJoinCode}
            >
              Inserir Código de Convite
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
