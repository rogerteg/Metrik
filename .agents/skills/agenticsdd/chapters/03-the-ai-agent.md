# Chapter 3: The AI Agent

## Core Idea
An AI agent is made of two distinct halves: the **Model (Brain)** and the **Harness (Body)**. The model is purely statistical and stateless between requests; the harness provides the tools (file I/O, bash, linter) that enable the agent to act autonomously in the physical workspace.

## Frameworks Introduced
- **The Anatomy of an Agent**:
  - *The LLM (Probabilistic Engine)*: Generates tokens based on training weights and input context. Possesses zero native persistence.
  - *The Agentic Harness (Runtime Environment)*: Intercepts tool calls, executes commands on the OS, reads files, and feeds outputs back into the conversation loop.
- **What Makes It Agentic?**:
  - The autonomous perception-action loop:
    1. Read environment state (files, git diff, terminal).
    2. Reason about the next required step.
    3. Call a tool to perform an action.
    4. Inspect tool output and self-correct.
- **All Talk, No Memory**:
  - The model does not "remember" your conversation from yesterday. What feels like memory is simply the harness re-injecting chat history or system files into the context window.
  - *Conclusion*: Any knowledge not written down in durable repository files is permanently lost upon session reset.

## Key Concepts
- **Statelessness**: The fundamental property of LLM APIs.
- **Persistent File Memory**: Using version-controlled files as external hard drives for the agent.

## Mental Models
- **The Goldfish with a Notebook**: The goldfish forgets everything every 10 seconds, but if it has a waterproof notebook (repository files) and a pencil (tools), it can execute multi-year engineering projects.

## Anti-patterns
- **Relying on Chat History as Documentation**: Treating a 100-turn chat session as the repository of project decisions instead of writing them into living Markdown specs.
