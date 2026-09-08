# Chapter 2: Token Efficiency

## Core Idea
Context is an expensive, finite, and degradable resource. Token efficiency is not just about reducing API costs: it directly governs the **cognitive focus and reasoning accuracy** of the language model. Bloated files and conversational fluff pollute the attention mechanism.

## Frameworks Introduced
- **The Token Budget Economy**:
  - Every token consumed by repetitive headers, verbose greetings, or duplicate data reduces the remaining attention budget for complex logical reasoning.
- **File Format Selection for Agents**:
  - *Plain Markdown (`.md`)*: The undisputed king of token efficiency. Dense, structured, clean syntax that models parse with near-zero overhead.
  - *JSON/YAML*: Useful for strict schemas, but carries punctuation and delimiter overhead (brackets, quotes). Use only when machine parsing is mandatory.
  - *DOCX/PDF/HTML*: Catastrophic for context windows when injected raw. Convert to lean Markdown before ingestion.
- **Lean Markdown Principles**:
  - Strip redundant boilerplate.
  - Use bullet points, bold tags, and compact Markdown tables.
  - Keep sections modular so the agent reads only what is relevant to the active task.

## Key Concepts
- **Attention Dilution**: When unnecessary tokens distract the self-attention heads from key constraints.
- **Context Budgeting**: Planning which files enter context before issuing a multi-turn command.

## Mental Models
- **The Telegram Economy**: Every word sent over the wire costs money and attention; eliminate adjectives, keep facts dense.

## Anti-patterns
- **Dumping Entire Codebases into Context**: Injecting 50,000 tokens of boilerplate code when the agent only needed a 200-token interface definition.
