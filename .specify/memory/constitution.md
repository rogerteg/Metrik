<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.2.0
- List of modified principles:
  - Added: VII. Brand Independence & Clean Identity (NON-NEGOTIABLE)
- Added sections: None
- Removed sections: None
- Follow-up TODOs: None
-->

# Metrik Constitution

## Core Principles

### I. Specification-Driven Development (NON-NEGOTIABLE)
All features, architectural updates, and non-trivial changes MUST start with a formal specification (`spec.md`), technical plan (`plan.md`), and task breakdown (`tasks.md`) prior to writing production code. Implementing code without a preceding specification or task is strictly prohibited.

### II. Code Quality & Modularity
Modules MUST be self-contained, single-purpose, and loosely coupled with clean interfaces. Code bases MUST maintain comprehensive inline documentation, clear boundaries, and zero circular dependencies.

### III. Automated Verification & Testing
All feature additions, bug fixes, and critical paths MUST be verified by unit tests or automated test scripts. Code modifications are not complete until build, lint, and automated verification suites pass clean.

### IV. Observability & Structured Logging
Systems MUST implement structured logging, clear error reporting, and informatively fail-fast behavior. Terminal outputs and diagnostic logs MUST enable quick root-cause analysis without requiring debuggers.

### V. Simplicity & YAGNI
Implement the simplest complete solution that satisfies the specification requirements. Speculative functionality, premature optimizations, and unrequested abstraction layers are strictly forbidden.

### VI. Analytical Reasoning Pre-Task Creation (NON-NEGOTIABLE)
Prior to creating, decomposing, or formalizing ANY set of implementation tasks (in `tasks.md`, issue trackers, sub-agent task allocations, or execution plans), the agent or engineer MUST formulate and output explicit **Analytical Reasoning Models**. Every task breakdown MUST be preceded by:
1. **First-Principles Thinking**: Isolating irreducible requirements and business invariants.
2. **Inversion & Premortem Analysis**: Mapping catastrophic failure modes, race conditions, and contract regressions before writing tasks.
3. **MECE Validation**: Ensuring tasks are Mutually Exclusive (zero overlap/duplication) and Collectively Exhaustive (100% acceptance criteria coverage).
4. **Tree of Thoughts & Trade-off Pruning**: Evaluating alternative implementation branches with explicit criteria for pruned paths.
5. **Falsifiability & TDD (Red-Bar First)**: Defining objective, automated verification criteria that fail before implementation and pass upon completion.
Tasks generated without this preceding analytical reasoning are null, void, and violate project governance.

### VII. Brand Independence & Clean Identity (NON-NEGOTIABLE)
Metrik is an autonomous, standalone enterprise Kanban and Flow Analytics product. The codebase, user interface, tooltips, chart legends, labels, CSS tokens, and internal source code comments MUST maintain strict brand independence:
1. **Zero Third-Party Brand Leaks**: External inspiration products, benchmark tools, or vendor brand names (such as Businessmap, ActionableAgile, etc.) are purely conversational references and MUST NEVER be leaked into visible UI text, chart subtitles, DOM attributes, or source code comments.
2. **Proprietary & Canonical Terminology**: All flow concepts must be expressed using standardized lean/agile and scientific terminology (e.g., *Cumulative Flow Diagram*, *Cycle Time Scatter Plot*, *Little's Law*, *Dual WIP/Lead Time Inspection*, *NIST Percentiles*, *Metrik Design System*).

## Security & Technical Standards

Secrets, API keys, and sensitive environment variables MUST NEVER be committed to source control. Code and automation scripts MUST maintain cross-platform compatibility, with explicit support for Windows environments and PowerShell execution.

## Development Workflow & Quality Gates

Every implementation task MUST be verified against defined acceptance criteria before marking it complete. If implementation discovers unforeseen architectural complexities or requirement changes, the project artifacts MUST be updated and re-synced (`/speckit-plan` or `/speckit-converge`) prior to proceeding.

## Governance

This Constitution serves as the primary governance document for Metrik and supersedes informal practices. Amendments MUST be documented, assigned appropriate semantic version updates, and ratified by project owners before taking effect.

**Version**: 1.2.0 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-09-11
