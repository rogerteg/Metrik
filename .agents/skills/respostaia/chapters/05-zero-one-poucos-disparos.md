# Capítulo 5: Solicitação de Zero, Um e Poucos Disparos (Few-Shot Prompting)

## Core Idea
Fornecer exemplos concretos (shots) calibra com precisão incomparável o formato, a nuance emocional, a sintaxe e o padrão de resposta que nenhuma instrução abstrata consegue descrever com tanta clareza.

## Frameworks Introduced
- **Classificação por Amostragem**:
  1. **Zero-shot (Zero Disparos)**: Apenas a instrução da tarefa sem exemplos. Útil para tarefas intuitivas e de conhecimento geral.
  2. **One-shot (Um Disparo)**: Um único par de entrada-saída demonstrando a estrutura esperada.
  3. **Few-shot (Poucos Disparos, 2 a 5)**: Uma sequência de exemplos de demonstração antes da entrada final.
- **Fórmula de Prompt Few-Shot**:
  ```text
  Execute a tarefa [tarefa] seguindo o padrão demonstrado nestes exemplos:

  Exemplo 1:
  Entrada: [exemplo 1]
  Saída: [resultado 1]

  Exemplo 2:
  Entrada: [exemplo 2]
  Saída: [resultado 2]

  Entrada Atual: [sua entrada]
  Saída:
  ```

## Key Concepts
- **In-Context Learning**: Capacidade dos modelos Transformer de inferir regras latentes a partir dos exemplos fornecidos no prompt sem atualizar pesos de rede.
- **Consistência de Formato**: Few-shot é a melhor ferramenta para forçar saídas padronizadas (JSON, tags, colunas).

## Mental Models
- **Mostrar é Melhor que Dizer**: Em vez de escrever 50 regras de formatação, mostre 2 exemplos perfeitos da saída esperada.

## Anti-patterns
- **Exemplos Contraditórios**: Incluir exemplos com padrões de resposta discrepantes entre si.
- **Excesso de Exemplos Desnecessários**: Encher a janela de contexto com 20 exemplos idênticos consumindo tokens sem ganho marginal de precisão.

## Worked Example
**Extração e Normalização de Produtos (Few-Shot)**:
```text
Identifique a marca, modelo e capacidade dos produtos a partir do texto livre:

Exemplo 1:
Texto: "Comprei um iPhone 14 Pro Max de 256GB na cor roxa."
Saída: {"marca": "Apple", "modelo": "iPhone 14 Pro Max", "capacidade": "256GB"}

Exemplo 2:
Texto: "Troquei meu Galaxy S23 Ultra por um de 512GB preto."
Saída: {"marca": "Samsung", "modelo": "Galaxy S23 Ultra", "capacidade": "512GB"}

Texto: "Acabei de encomendar o novo Kindle Paperwhite de 16GB à prova d'água."
Saída:
```
