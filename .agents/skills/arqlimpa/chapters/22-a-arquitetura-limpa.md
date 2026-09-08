# Capítulo 22: A Arquitetura Limpa (The Clean Architecture)

## Core Idea
A síntese de Hexagonal (Ports & Adapters de Alistair Cockburn), Onion (de Jeffrey Palermo) e BCE (de Ivar Jacobson) em um modelo concêntrico universal unificado pela inegociável **Regra de Dependência**: **dependências de código-fonte só podem apontar para dentro, em direção às políticas de mais alto nível**.

## Frameworks Introduced
- **Os 4 Círculos Concêntricos**:
  1. **Entidades (Círculo Amarelo Central)**:
     - Regras de negócio corporativas críticas.
     - Menos suscetíveis a mudanças decorrentes de requisitos de tela ou interfaces.
  2. **Casos de Uso (Círculo Vermelho)**:
     - Regras de negócio específicas da aplicação.
     - Contêm os Interactors que orquestram o fluxo entre entidades e fronteiras.
  3. **Adaptadores de Interface (Círculo Verde)**:
     - Convertem dados entre o formato mais conveniente para os casos de uso e o formato mais conveniente para agentes externos.
     - Controllers, Presenters, Gateways de Banco de Dados, Mappers.
  4. **Frameworks e Drivers (Círculo Azul Externo)**:
     - Ferramentas externas voláteis: Banco de Dados, Web Server, UI, Dispositivos, Frameworks.
- **A Regra de Dependência Inquebrável**:
  - *Nada em um círculo interno pode saber absolutamente nada sobre algo em um círculo externo.*
  - Nomes de classes, funções, variáveis ou formatos de dados declarados no círculo externo nunca devem ser mencionados nos círculos internos.
- **Cruzamento de Limites (Crossing Boundaries)**:
  - Quando um Caso de Uso precisa enviar dados para a tela, ele não chama o Presenter diretamente; ele chama uma interface de *Output Boundary*. O Presenter implementa essa interface do lado de fora (DIP).

## Key Concepts
- **The Dependency Rule**: A lei fundamental que garante testabilidade, manutenibilidade e independência tecnológica.
- **Input / Output Boundaries**: Interfaces que blindam os casos de uso de quem os aciona e de quem consome seus resultados.

## Mental Models
- **A Fortaleza Medieval**: As muralhas externas protegem a torre central (o tesouro/as regras de negócio); quem está na torre não precisa saber a cor das pedras da muralha.

## Anti-patterns
- **O Círculo Invertido**: Casos de uso que importam `flask.request` ou `django.db.models`, violando mortalmente a Regra de Dependência.

## Worked Example
**O Fluxo Canônico Completo**:
```text
[Web Controller] ──(chama via Interface)──> [Input Boundary]
                                                    │
                                                    ▼
                                          [Caso de Uso Interactor]
                                           ├── usa ──> [Entidade]
                                           └── usa ──> [Database Gateway Interface]
                                                    │
                                                    ▼
[Web Presenter] <──(implementa)── [Output Boundary]
```
