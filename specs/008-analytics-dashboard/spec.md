# Feature 008: Analytics Dashboard

## 1. Context & Rationale
Metrik currently calculates high-level Flow Metrics (Lead Time, Cycle Time, Throughput) and displays them in a summary bar. However, Agile teams need visual trends to diagnose bottlenecks (e.g., "Is our lead time increasing?" or "How steady is our delivery pace?"). Feature 008 introduces a dedicated Analytics Dashboard to visualize these metrics without introducing heavy third-party chart libraries, staying true to the 0-dependency native architecture.

## 2. Business Value
- **Process Visibility:** Visually identify trends in delivery speed and volume over time.
- **Diagnostic Tooling:** Spot outliers in Lead Time to understand which tasks got stuck.
- **Performance:** Native CSS/SVG charts ensure the application remains blazing fast and lightweight.

## 3. Scope & Requirements

### 3.1. In Scope
- **View Toggle:** A toggle switch or tab in the header to switch between "Board View" and "Analytics View".
- **Throughput Chart:** A bar chart showing the number of tasks completed per day over the last 14 days. Built with CSS Flexbox/Grid or simple SVG.
- **Lead Time Scatter Plot:** A scatter plot showing individual completed tasks over the last 14 days, plotted by completion date (X-axis) and Lead Time in days (Y-axis). Built with simple SVG.
- **Metrics Summary Panel:** Re-use the existing `MetricsBar` calculations to show a summary panel inside the analytics view.
- **0-Dependency Charts:** Custom-built React components for the charts.

### 3.2. Out of Scope
- Integration of heavy charting libraries (e.g., Chart.js, Recharts, D3).
- Cumulative Flow Diagram (CFD) — requires historical daily snapshots of column states, which we don't currently track.
- Filtering the charts by tags or priorities (MVP will just show all completed tasks).

## 4. User Stories
- **US1 (Toggle View):** As a user, I want to switch between the Kanban Board and an Analytics Dashboard so I can focus on data when needed.
- **US2 (Throughput Trend):** As a user, I want to see a bar chart of tasks completed per day so I can gauge our team's velocity.
- **US3 (Lead Time Scatter):** As a user, I want to see a scatter plot of Lead Times for recently completed tasks to spot outliers and trends.

## 5. Technical Constraints
- No external chart dependencies.
- Charts must support dark mode and the glassmorphism aesthetic natively via CSS variables.

## 6. Analytical Reasoning (Pre-Task Creation)

### 6.1. First-Principles Thinking
- Charts are just visual representations of data mapped to coordinates.
- A bar chart is just a series of `div` elements with a height percentage relative to the maximum value.
- A scatter plot is an SVG with `<circle>` elements positioned by percentages along X and Y axes.

### 6.2. Premortem Analysis (Failure Modes)
- *Risk:* Building charts from scratch is error-prone regarding responsiveness and axes labels.
  - *Mitigation:* Keep the axes simple. Only label the min/max values or key intervals. Use CSS `flex` for the bar chart to automatically distribute bars evenly regardless of screen width.
- *Risk:* No completed tasks available to chart.
  - *Mitigation:* Implement empty states ("Não há dados suficientes") for the charts.

### 6.3. MECE Task Validation
- State (View Toggle) -> Chart Components (Bar, Scatter) -> Data Transformation Hooks -> UI Integration.
