# Capítulo 19: Política e Nível

## Core Idea
Um sistema de software é uma coleção detalhada de declarações de políticas. O **Nível** de uma política é definido pela sua **distância das entradas e saídas físicas do sistema**: quanto mais distante da E/S, mais alto é o nível da política.

## Frameworks Introduced
- **Definição Rigorosa de Nível**:
  - *Baixo Nível*: Código que lida diretamente com sockets de rede, queries SQL brutas, cliques de mouse ou tags HTML.
  - *Médio Nível*: Orquestração de casos de uso e transformadores de formato.
  - *Alto Nível*: Regras de negócio essenciais que calculam juros, geram notas ou validam apólices (imutáveis mesmo se o sistema rodasse em papel).
- **A Direção do Fluxo e da Dependência**:
  - O fluxo de dados viaja da entrada (baixo nível) -> sobe para o negócio (alto nível) -> desce para a saída (baixo nível).
  - *A dependência de código-fonte, contudo, deve convergir sempre para o Alto Nível*. Políticas de baixo nível devem depender de políticas de alto nível.

## Key Concepts
- **Distância de E/S**: Régua métrica para determinar a pureza arquitetural de um módulo.
- **Proteção do Alto Nível**: Políticas de alto nível nunca devem ser afetadas por alterações em dispositivos de baixo nível.

## Mental Models
- **A Sala da Diretoria Executiva**: Os diretores (alto nível) tomam decisões corporativas estratégicas; eles não operam a impressora nem sabem o modelo da chave de fenda usada na fábrica (baixo nível).

## Anti-patterns
- **Lógica de Imposto no Botão de Salvar da Tela**: O cálculo de ICMS embutido no evento `onClick()` do componente React ou no controller do Express.
