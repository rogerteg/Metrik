# Padrões de Refatoração do Código Limpo (Uncle Bob)

Padrões práticos de transformação para elevar a clareza e elegância do código.

---

## Padrão 1: A Hierarquia Decrescente (The Stepdown Hierarchy)
- **Problema**: Funções longas que misturam múltiplos níveis de abstração em uma única rotina.
- **Solução**: Decompor o algoritmo em métodos que descem um único degrau de abstração por vez.
- **Exemplo**:
  ```python
  # O leitor lê como prosa jornalística de alto para baixo:
  def processar_folha_de_pagamento(self):
      funcionarios = self.obter_funcionarios_ativos()
      for f in funcionarios:
          self.pagar_funcionario(f)

  def pagar_funcionario(self, f):
      salario = self.calcular_salario_liquido(f)
      self.depositar(f.conta, salario)

  def calcular_salario_liquido(self, f):
      bruto = f.salario_base + f.horas_extras
      imposto = self.calcular_imposto(bruto)
      return bruto - imposto
  ```

---

## Padrão 2: Separação Comando-Consulta (Command Query Separation - CQS)
- **Problema**: Métodos que realizam mutação de estado e retornam dados ao mesmo tempo, gerando ambiguidades.
- **Solução**: Isolar a consulta em um método puro e o comando em um método de alteração.
- **Exemplo**:
  ```python
  # Violação de CQS:
  if usuario.autenticar_e_atualizar_ultimo_login("senha123"): # Faz consulta E comando!
      ...

  # Respeitando CQS:
  if usuario.validar_credenciais("senha123"): # Consulta pura
      usuario.registrar_acesso_atual()         # Comando puro
  ```

---

## Padrão 3: Padrão de Caso Especial (Special Case / Null Object)
- **Problema**: Código defensivo poluído com `if (x != null)` espalhado por dezenas de arquivos.
- **Solução**: Retornar um objeto polimórfico inofensivo que encapsula o comportamento de ausência.
- **Exemplo**:
  ```python
  class Desconto:
      def aplicar(self, valor: float) -> float:
          return valor * 0.9 # 10% de desconto

  class SemDesconto(Desconto):
      def aplicar(self, valor: float) -> float:
          return valor # Caso especial: não altera o valor e não requer checagem de null!

  def obter_desconto_do_cliente(cliente) -> Desconto:
      if cliente.is_vip():
          return Desconto()
      return SemDesconto() # NUNCA retorna None/null
  ```

---

## Padrão 4: O Isolamento de Limites (Boundary Adapter)
- **Problema**: Código de terceiros ou tipos externos de bibliotecas vazando pelo domínio da aplicação.
- **Solução**: Envolver o tipo de terceiro em uma classe de domínio com métodos fortemente tipados.
- **Exemplo**:
  ```python
  # Em vez de passar um dict genérico de terceiros:
  # sensores['temperatura_celsius'] = 45.2
  
  # Criamos uma fronteira limpa fortemente tipada:
  class SensorTelemetry:
      def __init__(self, raw_data: dict):
          self._raw = raw_data

      def get_temperatura(self) -> float:
          return float(self._raw.get("temp", 0.0))

      def is_superaquecido(self) -> bool:
          return self.get_temperatura() > 80.0
  ```
