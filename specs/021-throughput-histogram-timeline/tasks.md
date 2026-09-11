# Tasks: Feature 021 - Gráfico de Vazão Avançado com Histograma e Linha do Tempo (Throughput Analytics)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Fundamento da Vazão (*Throughput*) na Previsibilidade de Fluxo (Daniel Vacanti / Padrão NIST):**
  - A vazão representa o número discreto de itens de trabalho concluídos por unidade temporal (no Metrik, por dia de calendário).
  - Um gráfico temporal tradicional que apenas lista "itens por dia" não responde: *"Qual a probabilidade empírica de entregarmos $K$ itens em um dia qualquer?"*.
  - O **Throughput Histogram** converte a série temporal diária em uma distribuição de frequências empíricas discretas:
    $$\text{Bin}(k) = \sum_{d \in D} [ \text{count}(d) == k ], \quad k \in \{0, 1, 2, \dots, \max\}$$
  - **Invariante Crítica dos Dias Zerados:** Dias sem conclusões (como sábados, domingos e dias sem deploy) **devem** ser incluídos com contagem 0 no conjunto de amostras $D$. Omitir dias zerados introduziria viés severo de superestimação de capacidade.
  - **Percentis NIST no Histograma:** Os percentis P50, P70, P85 (SLE) e P95 são calculados sobre o conjunto ordenado de vazões diárias de todos os dias do período. As linhas verticais correspondentes no histograma demarcam a capacidade com diferentes níveis de certeza empírica.
  - **Daily Run Chart (Linha do Tempo):** Conecta cronologicamente cada $(d_i, \text{count}(d_i))$ com linha e vértices pontuais para diagnosticar a estabilidade do processo (tendências, ciclos, lotes volumosos e variações anômalas).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Viés de dias vazios ausentes):** Se uma consulta filtrar apenas tarefas existentes agrupadas por data de conclusão, os dias sem entrega não aparecerão na série, fazendo o P85 e a média parecerem artificialmente altos e eliminando a barra do 0 no histograma.
  - *Mitigação:* Percorrer iterativamente cada dia de calendário no intervalo selecionado (`start` até `end`) preenchendo obrigatoriamente com `count: 0` quando não houver tarefas concluídas.
- **Modo de Falha 2 (Eixo X truncado ou desalinhado com vazão zero):** O histograma começar em 1 em vez de 0, ou as barras de vazão não terem largura proporcional.
  - *Mitigação:* Garantir que a escala X do histograma sempre inicie em 0 e vá até $\max(\text{vazão diária})$.
- **Modo de Falha 3 (Performance e peso de SVG em janelas longas):** Em janelas de 90+ dias, a renderização de muitos círculos e linhas no run chart pode degradar performance se houver re-renders desnecessários.
  - *Mitigação:* Cálculos memoizados com `useMemo` e renderização SVG vetorizada leve sem elementos supérfluos, garantindo tempo de execução $\le 30\text{ ms}$.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Phase 1: Math & Throughput Metrics Logic**: Utilitários puros em `src/utils/throughputMetrics.ts` e testes unitários em `tests/unit/throughputMetrics.test.ts` (cálculo de série diária, histograma, percentis NIST, média e moda).
- **Phase 2: Native SVG Chart Components**:
  - `ThroughputHistogramChart.tsx`: Histograma com barras azuis, linhas verticais pontilhadas de percentis (50%, 70%, 85%, 95%) e tooltips.
  - `ThroughputRunChart.tsx`: Run chart diário cronológico com linha contínua, marcadores pontuais e tooltips.
- **Phase 3: Integrated View & Controls**:
  - `ThroughputAnalyticsView.tsx`: Cabeçalho com controles de janela (14, 30, 60, 90 dias, todo o histórico), cartões de resumo estatístico, composição vertical conjunta e estado vazio didático.
- **Phase 4: Dashboard Integration & Styling**:
  - Conectar ao `AnalyticsDashboard.tsx` na aba `throughput`.
  - Estilos responsivos em `src/styles/Analytics.css` com suporte a tema claro e escuro.
- **Phase 5: Automated Verification & Quality Gate**:
  - Testes de UI em `tests/unit/ThroughputAnalyticsView.test.tsx`.
  - Execução da suíte completa de testes (246 testes existentes + novos testes) com 100% de sucesso.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Bibliotecas externas como Recharts/Chart.js):** Poda mandatória pelo Princípio V da Constituição (Simplicidade & YAGNI) - SVG nativo puro e leve.
- **Alternativa Descartada (Exclusão de fins de semana):** Poda confirmada no `/speckit-clarify` - a inclusão de todos os dias de calendário com contagem zero reflete a prática lean de Daniel Vacanti e a imagem de referência fornecida pelo usuário.
- **Alternativa Descartada (Abas separadas para Histograma e Run Chart):** Poda confirmada no `/speckit-clarify` - a visão conjunta vertical empilhada permite correlacionar a distribuição estatística com a evolução cronológica imediatamente.

---

## Tasks

### Phase 1: Math & Throughput Metrics Logic
- [ ] T001 Implement `extractThroughputSeries(tasks, daysWindow, referenceDate)` with strict zero-filling for empty days in `src/utils/throughputMetrics.ts`
- [ ] T002 Implement `calculateThroughputHistogram(dailyPoints)` returning frequency bins, percentages, and max daily throughput in `src/utils/throughputMetrics.ts`
- [ ] T003 Implement `calculateThroughputPercentiles(dailyCounts)` calculating NIST P50, P70, P85, P95 and statistical summary (mean, mode, total) in `src/utils/throughputMetrics.ts`
- [ ] T004 Write unit tests for zero-filling, bin distribution, percentiles, and statistical summary in `tests/unit/throughputMetrics.test.ts`

### Phase 2: Native SVG Chart Components
- [ ] T005 [US1] Implement native SVG `src/components/charts/ThroughputHistogramChart.tsx` with discrete X-axis (`# of Work Items`), Y-axis (`Frequency # of Days`), and blue bars
- [ ] T006 [US1] Render vertical dashed percentile lines (50%, 70%, 85%, 95%) with top badges and interactive hover tooltips in `ThroughputHistogramChart.tsx`
- [ ] T007 [US2] Implement native SVG `src/components/charts/ThroughputRunChart.tsx` with continuous timeline on X-axis, daily throughput on Y-axis, and connected line with circular dot markers
- [ ] T008 [US2] Implement interactive hover tooltips for daily dots showing date and exact count of completed items in `ThroughputRunChart.tsx`

### Phase 3: Integrated View, Controls & Statistics Summary
- [ ] T009 [US3] Implement executive statistical summary cards (Total Completed, Daily Average, P50, P70, P85 SLE, P95, Mode) in `src/components/ThroughputAnalyticsView.tsx`
- [ ] T010 [US3] Implement time window selector (14 days, 30 days, 60 days, 90 days, All Time) in `ThroughputAnalyticsView.tsx`
- [ ] T011 [US1, US2] Assemble stacked vertical layout (Throughput Histogram on top, Daily Run Chart below) with synchronized tooltips and empty guidance state in `ThroughputAnalyticsView.tsx`

### Phase 4: Navigation, Dashboard Integration & Styling
- [ ] T012 Connect `ThroughputAnalyticsView` into `src/components/AnalyticsDashboard.tsx` for the active `throughput` tab, preserving compact `ThroughputChart.tsx` for general dashboard
- [ ] T013 Add styles for histogram bars, percentile lines, run chart line/dots, summary cards, and controls in `src/styles/Analytics.css`

### Phase 5: Verification & Quality Gate
- [ ] T014 Write UI integration tests for `ThroughputAnalyticsView` covering chart rendering, window selection, and empty state in `tests/unit/ThroughputAnalyticsView.test.tsx`
- [ ] T015 Run full test suite (`npm test`) and type check ensuring 100% pass rate and zero regressions
