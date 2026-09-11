# Implementation Plan: Gráfico de Vazão Avançado com Histograma e Linha do Tempo (Throughput Analytics)

**Branch**: `021-throughput-histogram-timeline` | **Date**: 2026-09-11 | **Spec**: [specs/021-throughput-histogram-timeline/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Evolução do gráfico de vazão (*Throughput*) do Metrik a partir da imagem de referência fornecida pelo usuário, combinando um **Throughput Histogram** (com linhas de percentis 50%, 70%, 85%, 95%) e um **Daily Throughput Run Chart** (série temporal cronológica conectando os pontos diários ao longo dos meses), implementados estritamente em SVG nativo responsivo sem dependências externas.

## User Review Required

> [!IMPORTANT]
> - **Renderização 100% SVG Nativo**: Conforme o Princípio V da Constituição do Metrik, nenhum framework gráfico externo (Chart.js, Recharts, D3) será introduzido. Ambos os gráficos serão implementados em SVG vetorial nativo puro com CSS do Metrik.
> - **Preenchimento Obrigatório de Dias com 0 Entregas**: Na literatura lean (Daniel Vacanti), para que o histograma reflita a real capacidade da equipe, dias sem conclusões (como fins de semana e dias sem deploy) devem constar com valor 0, refletindo a barra alta de 0 observada na imagem de referência.
> - **Independência Estrita de Marca**: Conforme o Princípio VII da Constituição, nenhum nome de ferramenta comercial concorrente será mencionado no código, documentação ou UI.

---

## Proposed Changes

### 1. Módulo de Métricas e Utilitários Estatísticos de Vazão

#### [NEW] [src/utils/throughputMetrics.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/throughputMetrics.ts)
- `ThroughputHistogramBin`: Interface `{ throughputValue: number; frequencyDays: number; percentage: number }`.
- `ThroughputDailyPoint`: Interface `{ date: string; count: number }`.
- `ThroughputSummary`: Interface `{ totalCompleted: number; totalDays: number; averagePerDay: number; p50: number; p70: number; p85: number; p95: number; mode: number; maxDaily: number }`.
- `extractThroughputSeries(tasks: TaskModel[], daysWindow: number, referenceDate?: Date)`: Extrai a série diária contínua preenchendo dias sem entrega com `count: 0`.
- `calculateThroughputHistogram(dailyPoints: ThroughputDailyPoint[])`: Gera baldes ordenados por valor de vazão (`0, 1, 2, 3, ...`) e contagem de dias.
- `calculateThroughputPercentiles(dailyCounts: number[])`: Calcula P50, P70, P85 e P95 pelo padrão NIST.

#### [NEW] [tests/unit/throughputMetrics.test.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/throughputMetrics.test.ts)
- Testes unitários validando preenchimento com zero, contagem de frequências, cálculo dos percentis NIST e cálculo de métricas de resumo.

---

### 2. Componentes de Visualização em SVG Nativo

#### [NEW] [src/components/charts/ThroughputHistogramChart.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/ThroughputHistogramChart.tsx)
- Renderiza o **Throughput Histogram**:
  - Eixo X: `# of Work Items Completed on a Day` (`0, 1, 2, 3, ...`).
  - Eixo Y: `Frequency (# of Days)`.
  - Barras azuis retangulares com espaçamento consistente.
  - Linhas verticais pontilhadas com marcadores superiores para os percentis NIST: **50%**, **70%**, **85%** e **95%**.
  - Tooltips interativos com detalhe de frequência e percentual do período.

#### [NEW] [src/components/charts/ThroughputRunChart.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/ThroughputRunChart.tsx)
- Renderiza o **Daily Throughput Run Chart / Timeline**:
  - Eixo X: Datas formatadas ao longo do tempo (ex: `2026-02`, `2026-03`, `2026-04`).
  - Eixo Y: Vazão diária (`0, 2, 4, 6, 8+`).
  - Linha SVG contínua conectando os pontos de dados de cada dia.
  - Círculos (`dots`) nos pontos com hover tooltip mostrando data e quantidade concluída.

#### [NEW] [src/components/ThroughputAnalyticsView.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/ThroughputAnalyticsView.tsx)
- Visão focada da aba `Throughput`:
  - Barra de controle de janela histórica (14 dias, 30 dias, 60 dias, 90 dias, todo o histórico).
  - Cartões de resumo executivo: Total Entregue, Média Diária, P50, P70, P85 (SLE), P95 e Moda.
  - Container agrupado contendo o **Throughput Histogram** no topo e o **Daily Run Chart** logo abaixo, reproduzindo com fidelidade a composição visual da imagem.
  - Estado educativo para boards sem tarefas concluídas.

---

### 3. Integração com o Dashboard e Estilos

#### [MODIFY] [src/components/AnalyticsDashboard.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/AnalyticsDashboard.tsx)
- Atualizar a aba `throughput` para renderizar `ThroughputAnalyticsView`, passando as tarefas do board.
- Manter o card compacto do dashboard geral funcionando com o `ThroughputChart.tsx` existente.

#### [MODIFY] [src/styles/Analytics.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/styles/Analytics.css)
- Adicionar estilos para a visualização analítica de throughput, cartões de métricas, controles de janela e containers SVG dos gráficos.

---

### 4. Testes Automatizados

#### [NEW] [tests/unit/ThroughputAnalyticsView.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/ThroughputAnalyticsView.test.tsx)
- Validação da renderização dos dois gráficos (histograma e run chart).
- Validação de alternância de períodos (ex: 30 vs 60 dias).
- Validação do estado vazio quando não há tarefas concluídas.

---

## Verification Plan

### Automated Tests
- Executar testes unitários específicos:
  ```bash
  npx vitest run tests/unit/throughputMetrics.test.ts
  npx vitest run tests/unit/ThroughputAnalyticsView.test.tsx
  ```
- Executar suíte completa de regressão:
  ```bash
  npm test
  ```
- Validar build de produção:
  ```bash
  npm run build
  ```

### Manual Verification
- Acessar o Metrik na aba de Analytics e clicar na aba "Throughput".
- Conferir a correspondência visual com a imagem de referência:
  - Histograma na parte superior com linhas verticais pontilhadas de percentis (50%, 70%, 85%, 95%).
  - Run chart temporal contínuo na parte inferior com linhas conectando os pontos diários.
  - Tooltips funcionando ao passar o mouse sobre as barras e sobre os pontos da linha do tempo.
  - Troca da janela temporal recalculando métricas e gráficos instantaneamente.
