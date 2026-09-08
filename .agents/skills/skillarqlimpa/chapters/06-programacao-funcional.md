# Capítulo 6: Programação Funcional

## Core Idea
A programação funcional impõe disciplina sobre a atribuição: variáveis em uma linguagem funcional pura não mudam de valor. Para a arquitetura de software, a **imutabilidade** é a maior aliada da concorrência e estabilidade, pois condições de corrida (race conditions), deadlocks e problemas de atualização concorrente só existem porque variáveis mutáveis são compartilhadas entre múltiplas threads.

## Frameworks Introduced
- **Segregação de Mutabilidade (Mutable vs Immutable Components)**:
  Um sistema bem projetado segrega estritamente o código em:
  - *Módulos Imutáveis*: Núcleo puramente funcional onde ocorrem transformações de dados sem efeitos colaterais.
  - *Módulos Mutáveis*: Camada fina e isolada que gerencia o estado persistente transacional (protegida por transações atômicas ou atores).
- **Event Sourcing (Origem de Eventos)**:
  Em vez de atualizar o estado em uma tabela (mutabilidade em disco), armazenam-se todos os eventos transacionais ocorridos no tempo de forma puramente apensável (*append-only*).
  - Como o histórico é imutável, o sistema não sofre com contenções de escrita destrutivas e pode reconstruir o estado de qualquer instante no passado.

## Key Concepts
- **Imutabilidade**: Dados que não podem ser alterados após a instanciação.
- **Funções Puras**: Funções cujo retorno depende estritamente dos argumentos de entrada e que não produzem efeitos colaterais (side-effects).
- **Event Sourcing**: Estratégia de persistência baseada em log de eventos sequenciais imutáveis.

## Mental Models
- **O Livro Razão Contábil**: Um contador nunca apaga uma linha com erro no livro razão; ele faz um novo lançamento de ajuste (débito/crédito) para equilibrar a conta. O histórico contábil é imutável.

## Anti-patterns
- **Estado Global Mutável**: Variáveis estáticas compartilhadas entre threads sem travas ou mecanismos de concorrência segura.

## Worked Example
Em vez de atualizar o saldo da conta de um cliente com `UPDATE contas SET saldo = 450 WHERE id = 1`, o Event Sourcing registra:
1. `ContaAberta(id=1, saldo_inicial=0)`
2. `DepositoRealizado(id=1, valor=500)`
3. `TaxaManutencaoCobrada(id=1, valor=50)`
O saldo atual (450) é a simples redução funcional (`fold` / `reduce`) de todos os eventos da conta.
