# Requirements Quality Checklist: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso

**Purpose**: Requirements-quality review ("Unit Tests for Requirements") for Feature 058  
**Created**: 2026-11-12  
**Feature**: [`specs/058-flow-leverage-simulator/spec.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/058-flow-leverage-simulator/spec.md)  

**Review Ownership**: This checklist is a reviewer-owned requirements-quality review artifact. Mark an item `[x]` only when the reviewer determines the requirements-quality criterion is satisfied.  
**Marker Semantics**: `[x]` means the criterion has been reviewed and satisfied for requirements quality. It does not mean implementation work is complete.  

---

## 1. Mathematical Rigor & Little's Law Formulation

- [x] CHK001 Are the boundary conditions for Little's Law ($WIP = Throughput \times Cycle\ Time$) specified when simulated WIP approaches zero? [Clarity, Spec §FR-003]
- [x] CHK002 Is the baseline calculation for Average Daily Throughput explicitly defined over a reproducible historical window (e.g., 30/60/90 days)? [Completeness, Spec §FR-003, Plan §Summary]
- [x] CHK003 Is the mathematical relationship between Cycle Time reduction and P85 completion date projection objectively testable? [Measurability, Spec §SC-002]
- [x] CHK004 Does the specification define a minimum physical floor for Cycle Time to prevent unrealistic zero-day simulations? [Edge Case, Plan §Research §2]

---

## 2. Cascade Impact & Graph Traversal Completeness

- [x] CHK005 Are all directional relationship types (`blocks`, `is_blocked_by`, `parent`, `child`) explicitly mapped in the cascade traversal contract? [Completeness, Spec §FR-001]
- [x] CHK006 Is the cycle detection requirement defined with non-crashing behavior when circular dependencies occur? [Coverage, Spec §Edge Cases, Research §1]
- [x] CHK007 Does the spec define deduplication rules when two or more upstream blockers impact the same downstream task? [Consistency, Spec §Edge Cases]
- [x] CHK008 Is the formulation for Cost of Delay in extra P85 days verified without requiring manual economic inputs? [Clarity, Spec §Clarifications, Research §1]

---

## 3. Sandbox Isolation & Safety Governance (Constitution X)

- [x] CHK009 Is the in-memory Sandbox isolation explicitly specified to guarantee zero persistent changes to the board during simulation? [Completeness, Spec §FR-007, Spec §SC-004]
- [x] CHK010 Are role-based permissions specified so that guest/read-only users cannot apply simulated WIP limits? [Coverage, Spec §Edge Cases, Plan §Research §2]
- [x] CHK011 Does the specification prohibit automatic application of simulated parameters upon closing the simulator? [Consistency, Spec §Clarifications, Spec §FR-007]

---

## 4. User Experience, Performance & Offline Continuity

- [x] CHK012 Are user-facing latency targets quantified for UI updates (<50ms) and Mika offline heuristics (<10ms)? [Measurability, Spec §SC-002, Spec §FR-005]
- [x] CHK013 Is the navigation contract between Mika's advisory CTA and the Forecasting Hub specified to preserve active scope without manual reselection? [Completeness, Spec §FR-006, Spec §SC-003]
- [x] CHK014 Are interactive task mentions in Mika's responses defined as clickable `#ID` chips without causing autonomous card mutations? [Consistency, Spec §FR-004, Constitution X]
- [x] CHK015 Is the location of the Flow Leverage Simulator explicitly unified within the Forecasting Hub (`MonteCarloSimulationView`)? [Clarity, Spec §Clarifications, Spec §FR-002]

---

## 5. Sample Confidence & Edge Case Handling

- [x] CHK016 Is the NIST sample warning ($N < 10$ delivery days) required across both the visual simulator and Mika's chat responses? [Consistency, Spec §FR-008, Spec §Edge Cases]
- [x] CHK017 Does the spec define the exact system behavior when a board has zero active blockers and zero dependency links? [Coverage, Spec §US1 §Scenario 3]
- [x] CHK018 Are tie-breaking rules specified when two leverage items yield the same P85 day delta? [Clarity, Data Model §3]

---

## Notes

- Mark items `[x]` only after review confirms the requirement-quality criterion is satisfied.
- Leave items unchecked when they still require clarification, correction, or reviewer evaluation.
- `/speckit-implement` reads checklist checkbox state as a gate and must not modify markers.
- `checklists/requirements.md` has a separate built-in lifecycle maintained by `/speckit-specify` and `/speckit-clarify`.

