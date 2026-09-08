# Capítulo 14: Acoplamento de Componentes

## Core Idea
Como os componentes devem se relacionar entre si? As dependências entre unidades implantáveis devem ser gerenciadas através de princípios matemáticos de estabilidade, abstração e ausência de ciclos: **ADP**, **SDP** e **SAP**.

## Frameworks Introduced
- **1. ADP (Acyclic Dependencies Principle - Princípio das Dependências Acíclicas)**:
  - O grafo de dependências entre componentes deve ser um **Grafo Direcionado Acíclico (DAG)**.
  - *Ciclos de dependência* criam o "pesadelo do build matinal" onde ninguém consegue compilar ou testar um componente isoladamente.
  - *Como quebrar ciclos*: Aplicar o DIP (inverter uma das dependências através de uma nova interface) ou criar um terceiro componente compartilhado.
- **2. SDP (Stable Dependencies Principle - Princípio das Dependências Estáveis)**:
  - *Dependa na direção da estabilidade.* Componentes que devem ser flexíveis e mudar com frequência devem depender de componentes estáveis (difíceis de mudar).
  - **Métrica de Instabilidade ($I$)**:
    - $Ca$ (Acoplamento Aferente): Número de classes fora do componente que dependem dele.
    - $Ce$ (Acoplamento Eferente): Número de classes dentro do componente que dependem de classes fora dele.
    - $I = Ce / (Ca + Ce)$
    - $I = 0$: Máxima estabilidade (muitos dependem dele, ele não depende de ninguém).
    - $I = 1$: Máxima instabilidade (ele depende de muitos, ninguém depende dele).
- **3. SAP (Stable Abstractions Principle - Princípio das Abstrações Estáveis)**:
  - *Um componente deve ser tão abstrato quanto é estável.*
  - Se um componente for $I=0$ (super estável), ele deve ser rico em interfaces e abstrações para que possa ser estendido via OCP.
  - **Métrica de Abstração ($A$)**:
    - $A = Na / Nc$ (Onde $Na$ é o número de classes/interfaces abstratas e $Nc$ é o total de classes).
- **A Sequência Principal e a Métrica de Distância ($D$)**:
  - Em um gráfico com $I$ no eixo X e $A$ no eixo Y, a **Sequência Principal** é a linha reta ideal que conecta $(0, 1)$ (máxima abstração e estabilidade) a $(1, 0)$ (máximo concreto e instabilidade).
  - **A Zona de Dor**: Região próxima a $(0, 0)$ — componentes super estáveis e concretos (ex: schemas de bancos legados, classes utilitárias rígidas). São difíceis de mudar e ninguém consegue estender.
  - **A Zona de Inutilidade**: Região próxima a $(1, 1)$ — componentes super abstratos e instáveis que ninguém utiliza (abstrações órfãs).
  - **Distância Normalizada ($D$)**: $D = |A + I - 1|$. Projetos saudáveis mantêm $D$ próximo de zero.

## Key Concepts
- **Grafo Acíclico (DAG)**: Estrutura em que é impossível partir de um nó e voltar a ele seguindo as arestas.
- **Estabilidade Arquitetural**: Dificuldade de mudar um componente devido ao volume de dependentes.

## Mental Models
- **A Moeda de Troca**: Componentes de regra de negócio devem morar perto de $(0, 1)$ na Sequência Principal; componentes de UI e detalhes devem morar perto de $(1, 0)$.

## Anti-patterns
- **Dependência Cíclica Velada**: O pacote de Billing depende de Users, que depende de Notifications, que importa Billing para gerar boleto.

## Worked Example
```text
Cálculo de Métrica para o Componente de Regras Financeiras:
- Classes concretas: 8
- Interfaces abstratas: 12
- Total de classes (Nc): 20 -> A = 12 / 20 = 0.60
- Componentes externos que dependem dele (Ca): 14
- Componentes externos dos quais ele depende (Ce): 1
- Instabilidade: I = 1 / (14 + 1) = 0.067
- Distância: D = |0.60 + 0.067 - 1| = |-0.333| = 0.333 (Próximo à Sequência Principal)
```
