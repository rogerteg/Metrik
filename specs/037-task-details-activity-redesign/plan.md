# Implementation Plan: Task Details Activity & Objective Fields Redesign

**Branch**: `037-task-details-activity-redesign` | **Date**: 2026-09-23 | **Spec**: [spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/037-task-details-activity-redesign/spec.md)

**Input**: Feature specification from `specs/037-task-details-activity-redesign/spec.md`

## Summary

Redesign and restructure the Task Details Modal activity panel and objective field metadata layout inspired by clean activity audit stream design. The new interface features an Activity header with search toggle, unread notification counter badge, and filter options dropdown; a bulleted activity diff log stream with Portuguese action verbs, diff attributes, and right-aligned timestamps; a collapsible accordion (`> Mostrar mais`) grouping entries older than the 5 most recent; a prominent bottom comment input card ("Escreva um comentário..."); and a clean, organized layout for objective task metadata fields (Status, Assignee, Priority, Tags, Due Date, Flow Metrics).

## Technical Context

**Language/Version**: TypeScript 5.6+, React 18  
**Primary Dependencies**: Lucide React (`Search`, `Bell`, `SlidersHorizontal`, `ChevronRight`, `ChevronDown`, `MessageSquare`, `Calendar`, `User`, `Tag`, `Filter`), Vitest, Vite  
**Storage**: Client-Side Local-First `localStorage` state with opt-in hybrid sync  
**Testing**: Vitest (`npm test -- --run`) + React Testing Library  
**Target Platform**: Desktop & Mobile Web Browsers (Responsive modern Web UI)  
**Project Type**: Single-Page Web Application (React + Vite)  
**Performance Goals**: <200ms real-time activity log search/filter response, 60fps smooth accordion expand/collapse transitions  
**Constraints**: Metrik Constitution v1.6.2 compliance (Local-First sovereignty, zero third-party brand leaks, strict squad isolation, draft guard protection)  
**Scale/Scope**: `TaskDetailsModal.tsx`, `TaskActivityPanel.tsx`, `TaskActivityHeader.tsx`, `TaskActivityLogList.tsx`, `TaskActivityCommentForm.tsx`, `useTaskActivity.ts`, `taskActivity.ts` types

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Specification-Driven Development**: Spec `037-task-details-activity-redesign/spec.md` is fully detailed and clarified. **PASS**
- **Principle II: Code Quality & Modularity**: Component hierarchy strictly decoupled into modular header, log list, item diff, comment form, and objective fields components. **PASS**
- **Principle III: Automated Verification & Testing**: Comprehensive Vitest unit tests for header controls, log formatting, accordion collapse at threshold 5, comment posting, and field log generation. **PASS**
- **Principle IV: Observability & Structured Logging**: Activity mutations log with `[Metrik Activity]` diagnostic prefix. **PASS**
- **Principle V: Simplicity & YAGNI**: Reuses existing UI icons, hooks, and CSS tokens; no unnecessary dependencies added. **PASS**
- **Principle VII: Brand Independence & Clean Identity**: Zero third-party brand references; Portuguese localized activity log text. **PASS**
- **Principle VIII: Local-First Sovereignty**: Activity logs stored and queried locally in client state. **PASS**
- **Principle IX: User Data Integrity & Draft Protection**: Comment input protected against accidental dismissal when dirty. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/037-task-details-activity-redesign/
├── spec.md              # Feature specification (/speckit-specify output)
├── plan.md              # Technical implementation plan (/speckit-plan output)
├── research.md          # Architecture & design decisions (/speckit-plan output)
├── data-model.md        # Entities, types & data flow (/speckit-plan output)
├── quickstart.md        # End-to-end verification scenario guide (/speckit-plan output)
├── contracts/           # Component UI prop contracts (/speckit-plan output)
│   └── ui-contracts.md
└── checklists/          # Requirements & UX quality checklists
    ├── requirements.md
    └── ux.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TaskDetailsModal.tsx            # Main Modal Shell & Objective Fields layout
│   ├── TaskActivityPanel.tsx           # Activity Sidebar Container
│   ├── TaskActivityHeader.tsx          # Activity Top Bar (Title, Search, Bell Counter, Filter)
│   ├── TaskActivityLogList.tsx         # Bulleted Activity Stream with Collapsible Accordion (threshold: 5)
│   ├── TaskActivityLogItem.tsx         # Bullet Log Entry (Actor, Action/Diff, Right-aligned Timestamp)
│   └── TaskActivityCommentForm.tsx     # Bottom Comment Input Card ("Escreva um comentário...")
├── hooks/
│   ├── useTaskActivity.ts              # Hook for searching, filtering, and collapsing activity logs
│   └── useFieldEdit.ts                 # Field edit & log generation hook
├── types/
│   └── taskActivity.ts                 # Type definitions for ActivityLogEntry & filter choices
└── utils/
    └── activityFormatter.ts            # Portuguese date formatting ("jun 26 às 10:26 am") & diff text generators

tests/
└── unit/
    ├── TaskActivityPanel.test.tsx      # Tests for Activity Header, search, notification counter & filter
    ├── TaskActivityLogList.test.tsx    # Tests for bullet format, diff text, right-aligned timestamps, and > Mostrar mais
    └── TaskDetailsModalRedesign.test.tsx # End-to-end modal & objective fields tests
```

**Structure Decision**: Single React Web Application structure (Option 1) targeting `src/components/`, `src/hooks/`, `src/types/`, `src/utils/`, and `tests/unit/`.

## Complexity Tracking

> *No Constitution violations detected. All design choices satisfy YAGNI and modularity guidelines.*
