# Quickstart & Verification Guide: Task Details Activity & Objective Fields Redesign

## Overview

This guide provides step-by-step procedures to verify end-to-end functionality of the redesigned Task Details Modal Activity Panel and Objective Fields layout.

---

## Prerequisites

- Node.js installed
- Metrik development dependencies installed (`npm install`)
- Dev server running (`npm run dev`)

---

## Automated Verification Steps

Run the dedicated Vitest suite to verify all unit, rendering, and interaction specs:

```bash
npm test -- tests/unit/TaskActivityPanel.test.tsx tests/unit/TaskActivityLogList.test.tsx tests/unit/TaskDetailsModalRedesign.test.tsx --run
```

Run full project test suite and TypeScript production build check:

```bash
npm test -- --run
npm run build
```

---

## Manual Verification Flow

1. **Launch App**: Open `http://localhost:5173` in a browser.
2. **Open Task Detail Modal**: Click on any card on the Kanban Board.
3. **Verify Objective Metadata Layout**:
   - Confirm primary fields (Status badge, Assignee selector, Priority indicator, Tags list, Due date, Flow metrics) are cleanly presented on the left panel.
4. **Inspect Activity Panel Header**:
   - Verify header shows title `"Activity"`.
   - Click the search icon (`Search`) and verify inline search input appears.
   - Verify notification bell (`Bell`) counter displays active unread count (e.g. `3`).
   - Click filter icon (`Filter`) and select `"Mutations"` or `"Comments"` to filter the activity list.
5. **Inspect Bulleted Activity Stream**:
   - Verify each log item displays a bullet point, actor name, Portuguese action text, diff details, and right-aligned timestamp (e.g. `jun 26 às 10:26 am`).
   - Verify no text overlaps with the right-aligned timestamp.
6. **Verify Collapsible Grouping (`> Mostrar mais`)**:
   - For a task with more than 5 activity logs, confirm only the 5 most recent entries display initially.
   - Click `> Mostrar mais` and verify remaining historical log items expand smoothly.
7. **Verify Comment Card Input**:
   - Locate bottom comment box displaying placeholder `"Escreva um comentário..."`.
   - Enter a comment and submit via `Ctrl+Enter` or click "Enviar".
   - Confirm new comment appears instantly at the top of the activity feed.
