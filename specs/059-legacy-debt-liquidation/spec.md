# Especificação 059 — Quitação de Dívida Técnica Legada Congelada (Analytics.css e CumulativeFlowChart.tsx)

**Status**: Implemented & Verified (2026-11-19)  
**Prioridade**: P1  
**Autor**: Metrik Core Team  
**Precedência**: `constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` > `plan.md` > `tasks.md` > código.

---

## 1. Contexto e Motivação

O Artigo II da Constituição do Metrik estabelece que **todos os arquivos-fonte em `src/**/*.{ts,tsx,css}` devem respeitar o teto de 400 linhas de código**. Na Feature 049, foi implementado o baseline congelado com catraca (*ratchet*) para 23 arquivos legados pré-existentes (`FROZEN_LEGACY_DEBT_BASELINE` em `tests/unit/moduleLineCountGuard.test.ts`). O Artigo II.3 designou expressamente `src/components/Analytics.css` (3256 linhas) como prioridade mandatória máxima de refatoração, ao lado dos componentes visuais extensos como `src/components/charts/CumulativeFlowChart.tsx` (821 linhas).

Esta especificação define a **decomposição arquitetural e quitação efetiva da dívida técnica** desses dois módulos centrais:
1. Decomposição de `Analytics.css` em folhas de estilo orientadas a domínio dentro de `src/components/analytics/`, preservando estritamente a ordem da cascata CSS via `@import` e garantindo que cada arquivo resultante respeite $\le 400$ linhas.
2. Decomposição de `CumulativeFlowChart.tsx` em subcomponentes puros e hooks especializados em `src/components/charts/cfd/`, preservando 100% de sua API pública, seletores de teste e comportamento visual.
3. Remoção definitiva de ambas as entradas de `FROZEN_LEGACY_DEBT_BASELINE`, reduzindo o baseline legado de 23 para 21 arquivos e mantendo 9/9 testes de `moduleLineCountGuard.test.ts` 100% verdes.

---

## 2. Requisitos Funcionais e Arquiteturais

### FR-001: Decomposição Modular de `Analytics.css` por Domínio
- O arquivo `src/components/Analytics.css` deve ser transformado em um manifesto leve de imports ($\le 50$ linhas).
- Os blocos de estilo devem ser particionados em arquivos modulares em `src/components/analytics/`, cada um estritamente $\le 400$ linhas:
  - `analytics-core.css`: Contêiner geral, barras de rolagem, modais compartilhados e linhas de grade.
  - `cycle-time-chart.css`: Elementos SVG, linhas de percentis, dispersão de pontos e tooltips do Cycle Time.
  - `cycle-time-controls.css`: Cabeçalho analítico, botões de toggle, seletores e gavetas de controle do Cycle Time.
  - `cfd-chart.css`: Gaveta de filtros, toggle buttons, polígonos e scrubber do CFD.
  - `monte-carlo-view.css`: Contêiner, cartões de probabilidade e estatísticas de Monte Carlo.
  - `monte-carlo-controls.css`: Controles, formulários de entrada e histograma de Monte Carlo.
  - `wip-aging-chart.css`: Elementos SVG, faixas de envelhecimento e tooltips do WIP Aging.
  - `wip-aging-drawers.css`: Gavetas retráteis e seletores laterais do WIP Aging.
  - `throughput-chart.css`: Gráficos de barras e linhas temporais de Throughput.
  - `analytics-sles.css`: Cartões executivos de resumo e visualização de SLEs.
  - `blocker-analytics.css`: Análise de gargalos e agrupamento de bloqueios.
  - `dataset-drawer.css`: Painel deslizante (*slide-over*) de configuração de conjunto de dados.
- **Invariante de Cascata**: A ordem exata de declaração dos seletores deve ser rigorosamente mantida para evitar qualquer regressão visual.

### FR-002: Decomposição de `CumulativeFlowChart.tsx`
- O componente `CumulativeFlowChart.tsx` deve ser refatorado para ter $\le 200$ linhas.
- A lógica de renderização e estado deve ser particionada em módulos especializados em `src/components/charts/cfd/`:
  - `useCfdPlotCoordinates.ts`: Hook de cálculo de coordenadas SVG, polígonos dinâmicos por etapa e métricas de inspeção dual.
  - `CfdLegend.tsx`: Renderização da barra de legenda de etapas dinâmicas ou estágios padrão.
  - `CfdInspectionOverlay.tsx`: Grupo SVG de inspeção interativa de WIP vertical e Lead Time horizontal com alertas de gargalo.
  - `CfdAxesLabels.tsx`: Rótulos HTML de eixos Y e X.
  - `CfdTooltip.tsx`: Card flutuante de tooltip com contagem detalhada por etapa.
- **Invariante de Teste**: Todos os `data-testid` (`cfd-advanced-container`, `cfd-svg`, `cfd-inspection-overlay`, `wip-vertical-line`, `wip-items-badge`, `leadtime-horizontal-group`, `leadtime-days-badge`, `bottleneck-expansion-tag`) e propriedades devem permanecer inalterados.

### FR-003: Quitação do Baseline Congelado e Verificação do Guard
- As entradas `'src/components/charts/CumulativeFlowChart.tsx'` e `'src/components/Analytics.css'` devem ser removidas de `FROZEN_LEGACY_DEBT_BASELINE`.
- A suíte global `tests/unit/moduleLineCountGuard.test.ts` deve validar que 100% dos arquivos de `src/**/*.{ts,tsx,css}` possuem $\le 400$ linhas (exceto os 21 legados restantes), com todos os 9 testes verdes.

---

## 3. Critérios de Sucesso

1. `(Get-Content src/components/Analytics.css).Count` $\le 50$.
2. Todos os 12 arquivos em `src/components/analytics/*.css` possuem $\le 400$ linhas.
3. `(Get-Content src/components/charts/CumulativeFlowChart.tsx).Count` $\le 400$.
4. Todos os arquivos em `src/components/charts/cfd/*.{ts,tsx}` possuem $\le 400$ linhas.
5. `npx vitest run tests/unit/CumulativeFlowChart.test.tsx` passa com 8/8 testes verdes.
6. `npx vitest run tests/unit/moduleLineCountGuard.test.ts` passa com 9/9 testes verdes.
7. Zero regressões em toda a suíte de testes (`npm run test`).
