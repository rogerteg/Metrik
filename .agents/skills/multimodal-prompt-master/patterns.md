# Patterns & Techniques — Multimodal Prompt Engineering (Yash Jain)

## Structured Prompt (A–B–C)
**When to use**: Any non-trivial text request, and as the skeleton for image/audio prompts.
**How**: Write A) Introduction = scenario/problem; B) Task = desired output/format; C) Constraints = guidelines, tone, length, exclusions.
**Trade-offs**: Adds a little prompt length; massively reduces ambiguity.

## Few-Shot Prompting
**When to use**: When the *format or style* matters more than the content.
**How**: Include 2–3 representative examples inside the prompt before the actual request.
**Trade-offs**: More tokens; can bias the model toward the examples.

## Zero-Shot Prompting
**When to use**: When intent is obvious and examples would add noise.
**How**: State clear, well-defined instructions only.
**Trade-offs**: Faster/cheaper; less control over exact format.

## Chain-of-Thought (CoT)
**When to use**: Puzzles, planning, multi-layer narratives, anything with reasoning.
**How**: Explicitly ask the model to reason step by step before answering.
**Trade-offs**: Longer outputs; may expose unnecessary reasoning for simple tasks.

## Creative Reframing
**When to use**: Output is stale or hits a dead end.
**How**: Rephrase the prompt, change the angle, or introduce an analogy/metaphor.
**Trade-offs**: Can move away from the original goal if overdone.

## Iterative Refinement Loop
**When to use**: Always — treat the first output as a draft.
**How**: Generate → analyze independently and combined → adjust one variable → regenerate. Document changes.
**Trade-offs**: More iterations cost time/tokens; changing many variables at once destroys learning.

## Visual Prompt Construction Checklist
**When to use**: Every CLIP/image prompt.
**How** (in order): 1) Core Subject; 2) Descriptive Attributes (color, mood, texture); 3) Contextual Elements (time, weather, setting); 4) Optional Artistic Influences (style, era, artist).
**Trade-offs**: More descriptors = more control, but too many competing cues dilute the result.

## Audio Prompt Structure (A–B–C)
**When to use**: Every AudioLM prompt.
**How**: A) atmosphere; B) instruments/sounds/voice qualities; C) fade/resolve.
**Trade-offs**: Structuring reduces surprise; unstructured prompts risk incoherence.

## Soundscape + Narrative Layering
**When to use**: Immersive audio storytelling.
**How**: Specify background soundscape, foreground element, the mix (who leads), and the temporal evolution.
**Trade-offs**: More layers require clearer balancing instructions.

## Cross-Modal Theme-First Prompting
**When to use**: Any multi-output (text + image + audio) project.
**How**: Define one unified theme; write each modality prompt as a facet of it; use complementary descriptors shared across prompts.
**Trade-offs**: Strong coherence; constrains outputs that intentionally diverge.

## Synergistic Prompting
**When to use**: When modalities should amplify each other, not merely coexist.
**How**: Chain the prompts — vivid text → image embodying the mood → audio reinforcing the ambiance; use transitional phrases.
**Trade-offs**: Requires sequencing effort; a weak link degrades the whole.

## Cross-Modal Metaphor / Symbolism
**When to use**: To carry abstract meaning across media.
**How**: Choose a metaphor ("a canvas of whispered secrets") and echo its symbols consistently in visuals and audio.
**Trade-offs**: Powerful but easy to over-interpret; keep symbols consistent.

## Modular Workflow (Separate Processing + Integration Layer)
**When to use**: Production pipelines.
**How**: Generate each modality in its own module; merge in an integration layer/APIs; keep version control and testing pipelines.
**Trade-offs**: More moving parts; far better scalability and iteration.

## Identity-First Personalization
**When to use**: When output must carry your creative signature.
**How**: Define palette/tone/themes; write a statement of intent; apply modality-specific levers (tone markers / style-era / instruments); layer detail gradually.
**Trade-offs**: More upfront thought; requires a clear sense of your own style.
