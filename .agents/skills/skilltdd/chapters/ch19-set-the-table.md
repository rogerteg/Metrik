# Capítulo 19 — Set the Table

**Livro**: TDD by Example (Beck) · `chapters/ch19-set-the-table.md`

## Core Idea
Introduzir o **`setUp`** ("pôr a mesa"): um método de preparação rodado **antes** de cada teste. `WasRun` passa a registrar também se `setUp` foi chamado, e `TestCase.run()` passa a invocar `setUp` + o método de teste pelo nome.

## Frameworks Introduced
- **setUp (Fixture)** como hook de preparação.
- **Chamar o método de teste dinamicamente** (reflexão por nome).
- `WasRun` generalizado para reportar `wasSetUp` e `wasRun`.

## Key Concepts
- Testes:
```python
def testSetUp(self):
    test = WasRun("testMethod")
    test.run()
    assert(test.wasSetUp)
```
- `WasRun.run()` (ou o `TestCase.run`) deve chamar `setUp` e depois `testMethod`:
```python
def setUp(self):
    self.wasRun = None
    self.wasSetUp = 1
```
- Evolução: em vez de `WasRun.run()` chamar `testMethod()` direto, passa a **invocar pelo nome** (`getattr(self, self.name)`) — nascimento do `TestCase` genérico que pode rodar qualquer método.

## Mental Models
- **Fixture (setUp)**: o estado comum que todo teste precisa, preparado de forma consistente.
- **Separe "o que sempre acontece" (setUp) do "o que o teste específico faz" (método)**.
- **Reflexão por nome** é o que torna o framework genérico (um `TestCase` roda qualquer método `testX`).

## Anti-patterns
- Repetir a preparação dentro de cada teste (duplicação).
- `run()` chamando um método fixo em vez de **pelo nome**.

## Code Example (Python)
```python
class TestCase:
    def __init__(self, name):
        self.name = name
    def run(self):
        self.setUp()
        method = getattr(self, self.name)
        method()
    def setUp(self):
        pass
```
- **O que demonstra**: setUp + chamada dinâmica do método de teste.

## Worked Example
O autor quer que testes tenham preparação comum. Adiciona `testSetUp` verificando `wasSetUp`. Move a lógica de execução para um `TestCase` genérico: `run()` chama `setUp()` e depois o método cujo nome está em `self.name` via `getattr`. `WasRun` agora estende `TestCase`, define `setUp` (zera flags) e `testMethod`. Roda a suíte: verde.

## Key Takeaways
1. **setUp** prepara a fixture antes de cada teste.
2. `run()` invoca o método de teste **pelo nome** (framework genérico).
3. Separe preparação comum do comportamento específico.
4. Testes do framework verificam os hooks (`wasSetUp`).

## Connects To
- **Ch 18** (WasRun/TestCase), **Ch 20** (tearDown), **Ch 29** (Fixture/xUnit patterns).
