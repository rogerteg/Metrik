# Capítulo 18: Anatomia do Limite

## Core Idea
Limites arquiteturais existem em diversas formas físicas ao longo do espectro de implantação: desde chamadas de função locais dentro de um mesmo monolito até fronteiras físicas de rede entre serviços distribuídos.

## Frameworks Introduced
- **Os 4 Tipos Físicos de Fronteira**:
  1. *O Monolito (Fronteira em Código-Fonte)*:
     - Classes e funções no mesmo espaço de memória.
     - Fronteira mantida por modificadores de acesso, pacotes e interfaces polimórficas.
     - Custo de comunicação: Quase zero (nanossegundos).
  2. *Componentes de Implantação Dinâmica*:
     - DLLs, JARs, Shared Libraries (.so).
     - Mesma máquina e espaço de memória, mas processos de build e release independentes.
  3. *Processos Locais*:
     - Processos separados rodando no mesmo sistema operacional que se comunicam via sockets, pipes ou shared memory.
  4. *Serviços / Microsserviços*:
     - Fronteiras mais rígidas e custosas. Comunicação via rede (TCP, HTTP, gRPC).
     - Custo de comunicação: Milissegundos (milhões de vezes mais lento que chamada local).
- **A Regra de Ouro da Anatomia**:
  A arquitetura lógica é a mesma, independentemente da fronteira física escolhida: as dependências continuam apontando das políticas de menor nível para as de maior nível.

## Key Concepts
- **Custo de Fronteira**: Latência, complexidade de serialização e tratamento de falhas aumentam à medida que se desce na lista.
- **Fronteira Lógica vs Física**: É possível ter uma fronteira perfeitamente limpa dentro de um monolito e um espaguete caótico entre microsserviços.

## Mental Models
- **Paredes de Drywall vs Muros de Concreto**: Dentro de um monolito, as fronteiras são de drywall (rápidas de mudar, mas exigem disciplina para não quebrar); entre serviços, são muros de concreto armado.

## Anti-patterns
- **Assumir que Microsserviço Garante Boa Arquitetura**: Criar um monolito distribuído de microserviços todos acoplados entre si pelo banco de dados central compartilhado.
