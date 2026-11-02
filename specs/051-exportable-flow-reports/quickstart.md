# Quickstart Validation Guide: Relatórios Exportáveis em PDF/Excel

**Feature**: `051-exportable-flow-reports`  
**Date**: 2026-10-28  
**Status**: Verified  

---

## Prerequisites

1. Node.js environment configured with dependencies installed (`npm install`).
2. Active board populated with sample cards across columns (Backlog, In Progress, Review, Done).
3. Modern web browser (Chrome, Edge, Firefox, Safari) with pop-up/print dialog capabilities.

---

## Automated Verification Scenarios

Run the targeted verification suites:

```bash
# 1. Run unit and integration tests for report generation and spreadsheet serialization
npm run test tests/unit/flowReports.test.tsx

# 2. Run TypeScript type checks
npx tsc --noEmit

# 3. Verify clean production build
npm run build
```

**Expected Outcome**: All tests pass clean (exit code 0), zero TypeScript errors, build succeeds without warnings.

---

## Manual End-to-End Walkthroughs

### Scenario 1: Exporting Executive PDF Report from Analytics

1. Start the local development server:
   ```bash
   npm run dev
   ```
2. Open the application in your browser (`http://localhost:5173`).
3. Navigate to the **Analytics** view.
4. Click on the new **Exportar Relatório** action button in `AnalyticsNavHeader` (top right, next to the "Dados" button).
5. In the `ExportReportModal`:
   - Select **Relatório Executivo (PDF)**.
   - Verify that the active dataset window and card counts match the current dashboard.
   - Toggle "Incluir diagnósticos da Mika AI".
   - Click **Gerar Relatório**.
6. **Expected Outcome**:
   - The print-optimized executive view (`ExecutiveReportPrintView`) opens and triggers the browser's native print dialog (`window.print()`).
   - The layout conforms to A4 with clean institutional header, KPI summary tiles (Throughput, Lead Time, Cycle Time P85, Blocker rate), and Mika diagnostic cards.
   - All navigation bars, tabs, and web action buttons are omitted (`@media print`).

### Scenario 2: Exporting Tabular Spreadsheet (CSV pt-BR) for Excel

1. In either the **Quadro** or **Analytics** view, open the **Exportar Relatório** modal.
2. Select **Planilha de Tarefas e Métricas (Excel / CSV)**.
3. Confirm options:
   - "Incluir subtarefas como linhas individuais" checked/unchecked.
   - "Incluir histórico de bloqueios".
4. Click **Baixar Planilha**.
5. **Expected Outcome**:
   - A `.csv` file download begins immediately (e.g. `metrik-relatorio-fluxo-[board]-[data].csv`).
   - Open the file in **Microsoft Excel**:
     - All columns (ID, Título, Coluna, Lead Time, Cycle Time, etc.) are separated into distinct columns automatically (semicolon delimiter `;`).
     - Portuguese characters with accents (e.g. `Concluído`, `Média`, `Atenção`) display cleanly without garbled characters (BOM `\uFEFF`).
     - Numeric values (e.g. `4,2` days) are formatted with comma decimal for pt-BR calculation.

### Scenario 3: Scope & Dataset Filtering Respect

1. In Analytics, open the **Dados** drawer and filter by a specific sprint or last 14 days.
2. Open **Exportar Relatório**.
3. Verify that the modal explicitly indicates the active filter.
4. Export the spreadsheet and PDF.
5. **Expected Outcome**: The exported records match only the filtered subset, and the summary header displays the active filter criteria.
