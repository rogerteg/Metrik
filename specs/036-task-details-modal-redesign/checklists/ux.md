# Task Details Modal & Activity System UI/UX Redesign — Requirements Quality Checklist

**Target Spec**: [spec.md](../spec.md)  
**Feature Branch**: `036-task-details-modal-redesign`  
**Domain**: UX, Visual Hierarchy & Persistence Quality  
**Status**: Ready for Review  

> **Purpose**: This checklist serves as "Unit Tests for Requirements Writing". It validates the completeness, clarity, consistency, measurability, and edge case coverage of the requirements in `spec.md` prior to architectural planning (`/speckit-plan`).

---

## 1. UX & Visual Architecture Completeness

- [ ] **CHK001** - `[Completeness, Spec §FR-001]` Are the two-column modal width allocation percentages (65%-70% main vs 30%-35% sidebar) explicitly specified for all desktop viewport breakpoints?
- [ ] **CHK002** - `[Completeness, Spec §FR-002]` Are the SVG icon sizing constraints (14px–18px, `flex-shrink: 0`) explicitly mapped to all icon types (status, tag, priority, attachment, timestamp) within the modal?
- [ ] **CHK003** - `[Completeness, Spec §FR-003]` Is the visual distinction between user comment cards (`bg-slate-900/80`) and system audit log entries (`bg-slate-950/60`) unambiguously specified with background, border, and avatar rules?
- [ ] **CHK004** - `[Completeness, Spec §FR-004]` Are typography formatting rules for Markdown elements (headers, code blocks, quote blocks, lists) completely defined with exact CSS token values (`leading-relaxed`, `text-slate-300`, `bg-slate-950 text-cyan-300`)?
- [ ] **CHK005** - `[Completeness, Spec §FR-005]` Are the diff pill formats `[De ➔ Para]` explicitly specified for all potential field mutation types (Status, Priority, Assignee, Squad, Dates)?

---

## 2. Preference Persistence & State Integrity

- [ ] **CHK006** - `[Clarity & Scope, Spec §FR-006 & Clarifications]` Is the `metrik-timeline-prefs` global `localStorage` key schema (containing `densityMode`, `activeFilter`, `searchQuery`) unambiguously defined for cross-task and cross-board persistence?
- [ ] **CHK007** - `[Completeness, Spec §FR-006]` Does the requirement specify fallback behaviors when `localStorage` is unavailable, corrupted, or contains stale version schemas?
- [ ] **CHK008** - `[Completeness, Spec §User Story 3 & FR-009]` Is the dirty state guard behavior clearly specified for uncommitted comment drafts when the user attempts to dismiss or close the modal?

---

## 3. Performance & Responsive Edge Cases

- [ ] **CHK009** - `[Measurability, Spec §FR-007]` Is the timeline search latency requirement (<16ms at 60 FPS) defined with a concrete dataset size benchmark (e.g., up to 100 activity entries)?
- [ ] **CHK010** - `[Edge Case Coverage, Spec §Edge Cases]` Is the responsive breakpoint for collapsing from a 2-column layout to a 1-column vertical stack explicitly specified in pixels (e.g., `<768px` or `<1024px`)?
- [ ] **CHK011** - `[Edge Case Coverage, Spec §Edge Cases]` Is the activity log grouping strategy for consecutive 50+ movement logs clearly detailed with single-line summary formatting and expansion rules?
- [ ] **CHK012** - `[Completeness, Spec §FR-008]` Is the visual spotlight treatment for project decision items (`isDecision`) fully specified with golden border accents (`border-amber-500/60`) and glowing badges?

---

## 4. Retro-compatibility & Integration Verification

- [ ] **CHK013** - `[Consistency, Spec §FR-010]` Are data model retro-compatibility requirements for `TaskComment` and `TaskActivityLog` explicitly tied to Local-First storage and Supabase cloud sync contracts?
- [ ] **CHK014** - `[Completeness, Spec §Assumptions]` Is the requirement of avoiding external UI library dependencies (relying exclusively on Vanilla CSS and Tailwind CSS utilities) explicitly actionable and verifiable?
- [ ] **CHK015** - `[Measurability, Spec §SC-003]` Is the zero-regression criterion for automated test suites (`npm test -- --run`) and TypeScript/Vite compilation (`npm run build`) tied directly to quality verification gates?
