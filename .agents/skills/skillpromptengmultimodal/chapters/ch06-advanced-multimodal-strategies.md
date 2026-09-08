# Chapter 6: Advanced Strategies in Multimodal Prompt Engineering

## Core Idea
O nível avançado de engenharia multimodal opera através de encadeamento iterativo de prompts (Prompt Chaining), loops de feedback cross-modal e injeção controlada de variações estilísticas.

## Frameworks Introduced
- **Multimodal Iterative Prompt Chaining (MIPC)**:
  - Quando usar: Em projetos complexos que não podem ser resolvidos em uma única passagem de geração.
  - Como executar o fluxo:
    1. *Etapa 1 (Concepção)*: LLM gera o conceito central e a bíblia de estilo (paleta de cores, vocabulário acústico, personas).
    2. *Etapa 2 (Derivação)*: LLM extrai prompts especializados de imagem e áudio formatados para as ferramentas alvo.
    3. *Etapa 3 (Geração e Crítica)*: Mídia é gerada; modelos de visão/audição inspecionam o resultado e geram feedback textual.
    4. *Etapa 4 (Refinamento)*: Prompts são ajustados com base no delta entre a intenção e a saída real.

## Key Concepts
- **Prompt Chaining**: Uso da saída de um modelo como entrada estruturada para o próximo prompt ou ferramenta.
- **Multimodal Evaluation (LLM-as-a-Judge para Mídia)**: Uso de modelos multimodais de visão para inspecionar imagens geradas e sugerir correções no prompt de origem.
- **Style Consistency Seeds**: Uso de sementes (--seed), referências visuais de imagem-para-imagem (img2img) e áudio-para-áudio (aud2aud) para manter coerência entre gerações.

## Mental Models
- **O Pipeline de Animação Digital**: Nenhum estúdio gera um filme com um único comando. Separe conceituação, storyboard visual, design sonoro e pós-processamento em prompts atômicos encadeados.
- **Feedback Loop Falsificável**: Defina critérios objetivos para avaliar se a mídia gerada correspondeu ao prompt (ex: paleta de cores dominante, presença de elementos-chave).

## Anti-patterns
- **Geração 'All-in-One' sem Etapas**: Tentar gerar narrativa, imagem, código e som em um único prompt monolítico, resultando em mediocridade em todas as frentes.
- **Ignorar a Deriva Estilística**: Permitir que cada nova cena ou capítulo mude de estilo visual sem amarras de consistência.

## Worked Example
```markdown
### Workflow de Encadeamento Multimodal (Exemplo Prático)

Passo 1: Prompt no LLM para extrair tokens de imagem e som
Prompt: "Analise a cena X e forneça:
1 - Prompt descritivo positivo para gerador visual (max 60 palavras)
2 - Prompt negativo com exclusões de artefatos
3 - Especificação acústica para gerador de som (BPM, ambiência, instrumentos)"

Passo 2: Execução e verificação cruzada
Com os parâmetros isolados, envie aos geradores específicos preservando a razão de aspecto e as sementes de estilo acordadas na Bíblia de Produção.
```

## Key Takeaways
1. A especialização por etapas gera resultados infinitamente superiores a tentativas de geração única.
2. O uso de modelos multimodais como avaliadores fecha o ciclo de controle de qualidade.
3. Consistência estética exige governança explícita de seeds e referências de estilo.
