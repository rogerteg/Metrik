# Chapter 5: Durable Rules

## Core Idea
Ad-hoc prompt instructions vanish when sessions reset. **Durable Rules** are persistent, version-controlled guidelines that live inside the repository (e.g., in `CLAUDE.md`, `AGENTS.md`, or `.agents/rules/`), automatically enforced by the harness on every single turn.

## Frameworks Introduced
- **The Rules of Engagement**:
  - Foundational agreements: coding style, architectural boundaries, commit formats, safety prohibitions, and file conventions.
- **The Rules Trap (The Bloat & Conflict Crisis)**:
  - As teams add rules, three fatal failure modes emerge:
    1. *Rule Bloat*: Hundreds of micro-rules consume 40% of the context budget before any work starts.
    2. *Rule Conflict*: Rule A says *"Always use snake_case"*, Rule B says *"Preserve upstream camelCase API names"*, paralyzing the model.
    3. *Rule Inattention*: When bombarded with 50 rules, the model begins ignoring rules at the bottom or middle.
- **The Language of Rules**:
  - Write rules using RFC 2119 keywords: **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHOULD**, **MAY**.
  - Keep rules concise, active, and falsifiable.

## Key Concepts
- **Durable Rule**: A rule that survives session resets because it is loaded automatically from disk by the harness.
- **Falsifiability of Rules**: A rule is useless if you cannot definitively prove whether the AI complied with or violated it.

## Mental Models
- **The Constitution vs City Ordinances**: Keep the durable rules file constitutional (high-level, invariant, lean); move transient implementation guidelines to specific task files.

## Anti-patterns
- **Adding a Rule for Every Single Bug**: Treating rules as a database of past mistakes, resulting in a 2,000-line unmaintainable rules document.
