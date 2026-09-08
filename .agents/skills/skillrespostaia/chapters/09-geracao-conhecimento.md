# Capítulo 9: Prompt de Geração de Conhecimento (Knowledge Generation Prompting)

## Core Idea
Instruir o modelo a explicitar primeiro o conhecimento factual, os princípios fundamentais e os dados relevantes sobre um tema antes de executar a tarefa principal previne alucinações e melhora drasticamente a profundidade do resultado.

## Frameworks Introduced
- **Processo em Dois Estágios**:
  - **Fase 1 (Geração de Conhecimento)**: O modelo lista conceitos-chave, fatos históricos, fórmulas ou requisitos do problema.
  - **Fase 2 (Execução da Tarefa)**: O modelo resolve a tarefa utilizando estritamente o conhecimento explicitado na Fase 1.
- **Fórmula de Geração de Conhecimento**:
  ```text
  Problema: [inserir problema]
  Etapa 1: Gere uma lista de 5 fatos e princípios teóricos fundamentais sobre [tópico do problema].
  Etapa 2: Com base unicamente no conhecimento gerado na Etapa 1, responda ou elabore a solução para o problema.
  ```

## Key Concepts
- **Recuperação Explícita Interna**: Forçar o modelo a "refletir" sobre o que sabe antes de articular uma resposta complexa.
- **Fundamentação de Premissas**: Estabelece uma base comum verificável para o usuário inspecionar antes de confiar na recomendação final.

## Mental Models
- **Consulta ao Dicionário Antes do Julgamento**: O juiz primeiro lê a lei e os autos; apenas depois redige a sentença.

## Anti-patterns
- **Pular Diretamente para a Decisão**: Exigir uma recomendação de arquitetura ou investimento sem antes listar os requisitos e o cenário macroeconômico/técnico.

## Worked Example
**Consultoria de Retenção de Clientes**:
```text
Problema: Alta taxa de churn em um aplicativo SaaS de gestão financeira para PMEs.

Etapa 1: Gere insights e princípios consolidados de Customer Success sobre comportamento de clientes e motivos de cancelamento em SaaS B2B.
Etapa 2: Utilizando esses insights gerados, elabore um plano de ação tático em 4 semanas para recuperar contas em risco e aumentar o engajamento diário.
```
