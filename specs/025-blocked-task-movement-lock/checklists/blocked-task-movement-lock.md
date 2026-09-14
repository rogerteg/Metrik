# Domain Requirements Review Checklist: Trava Estrita de Movimentação para Cartões Bloqueados (025-blocked-task-movement-lock)

**Purpose**: Requirements-quality review checklist ("Unit Tests for English") to validate completeness, clarity, relational integrity, and constitutional compliance before technical planning.  
**Created**: 2026-09-14  
**Status**: Validated  
**Feature**: [spec.md](../spec.md)  

**Review Ownership**: This checklist is a reviewer-owned requirements-quality review artifact. Mark an item `[x]` when the reviewer confirms the requirement-quality criterion is satisfied.  
**Marker Semantics**: `[x]` means the criterion has been reviewed and verified for requirements quality. It does not mean implementation is complete.

---

## 1. Regra Fundamental de Bloqueio & Prevenção de Movimentação (Fundamental Movement Lock)

- [x] CHK001 Is the veto on moving blocked tasks between different columns absolute and universally enforced across all entry points? [Strict Lock, Spec §FR-003, FR-004]
- [x] CHK002 Does the spec mandate `draggable="false"` on the entire task card element and sub-elements while blocked? [Drag Prevention, Spec §FR-001]
- [x] CHK003 Is drag initialization intercepted at `onDragStart` via explicit `e.preventDefault()` when a task is blocked? [Event Interception, Spec §FR-002]
- [x] CHK004 Does `reorderOrMoveTask` and `reorderBoard` reject inter-column transitions for blocked tasks, retaining original column without state corruption? [Domain Guard, Spec §FR-004]
- [x] CHK005 Are lateral column movement buttons (`←` and `→`) strictly disabled or hidden for blocked cards? [Button Inactivity, Spec §FR-005]
- [x] CHK006 Is vertical reordering strictly confined within the SAME column without allowing column transitions? [Same-Column Exception, Spec §2/US1, Clarification 1]

---

## 2. Gestão e Sincronização da Etiqueta de Bloqueado (Lock Tag & Badge Management)

- [x] CHK007 Is a direct 1-click quick unlock action specified for the `⛔ Bloqueado` badge on the card surface? [Quick Unlock, Spec §FR-007, Clarification 2]
- [x] CHK008 Is unlocking via the *"Desbloquear Tarefa"* button in `TaskDetailsModal` fully supported with timestamp reconciliation? [Modal Unlock, Spec §FR-006]
- [x] CHK009 Does the spec establish automatic bidirectional synchronization between the tag `"bloqueado"` / `"blocked"` and `task.blocked = true`? [Tag Synchronization, Spec §FR-006]
- [x] CHK010 Is immediate movement unlock guaranteed upon tag/badge removal without requiring a page reload? [Instant Unlock, Spec §2/US2]

---

## 3. Feedback Visual, Usabilidade e Acessibilidade (Visual Feedback & UX)

- [x] CHK011 Does the card display a `cursor: not-allowed` affordance when hovered while in a blocked state? [Visual Affordance, Spec §FR-001, NFR-002]
- [x] CHK012 Is a gentle, contextual Toast / Tooltip warning notification specified upon any attempted blocked card move? [User Feedback, Spec §3/US3, Clarification 3]
- [x] CHK013 Are accessibility attributes (`aria-disabled="true"`, descriptive `aria-label`) explicitly mandated for blocked cards? [Accessibility, Spec §NFR-002]
- [x] CHK014 Are intrusive modal popups avoided for standard drag attempts, maintaining smooth interaction flow? [Non-Intrusive UX, Clarification 3]

---

## 4. Integridade de Métricas e Persistência Local-First (Flow Metrics & Persistence)

- [x] CHK015 Is cumulative blocked time continuously tracked in `totalBlockedMs` to feed Flow Efficiency, CFD, and Lead/Cycle Time charts? [Metrics Integrity, Spec §FR-008]
- [x] CHK016 Are `blockedAt` timestamps systematically created upon lock and reconciled upon unlock? [State Consistency, Spec §FR-008]
- [x] CHK017 Is block state immediately and idempotently persisted to `localStorage` under the active board schema? [Local-First, Spec §NFR-003, Constitution VIII]
- [x] CHK018 Are race conditions prevented during board state synchronization and active board transitions? [Defensive Persistence, Constitution I, III]

---

## Notes

- All 18 review checkpoints (CHK001 to CHK018) have been reviewed and verified against `spec.md` and the three ratified decisions from `/speckit-clarify`.
- The checklist validates requirement quality, edge case coverage, and constitutional compliance prior to technical planning.
