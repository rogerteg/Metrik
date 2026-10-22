# Implementation Tasks: Feature 008 (Analytics Dashboard)

> ⚠️ **Spec histórica — capacidade entregue.** `AnalyticsDashboard`, `useAnalyticsData` e os gráficos em `src/components/charts/` existem e evoluíram (features 017–021, 030). Este `tasks.md` é registro histórico; **não implementar**. _(Reconciliado em 2026-09-28.)_

## Phase 1: Data Transformation Hooks
- [x] T001 Create `src/hooks/useAnalyticsData.ts` to transform completed tasks into daily throughput and scatter plot datasets.
- [x] T002 Write unit tests for `useAnalyticsData.test.ts` to ensure date grouping and zero-filling logic is accurate.

## Phase 2: Chart Components (0-Dependency)
- [x] T003 Create `src/components/charts/ThroughputChart.tsx` using CSS Flexbox for bars.
- [x] T004 Create `src/components/charts/LeadTimeScatter.tsx` using inline SVG for plotting points.
- [x] T005 Write CSS styles in `Analytics.css` to match the dark glassmorphism theme for the charts.

## Phase 3: Dashboard Assembly
- [x] T006 Create `src/components/AnalyticsDashboard.tsx` to host the charts and layout the page.

## Phase 4: App Integration
- [x] T007 Update `App.tsx` to include `view` state (`'board' | 'analytics'`).
- [x] T008 Add a View Toggle group to the header in `App.tsx`.
- [x] T009 Conditionally render the Board or the Dashboard.
- [x] T010 Run `npm run build` and `npm test` to ensure 100% pass rate.
