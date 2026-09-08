# Capítulo 18 — First Steps to xUnit

**Livro**: TDD by Example (Beck) · `chapters/ch18-first-steps-to-xunit.md`

## Core Idea
Início da Parte II: construir um **framework de testes (xUnit)** usando o próprio TDD — "dirigir uma ferramenta de teste com a ferramenta de teste". O primeiro passo: uma classe `WasRun` que registra se um método de teste foi executado, e um `TestCase` minimalista com `run()`.

## Frameworks Introduced
- **TDD aplicado a metaprogramação**: escrever um framework de testes testando-o.
- `TestCase.run()` e a classe de teste `WasRun` (que "reporta se foi rodada").
- Padrão **Crash Test Dummy / objeto observável** nos testes do framework.

## Key Concepts
- Teste inicial (em Python):
```python
class TestCaseTest(TestCase):
    def testRunning(self):
        test = WasRun("testMethod")
        assert(not test.wasRun)
        test.run()
        assert(test.wasRun)
```
- `WasRun` guarda `wasRun` (False → True após rodar) e tem `testMethod` que seta `wasRun = True`.
- `TestCase.run()`: reflexivamente chama o método cujo nome foi passado no construtor.
- Red: nada existe ainda (nem `TestCase`, nem `WasRun`). Verde: implementação mínima.

## Mental Models
- **Use o método que está criando**: o framework de teste é testado por um teste que parece um teste "de verdade".
- **Objeto que reporta o que aconteceu** (WasRun) é um jeito simples de observar a execução — um "crash test dummy"/sonda.
- **Comece pelo comportamento observável** (o método rodou?) antes da arquitetura (suíte, resultado).

## Anti-patterns
- Projetar o framework completo (TestResult, TestSuite) antes do primeiro teste.
- Testar o framework só "manualmente".

## Code Example (Python)
```python
class WasRun:
    def __init__(self, name):
        self.wasRun = None
        self.name = name
    def run(self):
        self.testMethod()
    def testMethod(self):
        self.wasRun = True
```
- **O que demonstra**: a sonda WasRun que o teste observa.

## Worked Example
O autor quer um framework de testes. Escreve um teste que cria `WasRun("testMethod")`, verifica que `wasRun` é False antes e True depois de `run()`. Implementa `WasRun` com `testMethod` setando a flag e `run()` chamando o método. Verde. O próximo passo natural é generalizar: `run()` deve chamar *qualquer* método pelo nome (via reflexão) — levando à classe `TestCase`.

## Key Takeaways
1. Construa o framework de testes **testando-o** (dogfooding).
2. **WasRun**: objeto-sonda que registra execução.
3. Comece pelo **comportamento observável mínimo**.
4. A generalização (chamar método pelo nome) virá no próximo passo.

## Connects To
- **Ch 19** (setUp — generalizar run), **Ch 22** (lidar com falha).
- **Conceito**: reflexão/`getattr`; xUnit real (JUnit).
