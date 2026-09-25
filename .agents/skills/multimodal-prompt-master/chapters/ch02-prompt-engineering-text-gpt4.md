# Chapter 2: The Art of Prompt Engineering for Text with GPT-4

## Core Idea
High-quality GPT-4 output is a function of prompt precision and clarity. A good prompt sets a clear stage: it tells the model the tone, context, and desired outcome before asking for the response.

## Frameworks Introduced
- **GPT-4 Language Mastery** — the three capabilities to lean on:
  - **Contextual Understanding**: retains context across exchanges; produces contextually relevant, not just grammatical, responses.
  - **Creativity and Flexibility**: mimics literary styles while balancing imagination with coherent structure.
  - **Scalability**: scales from brief prompts to long, multipart instructions.
- **Effective Text Prompt Strategies** — three moves:
  - **Clarity and Specificity**: start with a clear directive; avoid ambiguous language.
  - **Contextual Details**: provide background and key terminology that signal style and depth.
  - **Structured Prompts**: organize the prompt logically.
- **The Structured Prompt Format (A–B–C)** — a reusable skeleton:
  - **A. Introduction**: briefly explain the scenario or problem.
  - **B. Task**: specify the desired output or format.
  - **C. Constraints**: list particular guidelines or constraints.
- **Advanced Text Techniques**:
  - **Few-Shot Prompting**: include a few examples to demonstrate the style/format you want.
  - **Zero-Shot Prompting**: rely on clear, well-defined instructions without examples.
  - **Chain-of-Thought Prompts**: ask the model to break complex problems into steps.
  - **Creative Reframing**: rephrase the prompt or approach it from a new angle; use analogies/metaphors.
  - **Iterative Refinement**: review outputs and tweak tone, detail, or ambiguity in the prompt.

## Key Concepts
- **Prompt as stage-setting**: the prompt establishes tone, context, and expected outcome.
- **Tone/style markers**: explicit labels (e.g., playful, formal, poetic) that steer narrative style.
- **Feedback loop**: output review → prompt adjustment → better output.

## Mental Models
- **Use the A–B–C format when the task is non-trivial**: introduction, task, constraints removes almost all ambiguity.
- **Use Few-Shot when format matters and Zero-Shot when intent is obvious**: examples teach *shape*; instructions convey *goal*.
- **Use Chain-of-Thought for puzzles, plans, and multi-layer narratives**: decomposition beats one-shot answers.
- **Treat prompting as a loop, not a one-shot**: the first output is a draft, the prompt is the lever.

## Anti-patterns
- **Ambiguous, underspecified prompts**: GPT-4 cannot target an outcome the prompt never states.
- **Missing context for nuanced tasks**: skipping background yields generic answers.
- **Unstructured walls of text**: burying the task inside prose makes the model guess what matters.
- **Never iterating**: accepting the first output throws away the biggest quality gain.

## Prompt Templates
```text
A. Introduction: <briefly explain the scenario or problem>
B. Task: <specify the exact output or format you want>
C. Constraints: <list guidelines, length, tone, exclusions>
```
```text
Write a <tone> narrative about <subject>.
Requirements: <...>
Constraints: <...>
```

## Worked Example
For a text-based creative task: apply **Structured Prompts** (A/B/C) to set scene and constraints, add a **Few-Shot** example if the format is unusual, and use **Chain-of-Thought** if the task involves reasoning or planning. Then **Iteratively Refine** based on the first output rather than rewriting the prompt from scratch.

## Key Takeaways
1. Precision in equals precision out — state tone, context, and format up front.
2. The A–B–C structure is the default skeleton for any serious request.
3. Choose Few-Shot vs Zero-Shot by whether the *format* needs demonstrating.
4. Chain-of-Thought unlocks planning and multi-step tasks.
5. Reframing and iteration turn a mediocre output into a strong one.

## Connects To
- **Ch 1**: GPT-4 is the linguistic backbone of the Specialized Trio.
- **Ch 3 / Ch 4**: the same clarity-and-structure discipline maps to visual and audio prompts.
- **Ch 5**: text is often the cue that sets the cross-modal theme.
