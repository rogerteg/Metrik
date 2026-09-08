# Capítulo 17: Fronteiras: Estabelecendo Limites

## Core Idea
A arquitetura de software é a arte de desenhar linhas divisórias (fronteiras) entre elementos de software para mantê-los isolados uns dos outros. Essas fronteiras colocam os detalhes técnicos triviais do lado de fora e as políticas de negócio essenciais do lado de dentro.

## Frameworks Introduced
- **O Caso FitNesse**:
  Uncle Bob relata o desenvolvimento do FitNesse: uma ferramenta de testes completa que funcionou durante anos gravando arquivos simples em disco antes de qualquer decisão sobre banco de dados relacional. O banco de dados foi adiado com sucesso por anos graças a uma fronteira limpa.
- **Arquitetura de Plug-ins**:
  A fronteira divide o sistema em duas partes: o **Núcleo** (Core de Negócio) e os **Plug-ins** (UI, Banco, Web, Dispositivos).
  - O Núcleo não sabe nada sobre os Plug-ins.
  - Os Plug-ins sabem tudo sobre as interfaces do Núcleo e se acoplam a elas.
- **Fronteiras e Entrada/Saída (I/O)**:
  A entrada e a saída são irrelevantes para as regras de negócio centrais; a GUI e os dispositivos são meros detalhes de apresentação.

## Key Concepts
- **Fronteira Arquitetural**: Linha de separação com controle estrito de fluxo e dependência.
- **Decisão Adiada com Sucesso**: Quando uma equipe consegue rodar o sistema por meses sem decidir qual banco ou cloud usará.

## Mental Models
- **A Fronteira Alfandegária**: Para cruzar a fronteira de um país, você deve passar pelo posto de controle com passaporte padronizado (interface); você não pode simplesmente invadir o território interno.

## Anti-patterns
- **Vazar Tipos de ORM para a Regra de Negócio**: Decorar entidades de negócio com `@Entity`, `@Table` e anotações do Hibernate/Prisma, destruindo a fronteira e tornando o domínio refém da ferramenta de persistência.
