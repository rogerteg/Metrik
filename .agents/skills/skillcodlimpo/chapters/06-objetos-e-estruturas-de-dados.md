# Capítulo 6: Objetos e Estruturas de Dados

## Core Idea
Existe uma assimetria fundamental e irreconciliável entre **Objetos** e **Estruturas de Dados**:
- **Objetos** escondem seus dados atrás de abstrações e expõem funções que operam sobre esses dados.
- **Estruturas de Dados** expõem seus dados e não possuem funções com comportamento significativo.
Tentar criar um meio-termo híbrido resulta no pior dos dois mundos.

## Frameworks Introduced
- **A Lei de Deméter (Princípio do Mínimo Conhecimento)**:
  Um módulo não deve enxergar as entranhas dos objetos que manipula. Um método $f$ de uma classe $C$ só deve invocar métodos de:
  1. $C$ próprio;
  2. Objetos criados por $f$;
  3. Objetos passados como argumentos para $f$;
  4. Variáveis de instância de $C$.
- **Acidentes de Trem (Train Wrecks)**:
  Cadeias longas de chamadas como:
  `String outputDir = ctxt.getOptions().getScratchDir().getAbsolutePath();`
  Isso viola violentamente a Lei de Deméter se os elementos intermediários forem objetos, expondo a arquitetura interna de múltiplos nós do sistema.
- **A Dicotomia Arquitetural de Uncle Bob**:
  - *Código Procedural com Estruturas de Dados*: Facilita adicionar novas funções sem alterar as estruturas existentes; dificulta adicionar novas estruturas (exige alterar todas as funções).
  - *Código Orientado a Objetos*: Facilita adicionar novas classes sem alterar os métodos existentes; dificulta adicionar novos métodos (exige alterar todas as classes da hierarquia).
  - Escolha OO quando espera adicionar novos tipos; escolha estruturas de dados/funcional quando espera adicionar novas operações.
- **DTOs e Active Records**:
  - DTO (Data Transfer Object): Estrutura de dados pura (classes com variáveis públicas ou getters/setters simples) sem comportamento de negócio.
  - Active Record: DTO especial com métodos de persistência (`save`, `find`). **Nunca coloque regras de negócio dentro de Active Records**.

## Key Concepts
- **Híbridos Monstruosos**: Classes que têm metade de seus campos como getters/setters públicos e outra metade como regras complexas de negócio.
- **Esconder a Estrutura Interna**: Em vez de pedir o caminho do arquivo (`ctxt.getOptions()...`), diga ao objeto o que fazer: `BufferedOutputStream bos = ctxt.createScratchFileStream(classFileName);`.

## Mental Models
- **O Carro vs A Lista de Peças**: Um carro é um objeto: você pisa no acelerador e gira o volante (abstração); você não mexe manualmente na injeção eletrônica. A lista de peças do mecânico é uma estrutura de dados aberta.

## Anti-patterns
- **Getters e Setters Automáticos para Tudo**: Adicionar getters e setters para todas as variáveis privadas de uma classe, destruindo o encapsulamento e transformando o objeto em uma estrutura de dados disfarçada.
