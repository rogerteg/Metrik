# Research & Technical Decisions: Task Details Modal UI/UX Redesign

**Feature Branch**: `036-task-details-modal-redesign`  
**Date**: 2026-09-22  
**Spec**: [spec.md](./spec.md)  

---

## 1. 2-Column Responsive Modal Layout Architecture

### Decision
Implement a CSS Grid/Flexbox modal layout structured with a 2-column split on desktop viewports (`≥1024px` / `≥768px`) consisting of:
- **Main Column** (`w-full md:w-[65%] lg:w-[70%]`): Holds the task title, description editor, subtasks checklist, and activity feed (comments + activity log).
- **Sidebar Column** (`w-full md:w-[35%] lg:w-[30%] border-l border-slate-800/80 bg-slate-950/40 p-4 space-y-5`): Holds task metadata pills (Priority, Status, Assignee, Squad, Tags, Dates, Impediments).
- **Responsive Fallback** (`<768px`): Automatically transitions to a 1-column vertical flex layout (`flex-col`), stacking the sidebar metadata panel below the description and above/below the timeline.

### Rationale
- Fixes the cramped visual hierarchy reported by users.
- Gives ample horizontal space for rich Markdown reading, code snippets, and comment creation.
- Aligns strictly with Metrik Design System glassmorphism (`bg-slate-900/90 backdrop-blur-md border border-slate-800`).

### Alternatives Considered
- *Floating Popover / Drawers*: Rejected because a task details view requires deep focus and side-by-side comparison of metadata and comments.
- *Fixed Pixel Width Sidebar*: Rejected because percentage-based allocation scales harmoniously across high-DPI monitors and ultrawides.

---

## 2. SVG Icon Sizing & Bounding Standardization

### Decision
Enforce a utility-based strict sizing contract for all inline SVG icons inside the Task Details Modal:
- Icon wrapper class: `w-4 h-4 flex-shrink-0 text-slate-400` (16px default) or `w-3.5 h-3.5 flex-shrink-0` (14px mini badges).
- Max dimensions constraint: `max-w-[18px] max-h-[18px]` inline style safeguard.

### Rationale
- Prevents SVGs from expanding or distorting when text wraps inside metadata pills or activity headers.
- Guarantees 100% adherence to SC-001 (icon bounding <= 18px).

---

## 3. High-Contrast Card Differentiation & Markdown Formatting

### Decision
Establish high-contrast color and gradient contracts for activity elements:
1. **User Comments**: Rendered in elevated card containers (`bg-slate-900/80 border border-slate-800/80 rounded-lg p-4 shadow-sm hover:border-slate-700/80 transition-colors`).
2. **System Audit Logs**: Rendered in discrete compact rows (`bg-slate-950/60 border border-slate-800/40 rounded-md px-3 py-2 text-xs text-slate-400`).
3. **Diff Pills**: `[De ➔ Para]` rendered with `font-mono bg-slate-900 text-slate-300 border border-slate-700/60 px-1.5 py-0.5 rounded`.
4. **Project Decisions (`isDecision`)**: Delineated with gold accents (`bg-amber-950/30 border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]`).
5. **Markdown Styling**:
   - Paragraphs: `leading-relaxed text-slate-300 text-sm space-y-2`
   - Code Inline: `font-mono text-xs px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800`
   - Quote Blocks (`> `): `border-l-2 border-amber-500 bg-amber-500/5 pl-3 py-1.5 text-slate-300 italic text-sm rounded-r`

### Rationale
- Directly resolves user complaint ("Historico, comentarios, logs... formatação é ruim, pesima").
- Provides instant visual parsing between human discussions and automated system events.

---

## 4. User Preference Persistence (`metrik-timeline-prefs`)

### Decision
Store user timeline display preferences globally per browser in `localStorage` under the key `metrik-timeline-prefs`.
- **JSON Schema**:
  ```json
  {
    "version": 1,
    "densityMode": "compact" | "detailed",
    "activeFilter": "all" | "decisions" | "comments" | "activity",
    "searchQuery": ""
  }
  ```
- **Fallback Strategy**: If `localStorage` is empty, unparseable, or inaccessible (private mode), default gracefully to `{ version: 1, densityMode: 'detailed', activeFilter: 'all', searchQuery: '' }`.

### Rationale
- Fulfills FR-006 and User Story 3 requirement that settings persist across tasks, boards, and browser sessions.

---

## 5. Dirty State Guard & Uncommitted Draft Protection

### Decision
Track uncommitted comment drafts in `TaskDetailsModal` state. When the user clicks the close button (`X`), overlay backdrop, or presses `Escape` while `draftComment.trim().length > 0`:
1. Intercept modal closing.
2. Prompt dirty state confirmation ("Você possui um rascunho de comentário não enviado. Deseja descartar ou continuar editando?").
3. Register window `beforeunload` listener while a draft is dirty to prevent accidental tab closure (Constitution IX.1).

### Rationale
- Enforces Constitution Principle IX (User Data Integrity, Intentional Persistence & Draft Protection).
