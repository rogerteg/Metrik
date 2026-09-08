# Chapter 14: Interactive Wiki

## Core Idea
Linear documents of 50 pages are where specifications go to die: executives don't read them, developers skim them, and QA misses edge cases. An **Interactive Wiki** transforms static Markdown specs into a living, navigable, interconnected knowledge graph that stakeholders can explore dynamically.

## Frameworks Introduced
- **The Single-File Interactive Wiki**:
  - A generated, zero-dependency HTML file containing embedded search, hyperlinked glossary tooltips, Mermaid diagram visualizers, and collapsible scenario walkthroughs.
  - Can be emailed, attached to Jira, or hosted on internal static buckets without server setups.
- **Key Features of the Agentic Wiki**:
  1. *Glossary Hovercards*: Hovering over domain terms instantly displays the canonical definition from `glossary.md`.
  2. *Interactive State Walkthroughs*: Stepping through user stories with visual state highlights.
  3. *Traceability Matrix*: Clickable cross-links between Business Requirements, Functional Specs, and Verification Tests.
- **Automating Wiki Generation**:
  - The AI agent maintains the build script that compiles `specs/*.md` into the interactive portal whenever specs are updated.

## Key Concepts
- **Knowledge Accessibility**: Lowering the barrier to entry so product managers, designers, and engineers review the same living document.
- **Self-Contained Artifact**: An interactive portal packed into a single portable file.

## Mental Models
- **Wikipedia vs a Stacks Warehouse**: Nobody wants to dig through 50 filing cabinets; people want a hyperlinked web where clicking a concept reveals its context instantly.

## Anti-patterns
- **Locking Specs in Proprietary Confluence/Notion Silos**: Storing specs in web tools disconnected from version control, making automated AI auditing and Git diffing impossible.
