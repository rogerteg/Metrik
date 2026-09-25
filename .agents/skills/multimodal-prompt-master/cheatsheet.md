# Cheatsheet — Multimodal Prompt Engineering (Yash Jain)

## Decision Rules
- **When output is incoherent across media → define a Unified Theme first**, because all modalities must derive from one concept. (Ch 5)
- **When format matters → Few-Shot; when intent is obvious → Zero-Shot.** (Ch 2)
- **When the task needs reasoning/planning → Chain-of-Thought.** (Ch 2)
- **When output is stale → Creative Reframing** (new angle / analogy). (Ch 2)
- **When generating an image → run the 4-part checklist** (subject → attributes → context → optional style). (Ch 3)
- **When generating audio → use A–B–C** (atmosphere → elements → resolve) and specify the mix. (Ch 4)
- **When blending modalities → look for synergy, not coexistence**; chain prompts so each amplifies the next. (Ch 6)
- **When output must look like *yours* → define identity before writing any prompt.** (Ch 7)
- **When unsure if it improved → change one variable at a time.** (Ch 6)

## Modality Cue Map

| Modality | Model | Specify | Primary levers |
|---|---|---|---|
| Text | GPT-4 | tone, context, format | tone markers, structure (A–B–C), CoT |
| Image | CLIP | subject, mood, setting | descriptive attributes, style/era |
| Audio | AudioLM | atmosphere, layers, evolution | instruments/rhythm, mix, temporal sequence |

## Prompt Skeletons

**Text (A–B–C)**
```text
A. Introduction: <scenario/problem>
B. Task: <exact output/format>
C. Constraints: <tone, length, exclusions>
```

**Image (4-part)**
```text
Core subject: <...>
Attributes: <color, mood, texture>
Context: <time, weather, setting>
Style (optional): <art style / era / artist>
```

**Audio (A–B–C + layers)**
```text
A. Atmosphere: <...>
B. Main body: <instruments/sounds/voice>
C. Resolve: <fade/ending>
Background: <...> | Foreground: <...> | Mix: <who leads> | Evolution: <over time>
```

**Cross-modal**
```text
Unified theme: <one concept>
Text: <narrative facet>
Image: <visual facet>
Audio: <auditory facet>
Shared descriptors: <e.g., serene, dreamlike>
Transitional cue: <e.g., "as the night unfolds">
```

## Decision Tree — "Which technique do I reach for?"

- Output unclear/ambiguous? → **Structured A–B–C** *(Ch 2)*
- Need a specific format? → **Few-Shot** *(Ch 2)*
- Needs reasoning? → **Chain-of-Thought** *(Ch 2)*
- Image looks generic? → **add context + attributes; order subject-first** *(Ch 3)*
- Audio feels flat? → **add layers + temporal sequencing + emotional alignment** *(Ch 4)*
- Outputs don't cohere? → **Unified Theme + synchronization checks** *(Ch 5)*
- Want innovation at the intersection? → **Cross-modal metaphor + synergy** *(Ch 6)*
- Want a recognizable style? → **Identity-first personalization** *(Ch 7)*
- Something improved but not sure why? → **isolate one variable** *(Ch 6)*

## Thresholds & Defaults
- **Few-Shot**: 2–3 examples is the practical default.
- **Visual checklist**: 4 components — subject, attributes, context, style (style optional).
- **Audio structure**: 3 parts (A–B–C) + explicit mix of background vs foreground.
- **Synchronization**: verify on 3 axes — tone/style, time, space.
- **Refinement**: change exactly one variable per iteration.

## Tells & Smells
- If text, image, and audio could belong to three different projects → **the theme is missing**.
- If the prompt lists adjectives with no order → **subject-first ordering is missing**.
- If a "calm" soundscape fights a somber voice → **emotional alignment failed**.
- If nobody can tell who made it → **identity-first personalization was skipped**.
- If you can't explain what changed the output → **too many variables moved at once**.
- If bias/IP/privacy were never checked → **the ethics gate was skipped** *(Ch 8)*.
