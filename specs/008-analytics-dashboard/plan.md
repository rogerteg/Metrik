# Technical Implementation Plan: Feature 008 (Analytics Dashboard)

## 1. Architectural Approach
We will introduce a new view state in `App.tsx` (e.g. `currentView: 'board' | 'analytics'`). When `analytics` is active, we render the `AnalyticsDashboard` component instead of the `Board`. The existing `MetricsBar` can be repurposed or a new `DashboardMetrics` component can be created for layout purposes. 

We will build two 0-dependency chart components:
1. `ThroughputChart.tsx`: A CSS flex-based bar chart.
2. `LeadTimeScatter.tsx`: A simple inline SVG-based scatter plot.

## 2. Component Modifications

### 2.1 `src/App.tsx` (MODIFY)
- Add state `const [view, setView] = useState<'board' | 'analytics'>('board');`
- Add a View Toggle button group in the header.
- Conditionally render `<Board>` or `<AnalyticsDashboard>`.

### 2.2 `src/components/AnalyticsDashboard.tsx` (NEW)
- The main container for the analytics view.
- Responsible for transforming `completedTasks` into data arrays suitable for the charts (grouping by date, calculating max values).
- Renders the charts in a responsive grid.

### 2.3 `src/components/charts/ThroughputChart.tsx` (NEW)
- Input: Array of `{ date: string, count: number }` for the last 14 days.
- Renders a flex container with `align-items: flex-end`.
- Each bar's height is `(count / maxCount) * 100%`.
- Tooltips natively via `title` attribute.

### 2.4 `src/components/charts/LeadTimeScatter.tsx` (NEW)
- Input: Array of `TaskModel` that have `completedAt`.
- Uses `<svg viewBox="0 0 100 100" preserveAspectRatio="none">`.
- Maps the completion date to X (0-100%) and Lead Time to Y (100-0% to invert Y axis).
- Points are rendered as `<circle>` elements.

## 3. Data Transformation Hooks (`useAnalyticsData.ts` NEW)
- Extracts logic to format the last 14 days.
- Groups tasks by day of completion.
- Returns clean arrays for the charts.

## 4. Testing Strategy (`tests/unit/useAnalyticsData.test.ts`)
- Unit test the data transformation hook to ensure it correctly fills in empty days (days with 0 throughput).
- Verify calculation of max values.
