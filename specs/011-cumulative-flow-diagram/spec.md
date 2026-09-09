# Feature 011: Cumulative Flow Diagram (CFD)

## 1. Context & Rationale
Metrik currently provides an Analytics Dashboard with a daily Throughput histogram and a Lead Time Scatter Plot. While these give insight into delivery pace and variability, agile and Kanban practitioners rely on the **Cumulative Flow Diagram (CFD)** to assess overall system stability, identify WIP accumulation bottlenecks, and track work progression over time.

This feature introduces a native, interactive Cumulative Flow Diagram to the Analytics view, mapping the cumulative distribution of tasks across workflow categories (`todo`, `in_progress`, `done`) across a historical timeline (e.g., the last 14 days).

## 2. Business Value
- **Bottleneck Detection:** Teams can immediately visualize widening bands, signaling that tasks are piling up in a particular workflow state.
- **Flow Predictability:** Parallel bands indicate consistent arrival and departure rates, demonstrating a predictable and stable delivery cadence.
- **WIP & Lead Time Trends:** The vertical distance represents Total WIP at any given date, while horizontal distance approximates Lead Time trend.

## 3. Scope & Requirements

### 3.1. In Scope
- **Data Transformation (`useAnalyticsData` / `useCfdData`):**
  - Compute cumulative task counts for each date in a 14-day window.
  - Track progression across semantic categories:
    - **Total Created (Cumulative)**: All tasks created on or before date $D$.
    - **In Progress & Done (Cumulative)**: Tasks started on or before date $D$.
    - **Done (Cumulative)**: Tasks completed on or before date $D$.
  - Provide stacked layer values for SVG rendering.
- **Presentation Component (`CumulativeFlowChart.tsx`):**
  - Render an interactive SVG stacked area / step chart with smooth gradients or distinct accessible fills matching the Metrik theme.
  - Interactive hover state or tooltip displaying date and task counts per status.
  - Color-coded legend identifying each workflow band:
    - Concluído (`done`) — Tom esmeralda/verde
    - Em Progresso (`in_progress`) — Tom âmbar/amarelo
    - A Fazer (`todo`) — Tom azul/índigo
- **Integration (`AnalyticsDashboard.tsx`):**
  - Add the CFD chart to the `AnalyticsDashboard` layout alongside Throughput and Lead Time scatter plot.
- **Testing:**
  - Unit tests for the CFD data calculation algorithm (grouping, zero-filling, monotonic non-decreasing accumulation).
  - Component tests verifying chart rendering, legend, and accessibility attributes.

### 3.2. Out of Scope
- Configurable custom date ranges (fixed 14-day window to remain consistent with existing charts).
- Export of CFD image as PNG/PDF (can be considered in future reporting features).
- 3rd-party charting libraries (must remain 0 external dependencies, pure SVG & React).

## 4. User Stories
- **US1:** As a Kanban practitioner, I want to view a Cumulative Flow Diagram so that I can diagnose whether work is accumulating in my system.
- **US2:** As a team member, I want to hover or inspect points on the CFD so I can see the exact breakdown of tasks by stage on any given day.
- **US3:** As an agile coach, I want the diagram to update automatically whenever I switch boards or modify task states.

## 5. Acceptance Criteria
1. **Accurate Cumulative Math:**
   - The 'Done' line/area must be monotonically non-decreasing over time.
   - The total line ('Todo' + 'In Progress' + 'Done') must reflect total items created up to that date.
2. **Accessible & Responsive Rendering:**
   - SVG scales responsively across screen widths with clear axes and date labels.
   - Distinct, contrast-compliant colors for each workflow layer with a clear legend.
3. **Zero Dependencies:**
   - Must use pure React and native SVG elements without any chart libraries.
4. **Performance & Reliability:**
   - Fast rendering with memoized calculations, passing all automated unit and regression tests.
