# Capítulo 11: Solicitações de Múltipla Escolha (Multiple Choice Prompting)

## Core Idea
A técnica de múltipla escolha delimita o espaço de saída do modelo em opções predefinidas, forçando uma tomada de decisão inequívoca, ideal para rotulagem, triagem rápida e avaliações conceituais.

## Frameworks Introduced
- **Fórmula de Prompt de Múltipla Escolha**:
  ```text
  Diante do seguinte texto: [inserir texto]
  Selecione a opção que melhor classifica o problema dentre as alternativas abaixo:
  A) Incidente crítico com parada total de serviço
  B) Degradação de desempenho sem interrupção de operação
  C) Dúvida operacional de usuário
  D) Solicitação de nova funcionalidade

  Instruções:
  - Sua resposta deve conter a letra da opção escolhida, o nome da categoria e uma justificativa concisa em 2 frases baseada em evidências do texto.
  ```

## Key Concepts
- **Espaço Amostral Fechado**: Redução drástica da variabilidade da resposta através de alternativas mutuamente exclusivas e coletivamente exaustivas (MECE).
- **Justificativa Concomitante**: Exigir que o modelo fundamente a alternativa eleita para verificar a solidez da escolha.

## Mental Models
- **A Chave Dicotômica de Classificação**: Como em biologia, o modelo percorre alternativas pré-fixadas sem liberdade para inventar um terceiro caminho inexistente.

## Anti-patterns
- **Alternativas Sobrepostas**: Fornecer opções ambíguas onde mais de uma alternativa pode ser considerada correta pelo modelo.

## Worked Example
**Triagem de Tickets de Suporte**:
```text
Ticket do Usuário:
"Desde as 9h da manhã nenhum vendedor da nossa filial de Curitiba consegue emitir notas fiscais. O sistema retorna erro 504 Gateway Timeout e as mercadorias estão retidas na expedição."

Analise o chamado e selecione uma das categorias de prioridade abaixo:
[A] P1 - Gravíssima (Parada operacional com impacto financeiro direto)
[B] P2 - Alta (Funcionalidade importante indisponível com contorno viável)
[C] P3 - Média (Problema localizado em um único usuário)
[D] P4 - Baixa (Cosmético / Melhoria)

Indique a letra, a categoria e a evidência textual que determinou a escolha.
```
