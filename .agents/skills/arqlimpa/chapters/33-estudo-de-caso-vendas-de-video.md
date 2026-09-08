# Capítulo 33: Estudo de Caso: Vendas de Vídeo

## Core Idea
Uncle Bob sintetiza todos os conceitos do livro em um estudo de caso prático e real: um sistema de vendas e streaming de vídeos online, demonstrando como sair da análise de requisitos até a divisão dos componentes e o desenho dos limites arquiteturais.

## Frameworks Introduced
- **Passo a Passo do Design Arquitetural**:
  1. *Análise dos Casos de Uso*:
     - Visualizar catálogo de vídeos, comprar vídeo, assistir streaming, autenticar usuário, moderar comentários.
  2. *Identificação dos Atores*:
     - Espectador, Comprador, Autor de Vídeo, Administrador do Sistema.
  3. *Separação em Camadas e Limites*:
     - *Entidades*: `Video`, `Usuario`, `LicencaDeVisualizacao`.
     - *Casos de Uso*: `ComprarVideoUseCase`, `TransmitirVideoUseCase`.
     - *Adaptadores*: `VideoCatalogPresenter`, `StripePaymentGateway`, `S3VideoStorageGateway`.
     - *Frameworks/Drivers*: FastAPI, Postgres, Player Web HTML5.
- **Gestão de Dependências no Estudo de Caso**:
  - Demonstração do diagrama de componentes completo com todas as setas apontando na direção da regra de dependência: do banco e da web em direção aos casos de uso.

## Key Concepts
- **Particionamento por Atores e Casos de Uso**: Como estruturar pacotes refletindo o negócio.
- **Rastreabilidade Arquitetural**: Acompanhar um clique na tela até a persistência no banco garantindo que nenhuma dependência aponte na direção errada.

## Mental Models
- **O Quebra-Cabeça Montado**: Cada peça (componente) se encaixa perfeitamente sem forçar as bordas porque os pinos e reentrâncias (interfaces) foram desenhados com antecedência.

## Worked Example
O diagrama de componentes do estudo de caso demonstra que o componente de `Streaming` e o componente de `Visualização de Catálogo` são pacotes independentes: uma falha no sistema de pagamento não derruba a exibição de vídeos já comprados pelo usuário.
