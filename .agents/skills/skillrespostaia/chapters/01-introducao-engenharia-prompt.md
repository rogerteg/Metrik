# Capítulo 1: Introdução às Técnicas de Engenharia de Prompt

## Core Idea
Engenharia de prompt é o processo deliberado de formular perguntas, tarefas e instruções que orientam a saída de modelos de linguagem como o ChatGPT, controlando sua variabilidade estatística para gerar respostas precisas, relevantes e de alta qualidade.

## Frameworks Introduced
- **A Tríade Fundamental do Prompt**:
  Todo prompt eficaz é composto por três blocos construtores:
  1. **Tarefa (Task)**: O que o modelo deve realizar objetivamente (verbo de ação explícito: *resumir, gerar, classificar, analisar, comparar*).
  2. **Instruções (Instructions)**: Regras que devem ser seguidas durante a geração (critérios de qualidade, tamanho, formatação, tom e limites).
  3. **Papel/Função (Role)**: A perspectiva ou persona que o modelo assume ao responder (ex: *advogado especialista, desenvolvedor sênior, redator publicitário*).
- **A Fórmula Básica de Prompt**:
  `Gere [tarefa] seguindo estas instruções: [instruções]`
- **O Mecanismo Probabilístico do Transformer**:
  O ChatGPT gera texto token por token com base na probabilidade condicionada pelo contexto. Prompts vagos abrem um leque amplo e genérico de caminhos probabilísticos; instruções rigorosas estreitam esse espaço para respostas de alto valor.

## Key Concepts
- **Engenharia de Prompt**: Arte e ciência de projetar entradas de texto para orientar modelos generativos.
- **Fórmula de Prompt**: Estrutura sintática padronizada que garante que nenhum componente crítico da instrução seja omitido.
- **Janela de Contexto**: Espaço de memória de trabalho do modelo para a conversa ativa.
- **Alinhamento de Intenção**: Garantir que o modelo interprete exatamente a necessidade real do usuário, e não uma interpretação superficial.

## Mental Models
- **O Modelo como um Operador Guiado**: Sem instruções explícitas, o modelo recorrerá à média estatística de seu treinamento prévio (respostas comuns e genéricas). Com instruções direcionadas, ele acessa o vocabulário e o raciocínio especializados.
- **Fórmula como Contrato de Execução**: Tratar o prompt como um contrato formal contendo o objetivo (tarefa), as cláusulas (instruções) e o responsável técnico (papel).

## Anti-patterns
- **Prompt Vago/Telepático**: Fornecer apenas um comando de uma palavra (ex: "contrato de software") esperando que o modelo adivinhe jurisdição, partes, prazos e responsabilidades.
- **Instruções Conflitantes**: Pedir um texto "extremamente detalhado e aprofundado" em "no máximo 3 frases".

## Worked Example
**Prompt Estruturado**:
```text
Gere um documento legal de Acordo de Não Divulgação (NDA) bilateral entre duas empresas de tecnologia seguindo estas instruções:
1. O documento deve estar em estrita conformidade com a legislação brasileira vigente (LGPD e Código Civil).
2. Defina com clareza o que constitui Informação Confidencial, incluindo código-fonte, dados de clientes e planos de negócios.
3. Estabeleça um prazo de vigência de confidencialidade de 5 anos após a rescisão contratual.
4. Inclua cláusula de penalidade por violação e foro de eleição na comarca de São Paulo/SP.
```
