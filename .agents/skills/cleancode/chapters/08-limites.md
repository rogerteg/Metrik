# Capítulo 8: Limites (Boundaries)

## Core Idea
Raramente controlamos todo o software que utilizamos: consumimos pacotes open source, SDKs de fornecedores e APIs de outras equipes. Manter os limites do nosso sistema limpos significa integrar código externo sem permitir que os conceitos e idiossincrasias desse código contaminem nosso domínio limpo.

## Frameworks Introduced
- **Encapsulando Limites (The Boundary Encapsulation)**:
  Se você usar um `Map` ou `dict` para transportar dados de negócio, qualquer código cliente pode chamar `clear()` ou inserir chaves de tipos inesperados. Encapsule o mapa de terceiros dentro de uma classe própria do seu domínio (`Sensors`) com métodos fortemente tipados (`getById()`), impedindo que o resto do sistema se acople à interface genérica da biblioteca.
- **Testes de Aprendizado (Learning Tests)**:
  Em vez de passar dias lendo manuais ou depurando código de terceiros diretamente na sua aplicação, escreva pequenos testes de unidade focados em exercitar a biblioteca externa da forma como você planeja usá-la.
  - *Vantagens*: Validam sua compreensão da ferramenta e funcionam como alarme de fumaça imediato quando uma nova versão da dependência for lançada.
- **Usando Código que Ainda Não Existe (The Adapter Pattern)**:
  Se a outra equipe ainda não entregou a API de comunicação com o rádio transmissor, crie uma interface limpa baseada no que você *deseja* (`TransmitterBoundary`) e implemente um adaptador fictício. Quando a equipe finalmente entregar o código real, basta criar um adaptador concreto que conecta a interface desejada à API real entregue.

## Key Concepts
- **Fronteira Limpa com Terceiros**: Código de domínio não deve conhecer detalhes de bibliotecas externas transitórias.
- **Testes de Aprendizado**: Testes unitários cujo propósito exclusivo é validar e documentar o comportamento de bibliotecas de terceiros.

## Mental Models
- **O Adaptador de Tomada Internacional**: Você não troca o cabo do seu notebook toda vez que viaja para a Inglaterra; você usa um adaptador físico que conecta o plugue do seu notebook à tomada inglesa de parede.

## Anti-patterns
- **Espalhar Tipos de Bibliotecas Externas por Todo o Sistema**: Usar tipos de frameworks de terceiros em assinaturas de métodos de serviços e entidades do núcleo da aplicação.
