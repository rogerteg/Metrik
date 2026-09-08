# Capítulo 2: Engenharia de Prompt

## Core Idea
Engenharia de prompt para desenvolvedores é a disciplina sistemática de formular instruções contextualizadas, inequívocas e testáveis para guiar IAs generativas na entrega de soluções de software de alto padrão.

## Frameworks Introduced
- **Os Quatro Pilares do Prompt Técnico**:
  - Quando usar: Ao formular qualquer requisição de engenharia de software para uma IA.
  - Como aplicar:
    1. **Persona**: Atribuir a especialidade e senioridade desejada (ex: 'Engenheiro de Banco de Dados especializado em PostgreSQL').
    2. **Contexto**: Explicitar tecnologias, versões, arquitetura do projeto e dados relevantes.
    3. **Ação/Tarefa**: Verbo claro no imperativo detalhando o resultado esperado.
    4. **Restrições**: Limites de bibliotecas permitidas, regras de negócio e formato estrito da resposta.
- **Ciclo Iterativo de Refinamento (Prompt Refinement Loop)**:
  - Quando usar: Quando a primeira resposta da IA for incompleta ou ligeiramente desalinhada.
  - Como aplicar: Em vez de começar um chat do zero, aponte cirurgicamente a restrição violada ('O código usa funções depreciadas na v3, refatore usando a nova API X').

## Key Concepts
- **Prompt**: A entrada textual fornecida ao modelo contendo a instrução, contexto e parâmetros.
- **In-Context Learning**: A capacidade do modelo de assimilar regras e padrões fornecidos no próprio prompt sem precisar de treinamento prévio.
- **Restrição Negativa**: Instrução explícita sobre o que o modelo NÃO deve fazer.

## Mental Models
- **O Prompt como um Contrato de Interface (API)**: Uma boa função tem parâmetros tipados e retorno determinístico. Trate seu prompt como uma assinatura de função rigorosa.
- **Garbage In, Garbage Out**: Instruções vagas produzem código genérico; instruções granulares produzem código pronto para produção.

## Anti-patterns
- **Prompts Telepáticos**: Esperar que a IA adivinhe a estrutura do seu banco de dados ou a versão do Node.js sem informar no prompt.
- **Ajustes Mágicos Desesperados**: Ficar adicionando palavras como 'por favor, com muito cuidado' em vez de adicionar restrições técnicas claras.

## Worked Example
```text
[PERSONA]: Atue como desenvolvedor backend sênior especialista em TypeScript e NestJS.
[CONTEXTO]: Temos uma API REST que lida com pedidos de e-commerce. Banco PostgreSQL com Prisma ORM.
[TAREFA]: Crie o método de cancelamento de pedido no OrdersService.
[RESTRIÇÕES]:
- Pedidos já despachados (status 'SHIPPED') não podem ser cancelados; lance BadRequestException.
- Reverter estoque dos itens dentro de uma transação Prisma ($transaction).
- Retorne apenas o código TypeScript com docstrings, sem explicações adicionais.
```

## Key Takeaways
1. Precisão na comunicação é a habilidade mestra da engenharia de prompt para devs.
2. Divida problemas grandes em prompts modulares encadeados.
3. Restrições explícitas eliminam 90% dos erros comuns de geração.
