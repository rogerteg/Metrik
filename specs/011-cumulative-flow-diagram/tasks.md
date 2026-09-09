# Tasks: Feature 011 (Cumulative Flow Diagram)

## Modelos de Raciocínio Analítico Pré-Criação de Tarefas (Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental:** O Diagrama de Fluxo Cumulativo (CFD) é uma série temporal de contagens acumuladas que mapeia transições de estado no tempo.
- **Invariante Matemática:** A curva de cada estágio é cumulativa e, portanto, monotonicamente não-decrescente ($C(t_2) \ge C(t_1)$ para $t_2 > t_1$). O total de itens criados em qualquer data $d$ é a soma dos itens em Backlog + Em Progresso + Concluídos nessa mesma data.
- **Isolamento de Complexidade:** Não é necessário armazenar logs diários no banco; a série temporal pode ser projetada determinística e puramente a partir dos timestamps existentes de cada tarefa (`createdAt`, `startedAt`, `completedAt`).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Inconsistência Temporal):** Tarefas com `startedAt` ou `completedAt` ausentes ou anteriores a `createdAt` poderiam gerar contagens negativas ou inversões de curva.
  - *Mitigação:* Função de sanitização garante que se `completedAt` existe sem `startedAt`, `startedAt` é inferido como `createdAt` ou `completedAt`; e que curvas respeitem limites matemáticos ($0 \le \text{done} \le \text{started} \le \text{created}$).
- **Modo de Falha 2 (Divisão por Zero / Gráficos Vazios):** Quando o quadro não tiver tarefas ou o valor máximo for 0, o cálculo de coordenadas SVG pode gerar `NaN` ou linhas quebradas.
  - *Mitigação:* Estabelecer `maxTotal = Math.max(1, maxCount)` para normalização de eixos SVG e renderizar mensagem elegante de "Sem dados suficientes para o período" caso o quadro esteja completamente vazio.
- **Modo de Falha 3 (Fuso Horário / Deslocamento de Datas):** O uso ingênuo de `new Date().toISOString()` pode agrupar tarefas no dia seguinte/anterior dependendo do timezone do cliente.
  - *Mitigação:* Usar formatação consistente `YYYY-MM-DD` baseada na data local ou split ISO consistente com o restante da aplicação (`getLast14Days`).

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua:**
  - `Phase 1`: Lógica de transformação de dados e modelos TypeScript (`useCfdData.ts`, `types/analytics.ts`).
  - `Phase 2`: Componente visual SVG puro (`CumulativeFlowChart.tsx`).
  - `Phase 3`: Integração ao Dashboard e estilização (`AnalyticsDashboard.tsx`, `Analytics.css`).
  - `Phase 4`: Testes e verificação global.
- **Exaustividade Coletiva:** Cobre 100% dos critérios de aceitação da `spec.md` (transformação precisa, SVG responsivo, legenda, interatividade, testes automatizados e zero dependências).

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts & Trade-off Pruning)
- **Alternativa A (Biblioteca Externa como Chart.js ou Recharts):** Descartada para preservar o princípio fundamental da aplicação de 0 dependências externas e pacote leve de carregamento instantâneo.
- **Alternativa B (Gráfico de Barras Empilhadas Flexbox):** Descartada porque o CFD exige áreas contínuas conectadas para visualizar visualmente a inclinação das taxas de chegada e partida.
- **Decisão Escolhida (Native SVG Stacked Area Polygons):** Desenho de polígonos fechados em SVG nativo (`<polygon points="..." />`), altamente performático, responsivo via `viewBox` e 100% customizável via variáveis CSS do tema.

### 5. Critério de Falsificabilidade & Testabilidade (TDD / Red-Bar First)
- Teste unitário para `useCfdData`:
  - Deve falhar antes da criação do hook.
  - Deve testar monotonicidade: dados de 14 dias para tarefas criadas e completadas em dias diferentes não podem apresentar quedas de valores acumulados.
  - Teste para quadro vazio retorna 14 dias com zeros.
- Teste de componente para `CumulativeFlowChart`:
  - Deve verificar presença de elementos `<svg>`, legendas 'Concluído', 'Em Progresso', 'A Fazer' e resposta a eventos de foco/hover.

### 6. Triangulação Adversarial & Verificação Constitucional (Polygraph Verification)
- **Constituição II & V (Modularity & YAGNI):** O hook de CFD é isolado em `src/hooks/useCfdData.ts` sem amarras a APIs de backend.
- **Constituição III (Automated Verification):** Build e suite de testes executados com 0 erros antes da conclusão.

---

## Tasks

### Phase 1: Data Calculation & Hooks
- [x] T001 Define `CfdDataPoint` and related interfaces in `src/types/analytics.ts`.
- [x] T002 Create `src/hooks/useCfdData.ts` implementing the rolling 14-day cumulative calculation algorithm.
- [x] T003 Write unit tests in `tests/unit/useCfdData.test.ts` verifying monotonic non-decreasing accumulation and empty/edge cases.

### Phase 2: Native SVG Visualization Component
- [x] T004 Create `src/components/charts/CumulativeFlowChart.tsx` using SVG stacked polygon paths with responsive `viewBox`.
- [x] T005 Implement interactive date tooltip/indicator and color-coded legend in `CumulativeFlowChart.tsx`.
- [x] T006 Write unit tests in `tests/unit/CumulativeFlowChart.test.tsx` verifying DOM rendering, legend, and SVG structure.

### Phase 3: Dashboard Integration & Verification
- [x] T007 Integrate `CumulativeFlowChart` into `src/components/AnalyticsDashboard.tsx`.
- [x] T008 Update `src/components/Analytics.css` with responsive layout and glassmorphism styling for the CFD chart.
- [x] T009 Run `npm run build` and `npm test` to verify 100% pass rate and zero regressions.
