# Quickstart & Manual Verification Guide: Task Details Modal UI/UX Redesign

**Feature Branch**: `036-task-details-modal-redesign`  
**Date**: 2026-09-22  
**Spec**: [spec.md](./spec.md)  

---

## 1. Setup & Environment Verification

1. **Verify Git Branch**:
   ```powershell
   git status
   # Ensure you are on branch 036-task-details-modal-redesign
   ```

2. **Start Development Server**:
   ```powershell
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 2. Interactive Verification Scenarios

### Scenario A: 2-Column Responsive Layout & Metadata Sidebar Verification
1. Open the Kanban board and click on any existing task card.
2. **Observe Layout**:
   - Confirm the modal opens in a 2-column layout on desktop viewports.
   - Main Column (Left, ~65%-70%): Contains Task Title, Description, Subtasks, Activity Feed.
   - Sidebar Column (Right, ~30%-35%): Contains metadata pills (Priority, Assignee, Squad, Tags, Dates, Impediments).
3. **Verify SVG Icon Sizing**:
   - Inspect SVG icons in metadata pills and activity items.
   - Confirm all icons are constrained (`<=18px`) and do not stretch or distort text wrapping.
4. **Test Responsive Mobile View**:
   - Resize browser window to mobile width (`<768px`) or use Device Mode (`Cmd+Option+I` / `Ctrl+Shift+I`).
   - Confirm layout seamlessly transitions to 1-column vertical stack without horizontal scrollbars.

---

### Scenario B: Activity Feed Cards & Markdown Rich Formatting
1. Navigate to the Activity section of the modal.
2. **Add a Comment with Rich Markdown**:
   - Type text including bold (`**test**`), inline code (`` `code snippet` ``), list items, and quote blocks (`> Decision quote`).
   - Press `Ctrl+Enter` or click "Enviar Comentário".
3. **Inspect Visual Rendering**:
   - Confirm user comment card is rendered with `bg-slate-900/80` background, clean avatar, and `leading-relaxed` typography.
   - Confirm inline code is highlighted with `bg-slate-950 text-cyan-300`.
   - Confirm quote blocks render amber accent border (`border-l-2 border-amber-500`).
4. **Move Task Status / Priority**:
   - Change task status or priority.
   - Confirm system audit logs render in discrete compact rows (`bg-slate-950/60`) with diff pills `[De ➔ Para]`.

---

### Scenario C: Global User Preference Persistence
1. Toggle density mode to **Compact**.
2. Select filter tab **"Decisões"**.
3. Close the task modal.
4. Open a *different* task modal or refresh the browser page (`F5`).
5. **Confirm State Persistence**:
   - Verify the modal reopens with **Compact** density mode active and **"Decisões"** filter selected.
   - Open browser Developer Tools (`Application` -> `Local Storage`) and inspect `metrik-timeline-prefs`.

---

### Scenario D: Dirty State Draft Protection
1. Open a task modal and type text into the comment input field without submitting.
2. Click the Close button (`X`) or backdrop.
3. **Confirm Dirty Guard**:
   - Verify confirmation modal appears warning of unsubmitted draft.
   - Click "Continuar Editando" -> Confirm text remains intact.
   - Click "Descartar" -> Confirm modal closes cleanly.

---

## 3. Automated Test Verification

Run all test suites and build checks to guarantee zero regressions:

```powershell
npm test -- --run
npm run build
```
