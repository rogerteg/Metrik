# Tasks: Feature 020 - Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Fundamento do Envelhecimento de WIP (Lei de Little / Daniel Vacanti):**
  - O tempo de ciclo só é medido quando um item termina; o envelhecimento do WIP mede o tempo enquanto ele está vivo no sistema.
  - Para qualquer tarefa ativa $i$, sua idade na data de referência $T_{\text{ref}}$ é dada por:
    $$\text{Age}_i = \frac{T_{\text{ref}} - \text{startedAt}_i}{86.400.000\text{ ms}}$$
  - **Pace Percentiles por Etapa:** Para cada coluna $C$, os percentis históricos $P_{50}(C)$, $P_{70}(C)$, $P_{85}(C)$ e $P_{95}(C)$ representam os limites empíricos de tempo que tarefas já concluídas levaram até aquela etapa.
  - **Invariante Geométrica:** Se uma tarefa ativa tem $\text{Age}_i > P_{95}(C)$, ela já envelheceu mais do que 95% de todos os itens já concluídos naquela mesma etapa, exigindo intervenção imediata para evitar quebra de SLE.

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Sobreposição e oclusão de pontos com idades idênticas):** Várias tarefas criadas no mesmo lote/dia ficam empilhadas no mesmo pixel no SVG.
  - *Mitigação:* Aplicar algoritmo de dispersão horizontal determinística (*deterministic jitter*) baseado no ID da tarefa dentro da largura da coluna, garantindo que todos os pontos permaneçam individualmente clicáveis e visíveis.
- **Modo de Falha 2 (Distorção de percentis em colunas sem histórico):** Colunas novas ou com poucas tarefas concluídas (< 3 amostras) teriam percentis zerados ou caóticos.
  - *Mitigação:* Fallback automático para os percentis globais de ciclo ponderados pelo índice relativo da etapa no workflow.
- **Modo de Falha 3 (Canvas comprimido em telas médias):** Painéis laterais ocupando a maior parte da largura da viewport.
  - *Mitigação:* Implementar gavetas retráteis (*drawers colapsáveis duais*) à esquerda e à direita com botões de toggle elegantes, deixando 100% da área útil do canvas visível por padrão.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Math & Aging Metrics Logic**: Funções puras em `src/utils/wipAgingMetrics.ts` e testes puros em `tests/unit/wipAgingMetrics.test.ts`.
- **Phase 2: Visual SVG Chart Component**: Gráfico com colunas, faixas de percentil, contagem de WIP e pontos em `src/components/charts/WipAgingChart.tsx`.
- **Phase 3: Dual Collapsible Drawers**: Gaveta de filtros à esquerda (`WipAgingFilterDrawer.tsx`) e de controles à direita (`WipAgingControlDrawer.tsx`).
- **Phase 4: Integrated View & Navigation**: Componente mestre `src/components/WipAgingView.tsx`, aba `wip` em `AnalyticsNavHeader.tsx` e renderização no `AnalyticsDashboard.tsx`.
- **Phase 5: Styling & Polish**: CSS enterprise no `Analytics.css` cobrindo faixas coloridas, pontos com status de bloqueio, gavetas e tooltips.
- **Phase 6: Quality Gate & Full Verification**: Suíte de testes unitários (234 testes existentes + novos testes passando 100%).

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Bibliotecas externas como Recharts/Chart.js):** Poda mandatória pelo Princípio V da Constituição (Simplicidade & YAGNI) - SVG vetorial nativo puro de alto desempenho e zero impacto de bundle.
- **Alternativa Descartada (Painéis fixos lado a lado):** Poda em conformidade com a resposta do usuário no `/speckit-clarify` - gavetas retráteis preservam a legibilidade do gráfico em resoluções padrão de notebook.
- **Decisão Escolhida:** SVG nativo puro com cálculo de percentis por etapa e gavetas retráteis duais.

---

## Tasks

### Phase 1: Math & Aging Metrics Logic (Core Logic)
- [x] T001 Implement `calculateItemAgeDays(task, referenceDate)` with decimal precision in `src/utils/wipAgingMetrics.ts`
- [x] T002 Implement `calculateStagePacePercentiles(tasks, columns)` with NIST linear interpolation and global fallback in `src/utils/wipAgingMetrics.ts`
- [x] T003 Implement `groupActiveTasksByColumn(tasks, columns, referenceDate)` with WIP counts and blocked detection in `src/utils/wipAgingMetrics.ts`
- [x] T004 Write comprehensive unit tests for WIP aging calculations and stage percentiles in `tests/unit/wipAgingMetrics.test.ts`

### Phase 2: Visual Chart Component (SVG Aging WIP Chart)
- [x] T005 [US1] Implement responsive native SVG chart `src/components/charts/WipAgingChart.tsx` with columns on X-axis, Age on Y-axis, and top `WIP: N` badges
- [x] T006 [US1] Render colored pace percentile background bands (Green, Yellow, Orange, Red) per column with percentile threshold lines (50%, 70%, 85%, 95%)
- [x] T007 [US1] Plot active task dots (`Aging Work Items`) with deterministic horizontal jitter to prevent point overlap
- [x] T008 [US2] Implement rich interactive hover tooltip displaying task ID, title, age in days, time in current stage, and blocked badge in `WipAgingChart.tsx`

### Phase 3: Dual Collapsible Drawers (Dataset Configuration & Chart Controls)
- [x] T009 [US3] Create left collapsible drawer `src/components/charts/WipAgingFilterDrawer.tsx` with workflow selector, start date filter, and `LOAD` button
- [x] T010 [US3] Create right collapsible drawer `src/components/charts/WipAgingControlDrawer.tsx` with percentile visibility checkboxes (50%, 70%, 85%, 95%) and stalled alert toggle
- [x] T011 [US4] Implement `As of [Date]` indicator and empty guidance state in `src/components/WipAgingView.tsx`

### Phase 4: Navigation, Integration & Dashboard
- [x] T012 Update `src/components/AnalyticsNavHeader.tsx` to include `wip` tab (`⏳ WIP Aging`) positioned logically between Throughput and CFD
- [x] T013 Connect `WipAgingView` to `src/components/AnalyticsDashboard.tsx` for the `wip` active tab
- [x] T014 Add styling for aging bands, dots, blocked alerts, collapsible drawers, and tooltips in `src/components/Analytics.css`

### Phase 5: Verification & Quality Gate
- [x] T015 Write UI integration tests for `WipAgingView` and dual drawers in `tests/unit/WipAgingView.test.tsx`
- [x] T016 Run full test suite (`npm test`) and type check to ensure 100% pass rate and zero regressions
