# Chapter 10: Artifacts

## Core Idea
Text alone is often insufficient to communicate spatial layouts, complex temporal workflows, state machines, and relational models. The **Artifact Discipline** establishes that Markdown specifications are the immutable **Source of Truth**, while visual, interactive, or code artifacts are **derived downstream representations**.

## Frameworks Introduced
- **When Text Isn't Enough**:
  - State transitions, wireframe user journeys, and dependency graphs cause cognitive overload in pure prose.
  - Generating visual and interactive artifacts (Mermaid diagrams, self-contained single-file HTML prototypes) bridges the communication gap with non-technical stakeholders.
- **The Source of Truth vs Artifacts Rule**:
  - *The Invariant Law*: The specification (`spec.md`) is ALWAYS the source of truth.
  - *Derivation Rule*: Artifacts are generated from the spec. **Never edit an HTML artifact or Mermaid diagram manually**.
  - If a change is needed in the visual representation, edit the specification and re-run the generator script.
- **The Artifact Discipline in Action**:
  - Maintain a generator script (e.g., `regen-all.py` or dedicated subagent) that consumes `specs/*.md` and deterministically produces diagrams and interactive HTML previews.

## Key Concepts
- **Derived Artifact**: A file whose contents can be completely re-created from canonical specifications.
- **Interactive Prototyping**: Generating standalone single-file HTML/JS prototypes for instant stakeholder validation.

## Mental Models
- **Compiling Source Code to Binaries**: You edit C++/Rust source files; you never edit `.exe` binaries with a hex editor. Similarly, you edit Markdown specs; you never manually patch generated HTML/SVG artifacts.

## Anti-patterns
- **The Two-Truth Dilemma**: Updating the HTML prototype in a meeting and forgetting to update the written specification, causing the dev team to build the wrong system.
