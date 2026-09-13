# Implementation Plan: Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad (Team Access Control)

**Branch**: `023-team-access-control` | **Date**: 2026-09-12 | **Spec**: [specs/023-team-access-control/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Esta funcionalidade introduz o ecossistema completo de **Controle de Acesso Baseado em Equipes (Team-Based Access Control - TBAC)** no Metrik. Usuários podem se cadastrar, alternar perfis ativos e criar ou gerenciar squads/times autônomos. Cada quadro Kanban passa a pertencer a um time específico, estabelecendo um **isolamento estrito de acesso**: membros de um time não visualizam nem acessam quadros de outras equipes, a menos que tenham sido explicitamente convidados para aquela squad, com papéis definidos (`admin`, `member`, `guest`).

A implementação é 100% *local-first* utilizando `localStorage` com tratamento defensivo de exceções e tipagem TypeScript estrita, mantendo a independência de servidores externos e plena compatibilidade com os temas Claro, Escuro e Neutro.

---

## 2. Contexto Técnico

- **Linguagem / Versão**: TypeScript 5.7+, React 19+ (Vite 6)
- **Dependências Principais**: React 19, CSS Custom Properties, `uuid` (Zero bibliotecas externas de autenticação pesadas ou serviços em nuvem)
- **Armazenamento**: `localStorage` (`metrik_users`, `metrik_active_user_id`, `metrik_teams`, `metrik_team_members`, `metrik_team_invitations`)
- **Testes**: Vitest, React Testing Library, jsdom
- **Plataforma Alvo**: Navegadores Web Modernos (Chrome, Firefox, Safari, Edge)
- **Tipo de Projeto**: Web Application / Enterprise Kanban & Flow Analytics
- **Metas de Performance**: Alternância de usuário e filtragem de quadros em $< 16\text{ ms}$ (60fps)
- **Restrições**: Conformidade WCAG AA, 100% CSS nativo sem Tailwind, isolamento seguro sem vazamento de dados entre squads, estrita independência de marca (Princípio VII)

---

## 3. Constitution Check (Gates Constitucionais Metrik v1.2.0)

- [x] **Gate I (Specification-Driven Development)**: `spec.md`, `research.md`, `data-model.md`, `quickstart.md` e `plan.md` formalizados na branch isolada `023-team-access-control`.
- [x] **Gate II (Qualidade de Código & Modularidade)**: Módulos desacoplados (`useTeamAccess.ts`, `useAuthSession.ts`), componentes atômicos (`UserProfileMenu.tsx`, `TeamManagementModal.tsx`, `RestrictedBoardFallback.tsx`) com tipagem estrita e zero dependências circulares.
- [x] **Gate III (Verificação Automatizada)**: Testes unitários cobrindo isolamento de quadros, fluxo de convites e RBAC, mantendo 100% de sucesso nos 266 testes legados do Metrik.
- [x] **Gate IV (Observabilidade & Logs Estruturados)**: Logs informativos com prefixo `[Metrik]` para operações de autenticação, convites e bloqueios de acesso.
- [x] **Gate V (Simplicidade & YAGNI)**: Arquitetura local-first pura, sem necessidade de backend, banco de dados externo ou bibliotecas adicionais.
- [x] **Gate VI (Modelos de Raciocínio Analítico Pré-Tarefas)**: Mandatório antes de criar `tasks.md`.
- [x] **Gate VII (Independência Estrita de Marca)**: Nomenclatura proprietária e neutra (*Metrik Team Access Control*, *Squad Governance*).

---

## 4. User Review Required

> [!IMPORTANT]
> - **Arquitetura Local-First Multi-User**: Como o Metrik opera como SPA client-side rápida e autônoma, toda a gestão de usuários, times e convites é mantida no navegador via repositórios em `localStorage`. Isso permite alternar facilmente entre múltiplos perfis (ex: Alice da Squad Alfa, Carlos da Squad Beta, Diana Convidada) para testar os isolamentos imediatamente na mesma máquina.
> - **Isolamento de Dados em Três Camadas**: O isolamento de quadros entre times é protegido no seletor de interface (`BoardSwitcher`), na camada de estado (`useBoards`) e na camada de visualização com tela de bloqueio (`RestrictedBoardFallback`).
> - **Preservação Retrocompatível de Dados**: Todos os quadros existentes no Metrik são migrados automaticamente para o time padrão inicial ("Time Principal"), garantindo zero perda de dados.

---

## 5. Estrutura do Projeto

```text
specs/023-team-access-control/
├── spec.md              # Especificação formal da feature
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e fundamentação técnica
├── data-model.md        # Modelagem de User, Team, TeamMember e TeamInvitation
├── quickstart.md        # Guia de validação e cenários passo a passo
├── checklists/
│   ├── requirements.md  # Checklist de qualidade dos requisitos
│   └── access-control.md # Checklist de segurança e controle de acesso
└── tasks.md             # Tarefas de implementação (Phase 2 - /speckit-tasks)

src/
├── types/
│   ├── team.ts          # [NEW] Tipos User, Team, TeamMember, TeamInvitation, TeamRole
│   └── index.ts         # [MODIFY] Extensão da interface Board com teamId obrigatório
├── hooks/
│   ├── useTeamAccess.ts # [NEW] Hook unificado de usuários, times, membros e convites
│   └── useBoards.ts     # [MODIFY] Integrar verificação de teamId e filtragem por squad
├── components/
│   ├── UserProfileMenu.tsx        # [NEW] Dropdown de usuário ativo e cadastro de perfis
│   ├── TeamManagementModal.tsx    # [NEW] Modal de gestão de squads, membros e convites
│   ├── RestrictedBoardFallback.tsx # [NEW] Tela de aviso de acesso restrito a outros times
│   ├── BoardSwitcher.tsx          # [MODIFY] Filtrar lista exibindo apenas boards permitidos
│   ├── BoardManagementModal.tsx   # [MODIFY] Seleção de squad obrigatória ao criar board
│   ├── Board.tsx                  # [MODIFY] Desabilitar edição se papel for 'guest'
│   ├── App.tsx                    # [MODIFY] Integrar UserProfileMenu no cabeçalho
│   └── App.css                    # [MODIFY] Estilos para menus de usuário, squads e badges
└── utils/
    └── defaultSeedData.ts         # [MODIFY] Atribuir teamId padrão nos dados de seed

tests/unit/
├── useTeamAccess.test.ts          # [NEW] Testes de gestão de times, membros e convites
├── boardIsolation.test.tsx        # [NEW] Testes de isolamento estrito entre squads
└── boardManagementTeam.test.tsx   # [NEW] Testes de criação de board com vínculo de squad
```

---

## 6. Proposed Changes

### 1. Camada de Tipagem & Modelagem de Dados

#### [NEW] [src/types/team.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/types/team.ts)
- Definir interfaces `User`, `Team`, `TeamMember`, `TeamInvitation`, `TeamRole` (`'admin' | 'member' | 'guest'`) e `InvitationStatus`.
- Definir constantes de chave do `localStorage` (`USERS_STORAGE_KEY`, `ACTIVE_USER_STORAGE_KEY`, `TEAMS_STORAGE_KEY`, `TEAM_MEMBERS_STORAGE_KEY`, `TEAM_INVITATIONS_STORAGE_KEY`, `DEFAULT_TEAM_ID`).

#### [MODIFY] [src/types/index.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/types/index.ts)
- Adicionar `teamId: string` à interface `Board`.

---

### 2. Camada de Lógica de Negócio & Hooks

#### [NEW] [src/hooks/useTeamAccess.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useTeamAccess.ts)
- Gerenciamento de estado de usuários (`users`, `activeUser`, `setActiveUser`, `createUser`).
- Gerenciamento de times (`teams`, `createTeam`, `updateTeam`, `myTeams`).
- Gerenciamento de membros (`teamMembers`, `addMember`, `removeMember`, `getMembersByTeam`, `getUserRoleInTeam`).
- Gerenciamento de convites (`invitations`, `createInvitation`, `acceptInvitation`, `revokeInvitation`, `getPendingInvitationsForUser`).
- Inicialização com dados padrão e suporte a migração automática de boards legados.

#### [MODIFY] [src/hooks/useBoards.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useBoards.ts)
- Atualizar a criação de boards para receber `teamId`.
- Implementar verificação de autorização: `isBoardAccessible(boardId, userId)` garantindo que o usuário só possa ativar boards das suas squads.

---

### 3. Camada de Componentes de Interface (UI)

#### [NEW] [src/components/UserProfileMenu.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/UserProfileMenu.tsx)
- Botão no cabeçalho exibindo avatar, nome do usuário ativo e indicador do time atual.
- Dropdown para alternar rapidamente entre perfis cadastrados, cadastrar novo usuário ou abrir o painel de times.

#### [NEW] [src/components/TeamManagementModal.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TeamManagementModal.tsx)
- Abas de gestão de times:
  1. **Minhas Squads**: Lista de equipes com membros e seus papéis (`admin`, `member`, `guest`).
  2. **Criar Squad**: Formulário simples com nome e descrição.
  3. **Convidar Integrante**: Seleção de squad, inserção de e-mail e escolha de papel (`admin`, `member`, `guest`).
  4. **Entrar com Código**: Campo para colar código de convite recebido.

#### [NEW] [src/components/RestrictedBoardFallback.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/RestrictedBoardFallback.tsx)
- Componente de barreira visual exibido quando o usuário tenta acessar um quadro de outra equipe sem autorização.

#### [MODIFY] [src/components/BoardSwitcher.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/BoardSwitcher.tsx)
- Filtrar opções do seletor para exibir apenas quadros pertencentes aos times em que o usuário ativo participa.
- Agrupar quadros por nome da Squad no dropdown (ex: `Squad Engenharia > Quadro de Pagamentos`).

#### [MODIFY] [src/components/BoardManagementModal.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/BoardManagementModal.tsx)
- Adicionar campo seletor de time obrigatório ao criar um novo quadro.

#### [MODIFY] [src/components/Board.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Board.tsx)
- Inspecionar o papel do usuário ativo no time do quadro: se for `guest`, desabilitar criação de colunas e botões de adicionar tarefas (modo somente-leitura).

#### [MODIFY] [src/App.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.tsx)
- Integrar `UserProfileMenu` e `TeamManagementModal` na barra de ações do cabeçalho (`.header-actions`).

#### [MODIFY] [src/App.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.css)
- Estilos para badges de papel (`role-badge-admin`, `role-badge-member`, `role-badge-guest`), menus de perfil de usuário e modais de time compatíveis com os 3 temas (Claro, Escuro e Neutro).

---

## 7. Verification Plan

### Automated Tests
- Testes unitários dedicados de gestão de times e controle de acesso:
  ```bash
  npx vitest run tests/unit/useTeamAccess.test.ts
  npx vitest run tests/unit/boardIsolation.test.tsx
  ```
- Suíte completa de regressão:
  ```bash
  npm test
  ```
- Verificação de compilação TypeScript e bundle de produção:
  ```bash
  npm run build
  ```

### Manual Verification
1. Cadastrar Usuário A e criar "Squad Alfa" com "Quadro Alfa".
2. Cadastrar Usuário B e criar "Squad Beta" com "Quadro Beta".
3. Validar que Usuário B não enxerga "Quadro Alfa" no seletor de quadros.
4. Convidar Usuário B como `guest` para a "Squad Alfa".
5. Usuário B aceita o convite e passa a visualizar o "Quadro Alfa" em modo somente-leitura.
6. Alternar temas (Claro, Escuro, Neutro) e verificar contraste de todos os diálogos de usuário e time.
