# Capítulo 22 — Dealing with Failure

**Livro**: TDD by Example (Beck) · `chapters/ch22-dealing-with-failure.md`

## Core Idea
O framework precisa **capturar falhas** (exceções) sem abortar a execução: um teste que lança exceção deve ser contado como **falha**, o `tearDown` deve rodar **mesmo assim**, e a execução deve continuar para os próximos testes. `TestResult` ganha `failedCount`, e `TestCase.run()` captura a exceção.

## Frameworks Introduced
- **Captura de exceção no run()** → `TestResult.failedCount`.
- `tearDown` garantido **mesmo com falha** (uso de try/finally).
- `summary()` → `"%d run, %d failed"`.

## Key Concepts
- Teste (método que lança exceção):
```python
def testFailedResult(self):
    test = WasRun("testBrokenMethod")
    result = test.run()
    assert("1 run, 1 failed" == result.summary())
```
- `WasRun.testBrokenMethod` lança exceção.
- `TestCase.run()`:
```python
def run(self):
    result = TestResult()
    result.testStarted()
    self.setUp()
    try:
        method = getattr(self, self.name)
        method()
    except:
        result.testFailed()
    self.tearDown()
    return result
```
- `TestResult.testFailed()` incrementa `failedCount`; `summary()` usa os dois contadores.

## Mental Models
- **Falha de um teste não deve parar a suíte**: capture e registre, siga em frente.
- **tearDown é inegociável**: rode em try/finally para que um teste quebrado não "suje" os seguintes.
- **Distinguir "falhou" (assert) de "erro" (exceção)** é refinamento posterior; aqui tudo vira `failed`.

## Anti-patterns
- Deixar a exceção propagar e abortar a suíte inteira.
- tearDown que não roda quando o teste falha (vaza estado).
- Ignorar a exceção sem registrar no resultado.

## Code Example (Python)
```python
def run(self):
    result = TestResult()
    result.testStarted()
    self.setUp()
    try:
        method = getattr(self, self.name)
        method()
    except:
        result.testFailed()
    self.tearDown()
    return result
```
- **O que demonstra**: try/except registrando falha + tearDown garantido.

## Worked Example
O autor cria `testBrokenMethod` (lança exceção) e testa que o resumo fica `"1 run, 1 failed"`. Implementa `testFailed()` no `TestResult` e envolve a chamada do método em `try/except` dentro de `run()`, com `tearDown` após o bloco (executado mesmo com exceção). Verde: a falha é contada e não derruba o runner.

## Key Takeaways
1. Capture exceções no `run()` e **registre como falha**.
2. **tearDown roda mesmo com falha** (try/finally).
3. Uma falha não aborta a execução da suíte.
4. `TestResult` agora resume `run` e `failed`.

## Connects To
- **Ch 21** (TestResult), **Ch 23** (suíte usa run por teste), **Ch 29** (Exception Test).
