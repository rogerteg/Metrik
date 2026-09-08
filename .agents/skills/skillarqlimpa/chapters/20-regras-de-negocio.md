# Capítulo 20: Regras de Negócio

## Core Idea
As regras de negócio são a razão primordial pela qual o software existe; elas geram ou economizam dinheiro para a empresa. Essas regras devem permanecer puras, testáveis e completamente isoladas de interfaces, frameworks e persistência.

## Frameworks Introduced
- **Os Dois Tipos de Regras de Negócio**:
  1. **Regras de Negócio Críticas (Entidades / Enterprise Business Rules)**:
     - Conceitos e regras que existiriam mesmo que não houvesse computador ou automação (ex: cálculo de juros bancários compostos, contrato de mútuo).
     - Uma **Entidade** encapsula esses dados e funções críticas de negócio.
  2. **Regras de Negócio da Aplicação (Casos de Uso / Use Cases)**:
     - Definem o comportamento do sistema automatizado específico.
     - Orquestram como os dados entram, como as Entidades são acionadas e como o resultado é preparado para retorno.
- **Modelos de Requisição e Resposta (DTOs)**:
  - Casos de uso recebem dados de entrada simples e retornam dados de saída simples (Request/Response DTOs).
  - *Regra Inquebrável*: DTOs não devem conter referências a classes de Entidade completas, evitando que detalhes internos vazem para a camada de apresentação.

## Key Concepts
- **Entidade**: Objeto puro de negócio que encapsula dados e regras corporativas críticas.
- **Caso de Uso (Interactor)**: Objeto que orquestra a execução de uma intenção específica do usuário.
- **Request / Response Models**: Estruturas de dados planas e desprovidas de comportamento para transporte seguro através da fronteira.

## Mental Models
- **O Maestro e os Músicos**: As Entidades são os instrumentos clássicos afinados; o Caso de Uso é o maestro regendo a execução da partitura específica daquela noite.

## Anti-patterns
- **Entidades Anêmicas com Serviços Monolíticos**: Entidades que são apenas sacos de getters/setters (`Employee`) com toda a lógica de negócio jogada em serviços de aplicação desordenados.

## Worked Example
```python
# 1. Regra de Negócio Crítica (Entidade)
class Emprestimo:
    def __init__(self, principal: float, taxa_anual: float):
        self.principal = principal
        self.taxa_anual = taxa_anual

    def calcular_parcela(self, meses: int) -> float:
        i = self.taxa_anual / 12
        return (self.principal * i) / (1 - (1 + i) ** -meses)

# 2. Modelo de Requisição / Resposta (DTOs puros)
from dataclasses import dataclass

@dataclass(frozen=True)
class SimularEmprestimoRequest:
    valor: float
    prazo_meses: int

@dataclass(frozen=True)
class SimularEmprestimoResponse:
    valor_parcela: float
    total_juros: float

# 3. Caso de Uso da Aplicação (Use Case / Interactor)
class SimularEmprestimoUseCase:
    TAXA_PADRAO = 0.12 # 12% ao ano

    def executar(self, req: SimularEmprestimoRequest) -> SimularEmprestimoResponse:
        emprestimo = Emprestimo(req.valor, self.TAXA_PADRAO)
        parcela = emprestimo.calcular_parcela(req.prazo_meses)
        total_pago = parcela * req.prazo_meses
        return SimularEmprestimoResponse(
            valor_parcela=round(parcela, 2),
            total_juros=round(total_pago - req.valor, 2)
        )
```
