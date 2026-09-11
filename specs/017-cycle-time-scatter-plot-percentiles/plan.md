# Implementation Plan: Cycle Time Scatter Plot Avançado com Percentis e Navegação Analítica (ActionableAgile / Businessmap)

**Branch**: `017-cycle-time-scatter-plot-percentiles` | **Date**: 2026-09-11 | **Spec**: [specs/017-cycle-time-scatter-plot-percentiles/spec.md](spec.md)

**Input**: Feature specification e clarificações aprovadas baseadas no modelo analítico do ActionableAgile / Businessmap.

---

## 1. Summary & Visual Architecture

Evoluir o módulo analítico do Metrik para o padrão internacional de **Flow Metrics (ActionableAgile / Daniel Vacanti)**:
1. **Navegação Analítica por Abas (`AnalyticsNavHeader`)**:
   - Barra superior com abas integradas dentro da visualização `Analytics`:
     - `Dashboard` (Visão geral com todos os gráficos)
     - `Cycle Time` (Visão aprofundada com menu dropdown: *Scatter Plot*)
     - `Throughput`
     - `CFD / Fluxo`
     - `Bloqueios`
2. **Cycle Time Scatter Plot com Percentis Matemáticos**:
   - Projeção cartesiana SVG precisa:
     - Eixo X: Data de conclusão da tarefa (`completedAt`).
     - Eixo Y: Cycle Time em dias (`cycleTimeDays`).
   - Cálculo determinístico de percentis:
     - **50% (Mediana)**: linha pontilhada verde/azul suave com label `50%: Xd`.
     - **85% (SLE - Service Level Expectation)**: linha pontilhada âmbar com label `85%: Yd`.
     - **95% (Certeza / Cauda Longa)**: linha pontilhada coral/vermelha suave com label `95%: Zd`.
3. **Painel de Controles Lateral Retrátil (*Controls for this Chart*)**:
   - Painel retrátil à direita com botão elegante de alternância (*toggle sidebar*).
   - Controles analíticos:
     - Toggles independentes para exibir/ocultar as linhas dos percentis (50%, 85%, 95%).
     - Toggle para destacar tarefas bloqueadas (*Blocked Items*) com cor vermelha/alerta de destaque.
     - Resumo estatístico do dataset (Total de itens, Mediana, 85%, 95% e Máximo).
4. **Tooltips Interativos Ricos**:
   - Hover sobre cada ponto do scatter plot exibe card flutuante com título da tarefa, tempo de ciclo, datas de início/fim e detalhes de bloqueio se aplicável.

---

## 2. Technical Context

- **Language / Framework**: TypeScript 5.7+ / React 19 / Vite 6.
- **Matemática Estatística**: Implementação em TypeScript puro de cálculo de percentil via interpolação linear (Nearest Rank ou Método NIST/ActionableAgile).
- **Componentes Afetados / Criados**:
  - `src/utils/statistics.ts` [NEW]: Função utilitária pura `calculatePercentiles(values: number[], percentiles: number[])`.
  - `src/components/charts/CycleTimeScatterPlot.tsx` [NEW]: Gráfico vetorial SVG aprofundado com suporte a percentis, tooltips ricos e destaque de bloqueados.
  - `src/components/charts/ChartControlsPanel.tsx` [NEW]: Painel retrátil de controles analíticos do gráfico.
  - `src/components/AnalyticsNavHeader.tsx` [NEW]: Barra superior de abas analíticas (`Dashboard`, `Cycle Time`, `Throughput`, `CFD`, `Bloqueios`).
  - `src/components/AnalyticsDashboard.tsx` [MODIFY]: Suporte à navegação por abas, roteamento interno das visões e integração com o novo Scatter Plot.
  - `src/components/Analytics.css` [MODIFY]: Estilos do painel retrátil, abas analíticas, linhas de percentis e tooltips.
- **Testing**: Vitest + React Testing Library (manutenção dos 203 testes existentes + novos testes para cálculo de percentis e renderização).

---

## 3. Constitution & SDD Check

- **I. Spec-Driven Precedence**: **PASS** — `spec.md` e `checklists/requirements.md` devidamente validados antes da criação deste plano.
- **II. Code Quality & Modularity**: **PASS** — Divisão estrita em módulo utilitário puro (`statistics.ts`), componentes dedicados e estilização desacoplada.
- **III. Automated Verification**: **PASS** — Testes unitários para a função de percentis com casos de borda (lista vazia, 1 elemento, valores repetidos) e testes de renderização de componentes.
- **IV. Simplicity & YAGNI**: **PASS** — Sem bibliotecas externas pesadas (Chart.js / D3); renderização nativa SVG consistente com o design system do Metrik.

---

## 4. Proposed File Changes

### Math & Utilities Layer
#### [NEW] [statistics.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/statistics.ts)
- Implementar `calculatePercentile(values: number[], percentile: number): number`.
- Tratar casos de borda: array vazio retorna 0, array com 1 item retorna o próprio item.

### Component Layer
#### [NEW] [AnalyticsNavHeader.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/AnalyticsNavHeader.tsx)
- Barra de navegação com abas: `Dashboard`, `Cycle Time` (com menu dropdown *Scatter Plot*), `Throughput`, `CFD / Fluxo`, `Bloqueios`.
- Indicador visual ativo e acessibilidade via teclado.

#### [NEW] [ChartControlsPanel.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/ChartControlsPanel.tsx)
- Painel lateral retrátil à direita.
- Checkboxes/toggles para: 50%, 85%, 95%, e destaque de itens bloqueados.
- Seção com *Summary Statistics* (Total de tarefas, P50, P85, P95).

#### [NEW] [CycleTimeScatterPlot.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/CycleTimeScatterPlot.tsx)
- Substitui o Scatter simplificado por visualização analítica completa inspirada na imagem:
  - Pontos individuais por tarefa.
  - Linhas horizontais pontilhadas para os percentis ativos (50%, 85%, 95%).
  - Rótulos fixos de percentis no canto direito.
  - Diferenciação visual para tarefas bloqueadas.
  - Tooltips detalhados ao passar o mouse.

#### [MODIFY] [AnalyticsDashboard.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/AnalyticsDashboard.tsx)
- Adicionar estado da aba analítica ativa (`activeTab`: `'dashboard' | 'cycle-time' | 'throughput' | 'cfd' | 'blockers'`).
- Na aba `cycle-time`, renderizar o `CycleTimeScatterPlot` em tela cheia acompanhado do `ChartControlsPanel`.
- Na visão `dashboard` consolidada, substituir o antigo `LeadTimeScatter` pelo novo `CycleTimeScatterPlot`, mantendo a grade lado a lado com o `ThroughputChart` e botões de expansão modal.
- Integrar a barra superior `AnalyticsNavHeader`.

#### [MODIFY] [Analytics.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Analytics.css)
- Estilos para as abas de navegação (`analytics-nav-header`, `analytics-nav-tab`, `analytics-nav-dropdown`).
- Estilos para as linhas de percentil (`percentile-dashed-line p50`, `p85`, `p95` e badges).
- Estilos para o painel retrátil de controles (`chart-controls-drawer`, `chart-controls-toggle-btn`, switches, resumo de estatísticas).
- Estilos para os pontos de dispersão normais e bloqueados (`cycle-scatter-dot`, anel de alerta pulsante, rich tooltip).

### Testing Layer
#### [NEW] [statistics.test.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/statistics.test.ts)
- Testes de precisão para percentis 50%, 85% e 95% contra amostras conhecidas de tempo de ciclo.

#### [NEW] [CycleTimeScatterPlot.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/CycleTimeScatterPlot.test.tsx)
- Validar renderização dos pontos, linhas de percentis, toggles e destaque de tarefas bloqueadas.

---

## 5. Verification Plan

### Automated Tests
1. Executar testes das funções estatísticas:
   ```bash
   npm test tests/unit/statistics.test.ts
   ```
2. Executar suíte completa:
   ```bash
   npm test
   ```
   *Critério*: 100% dos testes passando (mínimo de 203 + novos testes).
3. Validar compilação:
   ```bash
   npm run build
   ```

### Manual Verification
1. Abrir a aplicação em `http://localhost:5173/` e alternar para a visão **Analytics**.
2. Verificar a barra de abas no topo:
   - Clicar na aba **Cycle Time** e inspecionar a visualização do Scatter Plot em tela cheia.
   - Observar as linhas horizontais pontilhadas dos percentis 50%, 85% e 95% calculadas sobre as tarefas concluídas.
3. Abrir o painel lateral de controles:
   - Desmarcar o 95º percentil e ver a linha desaparecer no gráfico.
   - Ativar o destaque de itens bloqueados e ver tarefas com bloqueio destacadas em vermelho.
   - Passar o mouse sobre os pontos e verificar os dados no tooltip.
