# Technical Implementation Plan: Feature 011 (Cumulative Flow Diagram)

## 1. Overview
This plan details the implementation of the Cumulative Flow Diagram (CFD) for Metrik. The CFD maps the cumulative progression of tasks through three standard workflow boundaries (`Done`, `Started / In Progress`, and `Created / Total`) across a rolling 14-day timeline.

## 2. Architecture & Data Flow

### 2.1. Mathematical Formulation of CFD
In Kanban theory, a true CFD consists of cumulative transition curves that are monotonically non-decreasing over time:
- **`cumulativeDone(d)`**: Count of tasks with `completedAt <= d`.
- **`cumulativeStarted(d)`**: Count of tasks with `startedAt <= d` OR `completedAt <= d`.
- **`cumulativeCreated(d)`**: Count of tasks with `createdAt <= d`.

From these three cumulative curves, the active state volumes on any date $d$ are derived naturally:
- **Done Count**: $C_{done}(d) = \text{cumulativeDone}(d)$
- **In Progress Count (WIP)**: $C_{in\_progress}(d) = \text{cumulativeStarted}(d) - \text{cumulativeDone}(d)$
- **To Do Count (Backlog)**: $C_{todo}(d) = \text{cumulativeCreated}(d) - \text{cumulativeStarted}(d)$
- **Total System Volume**: $\text{cumulativeCreated}(d)$

### 2.2. Components & Files
- **`src/types/analytics.ts`**: Types for CFD data structures (`CfdDataPoint`, `CfdData`).
- **`src/hooks/useCfdData.ts`**: Hook that calculates daily cumulative values from `TaskModel[]`.
- **`src/components/charts/CumulativeFlowChart.tsx`**: SVG-based stacked area chart with legend, grid lines, and interactive date inspection.
- **`src/components/AnalyticsDashboard.tsx`**: Add `CumulativeFlowChart` into the grid layout.
- **`src/components/Analytics.css`**: Styling for chart containers, tooltip overlays, and legends.

## 3. Step-by-Step Implementation

### Phase 1: Data Model & Calculation Logic
1. Define `CfdDataPoint` and `CfdSummary` interfaces.
2. Implement `useCfdData` with rolling 14-day window generation and deterministic cumulative counts.
3. Write comprehensive unit tests in `tests/unit/useCfdData.test.ts` verifying edge cases:
   - Monotonicity (values never decrease).
   - Empty task lists.
   - Tasks completed on the same day as creation.
   - Tasks started without completion.

### Phase 2: Native SVG Chart Component
4. Create `src/components/charts/CumulativeFlowChart.tsx`:
   - Compute SVG polygons for each stacked area using standard coordinates.
   - Implement axis labels, gridlines, and date markers.
   - Add hover interaction to display exact breakdown per date.
   - Include clear visual legend matching the glassmorphic dark theme.

### Phase 3: Dashboard Integration & UI Polish
5. Integrate `CumulativeFlowChart` into `AnalyticsDashboard.tsx`.
6. Update `Analytics.css` for clean responsive layout and glassmorphism styling.
7. Write component tests in `tests/unit/CumulativeFlowChart.test.tsx`.
8. Validate whole test suite (`npm test`) and production build (`npm run build`).
