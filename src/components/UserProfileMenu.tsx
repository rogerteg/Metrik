import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types/team';

interface UserProfileMenuProps {
  users: User[];
  activeUser: User | null;
  onSelectUser: (userId: string) => void;
  onCreateUser: (name: string, email: string) => void;
  onOpenTeamsModal?: () => void;
  onOpenSettings?: () => void;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  users,
  activeUser,
  onSelectUser,
  onCreateUser,
  onOpenTeamsModal,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreatingUser(false);
        setErrorMessage('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsCreatingUser(false);
        setErrorMessage('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newName.trim()) {
      setErrorMessage('Nome completo é obrigatório.');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    try {
      onCreateUser(newName.trim(), newEmail.trim());
      setNewName('');
      setNewEmail('');
      setIsCreatingUser(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cadastrar usuário.');
    }
  };

  const displayName = activeUser ? activeUser.name : 'Convidado';
  const initials = activeUser ? getInitials(activeUser.name) : '??';

  return (
    <div className="user-profile-menu-container" ref={containerRef}>
      <button
        type="button"
        className="user-profile-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Perfil de ${displayName}`}
        title={`Usuário ativo: ${displayName} (${activeUser?.email || ''})`}
      >
        <span className="user-avatar-badge" aria-hidden="true">
          {initials}
        </span>
        <span className="user-name-text">{displayName}</span>
        <span className="user-menu-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown" role="menu">
          <div className="user-profile-dropdown-header">
            <div className="dropdown-title">Perfis de Usuário</div>
            <div className="dropdown-subtitle">Alterne o operador ativo do Metrik</div>
          </div>

          <div className="user-profile-list">
            {users.map((u) => {
              const isActive = activeUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  className={`user-profile-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectUser(u.id);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <span className="user-item-initials">{getInitials(u.name)}</span>
                  <div className="user-item-info">
                    <span className="user-item-name">{u.name}</span>
                    <span className="user-item-email">{u.email}</span>
                  </div>
                  {isActive && <span className="user-active-indicator" title="Ativo">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="user-profile-dropdown-divider" />

          {!isCreatingUser ? (
            <div className="user-profile-dropdown-actions">
              <button
                type="button"
                className="btn-dropdown-action"
                onClick={() => {
                  setIsCreatingUser(true);
                  setErrorMessage('');
                }}
              >
                <span>➕</span> Cadastrar Novo Usuário
              </button>

              {onOpenTeamsModal && (
                <button
                  type="button"
                  className="btn-dropdown-action"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenTeamsModal();
                  }}
                >
                  <span>👥</span> Gerenciar Squads / Times
                </button>
              )}

              {onOpenSettings && (
                <button
                  type="button"
                  className="btn-dropdown-action"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                >
                  <span>⚙️</span> Configurações do Sistema
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="create-user-mini-form">
              <div className="form-mini-title">Novo Usuário</div>
              {errorMessage && <div className="form-mini-error">{errorMessage}</div>}
              <input
                type="text"
                className="form-mini-input"
                placeholder="Nome completo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <input
                type="email"
                className="form-mini-input"
                placeholder="E-mail corporativo"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <div className="form-mini-actions">
                <button
                  type="button"
                  className="btn-mini-cancel"
                  onClick={() => setIsCreatingUser(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-mini-submit">
                  Salvar Usuário
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
