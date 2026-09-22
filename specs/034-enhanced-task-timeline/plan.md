# Implementation Plan: Redesign do Histórico, Auditoria e Comentários da Tarefa (Enterprise Task Timeline)

**Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

**Input**: Feature specification from `/specs/034-enhanced-task-timeline/spec.md`

---

## Summary

Esta funcionalidade implementa o redesign completo e a evolução da interface de histórico, auditoria e comentários de tarefas no Metrik. A nova arquitetura introduz cartões visuais de diff para auditoria (`[De ➔ Para]`), agrupamento cronológico por seções temporais (Hoje, Ontem, Esta Semana, Anteriores), formatação Markdown limpa sanitizada para comentários, marcação proeminente de "Decisão de Projeto" (`isDecision: true`) com botão de filtro exclusivo de primeira classe, pesquisa textual em tempo real, seletor de densidade (Detalhado/Compacto) e um cabeçalho resumido com métricas estatísticas de atividade. A implementação opera sob o modelo Local-First (persistência atômica em `localStorage` e sincronização Supabase) e atende rigorosamente a Constituição v1.6.0.

---

## Technical Context

**Language/Version**: TypeScript 5.6+, React 18.3+  
**Primary Dependencies**: React, Vite, Vitest, Testing Library  
**Storage**: `localStorage` (`metrik-tasks-<boardId>`), Supabase PostgreSQL (opt-in cloud sync)  
**Testing**: Vitest (`npm test -- --run`), React Testing Library  
**Target Platform**: Modern Web Browsers (Chrome, Firefox, Edge, Safari) em Desktop e Mobile  
**Project Type**: Single-page Web Application (SPA Kanban & Flow Analytics)  
**Performance Goals**: Renderização da linha do tempo agrupada com até 100 eventos em <30ms a 60 FPS; filtragem em tempo real em <10ms  
**Constraints**: 100% Local-First offline capability, ícones SVG nativos inline (zero vazamento de marcas por Princípio VII), formatador Markdown limpo por regex/AST seguro sem dependências pesadas externas  
**Scale/Scope**: Até 100 tarefas por quadro, até 100 eventos/comentários por tarefa  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Princípio I (Specification-Driven Development)**: PASS. `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` e `plan.md` gerados antes de tarefas de código.
- **Princípio II (Code Modularity)**: PASS. Estrutura modular com utilitários puros de parseamento (`simpleMarkdown.ts`), fábrica de eventos (`taskActivityLogger.ts`) e subcomponentes visuais de responsabilidade única.
- **Princípio III (Automated Verification)**: PASS. Suíte dedicada Vitest (`TaskTimelineEnhanced.test.tsx`) e compilação de tipos TypeScript estrita (`npm run build`).
- **Princípio IV (Observability & Logging)**: PASS. Registros de auditoria com prefixo `[Metrik Audit]` e diagnósticos estruturados em erros de gravação.
- **Princípio V (Simplicity & YAGNI)**: PASS. Parser Markdown regex/AST nativo e leve, eliminando dependências externas como `marked` ou `react-markdown`.
- **Princípio VI (Analytical Reasoning Pre-Task Creation)**: PASS. Os 6 modelos de raciocínio analítico precederão a emissão de `tasks.md`.
- **Princípio VII (Brand Independence)**: PASS. Uso exclusivo de componentes SVG nativos inline; zero vazamento de nomes de marcas proprietárias.
- **Princípio VIII (Local-First Sovereignty & Guest Isolation)**: PASS. Gravação atômica LocalFirst e bloqueio read-only estrito para perfil `guest`.
- **Princípio IX (User Data Integrity & Draft Protection)**: PASS. Proteção de rascunhos de comentários pendentes por tarefa com suporte a `autoSaveComments`.

---

## Project Structure

### Documentation (this feature)

```text
specs/034-enhanced-task-timeline/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & key decisions (Phase 0)
├── data-model.md        # Entity schemas & contracts (Phase 1)
├── quickstart.md        # Runnable verification guide (Phase 1)
├── contracts/           # UI & Interface contracts (Phase 1)
│   └── timeline-ui-contract.md
└── checklists/
    ├── requirements.md  # Built-in spec quality checklist
    └── ux-and-audit.md  # Custom UX & requirements quality checklist
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── kanban.ts              # Extended TaskModel with comments & activityLog
│   └── taskActivity.ts        # Extended TaskComment, TaskActivityLog, TimelineGroup
├── utils/
│   ├── taskActivityLogger.ts  # Activity event creation & Portuguese diff formatters
│   └── simpleMarkdown.ts      # Safe regex/AST parser for bold, italic, lists & code
├── components/
│   ├── TaskDetailsModal.tsx   # Embeds enhanced TaskTimeline component
│   ├── TaskTimeline.tsx       # Main timeline container with search, density mode & groups
│   ├── TimelineFilterBar.tsx  # Interactive filter bar with "Decisões" dedicated tab
│   ├── TimelineStatsHeader.tsx# Summary metrics header (comments, decisions, moves, blocked)
│   ├── CommentInputForm.tsx   # Markdown toolbar, Ctrl+Enter, "Decisão de Projeto" toggle
│   ├── CommentItem.tsx        # Rendered comment card with decision badge & collapse toggle
│   └── ActivityLogItem.tsx    # Diff card rendering [From ➔ To] with semantic category badges

tests/
└── unit/
    └── TaskTimelineEnhanced.test.tsx # Unit tests for timeline redesign, diffs & filters
```

**Structure Decision**: Single React SPA project structure. Modularity preserved by separating types (`taskActivity.ts`), utilities (`taskActivityLogger.ts`, `simpleMarkdown.ts`), and standalone UI subcomponents.

---

## Complexity Tracking

> **No Constitution violations detected. All design choices satisfy YAGNI and simplicity principles.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A |
