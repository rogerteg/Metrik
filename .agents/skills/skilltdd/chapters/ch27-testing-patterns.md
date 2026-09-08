# Capítulo 27 — Testing Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch27-testing-patterns.md`

## Core Idea
Padrões **táticos** para escrever testes melhores: como reduzir testes grandes (**Child Test**), como lidar com dependências e observabilidade (**Mock Object**, **Self Shunt**, **Log String**, **Crash Test Dummy**), e como manter a higiene da suíte (**Broken Test**, **Clean Check-in**).

## Frameworks Introduced
- **Child Test**: reduzir um teste grande a um caso pequeno que ainda falhe.
- **Mock Object**: objeto falso com comportamento pré-programado.
- **Self Shunt**: o próprio objeto de teste implementa a interface da qual depende.
- **Log String**: registrar chamadas numa string para verificar ordem.
- **Crash Test Dummy**: objeto que lança exceção quando usado indevidamente.
- **Broken Test**: deixar um teste quebrado conhecido (temporariamente).
- **Clean Check-in**: nunca commitar com testes vermelhos.

## Key Concepts
- **Child Test**: quando um teste de integração está grande/confuso, encontre um **filho** — um caso menor que ainda falha e que isola a causa. Resolva o filho; o teste grande tende a passar.
- **Mock Object**: para testar uma unidade que depende de algo lento/instável (banco, rede, relógio), injete um objeto falso cujo comportamento você controla. Trade-off: mocks acoplam o teste à **interface** (não à implementação, se bem feitos).
- **Self Shunt**: em vez de criar um mock separado, o **próprio objeto de teste** implementa a interface necessária (o teste se "shunta" como dependência). Reduz classes falsas.
- **Log String**: para verificar **ordem** de chamadas (ex.: setUp antes de testMethod), acumule nomes de chamadas numa string e compare com a esperada.
- **Crash Test Dummy**: um objeto que **lança exceção** se usado indevidamente — usado para testar que o código trata o erro (ou para garantir que uma dependência *não* foi usada quando não devia).
- **Broken Test**: às vezes você sabe que um teste está quebrado e por quê (ex.: refactor em andamento). Deixá-lo **marcado** temporariamente é aceitável, mas é dívida — não deixe acumular.
- **Clean Check-in**: **regra de ouro** — a suíte deve estar verde antes de commitar. Vermelho no repositório quebra a confiança de todo o time ("o baseline está quebrado?").

## Mental Models
- **Teste grande demais? Reduza-o a um filho que ainda falhe** — isole a causa, não lute com o monstro.
- **Substitua fronteiras lentas/instáveis por mocks; quando o teste pode ser a dependência, use Self Shunt**.
- **Se você precisa saber a ordem, grave uma Log String**; se precisa saber que algo *não* deve ser usado, use um Crash Test Dummy.
- **Teste vermelho no repo é ruído coletivo**: Clean Check-in protege o time inteiro.

## Anti-patterns
- Testes de integração gigantes que falham sem explicar por quê (em vez de Child Test).
- Mocks demais/acoplados à implementação (testes frágeis).
- Commitar com suíte vermelha "porque estou quase terminando".
- Deixar Broken Tests se acumularem (viram ruído permanente).

## Code Example (conceitual)
```python
# Self Shunt / Log String: o teste registra as chamadas que recebe
class TestCaseTest(TestCase):
    def testSetUpAndMethod(self):
        test = WasRun("testMethod")
        test.run()
        assert("setUp testMethod " == test.log)  # ordem verificada
```
- **O que demonstra**: Log String verificando ordem de chamadas.

## Worked Example (reconstrução)
No xUnit, o autor quer garantir que `run()` chama `setUp` antes de `testMethod`. Usa o **Log String**: `WasRun` acumula em `self.log` os nomes ("setUp testMethod "), e o teste compara a ordem. Mais tarde, para testar que o framework ignora uma dependência não usada, usa um **Crash Test Dummy** que lança se for tocado. Tudo isso com **Clean Check-in** ao final.

## Key Takeaways
1. **Child Test**: reduza o grande a um caso pequeno que ainda falha.
2. Use **Mock Object** para fronteiras; **Self Shunt** quando o teste pode ser a dependência.
3. **Log String** verifica ordem; **Crash Test Dummy** verifica "não deve usar".
4. **Clean Check-in**: nunca commite vermelho; Broken Tests são dívida temporária.

## Connects To
- **Ch 26** (One Step Test), **Ch 29** (xUnit: como esses padrões viram o framework).
- **Conceito**: test doubles (mocks/stubs/dummies); interface segregation.
