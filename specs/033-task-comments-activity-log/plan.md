# Implementation Plan: Comentários e Trilha de Auditoria de Ações da Tarefa

**Branch**: `033-task-comments-activity-log` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

**Input**: Feature specification from `/specs/033-task-comments-activity-log/spec.md`

---

## Summary

Esta funcionalidade adiciona suporte nativo a comentários estruturados por tarefa e uma trilha de auditoria (*activity log*) automática, imutável e persistente para todas as movimentações e edições efetuadas nos cartões do Kanban. O sistema apresentará uma linha do tempo cronológica unificada no modal de detalhes da tarefa com filtros por tipo ("Todos", "Apenas Comentários", "Apenas Auditoria"). A implementação opera sob o modelo Local-First (gravado em `localStorage` e sincronizável com Supabase) sem degradação de performance e totalmente em conformidade com a Constituição v1.6.0.

---

## Technical Context

**Language/Version**: TypeScript 5.6+, React 18.3+  
**Primary Dependencies**: React, Lucide Icons, Vite, Vitest, Testing Library  
**Storage**: `localStorage` (`metrik_tasks_<boardId>`), Supabase PostgreSQL (opt-in cloud sync)  
**Testing**: Vitest (`npm test`), React Testing Library  
**Target Platform**: Modern Web Browsers (Chrome, Firefox, Edge, Safari) on Desktop & Mobile  
**Project Type**: Single-page Web Application (SPA Kanban & Flow Analytics)  
**Performance Goals**: Renderização da linha do tempo com até 100 eventos em <50ms; submissão de comentário em <2s  
**Constraints**: 100% Local-First offline capability, zero third-party brand leaks (Princípio VII), conformidade estrita com autosave (Princípio IX)  
**Scale/Scope**: Até 100 tarefas por quadro, até 100 eventos/comentários por tarefa  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Princípio I (Specification-Driven Development)**: PASS. `spec.md`, `research.md`, `data-model.md`, `contracts/` e `plan.md` criados antes da implementação.
- **Princípio II (Code Modularity)**: PASS. Separação limpa entre ganchos de dados (`useTaskCollection`), utilitários de auditoria e componentes visuais (`TaskTimeline`).
- **Princípio III (Automated Verification)**: PASS. Suíte Vitest dedicada (`TaskCommentsActivityLog.test.tsx`) e `npm run build` como gates.
- **Princípio IV (Observability & Logging)**: PASS. Logs estruturados com prefixo `[Metrik Audit]` e diagnósticos explícitos em caso de erro de gravação.
- **Princípio V (Simplicity & YAGNI)**: PASS. Comentários em texto puro (`white-space: pre-wrap`) sem biblioteca Markdown desnecessária; armazenamento no array da própria tarefa.
- **Princípio VI (Analytical Reasoning Pre-Task Creation)**: PASS. Decomposição com os 6 modelos analíticos obrigatórios precederá a geração de `tasks.md`.
- **Princípio VII (Brand Independence)**: PASS. Terminologia lean/agile limpa e zero vazamentos de nomes de terceiros.
- **Princípio VIII (Local-First Sovereignty & Guest Isolation)**: PASS. Gravação atômica em `localStorage`, sincronização opcional e restrição read-only para perfil `guest`.
- **Princípio IX (User Data Integrity & Draft Protection)**: PASS. Integração com `autoSaveComments` de Feature 032 e proteção de rascunhos não salvos no modal.

---

## Project Structure

### Documentation (this feature)

```text
specs/033-task-comments-activity-log/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & key decisions (Phase 0)
├── data-model.md        # Entity schemas & contracts (Phase 1)
├── quickstart.md        # Runnable verification guide (Phase 1)
├── contracts/           # UI & Interface contracts (Phase 1)
│   └── task-timeline-ui-contract.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── kanban.ts              # Extended TaskModel with comments & activityLog
│   └── taskActivity.ts        # TaskComment, TaskActivityLog, TimelineItem definitions
├── hooks/
│   └── useTaskCollection.ts   # Auto-logging mutations & comment management methods
├── utils/
│   └── taskActivityLogger.ts  # Helper factory functions to build TaskActivityLog entries
├── components/
│   ├── TaskDetailsModal.tsx   # Embeds TaskTimeline component
│   └── TaskTimeline.tsx       # Unified timeline component with filters & comment form
└── context/
    └── GeneralSettingsContext.tsx # Read autoSaveComments preference

tests/
└── unit/
    ├── TaskCommentsActivityLog.test.tsx # Unit tests for comments, auto audit log & filters
    └── TaskCollectionAudit.test.tsx     # Mutation hooks audit trail test suite
```

**Structure Decision**: Single React SPA project structure. All new components and utilities are modularly placed within `src/components/`, `src/hooks/`, `src/utils/`, and `src/types/`.

---

## Complexity Tracking

> **No Constitution violations detected. All design choices satisfy YAGNI and simplicity principles.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A |
