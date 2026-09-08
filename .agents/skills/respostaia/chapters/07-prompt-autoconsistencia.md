# Capítulo 7: Prompt de Autoconsistência (Self-Consistency Prompting)

## Core Idea
A autoconsistência consiste em gerar múltiplos caminhos independentes de raciocínio para um mesmo problema e selecionar a conclusão consensual mais consistente, eliminando a dependência de uma única resposta aleatória.

## Frameworks Introduced
- **Fluxo de Autoconsistência**:
  1. *Amostragem Múltipla*: Submeter o problema gerando de 3 a 5 caminhos de resolução distintos.
  2. *Validação Cruzada*: Avaliar quais conclusões convergem e quais premissas são unânimes.
  3. *Síntese Consensual*: Adotar a resposta de maior consistência interna e fundamentação sólida.
- **Fórmula de Prompt de Autoconsistência**:
  ```text
  Tarefa: Analisar a consistência e veracidade de [informação/argumento/decisão].
  Instruções:
  1. Desenvolva 3 linhas de análise independentes utilizando diferentes perspectivas técnicas.
  2. Compare os pontos de convergência e divergência entre as 3 análises.
  3. Aponte a conclusão que apresenta maior solidez factual e lógica interna.
  ```

## Key Concepts
- **Votação por Maioria (Majority Voting)**: Regra de agregação onde a resposta repetida pela maioria das cadeias de raciocínio é selecionada.
- **Robustez Epistêmica**: Redução de erros singulares causados por variações estocásticas da amostragem de tokens.

## Mental Models
- **Junta de Especialistas Independentes**: Três peritos analisam o mesmo caso sem conversar entre si; a conclusão comum a todos é exponencialmente mais confiável do que o laudo de apenas um.

## Anti-patterns
- **Aceitar a Primeira Saída Crítica sem Verificação**: Tomar decisões médicas, financeiras ou jurídicas baseando-se em uma única execução sem validação cruzada.

## Worked Example
**Auditoria de Decisão Estratégica**:
```text
Tarefa: Verificar a consistência da recomendação de migração de um datacenter legado para arquitetura serverless.
Instruções:
1. Abordagem A: Analise estritamente sob a perspectiva de custos de infraestrutura e previsibilidade de fatura em picos.
2. Abordagem B: Analise sob a perspectiva de esforço de engenharia, lock-in de provedor e latência de inicialização (cold starts).
3. Abordagem C: Analise sob a perspectiva de governança de segurança, observabilidade e conformidade com a LGPD.
4. Conclusão de Autoconsistência: Sintetize onde as três análises concordam e qual é a decisão final mais sólida e prudente.
```
