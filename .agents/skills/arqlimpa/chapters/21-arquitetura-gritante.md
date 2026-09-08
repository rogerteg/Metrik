# Capítulo 21: Arquitetura Gritante (Screaming Architecture)

## Core Idea
Quando você olha para a planta baixa de uma casa, ela não grita "tijolos e cimento"; ela grita "sala, quarto, cozinha". Da mesma forma, quando você olha para a estrutura de pastas e módulos de um software, **ela deve gritar a intenção de negócio do sistema** (ex: *Sistema de Folha de Pagamento* ou *Controle de Inventário*), e **nunca o framework utilizado** (ex: *Rails*, *Spring Boot*, *Express* ou *Django*).

## Frameworks Introduced
- **O Propósito da Arquitetura Gritante**:
  - Facilitar a leitura por novos desenvolvedores: saber imediatamente o que o sistema *faz*, e não como ele é entregue na web.
  - Testabilidade sem frameworks: Casos de uso podem ser executados e testados em milissegundos sem levantar servidores HTTP ou bancos.
- **Frameworks são Ferramentas, Não Modos de Vida**:
  - Autores de frameworks querem que você se case com a ferramenta deles (coloque suas classes herdando de `ControllerBase`, use o ORM em tudo).
  - O arquiteto limpo mantém uma relação de distância prudente: o framework é mantido na beirada externa como mero detalhe de entrega.

## Key Concepts
- **Screaming Architecture**: Organização estrutural em torno de domínios e casos de uso, e não em torno de artefatos de framework.
- **Independência de Framework**: O sistema roda perfeitamente sem o framework estar carregado.

## Mental Models
- **A Planta Baixa de uma Biblioteca**: Você bate o olho e vê estantes, mesas de leitura e balcão de empréstimo; você não vê o modelo da betoneira usada para subir as paredes.

## Anti-patterns
- **Estrutura Gritante de Framework**: O projeto abre e mostra:
  ```text
  controllers/
  models/
  views/
  helpers/
  ```
  Ninguém sabe se o software é um hospital, um banco ou um jogo de xadrez até abrir 50 arquivos.

## Worked Example
**Estrutura Gritante Clean**:
```text
pedidos/
  ├── criar_pedido_use_case.py
  ├── cancelar_pedido_use_case.py
  ├── calcular_frete_use_case.py
  ├── pedido_entity.py
  └── gateway_pedido_interface.py
faturamento/
  ├── emitir_nota_fiscal_use_case.py
  └── nota_fiscal_entity.py
```
