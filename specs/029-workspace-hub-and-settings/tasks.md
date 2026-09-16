---
description: "Task list for feature 029 - Workspace & Board Hub with Separate Settings Module"
---

# Tasks: Feature 029 - Hub de Espaços de Trabalho, Quadros Favoritos e Módulo Separado de Configurações

**Input**: Design documents from `/specs/029-workspace-hub-and-settings/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required), [research.md](research.md), [data-model.md](data-model.md), [contracts/workspace-hub.contract.md](contracts/workspace-hub.contract.md), [quickstart.md](quickstart.md)

**Tests**: **Incluídos** — Constituição III e Constituição VI.5 tornam os testes automatizados obrigatórios com ciclo TDD Red-Bar First.

**Organization**: Tarefas organizadas por histórias de usuário, fases e prioridade.

## Format: `[ID] [P?] [Story] Description with exact file path`

- **[P]**: Pode executar em paralelo (arquivos distintos, sem dependência bloqueante)
- **[Story]**: História de usuário à qual a tarefa pertence ([US1], [US2], [US3])

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Verdades fundamentais e invariantes:**
  - O Quadro Kanban operacional é a unidade de visualização e manipulação do fluxo de trabalho diário (cartões, colunas, limites WIP).
  - Um Espaço de Trabalho (*Workspace*) é uma partição lógica organizacional de alto nível que agrupa múltiplos quadros por área ou squad de negócio (*Gestão, Produção, P&D, etc.*).
  - O Hub de Espaços de Trabalho atua como uma central de comando panorâmica para reduzir a sobrecarga cognitiva e oferecer acesso executivo rápido e atalhos aos quadros favoritos.
  - O Módulo de Configurações pertence à dimensão administrativa de governança e parametrização do sistema. Embuti-lo na mesma tela do fluxo de cartões sobrecarrega o cabeçalho e viola o princípio de Separação de Preocupações (*Separation of Concerns*). Uma tela cheia dedicada (*Full View*) em duas colunas resolve a clareza e a ergonomia.
- **Premissas acidentais descartadas:**
  - Descartada a necessidade de bibliotecas externas pesadas de roteamento (React Router) — o estado puro `view: 'workspaces' | 'board' | 'analytics' | 'settings'` em React 19 é instantâneo, simples e sem dependências extras.
  - Descartada a migração destrutiva — todos os quadros preexistentes no `localStorage` são preservados e atribuídos a um espaço inicial padrão ("Geral").

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)

- **Cenário de Falha 1: Perda ou corrupção de quadros existentes durante o carregamento inicial.**
  - *Falha:* A nova camada de espaços sobrescreve ou perde as chaves salvas em `metrik_boards`.
  - *Mitigação:* O hook `useWorkspaces` adota estratégia idempotente de leitura/migração apenas em caso de ausência da chave `metrik_workspaces`, agrupando todos os IDs de quadros existentes sem alterar suas estruturas internas.
- **Cenário de Falha 2: Conflito de navegação ou estado órfão ao abrir um quadro a partir dos favoritos.**
  - *Falha:* O usuário clica em um quadro na vitrine de favoritos, mas a aplicação não troca o `activeBoardId` ou a visão permanece presa no Hub.
  - *Mitigação:* Handler atômico `handleSelectBoard(boardId)` que atualiza `activeBoardId` e transita `view` para `'board'` de forma síncrona.
- **Cenário de Falha 3: Quebra de responsividade e transbordamento em notebooks e telas menores.**
  - *Falha:* A sidebar lateral de 260px estrangula o grid de cartões em telas de 1024px a 1280px.
  - *Mitigação:* Media queries dedicadas para recolher a sidebar em coluna compacta de ícones/bullets e grid fluido com `minmax(280px, 1fr)`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

- **Mutuamente Exclusivas:**
  - `src/types/workspace.ts`: Declarações de interfaces e tipos estritos de dados.
  - `src/hooks/useWorkspaces.ts` & `src/hooks/useAppSettings.ts`: Hooks especializados para dados e persistência.
  - `src/components/WorkspaceHub/`: Componentes exclusivos da visão de Hub e favoritos.
  - `src/components/Settings/`: Componentes exclusivos da visão dedicada de configurações.
  - `src/App.tsx` & `src/App.css`: Orquestração de rotas locais e estilização central.
- **Coletivamente Exaustivas:**
  - US1 (Hub de Espaços & Favoritos) → T005 a T011.
  - US2 (Módulo Separado de Configurações Full View) → T012 a T018.
  - US3 (Criação, Filtro em Pílula e Migração) → T003, T019, T020.
  - Garantia de Qualidade & Acessibilidade → T002, T005, T012, T021 a T024.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts & Trade-off Pruning)

- **Alternativa A: Implementar Configurações como Drawer lateral deslizante (Slide-over).**
  - *Poda:* O drawer lateral limita a largura para configurações detalhadas de equipes, políticas e backups, além de causar concorrência de foco visual com o quadro subjacente. Podada em favor da visão dedicada em tela cheia (*Full View*) em duas colunas.
- **Alternativa B: Manter os botões utilitários (Importar, Exportar, Demo) no cabeçalho.**
  - *Poda:* O usuário solicitou expressamente a criação das configurações de forma separada com ótimos conceitos de design. Mover essas ações utilitárias para a aba "Dados & Backup" do painel de configurações desobstrui o cabeçalho principal.
- **Alternativa C (Escolhida): Hub Panorâmico fiel ao Protótipo + Painel Full View de Configurações.**
  - *Critério:* Entrega fidelidade absoluta ao protótipo fornecido, melhora radicalmente a hierarquia de navegação e mantém a filosofia Local-First e modular do Metrik.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

- **Red-Bar 1:** Testes em `tests/unit/useWorkspaces.test.ts` falham antes da implementação do hook `useWorkspaces`.
- **Red-Bar 2:** Testes de renderização em `tests/unit/WorkspaceHub.test.tsx` e `tests/unit/SettingsView.test.tsx` falham antes da criação dos componentes.
- **Green-Bar:** 100% dos testes passando, com `npm test` verde (394+ testes) e `npm run build` compilando sem erros.

### 6. Triangulação Adversarial & Verificação da Constituição

- **I. SDD:** Especificação, plano técnico, contrato visual e tarefas formalizados.
- **II. Modularidade:** Diretórios dedicados `src/components/WorkspaceHub/` e `src/components/Settings/`.
- **III. Verificação:** Testes automatizados obrigatórios + validação visual no browser.
- **V. YAGNI:** Solução construída com React 19 e CSS nativo; zero novas bibliotecas.
- **VII. Independência de Marca:** Terminologia proprietária (*Espaços de Trabalho*, *Central de Quadros Metrik*).
- **VIII. Soberania Local-First:** Persistência estrita em `localStorage` com suporte ao controle de equipes (TBAC).

---

## Phase 1: Setup & Data Models

**Purpose**: Estruturar as tipagens e interfaces TypeScript para suportar Espaços de Trabalho, Favoritos e Configurações Globais.

- [X] T001 Define workspace, favorite boards and app settings interfaces in `src/types/workspace.ts` per `data-model.md`. ([#69](https://github.com/rogerteg/Metrik/issues/69))

---

## Phase 2: Foundational (State Hooks & Local-First Persistence - TDD Red-Bar First)

**Purpose**: Criar os hooks de gerenciamento de estado e persistência com testes unitários antes da implementação.

- [X] T002 [P] Create unit tests for `useWorkspaces` in `tests/unit/useWorkspaces.test.ts` covering initial migration, active workspace switching, and favorite toggling (Red-Bar). ([#70](https://github.com/rogerteg/Metrik/issues/70))
- [X] T003 Implement `useWorkspaces` hook in `src/hooks/useWorkspaces.ts` with transparent brownfield migration, CRUD operations and `localStorage` persistence (Green-Bar). ([#71](https://github.com/rogerteg/Metrik/issues/71))
- [X] T004 [P] Implement `useAppSettings` hook in `src/hooks/useAppSettings.ts` for managing application preferences and themes. ([#72](https://github.com/rogerteg/Metrik/issues/72))

**Checkpoint**: Base de dados e lógica de estado pronta e testada — implementação de componentes visuais pode iniciar.

---

## Phase 3: User Story 1 - Hub Visual de Espaços de Trabalho e Quadros Favoritos (Priority: P1) 🎯 MVP

**Goal**: Reproduzir com precisão o protótipo fornecido pelo usuário, oferecendo navegação por espaços com cores na lateral, vitrine de quadros favoritos com atalhos diretos e grade de quadros por espaço ativo.

**Independent Test**: Acessar a visão "Espaços", alternar entre os espaços da barra lateral, visualizar os quadros correspondentes e clicar no coração de qualquer quadro para favoritá-lo/desfavoritá-lo com atualização imediata da vitrine superior.

### Testes de Interface para US1
- [X] T005 [P] [US1] Create component tests for `WorkspaceHub` in `tests/unit/WorkspaceHub.test.tsx` verifying sidebar rendering, active space switching, and favorite board interactions (Red-Bar). ([#73](https://github.com/rogerteg/Metrik/issues/73))

### Implementação de Componentes para US1
- [X] T006 [P] [US1] Implement `WorkspaceSidebar.tsx` in `src/components/WorkspaceHub/WorkspaceSidebar.tsx` with color markers, "Todos os espaços" button, active space highlighting, and bottom "+ Novo painel" trigger. ([#74](https://github.com/rogerteg/Metrik/issues/74))
- [X] T007 [P] [US1] Implement `FavoriteBoardsSection.tsx` in `src/components/WorkspaceHub/FavoriteBoardsSection.tsx` with elevated cards, heart icon toggles, task deadline indicators, and click-to-open handlers. ([#75](https://github.com/rogerteg/Metrik/issues/75))
- [X] T008 [P] [US1] Implement `WorkspaceActionBar.tsx` in `src/components/WorkspaceHub/WorkspaceActionBar.tsx` with section title, circular action buttons (FABs), and pill-shaped search input. ([#76](https://github.com/rogerteg/Metrik/issues/76))
- [X] T009 [US1] Implement `WorkspaceBoardsGrid.tsx` in `src/components/WorkspaceHub/WorkspaceBoardsGrid.tsx` with responsive cards, 3-dots action menus, and empty state guidance. ([#77](https://github.com/rogerteg/Metrik/issues/77))
- [X] T010 [US1] Assemble `WorkspaceHub.tsx` in `src/components/WorkspaceHub/WorkspaceHub.tsx` integrating sidebar, favorites section, action bar, and boards grid. ([#78](https://github.com/rogerteg/Metrik/issues/78))
- [X] T011 [US1] Integrate `'workspaces'` view into `src/App.tsx`, updating top header view toggle ("Espaços" | "Quadro" | "Analytics") and board selection navigation (Green-Bar). ([#79](https://github.com/rogerteg/Metrik/issues/79))

**Checkpoint**: User Story 1 funcional e testável de forma autônoma (MVP do protótipo entregue).

---

## Phase 4: User Story 2 - Módulo Separado de Configurações em Tela Cheia (Priority: P2)

**Goal**: Entregar uma tela dedicada e separada de Configurações (*Full View*) com layout em duas colunas, menu de abas temáticas e design de alto padrão, isolando a governança administrativa do fluxo diário de tarefas.

**Independent Test**: Clicar em "Configurações" no cabeçalho ou sidebar, verificar a abertura da tela em tela cheia com duas colunas, navegar pelas 4 abas (*Geral*, *Espaços*, *Políticas*, *Dados*) e retornar com 1 clique através do botão "← Voltar ao Quadro".

### Testes de Interface para US2
- [X] T012 [P] [US2] Create component tests for `SettingsView` in `tests/unit/SettingsView.test.tsx` verifying tab navigation, theme adjustments, and return navigation (Red-Bar). ([#80](https://github.com/rogerteg/Metrik/issues/80))

### Implementação de Componentes para US2
- [X] T013 [P] [US2] Implement `GeneralSettingsTab.tsx` in `src/components/Settings/GeneralSettingsTab.tsx` for themes (Dark, Light, Slate), density scaling, and visual preferences. ([#81](https://github.com/rogerteg/Metrik/issues/81))
- [X] T014 [P] [US2] Implement `WorkspacesSettingsTab.tsx` in `src/components/Settings/WorkspacesSettingsTab.tsx` for workspace management, name editing, HSL color palette pickers, and member role assignments. ([#82](https://github.com/rogerteg/Metrik/issues/82))
- [X] T015 [P] [US2] Implement `BoardPoliciesTab.tsx` in `src/components/Settings/BoardPoliciesTab.tsx` for suggested WIP limits, column configurations, and flow policies. ([#83](https://github.com/rogerteg/Metrik/issues/83))
- [X] T016 [P] [US2] Implement `DataPortabilityTab.tsx` in `src/components/Settings/DataPortabilityTab.tsx` housing JSON export, backup import, demo restore, and safe board clear dialog. ([#84](https://github.com/rogerteg/Metrik/issues/84))
- [X] T017 [US2] Assemble `SettingsView.tsx` in `src/components/Settings/SettingsView.tsx` with 2-column layout, left category navigation, right content cards, and "← Voltar ao Quadro" header button. ([#85](https://github.com/rogerteg/Metrik/issues/85))
- [X] T018 [US2] Connect Settings launcher in `src/App.tsx` and wire navigation between `'settings'` and other views (Green-Bar). ([#86](https://github.com/rogerteg/Metrik/issues/86))

**Checkpoint**: User Story 2 completamente funcional e integrada de forma independente.

---

## Phase 5: User Story 3 - Criação e Filtro de Espaços e Quadros (Priority: P3)

**Goal**: Permitir o cadastro simplificado de novos espaços e quadros com modal dedicado e habilitar a busca em tempo real na barra em formato de pílula (*Pill Filter*).

**Independent Test**: Digitar um termo na barra de filtro em pílula e verificar o isolamento instantâneo de cartões; clicar em "+ Novo painel" e registrar um novo espaço com nome e cor definida.

- [X] T019 [US3] Implement `CreateWorkspaceModal.tsx` in `src/components/WorkspaceHub/CreateWorkspaceModal.tsx` with name input, HSL color palette selector, description, and save handler. ([#87](https://github.com/rogerteg/Metrik/issues/87))
- [X] T020 [US3] Implement real-time filtering in `WorkspaceHub.tsx` filtering both favorites and grid boards by title or tags based on the pill filter input. ([#88](https://github.com/rogerteg/Metrik/issues/88))

---

## Phase 6: Polish, Design System & Cross-Cutting Concerns

**Purpose**: Refinamentos estéticos enterprise, acessibilidade WCAG 2.1 AA e garantia de regressão zero.

- [X] T021 [P] Implement complete CSS styling in `src/App.css` for WorkspaceHub, pill filter, favorite cards with subtle elevation, and 2-column SettingsView layout across Dark, Light, and Slate themes. ([#89](https://github.com/rogerteg/Metrik/issues/89))
- [X] T022 [P] Audit and enforce accessibility in `src/components/WorkspaceHub/` and `src/components/Settings/` (`outline: 2px solid #38bdf8` focus rings, aria-labels, and Escape key listeners). ([#90](https://github.com/rogerteg/Metrik/issues/90))
- [X] T023 Run full automated verification suite (`npm test` and `npm run build`) ensuring zero regressions across all 394+ tests. ([#91](https://github.com/rogerteg/Metrik/issues/91))
- [X] T024 Verify visual appearance and layout parity via browser subagent in `http://localhost:5173/`, capturing screenshots of both WorkspaceHub and SettingsView. ([#92](https://github.com/rogerteg/Metrik/issues/92))

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup & Models (Phase 1)**: Sem dependências — inicia imediatamente.
- **Foundational Hooks (Phase 2)**: Depende de Phase 1 — BLOQUEIA componentes visuais.
- **US1 - Workspace Hub (Phase 3)**: Depende de Phase 2 — MVP de navegação e favoritos.
- **US2 - Separate Settings (Phase 4)**: Depende de Phase 2 — pode executar em paralelo com US1.
- **US3 - Creation & Filtering (Phase 5)**: Depende de US1 e US2.
- **Polish & QA (Phase 6)**: Depende da conclusão das histórias desejadas.

### Parallel Opportunities
- T002 e T004 (testes e hooks) podem executar em paralelo.
- T006, T007, T008 (componentes do Hub) podem ser desenvolvidos em paralelo.
- T013, T014, T015, T016 (abas de configurações) podem ser desenvolvidas em paralelo.
- T021 e T022 (estilização CSS e acessibilidade) sincronizados.

---

## Implementation Strategy & Status

### MVP Scope (User Story 1 Only)
1. Concluir Phase 1 (Tipagens) + Phase 2 (Hooks e persistência).
2. Concluir Phase 3 (Workspace Hub com navegação lateral e favoritos).
3. Validar no navegador o funcionamento do Hub antes de avançar para as telas seguintes.

### Entrega Incremental
- **Incremento 1**: Workspace Hub funcional com vitrine de favoritos (MVP).
- **Incremento 2**: Módulo Separado de Configurações Full View com 4 abas temáticas.
- **Incremento 3**: Modal de criação de novos espaços e busca em tempo real em pílula.
- **Incremento 4**: Polimento visual, conformidade WCAG 2.1 AA e suíte completa verde.
