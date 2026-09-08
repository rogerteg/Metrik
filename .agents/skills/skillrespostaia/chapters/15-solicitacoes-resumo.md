# Capítulo 15: Solicitações de Resumo (Summarization Prompts)

## Core Idea
A técnica de resumo transforma textos extensos (atas de reunião, artigos acadêmicos, livros e notícias) em sínteses estruturadas de alto valor executivo, eliminando redundâncias e preservando decisões e dados críticos.

## Frameworks Introduced
- **Fórmula de Resumo Executivo em 3 Camadas**:
  ```text
  Texto Original:
  """
  [inserir texto]
  """

  Gere um resumo estruturado seguindo estas instruções:
  1. Tese / Ideia Central (1 frase).
  2. Principais Decisões e Conclusões (lista com 3 a 5 tópicos acionáveis).
  3. Riscos, Pendências e Próximos Passos (com responsáveis, se houver).
  4. Extensão máxima: 200 palavras.
  ```
- **Variações de Resumo**:
  - *Resumo de Reunião*: Decisões tomadas, compromissos assumidos, pendências e prazos.
  - *Resumo de Artigo*: Problema abordado, metodologia, resultados estatísticos e limitações.
  - *Resumo Executivo (TL;DR)*: Síntese de 3 linhas para liderança sênior.

## Key Concepts
- **Taxa de Compressão**: Proporção entre o tamanho do texto gerado e o original (ex: compressão de 90%).
- **Fidelidade Factual**: Manter a integridade de números, prazos e nomes sem inventar conexões.

## Mental Models
- **A Peneira de Garimpo**: A água e o cascalho (detalhes secundários, bate-papo, repetições) são descartados; apenas as pepitas de ouro (decisões e fatos-chave) ficam na bandeja.

## Anti-patterns
- **Resumo Prolixo**: Um resumo que apenas reescreve o texto original sem reduzir significativamente o volume de leitura.

## Worked Example
**Resumo de Transcrição de Reunião de Alinhamento**:
```text
Gere uma ata executiva da reunião gravada abaixo seguindo estas instruções:
1. Resuma em um parágrafo o objetivo principal discutido.
2. Liste em tópicos todas as decisões definitivas tomadas.
3. Crie uma tabela com: Tarefa | Responsável | Prazo de Entrega.
4. Omita conversas paralelas, piadas ou discussões que não resultaram em decisão.

Transcrição: [inserir transcrição da reunião de produto]
```
