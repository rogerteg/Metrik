# Tasks: Feature 022 - Configuração de Temas — Claro, Escuro e Neutro (Theme Configuration)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Fundamento da Ergonomia Visual em Sistemas de Gestão de Fluxo:**
  - O contraste de cor não é meramente decorativo; é uma ferramenta cognitiva fundamental para tomada de decisão em tempo real sob diferentes condições de iluminação ambiental.
  - O Metrik possui um design system centrado em variáveis CSS (`:root`). Mudar de tema resume-se matematicamente a remapear o conjunto de variáveis semânticas $\{V_{\text{bg}}, V_{\text{surface}}, V_{\text{text}}, V_{\text{border}}\}$ para novos valores hexadecimais/rgba que satisfaçam a taxa de contraste mínima WCAG AA ($\ge 4.5:1$ para textos e $\ge 3:1$ para elementos gráficos de controle).
  - **Invariante do Elemento Raiz (`<html>`):**
    - A definição do atributo `data-theme` no elemento raiz `document.documentElement` propaga instantaneamente a cascata CSS para todos os nós do DOM (incluindo overlays, modais, tooltips e elementos teleportados), com tempo de execução $\le 16\text{ ms}$ (60fps) e zero overhead de recálculo de dados analíticos ou re-renderização de árvores pesadas de componentes React.
  - **Invariante da Prevenção de FOUC (*Flash of Unstyled Theme*):**
    - O tema ativo deve ser lido do `localStorage` no momento da inicialização do estado do hook e aplicado síncronamente ao DOM antes da renderização visual, impedindo o "piscar" indesejado do tema escuro padrão para usuários com preferência "Claro" ou "Neutro".

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (FOUC no carregamento inicial):** Se a aplicação renderizar o DOM antes de aplicar o atributo `data-theme`, o usuário verá a tela piscar em preto antes de mudar para branco no modo claro.
  - *Mitigação:* O hook `useTheme` inicializa seu estado diretamente a partir do `localStorage` síncrono e aplica imediatamente `setAttribute('data-theme', theme)` no `document.documentElement` no ciclo de vida inicial.
- **Modo de Falha 2 (Falha ou exceção de `localStorage` em contextos restritos):** Em abas anônimas com bloqueio de cookies/storage, chamadas diretas a `localStorage.getItem` ou `setItem` lançam `DOMException` (ex: `SecurityError`), quebrando a montagem do Metrik.
  - *Mitigação:* Envolver todas as operações de `localStorage` em blocos defensivos `try/catch` com fallback seguro e silencioso para o modo padrão `'dark'`.
- **Modo de Falha 3 (Cores brancas ou escuras hardcoded invisíveis):** Textos, bordas ou títulos com gradientes fixos (`#f8fafc` para `#94a3b8`) tornarem-se invisíveis quando o fundo for alterado para branco (`#ffffff`).
  - *Mitigação:* Auditar e converter gradientes de texto e botões secundários para consumir variáveis de texto semânticas ou regras específicas com o seletor `[data-theme="light"]`.
- **Modo de Falha 4 (Desconexão em múltiplas abas abertas):** O usuário altera o tema para Claro em uma aba, mas a outra aba continua no tema antigo até ser recarregada.
  - *Mitigação:* Adicionar listener no `window.addEventListener('storage', ...)` para sincronizar o tema ativamente entre abas abertas.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Setup & Design Tokens Scaffolding**:
  - Tipagem TypeScript `ThemeMode` e tokens semânticos em `App.css` (não se sobrepõe à lógica de estado nem à UI).
- **Phase 2: Foundational Hook & Persistence Engine**:
  - Testes unitários do hook e implementação de `useTheme.ts` com manipulação do DOM e `localStorage` (lógica desacoplada de apresentação).
- **Phase 3: User Story 1 & 2 - Theme Selection & Immediate Persistence (P1) — MVP**:
  - Testes unitários do componente `ThemeSelector.tsx`, implementação do seletor segmentado acessível, estilização e integração no cabeçalho do `App.tsx`.
- **Phase 4: User Story 3 - Visual Coherence Across Kanban, Modals & Analytics (P2)**:
  - Adaptação dos estilos de cartões, colunas, modais de tarefas e quadros, e gráficos SVG analíticos para garantir contraste em Claro e Neutro.
- **Phase 5: Automated Verification, Quality Gate & Quickstart**:
  - Execução de testes dedicados, suíte completa de regressão e build de produção.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Bibliotecas de temas como Tailwind, styled-components ou theme-ui):** Poda mandatória pelo Princípio V da Constituição (Simplicidade & YAGNI) - CSS nativo puro sem impacto no bundle.
- **Alternativa Descartada (Classes CSS em múltiplos elementos individuais):** Poda por fragilidade - o atributo `data-theme` no `<html>` garante herança cascateada perfeita para todos os nós da árvore DOM.
- **Alternativa Descartada (Botão toggle binário claro/escuro):** Poda por violação de requisitos funcionais (FR-001) - o Metrik requer suporte explícito aos 3 modos (Claro, Escuro e Neutro).

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Os testes `tests/unit/useTheme.test.ts` e `tests/unit/ThemeSelector.test.tsx` falham inicialmente pois os módulos ainda não existem.
- **Critério determinístico de aceite (Green Bar):**
  - Todos os novos testes unitários passam com 100% de sucesso.
  - A suíte completa de testes (255 testes legados + novos testes) executa com 0 falhas.
  - `npm run build` compila sem erros de tipagem.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - **Princípio I (SDD):** Todas as tarefas rastreáveis para `spec.md` e `plan.md`.
  - **Princípio II (Qualidade & Modularidade):** Hook isolado, componente atômico sem dependências circulares.
  - **Princípio III (Verificação Automatizada):** Testes unitários com Vitest e React Testing Library.
  - **Princípio V (Simplicidade):** Zero dependências externas adicionadas ao `package.json`.
  - **Princípio VII (Independência de Marca):** Nomenclatura proprietária *Metrik Theme System*.

---

## Phase 1: Setup & Design Tokens Scaffolding

**Purpose**: Definição da tipagem TypeScript e tokens de design CSS para os 3 temas

- [x] T001 [P] Define TypeScript types `ThemeMode`, `ThemeOption`, `UseThemeReturn` and constant `THEME_STORAGE_KEY` in `src/types/theme.ts`
- [x] T002 [P] Define CSS variable design tokens for `:root, [data-theme="dark"]`, `[data-theme="light"]`, and `[data-theme="neutral"]` in `src/App.css`

---

## Phase 2: Foundational Hook & Persistence Engine

**Purpose**: Infraestrutura de estado, persistência em localStorage e sincronização do DOM

- [x] T003 [P] Write unit tests for `useTheme` hook covering default 'dark' mode, local storage persistence, DOM `data-theme` attribute mutation, and safe storage error handling in `tests/unit/useTheme.test.ts`
- [x] T004 Implement `useTheme` hook with synchronous DOM attribute mutation, safe `localStorage` read/write, and cross-tab storage listener in `src/hooks/useTheme.ts`

**Checkpoint**: Camada foundational pronta — o hook pode ser consumido de forma isolada e testável.

---

## Phase 3: User Story 1 & 2 - Theme Selection & Immediate Persistence (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário alternar entre Claro, Escuro e Neutro através de um seletor no cabeçalho, com persistência automática no localStorage.

**Independent Test**: Clicar no botão "Claro" ativa imediatamente o tema claro e adiciona `data-theme="light"` ao `<html>`. Recarregar a página mantém o tema claro ativo. Clicar em "Neutro" ativa `data-theme="neutral"`. Clicar em "Escuro" restaura `data-theme="dark"`.

### Tests for User Story 1 & 2
- [x] T005 [P] [US1] Write unit tests for `ThemeSelector` component covering rendering of 3 segmented options, active state highlighting, accessibility attributes, and click callback in `tests/unit/ThemeSelector.test.tsx`

### Implementation for User Story 1 & 2
- [x] T006 [US1] Implement `ThemeSelector` component with accessible segmented control (☀️ Claro, 🌙 Escuro, ⚖️ Neutro), `role="group"`, `aria-label="Selecionar tema"`, `aria-pressed`, and keyboard focus in `src/components/ThemeSelector.tsx`
- [x] T007 [US1] Add styles for `.theme-selector`, segmented button options, active pill highlight, and responsive wrapping in `src/App.css`
- [x] T008 [US1, US2] Integrate `useTheme` and `ThemeSelector` into `src/App.tsx` header actions bar, ensuring immediate reactive theme switching and persistent state

**Checkpoint**: User Story 1 e 2 totalmente funcionais e testáveis de forma independente no cabeçalho.

---

## Phase 4: User Story 3 - Visual Coherence Across Kanban, Modals & Analytics (Priority: P2)

**Goal**: Garantir coerência estética e contraste adequado (WCAG AA) em todo o sistema (Quadro Kanban, Modais e Gráficos de Fluxo).

**Independent Test**: Navegar para o Quadro Kanban e para a aba Analytics nos 3 temas, conferindo que todos os textos, cartões, eixos SVG, linhas de grade, tooltips e modais mantêm alto contraste e legibilidade.

### Implementation for User Story 3
- [x] T009 [US3] Refine brand header, logo gradient, action buttons (`.btn-secondary`), and scrollbar styles for light and neutral themes in `src/App.css`
- [x] T010 [US3] Harmonize task cards, stagnant cards, blocked cards, priority badges, and tag pills for high contrast in light and neutral themes in `src/App.css`
- [x] T011 [US3] Update modal dialogs (`Modal.css` and `TaskDetailsModal.css`) to use semantic surface and border variables in `src/components/Modal.css` and `src/components/TaskDetailsModal.css`
- [x] T012 [US3] Adjust Analytics dashboard containers, chart expansion modals, tooltips, and grid lines for light and neutral themes in `src/components/Analytics.css`

**Checkpoint**: Todos os componentes da aplicação adaptados harmoniosamente aos 3 temas.

---

## Phase 5: Verification, Quality Gate & Polish

**Purpose**: Verificação completa automatizada, garantia de zero regressões e conformidade de build

- [x] T013 [P] Execute dedicated theme test suite (`npx vitest run tests/unit/useTheme.test.ts tests/unit/ThemeSelector.test.tsx`)
- [x] T014 Execute full regression test suite (`npm test`) ensuring 100% pass rate across all 255 existing tests plus new tests
- [x] T015 Run type checking and production build (`npm run build`) ensuring zero TypeScript and bundle errors

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende de Phase 1 — BLOQUEIA a integração de UI.
- **User Story 1 & 2 (Phase 3)**: Depende de Phase 2 — entrega o MVP funcional.
- **User Story 3 (Phase 4)**: Depende de Phase 3 — refina contraste global de componentes.
- **Verification (Phase 5)**: Depende da conclusão de todas as fases.

---

## Parallel Opportunities

- `T001` (Tipagem) e `T002` (Tokens CSS) podem ser executados em paralelo.
- `T003` (Testes do hook) e `T005` (Testes do seletor) podem ser preparados em paralelo.
- `T011` (Modais) e `T012` (Analytics) podem ser trabalhados em paralelo.
