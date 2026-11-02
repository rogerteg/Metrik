# Research & Technical Decisions: Relatórios Exportáveis em PDF/Excel

**Feature**: `051-exportable-flow-reports`  
**Date**: 2026-10-28  
**Author**: SpecKit Planning Workflow  
**Status**: Resolved  

---

## 1. Executive PDF Report Generation

### Context & Challenge
The Metrik product requires an executive-level flow report in PDF format for Delivery Managers, Agile Coaches, and technical leadership to present to executives, clients, and stakeholders during governance reviews and flow audits. The report must contain institutional headers, consolidated flow KPIs (Throughput, Lead Time, Cycle Time P85 SLE, Blocker rate), Mika AI diagnoses, and clean page breaks without web navigation controls.

### Decision
Implement a dedicated print-optimized view rendered client-side using CSS `@media print` rules, triggered natively via `window.print()`.

### Rationale
- **Constitution V (Simplicity & YAGNI)**: Eliminates heavyweight client-side PDF generation libraries (such as `jspdf`, `pdfmake`, `html2canvas`) which add 300KB-1MB+ to bundle size, introduce font rendering artifacts, and struggle with multi-page flow.
- **Constitution VIII (Local-First Sovereignty)**: Zero bytes leave the client. No cloud or external rendering services (like headless Chrome microservices) are called, preserving complete privacy and offline usability.
- **Browser Native Quality**: Modern browsers (Chromium, Gecko, WebKit) have world-class PDF print engines supporting vector typography, CSS page margins (`@page { size: A4 landscape; margin: 12mm; }`), clean break controls (`break-inside: avoid; page-break-after: auto;`), and color fidelity (`print-color-adjust: exact; -webkit-print-color-adjust: exact;`).

### Alternatives Considered & Rejected
- **`jspdf` + `html2canvas`**: Creates blurry raster snapshots, fails on high-DPI scaling, bloats bundle size, breaks accessible text selection in resulting PDFs.
- **`@react-pdf/renderer`**: Requires a completely separate JSX primitive tree (`<Document>`, `<Page>`, `<View>`, `<Text>`), cannot reuse existing web CSS tokens, and adds substantial bundle overhead.
- **Server-Side Puppeteer/Playwright PDF Service**: Violates Local-First architecture (Principle VIII), requires backend infrastructure, fails when offline.

---

## 2. Tabular Spreadsheet Export (Excel & BI Tools)

### Context & Challenge
Scrum Masters, Data Analysts, and Process Engineers need to export complete task records with computed flow metrics (Lead Time in days, Cycle Time in days, blocked duration in hours, sprint, story points, tags) for custom analysis in Microsoft Excel, PowerBI, and Google Sheets. The export must open seamlessly in Microsoft Excel configured for pt-BR without broken accents or requiring manual text-import wizards.

### Decision
Generate client-side CSV files with:
1. **UTF-8 Byte Order Mark (`\uFEFF`)** at the start of the payload.
2. **Semicolon (`;`) delimiter** instead of comma (`,`).
3. **Comma (`,`) as decimal separator** for floating-point metrics (e.g. `3,5` days).
4. **RFC 4180 field quoting** for values containing semicolons, quotes, or line breaks (`"exemplo; texto"` and `""escaped""`).
5. **Standardized date-time formatting** (`YYYY-MM-DD HH:mm` or `DD/MM/YYYY HH:mm`).
6. **File download via native Blob URL**: `URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }))`.

### Rationale
- In Portuguese (pt-BR) regional settings, Microsoft Excel interprets comma (`,`) as a decimal separator and semicolon (`;`) as the standard list/column delimiter. A standard comma-separated CSV opens into a single column in Excel pt-BR unless the user manually runs the import wizard.
- The UTF-8 BOM (`\uFEFF`) instructs Microsoft Excel immediately to interpret the byte stream as UTF-8, rendering characters like `ç`, `ã`, `é`, `ó` perfectly without mojibake (`Ã§`, etc.).
- Lightweight (< 5KB of pure TypeScript logic), zero dependencies, instantaneous processing (< 50ms for 500 tasks).

### Alternatives Considered & Rejected
- **Binary `.xlsx` generation using `xlsx` (SheetJS) or `exceljs`**: SheetJS has licensing complexities and substantial bundle footprint (> 600KB); `exceljs` is even heavier. Tabular export is primarily needed for data crunching where RFC-compliant CSV is universal and instant.
- **Standard Comma-Separated CSV (`,`) without BOM**: Fails to open correctly in Microsoft Excel on Portuguese Windows systems, opening all data squashed into Column A with broken accentuation.

---

## 3. Coherence with Filter & Dataset Sampling Engine

### Context & Challenge
Metrik features a robust dataset filtering system (`DatasetFilterConfig` / `DatasetConfigurationDrawer`) allowing users to filter by date windows (last 7, 14, 30, 90 days or custom range), card types, priorities, categories, and sprints. The export system must adhere strictly to these filters (FR-007) so that what the user inspects in Analytics matches what is exported.

### Decision
Export services will accept the current board data, active `DatasetFilterConfig`, and `mikaInsights` as inputs. The export pipeline will apply `filterTasksByDatasetConfig` (or receive already filtered tasks from `useDatasetTasks`), compute metrics consistently with `useFlowMetrics` and `calculateCycleTimePercentiles`, and serialize the exact subset.

### Rationale
- **Single Source of Truth**: Reuses existing business logic from `src/utils/` and `src/hooks/`, preventing formula divergence.
- **Auditability**: The exported report headers explicitly state the filter criteria and date window evaluated, ensuring governance traceability.

---

## 4. UI Entry Points & Scope Configuration

### Context & Challenge
Users need easy access to reporting from both the Analytics panel and the board management controls (FR-001), with the ability to choose between PDF and Spreadsheet formats and customize sections (FR-001, FR-003, FR-004, FR-007).

### Decision
1. Add an "Exportar Relatório" trigger in `AnalyticsNavHeader` alongside the "Dados" button.
2. Add an "Exportar Relatório" action in `AppHeader` (under board operations or as dedicated reporting button).
3. Implement `ExportReportModal`:
   - Format toggle: **Relatório Executivo (PDF)** vs. **Planilha de Tarefas e Métricas (CSV/Excel)**.
   - Scope summary: Displays the board name, squad, active dataset filter window, and task count.
   - Option toggles:
     - Include Mika AI Copilot diagnosis (PDF only).
     - Include Blocker details & root-cause dynamics.
     - Include Subtasks breakdown in tabular export.
4. When PDF is triggered: Metrik temporarily renders or targets the `ExecutiveReportPrintView` component, invokes `window.print()`, and returns seamlessly.
5. When Planilha is triggered: Metrik builds the CSV string, triggers the browser download, and displays a success toast.
