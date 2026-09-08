# Capítulo 21: Solicitações de Análise de Sentimento (Sentiment Analysis Prompts)

## Core Idea
Prompts de análise de sentimento medem a carga afetiva, a polaridade (positivo, negativo, neutro) e nuances emocionais específicas (frustração, entusiasmo, desapontamento) contidas em textos de clientes, postagens e interações.

## Frameworks Introduced
- **Fórmula de Análise de Sentimento com Nuance**:
  ```text
  Texto para Análise:
  """
  [inserir avaliações ou tweets]
  """

  Tarefa: Execute a análise de sentimento seguindo estas instruções:
  1. Classifique a polaridade geral: [Positivo / Negativo / Neutro / Misto].
  2. Atribua uma nota de intensidade emocional de 1 a 5 (onde 1 é suave e 5 é extremo).
  3. Identifique o sentimento específico predominante (ex: frustração, gratidão, ceticismo, euforia).
  4. Extraia a frase-chave do texto que melhor justifica a classificação atribuída.
  ```

## Key Concepts
- **Polaridade vs Intensidade**: Distinguir entre um comentário suavemente favorável e uma recomendação entusiasmada apaixonada.
- **Sentimento Misto**: Reconhecer quando um texto elogia um aspecto do serviço mas detona outro.

## Mental Models
- **O Termômetro Emocional**: O modelo atua como um sensor que mede não apenas o conteúdo factual, mas a temperatura psicológica de quem escreveu.

## Anti-patterns
- **Redução Binária Inflexível**: Forçar qualquer texto a ser apenas 'Positivo' ou 'Negativo', ignorando a vasta maioria de avaliações com ressalvas moderadas.

## Worked Example
**Análise de Avaliações de Companhia Aérea**:
```text
Analise a seguinte avaliação de passageiro:
"A equipe de bordo foi incrivelmente gentil e o lanche estava ótimo, mas o atraso de 4 horas sem nenhuma informação no portão de embarque arruinou completamente meu compromisso profissional."

Gere a análise estruturada:
- Polaridade: [Misto]
- Dimensão Elogiada: [Atendimento de bordo e refeição]
- Dimensão Criticada: [Pontualidade e comunicação de crise]
- Sentimento Dominante: [Frustração severa com impacto na pontualidade]
- Risco de Churn: [Alto]
```
