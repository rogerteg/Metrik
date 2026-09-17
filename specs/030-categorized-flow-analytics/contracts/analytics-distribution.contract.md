# Contract: Distribuição e Navegação Analítica de Fluxo

**Feature Branch**: `030-categorized-flow-analytics`  
**Date**: 2026-09-17  
**Spec**: [spec.md](../spec.md) | **Data Model**: [data-model.md](../data-model.md)

---

## 1. Contratos de Componentes de Interface (UI Contracts)

### 1.1 `AnalyticsNavHeader` (Barra Superior de Categorias)

```typescript
export interface AnalyticsNavHeaderProps {
  /** Categoria atualmente selecionada */
  activeCategory: AnalyticsCategory;
  /** Callback para alteração de categoria */
  onSelectCategory: (category: AnalyticsCategory) => void;
  /** Modo de visualização ativo em Cycle Time ('scatter' | 'histogram') */
  cycleTimeMode: 'scatter' | 'histogram';
  /** Callback para alternar modo em Cycle Time */
  onSelectCycleTimeMode: (mode: 'scatter' | 'histogram') => void;
  /** Modo de visualização ativo em Blockers ('clustering' | 'dynamics') */
  blockerMode: 'clustering' | 'dynamics';
  /** Callback para alternar modo em Blockers */
  onSelectBlockerMode: (mode: 'clustering' | 'dynamics') => void;
  /** Callback para abrir/fechar a gaveta de Dataset Configuration */
  onToggleDatasetDrawer: () => void;
  /** Indicador visual se há filtros ativos no dataset */
  hasActiveDatasetFilters?: boolean;
}
```

---

### 1.2 `DashboardSummaryCards` (Cartões de Síntese Executiva do Dashboard)

```typescript
export interface DashboardSummaryCardsProps {
  /** Expectativa de Nível de Serviço calculada */
  sle: ServiceLevelExpectation;
  /** Quantidade total de itens atualmente em progresso (WIP) */
  totalWip: number;
  /** Quantidade de itens entregues nos últimos 7 dias */
  recentThroughput: number;
  /** Percentual de cartões que sofreram bloqueios na amostra */
  blockedRatePercentage: number;
  /** Callback ao clicar no card de SLE para navegar até a aba detalhada */
  onNavigateToSle?: () => void;
  /** Callback ao clicar no card de WIP para navegar até a aba WIP Aging */
  onNavigateToWip?: () => void;
}
```

---

### 1.3 `DatasetConfigurationDrawer` (Gaveta Lateral de Configuração)

```typescript
export interface DatasetConfigurationDrawerProps {
  /** Estado de visibilidade da gaveta retrátil */
  isOpen: boolean;
  /** Callback para fechar a gaveta */
  onClose: () => void;
  /** Configuração ativa de filtros do conjunto de dados */
  config: DatasetFilterConfig;
  /** Callback para atualizar parâmetros da configuração */
  onUpdateConfig: (patch: Partial<DatasetFilterConfig>) => void;
  /** Callback para redefinir aos padrões do quadro */
  onResetToDefaults: () => void;
}
```

---

## 2. Contratos de Funções Utilitárias Puras (Pure Function Contracts)

### 2.1 `calculateSleMetrics`
Calcula o tempo de ciclo no percentil de referência e a taxa de conformidade:

```typescript
export function calculateSleMetrics(
  completedTasks: TaskModel[],
  targetPercentile: number = 85,
  targetDays?: number | null
): ServiceLevelExpectation;
```

- **Entrada**: Lista de tarefas concluídas, percentil desejado (padrão: 85) e meta opcional em dias.
- **Saída**: Objeto `ServiceLevelExpectation` com `observedDays`, `complianceRate` e `sampleSize`.
- **Garantia**: Se `completedTasks.length === 0`, retorna valores neutros seguros sem lançar exceções.

---

### 2.2 `calculateBlockerClusters`
Agrupa tarefas bloqueadas por motivo/tag e quantifica duração e frequência:

```typescript
export function calculateBlockerClusters(
  tasks: TaskModel[]
): BlockerDynamicsSummary;
```

- **Entrada**: Lista de tarefas do quadro.
- **Saída**: Objeto `BlockerDynamicsSummary` contendo métricas agregadas e lista ordenada de clusters por frequência decrescente.

---

### 2.3 `filterTasksByDatasetConfig`
Filtra a coleção de tarefas com base na janela temporal e tipos selecionados:

```typescript
export function filterTasksByDatasetConfig(
  tasks: TaskModel[],
  config: DatasetFilterConfig,
  referenceNowMs: number = Date.now()
): TaskModel[];
```

- **Entrada**: Tarefas brutas, configuração de filtro e timestamp de referência.
- **Saída**: Subconjunto filtrado de tarefas atendendo à janela temporal.
