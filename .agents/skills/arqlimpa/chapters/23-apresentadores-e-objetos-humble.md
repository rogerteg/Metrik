# Capítulo 23: Apresentadores e Objetos Humble

## Core Idea
O padrão **Humble Object** (Objeto Humilde) foi originalmente concebido por Gerard Meszaros para testes unitários e tornou-se um dos pilares da arquitetura limpa: ele separa um comportamento em duas partes — uma parte "humilde", desprovida de inteligência e difícil de testar (que conversa com a infraestrutura/GUI), e outra parte rica em lógica, puramente testável e desacoplada da infraestrutura.

## Frameworks Introduced
- **A Dupla Presenter & View**:
  - *View (Humble Object)*: Código de GUI burro. Apenas pega os dados já mastigados de um ViewModel e os coloca na tela (widgets, labels, inputs). Quase não contém lógica e não precisa de testes unitários complexos.
  - *Presenter (Testável)*: Pega o Response Model do Caso de Uso e formata cada dado para a View (converte floats em strings formatadas com moeda, booleanos em cores/visibilidade). Altamente testável com testes de unidade puros.
  - *ViewModel*: Um DTO simples contendo strings, booleanos e estruturas planas prontas para exibição.
- **Database Gateways e Mappers**:
  - O Caso de Uso interage com uma interface de Gateway (ex: `UserDataGateway`).
  - A implementação concreta do Gateway é um Humble Object que usa SQL/ORM para ler as tabelas e converter em Entidades puras de domínio.

## Key Concepts
- **Humble Object**: Padrão de design que isola elementos difíceis de testar em componentes sem lógica.
- **ViewModel**: Modelo de dados burro formatado estritamente para a apresentação.
- **Database Gateway**: Interface que oculta o dialeto SQL ou chamada NoSQL dos casos de uso.

## Mental Models
- **O Garçom e a Cozinha**: O garçom (View/Humble) apenas leva o prato até a mesa do cliente; ele não cozinha nem decide a receita. Toda a gastronomia (lógica) acontece na cozinha isolada (Presenter / Caso de Uso).

## Anti-patterns
- **Lógica de Formatação na Tela**: A View decide se a cor é vermelha ou verde checando `if (saldo < 0)` em vez de simplesmente ler `viewModel.cor_saldo`.

## Worked Example
```python
# 1. Output do Caso de Uso (Response Model com tipos primitivos de negócio)
@dataclass
class SaldoResponse:
    saldo: float
    data_limite: datetime

# 2. ViewModel (Formatado para a View burra)
@dataclass
class SaldoViewModel:
    saldo_formatado: str  # "R$ 1.250,50"
    alerta_negativo: bool # True
    cor_texto: str        # "red"

# 3. Presenter (Altamente testável, sem dependência de framework UI)
class SaldoPresenter:
    def formatar(self, resp: SaldoResponse) -> SaldoViewModel:
        is_neg = resp.saldo < 0
        return SaldoViewModel(
            saldo_formatado=f"R$ {resp.saldo:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
            alerta_negativo=is_neg,
            cor_texto="red" if is_neg else "green"
        )
```
