# Capítulo 21 — Counting

**Livro**: TDD by Example (Beck) · `chapters/ch21-counting.md`

## Core Idea
O framework precisa **contar os testes executados**. Surge a classe **`TestResult`**, que acumula a contagem (`runCount`) e — no próximo capítulo — as falhas. `TestCase.run()` passa a retornar um `TestResult`.

## Frameworks Introduced
- **TestResult** como coletor do resultado da execução.
- `TestCase.run()` → retorna `TestResult`.
- Preparação para `failedCount` (ch. 22) e `TestSuite` (ch. 23).

## Key Concepts
- Teste:
```python
def testResult(self):
    test = WasRun("testMethod")
    result = test.run()
    assert("1 run, 0 failed" == result.summary())
```
- `TestResult` com `summary()` no formato `"N run, M failed"`:
```python
class TestResult:
    def __init__(self):
        self.runCount = 0
    def testStarted(self):
        self.runCount = self.runCount + 1
    def summary(self):
        return "%d run, 0 failed" % self.runCount
```
- `TestCase.run()` cria um `TestResult`, chama `testStarted()` e o devolve.

## Mental Models
- **Resultado é um objeto, não um efeito colateral**: `TestResult` coleta o que aconteceu para o chamador decidir.
- **"N run, M failed"** é a "moeda" do framework — o resumo legível que os runners exibem.
- **Cresça o framework por necessidade**: contagem primeiro; falhas e suíte depois.

## Anti-patterns
- `run()` sem retorno (quem vai saber quantos testes rodaram?).
- Contagem "hardcoded"/manual em vez de incrementada por evento (`testStarted`).

## Code Example (Python)
```python
class TestResult:
    def __init__(self):
        self.runCount = 0
    def testStarted(self):
        self.runCount = self.runCount + 1
    def summary(self):
        return "%d run, 0 failed" % self.runCount
```
- **O que demonstra**: coleta de contagem via evento.

## Worked Example
O autor quer saber quantos testes rodaram. Escreve um teste que roda `WasRun` e espera `"1 run, 0 failed"` no `summary()`. Cria `TestResult` com `testStarted()` incrementando e `summary()` formatando; `TestCase.run()` instancia o resultado, sinaliza o início e o retorna. Verde. O próximo passo: capturar **falhas** nesse resultado.

## Key Takeaways
1. **TestResult** centraliza o resultado da execução.
2. `run()` retorna o resultado; contagem via evento `testStarted`.
3. Resumo `"N run, M failed"` como formato padrão.
4. Framework cresce por necessidade (contar → falhar → agrupar).

## Connects To
- **Ch 22** (failedCount), **Ch 23** (TestSuite usa TestResult).
- **Conceito**: xUnit TestResult.
