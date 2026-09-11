# Tasks: Feature 016 - Clean Board Layout (Inspirado no Businessmap / Kanbanize)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental de Ergonomia Visual (Signal-to-Noise Ratio):** Uma interface enterprise de gestão de fluxo deve maximizar a transmissão de informação contextual (estado, prioridade, bloqueio, gargalo) enquanto minimiza a sobrecarga cognitiva e elementos puramente decorativos (sombras pesadas, fundos saturados).
- **Invariante de Altura do Card:** A densidade horizontal e vertical de um quadro Kanban é proporcional à previsibilidade de leitura. Permitir que metadados extensos (critérios de aceitação e cenários de testes) fiquem compactados por padrão com toggle inline sob demanda impede que os cards estiquem a coluna de forma assimétrica.
- **Invariante de Associação de Cor:** A cor da coluna é um atributo de ancoragem e reconhecimento de etapa. No modelo Businessmap, a ancoragem deve ocorrer por uma faixa lateral sólida de 3px a 4px (`borderLeft`), preservando o fundo do card em dark slate neutro (`#1e293b`). A hierarquia de bordas é estrita: `Bloqueado (#ef4444) > Estagnado (#8B4513) > Cor da Coluna`.

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Regressão de Testes Unitários de Busca de Campos):** Testes existentes em `Task.test.tsx` buscam diretamente por campos de Critérios de Aceitação ou Cenários de Testes (`getByPlaceholderText('Critérios de aceitação...')`). Se o toggle inline ocultar completamente os campos sem renderizá-los ou sem permitir expansão automática, os testes quebrarão.
  - *Mitigação:* O estado inicial de expansão deve considerar se o card já possui conteúdo preenchido ou manter o DOM acessível com classes colapsadas/transições CSS sutis, ou expor o toggle com data-testid claro e garantir que os testes continuem verdes.
- **Modo de Falha 2 (Distorção no Drag-and-Drop ao Expandir Cards):** Se um usuário arrastar um card enquanto este está expandido, as dimensões dinâmicas podem gerar salto de altura no cálculo de drop target (`midY = rect.top + rect.height / 2`).
  - *Mitigação:* Assegurar que os seletores de drag (`handleDragOver`) calculem a posição dinamicamente com base no `getBoundingClientRect()` do container e que a linha indicadora `task-card-drop-before` / `task-card-drop-after` utilize `border` suave sem alterar o layout flow.
- **Modo de Falha 3 (Baixa Visibilidade dos Botões de Ação):** Se os botões de navegação e exclusão utilizarem opacidade excessivamente baixa ou desaparecerem totalmente fora do hover, usuários em dispositivos touch (iPad/tablets) não conseguirão utilizá-los.
  - *Mitigação:* Estabelecer `opacity: 0.6` persistente (com contraste testado) e transição para `opacity: 1.0` no `:hover` e `:focus-within`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Sobreposição):**
  - `Phase 1 (Setup & Design Tokens)`: Definição das variáveis de cores, superfícies e scrollbars limpas em `src/App.css`.
  - `Phase 2 (Foundational Grid & Columns)`: Modernização de `WipLimitBadge.tsx`, cabeçalhos compactos em `Column.tsx` e grid em `Board.tsx`.
  - `Phase 3 (User Story 1 - Grid & Headers)`: Ajustes visuais das colunas e avisos de WIP.
  - `Phase 4 (User Story 2 - Task Cards & Quality Fields)`: Reestruturação do cabeçalho do card, faixa lateral de cor, toggle inline de QA em `Task.tsx` e refinamento do rodapé.
  - `Phase 5 (User Story 3 - Interactive DnD States)`: Transições fluidas de drop target e hover.
  - `Phase 6 (Polish & Test Suite)`: Testes unitários atualizados em `Task.test.tsx` e compilação de produção.
- **Exaustividade Coletiva (100% dos Requisitos):** Atende integralmente FR-001 a FR-009 da especificação e todas as 3 decisões da sessão de clarificação.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Campos de QA restritos ao modal de detalhes):** Descartada pois quebra o fluxo rápido do desenvolvedor que deseja inspecionar ou marcar critérios diretamente no board sem transicionar de tela.
- **Alternativa Descartada (Cores de coluna aplicadas como fundo translúcido saturado):** Descartada porque gera poluição visual em boards com 5+ colunas coloridas, ferindo o padrão limpo do Businessmap.
- **Decisão Adotada:** Faixa lateral sólida de 3px a 4px com corpo dark slate elegante e toggle inline de 1 clique para critérios e cenários.

### 5. Critério de Falsificabilidade & Testabilidade (TDD)
- **Critério 1:** Ao renderizar um card com cor de coluna `#10b981`, o elemento `article` deve possuir estilo `borderLeft: 3px solid #10b981` (ou 4px) e não aplicar fundos espalhafatosos.
- **Critério 2:** O cabeçalho de coluna renderiza a badge de contagem de tarefas e WIP limit em formato compacto e não rompe o alinhamento mesmo com limite de 12 colunas.
- **Critério 3:** Clicar no botão de toggle inline de QA alterna a visualização entre o resumo compacto e a edição completa dos textareas.

### 6. Conformidade Constitucional
- **Constituição II (Clean Architecture & Modularity):** Modificações estéticas puramente declarativas, sem introdução de novas bibliotecas ou acoplamento indevido.
- **Constituição III (Automated Verification):** 202 testes unitários mantidos 100% passando com `npm test` e compilação de produção aprovada com `npm run build`.
- **Constituição V (Simplicity & YAGNI):** Zero complexidade desnecessária; soluções nativas CSS e componentes React existentes.

---

## Tasks

### Phase 1: Setup & Design Tokens
- [x] T001 Define design system tokens in `src/App.css` for Businessmap-inspired palette (`--bg-board: #0b0f19`, `--bg-column: #121a2d`, `--bg-card: #1e293b`, subtle borders, and scrollbars)

### Phase 2: Foundational Components (Grid & WIP Badge)
- [x] T002 Refactor `src/components/WipLimitBadge.tsx` to render a modern minimalist pill badge (`currentCount/limit`) with subtle styling and soft amber warning when overloaded

### Phase 3: User Story 1 - Grid e Colunas do Board Estilo Businessmap (Priority: P1)
- [x] T003 [US1] Compact and harmonize column headers in `src/components/Column.tsx` (unify drag handle, title badge, lock indicator, and action buttons in a balanced row)
- [x] T004 [US1] Refine column layout and separator borders in `src/components/Board.tsx` and `src/App.css` for clear enterprise column distinction without harsh drop shadows
- [x] T005 [P] [US1] Style the "Nova Coluna" card in `src/components/Board.tsx` and `src/App.css` to match the clean dashed Businessmap aesthetic

### Phase 4: User Story 2 - Cartões de Tarefa com Visual Clean e Organização de Metadados (Priority: P1)
- [x] T006 [US2] Reorganize `task-card-header` in `src/components/Task.tsx` into a clean single-row header (Priority badge on the left, compact Blocked/Stagnant badges on the right)
- [x] T007 [US2] Implement inline expand/collapse toggle for Acceptance Criteria and Test Scenarios in `src/components/Task.tsx` with clean micro-box presentation
- [x] T008 [US2] Standardize subtle left-border column color accent (`borderLeft: 3px solid ${effectiveCardColor}`) with clean dark slate background in `src/components/Task.tsx` and `src/App.css`
- [x] T009 [US2] Update task footer in `src/components/Task.tsx` and `src/App.css` with persistent 0.6 opacity for directional step buttons and delete icon (smooth 1.0 hover/focus transition)

### Phase 5: User Story 3 - Estados Interativos e Feedback de Drag-and-Drop Harmoniosos (Priority: P2)
- [x] T010 [US3] Refine drop target indicators and drag overlay transitions in `src/App.css` to eliminate visual jumping and maintain sleek border accents

### Phase 6: Polish, Testing & Verification
- [x] T011 Update and expand unit tests in `tests/unit/Task.test.tsx` to assert new clean header layout, inline QA toggle behavior, and column border styling
- [x] T012 Run full automated test suite (`npm test`) to guarantee all 202+ tests pass without regression
- [x] T013 Run production build (`npm run build`) to verify zero TypeScript or bundle warnings
