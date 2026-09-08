# Capítulo 27: Serviços: Grandes e Pequenos

## Core Idea
Arquiteturas orientadas a serviços (SOA) e microsserviços são frequentemente promovidas como soluções mágicas para desacoplamento e desenvolvimento independente. No entanto, **serviços em si não são arquiteturas**: um serviço pode ser um monolito espaguete internamente, e serviços distribuídos podem estar catastroficamente acoplados por dados compartilhados e dependências temporais.

## Frameworks Introduced
- **A Ilusão do Desacoplamento Perfeito dos Serviços**:
  - *Mito 1: Serviços são completamente desacoplados no nível de código-fonte.* Verdade, mas eles continuam fortemente acoplados pelos esquemas de dados transmitidos e pela semântica das chamadas.
  - *Mito 2: Serviços garantem desenvolvimento e implantação independentes.* Se a adição de uma funcionalidade exige coordenar releases simultâneos em 6 serviços diferentes, eles são um **monolito distribuído**.
- **O Problema do Gato (The Kitty Problem)**:
  - Uncle Bob usa o exemplo de uma empresa de táxi com serviços separados: `Passageiros`, `Motoristas`, `Frotas`, `Pagamentos`.
  - Quando a empresa decide lançar um novo serviço de entrega de animais de estimação (gatos e cães), a regra de transporte de animais afeta o cálculo de preço, a elegibilidade dos motoristas, as restrições da frota e o aplicativo do passageiro.
  - Todos os serviços precisaram ser alterados juntos: a fronteira de serviços não coincidia com a fronteira de mudança de requisitos.
- **Serviços Baseados em Componentes**:
  - Serviços devem ser construídos internamente com os princípios da Arquitetura Limpa (SOLID, Entidades, Casos de Uso). Cada serviço deve ter limites internos bem desenhados.

## Key Concepts
- **Monolito Distribuído**: O pior dos dois mundos: toda a complexidade de rede e latência dos microsserviços somada ao acoplamento engessado do monolito.
- **Preocupações Transversais (Cross-Cutting Concerns)**: Requisitos que cortam todos os serviços e exigem governança unificada.

## Mental Models
- **Casas na Mesma Vila**: Viver em casas separadas não impede brigas de vizinhos se todas as casas dependerem do mesmo encanamento de água furado.

## Anti-patterns
- **Microsserviços por Entidade de Banco (CRUD Services)**: Criar um microsserviço para a tabela `Usuario`, outro para `Produto` e outro para `Pedido`, transformando cada caso de uso em uma cascata de requisições HTTP lentas.
