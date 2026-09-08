# Data Model: Limites de WIP e Métricas de Fluxo (Fase 2)

**Feature**: `002-wip-limits-and-flow-metrics`  
**Date**: 2026-09-08

---

## 1. Entidades e Modelos TypeScript

### `TaskModel` (Estendido)
Representa a unidade de trabalho com rastreamento temporal para métricas:

```typescript
import { ColumnType } from './kanban';

export interface TaskModel {
  /** Identificador único universal (UUID v4) */
  id: string;

  /** Conteúdo textual da tarefa */
  title: string;

  /** Coluna / estado atual da tarefa */
  column: ColumnType;

  /** Cor ou tag temática opcional */
  color?: string;

  /** Timestamp ISO 8601 da criação (criação do cartão) */
  createdAt: string;

  /** Timestamp ISO 8601 da última atualização */
  updatedAt?: string;

  /** Timestamp ISO 8601 do primeiro ingresso em In Progress */
  startedAt?: string;

  /** Timestamp ISO 8601 da conclusão (ingresso em Completed) */
  completedAt?: string;
}
```

---

### `WipLimitsState`
Mapa dos limites de WIP configurados para cada coluna:

```typescript
export type WipLimitsState = Record<ColumnType, number | null>;

export const INITIAL_WIP_LIMITS: WipLimitsState = {
  [ColumnType.TO_DO]: null,          // Sem limite por padrão
  [ColumnType.IN_PROGRESS]: 3,       // Limite demonstrativo
  [ColumnType.BLOCKED]: 2,           // Limite demonstrativo
  [ColumnType.COMPLETED]: null,      // Sem limite por padrão
};
```

---

### `FlowMetricsSummary`
Estrutura calculada das métricas de fluxo do quadro:

```typescript
export interface FlowMetricsSummary {
  /** Quantidade total de tarefas na coluna Completed */
  throughput: number;

  /** Média do Lead Time em milissegundos (ou null se throughput == 0) */
  avgLeadTimeMs: number | null;

  /** Média do Cycle Time em milissegundos (ou null se throughput == 0) */
  avgCycleTimeMs: number | null;

  /** Texto formatado para exibição do Lead Time Médio */
  formattedAvgLeadTime: string;

  /** Texto formatado para exibição do Cycle Time Médio */
  formattedAvgCycleTime: string;
}
```

---

## 2. Regras de Transição de Estado e Timestamps

| Transição de Origem ➔ Destino | Ação em `startedAt` | Ação em `completedAt` |
|-------------------------------|---------------------|-----------------------|
| `Todo` ➔ `In Progress`        | Se `undefined`, define `now()` | Mantém `undefined` |
| `In Progress` ➔ `Blocked`     | Preserva `startedAt` | Mantém `undefined` |
| `Blocked` ➔ `In Progress`     | Preserva `startedAt` | Mantém `undefined` |
| `In Progress` ➔ `Completed`   | Preserva `startedAt` | Define `now()` |
| `Blocked` ➔ `Completed`       | Se `undefined`, define `createdAt` | Define `now()` |
| `Todo` ➔ `Completed`          | Se `undefined`, define `createdAt` | Define `now()` |
| `Completed` ➔ `Blocked`/`In Progress`/`Todo` | Preserva `startedAt` | Limpa (`undefined`) |

---

## 3. Validação de Schema e Fallbacks Defensivos

### Validação de Limites de WIP
```typescript
export function isValidWipLimitsState(data: unknown): data is WipLimitsState {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as Record<string, unknown>;
  const requiredColumns = [
    ColumnType.TO_DO,
    ColumnType.IN_PROGRESS,
    ColumnType.BLOCKED,
    ColumnType.COMPLETED,
  ];

  for (const col of requiredColumns) {
    const val = candidate[col];
    if (val !== null && (typeof val !== 'number' || val < 1 || !Number.isInteger(val))) {
      return false;
    }
  }

  return true;
}
```
