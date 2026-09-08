# Capítulo 12: Componentes

## Core Idea
Componentes são as **unidades de implantação** de um sistema de software: a menor entidade que pode ser implantada como parte de um executável (como JARs em Java, DLLs/assemblies em .NET, gems em Ruby ou pacotes wheel em Python).

## Frameworks Introduced
- **Evolução Histórica da Ligação (Linking)**:
  - *Início da computação*: Programas compilados para endereços de memória fixos; bibliotecas precisavam de alocação estática manual.
  - *Relocalização e Linkers*: Surgimento de carregadores relocalizáveis e ligadores que resolvem símbolos externos automaticamente em tempo de execução ou compilação.
  - *A Era da Compilação Dinâmica*: Hoje ligadores dinâmicos executam em frações de segundo, permitindo que componentes sejam implantados de forma independente.
- **Componentes como Blocos Arquiteturais**:
  A arquitetura de alto nível não é organizada apenas em classes individuais, mas na composição e no desacoplamento desses componentes implantáveis.

## Key Concepts
- **Unidade de Implantação**: Pacote autônomo versionável e distribuível de forma independente.
- **Ligação Tardia (Late Binding)**: Resolução de dependências em tempo de carga/execução.

## Mental Models
- **Peças de Lego Prontas**: Em vez de fundir o plástico no chão da fábrica, os módulos são blocos padronizados com pinos de encaixe bem definidos.

## Anti-patterns
- **Componentes Monolíticos Indivisíveis**: Tratar um sistema corporativo de 2 milhões de linhas como uma única unidade indivisível onde qualquer alteração exige a reimplantação total de tudo.
