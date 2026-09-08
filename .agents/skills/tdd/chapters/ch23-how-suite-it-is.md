# Capítulo 23 — How Suite It Is

**Livro**: TDD by Example (Beck) · `chapters/ch23-how-suite-it-is.md`

## Core Idea
Agrupar testes: nasce a **`TestSuite`** — um **Composite** que contém vários `TestCase`s e, ao `run()`, executa cada um acumulando num `TestResult`. A suíte roda "todos os testes" e soma contagens/falhas.

## Frameworks Introduced
- **TestSuite** como Composite (contém testes; trata grupo como um teste).
- `suite.add(test)` e `suite.run(result)`.
- Padrão **All Tests** (rodar tudo de uma vez).

## Key Concepts
- Teste:
```python
def testSuite(self):
    suite = TestSuite()
    suite.add(WasRun("testMethod"))
    suite.add(WasRun("testBrokenMethod"))
    result = suite.run()
    assert("2 run, 1 failed" == result.summary())
```
- `TestSuite.run()`:
```python
class TestSuite:
    def __init__(self):
        self.tests = []
    def add(self, test):
        self.tests.append(test)
    def run(self, result):
        for test in self.tests:
            test.run(result)
```
- Para isso, `TestCase.run()` passa a **receber** o `TestResult` (em vez de criar um), permitindo que a suíte acumule tudo num único resultado. `TestSuite.run()` também pode criar um `TestResult` se não receber.

## Mental Models
- **Composite**: `TestSuite` é tratado como um "super-teste" — a mesma interface `run` para um teste ou para muitos.
- **Acumule num único `TestResult`**: a suíte passa o mesmo resultado para cada teste somar.
- **Rodar tudo com frequência**: suíte rápida encoraja rodar sempre (All Tests).

## Anti-patterns
- Cada teste criando seu próprio `TestResult` (impossível somar na suíte).
- Suíte sem capacidade de compor (suíte de suítes).

## Code Example (Python)
```python
class TestSuite:
    def __init__(self):
        self.tests = []
    def add(self, test):
        self.tests.append(test)
    def run(self, result):
        for test in self.tests:
            test.run(result)
```
- **O que demonstra**: Composite rodando cada teste no mesmo resultado.

## Worked Example
O autor quer rodar vários testes juntos. Cria `TestSuite` com `add` e `run`; muda `TestCase.run` para **aceitar um `TestResult`** e somar nele. O teste da suíte com dois testes (um ok, um quebrado) resulta em `"2 run, 1 failed"`. Verde. O framework agora tem o esqueleto completo: TestCase + TestResult + TestSuite.

## Key Takeaways
1. **TestSuite = Composite**: grupo de testes com a mesma interface de um teste.
2. `run(result)` **acumula** num único `TestResult` compartilhado.
3. Suíte permite **rodar tudo** (All Tests) rápido e frequentemente.
4. Esqueleto xUnit completo: TestCase, TestResult, TestSuite.

## Connects To
- **Ch 21/22** (TestResult), **Ch 24** (retrospectiva), **Ch 29** (All Tests/Composite).
- **Conceito**: Composite design pattern (ch 30).
