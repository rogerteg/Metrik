# Tasks: Feature 019 - Simulações de Monte Carlo no Gerenciamento de Projetos

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Fundamento Estocástico:**
  - O fluxo de trabalho humano é inerentemente não-determinístico e assimétrico (distribuição com cauda longa).
  - O método de Monte Carlo com amostragem com reposição (*Bootstrap Sampling*) gera previsões calibradas ao re-amostrar iterativamente o Throughput diário empírico observado.
  - **Pergunta "How Many":** Soma de $N$ amostras aleatórias de Throughput em 10.000 ensaios. O quantil 85% ($P_{85}$) representa a entrega que foi igualada ou superada em 85% dos cenários.
  - **Pergunta "When":** Acúmulo estocástico de Throughput diário até atingir $X$ itens de backlog. O quantil 85% ($P_{85}$) representa o prazo em dias em que 85% das trajetórias concluíram todo o escopo.
- **Invariante Matemática:**
  - Em "How Many": $P_{95} \le P_{85} \le P_{50}$ (maior nível de certeza resulta em cota mínima garantida menor ou igual).
  - Em "When": $P_{50} \le P_{85} \le P_{95}$ (maior nível de certeza requer prazo em dias maior ou igual).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Loop infinito no "When" por histórico nulo):** Se o histórico tiver apenas zeros (nenhuma tarefa concluída), o acúmulo nunca atingiria o backlog.
  - *Mitigação:* Validação de guarda estrita: se a soma total de itens do histórico for 0, interrompe antes de simular e informa histórico insuficiente. Adicionalmente, estabelece teto máximo de 365 dias por ensaio.
- **Modo de Falha 2 (Superestimação otimista por exclusão de dias vazios):** Contar apenas dias em que houve entregas elevaria artificialmente a taxa média diária.
  - *Mitigação:* A extração do histórico percorre cada dia do calendário entre o início e fim da janela, atribuindo categoricamente valor `0` a dias sem entregas (fins de semana e dias ociosos).
- **Modo de Falha 3 (Testes automatizados não-determinísticos):** Testes falhando aleatoriamente no CI devido ao uso de `Math.random()`.
  - *Mitigação:* Injeção do gerador pseudoaleatório `(rng?: () => number)` com suporte a gerador determinístico (LCG) com semente fixa nos testes do Vitest.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Math & Stochastic Engine**: Funções puras em `src/utils/monteCarlo.ts` e testes em `tests/unit/monteCarlo.test.ts`.
- **Phase 2: Visual Chart Component**: Histograma e curva cumulativa (CDF) em SVG nativo em `src/components/charts/MonteCarloHistogramChart.tsx`.
- **Phase 3: User Story 1 & 2 - Interactive Simulation Panel**: Componente completo `src/components/MonteCarloSimulationView.tsx` com formulários "How Many" e "When".
- **Phase 4: Navigation Integration**: Inclusão da aba `forecasting` em `AnalyticsNavHeader.tsx` e renderização no `AnalyticsDashboard.tsx`.
- **Phase 5: Styling & Polish**: Regras CSS no `Analytics.css` para cartões de percentil, histograma e responsividade.
- **Phase 6: Quality Gate & Full Verification**: Suíte de testes (219 testes prévios + novos testes passando 100%).

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Web Workers):** Descartada em favor de computação síncrona otimizada em arrays nativos (executa 10.000 ensaios em < 30ms sem a complexidade de IPC).
- **Alternativa Descartada (Chart.js / Plotly):** Descartada em observância ao Princípio V da Constituição (Simplicidade & YAGNI - SVG nativo puro).
- **Decisão Escolhida:** SVG nativo reativo com gradientes, linhas de percentil e tooltip interativo integrado ao design escuro do Metrik.

---

## Tasks

### Phase 1: Math & Stochastic Engine (Core Logic)
- [x] T001 Implement `extractDailyThroughput(tasks, daysWindow)` with mandatory 0-filling for empty days in `src/utils/monteCarlo.ts`
- [x] T002 Implement `runMonteCarloHowMany(throughputHistory, targetDays, trials, rng)` in `src/utils/monteCarlo.ts`
- [x] T003 Implement `runMonteCarloWhen(throughputHistory, backlogItems, startDate, trials, rng)` with calendar date projection in `src/utils/monteCarlo.ts`
- [x] T004 Implement histogram binning and cumulative probability (CDF) helper in `src/utils/monteCarlo.ts`
- [x] T005 Write comprehensive unit tests for Monte Carlo simulation engine with deterministic RNG in `tests/unit/monteCarlo.test.ts`

### Phase 2: Visual Chart Component (SVG Histogram & CDF)
- [x] T006 Implement responsive native SVG histogram component `src/components/charts/MonteCarloHistogramChart.tsx` with bins, frequency bars, and P50/P85/P95 vertical markers
- [x] T007 Implement interactive hover tooltip displaying bin value, trial frequency, and cumulative probability in `MonteCarloHistogramChart.tsx`

### Phase 3: Interactive Simulation View (How Many & When Forms)
- [x] T008 [US1] Implement "How Many" simulation controls (target date / days input) and P50/P85/P95 outcome cards in `src/components/MonteCarloSimulationView.tsx`
- [x] T009 [US2] Implement "When" simulation controls (backlog item count, "Use open board items" quick button) and calendar projected dates in `src/components/MonteCarloSimulationView.tsx`
- [x] T010 Implement sample window selector (last 30, 60, 90 days or all) and trial count selector in `src/components/MonteCarloSimulationView.tsx`
- [x] T011 Implement educational guidance/empty state for boards with insufficient completed task history in `src/components/MonteCarloSimulationView.tsx`

### Phase 4: Navigation & Dashboard Integration
- [x] T012 Update `src/components/AnalyticsNavHeader.tsx` to include `forecasting` tab (`🎲 Monte Carlo`)
- [x] T013 Connect `MonteCarloSimulationView` to `src/components/AnalyticsDashboard.tsx` for the `forecasting` tab
- [x] T014 Add styling for simulation controls, percentile summary cards, histogram bars, and tooltips in `src/components/Analytics.css`

### Phase 5: Verification & Quality Gate
- [x] T015 Write UI integration tests for `MonteCarloSimulationView` and navigation in `tests/unit/MonteCarloSimulationView.test.tsx`
- [x] T016 Run full test suite (`npm test`) and type check to ensure 100% pass rate and zero regressions
