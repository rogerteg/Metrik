# Capítulo 7: Tratamento de Erro

## Core Idea
O tratamento de erros é crucial para a robustez de um sistema, mas quando ele obscurece a lógica principal do negócio, ele está sendo feito de forma errada. Código limpo é legível e robusto; ele trata erros com elegância sem transformar o fluxo de execução em um labirinto de checagens.

## Frameworks Introduced
- **Use Exceções em Vez de Retornar Códigos de Erro**:
  Retornar códigos de erro (como `-1`, `NULL` ou `STATUS_INVALID`) polui o chamador com condicionais infinitas de checagem. Lance exceções para separar o caminho feliz do caminho de tratamento de falhas.
- **Escreva o Bloco `try-catch-finally` Primeiro**:
  O bloco `try` define um escopo transacional: independentemente do que falhar dentro do `try`, o `catch` deve deixar o sistema em um estado consistente.
- **Use Exceções Não Checadas (Unchecked Exceptions)**:
  Uncle Bob argumenta que exceções checadas (como em Java) violam o Princípio Aberto/Fechado (OCP): se um método de baixo nível adiciona uma nova checked exception, a assinatura de todos os métodos na pilha de chamadas precisa ser alterada até o manipulador final.
- **Forneça Contexto nas Exceções**:
  Crie mensagens informativas indicando a operação que falhou, os parâmetros utilizados e a causa raiz para facilitar o diagnóstico em logs de produção.
- **O Padrão de Caso Especial (Special Case Pattern / Null Object)**:
  Em vez de retornar `null` quando um registro não é encontrado e forçar o cliente a fazer `if (obj != null)`, retorne um objeto que implementa a mesma interface com o comportamento padrão inofensivo.
- **A Regra Inegociável dos Nulos**:
  1. **NÃO RETORNE NULL**: Retornar `null` cria trabalho para todos os chamadores e é a causa raiz de milhões de `NullPointerException`. Retorne listas vazias (`Collections.emptyList()`) ou lance exceções específicas.
  2. **NÃO PASSE NULL**: Passar `null` como argumento para funções é uma prática danosa que exige validações defensivas repetitivas em todos os métodos.

## Key Concepts
- **Caminho Feliz Limpo**: A lógica de negócio deve poder ser lida do início ao fim sem ser interrompida por 10 blocos de tratamento de código de erro.
- **Isolamento de Tratamento de Erros**: Métodos que tratam exceções devem fazer apenas isso (o corpo do método contém apenas o `try-catch`).

## Mental Models
- **O Airbag do Automóvel**: O airbag fica recolhido no volante sem atrapalhar a visão do motorista na estrada; ele só entra em ação no momento exato do impacto para proteger a integridade dos ocupantes.

## Anti-patterns
- **O Labirinto de Null Checks**:
  ```python
  if cliente is not None:
      if cliente.get_endereco() is not None:
          if cliente.get_endereco().get_cep() is not None:
              # Código defensivo excessivo decorrente do vício de retornar null
  ```

## Worked Example
```python
# Ruim: Retornando null e forçando checagem defensiva
def obter_refeicoes(funcionario_id):
    gastos = db.buscar_gastos(funcionario_id)
    if not gastos:
        return None # Erro arquitetural!
    return gastos.refeicoes

# Limpo: Padrão de Caso Especial (Special Case / Null Object)
class DespesasRefeicao:
    def __init__(self, total: float): self.total = total
    def obter_total(self) -> float: return self.total

class DespesasRefeicaoNula(DespesasRefeicao):
    def __init__(self): super().__init__(0.0)
    # Comportamento inofensivo padrão sem null check

def obter_refeicoes_limpo(funcionario_id) -> DespesasRefeicao:
    gastos = db.buscar_gastos(funcionario_id)
    if not gastos:
        return DespesasRefeicaoNula() # Retorna objeto especializado
    return DespesasRefeicao(gastos.total_refeicoes)
```
