# Feature 013: Eficiência de Fluxo & Filtro de Bloqueios (Flow Efficiency & Blocked Filter)

## 1. Context & Rationale
Com a introdução da Feature 012 (Rastreamento de Bloqueios & Impedimentos), o Metrik passou a capturar com precisão o tempo que cada cartão permanece bloqueado (`totalBlockedMs`). No entanto, esses dados ainda não estão consolidados em nível de sistema para fornecer a métrica mais nobre do Kanban: a **Eficiência de Fluxo (*Flow Efficiency*)**, que quantifica qual porcentagem do tempo do ciclo de trabalho é realmente produtiva versus tempo desperdiçado em filas e impedimentos.

Além disso, durante a gestão diária (*Daily Standup*), times ágeis precisam de uma forma instantânea de filtrar e isolar apenas os itens impedidos no quadro para focar em desbloqueá-los rapidamente.

## 2. Business Value
- **Foco em Impedimentos:** Um filtro de clique único `⛔ Apenas Bloqueados` permite que a equipe isole e resolva todos os bloqueios ativos em segundos.
- **Métrica Executiva de Eficiência:** A Eficiência de Fluxo expõe o verdadeiro custo dos bloqueios organizacionais, permitindo que a liderança tome decisões baseadas em dados sobre dependências e processos.
- **Alerta de Risco no Fluxo:** Exibição do contador de itens bloqueados no cabeçalho de métricas (`MetricsBar`), chamando atenção visual imediata se o número de itens paralisados for maior que zero.

## 3. Scope & Requirements

### 3.1. In Scope
- **Cálculo de Eficiência de Fluxo (`useFlowMetrics.ts`):**
  - Para cada tarefa concluída com `cycleTimeMs`:
    - `activeTimeMs = Math.max(0, cycleTimeMs - (task.totalBlockedMs || 0))`
    - $\text{Eficiência da Tarefa} = (\text{activeTimeMs} / \text{cycleTimeMs}) \times 100\%$
  - Média ponderada ou aritmética de Eficiência de Fluxo para o quadro.
  - Atualizar `FlowMetricsSummary`:
    - `flowEfficiency: number | null` (porcentagem de 0 a 100)
    - `formattedFlowEfficiency: string` (ex: "88%", "< 1%" ou "-")
    - `blockedCount: number` (contagem de itens atualmente com `blocked === true` em todo o quadro ativo)
    - `formattedAvgBlockedTime: string` (tempo médio bloqueado dos itens concluídos)
- **Filtro de Bloqueados (`useBoardFilters.ts` & `types/filter.ts`):**
  - Adicionar `onlyBlocked: boolean` ao `FilterState`.
  - Adicionar `toggleOnlyBlocked: () => void` ao `UseBoardFiltersReturn`.
  - Filtrar tarefas no quadro se `onlyBlocked === true`, mantendo apenas tarefas com `task.blocked === true`.
- **Interface no `FilterBar.tsx`:**
  - Botão de filtro `⛔ Apenas Bloqueados` com indicador ativo e contador de itens bloqueados.
- **Interface no `MetricsBar.tsx`:**
  - Exibir o item `Bloqueios Ativos` (com badge vermelho quando > 0).
  - Exibir o item `Eficiência de Fluxo` (com porcentagem destacada).
- **Testes Automatizados:**
  - Testes em `useFlowMetrics.test.ts` (ou criar se não existir) e `useBoardFilters.test.ts`.
  - Testes de renderização em `MetricsBar.test.tsx` e `FilterBar.test.tsx`.

### 3.2. Out of Scope
- Configuração de metas personalizadas de eficiência (SLA/SLO).
- Histórico de eficiência ao longo de múltiplos meses (já sumarizado no CFD).

## 4. User Stories
- **US1:** Como facilitador de reunião diária, quero clicar em um botão para filtrar apenas tarefas bloqueadas, para que o time discuta os impedimentos sem distrações.
- **US2:** Como líder técnico / agilista, quero ver a Eficiência de Fluxo média do quadro, para saber quanto tempo estamos perdendo em dependências externas.
- **US3:** Como membro da equipe, quero ver o total de bloqueios ativos diretamente na barra de métricas do quadro.

## 5. Critérios de Aceitação
1. O filtro `⛔ Apenas Bloqueados` isola 100% das tarefas com `blocked === true` e oculta as demais, respeitando a busca por texto e filtros adicionais (composição conjuntiva E/AND).
2. A Eficiência de Fluxo é calculada de forma matematicamente segura (sem divisão por zero, variando entre 0% e 100%, ou `-` se não houver tarefas concluídas).
3. Todas as alterações passam com 100% de sucesso na suíte de testes do Vitest e na compilação do Vite (`npm run build`).
