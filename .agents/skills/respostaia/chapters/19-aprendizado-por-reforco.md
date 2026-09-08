# Capítulo 19: Solicitações de Aprendizado por Reforço (Reinforcement Learning Prompts)

## Core Idea
Inspirada nos princípios de Reinforcement Learning, esta técnica estabelece um ciclo interativo onde o modelo gera uma primeira versão, recebe feedback avaliativo com pontuação ou críticas estruturadas, e ajusta seu comportamento para maximizar a recompensa na iteração seguinte.

## Frameworks Introduced
- **O Ciclo Interativo de RL via Prompt**:
  1. *Ação Inicial*: O modelo gera o texto conforme o prompt de partida.
  2. *Feedback do Ambiente (Recompensa/Penalidade)*: O usuário ou outro agente avalia o resultado com notas e aponta erros específicos.
  3. *Atualização de Política*: O modelo reescreve a saída incorporando as correções e evitando penalidades anteriores.
- **Fórmula de Prompt com Reforço e Calibração**:
  ```text
  Versão Anterior:
  """
  [inserir texto da tentativa anterior]
  """

  Feedback / Penalidades da Rodada Anterior:
  - O texto foi prolixo e violou a regra de brevidade (Penalidade: -20 pontos).
  - Faltaram exemplos práticos de código (Penalidade: -30 pontos).
  - O tom foi considerado excessivamente acadêmico (Penalidade: -10 pontos).

  Tarefa: Reescreva o material buscando nota máxima (100/100), eliminando todas as falhas apontadas e preservando a precisão técnica.
  ```

## Key Concepts
- **Loop de Feedback Corretivo**: Mecanismo de convergência para o padrão desejado através de refinamentos sucessivos.
- **Função de Recompensa Explícita**: Deixar claro para o modelo o que pontua positivamente e o que gera penalidade na geração.

## Mental Models
- **O Ensaio com o Treinador**: O atleta faz o movimento, o técnico aponta os erros posturais com notas, e o atleta repete o movimento imediatamente corrigido.

## Anti-patterns
- **Dizer Apenas 'Melhore'**: Fornecer feedback sem apontar especificamente quais regras foram violadas e como corrigi-las.

## Worked Example
**Refinamento de Pitch de Vendas**:
```text
Avaliação do Pitch Anterior:
"Nota: 6/10. O pitch explicou bem o que o produto faz, mas não tocou na dor financeira do cliente nem estabeleceu urgência de fechamento."

Instrução de Reforço:
Reescreva o pitch de vendas para o CFO em no máximo 150 palavras. Para atingir nota 10/10, você obrigatoriamente deve:
1. Começar com a perda média anual de R$ 120 mil causada pelo método manual.
2. Apresentar o ROI garantido em 90 dias com nosso software.
3. Finalizar com uma proposta irrecusável para piloto sem custo nas primeiras duas semanas.
```
