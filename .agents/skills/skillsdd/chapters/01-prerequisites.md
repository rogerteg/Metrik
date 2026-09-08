# Chapter 1: Prerequisites

## Core Idea
Agentic Spec-Driven Development is not magic: it is a professional engineering discipline. Before deploying an AI agent to build complete specifications, four foundational pillars must be firmly established: domain expertise, a tool-capable AI agent, version control, and a disciplined project structure.

## Frameworks Introduced
- **The 4 Essential Prerequisites**:
  1. **Domain Expertise (The Human in the Loop)**:
     - The AI can synthesize and structure, but only a human handler with domain knowledge can evaluate trade-offs, identify missing business rules, and validate truth.
  2. **The AI Agent (Tool Harness)**:
     - A conversational web chatbot is insufficient. The agent must have file system access, terminal execution capabilities, and a continuous tool-calling loop (such as Antigravity, Claude Code, Cursor, or Aider).
  3. **Version Control (Git Discipline)**:
     - Specifications are source code. Every modification, rule update, and artifact must be committed with meaningful messages, enabling diff auditing, rollback, and branching.
  4. **Lean Project Structure**:
     - A structured repository layout separating documentation, ground truths, rules, and generated specifications (`specs/`, `rules/`, `artifacts/`).

## Key Concepts
- **The Handler Mindset**: You are the director, judge, and auditor; the AI is the tireless researcher, drafter, and analyst.
- **Specification as Code**: Specifications must be versioned, reviewed, and tested with the same rigor applied to production code.

## Mental Models
- **The Architect and the Drafter**: An architect without civil engineering knowledge cannot review blueprints; an architect who draws every line by hand is inefficient. The handler directs the CAD system (AI) with domain precision.

## Anti-patterns
- **The Naive Outsourcing**: Handing a one-sentence prompt to an AI and expecting it to discover the regulatory, financial, and technical constraints of an enterprise system alone.
