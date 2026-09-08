# Chapter 15: Closing Pass

## Core Idea
Before a specification is stamped as **Ready for Implementation (RFI)**, it must undergo the **Closing Pass**: a structured multi-pass triage that sweeps for lingering placeholders, unifies formatting, verifies external links, and validates final quality gates.

## Frameworks Introduced
- **The 3 Stages of the Closing Pass**:
  1. **The Sweep**:
     - Automated grep scan for telltale placeholders: `TODO`, `TBD`, `FIXME`, `[insert ...]`, `[TBD]`, `lorem ipsum`, `???`.
     - Detection of unresolved brackets or orphaned bullet points.
  2. **The Triage**:
     - Classifying remaining open questions into:
       - *Blockers*: Must be resolved by domain experts before coding starts.
       - *Non-blockers / V2*: Moved out of the active spec into a dedicated backlog file.
  3. **Beyond Text (Schema & Contract Validation)**:
     - Verifying that all JSON schemas, OpenAPI snippets, and SQL DDL in the specification are syntactically valid and match across chapters.
- **The Quality Gate Checklist**:
  - [ ] Zero TODO/TBD markers remaining.
  - [ ] All glossary terms hyperlinked and compliant with canonical definitions.
  - [ ] Dry run simulation completed and signed off.
  - [ ] Polygraph adversarial check completed with no open vulnerabilities.

## Key Concepts
- **Closing Pass**: The formal pre-flight checklist before handing specifications to engineering.
- **Spec Debt Prevention**: Ensuring that "temporary" draft notes do not slip into production implementation.

## Mental Models
- **The Surgical Count**: Before closing the incision, the surgical team counts every sponge, needle, and instrument to guarantee nothing was left inside the patient.

## Anti-patterns
- **Shipping a Spec with "Details TBD Later"**: Leaving the security authentication protocol as a `TODO` while sending the spec to development.
