# Research & Architecture Decisions: Task Details Activity & Objective Fields Redesign

## Overview

This document records technical research, component modularity decisions, and design choices for implementing the redesigned Task Details Activity Panel and Objective Fields layout in Metrik.

---

## 1. Activity Header Controls & Interactive Toolbar

### Decision
Render a compact, high-density top header inside `TaskActivityHeader.tsx`:
- **Title**: `"Activity"` rendered in prominent, accessible font styling (`text-base font-semibold text-slate-200`).
- **Search Action Toggle**: Clicking the `Search` icon toggles an inline input field to filter activity log items by keyword in real-time.
- **Notification Counter Badge**: Clicking the `Bell` icon displaying an unread counter badge (e.g., `3`) filters activity logs to unread notifications/mentions.
- **Filter Menu Options**: Clicking `SlidersHorizontal` / `Filter` displays a dropdown menu allowing users to filter by specific event types: All Events, Comments Only, Field Mutations, Assignee Changes, Task Creation.

### Rationale
Consolidating activity controls into the header maximizes screen space and allows users to quickly isolate relevant history without switching tabs or opening separate modals.

---

## 2. Bulleted Activity Log Item Format & Timestamp Layout

### Decision
Design `TaskActivityLogItem.tsx` using a flexbox layout with right-aligned timestamp anchoring:
- **Bullet Indicator**: Standard bullet marker (`•` or styled dot) matching the inspiration layout.
- **Content Area**: `[Actor Name] [Action Verb / Field Diff]` rendered with `truncate min-w-0` so long user names wrap or truncate gracefully without pushing timestamps out of view.
  - Examples:
    - `Luis Eduardo Ferreira Santos criou esta tarefa`
    - `Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista`
    - `Maria Silva alterou o status para Em Progresso`
- **Right-Aligned Timestamp**: `ml-4 whitespace-nowrap text-xs text-slate-400 font-mono text-right` formatting dates as `jun 26 às 10:26 am` or `jul 16 às 2:36 pm`.

### Rationale
This layout strictly prevents visual overlap across all screen resolutions, guarantees text readability, and preserves exact alignment with the inspiration screenshot.

---

## 3. Collapsible Accordion Entry Grouping (`> Mostrar mais`)

### Decision
Implement collapsible grouping in `TaskActivityLogList.tsx` governed by a 5-item threshold:
- **Default State**: If activity entries exceed 5, render the 5 most recent entries, followed by a collapsible trigger button displaying `> Mostrar mais`.
- **Expanded State**: Clicking `> Mostrar mais` toggles the icon to `v Mostrar menos` and smoothly expands all historical log entries.
- **State Persistence**: The expanded/collapsed state is managed locally in `useTaskActivity.ts` state.

### Rationale
Tasks with long histories (20+ field updates) remain clean and scrollable, allowing users to inspect recent changes immediately while retaining instant access to complete historical audit logs.

---

## 4. Bottom Comment Input Card ("Escreva um comentário...")

### Decision
Implement `TaskActivityCommentForm.tsx` as a fixed footer card inside the Activity sidebar:
- **Container**: Card box with `border border-slate-700/60 bg-slate-800/40 rounded-xl p-3 focus-within:border-indigo-500/80 transition-colors`.
- **Input Surface**: Textarea with placeholder `"Escreva um comentário..."`.
- **Draft Guard Integration**: Inherits dirty state tracking so unsaved comment text triggers the Metrik Modal Draft Guard on accidental dismissal.
- **Submission**: Keyboard shortcut `Ctrl+Enter` / `Cmd+Enter` or explicit "Enviar" button.

### Rationale
Placing the comment card at the bottom of the activity sidebar creates a natural conversational stream (history above, input below) matching modern collaboration tools.

---

## 5. Objective Task Detail Fields Layout

### Decision
Structure `TaskDetailsModal.tsx` into a responsive 2-column layout (Main Details on left, Activity Sidebar on right):
- **Header**: Task Title, ID, and Close Button.
- **Objective Primary Fields Grid**:
  - Status (Interactive Badge)
  - Assignee (Avatar + Selector)
  - Priority (Badge Indicator)
  - Tags (Interactive Tag List)
  - Due Date (DatePicker & Overdue Status)
  - Flow Metrics (Cycle Time, Lead Time indicators)
- **Content Sections**: Task Description (Rich text / Markdown preview) & Subtasks Checklist.
- **Right Column / Drawer**: Dedicated Activity Panel container housing Header, Bulleted Log List, and Comment Input Card.

### Rationale
Separating primary task attributes from historical activity logs keeps the workspace organized, highly objective, and free from visual clutter.
