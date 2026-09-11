# Implementation Plan: CFD Avançado com Análise de Fluxo e Gargalos

**Branch**: `018-cfd-advanced-flow-analytics` | **Date**: 2026-09-11 | **Spec**: [specs/018-cfd-advanced-flow-analytics/spec.md](spec.md)

---

## 1. Resumo & Arquitetura Visual

Implementar no Metrik o **Cumulative Flow Diagram (CFD) Avançado** com recursos completos de análise de fluxo:
1. **Inspeção Dual Interativa de Fluxo (WIP vs Lead Time)**:
   - Medição vertical de WIP: linha de corte na data selecionada com badge de quantidade de itens (`X items`).
   - Medição horizontal de Lead Time: seta horizontal bidirecional ligando a curva de entrada à curva de saída com badge de duração em dias (`Y days`).
   - Alerta visual de gargalo: tag vermelha (*A queue column expanding*) quando a taxa de acúmulo da banda exceder o fluxo de saída da etapa.
2. **Painel Retrátil de Filtros de Dataset à Esquerda (`CfdFilterDrawer`)**:
   - Gaveta lateral colapsável com botão de toggle estilizado.
   - Filtros de intervalo: `Requested after` (data inicial) e `Finished before` (data final).
   - Seletor de workflow / colunas ativas para filtrar etapas exibidas no fluxo.
   - Botão de aplicação `LOAD` / `Aplicar Filtros`.
3. **Timeline Scrubber / Mini-Gráfico Inferior**:
   - Miniatura do CFD na base com slider / alças arrastáveis de seleção de período para zoom e navegação temporal em datasets longos.
4. **Integração no `AnalyticsDashboard.tsx`**:
   - CFD enriquecido tanto na aba focada `CFD / Fluxo` quanto no card do `Dashboard` consolidado.

---

## 2. Contexto Técnico

- **Tecnologias**: React 19, TypeScript 5.7+, SVG Vetorial Nativo.
- **Zero Dependências Externas**: Conforme o Princípio V da Constituição (Simplicidade & YAGNI).
- **Componentes e Módulos Envolvidos**:
  - `src/utils/cfdMetrics.ts` [NEW]: Algoritmo de interpolação temporal horizontal para calcular o Lead Time aproximado na altura de qualquer data, e cálculo de WIP vertical.
  - `src/components/charts/CfdFilterDrawer.tsx` [NEW]: Painel retrátil à esquerda com inputs de data inicial/final e seleção de etapas.
  - `src/components/charts/CfdTimelineScrubber.tsx` [NEW]: Sub-gráfico de miniatura inferior com seleção de janela temporal.
  - `src/components/charts/CumulativeFlowChart.tsx` [MODIFY]: Integração das medições com setas e badges SVG, suporte a zoom e conexão com os filtros.
  - `src/hooks/useCfdData.ts` [MODIFY]: Suporte a intervalo flexível de datas (data inicial e data final personalizadas).
  - `src/components/Analytics.css` [MODIFY]: Estilos do drawer de filtros, setas horizontais bidirecionais, tags de gargalo e timeline scrubber.

---

## 3. Verificação Constitucional

- **I. Spec-Driven Precedence**: **PASS** — `spec.md` e `checklists/requirements.md` devidamente validados.
- **II. Modularity & Clean Code**: **PASS** — Desacoplamento da matemática de interpolação horizontal em utilitário puro e componentes dedicados.
- **III. Automated Verification**: **PASS** — Testes unitários para cálculo de Lead Time/WIP horizontal e renderização do CFD.
- **IV. Simplicity & YAGNI**: **PASS** — SVG vetorial nativo de alta performance sem bibliotecas terceiras.

---

## 4. Proposed Changes

### Math & Utilities Layer
#### [NEW] [cfdMetrics.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/cfdMetrics.ts)
- `calculateHorizontalLeadTime(dataPoints: CfdDataPoint[], activeIndex: number, colId: string): { leadTimeDays: number; startX: number; endX: number }`
- `detectQueueExpansion(dataPoints: CfdDataPoint[], colId: string): boolean`

### Data Hook Layer
#### [MODIFY] [useCfdData.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useCfdData.ts)
- Suportar parâmetros opcionais `startDate?: string` e `endDate?: string` para filtragem personalizada de datas.

### Components Layer
#### [NEW] [CfdFilterDrawer.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/CfdFilterDrawer.tsx)
- Drawer retrátil à esquerda com campos `Requested after`, `Finished before`, seletor de colunas e botão `LOAD`.

#### [NEW] [CfdTimelineScrubber.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/CfdTimelineScrubber.tsx)
- Miniatura SVG do CFD com caixa de seleção de intervalo arrastável.

#### [MODIFY] [CumulativeFlowChart.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/charts/CumulativeFlowChart.tsx)
- Renderizar a seta bidirecional horizontal de Lead Time e linha vertical de WIP com badges de dados e tag `A queue column expanding`.
- Integrar `CfdFilterDrawer` e `CfdTimelineScrubber`.

#### [MODIFY] [Analytics.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Analytics.css)
- Estilização do drawer de filtros, setas SVG, badges de itens e mini-timeline.

### Testing Layer
#### [NEW] [cfdMetrics.test.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/cfdMetrics.test.ts)
- Testes unitários para interpolação de Lead Time horizontal e detecção de filas em expansão.

#### [MODIFY] [CumulativeFlowChart.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/CumulativeFlowChart.test.tsx)
- Validar renderização das medições de WIP e Lead Time e do drawer de filtros.

---

## 5. Verification Plan

### Automated Tests
1. Executar testes de métricas de CFD:
   ```bash
   npm test tests/unit/cfdMetrics.test.ts
   ```
2. Executar suíte completa:
   ```bash
   npm test
   ```
   *Critério*: 213+ testes passando sem nenhuma regressão.
3. Compilação de produção:
   ```bash
   npm run build
   ```

### Manual Verification
1. Abrir `http://localhost:5173/` e alternar para a aba **Analytics** -> **CFD / Fluxo**.
2. Pousar o cursor sobre as bandas e verificar:
   - A linha vertical de corte com badge `X items` (WIP).
   - A seta bidirecional horizontal com badge `Y days` (Lead Time).
   - A tag de gargalo se a fila estiver em expansão.
3. Abrir o botão de filtros à esquerda, alterar datas inicial e final, clicar em `LOAD` e observar o recalculo dinâmico.
4. Usar a mini-timeline inferior para navegar por diferentes janelas temporais.
