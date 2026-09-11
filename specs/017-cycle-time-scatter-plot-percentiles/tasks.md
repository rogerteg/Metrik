# Tasks: Feature 017 - Cycle Time Scatter Plot Avançado com Percentis e Navegação Analítica

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental da Previsibilidade Ágil:** Médias aritméticas de Lead Time / Cycle Time são falaciosas em distribuições não-gaussianas com caudas longas de variabilidade (*Flaw of Averages*). A previsibilidade real decorre de percentis probabilísticos empíricos ($P_{50}, P_{85}, P_{95}$).
- **Invariante Matemática de Percentis:** Dado um vetor ordenado de tempos de ciclo $V = [v_1, v_2, \dots, v_n]$, o percentil $p$ ($0 < p \le 100$) deve satisfazer monotonicidade estrita: $v_{min} \le P_{50} \le P_{85} \le P_{95} \le v_{max}$. Se $n = 0$, $P_p$ é indefinido (retorna 0 ou traço `-`).
- **Invariante de Projeção Visual:** Cada ponto no gráfico cartesiano deve mapear estritamente:
  - $X$: tempo discreto correspondente ao instante de conclusão (`completedAt`).
  - $Y$: duração contínua de ciclo em dias ($CycleTimeDays = \frac{completedAt - startedAt}{86.400.000}$).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Divisão por zero ou Janela Temporal Nula):** Se todas as tarefas tiverem sido concluídas no mesmo segundo, $windowEnd - windowStart = 0$, causando coordenadas $X = NaN$.
  - *Mitigação:* Assegurar que a janela temporal tenha uma extensão mínima de pelo menos 1 dia (86.400.000 ms), mapeando tarefas com mesma data no centro do dia.
- **Modo de Falha 2 (Amostra Pequena com Poucos Dados):** Se houver apenas 1 ou 2 tarefas concluídas, o cálculo de percentis pode falhar ou produzir números irreais se a fórmula exigir $n > 4$.
  - *Mitigação:* Usar interpolação linear robusta: para $n = 1$, todos os percentis retornam o valor da única tarefa existente; para $n = 0$, retorna 0 com mensagem de empty state.
- **Modo de Falha 3 (Colapso de Responsividade com Painel Retrátil):** Ao abrir o painel lateral em telas estreitas, o gráfico SVG pode ser espremido a ponto de os rótulos de percentil se sobreporem.
  - *Mitigação:* Implementar painel com transição suave `transform: translateX()`, overlay em telas móveis e largura mínima reservada para o gráfico.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Sobreposição):**
  - `Phase 1 (Math & Statistics Core)`: Funções de percentis em `src/utils/statistics.ts` e testes puros em `tests/unit/statistics.test.ts`.
  - `Phase 2 (Foundational Navigation)`: Barra de abas em `src/components/AnalyticsNavHeader.tsx`.
  - `Phase 3 (User Story 1 - Scatter Plot with Percentiles)`: Gráfico `CycleTimeScatterPlot.tsx` com linhas tracejadas e labels.
  - `Phase 4 (User Story 2 - Navigation Integration)`: Integração no `AnalyticsDashboard.tsx` entre abas `Dashboard`, `Cycle Time`, etc.
  - `Phase 5 (User Story 3 - Controls Panel & Blocked Highlight)`: Painel retrátil `ChartControlsPanel.tsx` e estilos em `Analytics.css`.
  - `Phase 6 (Testing & Verification)`: Testes unitários completos e verificação de build.
- **Exaustividade Coletiva (100% dos Requisitos):** Cobre FR-001 a FR-008 e todos os critérios de aceitação.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Bibliotecas externas Chart.js / Recharts):** Descartada para preservar leveza, zero dependências extras e controle nativo via SVG.
- **Alternativa Descartada (Substituir abas globais da aplicação):** Descartada para não alterar a navegação principal (Quadro vs Analytics).
- **Decisão Escolhida:** Módulo utilitário puro em TypeScript + Componentes SVG nativos integrados ao design system escuro do Metrik.

### 5. Critério de Falsificabilidade & Testabilidade (TDD)
- **Critério 1 (Percentis):** Array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`: P50 = 5.5, P85 = 8.65 (ou 8.5/9 conforme interpolação NIST).
- **Critério 2 (Toggle de Linhas):** Desmarcar o switch de 95% remove a linha com classe ou testid `percentile-line-95` do DOM ou oculta sua visibilidade.
- **Critério 3 (Destaque de Bloqueados):** Pontos com `blocked = true` ou `totalBlockedMs > 0` adquirem classe `scatter-point-blocked` ao ativar o toggle de bloqueados.

### 6. Conformidade Constitucional
- **Constituição II & V (Modularity & YAGNI):** Funções e componentes desacoplados sem código especulativo.
- **Constituição III (Automated Verification):** 203 testes mantidos + novos testes unitários.

---

## Tasks

### Phase 1: Math & Statistical Utilities (Core Logic)
- [x] T001 Implement `calculatePercentiles(values: number[], percentiles: number[])` with linear interpolation in `src/utils/statistics.ts`
- [x] T002 Write unit tests for percentile calculation edge cases (empty array, single item, uniform distribution) in `tests/unit/statistics.test.ts`

### Phase 2: Foundational Navigation & Header
- [x] T003 Create `src/components/AnalyticsNavHeader.tsx` with tabs (`Dashboard`, `Cycle Time` with dropdown, `Throughput`, `CFD / Fluxo`, `Bloqueios`)
- [x] T004 Add styling for `AnalyticsNavHeader` and dropdown in `src/components/Analytics.css`

### Phase 3: User Story 1 - Cycle Time Scatter Plot com Linhas de Percentis (Priority: P1)
- [x] T005 [US1] Create `src/components/charts/CycleTimeScatterPlot.tsx` with native SVG rendering, dynamic date and days axis, and scatter dots
- [x] T006 [US1] Render horizontal dashed percentile lines (50%, 85%, 95%) with color-coded labels on the right edge in `src/components/charts/CycleTimeScatterPlot.tsx`
- [x] T007 [US1] Add interactive rich tooltip on dot hover displaying title, cycle time, start/finish dates, and blocked duration in `src/components/charts/CycleTimeScatterPlot.tsx`

### Phase 4: User Story 2 - Integração da Navegação Analítica por Abas (Priority: P1)
- [x] T008 [US2] Update `src/components/AnalyticsDashboard.tsx` to handle tab switching (`dashboard`, `cycle-time`, `throughput`, `cfd`, `blockers`)
- [x] T009 [US2] Render `CycleTimeScatterPlot` in focused full-canvas view when `cycle-time` tab is selected in `src/components/AnalyticsDashboard.tsx`

### Phase 5: User Story 3 - Painel Lateral de Controles e Destaque de Bloqueios (Priority: P2)
- [x] T010 [US3] Create `src/components/charts/ChartControlsPanel.tsx` with collapsible right-side drawer, percentile toggles (50%, 85%, 95%), blocked items highlight toggle, and summary statistics
- [x] T011 [US3] Connect `ChartControlsPanel` state to `CycleTimeScatterPlot` to dynamically toggle percentile lines and color blocked points red in `src/components/charts/CycleTimeScatterPlot.tsx`
- [x] T012 [P] [US3] Add styling in `src/components/Analytics.css` for controls drawer, switches, percentile badge colors, and blocked dots

### Phase 6: Polish, Testing & Verification
- [x] T013 Create unit tests in `tests/unit/CycleTimeScatterPlot.test.tsx` verifying dot rendering, percentile lines visibility toggles, and blocked highlight
- [x] T014 Run full automated test suite (`npm test`) to guarantee all 203+ tests pass without regression
- [x] T015 Run production build (`npm run build`) to verify zero TypeScript errors and bundle integrity
