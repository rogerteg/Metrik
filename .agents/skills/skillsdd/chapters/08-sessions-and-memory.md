# Chapter 8: Sessions and Memory

## Core Idea
The chat session is transient and prone to **Context Rot**; the repository file system is durable, verifiable, and permanent. The master skill of the AI Handler is knowing when to discard the chat session and how to maintain continuity exclusively through file-based memory and triangulation.

## Frameworks Introduced
- **The Context Rot Curve**:
  - As a session passes 30-50 turns, token accumulation fills the attention window with tool outputs, obsolete attempts, and chat artifacts.
  - *Symptoms of Context Rot*: Hallucinations, forgetting early rules, lazy answers, repetitive loops, and regression bugs.
- **The Session Reset Protocol**:
  - Write current progress, decisions, and open questions to a structured file (e.g., `specs/progress.md` or task files).
  - Issue `/reset`, `/clear`, or restart the agent session.
  - Provide a concise resumption prompt pointing to the state file.
- **Triangulation Across Files**:
  - Never dump an entire system into one mega-document.
  - Structure knowledge into triangulated nodes:
    1. *Glossary (`glossary.md`)*: Defines terms and domain ontology.
    2. *Ground Truths (`project-context.md`)*: Immutable architectural/business facts.
    3. *Functional Spec (`specs/feature.md`)*: The active specification under design.
    The agent reads these three lightweight files to achieve perfect contextual triangulation in under 5,000 tokens.

## Key Concepts
- **Context Rot**: Progressive degradation of AI reasoning quality as context fills up.
- **Triangulation**: Reconstructing complete situational awareness from 3 targeted files instead of one giant context dump.

## Mental Models
- **Clearing the Whiteboard**: At the end of every design meeting, you photograph the whiteboard, wipe it completely clean, and start the next meeting with fresh markers.

## Anti-patterns
- **The 200-Turn Mega Session**: Keeping a single chat window open for 3 weeks until the AI hallucinates basic project facts.
