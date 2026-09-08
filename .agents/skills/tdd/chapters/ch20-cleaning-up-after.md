# Capítulo 20 — Cleaning Up After

**Livro**: TDD by Example (Beck) · `chapters/ch20-cleaning-up-after.md`

## Core Idea
Introduzir o **`tearDown`**: um hook de limpeza rodado **depois** de cada teste (mesmo se o teste falhar). O objetivo é evitar que um teste vaze estado para o próximo. `WasRun` registra `wasTearDown`, e `TestCase.run()` chama `setUp → método → tearDown`.

## Frameworks Introduced
- **tearDown** como contrapartida do setUp.
- Execução de tearDown **mesmo em caso de falha** (importante para isolamento — será completo no ch. 22).

## Key Concepts
- Teste:
```python
def testTearDown(self):
    test = WasRun("testMethod")
    test.run()
    assert(test.wasTearDown)
```
- `WasRun.tearDown()` seta `wasTearDown = True`.
- `TestCase.run()`:
```python
def run(self):
    self.setUp()
    method = getattr(self, self.name)
    method()
    self.tearDown()
```
- (Neste ponto, se o método lançar exceção, o tearDown não roda — o tratamento de falha vem no ch. 22.)

## Mental Models
- **Limpeza simétrica à preparação**: o que o setUp cria, o tearDown libera (recursos, estado global, mocks).
- **Isolamento entre testes** é o que permite rodá-los em qualquer ordem e em paralelo.
- **tearDown deve rodar mesmo com falha** — senão um teste quebrado "suja" os seguintes.

## Anti-patterns
- Esquecer de liberar recursos externos (arquivos, conexões) — vaza entre testes.
- tearDown que só roda no caminho feliz (falha vaza estado).
- Fazer limpeza dentro do próprio teste em vez de no tearDown.

## Code Example (Python)
```python
class TestCase:
    def run(self):
        self.setUp()
        method = getattr(self, self.name)
        method()
        self.tearDown()
    def tearDown(self):
        pass
```
- **O que demonstra**: tearDown após o método de teste.

## Worked Example
O autor adiciona `testTearDown` verificando `wasTearDown`. Implementa `tearDown` no `WasRun` (seta a flag) e faz `TestCase.run()` chamá-lo ao final. Verde. Fica a pendência conhecida: se `testMethod` lançar exceção, `tearDown` não roda — tratada no capítulo de falhas.

## Key Takeaways
1. **tearDown** limpa após cada teste.
2. Ciclo do runner: **setUp → método → tearDown**.
3. Isolamento entre testes permite ordem arbitrária/paralela.
4. Garantir tearDown **sob falha** é o próximo passo.

## Connects To
- **Ch 19** (setUp), **Ch 22** (falha — tearDown mesmo com exceção), **Ch 29** (External Fixture).
