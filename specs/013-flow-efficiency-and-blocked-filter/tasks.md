# Tasks: Feature 013 (Flow Efficiency & Blocked Filter)

## Modelos de Raciocínio Analítico Pré-Criação de Tarefas (Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental:** Eficiência de Fluxo é uma razão dimensional adimensionada entre trabalho ativo e tempo total de ciclo ($\eta = \frac{T_{\text{ativo}}}{T_{\text{total}}}$).
- **Invariante Matemática:** A Eficiência de Fluxo está estritamente limitada ao intervalo $[0\%, 100\%]$. Se $T_{\text{total}} = 0$, a métrica é indefinida e deve ser representada como nula/traço (`-`). O tempo ativo é invariante à ordem das operações e nunca pode exceder o Cycle Time total ($T_{\text{ativo}} \le T_{\text{total}}$).
- **Filtragem de Conjuntos:** Filtrar itens bloqueados é uma operação de projeção booleana: $S_{\text{bloqueados}} = \{ t \in \text{Quadro} \mid t.\text{blocked} = \text{true} \}$. Esta condição compõe-se conjuntivamente com as buscas por texto e filtros por tag/prioridade.

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Divisão por Zero):** Se não houver tarefas concluídas ou se todas as tarefas tiverem Cycle Time de 0 ms, o cálculo da eficiência tentará dividir por zero resultando em `NaN%` na interface.
  - *Mitigação:* Validar estritamente `totalCycleTimeMs > 0` antes de dividir. Caso contrário, retornar `flowEfficiency: null` e `formattedFlowEfficiency: '-'`.
- **Modo de Falha 2 (Tempo Bloqueado Maior que o Cycle Time):** Caso dados manuais ou migrados tenham `totalBlockedMs > cycleTimeMs`, a eficiência de fluxo poderia resultar em valores negativos.
  - *Mitigação:* Usar `Math.max(0, cycleTimeMs - totalBlockedMs)` para garantir que o tempo ativo seja sempre não-negativo.
- **Modo de Falha 3 (Filtro 'Bloqueados' Ativo Ocultando Novas Tarefas):** Ao adicionar uma nova tarefa enquanto o filtro de bloqueados está ativo, o usuário pode achar que a tarefa "sumiu".
  - *Mitigação:* Exibir contador claro de itens visíveis vs total (`X de Y tarefas`) e indicar visualmente o filtro de bloqueados ativado com cor de destaque e opção de limpar filtros.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua:**
  - `Phase 1`: Extensão dos tipos TypeScript e hooks de cálculo e filtro (`kanban.ts`, `filter.ts`, `useFlowMetrics.ts`, `useBoardFilters.ts`).
  - `Phase 2`: Testes unitários para regras de cálculo de métricas e filtros.
  - `Phase 3`: Componentes de apresentação (`MetricsBar.tsx`, `FilterBar.tsx`, `App.css`).
  - `Phase 4`: Integração completa e suíte de testes de regressão.
- **Exaustividade Coletiva:** Cobre 100% dos critérios de aceitação e histórias de usuário (cálculo de eficiência, contagem de bloqueios, botão de filtro de bloqueados e testes automatizados).

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts & Trade-off Pruning)
- **Alternativa A (Média simples das porcentagens de cada tarefa):** Descartada porque tarefas muito curtas (ex: 2 minutos) com pequenas variações distorcem a média aritmética de forma desproporcional.
- **Decisão Escolhida (Média Ponderada pelo Tempo Total do Sistema):** $\frac{\sum T_{\text{ativo}}}{\sum T_{\text{total}}} \times 100\%$. É o padrão formal da teoria Kanban/Lean (Kanban Guide for Scrum Teams / ActionableAgile), matematicamente mais estável e representativo.

### 5. Critério de Falsificabilidade & Testabilidade (TDD / Red-Bar First)
- Teste de cálculo de métricas:
  - 2 tarefas: Tarefa 1 (Cycle Time 10h, Bloqueada 2h = 8h ativas), Tarefa 2 (Cycle Time 10h, Bloqueada 0h = 10h ativas). Total: 18h ativas / 20h total = 90% Eficiência.
  - Teste com zero tarefas concluídas retorna `flowEfficiency: null`.
- Teste de filtro:
  - Quadro com 3 tarefas (1 bloqueada, 2 não bloqueadas): `toggleOnlyBlocked` filtra e retorna exatamente 1 tarefa.

### 6. Triangulação Adversarial & Verificação Constitucional (Polygraph Verification)
- **Constituição II & V (Modularity & YAGNI):** Não adiciona nenhuma dependência externa; os cálculos utilizam pura aritmética nativa TypeScript.
- **Constituição III (Automated Verification):** A suíte deve passar 100% limpa antes de fechar a tarefa.

---

## Tasks

### Phase 1: Data Model & Core Hooks
- [x] T001 Update `FlowMetricsSummary` in `src/types/kanban.ts` with `blockedCount`, `flowEfficiency`, and `formattedFlowEfficiency`.
- [x] T002 Update `FilterState` and `UseBoardFiltersReturn` in `src/types/filter.ts` with `onlyBlocked`, `toggleOnlyBlocked`, and `blockedCount`.
- [x] T003 Update `src/hooks/useFlowMetrics.ts` to calculate system-level Flow Efficiency and accept active board tasks to count current blocks.
- [x] T004 Update `src/hooks/useBoardFilters.ts` to support filtering by `onlyBlocked`.

### Phase 2: Unit Testing Core Logic
- [x] T005 Write unit tests in `tests/unit/useFlowMetrics.test.ts` verifying flow efficiency math, zero-division resilience, and blocked count.
- [x] T006 Update `tests/unit/useBoardFilters.test.ts` to assert `onlyBlocked` toggling and combined filtering.

### Phase 3: Presentation Layer & Styling
- [x] T007 Update `src/components/MetricsBar.tsx` to display `Bloqueios Ativos` (with red alert badge if > 0) and `Eficiência de Fluxo`.
- [x] T008 Update `src/components/FilterBar.tsx` to add the `⛔ Bloqueados` filter toggle button with count indicator.
- [x] T009 Update `src/App.tsx` to pass the updated metrics and filter bindings.
- [x] T010 Add CSS styles in `src/App.css` for the blocked filter pill and metrics badges.

### Phase 4: Component Tests & Verification
- [x] T011 Update `tests/unit/MetricsBar.test.tsx` to assert rendering of active blocks and flow efficiency.
- [x] T012 Update `tests/unit/FilterBar.test.tsx` to verify the `⛔ Bloqueados` button click and active state.
- [x] T013 Run `npm run build` and `npm test` to verify 100% pass rate with zero regressions.
