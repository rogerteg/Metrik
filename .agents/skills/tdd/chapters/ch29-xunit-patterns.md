# Capítulo 29 — xUnit Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch29-xunit-patterns.md`

## Core Idea
Padrões para **usar frameworks da família xUnit** bem: como estruturar asserções (**Assertion**, **Exception Test**), como organizar o estado (**Fixture**, **External Fixture**), a granularidade dos testes (**Test Method**) e a prática de rodar tudo (**All Tests**).

## Frameworks Introduced
- **Assertion**: verificação que falha a menos que a condição seja verdadeira.
- **Fixture**: o estado/objetos preparados para os testes (setUp).
- **External Fixture**: recurso externo (arquivo, banco, conexão) criado/liberado pelo teste.
- **Test Method**: um teste = um método que roda isolado.
- **Exception Test**: teste que verifica que uma exceção específica é lançada.
- **All Tests**: suíte que roda todos os testes.

## Key Concepts
- **Assertion**: o coração do teste. Sem uma asserção que possa falhar, o teste não testa nada. Prefira **asserções de resultado** (o que o sistema devolve) a asserções de implementação (como foi feito).
- **Fixture (setUp)**: se muitos testes precisam do mesmo estado inicial, prepare-o num `setUp` compartilhado. Trade-off: fixture compartilhada demais esconde dependências entre testes; às vezes é melhor montar o estado no próprio teste (evidente).
- **External Fixture**: quando o teste toca recursos externos (arquivos, banco, rede), **crie e libere** explicitamente (try/finally ou tearDown). Nunca dependa de estado externo preexistente.
- **Test Method**: cada comportamento testado é um método; o nome do método descreve a intenção. Rodar um método isolado (não a classe inteira) é possível quando os testes são independentes.
- **Exception Test**: testar caminhos de erro — verifique que a exceção **esperada** é lançada (não "qualquer coisa"). Se nenhuma exceção for lançada, o teste deve falhar.
- **All Tests**: tenha uma suíte que rode **tudo**; rodar tudo deve ser rápido e rotineiro (a cada mudança). Se "rodar tudo" é lento demais, é um problema a resolver (separe rápidos/lentos), não uma desculpa.

## Mental Models
- **Teste sem asserção é cerimônia**: a asserção é onde o teste ganha poder de falhar.
- **Fixture: o mínimo necessário e visível** — setUp para o comum, mas não esconda o que cada teste precisa.
- **Recursos externos têm dono (o teste)**: crie, use, libere — sempre.
- **Um teste por comportamento, todos os testes rodando sempre**: All Tests é a rede de segurança coletiva.

## Anti-patterns
- Testes **sem asserção** ou com asserção que nunca falha.
- Fixture gigante que **esconde** o que cada teste realmente usa.
- **Vazar recursos externos** (arquivo/banco abertos entre testes).
- Exception Test que aceita **qualquer** exceção.
- Suíte lenta que ninguém roda.

## Code Example (conceitual)
```python
# Exception Test: só passa se a exceção esperada for lançada
try:
    account.debit(-5)
    fail("deveria lançar exceção para valor negativo")
except ValueError:
    pass
```
- **O que demonstra**: testar o caminho de erro explicitamente.

## Worked Example (reconstrução)
Um teste de conta bancária: (a) `setUp` cria uma conta comum (**Fixture**); (b) um teste de débito usa a conta do setUp com uma **Assertion** de saldo; (c) um teste de valor negativo usa **Exception Test** (espera `ValueError`); (d) um teste que grava em arquivo cria/remove o arquivo (**External Fixture** com finally); (e) tudo roda via **All Tests**. Cada teste é um **Test Method** com nome descritivo.

## Key Takeaways
1. **Assertion** real em todo teste; **Exception Test** para caminhos de erro.
2. **Fixture** (setUp) para estado comum; **External Fixture** com limpeza garantida.
3. **Test Method**: um comportamento por método, isolado e nomeado.
4. **All Tests**: suíte total rápida, rodada sempre.

## Connects To
- **Ch 18–24** (o xUnit construído no livro), **Ch 27** (táticas de teste).
- **Conceito**: JUnit/pytest; test doubles.
