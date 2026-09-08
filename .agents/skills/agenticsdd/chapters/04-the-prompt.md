# Chapter 4: The Prompt

## Core Idea
Prompting an agent is not about writing poetic prose: it is about selecting the right **cognitive mode**, declaring **intent over micro-instructions**, establishing **unbreakable guardrails**, and setting **precise triggers**.

## Frameworks Introduced
- **The 7 Prompt Modes**:
  1. **Command**: Direct imperative action (*"Run unit tests and report failures"*).
  2. **Research**: Exploratory investigation across files or documentation (*"Inspect existing auth modules and summarize token expiration logic"*).
  3. **Suggest**: Divergent brainstorming (*"Propose 3 alternative database schemas for audit logging"*).
  4. **Draft**: Synthesis into concrete specifications (*"Draft the functional spec for the checkout retry queue"*).
  5. **Analyze**: In-depth inspection for gaps or contradictions (*"Audit this spec against GDPR Article 17 requirements"*).
  6. **Explain**: Deconstruction for human understanding (*"Explain why this race condition occurs in the payment webhook"*).
  7. **Critique**: Rigorous peer review (*"Red-team this spec; identify 5 points of failure"*).
- **Intent Over Instruction**:
  - Tell the model *what outcome you need and why*, along with constraints, rather than micromanaging every mouse click. The model excels at finding optimal paths when the destination is unambiguous.
- **Guardrails & Triggers**:
  - *Guardrail*: Inviolable negative constraints (*"Do not modify files outside `specs/`"*).
  - *Trigger*: Conditional rules (*"Whenever a financial amount is introduced, trigger the multi-currency validation rule"*).

## Key Concepts
- **Mode Switching**: Explicitly stating the mode in the prompt prevents the model from jumping into unsolicited code drafting when you only wanted research.
- **Cognitive Framing**: Setting the mental role and boundaries before the task prompt.

## Mental Models
- **The Flight Director at Mission Control**: The director doesn't steer the thrusters manually; they declare the orbit trajectory, set abort criteria, and command subsystems.

## Anti-patterns
- **The Kitchen Sink Prompt**: Asking the agent in a single prompt to research, suggest, draft, critique, and code an entire subsystem.
