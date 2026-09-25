# Research & Architecture Decisions: Task Details Activity & Objective Fields Redesign

> **Reconciled 2026-09-25** — this document reflects the design as shipped (see `spec.md` § Clarifications, Session 2026-09-25). Where the initial draft described a right-side `TaskActivityPanel` with a bulleted 5-item accordion, those decisions were superseded by a unified, time-bucketed timeline inside a tabbed modal.

## Overview

Records the technical and design decisions for the redesigned Task Details modal: a tabbed, objective layout built on the Metrik Design System (vanilla CSS + semantic tokens), with a single unified activity feed and a flow-transparency metrics panel.

---

## 1. Unified Activity Feed (replaces the separate Activity panel/header)

### Decision
Render comments and audit events in a single chronological feed via `TaskTimeline.tsx`, with `TimelineFilterBar` (category filters: Todos / Decisões / Comentários / Auditoria; search; density) and `TimelineStatsHeader` (comments, decisions, moves, blocked time). The latest decision is surfaced in a spotlight banner.

### Rationale
A single source of truth removes the previously duplicated activity surfaces, reduces cognitive load and keeps the modal height manageable.

---

## 2. Feed Item Rendering & Timestamp Anchoring

### Decision
Two item renderers, both in vanilla CSS (`TaskActivityFeed.css`, `mrf-*` classes):
- `CommentItem.tsx` — comment cards with author avatar, decision badge, Markdown rendering and delete action.
- `ActivityLogItem.tsx` — audit rows with a colored type badge, actor, description and a `De ➔ Para` diff pill.

Timestamps are right-anchored with `white-space: nowrap` + `flex-shrink: 0`; text bodies use `min-width: 0` so long names/values truncate instead of pushing the timestamp out (verified by `tests/unit/activityFeedContract.test.ts`).

### Rationale
Strictly prevents visual overlap across screen resolutions (SC-004) while keeping content readable. Canonical timestamp format: `CommentItem.formatDate` (`dd/mm/aaaa às hh:mm`).

---

## 3. Time-Bucket Grouping & Density (supersedes the `> Mostrar mais` accordion)

### Decision
Group entries by temporal buckets — Hoje / Ontem / Esta Semana / Anteriores (`groupTimelineItems`) and offer a **density** toggle (detalhado / compacto). Filtering/sorting is a pure, performance-tested function (`filterTimelineItems`, <200ms over 5.000 entries — T026).

### Rationale
Preserves full history without a rigid 5-item cut-off, while keeping recent context immediate. Persisting density/search preferences happens via `useTimelinePreferences`.

---

## 4. Comment Composer

### Decision
`CommentInputForm.tsx` provides a Markdown composer with a formatting toolbar (bold, italic, list, code), a "Decisão de Projeto" toggle, placeholder `Escreva um comentário...` and a `Ctrl+Enter` shortcut.

### Rationale
Keeps discussion and decisions in the same stream, with lightweight formatting and an explicit decision marker.

---

## 5. Tabbed Objective Task Detail (supersedes the 2-column layout)

### Decision
Structure `TaskDetailsModal.tsx` with a context header (breadcrumb, status badge, short ID, type, due/blocked/blockers pills) and three tabs:
- **Visão Geral** — Description, Acceptance Criteria, Test Scenarios, Checklist, Links.
- **Atividade** — the unified feed and composer.
- **Métricas** — flow transparency.

The right sidebar (`TaskMetadataSidebar`) exposes Assignee, Priority, Task Type, Dates and Impediment.

### Rationale
Separates objective fields, history and metrics without an excessively tall modal; the sidebar keeps the always-relevant attributes at hand.

---

## 6. Assignee (objective ownership field)

### Decision
Add `assignee?: string` to `TaskModel`. The sidebar offers a selector of registered users (falling back to free text). Changes emit objective audit events (`assignment` / `unassignment`) from `useTaskCollection.updateTask`.

### Rationale
Establishes explicit ownership with a transparent audit trail, dependency-free and local-first.

---

## 7. Flow-Transparency Metrics

### Decision
`TaskFlowMetricsPanel.tsx` derives Lead Time, Cycle Time, Blocked Time, card age, lifecycle dates and composition counters from existing task fields (no new persisted data).

### Rationale
Delivers transparency and value by surfacing already-available flow data (YAGNI).

---

## 8. Styling & Brand Independence

### Decision
All activity/timeline components use vanilla Metrik tokens (`TaskActivityFeed.css`); no external CSS framework and no third-party brand names in UI text, DOM attributes or source-code comments.

### Rationale
The project has no CSS framework installed; token-based vanilla CSS works across dark/light/neutral themes (Constitution V, VII).
