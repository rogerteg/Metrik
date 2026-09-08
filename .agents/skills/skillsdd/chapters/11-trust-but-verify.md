# Chapter 11: Trust, but Verify

## Core Idea
AI models are confident, articulate, and pathologically eager to please: they will invent answers, smooth over contradictions, and hallucinate missing constraints without hesitation. The Handler's operational motto is **Trust, but Verify**: never commit a specification without passing it through manual reviews and rigorous cross-examination protocols.

## Frameworks Introduced
- **Does AI Earn Your Trust?**:
  - No. Trust in AI is earned turn-by-turn through empirical verification, not assumed from linguistic fluency.
- **The 3 Review Checkpoints**:
  1. *Structural Review*: Are all required template sections present and filled?
  2. *Negative Space Review*: What did the AI omit? (Failure modes, network timeouts, edge cases, role permissions).
  3. *Constraint Coherence*: Do the stated numbers, limits, and schemas match the project ground truths?
- **The Polygraph Protocol (Cross-Examination)**:
  - In a fresh, clean session, present the generated specification to the AI and execute the Polygraph Test:
    - *"What assumptions are made in this specification that are not explicitly grounded in the document?"*
    - *"Identify 3 scenarios where following this specification verbatim will cause data corruption or system failure."*
    - *"What questions would a senior security engineer ask before signing off on this spec?"*

## Key Concepts
- **The Polygraph Test**: Using an adversarial prompt on a clean session to force the AI to uncover its own implicit assumptions.
- **Negative Space Analysis**: Auditing what is absent rather than just what is written.

## Mental Models
- **The Hostile Witness**: Treat the draft spec like testimony in court: probe for inconsistencies, check alibis against ground truths, and look for evasive answers.

## Anti-patterns
- **The Rubber-Stamp Approval**: Glancing at 10 pages of beautifully formatted markdown, thinking "looks great", and approving it without reading the failure scenarios.
