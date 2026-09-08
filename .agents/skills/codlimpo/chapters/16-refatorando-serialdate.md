# Capítulo 16: Refatorando o SerialDate

## Core Idea
O exame minucioso da classe `SerialDate` da biblioteca JCommon (David Gilbert) demonstra como auditar código de produção respeitado, apontando falhas de design, dependências ocultas, nomes desajeitados e violações do SRP para reconstruir uma solução moderna e limpa.

## Frameworks Introduced
- **Achados da Auditoria de Código (Code Review Crítico)**:
  - *Nome Enganoso*: A classe não era "Serial" no sentido de serialização de rede, mas no sentido de número de série ordinal de dias.
  - *Constantes Mágicas Herdadas*: O uso de inteiros primitivos para representar meses (`1 = Janeiro`) em vez de enumerações tipadas (`Month.JANUARY`).
  - *Superclasse Dependendo de Subclasse*: A classe abstrata `SerialDate` referenciava diretamente sua implementação concreta `SpreadsheetDate` em métodos de fábrica (violação direta do DIP).
  - *Herança Desnecessária*: A classe herdava de `Comparable` e `Serializable` sem implementar os contratos adequadamente.
- **O Processo de Reconstrução**:
  1. Reorganizar testes unitários e aumentar a cobertura para cobrir bugs ocultos encontrados durante a leitura.
  2. Renomear para `DayDate` para refletir o verdadeiro propósito da classe.
  3. Extrair os meses para uma enumeração rica e autônoma `Month`.
  4. Mover métodos utilitários de cálculo de anos bissextos para locais de responsabilidade correta.

## Key Concepts
- **DIP nas Fábricas Abstratas**: Classes base abstratas nunca devem importar ou instanciar suas subclasses concretas.
- **Enumerações Fortemente Tipadas**: Substituir constantes inteiras soltas por enums com comportamento próprio.

## Mental Models
- **O Exame Clínico Geral**: Olhar para todos os sinais vitais do código: nomenclatura, dependências, herança, tratamento de nulos e suíte de testes.

## Anti-patterns
- **Constantes Interface (Interface Constants Pattern)**: Criar uma interface cheia de constantes numéricas apenas para que classes a implementem e herdem os números diretamente no escopo léxico.
