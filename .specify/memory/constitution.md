<!--
Sync Impact Report:
- Version change: 1.6.2 → 1.6.3
- Bump rationale: PATCH (Governance validation and non-semantic alignment following Feature 037 Task Details Activity & Objective Fields Redesign).
- List of modified principles: None (All 9 core principles validated).
- Added sections: None
- Removed sections: None
- Expanded sections: None
- Follow-up TODOs: None
-->

# Metrik Constitution

## Core Principles

### I. Specification-Driven Development (NON-NEGOTIABLE)
All features, architectural updates, and non-trivial changes MUST start with a formal specification (`spec.md`), technical plan (`plan.md`), and task breakdown (`tasks.md`) prior to writing production code. Implementing code without a preceding specification or task is strictly prohibited.

### II. Code Quality & Modularity
Modules MUST be self-contained, single-purpose, and loosely coupled with clean interfaces. Code bases MUST maintain comprehensive inline documentation, clear boundaries, and zero circular dependencies.

### III. Automated Verification & Testing
All feature additions, bug fixes, and critical paths MUST be verified by automated tests or automated verification scripts. A change is not complete until the project's executable verification suites — `npm run test` (Vitest) and `npm run build` (TypeScript + Vite) — pass with zero failures and zero errors. If a linter or static-analysis gate is configured in the project, it MUST also pass clean; while no such gate is configured, no lint obligation exists. Manual inspection alone NEVER constitutes verification.

### IV. Observability & Structured Logging
Failure modes MUST be explicit, diagnosable, and fail fast. Systems MUST implement structured logging and clear error reporting using a stable, greppable diagnostic prefix (`[Metrik]`, `[Metrik Guard]`) and MUST include the actionable context required to identify the cause — operation, entity identifiers, and the violated rule. Errors MUST NOT be silently swallowed on user-facing or data-mutating paths; a defensive path that intentionally ignores a failure MUST document why at the call site. Diagnostic output MUST be sufficient to reach root cause without attaching a debugger.

### V. Simplicity & YAGNI
Implement the simplest complete solution that satisfies the specification requirements. Speculative functionality, premature optimizations, and unrequested abstraction layers are strictly forbidden.

### VI. Analytical Reasoning Pre-Task Creation (NON-NEGOTIABLE)
Prior to creating, decomposing, or formalizing ANY set of implementation tasks (in `tasks.md`, issue trackers, sub-agent task allocations, or execution plans), the agent or engineer MUST formulate and output explicit **Analytical Reasoning Models**. Every task breakdown MUST be preceded by:
1. **First-Principles Thinking**: Isolating irreducible requirements and business invariants.
2. **Inversion & Premortem Analysis**: Mapping catastrophic failure modes, race conditions, and contract regressions before writing tasks.
3. **MECE Validation**: Ensuring tasks are Mutually Exclusive (zero overlap/duplication) and Collectively Exhaustive (100% acceptance criteria coverage).
4. **Tree of Thoughts & Trade-off Pruning**: Evaluating alternative implementation branches with explicit criteria for pruned paths.
5. **Falsifiability & TDD (Red-Bar First)**: Defining objective, automated verification criteria that fail before implementation and pass upon completion.
6. **Triangulation Adversarial & Verification**: Auditing tasks against simplicity, modularity, and security rules.
Tasks generated without this preceding analytical reasoning are null, void, and violate project governance.

### VII. Brand Independence & Clean Identity (NON-NEGOTIABLE)
Metrik is an autonomous, standalone enterprise Kanban and Flow Analytics product. The codebase, user interface, tooltips, chart legends, labels, CSS tokens, and internal source code comments MUST maintain strict brand independence:
1. **Zero Third-Party Brand Leaks**: External inspiration products, benchmark tools, or vendor brand names (such as Businessmap, ActionableAgile, ClickUp, etc.) are purely conversational references and MUST NEVER be leaked into visible UI text, chart subtitles, DOM attributes, or source code comments.
2. **Proprietary & Canonical Terminology**: All flow concepts must be expressed using standardized lean/agile and scientific terminology (e.g., *Cumulative Flow Diagram*, *Cycle Time Scatter Plot*, *Little's Law*, *Dual WIP/Lead Time Inspection*, *NIST Percentiles*, *Metrik Design System*).

### VIII. Local-First Sovereignty, Hybrid Cloud Sync & Squad Board Isolation (NON-NEGOTIABLE)
Metrik operates under a strict Local-First privacy and data sovereignty model with Team-Based Access Control (TBAC):
1. **Autonomous Local Persistence**: Core capabilities, state management, session switching, and board telemetry MUST function client-side in `localStorage` without mandating cloud dependencies or external authentication servers.
2. **Strict Squad Confidentiality & Isolation**: Kanban boards, task histories, and flow metrics belong strictly to their designated squad. A user MUST NOT have visibility into or access to any board unless they possess an active membership (`admin`, `member`) or an accepted invitation (`guest`) for that specific squad.
3. **Defense-in-Depth Enforcement**: Isolation MUST be verified at all operational tiers: state hooks (`useBoards`, `useTeamAccess`), global switchers (`BoardSwitcher`), and visual boundary guards (`RestrictedBoardFallback`).
4. **Role-Based Confinement**: Users designated with the `guest` role MUST be strictly restricted to read-only inspection, with task mutations, column reordering, and destructive operations structurally suppressed.
5. **Hybrid Cloud Synchronization (Opt-In & Fault-Tolerant)**: Metrik supports optional bidirectional synchronization with cloud databases (such as Supabase PostgreSQL). Cloud sync MUST be strictly opt-in, non-blocking, and fault-tolerant: if cloud credentials are absent, invalid, or network connectivity is severed, the system MUST operate autonomously in offline Local-First mode without crashing, throwing unhandled exceptions, or degrading user experience.
6. **Data Integrity & Conflict Minimization**: Synchronization between client `localStorage` and cloud storage MUST preserve squad isolation, workspace hierarchies, and deterministic timestamps (`createdAt`, `startedAt`, `completedAt`), ensuring local state remains authoritative during transient disconnections.

### IX. User Data Integrity, Intentional Persistence & Draft Protection (NON-NEGOTIABLE)
User textual inputs, notes, acceptance criteria, and task modifications represent critical business knowledge and MUST be safeguarded against unintentional loss:
1. **Zero Silent Data Loss (Dirty State Guard)**: Unsaved edits MUST NEVER be discarded silently. When in manual persistence mode (`autoSaveComments = false`), attempting to dismiss a modal, navigate away, or close an editing view containing unconfirmed changes MUST trigger a protective confirmation guard allowing the user to save, discard, or continue editing. Systems MUST also register window-level `beforeunload` protections to prevent loss from accidental tab or browser closure.
2. **Contextual Persistence & Ergonomic Shortcuts**: Editable fields MUST provide clear, accessible, and contextual action controls (dedicated Save/Discard buttons and universal keyboard shortcuts `Ctrl+S` / `Cmd+S` and `Escape`). Saving MUST persist cleanly into the underlying local storage without altering board positions, mutating column WIP constraints, or corrupting flow metrics.
3. **User Intent Sovereignty & Intelligent Debounce**: Global persistence settings (`autoSaveComments: boolean`) MUST be strictly respected across all board and modal components. In automatic mode, writes MUST be throttled through an intelligent debounce (default 800ms) and flushed on blur. In manual mode, automatic saves on timer or blur are strictly prohibited.
4. **Unambiguous Visual & Screen-Reader Feedback**: Editing surfaces MUST provide real-time, non-intrusive visual state indications (`dirty`, `saving`, `saved`) accompanied by accessible screen-reader announcements (`aria-live="polite"`) and smooth visual transitions with automatic dismiss after confirmation.

## Security & Technical Standards

Secrets, API keys, and sensitive environment variables MUST NEVER be committed to source control. Code and automation scripts MUST maintain cross-platform compatibility, with explicit support for Windows environments and PowerShell execution.

## Development Workflow & Quality Gates

Every implementation task MUST be verified against defined acceptance criteria before marking it complete. If implementation discovers unforeseen architectural complexities or requirement changes, the project artifacts MUST be updated and re-synced (`/speckit-plan` or `/speckit-converge`) prior to proceeding.

## Governance

This Constitution serves as the primary governance document for Metrik and supersedes informal
practices, ad-hoc conventions, and per-feature preferences.

**Amendment Procedure**:

1. Every amendment MUST be proposed with its rationale, the affected principle or section, and the
   expected impact on existing specification artifacts.
2. The proposed text MUST be ratified by the project owners before taking effect. Unratified
   proposals MUST NOT be treated as binding.
3. Ratification MUST be recorded in this file by updating the Sync Impact Report comment and the
   `Version`, `Ratified`, and `Last Amended` fields together.
4. Specifications, plans, and tasks that conflict with the amended text MUST be re-synced through
   `/speckit-plan` or `/speckit-converge` before further implementation proceeds.

**Versioning Policy** (semantic versioning):

- **MAJOR**: a principle or governance rule is removed or redefined in a backward-incompatible way,
  invalidating work approved under the previous version.
- **MINOR**: a new principle or section is added, or existing guidance is materially expanded.
- **PATCH**: clarifications, wording corrections, and non-semantic refinements that change no
  obligation.

**Compliance Review Expectations**:

- Every feature review, plan, and task set MUST verify compliance with this Constitution before the
  work is considered complete. A constitution violation is the highest-severity finding and MUST
  block completion until it is resolved or the Constitution is explicitly amended.
- New complexity, abstraction layers, and dependencies MUST be justified against Principle V; an
  unjustified addition is a compliance failure, not a stylistic preference.
- `/speckit-converge` is the designated gate for confirming that shipped code still satisfies the
  specification, the plan, and this Constitution.

**Runtime Development Guidance**: `AGENTS.md` and the skills under `.agents/skills/` define the
operative workflows, roles, and tooling for day-to-day development. They are subordinate to this
Constitution; where they conflict, this Constitution prevails.

**Version**: 1.6.3 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-09-23
