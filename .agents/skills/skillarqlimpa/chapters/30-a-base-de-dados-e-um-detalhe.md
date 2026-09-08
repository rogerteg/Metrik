# Capítulo 30: A Base de Dados é um Detalhe

## Core Idea
Do ponto de vista arquitetural, **o banco de dados não é a arquitetura**: ele é um mero detalhe de baixo nível. O banco de dados é simplesmente uma ferramenta de persistência transitória para mover dados da memória volátil para um dispositivo de armazenamento persistente.

## Frameworks Introduced
- **A História e Predomínio dos SGBDs**:
  - Bancos relacionais surgiram para organizar discos magnéticos rotativos lentos baseados em cabeçotes mecânicos.
  - A estrutura relacional em tabelas (linhas e colunas) é otimizada para o armazenamento e recuperação em disco, e não para o modelo mental orientado a objetos de regras de negócio.
- **E se Não Houvesse Disco?**:
  - Experimento mental de Uncle Bob: Se a memória RAM fosse infinita, não-volátil e barata, nós usaríamos bancos relacionais SQL? Não! Teríamos grafos de objetos vivos na memória.
  - O banco de dados existe apenas para suprir a deficiência de volatilidade da memória física.
- **Isolando o Banco de Dados como um Plugin**:
  - Os Casos de Uso operam com Entidades de negócio ricas em memória.
  - Gateways de persistência (Repositories) salvam e carregam essas entidades.
  - O formato em que os dados são salvos (tabelas SQL, documentos JSON, chave-valor ou arquivos de texto) é irrelevante para a lógica de negócio.

## Key Concepts
- **Database Gateway**: Abstração pura que oculta a tecnologia de banco de dados das regras de negócio.
- **Impedância Objeto-Relacional**: O atrito conceitual natural entre o paradigma de objetos e o modelo de tabelas relacionais.

## Mental Models
- **O Depósito de Malas da Estação**: Você viaja e vive suas experiências com seus pertences; o depósito da estação é apenas o local escuro onde as malas ficam guardadas quando você vai dormir.

## Anti-patterns
- **Arquitetura Database-First**: Começar a modelagem do sistema desenhando tabelas no MySQL com chaves estrangeiras e construindo as entidades como meros espelhos das tabelas.
