# Chapter 7: Auditability

## Core Idea
Autonomy without auditability is negligence. In Agentic SDD, every significant decision, rule arbitration, and specification change must leave a transparent, human-verifiable audit trail in version-controlled markdown files.

## Frameworks Introduced
- **The Audit Trail Hierarchy**:
  - *Git Commits*: Coarse-grained chronological history of changes.
  - *Rule Conflict Log*: Ledger of disputed directives and human resolutions.
  - *Specification Changelogs*: Contextual record of business rule evolution.
- **Anatomy of a Durable Rule**:
  Every rule must contain:
  - `ID`: Unique identifier (e.g., `RULE-ARCH-001`).
  - `Statement`: Unambiguous prescription using MUST/SHOULD.
  - `Rationale`: Why the rule exists.
  - `Verification`: How to audit compliance.
- **The Rule Conflict Log in Action**:
  When Rule X conflicts with Rule Y:
  1. Agent pauses execution.
  2. Agent logs the conflict with context in `rule-conflict-log.md`.
  3. Agent prompts the human handler for arbitration.
  4. Decision is recorded, and the conflicting rules are harmonized.

## Key Concepts
- **Transparent Provenance**: Knowing exactly who (human or AI) originated each requirement and rule.
- **Frictionless Auditing**: Formats that human reviewers can scan in under 60 seconds.

## Mental Models
- **The Flight Data Recorder (Black Box)**: When an unexpected behavior occurs, engineers don't guess: they inspect the telemetry log to find the exact branch point.

## Anti-patterns
- **Silent Rule Overrides**: The AI encounters conflicting instructions, arbitrarily picks one, and generates an entire spec without telling the handler.
