# Data Model & Architecture: Feature 018 - CFD Avançado com Análise de Fluxo e Gargalos

**Feature**: `018-cfd-advanced-flow-analytics` | **Date**: 2026-09-11

---

## 1. Estrutura de Entidades e Tipos de Dados

### 1.1 `CfdDataPoint` (Ponto Diário de Amostragem do Fluxo)
Representa o estado cumulativo das tarefas em uma data específica:
```typescript
export interface CfdDataPoint {
  date: string;                     // 'YYYY-MM-DD'
  todo: number;                     // Tarefas ainda na etapa inicial
  inProgress: number;               // Tarefas ativas em andamento
  done: number;                     // Tarefas finalizadas até a data
  total: number;                    // Total cumulativo de cartões criados até a data
  cumulativeStarted: number;        // Total cumulativo que ingressou em fluxo ativo
  cumulativeDone: number;           // Total cumulativo de cartões concluídos
  stageCounts?: Record<string, number>;       // Contagem pontual por ID de coluna
  cumulativeStages?: Record<string, number>;  // Cumulativa por coluna (da direita para esquerda)
}
```

### 1.2 `CfdInspectionMeasurement` (Geometria da Inspeção Dual)
Resultado do cálculo de WIP vertical e Lead Time horizontal projetado no SVG:
```typescript
export interface CfdInspectionMeasurement {
  date: string;
  wipItems: number;           // Altura vertical em número de cartões
  leadTimeDays: number;       // Distância horizontal em dias decorridos
  isExpandingQueue: boolean;  // Verdadeiro se WIP recente for >= 1.4x o inicial (min 3 itens)
  topY: number;               // Coordenada Y da curva de entrada da etapa
  bottomY: number;            // Coordenada Y da curva de saída da etapa
  startX: number;             // Coordenada X onde a curva de chegada esteve no patamar
  endX: number;               // Coordenada X atual de inspeção
  stageTitle: string;         // Nome da coluna inspecionada
}
```

### 1.3 `CfdFilterState` (Parâmetros de Filtragem Flexível)
```typescript
export interface CfdFilterState {
  startDate?: string;         // 'YYYY-MM-DD'
  endDate?: string;           // 'YYYY-MM-DD'
  visibleColumnIds?: Set<string>;
}
```

---

## 2. Invariantes de Dados & Regras de Transição

1. **Monotonicidade Cumulativa**: A curva total e as curvas cumulativas nunca decrescem no tempo:
   $$\text{cumulativeDone}(t_2) \ge \text{cumulativeDone}(t_1) \quad \forall t_2 > t_1$$
2. **Conservação de Itens**:
   $$\text{total}(t) = \text{todo}(t) + \text{inProgress}(t) + \text{done}(t)$$
3. **Consistência de Mapeamento**: Tarefas com `completedAt` alimentam a etapa `done`; tarefas com `startedAt` alimentam a coluna atual correspondente ao seu `task.column`.
