# Implementation Plan: Task Details Modal & Activity System Complete UI/UX Redesign

**Branch**: `036-task-details-modal-redesign` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/036-task-details-modal-redesign/spec.md`

## Summary

Redesign the Task Details Modal and Activity System UI/UX to deliver an enterprise-grade, glassmorphism-enhanced 2-column layout (65%-70% main panel / 30%-35% sidebar metadata). Overhaul activity timeline visual formatting with distinct high-contrast card styling (`bg-slate-900/80` user comments vs `bg-slate-950/60` system audit logs), rich Markdown rendering (inline code `bg-slate-950 text-cyan-300`, quote blocks `border-l-2 border-amber-500`), strict SVG icon bounding (<=18px), global browser preference persistence (`metrik-timeline-prefs` in `localStorage`), and dirty draft protection.

---

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Vite, Tailwind CSS, Lucide React (SVG icons), Vitest, React Testing Library  
**Storage**: Local-First `localStorage` (`metrik-timeline-prefs`), optional cloud sync with Supabase  
**Testing**: Vitest (`npm test -- --run`), React Testing Library  
**Target Platform**: Modern Web Browsers (Desktop & Responsive Mobile `<768px`)  
**Project Type**: Single-page React Web Application  
**Performance Goals**: <16ms (60 FPS) timeline search/filtering response; zero input latency  
**Constraints**: Zero third-party brand leaks; zero external UI library dependencies (Vanilla CSS + Tailwind CSS utilities); 100% retrocompatibility with `TaskComment` and `TaskActivityLog` models  
**Scale/Scope**: Task details modal, timeline activity feed, filter control bar, metadata sidebar  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Principle I (Specification-Driven Development)**: `spec.md`, `checklists/ux.md`, `research.md`, `data-model.md`, `/contracts/ui-contracts.md`, and `quickstart.md` created prior to code modification.
- [x] **Principle III (Automated Verification & Testing)**: Zero-regression requirement enforced via `npm test` and `npm run build`.
- [x] **Principle IV (Observability & Structured Logging)**: Structured log prefixes `[Metrik]` maintained on state updates and persistence errors.
- [x] **Principle V (Simplicity & YAGNI)**: Implementation uses pure React state and Tailwind CSS utilities without extra UI libraries.
- [x] **Principle VI (Analytical Reasoning Pre-Task Creation)**: Analytical models (First Principles, Premortem, MECE, Tree of Thoughts, TDD Red-Bar, Polygraph Verification) mandated prior to task generation in `tasks.md`.
- [x] **Principle VII (Brand Independence & Clean Identity)**: 100% clean terminology; zero third-party vendor leaks.
- [x] **Principle VIII (Local-First Sovereignty & TBAC)**: Global timeline preferences stored in `localStorage` under `metrik-timeline-prefs`; guest role read-only actions respected.
- [x] **Principle IX (User Data Integrity & Draft Protection)**: Dirty state confirmation dialog and `beforeunload` guard implemented for unsubmitted comment drafts.

*Result*: **PASS**. Zero constitution violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/036-task-details-modal-redesign/
├── spec.md              # Feature specification
├── plan.md              # Technical implementation plan
├── research.md          # Architectural research & decisions
├── data-model.md        # Data models & state transitions
├── quickstart.md        # Interactive validation & run guide
├── contracts/
│   └── ui-contracts.md  # React component interface definitions
└── checklists/
    ├── requirements.md  # Built-in spec quality checklist
    └── ux.md            # Requirements quality checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TaskDetailsModal.tsx     # Redesigned 2-column modal container
│   ├── TaskMetadataSidebar.tsx  # Sidebar metadata panel (Priority, Assignee, Squad, Tags)
│   ├── TimelineFilterBar.tsx    # Density, search (<16ms), and filter control bar
│   ├── ActivityFeed.tsx         # Activity feed container (Comments + Audit logs)
│   ├── CommentCard.tsx          # High-contrast user comment card with Markdown
│   └── ActivityLogItem.tsx      # System audit log compact row with diff pills
├── hooks/
│   └── useTimelinePreferences.ts # React hook for metrik-timeline-prefs persistence
├── types/
│   └── taskActivity.ts          # Existing & extended timeline types
└── utils/
    └── markdownParser.ts        # Markdown parser & HTML sanitizer helper
```

**Structure Decision**: Single-project React Web Application layout adhering to existing `src/components/` and `src/hooks/` structure.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A |
