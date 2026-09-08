---
name: skillpromptengmultimodal
description: Engenharia de Prompts para IA Multimodal (Texto, Imagem, Áudio e Vídeo) — arquiteturas cross-modais (CLIP, AudioLM, GPT-4), estratégias de fusão de modalidades, prompts visuais e acústicos, harmonização narrativa e diretrizes éticas com base no livro 'The Art of Prompt Engineering for Multimodal AI' de Yash Jain (2025). Use ao criar ou otimizar prompts multimodais, gerar imagens/sons/vídeos sincronizados com texto, ou desenhar pipelines criativos de IA generativa.
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Yash Jain (2025)
  version: '1.0'
---

# The Art of Prompt Engineering for Multimodal AI (skillpromptengmultimodal)

Guia e base de conhecimento estruturada a partir da obra de **Yash Jain (2025)** sobre a engenharia de prompts em sistemas multimodais convergentes (Texto, Visão Computacional e Áudio/Música).

## How to Use This Skill

1. **Fundamentos e Arquitetura**: Consulte chapters/ch01-foundations-multimodal-ai.md para entender como o alinhamento cross-modal e a fusão de dados operam.
2. **Engenharia de Texto (GPT-4 / LLMs)**: chapters/ch02-prompt-engineering-text-gpt4.md para técnicas de controle de contexto, encadeamento de pensamento e formatação de saída.
3. **Engenharia Visual (CLIP / Difusão / Midjourney / DALL-E)**: chapters/ch03-visual-mastery-images-clip.md para vocabulário visual, enquadramento, iluminação e prompt negativo.
4. **Engenharia Acústica (AudioLM / MusicLM / Suno)**: chapters/ch04-sonic-innovations-audiolm.md para texturas sonoras, ritmo, timbre e ambientação acústica.
5. **Harmonização e Fusão Cross-Modal**: chapters/ch05-integrating-multimodal-outputs.md e chapters/ch06-advanced-multimodal-strategies.md para sincronizar narrativa textual com assets visuais e sonoros.
6. **Personalização e Estilo Próprio**: chapters/ch07-customization-personalization.md.
7. **Tendências Futuras e Ética**: chapters/ch08-future-trends-ethics.md.
8. **Consultas Rápidas**: cheatsheet.md para parâmetros e vocabulário chave; patterns.md para templates prontos de prompts; glossary.md para termos técnicos.

---

## Core Frameworks & Mental Models

- **O Princípio da Representação Unificada**: Sistemas multimodais mapeiam dados heterogêneos (palavras, pixels, formas de onda acústicas) em um **espaço latente compartilhado**. Um prompt eficaz é uma coordenada precisa nesse espaço.
- **Dual Modality & Contrastive Alignment (CLIP)**: O alinhamento semântico entre imagem e texto depende de calibrar conceitos abstratos com qualificadores concretos (composição, estilo artístico, lente, iluminação).
- **Tríade Acústica (AudioLM)**: Prompts de áudio exigem a decomposição em **Ambiente (Espaço Físico)** + **Timbre/Instrumentação** + **Humor/Dinâmica Temporal**.
- **Cross-Modal Synchronization (Harmonização)**: Prompts para saídas combinadas devem compartilhar uma **âncora semântica comum** (mesma paleta de humor, época, iluminação e ritmo emocional) para evitar dissonância cognitiva entre texto, imagem e som.
- **Ciclo Iterativo de Refinamento Multimodal (M-IRL)**: Definir âncora → Gerar componente textual primário → Extrair descritores sensoriais → Gerar imagem/áudio derivados → Ajustar pesos de prompt via feedback.

---

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Foundations of Multimodal AI | chapters/ch01-foundations-multimodal-ai.md |
| 2 | Prompt Engineering for Text with GPT-4 | chapters/ch02-prompt-engineering-text-gpt4.md |
| 3 | Visual Mastery: Prompts with CLIP & Diffusion | chapters/ch03-visual-mastery-images-clip.md |
| 4 | Sonic Innovations: Crafting Audio Prompts | chapters/ch04-sonic-innovations-audiolm.md |
| 5 | Integrating Multimodal Outputs: Text, Visuals & Audio | chapters/ch05-integrating-multimodal-outputs.md |
| 6 | Advanced Strategies in Multimodal Prompt Engineering | chapters/ch06-advanced-multimodal-strategies.md |
| 7 | Customization and Personalization in Multimodal AI | chapters/ch07-customization-personalization.md |
| 8 | Future Trends and Ethical Considerations | chapters/ch08-future-trends-ethics.md |
