# Implementation Plan: Relatórios Exportáveis em PDF/Excel (Métricas de Fluxo e Inventário)

**Branch**: `051-exportable-flow-reports` | **Date**: 2026-10-28 | **Spec**: [spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/051-exportable-flow-reports/spec.md)

**Input**: Feature specification from `specs/051-exportable-flow-reports/spec.md`

---

## Summary

This feature provides seamless executive and analytical data export for Metrik:
1. **Executive Flow Report in PDF**: A clean, C-level formatted document generated client-side via CSS `@media print` and triggered via native `window.print()`. Includes institutional header, executive KPI summary cards (Throughput, Lead Time, Cycle Time P85 SLE, Blocker rate), Mika AI Flow Copilot diagnostic insights, and clean page-break rules without web chrome.
2. **Tabular Inventory & Metrics in Spreadsheet (pt-BR Excel / CSV)**: Full tabular projection of tasks with computed flow times (Lead Time, Cycle Time, Blocker duration, sprint, story points, tags) formatted with UTF-8 BOM (`\uFEFF`), semicolon (`;`) delimiter, and comma decimal separator for instant, wizard-free opening in Microsoft Excel pt-BR and corporate BI tools.
3. **Unified Scope Configuration UI**: An `ExportReportModal` accessible from `AnalyticsNavHeader` and `AppHeader` allowing users to configure scope (format, dataset filter window, inclusion of Mika AI and blockers).

All operations operate 100% Local-First with zero external network dependencies, conforming strictly to Constitution Principles V, VII, and VIII.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 / Node.js 18+  
**Primary Dependencies**: React 18, Vite, Vitest (zero new external runtime dependencies added)  
**Storage**: Client-side `localStorage` (Local-First)  
**Testing**: Vitest (`npm run test`), TypeScript strict checking (`npx tsc --noEmit`), Vite production build (`npm run build`)  
**Target Platform**: Evergreen web browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Single-page web application (Kanban & Flow Analytics)  
**Performance Goals**: < 1.5 seconds generation and download response for boards with up to 500 tasks (SC-001)  
**Constraints**: 
- 100% Local-First sovereignty (zero telemetry, zero third-party PDF/CSV server calls - Principle VIII)
- Zero brand leaks (Principle VII)
- Zero heavy third-party export libraries (no `jspdf`, `exceljs`, `sheetjs` - Principle V / YAGNI)
- Microsoft Excel pt-BR compatibility (UTF-8 BOM `\uFEFF`, `;` delimiter, `,` decimal - SC-002)
- Read-only execution with zero mutations to board or task state (FR-008)  
**Scale/Scope**: Boards with up to 500 tasks, multi-column workflows, subtasks, and Mika AI diagnostic integrations.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|---|---|---|
| **I. Spec-Driven Development** | Follows formal SDD cycle (`spec.md` → `research.md` → `data-model.md` → `contracts/` → `quickstart.md` → `plan.md` → `tasks.md`). | **PASS** |
| **II. Code Quality & Modularity** | Clean separation of pure business logic (`flowReportExporter.ts`), visual presentation (`ExecutiveReportPrintView.tsx`, `ExportReportModal.tsx`), and entry point integrations. | **PASS** |
| **III. Automated Verification** | Comprehensive unit test suite in `tests/unit/flowReports.test.ts` covering CSV formatting, escaping, percentiles, snapshot compilation, and empty states. | **PASS** |
| **IV. Observability** | Structured logging with `[Metrik Report]` prefix for export operations and edge-case warnings. | **PASS** |
| **V. Simplicity & YAGNI** | Native browser print engine (`@media print` / `window.print()`) and standard RFC 4180 CSV serialization without heavy external libraries. | **PASS** |
| **VI. Analytical Reasoning Pre-Tasks** | Mandatory 6 Analytical Reasoning Models will precede all tasks in `tasks.md`. | **PASS** |
| **VII. Brand Independence** | Strictly Metrik proprietary and standard lean/agile terms; zero competitor brand leaks. | **PASS** |
| **VIII. Local-First Sovereignty** | 100% offline generation in client memory with Blob URLs; zero external API calls. | **PASS** |
| **IX. User Data Integrity** | Purely read-only export operations; zero task or board mutations. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/051-exportable-flow-reports/
├── spec.md              # Feature specification with clarifications
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical decisions and trade-offs
├── data-model.md        # Entities, sub-types, and validation invariants
├── contracts/           # Interface contracts and type signatures
│   └── export-contracts.ts
├── quickstart.md        # Automated tests and manual validation guide
├── checklists/
│   └── requirements.md  # Quality gate checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── reports.ts                  # Domain types for FlowReportSnapshot, TaskExportRow, ExportOptions
├── utils/
│   └── flowReportExporter.ts       # Pure functions for snapshot generation, CSV serialization, RFC-4180 escaping
├── components/
│   ├── ExportReportModal.tsx       # Modal for format selection, scope review, and export triggering
│   ├── ExportReportModal.css       # Styles for export configuration modal
│   ├── ExecutiveReportPrintView.tsx# Dedicated print-optimized executive view (@media print)
│   ├── ExecutiveReportPrintView.css# A4 print stylesheets and layout tokens
│   ├── AnalyticsNavHeader.tsx      # Entry point action button in Analytics navigation
│   └── AppHeader.tsx               # Entry point action in board management cluster
tests/
└── unit/
    └── flowReports.test.ts         # Vitest unit tests for snapshot calculation and CSV serialization
```

**Structure Decision**: Keep serialization logic in pure TypeScript functions under `src/utils/` to enable 100% test isolation in Vitest without DOM dependencies, while keeping UI components modular and lazy-friendly in `src/components/`.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | No constitutional violations. Fully compliant with Principles I-IX. | N/A |
