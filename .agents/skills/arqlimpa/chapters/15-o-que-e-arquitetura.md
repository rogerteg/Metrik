# Capítulo 15: O Que é Arquitetura?

## Core Idea
A arquitetura de um sistema é a forma dada àquele sistema pelos seus construtores. O propósito dessa forma é facilitar o desenvolvimento, a implantação, a operação e a manutenção do software. A estratégia central para alcançar isso é **manter o maior número possível de opções em aberto pelo maior tempo possível**.

## Frameworks Introduced
- **Os Quatro Pilares Operacionais da Arquitetura**:
  1. *Desenvolvimento*: Uma boa arquitetura permite que múltiplas equipes trabalhem de forma autônoma sem pisar nos pés umas das outras.
  2. *Implantação (Deployment)*: A implantação deve ser rápida, automatizada e unitária ("em um clique").
  3. *Operação*: A arquitetura deve tornar a lógica de execução e fluxo de dados evidente aos operadores.
  4. *Manutenção*: O custo mais oneroso de todo o ciclo de vida. Reduzir a exploração cognitiva e o risco de efeitos colaterais.
- **A Arte de Adiar Decisões de Detalhe**:
  - Um bom arquiteto não decide o banco de dados no dia 1.
  - Um bom arquiteto não decide o framework web no dia 1.
  - A arquitetura permite que essas decisões técnicas de detalhe sejam postergadas até o momento em que se tenha o máximo de informação empírica disponível.

## Key Concepts
- **Opções Abertas**: Capacidade de trocar tecnologias secundárias (Postgres por MongoDB, REST por gRPC) com impacto mínimo nas regras de negócio.
- **Detalhes vs Políticas**: A regra de negócio é política de alto nível; o banco de dados e o protocolo web são detalhes de baixo nível.

## Mental Models
- **O Plug Elétrico Universal**: Criar um sistema onde o motor de regras de negócio é a televisão e o provedor de persistência é a tomada; a TV não se importa se a energia vem de hidrelétrica ou solar.

## Anti-patterns
- **Arquitetura Orientada a Currículo (CV-Driven Development)**: Começar o projeto escolhendo o framework da moda ou o banco NoSQL mais recente antes de conhecer as regras de negócio.
