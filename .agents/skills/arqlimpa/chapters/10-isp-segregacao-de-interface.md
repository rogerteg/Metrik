# Capítulo 10: ISP - O Princípio da Segregação de Interface

## Core Idea
**Nenhum cliente deve ser forçado a depender de métodos que não utiliza**. Depender de coisas desnecessárias cria acoplamento acidental: quando uma classe muda por razões que interessam apenas a outro cliente, todos os outros clientes não relacionados sofrem risco de recompilação, reimplementação e testes desnecessários.

## Frameworks Introduced
- **ISP em Nível de Linguagem**:
  Em linguagens estaticamente tipadas (Java, C++, C#), incluir um método não utilizado em uma interface força a recompilação e redistribuição de todos os módulos que a importam.
- **ISP em Nível de Arquitetura**:
  Se um microsserviço ou módulo de Casos de Uso expõe um payload gigante contendo dados de 15 operações diferentes para um cliente que só precisava de dois campos, qualquer alteração nas outras 14 operações força a quebra daquele cliente.

## Key Concepts
- **Interfaces Específicas de Cliente**: Criar interfaces sob medida para as necessidades de quem consome, e não de quem implementa.
- **Poluição de Módulos**: Acúmulo de métodos órfãos ou irrelevantes em contratos públicos.

## Mental Models
- **O Controle Remoto com 100 Botões**: A maioria das pessoas só usa Ligar, Desligar e Volume; ter que navegar por botões de sintonia de rádio AM nos anos 80 é a poluição de interface na prática.

## Anti-patterns
- **Interface Balde de Lixo (`GeneralService`)**: Interfaces que contêm 40 métodos misturando operações de autenticação, relatórios, processamento de pagamento e disparo de SMS.

## Worked Example
```python
# Violação do ISP: interface gorda
class OperacoesFinanceiras(ABC):
    def emitir_fatura(self): pass
    def estornar_pix(self): pass
    def recalcular_imposto_retido(self): pass

# Resolução ISP: Interfaces focadas por papel
class EmissorFatura(ABC):
    @abstractmethod
    def emitir_fatura(self) -> None: pass

class EstornadorPagamento(ABC):
    @abstractmethod
    def estornar_pix(self, id_transacao: str) -> None: pass

# O cliente de faturamento depende apenas do que precisa
class CheckoutService:
    def __init__(self, emissor: EmissorFatura):
        self.emissor = emissor
```
