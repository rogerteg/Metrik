# Chapter 9: Glossary

## Core Idea
In human-AI collaboration, linguistic ambiguity is the primary vector of silent failures. Words like "account", "transaction", "order", or "session" carry subtle differences across departments. A project-level **Glossary** is not an optional dictionary: it is a **Ground Truth canonical ontology** that anchors agent reasoning.

## Frameworks Introduced
- **Lost in Translation (The Cost of Ambiguity)**:
  - When an AI agent sees the word "client", does it mean the browser frontend, the HTTP caller, or the human customer paying the bill?
  - Undetected semantic drift cascades into contradictory requirements and broken data models.
- **The Project Glossary Architecture**:
  - Located at `glossary.md` (or `.agents/glossary.md`).
  - Contains strictly:
    - *Term*: Canonical name.
    - *Definition*: Single, unambiguous meaning in the project.
    - *Aliases/Synonyms*: Deprecated or alternative terms explicitly mapped to the canonical term.
    - *Anti-Definitions*: What the term explicitly does NOT mean.
- **The Disambiguation Protocol**:
  - Whenever the agent encounters an ambiguous or overloaded noun:
    1. Check `glossary.md` for the established definition.
    2. If missing or conflicting, trigger the disambiguation question to the human handler.
    3. Update `glossary.md` with the newly ratified definition before drafting specifications.

## Key Concepts
- **Ubiquitous Language (Domain-Driven Design)**: Enforcing identical terminology across stakeholders, handlers, agents, and code.
- **Canonical Term Mapping**: Forbidding synonym sprawl within project documentation.

## Mental Models
- **The Legal Definitions Clause**: A commercial contract always starts with Section 1: Definitions ("For the purposes of this Agreement, 'Buyer' shall mean..."); without this, lawsuits occur.

## Anti-patterns
- **Permitting Free-Form Synonyms**: Allowing one spec to say "Client", another "Buyer", and a third "Subscriber" for the exact same entity.
