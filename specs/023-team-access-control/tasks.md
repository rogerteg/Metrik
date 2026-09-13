# Tasks: Feature 023 - Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad (Team Access Control)

**Branch**: `023-team-access-control`  
**Status**: Concluído (23/23 tarefas)  
**GitHub Issues**: [#37](https://github.com/rogerteg/Metrik/issues/37) (Setup), [#38](https://github.com/rogerteg/Metrik/issues/38) (Core), [#39](https://github.com/rogerteg/Metrik/issues/39) (US1), [#40](https://github.com/rogerteg/Metrik/issues/40) (US2), [#41](https://github.com/rogerteg/Metrik/issues/41) (US3), [#42](https://github.com/rogerteg/Metrik/issues/42) (US4), [#43](https://github.com/rogerteg/Metrik/issues/43) (QA)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Fundamento do Isolamento de Dados em Ambientes Multi-Equipe (TBAC):**
  - Um quadro Kanban e suas métricas de fluxo contêm informações estratégicas e operacionais confidenciais da equipe.
  - A permissão de visualização de um recurso $R$ (Board) para um sujeito $S$ (User) reduz-se matematicamente à existência de uma relação de pertinência ativa:
    $$\text{Permitted}(S, R) \iff \exists T \in \text{Teams}(S) \text{ tal que } \text{Team}(R) = T$$
  - Sem a relação $T$, o recurso $R$ é estritamente inacessível ($\text{Permitted} = \text{false}$), independentemente de o usuário conhecer o identificador de $R$.
- **Invariante de Preservação Retrocompatível:**
  - Nenhuma atualização de schema pode quebrar quadros existentes. Todo board pré-existente sem `teamId` deve ser transparentemente vinculado ao time padrão da organização (`DEFAULT_TEAM_ID`), cujo primeiro administrador é o operador inicial do sistema.
- **Invariante da Defesa em Profundidade (Defense-in-Depth):**
  - O isolamento não pode depender apenas de filtros cosméticos na interface. A restrição deve ser validada tanto no hook de seleção (`useBoards`), quanto nos componentes visuais de renderização (`Board`, `AnalyticsDashboard`) e no seletor global (`BoardSwitcher`).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Vazamento de Quadro via Troca de Sessão em Abas Simultâneas):**
  - *Cenário:* Usuário A abre o Metrik e visualiza o "Quadro Confidencial". Na aba ao lado, o operador seleciona Usuário B (que não pertence à squad do quadro). Se o estado do board não for reavaliado, o Usuário B continuará operando o quadro confidencial.
  - *Mitigação:* O hook `useBoards` deve escutar ativamente a alteração do `activeUserId`. Ao detectar troca de usuário, se o board ativo não for permitido para o novo perfil, o sistema reseta imediatamente a seleção para o primeiro board válido do novo usuário ou exibe a barreira de acesso restrito.
- **Modo de Falha 2 (Exclusão do Último Administrador da Squad):**
  - *Cenário:* O único admin de um time sai da equipe ou se auto-rebaixa a membro, deixando o squad sem liderança capaz de convidar novos integrantes ou gerenciar o time.
  - *Mitigação:* Regra de guarda estrita no hook `useTeamAccess`: rejeitar remoção ou alteração de papel se `members.filter(m => m.role === 'admin').length === 1`.
- **Modo de Falha 3 (Tentativa de Modificação por Convidados 'Guests'):**
  - *Cenário:* Usuário convidado como `guest` tenta arrastar cartões, criar colunas ou excluir tarefas.
  - *Mitigação:* `Board.tsx` avalia o papel do usuário ativo na squad: caso seja `guest`, os controles de criação/edição são desabilitados e os eventos de drag-and-drop são travados para modo somente-leitura.
- **Modo de Falha 4 (Quebra de Testes Legados por Ausência de `teamId`):**
  - *Cenário:* 266 testes unitários existentes chamam helpers de criação de board sem passar `teamId`.
  - *Mitigação:* No helper de inicialização e no seed data (`src/utils/defaultSeedData.ts`), preencher `teamId` com valor padrão retrocompatível (`'default-team-main'`).

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Setup & Data Modeling**:
  - Tipagem TypeScript e modelagem relacional (não se sobrepõe à lógica de estado nem à UI).
- **Phase 2: Foundational State & Access Control Engine**:
  - Hook unificado `useTeamAccess.ts`, migração de schema e testes unitários de regras de negócio (desacoplado de componentes visuais).
- **Phase 3: User Story 1 - User Profile & Session Management (P1)**:
  - Componente de perfil, alternador de usuários no cabeçalho e cadastro de operadores.
- **Phase 4: User Story 2 - Squad Creation & Team Management (P1)**:
  - Modal de administração de times, listagem de squads e atribuição de administradores.
- **Phase 5: User Story 3 - Strict Board Isolation & Guarding (P1) — MVP Core**:
  - Filtragem do `BoardSwitcher`, bloqueio de boards não autorizados, tela de acesso restrito e vinculação de squad no `BoardManagementModal`.
- **Phase 6: User Story 4 - Team Invitations & Guest Onboarding (P2)**:
  - Envio de convites com código único, aceite de convites, atribuição de papel `guest` (somente-leitura).
- **Phase 7: Automated Verification, Quality Gate & Polish**:
  - Suíte de regressão de 266+ testes, testes dedicados de acesso e validação de build de produção.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Backend Externo com Firebase ou OAuth2):** Poda por violação do Princípio V (Simplicidade & YAGNI). O Metrik opera perfeitamente client-side/local-first, permitindo validação imediata em qualquer ambiente sem credenciais de nuvem.
- **Alternativa Descartada (Quadros Pessoais Não Vinculados a Times):** Poda por complexidade desnecessária e inconsistência conceitual. Cada usuário pode ter sua squad pessoal ("Squad Individual") mantendo o modelo relacional $100\%$ uniforme.
- **Alternativa Descartada (Filtragem apenas visual no CSS com `display: none`):** Poda por fragilidade de segurança. A barreira deve ocorrer na fonte de dados do hook `useBoards`.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Os testes em `tests/unit/useTeamAccess.test.ts` e `tests/unit/boardIsolation.test.tsx` falham inicialmente porque os módulos, hooks e propriedades `teamId` ainda não foram implementados.
- **Critério determinístico de aceite (Green Bar):**
  - Todos os novos testes unitários passam com 100% de sucesso.
  - A suíte completa de testes (266 testes legados + novos testes) executa com 0 falhas.
  - `npm run build` compila sem erros de tipagem TypeScript.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - **Princípio I (SDD):** `spec.md`, `plan.md`, `research.md`, `data-model.md` e `quickstart.md` formalizados antes da escrita de tarefas.
  - **Princípio II (Qualidade & Modularidade):** Hook desacoplado, componentes atômicos sem dependências circulares.
  - **Princípio III (Verificação Automatizada):** Testes unitários cobrindo isolamento, convites e sessões.
  - **Princípio V (Simplicidade):** Zero dependências externas adicionadas ao `package.json`.
  - **Princípio VII (Independência de Marca):** Nomenclatura proprietária *Metrik Team Access Control*.

---

## Phase 1: Setup & Data Modeling

**Purpose**: Definição da tipagem TypeScript e atualização das estruturas de dados de quadros

- [x] T001 [P] Define TypeScript types `User`, `Team`, `TeamMember`, `TeamInvitation`, `TeamRole`, `InvitationStatus` and storage constants in `src/types/team.ts`
- [x] T002 [P] Extend `Board` interface with required property `teamId: string` in `src/types/index.ts` and update default seed data in `src/utils/defaultSeedData.ts`

---

## Phase 2: Foundational State & Access Control Engine

**Purpose**: Infraestrutura de estado, persistência em `localStorage`, migração de quadros legados e verificação de permissões

- [x] T003 [P] Write unit tests for `useTeamAccess` hook covering user creation, squad creation, membership management, invitation lifecycle, and board access resolution in `tests/unit/useTeamAccess.test.ts`
- [x] T004 Implement `useTeamAccess` hook with defensive `localStorage` persistence, automatic legacy board migration to default squad, and multi-tab storage synchronization in `src/hooks/useTeamAccess.ts`
- [x] T005 [P] Update `useBoards` hook to enforce squad authorization checks (`isBoardAccessible`) and support passing `teamId` upon board creation in `src/hooks/useBoards.ts`

**Checkpoint**: Camada foundational pronta — lógica de usuários, squads, autorização e persistência plenamente testável de forma desacoplada.

---

## Phase 3: User Story 1 - User Profile & Session Management (Priority: P1)

**Goal**: Permitir cadastro de operadores, exibição do usuário ativo no cabeçalho e chaveamento rápido de perfis na sessão.

**Independent Test**: Cadastrar dois usuários (Alice e Bob). Alterne entre os perfis no menu do cabeçalho; o sistema deve atualizar imediatamente o usuário ativo e refletir seu avatar/iniciais.

### Tests for User Story 1
- [x] T006 [P] [US1] Write unit tests for `UserProfileMenu` component covering profile display, user switching, and new user creation in `tests/unit/UserProfileMenu.test.tsx`

### Implementation for User Story 1
- [x] T007 [US1] Implement `UserProfileMenu` component with active user avatar, initials badge, profile switcher dropdown, and modal trigger to create new user in `src/components/UserProfileMenu.tsx`
- [x] T008 [US1] Add styles for user profile menu, avatar pill, dropdown items, and active checkmarks in `src/App.css`
- [x] T009 [US1] Integrate `UserProfileMenu` into `src/App.tsx` top header actions bar

**Checkpoint**: User Story 1 funcional — múltiplos usuários podem ser criados e chaveados na interface.

---

## Phase 4: User Story 2 - Squad Creation & Team Management (Priority: P1)

**Goal**: Permitir aos usuários criar novas squads/times, visualizar integrantes e administrar a equipe.

**Independent Test**: Criar a "Squad Engenharia". Acessar o diálogo de gestão de equipes e verificar que o criador é automaticamente atribuído como Administrador (`admin`).

### Tests for User Story 2
- [x] T010 [P] [US2] Write unit tests for `TeamManagementModal` component covering squad creation form, team listing, and member role display in `tests/unit/TeamManagementModal.test.tsx`

### Implementation for User Story 2
- [x] T011 [US2] Implement `TeamManagementModal` component with tabs: "Minhas Squads", "Criar Squad", "Convidar Integrante" e "Membros" in `src/components/TeamManagementModal.tsx`
- [x] T012 [US2] Add styles for team management modal, squad cards, role badges (`admin`, `member`, `guest`), and action buttons in `src/App.css`

**Checkpoint**: User Story 2 funcional — squads podem ser criadas e administradas com visualização clara de membros.

---

## Phase 5: User Story 3 - Strict Board Isolation & Guarding (Priority: P1) 🎯 MVP Core

**Goal**: Garantir isolamento estrito — membros de um time NÃO visualizam nem acessam quadros de outras equipes, e novos quadros são obrigatoriamente vinculados a uma squad.

**Independent Test**: Usuário A (Squad Alfa) possui o "Quadro Alfa". Usuário B (Squad Beta) possui o "Quadro Beta". O seletor de quadros de B só lista o "Quadro Beta". Se B tentar forçar o ID do "Quadro Alfa", é bloqueado com a tela de aviso de acesso restrito.

### Tests for User Story 3
- [x] T013 [P] [US3] Write unit tests for board isolation, `BoardSwitcher` team filtering, and restricted board fallback banner in `tests/unit/boardIsolation.test.tsx`

### Implementation for User Story 3
- [x] T014 [US3] Update `BoardSwitcher` to filter the board list displaying strictly the boards of squads where the active user is a member/guest, grouping boards by Squad name in `src/components/BoardSwitcher.tsx`
- [x] T015 [US3] Update `BoardManagementModal` to require selecting a target Squad when creating a new board, preventing orphan boards in `src/components/BoardManagementModal.tsx`
- [x] T016 [US3] Implement `RestrictedBoardFallback` component with friendly "Acesso Restrito: Requer Convite da Squad" notification and redirect action in `src/components/RestrictedBoardFallback.tsx`
- [x] T017 [US3] Integrate board isolation check in `src/App.tsx`, rendering `RestrictedBoardFallback` if the active board belongs to an unauthorized team

**Checkpoint**: User Story 3 funcional — isolamento estrito de quadros ativo e auditado com defesa em profundidade.

---

## Phase 6: User Story 4 - Team Invitations & Guest Onboarding (Priority: P2)

**Goal**: Permitir envio de convites específicos para uma squad com código único, aceite pelo convidado e aplicação do papel `guest` (somente-leitura).

**Independent Test**: Admin da Squad Alfa convida `carlos@externo.local` como `guest`. Carlos aceita o convite e passa a visualizar o quadro da Squad Alfa em modo somente-leitura (sem permissão para criar/mover cartões).

### Tests for User Story 4
- [x] T018 [P] [US4] Write unit tests for invitation generation, invite code acceptance, and guest read-only permission enforcement in `tests/unit/teamInvitations.test.tsx`

### Implementation for User Story 4
- [x] T019 [US4] Implement invitation generation and code validation in `TeamManagementModal` (geração de código único ex: `METRIK-ALFA-7X9K` e busca de convites pendentes por e-mail) in `src/components/TeamManagementModal.tsx`
- [x] T020 [US4] Implement read-only restriction in `Board.tsx` and task action buttons when active user has `guest` role on the current board's squad in `src/components/Board.tsx`

**Checkpoint**: User Story 4 funcional — convites específicos por squad e papel de convidado somente-leitura totalmente operacionais.

---

## Phase 7: Verification, Quality Gate & Polish

**Purpose**: Verificação completa automatizada, garantia de zero regressões e conformidade de build

- [x] T021 [P] Execute dedicated team access and board isolation test suites (`npx vitest run tests/unit/useTeamAccess.test.ts tests/unit/boardIsolation.test.tsx`)
- [x] T022 Execute full regression test suite (`npm test`) ensuring 100% pass rate across all 266 existing tests plus new tests
- [x] T023 Run strict type checking and production build (`npm run build`) ensuring zero TypeScript and bundle errors

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende da conclusão de Phase 1 — BLOQUEIA a implementação de UI.
- **User Story 1 (Phase 3)**: Depende de Phase 2 — entrega gestão de perfis de usuário.
- **User Story 2 (Phase 4)**: Depende de Phase 3 — entrega criação e administração de squads.
- **User Story 3 (Phase 5 - MVP Core)**: Depende de Phase 4 — entrega o isolamento estrito de quadros.
- **User Story 4 (Phase 6)**: Depende de Phase 5 — entrega fluxo de convites e restrição de convidados.
- **Verification (Phase 7)**: Depende da conclusão de todas as fases.

---

## Parallel Opportunities

- `T001` (Tipagem `team.ts`) e `T002` (Extensão `Board` em `index.ts`) podem ser executados em paralelo.
- `T003` (Testes do hook) e `T005` (Atualização do `useBoards`) podem ser desenvolvidos em paralelo.
- `T006` (Testes de UserProfile) e `T010` (Testes de TeamManagement) podem ser preparados em paralelo.
- `T013` (Testes de isolamento) e `T016` (Componente `RestrictedBoardFallback`) podem ser executados em paralelo.

---

## Implementation Strategy (MVP First)

1. **Etapa 1 (Fundação)**: Completar Setup (Phase 1) e Foundational (Phase 2).
2. **Etapa 2 (Identidade & Squads)**: Completar User Story 1 (Phase 3) e User Story 2 (Phase 4).
3. **Etapa 3 (MVP Core - Isolamento)**: Completar User Story 3 (Phase 5) — neste ponto o isolamento de quadros por squad já estará 100% funcional.
4. **Etapa 4 (Convites & Convidados)**: Completar User Story 4 (Phase 6).
5. **Etapa 5 (Qualidade & Release)**: Executar a suíte de testes de regressão (266+ testes verdes) e compilação limpa no `npm run build`.
