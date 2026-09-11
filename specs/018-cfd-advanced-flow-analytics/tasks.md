# Tasks: Feature 018 - CFD Avançado no Padrão Businessmap / ActionableAgile

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental do CFD (Lei de Little Empírica):**
  - O Diagrama de Fluxo Cumulativo mapeia o progresso no tempo discreto:
    - **Distância Vertical** na data $t$: $WIP(t) = \text{TopCurve}(t) - \text{BottomCurve}(t)$ (quantidade absoluta de cartões retidos na etapa naquele instante).
    - **Distância Horizontal** no nível cumulativo $N$: $\text{LeadTime}(N) = t_{\text{saída}}(N) - t_{\text{entrada}}(N)$ (tempo decorrido em dias para que $N$ itens concluam a etapa).
- **Invariante Matemática:** A cumulativa em qualquer ponto nunca decresce no tempo ($\text{Curve}(t_2) \ge \text{Curve}(t_1)$ para $t_2 > t_1$). Se a distância vertical cresce monotonicamente, a taxa de chegada supera a taxa de atendimento (gargalo se formando).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Curvas Verticais sem Interpolação):** Ao buscar a distância horizontal para Lead Time, o mesmo valor de Y pode não ter ponto exato na curva de entrada.
  - *Mitigação:* Usar busca binária ou interpolação linear contínua entre os dias adjacentes para encontrar a coordenada X onde a curva atingiu o mesmo patamar.
- **Modo de Falha 2 (Filtro Temporal com Intervalo Invertido):** Usuário seleciona `Requested after` posterior a `Finished before`.
  - *Mitigação:* Validador no painel de filtros que bloqueia a submissão e exibe aviso amigável, forçando $\text{Data Inicial} \le \text{Data Final}$.
- **Modo de Falha 3 (Colapso com Mini-Timeline em datasets pequenos):** Menos de 3 dias de dados no board.
  - *Mitigação:* Timeline scrubber desabilita o zoom de forma elegante quando a janela for menor que 5 dias, mantendo o gráfico proporcional.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Sobreposição):**
  - `Phase 1 (Math & Flow Geometry)`: Funções em `src/utils/cfdMetrics.ts` e testes puros em `tests/unit/cfdMetrics.test.ts`.
  - `Phase 2 (Data Hook Evolution)`: Parâmetros de data flexíveis em `src/hooks/useCfdData.ts`.
  - `Phase 3 (User Story 1 - Dual Inspection & Bottleneck Tags)`: Medições de WIP/Lead Time em `CumulativeFlowChart.tsx`.
  - `Phase 4 (User Story 2 - Filter Drawer)`: Painel retrátil `CfdFilterDrawer.tsx` e filtros.
  - `Phase 5 (User Story 3 - Timeline Scrubber)`: Mini-timeline `CfdTimelineScrubber.tsx`.
  - `Phase 6 (Testing & Production Build)`: Testes unitários e build.
- **Exaustividade Coletiva (100% dos Requisitos):** Cobre FR-001 a FR-006 na íntegra.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Bibliotecas de Gráficos como Plotly / Recharts):** Descartada para preservar o Princípio V (YAGNI), zero dependências extras e SVG vetorial nativo de alto desempenho.
- **Alternativa Descartada (Painel fixo ocupando 30% da tela):** Descartada em favor de painel retrátil colapsável com botão de acesso suave, garantindo foco no canvas gráfico.
- **Decisão Escolhida:** Componente SVG puro com camadas empilhadas, anotações vetoriais e painel retrátil no tema dark do Metrik.

### 5. Critério de Falsificabilidade & Testabilidade (TDD)
- **Critério 1 (Medição de WIP):** Para data com 10 itens na etapa A e 4 itens na etapa B, a diferença vertical retornada deve ser estritamente 6 itens.
- **Critério 2 (Lead Time Horizontal):** Se a curva de saída atingiu 10 itens no dia 15 e a de entrada atingiu 10 itens no dia 4, a medição horizontal deve ser de exatamente 11 dias.
- **Critério 3 (Tag de Gargalo):** Uma etapa que aumentou seu WIP em mais de 50% em relação ao início da janela temporal deve ativar a tag `A queue column expanding`.

### 6. Conformidade Constitucional
- **Constituição II & V:** Funções puras desacopladas em `cfdMetrics.ts`.
- **Constituição III:** 213 testes preservados + novos testes de fluxo.

---

## Tasks

### Phase 1: Math & Flow Geometry Utilities (Core Logic)
- [x] T001 Implement `calculateHorizontalLeadTime(coords, activeIndex, stageKey)` with linear interpolation in `src/utils/cfdMetrics.ts`
- [x] T002 Implement `detectQueueExpansion(dataPoints, stageKey)` to identify expanding queues in `src/utils/cfdMetrics.ts`
- [x] T003 Write comprehensive unit tests for CFD metrics in `tests/unit/cfdMetrics.test.ts`

### Phase 2: Data Hook Evolution (Flexible Date Windows)
- [x] T004 Update `src/hooks/useCfdData.ts` to accept custom `startDate` and `endDate` options for dynamic date filtering
- [x] T005 Write unit tests verifying custom date window filtering in `tests/unit/useCfdData.test.ts`

### Phase 3: User Story 1 - Inspeção Dual de WIP e Lead Time com Alertas de Gargalo (Priority: P1)
- [x] T006 [US1] Render vertical WIP measurement line with item count badge (`X items`) on hover in `src/components/charts/CumulativeFlowChart.tsx`
- [x] T007 [US1] Render horizontal bidirectional arrow and duration badge (`Y days`) connecting arrival and departure curves in `src/components/charts/CumulativeFlowChart.tsx`
- [x] T008 [US1] Render alert tag badge (`A queue column expanding`) over expanding bottlenecks in `src/components/charts/CumulativeFlowChart.tsx`

### Phase 4: User Story 2 - Painel Lateral de Filtros Temporais e Colunas (Priority: P1)
- [x] T009 [US2] Create collapsible left-side filter drawer `src/components/charts/CfdFilterDrawer.tsx` with `Requested after`, `Finished before`, column toggles, and `LOAD` button
- [x] T010 [US2] Connect `CfdFilterDrawer` state to `CumulativeFlowChart` to filter dataset dates and active stages
- [x] T011 [P] [US2] Add styling in `src/components/Analytics.css` for filter drawer, date inputs, action buttons, and animated badges

### Phase 5: User Story 3 - Timeline Scrubber & Navegador de Zoom (Priority: P2)
- [x] T012 [US3] Create `src/components/charts/CfdTimelineScrubber.tsx` with mini SVG overview and draggable window selection handles
- [x] T013 [US3] Connect `CfdTimelineScrubber` to `CumulativeFlowChart` to dynamically zoom the main chart date range

### Phase 6: Integration, Polish & Quality Gate
- [x] T014 Update unit tests in `tests/unit/CumulativeFlowChart.test.tsx` to validate dual inspection rendering, badges, and filter drawer
- [x] T015 Run full automated test suite (`npm test`) ensuring all 213+ tests pass without regression
- [x] T016 Run production build (`npm run build`) to verify TypeScript compilation and bundle integrity
