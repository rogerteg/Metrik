# Implementation Plan: ClickUp-Inspired Task Activity & Comments Redesign

**Branch**: `035-clickup-task-activity-redesign` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

**Input**: Feature specification from `/specs/035-clickup-task-activity-redesign/spec.md`

## Summary

Redesenhar e aprimorar a seção de Histórico e Comentários da Tarefa inspirada no ClickUp. O plano resolve o bug visual crítico de estouro de tamanho de ícone SVG (garantindo dimensões estritas de `16px-20px` via props explícitas e CSS scoped), implementa pílulas visuais de diff `[De ➔ Para]` para auditoria, adiciona barra de ferramentas para formatação Markdown, tag visual e painel "Spotlight de Decisões", e disponibiliza filtros rápidos e busca em tempo real.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18
**Primary Dependencies**: React 18, Vite 6, Vitest (Zero external icon/ui library dependencies, 100% native SVG)
**Storage**: `localStorage` (`metrik-tasks-<boardId>`) with opt-in Supabase PostgreSQL backup
**Testing**: Vitest + @testing-library/react (`npm test -- --run`)
**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)
**Project Type**: Single-page Web Application (Metrik Kanban)
**Performance Goals**: 60 FPS (<16ms) re-render latency for search and filtering on tasks with 200+ history entries
**Constraints**: Zero XSS risk (native AST/Regex Markdown parser without `dangerouslySetInnerHTML`), strict Local-First sovereignty, Guest role read-only confinement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Spec-Driven Development)**: PASS. `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` created prior to code edits.
- **Principle II (Code Quality & Modularity)**: PASS. Scoped UI components with single responsibility.
- **Principle III (Automated Verification)**: PASS. Test suite Vitest and `npm run build` validation.
- **Principle IV (Observability)**: PASS. Structured logging with `[Metrik]` prefix for task mutations.
- **Principle V (Simplicity & YAGNI)**: PASS. Native SVG icons, light AST/Regex Markdown parser.
- **Principle VI (Analytical Reasoning)**: PASS. Mandatory 6 analytical models evaluated before task breakdown.
- **Principle VII (Brand Independence)**: PASS. Standardized flow terms, zero third-party vendor leaks.
- **Principle VIII (Local-First Sovereignty)**: PASS. `localStorage` priority with opt-in Supabase sync.
- **Principle IX (User Data Integrity)**: PASS. `autoSaveComments` guard and `Ctrl+Enter` shortcut.

## Project Structure

### Documentation (this feature)

```text
specs/035-clickup-task-activity-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── task-activity-clickup.contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── taskActivity.ts
├── utils/
│   ├── simpleMarkdown.tsx
│   └── taskActivityLogger.ts
├── components/
│   ├── TaskTimeline.tsx
│   ├── TaskTimeline.css
│   ├── ActivityLogItem.tsx
│   ├── ActivityLogItem.css
│   ├── CommentItem.tsx
│   ├── CommentItem.css
│   ├── CommentInputForm.tsx
│   ├── CommentInputForm.css
│   ├── TimelineFilterBar.tsx
│   ├── TimelineFilterBar.css
│   └── TimelineStatsHeader.tsx
└── hooks/
    └── useTaskCollection.ts

tests/
└── unit/
    └── TaskTimelineClickUp.test.tsx
```

**Structure Decision**: Web application layout under `src/components/`, `src/utils/`, `src/types/` and `tests/unit/`.

## Complexity Tracking

*No constitution violations. Zero unjustified abstraction layers.*
