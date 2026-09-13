# Domain Requirements Review Checklist: Tipos de Tarefas, Vinculação Hierárquica e Vínculos Cross-Squad (024-task-types-and-linking)

**Purpose**: Requirements-quality review checklist ("Unit Tests for English") to validate completeness, clarity, relational integrity, and constitutional compliance before technical planning.  
**Created**: 2026-09-13  
**Feature**: [spec.md](../spec.md)  

**Review Ownership**: This checklist is a reviewer-owned requirements-quality review artifact. Mark an item `[x]` when the reviewer confirms the requirement-quality criterion is satisfied.  
**Marker Semantics**: `[x]` means the criterion has been reviewed and verified for requirements quality. It does not mean implementation is complete.

---

## 1. Tipagem de Tarefas & Representação Visual (Task Types & Visual Representation)

- [x] CHK001 Are the three work item types (`card`, `subtask`, `initiative`) unambiguously defined with their domain purpose? [Clarity, Spec §FR-001]
- [x] CHK002 Is the default assignment of `'card'` for legacy or untyped tasks explicitly defined without schema regressions? [Retrocompatibility, Spec §FR-002]
- [x] CHK003 Does the spec define the exact visual placement of the type badge (header of `TaskCard`) with icon and text? [Visual Layout, Spec §FR-003]
- [x] CHK004 Are visual contrast and theme compatibility (`dark`, `light`, `neutral`) explicitly mandated for all type badges? [Design System, Spec §2/US1]
- [x] CHK005 Is the capability to mutate/update the task type within `TaskDetailsModal` testably specified? [Interaction, Spec §FR-004]

---

## 2. Vinculação de Tarefas & Integridade Relacional (Task Linking & Relational Integrity)

- [x] CHK006 Are the five relational semantics (`parent`, `child`, `blocks`, `is_blocked_by`, `relates_to`) rigorously defined with reciprocal expectations? [Semantics, Spec §FR-005]
- [x] CHK007 Is bidirectional consistency specified when links are created or removed (e.g., A blocks B implies B is blocked by A)? [Consistency, Spec §FR-006]
- [x] CHK008 Does the spec mandate automated cleanup of orphaned link references when a linked task is deleted? [Referential Integrity, Spec §3/Edge Cases]
- [x] CHK009 Are self-linking and direct cyclic dependency prevention rules explicitly formulated? [Safety / Edge Case, Spec §3]
- [x] CHK010 Is the distinction between lightweight checklist items (`subtasks?: SubtaskModel[]`) and Kanban flow subtasks (`type: 'subtask'`) clarified without ambiguity? [Coexistence, Spec §3]

---

## 3. Vínculos Cross-Squad & Isolamento de Governança (Cross-Squad Linking & Governance)

- [x] CHK011 Is the discovery and selection flow across teams explicitly defined (Squad Alvo -> Quadro Alvo -> Tarefa Alvo)? [Completeness, Spec §FR-009]
- [x] CHK012 Does the spec clearly bound the exposure of external tasks to safe metadata (title, squad, column category), preventing unauthorized data leaks? [Privacy / TBAC, Spec §2/US3, Constitution VIII]
- [x] CHK013 Are external squad tags/chips prominently specified on both the Kanban card and details modal? [Observability, Spec §FR-010]
- [x] CHK014 Is graceful degradation specified when an external squad or board is deleted or inaccessible? [Resilience, Spec §3/Edge Cases]
- [x] CHK015 Does the spec maintain read-only constraints for `guest` users, preventing unauthorized link mutations? [RBAC, Spec §3/Edge Cases, Constitution VIII]

---

## 4. Dependências, Bloqueios (Soft Block) & Progresso de Iniciativas (Dependencies & Progress)

- [x] CHK016 Is the progress percentage calculation formula for `initiative` tasks mathematically and deterministically specified `(done_children / total_children * 100)`? [Measurability, Spec §FR-012]
- [x] CHK017 Is the visual signaling for tasks blocked by unresolved dependencies (`is_blocked_by` not in `done`) clearly specified? [Visual Signal, Spec §FR-013]
- [x] CHK018 Is the Soft Block confirmation workflow unambiguously defined when attempting to move a card with pending blockers to `done`? [Workflow, Spec §FR-014, Clarifications]

---

## Notes

- All 18 review checkpoints (CHK001 to CHK018) have been reviewed against the specification in `spec.md`.
- Items are validated for requirements quality and testability prior to generating technical architecture in `/speckit-plan`.
