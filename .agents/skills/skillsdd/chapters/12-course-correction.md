# Chapter 12: Course Correction

## Core Idea
Specifications are not stone tablets carved at Mount Sinai: they are living engineering documents that evolve as domain constraints, user feedback, and technical realities change. **Course Correction** is the disciplined method for updating Ground Truths and propagating cascading changes through the specification graph without breaking consistency.

## Frameworks Introduced
- **Ground Truths as Invariant Anchors**:
  - Ground truths live in central files (`project-context.md`, `constitution.md`).
  - When a fundamental premise changes (e.g., changing payment provider from Stripe to Adyen, or moving SLA from 99.9% to 99.99%), you do not randomly patch individual specs.
- **The 3-Step Course Correction Protocol**:
  1. *Step 1: Update the Ground Truth File*: Commit the change with an explanation of the business reason.
  2. *Step 2: Impact Analysis (The Blast Radius)*: Run the agent in Analyze mode to identify every specification that references or depends on the altered ground truth.
  3. *Step 3: Harmonization (Cascading Updates)*: Systematically update affected specs, keeping changelog entries in each file.
- **The Full Audit Protocol**:
  - A comprehensive scheduled scan where the AI checks the entire `specs/` directory for stale terms, broken cross-references, and orphaned rules.

## Key Concepts
- **Blast Radius**: The complete set of downstream specifications, tests, and artifacts affected by a single upstream decision change.
- **Ground Truth Drift**: The dangerous state where code and specs follow outdated assumptions because a decision was communicated verbally but never updated in the ground truth file.

## Mental Models
- **Updating the Compass Bearing**: If the ship's destination changes by 2 degrees, the navigator doesn't just turn the wheel blindly; they recalculate waypoints, fuel consumption, and arrival times.

## Anti-patterns
- **Patching the Branch, Forgetting the Root**: Changing a business rule inside one feature spec while leaving the project context and glossary asserting the old contradictory rule.
