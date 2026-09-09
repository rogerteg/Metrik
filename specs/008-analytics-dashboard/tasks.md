# Implementation Tasks: Feature 008 (Analytics Dashboard)

## Phase 1: Data Transformation Hooks
- [ ] T001 Create `src/hooks/useAnalyticsData.ts` to transform completed tasks into daily throughput and scatter plot datasets.
- [ ] T002 Write unit tests for `useAnalyticsData.test.ts` to ensure date grouping and zero-filling logic is accurate.

## Phase 2: Chart Components (0-Dependency)
- [ ] T003 Create `src/components/charts/ThroughputChart.tsx` using CSS Flexbox for bars.
- [ ] T004 Create `src/components/charts/LeadTimeScatter.tsx` using inline SVG for plotting points.
- [ ] T005 Write CSS styles in `Analytics.css` to match the dark glassmorphism theme for the charts.

## Phase 3: Dashboard Assembly
- [ ] T006 Create `src/components/AnalyticsDashboard.tsx` to host the charts and layout the page.

## Phase 4: App Integration
- [ ] T007 Update `App.tsx` to include `view` state (`'board' | 'analytics'`).
- [ ] T008 Add a View Toggle group to the header in `App.tsx`.
- [ ] T009 Conditionally render the Board or the Dashboard.
- [ ] T010 Run `npm run build` and `npm test` to ensure 100% pass rate.
