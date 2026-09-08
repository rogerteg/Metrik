# Capítulo 10: Solicitações de Integração de Conhecimento (Knowledge Integration Prompting)

## Core Idea
A integração de conhecimento combina informações externas atualizadas, notas operacionais ou premissas recém-fornecidas com a base de conhecimento e as capacidades de raciocínio do modelo de linguagem.

## Frameworks Introduced
- **Fórmula de Integração de Conhecimento**:
  ```text
  Contexto / Novos Fatos Fornecidos:
  """
  [inserir documentos, notas ou dados recentes]
  """

  Tarefa: Analisar [situação] integrando os fatos fornecidos acima com seus conhecimentos de [área].
  Instruções:
  1. Destaque onde os novos fatos confirmam ou contradizem práticas tradicionais.
  2. Em caso de conflito entre os novos fatos e seu conhecimento prévio, dê precedência absoluta aos dados fornecidos acima.
  3. Gere o relatório final harmonizado.
  ```

## Key Concepts
- **Precedência Contextual**: Regra explícita que obriga o modelo a priorizar as informações do prompt em detrimento de seus dados de pré-treinamento antigos.
- **Harmonização Factual**: Habilidade de encaixar dados novos em uma narrativa coesa e logicamente estruturada.

## Mental Models
- **O Aditivo Contratual**: Novos fatos funcionam como um termo aditivo que revoga cláusulas anteriores de um contrato estabelecido.

## Anti-patterns
- **Misturar Fatos sem Delimitação**: Colocar dados novos misturados com instruções operacionais sem usar delimitadores claros (como `"""` ou `<contexto>`).

## Worked Example
**Atualização de Política Corporativa**:
```text
Novas Diretrizes de Trabalho Remoto (Aprovadas pela Diretoria em 2026):
"""
- Todos os colaboradores podem trabalhar 100% remoto, exceto durante os ciclos trimestrais de planejamento presencial (3 dias a cada trimestre).
- O auxílio home office foi fixado em R$ 350 mensais.
- Horário flexível com faixa de presença síncrona obrigatória entre 10h e 16h (horário de Brasília).
"""

Tarefa: Como Gerente de Recursos Humanos, elabore um comunicado oficial para toda a empresa integrando as novas diretrizes acima com o manual de conduta e cultura ágil da companhia.
```
