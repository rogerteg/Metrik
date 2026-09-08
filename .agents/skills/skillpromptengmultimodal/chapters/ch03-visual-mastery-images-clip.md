# Chapter 3: Visual Mastery: Prompt Engineering for Images with CLIP

## Core Idea
Modelos texto-imagem (como CLIP e difusores) requerem prompts que combinem sujeito, meio artístico, iluminação, composição de câmera e descritores estilísticos precisos para traduzir intenções conceituais em pixels de alta fidelidade.

## Frameworks Introduced
- **Anatomia do Prompt Visual Pentapartite**:
  - Quando usar: Ao construir qualquer prompt para geradores de imagem (Midjourney, DALL-E, Stable Diffusion / Flux).
  - Como estruturar:
    1. **Sujeito Primário**: O foco focal (ex: 'um relojoeiro idoso').
    2. **Meio Artístico / Estilo**: (ex: 'pintura a óleo holandesa do século XVII' ou 'fotografia cinematográfica 35mm').
    3. **Iluminação e Atmosfera**: (ex: 'luz lateral difusa vinda de janela, sombras suaves, névoa volumétrica').
    4. **Composição e Lente**: (ex: 'plano detalhe close-up, profundidade de campo reduzida f/1.8, ângulo baixo').
    5. **Detalhes de Textura e Cor**: (ex: 'engrenagens de latão polido, tons sépia quentes, pátina de ferrugem').
- **Negative Prompting & Exclusion Tuning**:
  - Quando usar: Para guiar o espaço latente para longe de artefatos indesejados e estéticas plásticas.
  - Como: Especificar deformidades, texturas sintéticas, baixa resolução e elementos fora de contexto.

## Key Concepts
- **CLIP Score**: Métrica de similaridade semântica entre o texto e a imagem gerada.
- **Negative Prompt**: Conjunto de instruções que repele o modelo de certas regiões do espaço latente.
- **Weighting / Modifiers**: Parâmetros para dar maior ou menor ênfase a certas palavras-chave no prompt.
- **Aspect Ratio & Composition**: Razão de aspecto da imagem (--ar 16:9, --ar 4:5) que condiciona o enquadramento espacial.

## Mental Models
- **O Prompt Visual como a Lente de um Diretor de Fotografia**: Não basta pedir 'um carro'; especifique a iluminação, a lente, o tempo atmosférico e a sujeira no para-brisa.
- **Evite Palavras Mágicas Genéricas**: Substitua adjetivos vazios como 'photorealistic, 8k, masterpiece' por especificações técnicas reais (ex: 'fotografia editorial Kodak Portra 400, iluminação de estúdio Rembrandt').

## Anti-patterns
- **Salada de Palavras-Chave Desconectadas**: Jogar dezenas de tags aleatórias sem coerência gramatical ou espacial.
- **Conflito de Iluminação e Estilo**: Misturar 'iluminação natural suave da manhã' com 'neon cyberpunk futurista estourado' sem intenção clara.

## Worked Example
`	ext
Prompt Positivo:
Retrato cinematográfico de uma cientista botânica examinando uma orquídea bioluminescente rara, estufa úmida à noite, névoa suave, gotas de condensação no vidro, iluminação de tungstênio quente contrastando com o brilho azul ciano suave da planta, capturado em filme 35mm, lente anamórfica 50mm, granulação sutil de película, estética vintage autêntica.

Prompt Negativo:
Render 3D artificial, pele plástica de cera, saturação excessiva, distorção anatômica, desfoque digital não natural.
`

## Key Takeaways
1. A especificidade técnica (lente, iluminação, suporte artístico) supera adjetivos superlativos.
2. A hierarquia e a ordem dos termos no prompt influenciam o peso atencional do modelo.
3. Prompts negativos limpam o ruído e aumentam a consistência conceitual da geração.
