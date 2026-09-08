# Capítulo 7: SRP - O Princípio da Responsabilidade Única

## Core Idea
Historicamente enunciado como "um módulo deve fazer apenas uma coisa", a versão arquitetural definitiva do SRP diz: **Um módulo deve ter uma, e apenas uma, razão para mudar**, o que significa: **Um módulo deve ser responsável por um, e apenas um, ator (usuário ou grupo de stakeholders com os mesmos interesses)**.

## Frameworks Introduced
- **Identificação dos Atores de Negócio**:
  - *CFO (Financeiro)*: Quer saber o cálculo de horas extras e folha de pagamento.
  - *COO (Operações)*: Quer saber o cálculo de horas trabalhadas e alocação de turnos.
  - *CTO (Tecnologia/DBAs)*: Quer saber a estratégia de persistência e schema de banco.
- **Os Sintomas da Violação do SRP**:
  - *Sintoma 1: Duplicação Acidental de Algoritmos*: Compartilhar uma função utilitária comum (`regularHours()`) entre CFO e COO; quando o CFO altera a regra de cálculo, quebra silenciosamente os relatórios de turnos do COO.
  - *Sintoma 2: Conflitos de Fusão (Merge Conflicts)*: Desenvolvedores de diferentes áreas alterando o mesmo arquivo de entidade gigante ao mesmo tempo no Git.
- **Solução Arquitetural**:
  Separar os dados (um DTO simples `EmployeeData`) das funções especializadas que atendem a cada ator (`PayCalculator`, `HourReporter`, `EmployeeSaver`), orquestradas opcionalmente por uma Fachada (Facade).

## Key Concepts
- **Ator**: Pessoa ou grupo de pessoas que demandam alterações no sistema.
- **Coesão**: Força que une os códigos que mudam juntos pelas mesmas razões.

## Mental Models
- **O Canivete Suíço com Lâminas Independentes**: Se você afiar a tesoura, não pode entortar a lâmina da faca.

## Anti-patterns
- **God Class**: A classe `Employee` ou `Order` com 4.000 linhas contendo regras financeiras, queries SQL, renderização HTML e envio de e-mails.

## Worked Example
```python
# Violação clássica do SRP
class EmployeeViolador:
    def calculate_pay(self): pass    # Atende ao CFO
    def report_hours(self): pass     # Atende ao COO
    def save_to_db(self): pass       # Atende ao CTO

# Resolução SRP: Dados separados das operações de cada ator
from dataclasses import dataclass

@dataclass
class EmployeeData:
    id: str
    nome: str
    horas_base: float
    taxa_hora: float

class PayCalculator: # Ator: CFO
    def calculate_pay(self, data: EmployeeData) -> float:
        return data.horas_base * data.taxa_hora

class HourReporter: # Ator: COO
    def report_hours(self, data: EmployeeData) -> str:
        return f"Horas de {data.nome}: {data.horas_base}h"

class EmployeeRepository: # Ator: CTO
    def save(self, data: EmployeeData) -> None:
        # Lógica SQL/ORM
        pass
```
