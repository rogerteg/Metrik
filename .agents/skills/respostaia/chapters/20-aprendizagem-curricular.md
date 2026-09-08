# Capítulo 20: Solicitações de Aprendizagem Curricular (Curriculum Learning Prompts)

## Core Idea
A aprendizagem curricular estrutura a interação em uma sequência pedagógica progressiva, partindo de conceitos elementares ou tarefas simples e avançando passo a passo até problemas de alta sofisticação técnica.

## Frameworks Introduced
- **Fórmula de Progressão Curricular**:
  ```text
  Tema Geral: [inserir tema complexo, ex: Criptografia Assimétrica]
  Estruture a explicação em 4 módulos curriculares progressivos:
  - Módulo 1 (Básico): Analogia simples do cotidiano sem jargões.
  - Módulo 2 (Intermediário): Conceitos fundamentais (chaves públicas/privadas, funções unidirecionais).
  - Módulo 3 (Avançado): Funcionamento matemático e algoritmo RSA.
  - Módulo 4 (Aplicação Prática): Implementação em código e ataque de força bruta / vulnerabilidades.
  ```

## Key Concepts
- **Scaffolding Cognitivo**: Construir os degraus de suporte antes de exigir o salto conceitual final.
- **Treinamento de Habilidades Compostas**: Treinar o modelo a resolver primeiro os subproblemas antes de juntá-los na solução global.

## Mental Models
- **A Escadaria do Conhecimento**: Não se aprende cálculo integral sem antes dominar álgebra elementar; respeitar a ordem natural de assimilação garante solidez conceitual.

## Anti-patterns
- **Saltar Direto para o Nível Doutorado**: Jogar um problema multifacetado e obscuro sem construir o vocabulário e as premissas nas mensagens anteriores da conversa.

## Worked Example
**Currículo de Arquitetura de Microsserviços**:
```text
Crie uma trilha explicativa sobre Arquitetura Orientada a Microsserviços para desenvolvedores júnior:
Nível 1: O que é um monolito e por que ele se torna difícil de manter quando a equipe cresce.
Nível 2: O conceito de microsserviço, banco de dados independente e comunicação via REST/gRPC.
Nível 3: O desafio da consistência eventual e o padrão Saga para transações distribuídas.
Nível 4: Desafio prático: desenhe a solução de checkout de um e-commerce aplicando os conceitos dos níveis 1, 2 e 3.
```
