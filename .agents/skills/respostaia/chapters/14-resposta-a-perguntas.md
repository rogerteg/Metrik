# Capítulo 14: Solicitações de Resposta a Perguntas (Question-Answering Prompts)

## Core Idea
Prompts de QA (Question-Answering) visam extrair respostas precisas, factualmente verificadas e contextualizadas, com exigência de fundamentação em fontes delimitadas e prevenção ativa de alucinações.

## Frameworks Introduced
- **Fórmula de Resposta com Delimitação de Fonte**:
  ```text
  Fonte de Consulta:
  """
  [inserir texto ou documentação de referência]
  """

  Pergunta: [inserir dúvida do usuário]
  Instruções:
  1. Responda com base única e exclusivamente nas informações presentes na fonte acima.
  2. Se a fonte não contiver informações suficientes para responder com certeza, responda expressamente: "Esta informação não consta no material fornecido."
  3. Cite o parágrafo ou trecho exato que fundamenta sua resposta.
  ```

## Key Concepts
- **Cláusula Anti-Alucinação**: A instrução explícita de declarar ignorância caso o dado não esteja na fonte fornecida.
- **RAG Mental (Retrieval-Augmented Generation)**: Estruturação do prompt para agir como motor de inferência sobre documentos recuperados.

## Mental Models
- **A Prova com Consulta Fechada**: O aluno só pode citar o livro aberto sobre a mesa; qualquer informação vinda de fora é considerada infração.

## Anti-patterns
- **Permitir Inferências Livres sem Aviso**: Deixar o modelo preencher lacunas de uma especificação técnica com palpites próprios sem indicar a incerteza.

## Worked Example
**Consulta a Manual Técnico de Equipamento**:
```text
Manual do Fabricante:
"""
O Nobreak PowerVolt 3000 suporta sobrecargas de até 110% por 10 minutos e de até 150% por 30 segundos antes de desarmar por proteção térmica. A substituição do banco de baterias deve ser realizada anualmente caso o equipamento opere em ambientes com temperatura média superior a 30°C.
"""

Pergunta: "Posso manter uma carga de 130% operando continuamente por 5 minutos?"
Instruções: Responda diretamente (Sim ou Não), justifique com base nos limites do manual e indique o tempo máximo suportado para essa faixa.
```
