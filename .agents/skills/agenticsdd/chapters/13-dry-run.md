# Chapter 13: Dry Run

## Core Idea
Before handing a specification to a development team or coding agent, you must test the specification itself. The **Dry Run** is a simulated execution where the AI walks through concrete user journeys, edge cases, and failure scenarios **using only the specification as its execution environment**, verifying completeness and zero-ambiguity.

## Frameworks Introduced
- **Total Recall: The Simulation Test**:
  - Start a clean agent session with *only* the feature spec and glossary in context.
  - Feed realistic, messy input data into the simulation prompt.
  - Instruct the agent:
    > *"Act as the runtime interpreter of this specification. Step through the input: [Input Data]. At each step, cite the exact section and rule in the spec that dictates your behavior. Do not assume or invent anything not written in the document."*
- **What the Dry Run Reveals**:
  - *Missing Branches*: The spec handles successful payments and declined cards, but says nothing about network timeouts during 3D Secure.
  - *Implicit State Transitions*: The spec assumes an entity moves from "Pending" to "Active" without specifying who or what triggers the event.
  - *Ambiguous Error Messages*: The spec says "return an appropriate error" without defining error codes or response schemas.
- **The Dry Run Scorecard**:
  - A spec passes the dry run only when 100% of the simulated steps are backed by explicit clauses in the text.

## Key Concepts
- **Spec Execution**: Treating the written document as executable logic before a compiler ever touches it.
- **Falsification of Completeness**: Proving the spec is incomplete by showing an input that produces an undefined state.

## Mental Models
- **The Flight Simulator Before the First Flight**: Test the emergency checklist in the simulator; do not wait until both engines flame out at 30,000 feet to discover the checklist is missing Page 4.

## Anti-patterns
- **"The Developers Will Figure It Out"**: Leaving edge cases ambiguous with the excuse that engineers will decide the business rule during coding.
