# Capítulo 7 — Distributed Systems

**Livro**: Security Engineering (Anderson) · `chapters/ch07-distributed-systems.md`

## Core Idea
Sistemas distribuídos são aqueles em que "a falha de um computador que você nem sabia que existia pode derrubar o seu". Segurança e confiabilidade em sistemas distribuídos são inseparáveis: **concorrência, estado, tempo e nomes** criam vulnerabilidades que não existem em sistemas isolados. Anderson conecta os clássicos de sistemas distribuídos (Lamport e cia.) aos problemas de segurança.

## Frameworks Introduced
- Problemas de **concorrência** e consistência de estado em réplicas.
- **Modelos de falha** e **tolerância a falhas / recuperação**.
- **Naming** e os princípios de Needham (identificar corretamente quem/ o quê).
- Relação entre **confiabilidade (dependability)** e segurança sob adversário.

## Key Concepts
- **Concorrência**:
  - **Usar dado velho vs. pagar para propagar estado**: trade-off entre consistência e disponibilidade/custo.
  - **Locking** para evitar atualizações inconsistentes; **ordem das atualizações** importa.
  - **Deadlock**: locks concorrentes mal ordenados.
  - **Estado não-convergente**: réplicas divergem (split-brain) — e como isso vira brecha de segurança.
  - **Secure time**: tempo é central para protocolos (tickets, expiração) e é **inseguro por natureza** em sistemas distribuídos.
- **Tolerância a falhas e recuperação**:
  - **Modelos de falha**: crash, omissão, temporização, bizantina (arbitrária/ maliciosa).
  - **Para que serve resiliência?** (continuidade de serviço, não apenas "não cair").
  - **Em que nível está a redundância?** (dados, máquina, site, organização).
  - **Service-denial attacks**: o atacante explora a necessidade de disponibilidade — DoS como ataque de disponibilidade distribuída.
- **Naming**:
  - **Princípios de naming de Needham**: distinção entre nome (identidade) e endereço (localização); names devem ser *globalmente únicos*, *verificáveis* e *não reutilizáveis*; separar descrição de identidade.
  - **O que mais dá errado**: confusão entre nome e endereço, spoofing de identidade, cache poisoning, reuso de nomes.

## Mental Models
- **Em sistemas distribuídos, "estado global consistente" é uma ilusão cara** — o adversário explora exatamente a janela entre o que cada nó acredita.
- **Tempo distribuído não existe**: nunca confie em carimbo de tempo remoto sem fonte confiável.
- **Redundância pode ser adversária**: mais réplicas = mais superfície de ataque (a menos que bem isoladas).
- **Nome/identidade é a raiz da confiança**: se você não sabe *quem* está falando (nome verificável), nada do resto importa.
- **A falha que importa para segurança é a maliciosa (bizantina)**, não só a acidental — modelos de falha acidental subestimam o adversário.

## Anti-patterns
- Confiar em relógios/ordenação local como se fossem globais.
- Assumir **consistência forte** sem custo (ou assumir *nenhuma* consistência e criar corridas).
- Identificar entidades por **endereço** (IP) em vez de identidade criptográfica.
- Single point of failure sem pensar no **adversário derrubando** o ponto único.
- Sem plano de **recuperação** — a disponibilidade não é só sobre aguentar carga, é sobre voltar de falha/ataque.

## Worked Example
**Serviço de autenticação (estilo Kerberos/Tickets) distribuído**: um nó emite tickets com validade baseada em tempo; outro valida. Ameaças: (a) relógios dessincronizados quebram a validade (ou permitem replay se a janela for larga demais); (b) o servidor de tickets vira **ponto único** — atacante faz DoS nele para paralisar o sistema; (c) nomes de principal devem ser únicos/verificáveis para evitar que um serviço "finja" ser outro. Defesas: sincronização segura de tempo, réplicas do servidor, e identidades com chaves próprias verificáveis (nomes + cripto).

## Key Takeaways
1. **Concorrência, tempo e estado** são as fontes silenciosas de vulnerabilidade distribuída.
2. Adote **modelos de falha** que incluam o comportamento **malicioso**.
3. Projete **nomes/identidades** verificáveis e separados de endereços.
4. Planeje **recuperação e resistência a DoS** como parte da segurança.

## Connects To
- Cap. 4 (protocolos) — Needham-Schroeder/Kerberos usam tempo e nomes.
- Cap. 21 (rede) — DoS, BGP/DNS, topologia.
- Cap. 20 (blockchain) — consenso distribuído, tempo e estado.
