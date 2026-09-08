# Capítulo 16 — Abstraction, Finally

**Livro**: TDD by Example (Beck) · `chapters/ch16-abstraction-finally.md`

## Core Idea
Última abstração do exemplo: **`Expression.plus()`** — somar expressões (não só `Money`) deve retornar `Expression`. `Sum.plus` cria um `Sum` de si mesmo com o outro termo. Isso generaliza o modelo: `Money` e `Sum` são `Expression`, e `plus`/`reduce` operam no nível da abstração.

## Frameworks Introduced
- `Expression.plus(Expression)` → `Expression`.
- `Sum.plus` retornando novo `Sum` (acumulando).
- `times` também pensado no nível de `Expression` (adiado/limitado).

## Key Concepts
- Teste de somar uma soma com outra (compor expressões):
```java
public void testSumPlusMoney() {
    Expression fiveBucks = Money.dollar(5);
    Expression tenFrancs = Money.franc(10);
    Bank bank = new Bank();
    bank.addRate("CHF", "USD", 2);
    Expression sum = new Sum(fiveBucks, tenFrancs).plus(fiveBucks);
    Money result = bank.reduce(sum, "USD");
    assertEquals(Money.dollar(15), result);
}
```
- `Sum.plus`:
```java
public Expression plus(Expression addend) {
    return new Sum(this, addend);
}
```
- O campo de `Sum` (augend/addend) passa a ser `Expression` (não `Money`), permitindo somar somas.

## Mental Models
- **Composição**: uma `Expression` pode ser composta de outras (Sum de Sum) — a abstração se torna **recursiva/composável**.
- **Programe para a interface** (`Expression`): `plus`/`reduce` no nível abstrato permitem árvores de expressão.
- **A abstração "final" só aparece quando um teste pede** (somar soma).

## Anti-patterns
- `Sum` guardando só `Money` (impede compor expressões).
- Métodos que retornam o tipo concreto quando a interface já existe.

## Code Example
```java
class Sum implements Expression {
    Expression augend;
    Expression addend;
    Sum(Expression augend, Expression addend) { ... }
    public Expression plus(Expression addend) { return new Sum(this, addend); }
}
```
- **O que demonstra**: composição de expressões via interface.

## Worked Example
O autor quer poder somar uma soma com mais dinheiro (`(5$ + 10CHF) + 5$ = 15$`). Para isso, `Sum.plus` deve aceitar e devolver `Expression`, e os campos de `Sum` devem ser `Expression`. Ajusta os tipos, implementa `plus` criando um `Sum`, roda a suíte — verde. O modelo Money/Expression/Sum/Bank está completo e composável.

## Key Takeaways
1. **Composição exige programar para a interface** (`Expression`).
2. `Sum.plus` retorna novo `Sum` — expressões viram **árvores**.
3. A abstração "final" surge quando o teste pede **composição**.
4. Modelo completo: `Money`, `Expression`, `Sum`, `Bank.reduce`.

## Connects To
- **Ch 12** (origem de Expression), **Ch 15** (reduce com taxas).
- **Conceito**: Composite (ch 30) — Sum como Composite de Expression.
