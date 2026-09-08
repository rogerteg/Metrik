# Capítulo 4: Prompts Padrão (Standard Prompts)

## Core Idea
Prompts padrão são solicitações elementares diretas compostas apenas por uma tarefa principal; funcionam como linha de base (baseline) para testes rápidos e como fundação que recebe camadas progressivas de sofisticação.

## Frameworks Introduced
- **Fórmula de Prompt Padrão**:
  `Gere [tarefa]` ou `Escreva um resumo de [tópico]`
- **O Ciclo de Evolução do Prompt**:
  1. *Prompt Padrão (Baseline)*: `Gere uma avaliação deste novo laptop.`
  2. *+ Papel*: `Como especialista em hardware, gere uma avaliação deste novo laptop.`
  3. *+ Instruções*: `Como especialista em hardware, gere uma avaliação objetiva destacando desempenho térmico, autonomia e teclado.`
  4. *+ Palavra-semente / Restrição*: `...utilizando a palavra-semente "poderoso" e limitando a análise a 300 palavras.`

## Key Concepts
- **Baseline Prompt**: O ponto de partida de menor esforço usado para entender a resposta espontânea do modelo.
- **Refinamento Iterativo**: Processo de acrescentar especificidade com base nas deficiências observadas no resultado do prompt padrão.

## Mental Models
- **O Esboço Antes da Pintura**: O prompt padrão é o rascunho a lápis; nunca espere uma obra finalizada sem adicionar camadas de instruções e restrições.

## Anti-patterns
- **Usar Prompt Padrão em Produção**: Colocar comandos como "escreva um artigo" em fluxos automatizados de clientes sem parametrização.

## Worked Example
**Evolução Prática**:
```text
[Nível 1 - Padrão]:
Gere um resumo desta notícia sobre inteligência artificial.

[Nível 2 - Refinado com Papel e Critérios]:
Como jornalista científico especializado em computação, gere um resumo executivo desta notícia em 3 tópicos:
1. A descoberta técnica principal.
2. O impacto econômico imediato.
3. As questões éticas e riscos levantados pelos pesquisadores.
```
