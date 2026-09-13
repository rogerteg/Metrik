import React, { useState, useEffect } from 'react';
import { Team, User, TeamInvitation, TeamRole } from '../types/team';
import './Modal.css';

export interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  users: User[];
  activeUserId: string;
  invitations: TeamInvitation[];
  onCreateTeam: (name: string, description?: string) => Team;
  onUpdateMemberRole: (teamId: string, userId: string, role: TeamRole) => void;
  onRemoveMember: (teamId: string, userId: string) => void;
  onCreateInvitation: (teamId: string, email: string, role: TeamRole) => TeamInvitation;
  onAcceptInvitation: (code: string) => void;
  initialTab?: 'my-squads' | 'create-squad' | 'members' | 'invite' | 'join-code';
  selectedTeamId?: string;
  teamMembers?: any[];
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teams,
  users,
  activeUserId,
  invitations,
  onCreateTeam,
  onUpdateMemberRole,
  onRemoveMember,
  onCreateInvitation,
  onAcceptInvitation,
  initialTab = 'my-squads',
  selectedTeamId,
  teamMembers,
}) => {
  const [tab, setTab] = useState<'my-squads' | 'create-squad' | 'members' | 'invite' | 'join-code'>(
    initialTab
  );

  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeInvitations = Array.isArray(invitations) ? invitations : [];

  const getTeamMembers = (team?: Team): any[] => {
    if (!team) return [];
    if (Array.isArray((team as any)?.members)) {
      return (team as any).members;
    }
    if (Array.isArray(teamMembers)) {
      return teamMembers.filter((m) => m.teamId === team.id);
    }
    return [];
  };

  // Teams where active user is member
  const myTeams = safeTeams.filter((t) => {
    const members = getTeamMembers(t);
    return members.some((m: any) => m?.userId === activeUserId);
  });

  // Currently focused team for members and invitations
  const [currentTeamId, setCurrentTeamId] = useState<string>(
    selectedTeamId || myTeams[0]?.id || safeTeams[0]?.id || ''
  );

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [joinCode, setJoinCode] = useState('');
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (selectedTeamId) {
      setCurrentTeamId(selectedTeamId);
    } else if (!currentTeamId && myTeams.length > 0) {
      setCurrentTeamId(myTeams[0].id);
    }
  }, [selectedTeamId, myTeams, currentTeamId]);

  if (!isOpen) return null;

  const activeTeam = safeTeams.find((t) => t.id === currentTeamId);
  const activeTeamMembers = getTeamMembers(activeTeam);
  const activeUserRoleInCurrentTeam = activeTeamMembers.find((m: any) => m.userId === activeUserId)?.role;
  const isAdmin = activeUserRoleInCurrentTeam === 'admin';

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!newTeamName.trim()) {
      setFeedbackMessage({ text: 'O nome da squad é obrigatório.', type: 'error' });
      return;
    }

    try {
      const created = onCreateTeam(newTeamName.trim(), newTeamDesc.trim() || undefined);
      setNewTeamName('');
      setNewTeamDesc('');
      setCurrentTeamId(created.id);
      setTab('my-squads');
      setFeedbackMessage({ text: `Squad "${created.name}" criada com sucesso!`, type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Erro ao criar squad.', type: 'error' });
    }
  };

  const handleCreateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!currentTeamId) {
      setFeedbackMessage({ text: 'Selecione uma squad primeiro.', type: 'error' });
      return;
    }
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setFeedbackMessage({ text: 'Informe um e-mail válido para o convite.', type: 'error' });
      return;
    }

    try {
      const inv = onCreateInvitation(currentTeamId, inviteEmail.trim(), inviteRole);
      setLastGeneratedCode(inv.code);
      setInviteEmail('');
      setFeedbackMessage({
        text: `Convite gerado com sucesso! Código: ${inv.code}`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Erro ao gerar convite.', type: 'error' });
    }
  };

  const handleJoinCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!joinCode.trim()) {
      setFeedbackMessage({ text: 'Informe o código do convite.', type: 'error' });
      return;
    }

    try {
      onAcceptInvitation(joinCode.trim());
      setJoinCode('');
      setFeedbackMessage({ text: 'Você entrou na squad com sucesso!', type: 'success' });
      setTab('my-squads');
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Código de convite inválido ou expirado.', type: 'error' });
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (!currentTeamId) return;
    const confirmed = window.confirm('Deseja realmente remover este integrante da squad?');
    if (confirmed) {
      try {
        onRemoveMember(currentTeamId, userId);
        setFeedbackMessage({ text: 'Membro removido da squad.', type: 'success' });
      } catch (err: any) {
        setFeedbackMessage({ text: err.message || 'Erro ao remover membro.', type: 'error' });
      }
    }
  };

  const handleRoleChange = (userId: string, role: TeamRole) => {
    if (!currentTeamId) return;
    try {
      onUpdateMemberRole(currentTeamId, userId, role);
      setFeedbackMessage({ text: 'Papel do integrante atualizado com sucesso.', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Erro ao atualizar papel.', type: 'error' });
    }
  };

  // Pending invitations for current team
  const teamInvitations = safeInvitations.filter((i) => i.teamId === currentTeamId && i.status === 'pending');

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Gestão de Times e Squads">
      <div className="modal-content team-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestão de Times e Squads</h2>
          <button className="btn-close" onClick={onClose} aria-label="Fechar modal">×</button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="team-modal-tabs" role="tablist">
          <button
            type="button"
            className={`team-tab-btn ${tab === 'my-squads' ? 'active' : ''}`}
            onClick={() => { setTab('my-squads'); setFeedbackMessage(null); }}
            role="tab"
            aria-selected={tab === 'my-squads'}
          >
            👥 Minhas Squads ({myTeams.length})
          </button>
          <button
            type="button"
            className={`team-tab-btn ${tab === 'create-squad' ? 'active' : ''}`}
            onClick={() => { setTab('create-squad'); setFeedbackMessage(null); }}
            role="tab"
            aria-selected={tab === 'create-squad'}
          >
            ➕ Criar Squad
          </button>
          <button
            type="button"
            className={`team-tab-btn ${tab === 'members' ? 'active' : ''}`}
            onClick={() => { setTab('members'); setFeedbackMessage(null); }}
            role="tab"
            aria-selected={tab === 'members'}
          >
            👤 Membros
          </button>
          <button
            type="button"
            className={`team-tab-btn ${tab === 'invite' ? 'active' : ''}`}
            onClick={() => { setTab('invite'); setFeedbackMessage(null); }}
            role="tab"
            aria-selected={tab === 'invite'}
          >
            ✉️ Convidar Integrante
          </button>
          <button
            type="button"
            className={`team-tab-btn ${tab === 'join-code' ? 'active' : ''}`}
            onClick={() => { setTab('join-code'); setFeedbackMessage(null); }}
            role="tab"
            aria-selected={tab === 'join-code'}
          >
            🔑 Entrar com Código
          </button>
        </div>

        {feedbackMessage && (
          <div className={`team-feedback-banner ${feedbackMessage.type}`}>
            {feedbackMessage.text}
          </div>
        )}

        <div className="modal-body team-modal-body">
          {/* TAB 1: MINHAS SQUADS */}
          {tab === 'my-squads' && (
            <div className="team-tab-content">
              {myTeams.length === 0 ? (
                <div className="team-empty-state">
                  <p>Você ainda não faz parte de nenhuma squad.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setTab('create-squad')}
                  >
                    Criar Minha Primeira Squad
                  </button>
                </div>
              ) : (
                <div className="team-cards-grid">
                  {myTeams.map((t) => {
                    const members = getTeamMembers(t);
                    const memberRecord = members.find((m: any) => m.userId === activeUserId);
                    const role = memberRecord?.role || 'member';
                    return (
                      <div key={t.id} className="team-card">
                        <div className="team-card-header">
                          <h3 className="team-card-title">{t.name}</h3>
                          <span className={`team-role-badge badge-${role}`}>
                            {role === 'admin' ? '👑 Admin' : role === 'guest' ? '👁️ Convidado' : '⚡ Membro'}
                          </span>
                        </div>
                        {t.description && <p className="team-card-desc">{t.description}</p>}
                        <div className="team-card-meta">
                          <span>Integrantes: {members.length}</span>
                        </div>
                        <div className="team-card-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setCurrentTeamId(t.id);
                              setTab('members');
                            }}
                          >
                            Ver Integrantes
                          </button>
                          {role === 'admin' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setCurrentTeamId(t.id);
                                setTab('invite');
                              }}
                            >
                              Convidar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRIAR SQUAD */}
          {tab === 'create-squad' && (
            <form onSubmit={handleCreateTeamSubmit} className="team-form">
              <div className="form-group">
                <label className="form-label">Nome da Squad / Time *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nome da squad (ex: Squad Checkout, Core Team)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Objetivo, escopo ou descrição do time..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="team-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTab('my-squads')}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Squad
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MEMBROS */}
          {tab === 'members' && (
            <div className="team-tab-content">
              {/* Squad Selector */}
              <div className="team-selector-row">
                <label className="form-label">Squad selecionada:</label>
                <select
                  className="form-select"
                  value={currentTeamId}
                  onChange={(e) => setCurrentTeamId(e.target.value)}
                >
                  {myTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({getTeamMembers(t).length} membros)
                    </option>
                  ))}
                </select>
              </div>

              {activeTeam && (
                <div className="team-members-list">
                  <div className="members-table-header">
                    <span>Integrante</span>
                    <span>Papel</span>
                    {isAdmin && <span>Ações</span>}
                  </div>
                  {activeTeamMembers.map((member: any) => {
                    const userObj = safeUsers.find((u) => u.id === member.userId);
                    const userName = userObj ? userObj.name : `Usuário ${member.userId}`;
                    const userEmail = userObj ? userObj.email : '';
                    const isSelf = member.userId === activeUserId;

                    return (
                      <div key={member.userId} className="member-row">
                        <div className="member-info">
                          <span className="member-name">
                            {userName} {isSelf && <strong className="self-tag">(Você)</strong>}
                          </span>
                          {userEmail && <span className="member-email">{userEmail}</span>}
                        </div>

                        <div className="member-role-cell">
                          {isAdmin ? (
                            <select
                              className="form-select select-role-input"
                              data-testid={`member-role-select-${member.userId}`}
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.userId, e.target.value as TeamRole)}
                            >
                              <option value="admin">Administrador</option>
                              <option value="member">Membro Padrão</option>
                              <option value="guest">Convidado (Somente Leitura)</option>
                            </select>
                          ) : (
                            <span className={`team-role-badge badge-${member.role}`}>
                              {member.role === 'admin' ? 'Admin' : member.role === 'guest' ? 'Convidado' : 'Membro'}
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <div className="member-actions-cell">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveMember(member.userId)}
                              title="Remover integrante"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONVIDAR INTEGRANTE */}
          {tab === 'invite' && (
            <div className="team-tab-content">
              <form onSubmit={handleCreateInviteSubmit} className="team-form">
                <div className="form-group">
                  <label className="form-label">Squad de destino:</label>
                  <select
                    className="form-select"
                    value={currentTeamId}
                    onChange={(e) => setCurrentTeamId(e.target.value)}
                  >
                    {myTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail do Convidado *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="E-mail do convidado (ex: colega@empresa.com)"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Papel na Squad</label>
                  <select
                    className="form-select"
                    data-testid="invite-role-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  >
                    <option value="member">Membro (Pode criar, editar e movimentar cartões)</option>
                    <option value="guest">Convidado (Acesso somente-leitura aos quadros da squad)</option>
                    <option value="admin">Administrador (Controle total da squad e membros)</option>
                  </select>
                </div>

                <div className="team-form-actions">
                  <button type="submit" className="btn btn-primary">
                    Gerar Convite
                  </button>
                </div>
              </form>

              {lastGeneratedCode && (
                <div className="invite-code-display-box">
                  <span className="code-label">Código gerado para compartilhamento:</span>
                  <div className="code-value-row">
                    <strong className="code-value">{lastGeneratedCode}</strong>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lastGeneratedCode);
                        alert('Código copiado para a área de transferência!');
                      }}
                    >
                      Copiar Código
                    </button>
                  </div>
                </div>
              )}

              {teamInvitations.length > 0 && (
                <div className="pending-invitations-section">
                  <h4>Convites Pendentes ({teamInvitations.length})</h4>
                  <div className="pending-invites-list">
                    {teamInvitations.map((inv) => (
                      <div key={inv.id} className="pending-invite-item">
                        <div className="invite-item-info">
                          <strong>{inv.inviteeEmail}</strong>
                          <span className={`team-role-badge badge-${inv.role}`}>
                            {inv.role}
                          </span>
                        </div>
                        <span className="invite-item-code">Código: {inv.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ENTRAR COM CÓDIGO */}
          {tab === 'join-code' && (
            <form onSubmit={handleJoinCodeSubmit} className="team-form">
              <p className="team-form-hint">
                Se você recebeu um código de convite para uma squad específica, insira-o abaixo para ter acesso imediato aos quadros do time:
              </p>
              <div className="form-group">
                <label className="form-label">Código do Convite *</label>
                <input
                  type="text"
                  className="form-input code-input"
                  placeholder="Código do convite (ex: METRIK-ALFA-7X9K)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              <div className="team-form-actions">
                <button type="submit" className="btn btn-primary">
                  Entrar na Squad
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
