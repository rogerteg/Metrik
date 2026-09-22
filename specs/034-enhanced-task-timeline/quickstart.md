# Runnable Verification & Quickstart Guide: Enterprise Task Timeline Redesign

**Feature Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

---

## Prerequisites & Environment Setup

1. **Environment**: Node.js 18+ (detectado v22.x/v20.x), `npm`.
2. **Dependencies**: React 18, Vite, Vitest.
3. **Workspace Root**: `c:\Users\Rogerio Teixeira\OneDrive\Documentos\Antigravity\Metrik`.

---

## Scenario 1: Verification of Automated Unit Tests

Run the dedicated test suite for Feature 034 enhanced timeline:

```bash
npm test -- tests/unit/TaskTimelineEnhanced.test.tsx --run
```

**Expected Result**: 100% of test cases pass cleanly, covering:
- Markdown formatting rendering (`simpleMarkdown.ts`).
- Diff card formatting (`[From ➔ To]`).
- Time bucket grouping ("Hoje", "Ontem", "Esta Semana", "Anteriores").
- "Decisões" filter tab filtering & count badge.
- Real-time text search filtering.
- Guest read-only enforcement.

---

## Scenario 2: Full Build Verification

Execute strict TypeScript compilation and production bundle build:

```bash
npm run build
```

**Expected Result**: Zero TypeScript errors (`tsc` passes clean), Vite bundle created successfully in `dist/`.

---

## Scenario 3: Manual Runnable Inspection (Kanban Board)

1. Launch Vite development server:
   ```bash
   npm run dev
   ```
2. Open browser at `http://localhost:5173`.
3. Click on any Kanban task card to open the **Task Details Modal**.
4. Scroll down to the **Histórico e Comentários da Tarefa** section:
   - Observe the summary stats header (comments, decisions, moves count).
   - Write a comment with Markdown formatting (e.g., `**Nota técnica** e - item 1`), check "Marcar como Decisão de Projeto" and press `Ctrl+Enter`.
   - Verify the golden highlight border and "Decisão de Projeto" badge.
   - Click on the **"Decisões"** filter tab and confirm that only decision items are displayed.
   - Type a keyword into the search bar and verify reactive instant filtering.
   - Move the task card between Kanban columns and observe the visual diff card (`[De ➔ Para]`) generated automatically.
