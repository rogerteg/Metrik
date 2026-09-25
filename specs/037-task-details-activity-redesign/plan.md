# Implementation Plan: Task Details Activity & Objective Fields Redesign

**Branch**: `037-task-details-activity-redesign` | **Date**: 2026-09-23 | **Reconciled**: 2026-09-25 | **Spec**: [spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/037-task-details-activity-redesign/spec.md)

**Input**: Feature specification from `specs/037-task-details-activity-redesign/spec.md`

## Summary

Redesign the Task Details modal into an organized, tabbed experience (*Visão Geral*, *Atividade*, *Métricas*) built on the Metrik Design System (vanilla CSS + semantic tokens). The modal gains a context header (board/column status badge, short task ID, type, due/blocked/blockers pills) and a metadata sidebar (Priority, Assignee, Type, Dates, Impediment). The activity area is a **unified chronological feed** (comments + audit) rendered with cards and diff pills, grouped into time buckets, with search, category filters, density control and a decision spotlight, plus a Markdown comment composer. A dedicated **flow-transparency** panel exposes Lead Time, Cycle Time, Blocked Time, card age, lifecycle dates and composition counters.

> **Reconciliation note (2026-09-25):** the initial draft specified a two-column layout with a right-side `TaskActivityPanel` and a `disc`-bulleted 5-item accordion. The delivered implementation uses **tabs** and a **unified timeline** instead. This plan reflects the shipped design (see `spec.md` § Clarifications, Session 2026-09-25).

## Technical Context

**Language/Version**: TypeScript 5.7, React 19
**Primary Dependencies**: React, Vitest 3 + React Testing Library 16 + jsdom 26, Vite 6 — icons are inline SVG components (no external icon library)
**Storage**: Client-Side Local-First `localStorage` state with opt-in hybrid sync
**Testing**: Vitest (`npm test`) + React Testing Library
**Target Platform**: Desktop & Mobile Web Browsers (responsive modern Web UI)
**Project Type**: Single-Page Web Application (React + Vite)
**Performance Goals**: <200ms real-time activity search/filter response, smooth accordion/density transitions
**Constraints**: Metrik Constitution v1.6.3 compliance (Local-First sovereignty, zero third-party brand leaks, strict squad isolation, draft guard protection)
**Scale/Scope**: `TaskDetailsModal.tsx`, `TaskMetadataSidebar.tsx`, `TaskFlowMetricsPanel.tsx`, `TaskTimeline.tsx`, `TimelineFilterBar.tsx`, `TimelineStatsHeader.tsx`, `CommentItem.tsx`, `ActivityLogItem.tsx`, `CommentInputForm.tsx`, `TaskActivityFeed.css`, `useFieldEdit.ts`, `useTaskCollection.ts`, `taskActivity.ts` types, `taskActivityLogger.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Specification-Driven Development**: Spec `037-task-details-activity-redesign/spec.md` is detailed, clarified and reconciled with the shipped implementation. **PASS**
- **Principle II: Code Quality & Modularity**: Component hierarchy decoupled into modal shell, context header, metadata sidebar, tab panels, timeline feed, filter bar, stats header, log/comment items and composer. **PASS**
- **Principle III: Automated Verification & Testing**: Comprehensive Vitest coverage for modal layout, autosave/draft guard, activity feed formatting/filtering, and assignee audit events; `npm test` + `npm run build` green. **PASS**
- **Principle IV: Observability & Structured Logging**: Failures are explicit; `extensions.yml` parse failures are surfaced (no silent skip); activity/audit events use stable prefixes and objective descriptions. **PASS**
- **Principle V: Simplicity & YAGNI**: Reuses existing hooks, tokens and inline SVG icons; no new runtime dependencies added. **PASS**
- **Principle VI: Analytical Reasoning Pre-Task Creation**: The mandatory analytical-reasoning models are documented in `tasks.md` before task listing. **PASS**
- **Principle VII: Brand Independence & Clean Identity**: Zero third-party brand names in UI text, DOM attributes or source-code comments (remediated 2026-09-25). **PASS**
- **Principle VIII: Local-First Sovereignty**: Activity logs, assignee and metrics are stored and derived locally in client state. **PASS**
- **Principle IX: User Data Integrity & Draft Protection**: Comment/field inputs are protected against accidental dismissal when dirty. **PASS**

## Design Decisions (reconciliation)

| Decision | Choice | Justification | Requirement |
|---|---|---|---|
| Detail structure | Tabs: Visão Geral / Atividade / Métricas | Keeps objective fields, the feed and transparency metrics separated, reducing cognitive load and modal height | FR-007, FR-009 |
| Activity surface | Single unified timeline (comments + audit) | Eliminates the duplicated activity panel and establishes one source of truth | FR-001, FR-002 |
| Entry grouping | Time buckets + density control | Preserves history without visual overload (supersedes the 5-item accordion) | FR-004 |
| Feed styling | Vanilla CSS + Metrik tokens (`TaskActivityFeed.css`) | No external CSS framework in the project; works across dark/light/neutral themes | FR-002, Constitution V |
| Assignee | `assignee?: string` on the task + `assignment`/`unassignment` audit events | Objective ownership field with a transparent audit trail; local-first and dependency-free | FR-006, FR-007 |
| Transparency metrics | `TaskFlowMetricsPanel` derived from existing timeline fields | Delivers value without new persisted data (YAGNI) | FR-009 |

## Project Structure

### Documentation (this feature)

```text
specs/037-task-details-activity-redesign/
├── spec.md              # Feature specification (/speckit-specify output, reconciled)
├── plan.md              # Technical implementation plan (this file, reconciled)
├── research.md          # Architecture & design decisions
├── data-model.md        # Entities, types & data flow
├── quickstart.md        # End-to-end verification scenario guide
├── contracts/           # Component UI prop contracts
│   └── ui-contracts.md
├── checklists/          # Requirements & UX quality checklists
│   ├── requirements.md
│   └── ux.md
└── tasks.md             # Task breakdown + Phase 8 Convergence
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TaskDetailsModal.tsx            # Modal shell: context header, tabs, sidebar wiring
│   ├── TaskDetailsModal.css            # Modal, hero, tabs and metrics styles
│   ├── TaskMetadataSidebar.tsx         # Priority, Assignee, Type, Dates, Impediment
│   ├── TaskFlowMetricsPanel.tsx        # Transparency metrics (Lead/Cycle/Blocked/age/composition)
│   ├── TaskTimeline.tsx                # Unified activity + comments feed
│   ├── TimelineFilterBar.tsx           # Category filters, search, density control
│   ├── TimelineStatsHeader.tsx         # Comments/decisions/moves/blocked summary
│   ├── CommentItem.tsx                 # Comment card (Markdown, decision badge)
│   ├── ActivityLogItem.tsx             # Audit row with from→to diff pill
│   ├── CommentInputForm.tsx            # Markdown composer ("Escreva um comentário...")
│   └── TaskActivityFeed.css            # Vanilla styles for the feed family
├── hooks/
│   ├── useTaskCollection.ts            # Mutations + objective audit logging (incl. assignee)
│   ├── useFieldEdit.ts                 # Field edit & save lifecycle
│   └── useTimelinePreferences.ts       # Feed filter/density/search preferences
├── types/
│   ├── kanban.ts                       # TaskModel (incl. `assignee`)
│   └── taskActivity.ts                 # ActivityLogEntry & filter types
└── utils/
    └── taskActivityLogger.ts           # Event factory, audit descriptions, timeline filtering & grouping

tests/
└── unit/
    ├── TaskDetailsModal.test.tsx
    ├── TaskDetailsModalRedesign.test.tsx   # Tabs + objective fields
    ├── TaskDetailsModalAutosave.test.tsx
    ├── TaskModalDraftGuard.test.tsx
    ├── TaskAssignee.test.tsx               # Assignee audit + status badge
    ├── TaskTimelineActivity.test.tsx       # Feed, diffs, decision filter, search
    ├── ActivityFeedRedesign.test.tsx
    ├── timelinePerformance.test.ts         # T026: <200ms search/filter verification
    └── activityFeedContract.test.ts        # T027: no-overlap (nowrap/flex-shrink/min-width) contract
```

**Structure Decision**: Single React Web Application structure (Option 1) targeting `src/components/`, `src/hooks/`, `src/types/`, `src/utils/`, and `tests/unit/`.

**Legacy components removed (2026-09-25, T032)**: The unused activity panel and its children (`TaskActivityPanel`, `TaskActivityHeader`, `TaskActivityLogList`, `TaskActivityLogItem`, `TaskActivityCommentForm`), the `useTaskActivity` hook and the duplicate `activityFormatter` utility (plus their tests and the orphan `TaskActivityPanel.css`) were deleted. The unified `TaskTimeline` feed and `CommentItem.formatDate` are now the single source of truth for activity rendering and timestamp formatting.

## Complexity Tracking

> No Constitution violations detected after reconciliation. The activity-feed styling rework replaces previously inert utility classes with the project's vanilla design system; no new dependencies were introduced.
