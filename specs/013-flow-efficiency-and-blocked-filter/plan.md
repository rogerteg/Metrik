# Technical Implementation Plan: Feature 013 (Flow Efficiency & Blocked Filter)

## 1. Overview
This feature introduces Flow Efficiency calculations into the flow metrics pipeline, adds a Blocked count metric to the header, and empowers users to instantly filter the board to only blocked tasks via a new filter control.

## 2. Architecture & Data Flow

### 2.1. Flow Efficiency Calculation
In Kanban methodology:
$$\text{Flow Efficiency} = \frac{\sum \text{Active Time}}{\sum \text{Cycle Time}} \times 100\%$$
Where:
- For each completed task $i$:
  - $\text{Cycle Time}_i = \text{calculateCycleTimeMs}(t_i)$
  - $\text{Blocked Time}_i = t_i.\text{totalBlockedMs} \mathbin{\Vert} 0$
  - $\text{Active Time}_i = \max(0, \text{Cycle Time}_i - \text{Blocked Time}_i)$
- Total Active Time = $\sum \text{Active Time}_i$
- Total Cycle Time = $\sum \text{Cycle Time}_i$
- If Total Cycle Time $> 0$:
  - $\text{Flow Efficiency} = \text{Math.round}((\text{Total Active Time} / \text{Total Cycle Time}) \times 100)$
  - Formatted: `${flowEfficiency}%`
- If Total Cycle Time $== 0$ or no completed tasks:
  - $\text{Flow Efficiency} = \text{null}$
  - Formatted: `"-"`

### 2.2. Blocked Task Filtering
In `src/types/filter.ts`:
- `FilterState` extended with `onlyBlocked: boolean`.
- `UseBoardFiltersReturn` extended with `toggleOnlyBlocked: () => void`.

In `src/hooks/useBoardFilters.ts`:
- If `filters.onlyBlocked` is true, task is discarded if `!task.blocked`.

### 2.3. Components Update
- **`MetricsBar.tsx`**:
  - Displays `Bloqueios Ativos` (highlighted in red when $> 0$).
  - Displays `Eficiência de Fluxo` (percentage string).
- **`FilterBar.tsx`**:
  - Adds filter pill `⛔ Bloqueados` with active count badge.
- **`src/App.tsx`**:
  - Passes updated parameters to `useFlowMetrics` and `FilterBar`.

## 3. Step-by-Step Implementation

### Phase 1: Type Definitions & Calculation Hooks
1. Update `FlowMetricsSummary` in `src/types/kanban.ts`.
2. Update `FilterState` and `UseBoardFiltersReturn` in `src/types/filter.ts`.
3. Update `src/hooks/useFlowMetrics.ts` to compute `flowEfficiency` and `blockedCount`.
4. Update `src/hooks/useBoardFilters.ts` to handle `onlyBlocked`.

### Phase 2: Unit Testing Core Logic
5. Add unit tests for `useFlowMetrics.ts` verifying flow efficiency calculation with various blocked durations.
6. Update unit tests in `tests/unit/useBoardFilters.test.ts` to verify `onlyBlocked` toggling and filtering.

### Phase 3: Presentation Components & Styling
7. Update `src/components/MetricsBar.tsx` to display active blocks and flow efficiency.
8. Update `src/components/FilterBar.tsx` with the `⛔ Bloqueados` filter button.
9. Add styling in `src/App.css` for blocked filter button and metrics badges.

### Phase 4: Integration & Regression Verification
10. Update component tests in `tests/unit/MetricsBar.test.tsx` and `tests/unit/FilterBar.test.tsx`.
11. Run `npm test` and `npm run build` to verify 100% pass rate.
