---
description: "Task list for feature 028 - Admin Menu & Header Layout Reorganization"
---

# Tasks: Feature 028 - Desobstrução do Menu de Administrador e Reorganização do Cabeçalho

**Input**: Design documents from `/specs/028-admin-menu-header-layout/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required), [research.md](research.md), [data-model.md](data-model.md), [contracts/header-layout.contract.md](contracts/header-layout.contract.md), [quickstart.md](quickstart.md)

**Tests**: **Incluídos** — Constituição III e Constituição VI.5 tornam os testes automatizados obrigatórios.

**Organization**: Tarefas agrupadas por histórias de usuário e fases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos distintos, sem dependência bloqueante)
- **[Story]**: História de usuário à qual a tarefa pertence (US1, US2, US3)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Verdades fundamentais e invariantes:**
  - O motor de renderização do navegador organiza elementos em pilhas bidimensionais compostas por *Stacking Contexts*. Se um ancestral não possui contexto de empilhamento explícito superior, qualquer elemento posterior no DOM com propriedade como `backdrop-filter` estabelecerá seu próprio contexto e será desenhado por cima dos elementos anteriores.
  - Portanto, a verdade irredutível é: para que o menu suspenso do cabeçalho flutue incondicionalmente sobre a barra de métricas, o cabeçalho (`.app-header`) **deve** possuir posicionamento e `z-index` superiores aos da barra de métricas (`.metrics-bar`).
  - O cabeçalho é um centro de comando: agrupar itens por função semântica reduz a carga cognitiva do usuário de $O(N)$ desordenado para clusters claros (Navegação, Identidade/Sessão, Operações do Quadro).
- **Premissas acidentais descartadas:**
  - Descartada a premissa de que o problema fosse o tamanho da fonte ou da tela: é estritamente um conflito de contexto de empilhamento CSS.
  - Descartada a necessidade de bibliotecas pesadas de popover (Popper, Floating UI): CSS nativo e React já resolvem com precisão cirúrgica sem dependências extras.

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)

- **Cenário de Falha 1: Dropdown passa por cima de modais.**
  - *Falha:* Aumentar excessivamente o `z-index` do cabeçalho faz com que o menu ou o cabeçalho fiquem por cima do `TeamManagementModal` ou `TaskDetailsModal`.
  - *Mitigação:* Manter escala estrita: `.app-header` (`z-index: 50`), `.user-profile-dropdown` (`z-index: 1000`), enquanto modais permanecem em `z-index: 2000+`.
- **Cenário de Falha 2: Quebra em telas estreitas (responsividade).**
  - *Falha:* A reorganização dos botões em clusters causa estouro horizontal da barra superior em telas de 1024px/1280px.
  - *Mitigação:* Usar `flex-wrap: wrap`, gaps proporcionais e testar resoluções de desktop comuns.
- **Cenário de Falha 3: Fechamento acidental do menu ao clicar em ações internas.**
  - *Falha:* Clicar em "Cadastrar Novo Usuário" ou inputs do form aciona listener de fechar o menu.
  - *Mitigação:* Manter `containerRef.contains(e.target)` e `e.stopPropagation()` onde apropriado.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

- **Mutuamente Exclusivas:**
  - `src/App.css`: Estilização das camadas (`z-index`), clusters e espaçamentos.
  - `src/App.tsx`: Reestruturação da marcação JSX de `.header-actions` em clusters.
  - `src/components/UserProfileMenu.tsx`: Suporte a teclado (`Escape`) e classes de foco.
  - `tests/unit/UserProfileMenu.test.tsx`: Testes de interação e eventos do menu.
- **Coletivamente Exaustivas:**
  - US1 (Desobstrução do menu de Administrador) → T001, T002, T004.
  - US2 (Reorganização dos controles e espaçamento) → T003, T004, T005.
  - US3 (Integridade entre temas e regressão) → T006, T007.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)

- **Alternativa A: Mover a barra de métricas para a lateral ou rodapé.**
  - *Poda:* Alteraria drasticamente a experiência central do produto e o fluxo de leitura Kanban. Podada em favor de manter a posição superior da barra de métricas com respiro visual e sobreposição correta.
- **Alternativa B: Fazer o menu de Administrador abrir como um modal em tela cheia.**
  - *Poda:* Excesso de atrito para tarefas simples de troca de perfil de usuário. Podada em favor de um dropdown elegante e desobstruído.
- **Alternativa C (Escolhida): Stacking context cirúrgico + Agrupamento em clusters.**
  - *Critério:* Solução leve, rápida, preserva os componentes existentes e entrega visual premium sem nenhuma dependência.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

- **Red-Bar:** Teste em `UserProfileMenu.test.tsx` verificando que a tecla `Escape` fecha o menu falha antes da implementação.
- **Green-Bar:** `Escape` fecha o menu; `.app-header` e `.user-profile-dropdown` possuem as classes e regras de empilhamento; suíte completa verde.

### 6. Triangulação Adversarial & Verificação da Constituição

- **I. SDD:** Spec, plano, contrato e checklist criados antes do código.
- **II. Modularidade:** Classes CSS e componentes com separação estrita de responsabilidades.
- **III. Verificação:** Testes automatizados + inspeção com browser subagent.
- **V. YAGNI:** Sem bibliotecas externas.
- **VII. Independência de Marca:** Terminologia neutra.
- **VIII. Local-First:** Nenhuma alteração no armazenamento local.

---

## Phase 1: Setup & Foundational Stacking Fix

- [X] T001 [US1] Apply explicit positioning and stacking context in `src/App.css` (`.app-header` with `position: relative; z-index: 50;`, `.metrics-bar` with `position: relative; z-index: 10;`, and `.user-profile-dropdown` with `z-index: 1000; top: calc(100% + 10px);`).

---

## Phase 2: User Story 1 - Desobstrução do Menu de Administrador (Priority: P1) 🎯 MVP

- [X] T002 [P] [US1] Extend `tests/unit/UserProfileMenu.test.tsx` with test verifying that pressing `Escape` closes the open dropdown.
- [X] T003 [US1] Implement `Escape` key listener and active state styling in `src/components/UserProfileMenu.tsx`.

---

## Phase 3: User Story 2 - Reorganização e Harmonização do Cabeçalho (Priority: P2)

- [X] T004 [US2] Reorganize `.header-actions` in `src/App.tsx` into semantic clusters (`header-nav-cluster`, `header-session-cluster`, `header-board-ops-cluster`).
- [X] T005 [US2] Add layout styles, dividers, and spacing for header clusters in `src/App.css`.

---

## Phase 4: User Story 3 - Integridade de Empilhamento e Regressão (Priority: P3)

- [X] T006 [P] [US3] Run full test suite (`npm test`) and build check (`npm run build`) ensuring zero regressions.
- [X] T007 [US3] Verify visual appearance via browser subagent in `http://localhost:5173/`, taking screenshots of the open Administrador dropdown over the metrics bar.
- [X] T008 Review and close `specs/028-admin-menu-header-layout/checklists/requirements.md`.
