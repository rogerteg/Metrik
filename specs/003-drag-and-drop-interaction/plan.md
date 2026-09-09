# Implementation Plan: Interação Drag-and-Drop de Cartões

**Branch**: `003-drag-and-drop-interaction` | **Date**: 2026-09-08 | **Spec**: [specs/003-drag-and-drop-interaction/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/spec.md)

**Input**: Feature specification from `specs/003-drag-and-drop-interaction/spec.md`

---

## Summary

Implementação da interação nativa de arrastar e soltar (HTML5 Drag and Drop) para movimentação e reordenação de cartões no quadro Kanban do Metrik. A solução é 100% nativa (sem dependências externas adicionais), compatível com React 19, modularizada através do hook `useTaskCollection` e utilitários puros de reordenação (`reorderTasks`), garantindo feedback visual fluido (estilos CSS com glassmorphism), persistência imediata no `localStorage` e preservação dos botões direcionais para acessibilidade.

---

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19.x  
**Primary Dependencies**: React 19, Vite 6, HTML5 Drag and Drop API nativa (0 novas dependências)  
**Storage**: `localStorage` sob a chave existente `metrik_kanban_tasks`  
**Testing**: Vitest 3.x, React Testing Library, jsdom  
**Target Platform**: Navegadores Desktop modernos (Chrome, Firefox, Safari, Edge) com fallback via botões para Mobile/Touch  
**Project Type**: SPA Frontend Offline-First  
**Performance Goals**: 60 FPS nas interações de arraste e transição visual em menos de 16ms  
**Constraints**: Zero novas dependências de terceiros, preservação estrita do design system Vanilla CSS, 100% retrocompatibilidade com dados das Features 001 e 002  

---

## Constitution Check

*GATE: Avaliação contra a Constituição do Metrik (v1.1.0)*

| Princípio Constitucional | Status | Justificativa / Conformidade |
|---|---|---|
| **I. Spec-Driven Development** | ✅ Aprovado | Especificação formal (`spec.md`), pesquisa técnica (`research.md`), modelo de dados (`data-model.md`) e plano de implementação gerados antes do código. |
| **II. Code Quality & Modularity** | ✅ Aprovado | Reordenação puramente funcional isolada em `taskReorder.ts`, orquestração em hooks dedicados sem dependências circulares. |
| **III. Automated Verification & Testing** | ✅ Aprovado | TDD (Red-Bar First) com cobertura de testes unitários para o algoritmo de reordenação, manipulação de eventos de DnD e renderização de componentes. |
| **IV. Observability & Structured Logging** | ✅ Aprovado | Logs descritivos nos testes e tratamento gracioso de eventos de cancelamento de drag. |
| **V. Simplicity & YAGNI** | ✅ Aprovado | Utilização direta da API HTML5 nativa sem introduzir bibliotecas pesadas de terceiros (`dnd-kit` ou `react-beautiful-dnd`). |
| **VI. Analytical Reasoning Pre-Tasks** | 🔒 Obrigatório | A criação de tarefas em `tasks.md` (via `/speckit-tasks`) será estritamente precedida pelos 5 Modelos de Raciocínio Analítico. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-drag-and-drop-interaction/
├── spec.md              # Especificação formal de requisitos
├── plan.md              # Plano técnico de implementação (este arquivo)
├── research.md          # Pesquisa técnica sobre HTML5 Drag & Drop e mitigação de flickering
├── data-model.md        # Contratos de tipos, modelo de transição e reordenação
├── quickstart.md        # Roteiro passo a passo de validação interativa
└── tasks.md             # Breakdown de tarefas com Modelos Analíticos (Phase 2)
```

### Source Code Impact

```text
src/
├── types/
│   ├── kanban.ts          # Referência do TaskModel e ColumnId
│   └── dnd.ts             # [NOVO] Tipos e interfaces de Drag and Drop
├── utils/
│   └── taskReorder.ts     # [NOVO] Funções puras de reordenação e atualização de timestamps
├── hooks/
│   └── useTaskCollection.ts # [MODIFICADO] Adiciona reorderOrMoveTask
├── components/
│   ├── Column.tsx         # [MODIFICADO] Drop target com mitigação de flickering e drop zone
│   └── Task.tsx           # [MODIFICADO] Atributos draggable, onDragStart, onDragEnd, drop zone
└── App.css                # [MODIFICADO] Estilos .task-card-dragging e .kanban-column-drop-target

tests/
└── unit/
    ├── taskReorder.test.ts # [NOVO] Testes unitários para algoritmo de reordenação
    ├── ColumnDnD.test.tsx  # [NOVO] Testes de eventos de drag-over e drop na coluna
    └── TaskDnD.test.tsx    # [NOVO] Testes de draggable e eventos de arraste no cartão
```

---

## Phase 0: Research & Discovery
- Concluída com sucesso em [`specs/003-drag-and-drop-interaction/research.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/research.md).
- Mitigação de flickering com contador de profundidade (`dragEnterCounter`).
- Isolamento de `AutoResizeTextarea` para prevenir drag durante seleção de texto.

---

## Phase 1: Design & Contracts
- Concluída com sucesso em [`specs/003-drag-and-drop-interaction/data-model.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/data-model.md) e [`specs/003-drag-and-drop-interaction/quickstart.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/003-drag-and-drop-interaction/quickstart.md).
- Contratos de dados retrocompatíveis, preservando `TaskModel` e `metrik_kanban_tasks`.
