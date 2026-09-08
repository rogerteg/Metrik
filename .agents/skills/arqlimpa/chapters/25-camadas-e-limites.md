# Capítulo 25: Camadas e Limites

## Core Idea
Através do clássico estudo de caso do jogo de aventura *Hunt the Wumpus*, Uncle Bob demonstra que sistemas aparentemente simples contêm múltiplas camadas ortogonais de regras de negócio, dados e interfaces, e que os limites arquiteturais podem ser necessários em direções inesperadas.

## Frameworks Introduced
- **Estudo de Caso: Hunt the Wumpus**:
  - Versão inicial: Jogo em linha de comando (terminal de texto).
  - Primeira evolução: Mudar para interface Web ou Gráfica.
  - Segunda evolução: Manter as regras do jogo (labirinto, flechas, monstros) intactas enquanto se suporta múltiplos idiomas (internacionalização) e diferentes backends de armazenamento.
- **Cruzando os Fluxos (Crossing the Streams)**:
  - O fluxo de dados não é linear; há múltiplos fluxos simultâneos cruzando a fronteira (o fluxo do jogador, o fluxo da persistência, o fluxo de rede para jogos multiplayer).
- **Dividindo os Fluxos em Fronteiras Ortogonais**:
  - Uma fronteira para regras do jogo (núcleo).
  - Uma fronteira para a linguagem/idioma (apresentação).
  - Uma fronteira para persistência e estado do tabuleiro.
  - A arquitetura permite que o jogo mude de Português para Inglês sem tocar nas regras de combate do Wumpus.

## Key Concepts
- **Fronteiras Ortogonais**: Limites que separam preocupações independentes que variam em eixos distintos.
- **Mapeamento de Fluxos**: Rastreamento dos caminhos percorridos pelos dados através das camadas do sistema.

## Mental Models
- **O Tabuleiro Modular**: O tabuleiro de xadrez em madeira e as peças entalhadas são os mesmos; você pode jogar presencialmente ou transmitir os movimentos por telégrafo, rádio ou internet.

## Anti-patterns
- **Acoplar o Idioma à Regra de Combate**: Colocar strings de texto fixas em português ("O monstro te acertou!") dentro do algoritmo que calcula dano de batalha.
