# Capítulo 7: Prompts de Apoio à Modelagem

## Core Idea
A IA pode acelerar drasticamente as fases iniciais de engenharia de software ao gerar rascunhos de requisitos funcionais, diagramas de arquitetura em formatos textuais (Mermaid, PlantUML) e esquemas relacionais de banco de dados.

## Frameworks Introduced
- **Engenharia de Requisitos Guiada por IA**:
  - Quando usar: Na concepção de novos módulos ou funcionalidades a partir de demandas brutas de negócio.
  - Como: Alimentar a IA com a descrição informal do cliente e pedir a extração de: 1) Atores; 2) User Stories no formato 'Como/Quero/Para'; 3) Critérios de Aceite no formato BDD (Given/When/Then).
- **Modelagem de Diagramas Text-as-Code**:
  - Quando usar: Para desenhar diagramas de classe, sequência ou entidade-relacionamento rapidamente.
  - Como: Solicitar a saída diretamente em sintaxe Mermaid ou PlantUML para renderização imediata em documentações markdown.

## Key Concepts
- **PlantUML / Mermaid**: Linguagens baseadas em texto para especificação de diagramas arquiteturais e de fluxo.
- **BDD (Behavior-Driven Development)**: Sintaxe estruturada de cenários de teste orientados a comportamento (Dado que / Quando / Então).
- **Normalização de Dados Assistida**: Identificação de dependências funcionais e sugestão de chaves primárias/estrangeiras e índices.

## Mental Models
- **Diagramas como Código Vivo**: Se um diagrama pode ser expresso em texto (Mermaid), a IA pode gerá-lo, atualizá-lo e versioná-lo junto com a especificação técnica.
- **Procurar Casos Negativos nos Requisitos**: Use a IA para perguntar: 'Quais casos de falha ou cenários de exceção não foram considerados nesta especificação?'.

## Anti-patterns
- **Modelagem Visual Sem Restrições de Negócio**: Pedir diagramas de banco de dados sem informar o volume esperado de dados, concorrência ou regras de integridade.
- **Especificações de Requisitos Ambíguas**: Aceitar termos como 'o sistema deve ser rápido e intuitivo' sem métricas quantificáveis de aceite.

## Worked Example
```text
Atue como Analista de Sistemas sênior.
Com base no texto abaixo, gere:
1. Diagrama de Entidade-Relacionamento em sintaxe Mermaid (erDiagram).
2. Esquema DDL SQL com tipos apropriados, chaves primárias e constraints de integridade referencial.
3. 3 perguntas críticas sobre regras de negócio que ficaram omissas no texto.

<descricao_negocio>
Sistema de agendamento de consultas médicas. Pacientes podem agendar com médicos de diferentes especialidades. Médicos definem horários de atendimento. Uma consulta tem status (agendada, realizada, cancelada).
</descricao_negocio>
```

## Key Takeaways
1. Use Mermaid e PlantUML para tornar a modelagem de sistemas versionável e tratável por IA.
2. A IA é uma ferramenta formidável para encontrar furos e premissas implícitas em requisitos.
3. A modelagem orientada por BDD aproxima o negócio da implementação técnica.
