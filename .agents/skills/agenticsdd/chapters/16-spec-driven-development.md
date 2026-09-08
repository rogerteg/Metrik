# Chapter 16: Spec-Driven Development

## Core Idea
The culmination of the entire method: **Agentic Spec-Driven Development** unites the Handler, the AI Agent, Durable Rules, Ground Truths, and Quality Gates into an end-to-end engineering methodology. Code is never written in a vacuum: code is the mechanical compilation of an airtight, verified, and living specification.

## Frameworks Introduced
- **The Complete Agentic SDD Lifecycle**:
  ```text
  1. VISION & GROUND TRUTHS
     ├── Project Context & Constitution (`project-context.md`)
     └── Canonical Glossary (`glossary.md`)
            │
            ▼
  2. AGENTIC SPECIFICATION DRAFTING
     ├── Handler directs with 7 Prompt Modes (Intent Over Instruction)
     ├── AI explores, drafts, and analyzes against Durable Rules
     └── Conflicts logged and resolved in `rule-conflict-log.md`
            │
            ▼
  3. ARTIFACT GENERATION & STAKEHOLDER ALIGNMENT
     ├── Derived visual diagrams & Interactive Wiki generated
     └── Stakeholders validate user journeys and edge cases
            │
            ▼
  4. RIGOROUS VERIFICATION
     ├── The Polygraph Test (Adversarial cross-examination)
     └── The Dry Run (Simulated execution with realistic data)
            │
            ▼
  5. CLOSING PASS & QUALITY GATES
     └── Sweep, triage, zero-TODO validation -> Status: RFI (Ready for Implementation)
            │
            ▼
  6. AGENTIC IMPLEMENTATION
     └── Coding agents implement against the airtight spec using TDD
  ```
- **The Economic Advantage of Agentic SDD**:
  - Finding a requirement bug during coding costs 10x more; finding it in production costs 100x more.
  - Agentic SDD eliminates 90% of requirement ambiguities in hours, enabling autonomous coding agents to implement features with near-zero hallucinations and zero rework.

## Key Concepts
- **Specification as the Single Source of Truth**: When code diverges from the spec, either the code is buggy or the spec must be formally updated first via Course Correction.
- **The True Power of AI in Software**: AI's highest leverage is not autocompleting syntax: it is exploring, stress-testing, and finalizing comprehensive specifications before expensive code is written.

## Mental Models
- **The Precision Blueprint of Aerospace Engineering**: NASA doesn't start machining rocket nozzles and "figure out the fuel pressure later"; they simulate, specify, and verify every tolerance to the micron before bending metal.

## Anti-patterns
- **Vibe Coding**: Writing code directly from vague prompts, producing a tangled ball of mud that collapses after the third feature request.
