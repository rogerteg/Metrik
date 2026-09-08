# Capítulo 31: A Web é um Detalhe

## Core Idea
A World Wide Web é apenas mais um dispositivo de entrada e saída (E/S) em uma longa linha histórica de dispositivos: cartões perfurados, teleimpressores, telas de fósforo verde, terminais VT100 e agora navegadores web. **A web não deve influenciar a arquitetura central do seu sistema**.

## Frameworks Introduced
- **O Pêndulo Infinito da Computação**:
  - *Anos 60/70*: Centralizado (Mainframes e terminais burros).
  - *Anos 80/90*: Descentralizado (PCs e clientes gordos cliente/servidor).
  - *Anos 2000*: Centralizado novamente (Servidores Web e navegadores burros renderizando HTML).
  - *Anos 2010/2020*: Descentralizado novamente (SPAs ricas em React/Vue rodando no cliente).
  - *Conclusão Arquitetural*: Como o pêndulo oscila continuamente, amarrar suas regras de negócio à web garante que o sistema envelhecerá mal a cada troca de ciclo.
- **A Web como Dispositivo de Apresentação**:
  - A web é uma interface gráfica de entrega.
  - A aplicação deve ser capaz de ser executada a partir de uma interface web, de um console de linha de comando (CLI) ou de uma suíte de testes sem alterar uma única linha de Caso de Uso ou Entidade.

## Key Concepts
- **Independência de Mecanismo de Entrega**: Capacidade de expor as mesmas regras de negócio via Web REST, GraphQL, WebSocket ou CLI.
- **GUI como Detalhe de E/S**: Tratar a Web como um teclado e monitor sofisticados.

## Mental Models
- **O Caixa Eletrônico e o Internet Banking**: A transferência bancária tem exatamente as mesmas regras de saldo e limite se for feita na tela de toque do caixa eletrônico físico ou pelo navegador web.

## Anti-patterns
- **Contaminação Web no Domínio**: Métodos de caso de uso recebendo `HttpRequest`, retornando `HttpResponse(status=200)` ou manipulando cookies e headers HTTP diretamente no modelo de negócio.
