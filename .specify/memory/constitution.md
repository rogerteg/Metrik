<!--
Sync Impact Report:
- Version change: Uninitialized Template → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Specification-Driven Development (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. Code Quality & Modularity
  - [PRINCIPLE_3_NAME] → III. Automated Verification & Testing
  - [PRINCIPLE_4_NAME] → IV. Observability & Structured Logging
  - [PRINCIPLE_5_NAME] → V. Simplicity & YAGNI
- Added sections:
  - Security & Technical Standards
  - Development Workflow & Quality Gates
- Removed sections: None
- Follow-up TODOs: None (all placeholders populated)
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

## Security & Technical Standards

Secrets, API keys, and sensitive environment variables MUST NEVER be committed to source control. Code and automation scripts MUST maintain cross-platform compatibility, with explicit support for Windows environments and PowerShell execution.

## Development Workflow & Quality Gates

Every implementation task MUST be verified against defined acceptance criteria before marking it complete. If implementation discovers unforeseen architectural complexities or requirement changes, the project artifacts MUST be updated and re-synced (`/speckit-plan` or `/speckit-converge`) prior to proceeding.

## Governance

This Constitution serves as the primary governance document for Metrik and supersedes informal practices. Amendments MUST be documented, assigned appropriate semantic version updates, and ratified by project owners before taking effect.

**Version**: 1.0.0 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-09-08
