# Capítulo 9: LSP - O Princípio de Substituição de Liskov

## Core Idea
Formulado por Barbara Liskov em 1988: **Se para cada objeto o1 do tipo S há um objeto o2 do tipo T tal que, para todos os programas P definidos em termos de T, o comportamento de P não muda quando o1 é substituído por o2, então S é um subtipo de T**. Em arquitetura limpa: subtipos e implementações devem ser perfeitamente intercambiáveis sem violar contratos implícitos ou explícitos.

## Frameworks Introduced
- **O Problema Quadrado / Retângulo**:
  - Matematicamente, todo quadrado é um retângulo.
  - No código de modelagem: um `Quadrado` que herda de `Retangulo` quebra o contrato quando um método altera `set_altura(h)` esperando que a largura permaneça inalterada.
  - Conclusão: Modelagem de software trata de **comportamento e contratos**, e não de taxonomia matemática ingênua.
- **LSP em Nível de Arquitetura**:
  O LSP não se limita a classes e herança; aplica-se a serviços, microsserviços e APIs REST. Se duas APIs que deveriam fornecer a mesma interface de pagamento exigem formatos de data diferentes ou campos adicionais arbitrários, o LSP arquitetural foi violado.

## Key Concepts
- **Conformidade de Contrato**: Pré-condições não podem ser fortalecidas na subclasse; pós-condições não podem ser enfraquecidas.
- **Intercambiabilidade**: Capacidade de trocar um componente A por B sem testes quebrando.

## Mental Models
- **Pilhas AA Padronizadas**: Se um brinquedo aceita pilhas AA de qualquer fabricante (Duracell, Rayovac), as pilhas respeitam o LSP; se uma pilha exigir uma trava plástica proprietária para funcionar, ela viola a substituição.

## Anti-patterns
- **Métodos que Lançam 'NotImplementedException'**: Uma classe herda uma interface mas não suporta metade dos métodos, lançando erros em tempo de execução.
- **Checagem de Tipo (`instanceof`) no Chamador**: O cliente precisa verificar `if (obj instanceof SubtipoEspecial)` para tratar exceções de comportamento.

## Worked Example
```python
# Violação do LSP
class ContaBancaria:
    def sacar(self, valor: float):
        self.saldo -= valor

class ContaInvestimentoFixada(ContaBancaria):
    def sacar(self, valor: float):
        # Quebra o contrato da classe base em tempo de execução!
        raise PermissionError("Saques não são permitidos antes do vencimento!")

# Respeitando o LSP: segregando capacidades
class ContaSomenteLeitura(ABC):
    @abstractmethod
    def consultar_saldo(self) -> float: pass

class ContaSaqueavel(ContaSomenteLeitura):
    @abstractmethod
    def sacar(self, valor: float) -> None: pass
```
