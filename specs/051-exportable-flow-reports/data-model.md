# Data Model: Relatórios Exportáveis em PDF/Excel

**Feature**: `051-exportable-flow-reports`  
**Date**: 2026-10-28  
**Status**: Complete  

---

## Entity Definitions

### 1. `FlowReportSnapshot`

Represents an immutable, point-in-time consolidated snapshot of board flow metrics, health indicators, and AI diagnostics prepared for executive presentation (PDF) and audit records.

| Field | Type | Required | Description |
|---|---|---|---|
| `boardId` | `string` | Yes | Unique identifier of the board. |
| `boardTitle` | `string` | Yes | Human-readable title of the board. |
| `squadName` | `string` | No | Associated squad or team name, if assigned. |
| `generatedAt` | `string` | Yes | ISO 8601 timestamp representing when the report was compiled. |
| `dateWindow` | `ReportDateWindow` | Yes | Temporal window evaluated for the report. |
| `filterSummary` | `string` | Yes | Human-readable summary of active dataset filters (e.g. "Últimos 30 dias • Todas as prioridades"). |
| `totalTasks` | `number` | Yes | Count of tasks in the evaluated dataset scope. |
| `completedTasks` | `number` | Yes | Count of completed tasks within the evaluated window. |
| `wipCount` | `number` | Yes | Current active Work-In-Progress count. |
| `metrics` | `FlowReportMetrics` | Yes | Computed flow metrics. |
| `percentiles` | `CycleTimePercentiles` | Yes | Cycle time percentiles (P50, P85, P95). |
| `mikaInsights` | `MikaInsightSnippet[]` | No | Optional snapshot of active Mika AI diagnostic insights. |
| `blockerSummary` | `BlockerReportSummary` | No | Optional consolidated blocker metrics. |

#### Sub-types:

```typescript
export interface ReportDateWindow {
  startDate?: string;
  endDate?: string;
  label: string;
}

export interface FlowReportMetrics {
  throughput: number;             // Total concluded items in window
  avgLeadTimeDays: number;         // Average lead time in days
  avgCycleTimeDays: number;        // Average cycle time in days
  sleP85Days: number;              // 85th percentile service level expectation in days
  sleComplianceRate: number;       // Percentage of items completed within SLE (0-100)
  blockerRatePercent: number;      // Percentage of items that experienced a block (0-100)
  totalBlockedHours: number;       // Sum of all blocked hours across evaluated items
}

export interface CycleTimePercentiles {
  p50: number;                     // Median cycle time (days)
  p85: number;                     // 85th percentile (days)
  p95: number;                     // 95th percentile (days)
}

export interface MikaInsightSnippet {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  category?: string;
}

export interface BlockerReportSummary {
  totalBlockers: number;
  totalImpactHours: number;
  topReasons: Array<{
    reason: string;
    count: number;
    impactHours: number;
  }>;
}
```

---

### 2. `TaskExportRow`

Represents a normalized, single-row projection of a task or subtask ready for tabular CSV / Excel export.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Task identifier (e.g. `TASK-102` or UUID). |
| `title` | `string` | Sanitized task title. |
| `type` | `string` | Item type (`Cartão`, `Subtarefa`, `Iniciativa`). |
| `column` | `string` | Current column name. |
| `category` | `string` | Work category (e.g. `Frontend`, `Backend`, `Bug`). |
| `priority` | `string` | Priority level (`Baixa`, `Média`, `Alta`, `Urgente`). |
| `assignee` | `string` | Assigned user name or `-`. |
| `sprint` | `string` | Associated sprint title or `-`. |
| `storyPoints` | `string` | Numeric estimation formatted with comma or `-`. |
| `createdAt` | `string` | Date of creation (`DD/MM/YYYY HH:mm`). |
| `startedAt` | `string` | Date moved to in-progress (`DD/MM/YYYY HH:mm` or `-`). |
| `completedAt` | `string` | Date moved to done (`DD/MM/YYYY HH:mm` or `-`). |
| `leadTimeDays` | `string` | Computed Lead Time in days with comma decimal (`3,2` or `-`). |
| `cycleTimeDays` | `string` | Computed Cycle Time in days with comma decimal (`1,8` or `-`). |
| `isBlocked` | `string` | Blocked indicator (`Sim` ou `Não`). |
| `blockedHours` | `string` | Total blocked duration in hours with comma decimal (`14,5` or `0,0`). |
| `tags` | `string` | Semicolon or comma-joined tags or `-`. |
| `subtaskCount` | `number` | Count of linked subtasks. |

---

### 3. `ExportOptions`

Configuration chosen by the user in the `ExportReportModal` before executing the export.

```typescript
export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeMikaInsights: boolean;
  includeBlockerBreakdown: boolean;
  includeSubtasks: boolean;
}
```

---

## Validation Rules & Business Invariants

1. **Read-Only Invariant**: Export functions are strictly non-mutating (`readonly` operations). Under no circumstances may generating a report mutate task timestamps, column positions, or board settings.
2. **Deterministic Formatting**: All numeric values in spreadsheet exports MUST use comma (`,`) as decimal separator (`12,5` rather than `12.5`).
3. **Escaping Rule**: Textual fields containing semicolons (`;`), quotation marks (`"`), or newline characters (`\n` / `\r`) MUST be wrapped in double quotes and inner quotes MUST be doubled (`""`).
4. **Empty State Invariant**: When no tasks exist in the evaluated window, metric calculations MUST yield zero (`0`) or explicit markers (`-`), never `NaN`, `null`, or `undefined`.
5. **Local-First Boundary**: Serialized data is strictly contained in client memory and converted to Blob URLs for direct browser download. No network payload may be dispatched.
