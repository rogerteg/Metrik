# Implementation Plan: Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

**Branch**: `020-wip-aging-chart` | **Date**: 2026-09-11 | **Spec**: [specs/020-wip-aging-chart/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Implementar no Metrik o módulo completo do **Aging WIP Chart (Gráfico de Envelhecimento do Trabalho em Progresso)** conforme o benchmark analítico enterprise e as diretrizes Lean de Daniel Vacanti:
1. **Módulo de Métricas de Envelhecimento (`src/utils/wipAgingMetrics.ts`)**:
   - Cálculo da idade de cada tarefa ativa (em dias corridos com precisão decimal) em relação à data de corte ("As of Date").
   - Cálculo dos **Pace Percentiles por Etapa**: cálculo dos percentis históricos de permanência (50%, 70%, 85%, 95%) para cada coluna individualmente, com fallback automático gracioso para o percentil de ciclo global caso uma etapa possua poucas amostras (< 3 tarefas).
   - Agrupamento das tarefas em andamento por coluna do board ativo com detecção de cartões bloqueados.
2. **Componente Visual Gráfico em SVG Nativo (`src/components/charts/WipAgingChart.tsx`)**:
   - Eixo X com as colunas em andamento (com contagem de `WIP: N` no topo).
   - Eixo Y com a escala de idade em dias (`Age (Day)`).
   - **Bandas de Risco Coloridas por Etapa**:
     - 🟩 **Verde (0 até P50)**: Ritmo saudável.
     - 🟨 **Amarelo (P50 até P70)**: Alerta precoce / aproximação da mediana.
     - 🟧 **Laranja (P70 até P85 / P95)**: Risco elevado / zona de SLE.
     - 🟥 **Vermelho (> P95)**: Alerta crítico / envelhecimento anormal / cauda longa.
   - **Pontos Plotados (`Aging Work Items`)**: Cada cartão em andamento renderizado como círculo com hover interativo e badge diferenciado para itens bloqueados.
   - **Tooltip Dinâmico**: Detalhes completos do cartão (ID, título, idade exata, dias na etapa atual, tags, responsável, status de bloqueio).
3. **Painéis Laterais Retráteis Duais**:
   - **Painel Esquerdo (`Dataset configuration`)**: Drawer retrátil com seletor de workflow, filtro de data inicial (`Start Date after`) e botão `LOAD`.
   - **Painel Direito (`Controls for this Chart`)**: Drawer retrátil com checkboxes para ligar/desligar percentis (50%, 70%, 85%, 95%), alternador de paleta de ritmo e alerta de tarefas estagnadas (*Stalled Alert*).
4. **Integração de Navegação (`AnalyticsNavHeader.tsx` & `AnalyticsDashboard.tsx`)**:
   - Nova aba dedicada `wip` (`⏳ WIP Aging`) na barra analítica.
   - Estado vazio e instrutivo (*Empty/Guidance State*) caso não haja cartões em andamento ou histórico concluído.

---

## 2. Contexto Técnico & Requisitos Constitucionais (v1.2.0)

- **Tecnologias**: React 19, TypeScript 5.7+ (Strict Mode), SVG Nativo.
- **Zero Dependências Externas (Princípio V - Simplicidade & YAGNI)**: Renderização vetorial responsiva pura em SVG, sem Chart.js, D3 ou Recharts.
- **Independência Estrita de Marca (Princípio VII)**: Nomenclatura 100% científica e autônoma (Daniel Vacanti, Frank Vega, Lei de Little, Padrão NIST). Zero vazamento de marcas de terceiros.
- **Performance (NFR-001)**: Renderização inicial e recálculos em $\le 50\text{ ms}$.

---

## 3. Estrutura de Arquivos e Módulos

```
src/
├── utils/
│   ├── wipAgingMetrics.ts            [NEW] Cálculo de idade de tarefas, percentis por etapa e agrupamento
│   └── statistics.ts                 [REUSED] Cálculo de percentis via interpolação linear NIST
├── hooks/
│   └── useWipAgingData.ts            [NEW] Hook para extrair tarefas ativas, histórico e percentis
├── components/
│   ├── charts/
│   │   ├── WipAgingChart.tsx         [NEW] Gráfico SVG principal com faixas coloridas e pontos
│   │   ├── WipAgingFilterDrawer.tsx  [NEW] Drawer retrátil esquerdo (Dataset configuration)
│   │   └── WipAgingControlDrawer.tsx [NEW] Drawer retrátil direito (Controls for this Chart)
│   ├── WipAgingView.tsx              [NEW] Visão consolidada com cabeçalho, canvas e gavetas duais
│   ├── AnalyticsNavHeader.tsx        [MODIFY] Adicionar aba 'wip'
│   ├── AnalyticsDashboard.tsx        [MODIFY] Renderizar WipAgingView na aba 'wip'
│   └── Analytics.css                 [MODIFY] Estilos para o canvas, gavetas retráteis e tooltip
tests/
└── unit/
    ├── wipAgingMetrics.test.ts       [NEW] Testes unitários do cálculo de idade e percentis por etapa
    └── WipAgingView.test.tsx         [NEW] Testes de integração de UI, tooltips e gavetas retráteis
```

---

## 4. Detalhamento dos Componentes

### 4.1. Camada de Dados e Matemática (`src/utils/wipAgingMetrics.ts`)
- `calculateItemAgeDays(task: TaskModel, referenceDate?: Date): number`:
  - Calcula a diferença em milissegundos entre a data de referência e o `task.startedAt` (ou `task.createdAt`), convertendo para dias decimais (`Math.max(0.1, Number((diffMs / 86400000).toFixed(1)))`).
- `calculateStagePacePercentiles(tasks: TaskModel[], columns: ColumnModel[]): Map<string, FlowPercentiles>`:
  - Para cada coluna do board, extrai os tempos de permanência históricos das tarefas concluídas.
  - Se a coluna tiver $\ge 3$ amostras, calcula os percentis 50%, 70%, 85% e 95% específicos daquela etapa.
  - Caso contrário, aplica fallback para os percentis globais de ciclo ponderados.
- `groupActiveTasksByColumn(tasks: TaskModel[], columns: ColumnModel[], referenceDate?: Date): StageWipGroup[]`:
  - Retorna a lista ordenada de colunas em andamento com suas respectivas contagens de WIP, tarefas ativas com suas idades calculadas e percentis da etapa.

### 4.2. Gráfico em SVG Nativo (`src/components/charts/WipAgingChart.tsx`)
- Renderização SVG responsiva (`viewBox="0 0 900 480"`).
- Divisão horizontal em colunas verticais proporcionais.
- Em cada coluna:
  - 4 retângulos de fundo correspondentes às faixas de risco (Verde, Amarelo, Laranja, Vermelho).
  - Linhas horizontais pontilhadas nos limites de percentil visíveis (50%, 70%, 85%, 95%).
  - Círculos de pontos (`Aging Work Items`) posicionados na coordenada X da coluna (com leve dispersão horizontal *jitter* para evitar sobreposição de cartões com a mesma idade) e na coordenada Y de sua idade.
  - Rótulo superior `WIP: N` no topo da coluna.
- Tooltip rico ao pousar sobre qualquer ponto: título, idade em dias, tempo na coluna atual e indicador de bloqueio.

### 4.3. Gavetas Retráteis Duais
- **`WipAgingFilterDrawer.tsx` (Esquerda)**:
  - Botão de toggle minimalista com ícone de engrenagem/filtro.
  - Seletor de workflow / colunas ativas.
  - Campo `Start Date after`.
  - Checkbox `Ignore Cycle Time Configuration`.
  - Botão `LOAD / Aplicar Filtros`.
- **`WipAgingControlDrawer.tsx` (Direita)**:
  - Botão de toggle com ícone de controles.
  - Checkboxes para exibição seletiva de percentis (50%, 70%, 85%, 95%).
  - Toggle de destaque para tarefas paradas/bloqueadas (*Stalled Alert*).

---

## 5. Plano de Verificação

### Testes Automatizados (Vitest)
1. **`tests/unit/wipAgingMetrics.test.ts`**:
   - Cálculo preciso da idade do item em dias decimais.
   - Cálculo de percentis por etapa e fallback gracioso para percentil global quando há poucas amostras.
   - Agrupamento correto de cartões ativos por coluna e preservação de status de bloqueio.
2. **`tests/unit/WipAgingView.test.tsx`**:
   - Renderização das colunas, pontos de WIP e bandas coloridas de percentil.
   - Abertura e fechamento das gavetas retráteis esquerda e direita.
   - Alternância de visibilidade de percentis através do painel de controle.
   - Integração com a aba `wip` no `AnalyticsDashboard.tsx`.
3. **Regressão Global**:
   - Execução de `npm test` garantindo que todos os 234 testes prévios continuem verdes.
