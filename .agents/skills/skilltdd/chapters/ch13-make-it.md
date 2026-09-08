# Capítulo 13 — Make It

**Livro**: TDD by Example (Beck) · `chapters/ch13-make-it.md`

## Core Idea
Fazer o teste de adição **passar do jeito mais simples** ("make it"): `Bank.reduce(Expression, currency)` começa tratando o caso fácil — quando a expressão já é um `Money` (mesma moeda) — e depois trata `Sum`. O capítulo demonstra implementar **Fake It / caminho mais curto** e depois generalizar, incluindo o `reduce` de `Sum` com soma simples de `augend` + `addend`.

## Frameworks Introduced
- `Bank.reduce(Expression, String)` com **polimorfismo** (Money e Sum respondem a `reduce`).
- **reduce em Sum**: `augend` + `addend` (mesma moeda) → `Money`.
- Passo "Make It": primeiro passe o teste de qualquer jeito; refatore depois.

## Key Concepts
- Primeiro, `reduce` de um `Money` (quando o teste passou a chamar `bank.reduce(Money.dollar(1), "USD")` — o teste simples de redução de identidade):
```java
// Bank
Money reduce(Expression source, String to) {
    if (source instanceof Money) return (Money) source;
    Sum sum = (Sum) source;
    return reduce(sum, to); // ainda não implementado de verdade
}
```
- Depois, `reduce` de `Sum` somando as parcelas (mesma moeda):
```java
// Sum
Money reduce(String to) {
    return new Money(augend.amount + addend.amount, to);
}
```
- O teste original `$5+$5=$10` finalmente passa.

## Mental Models
- **"Make it work first"**: implemente o caminho mais direto para o verde; a elegância vem no refactor.
- **`reduce` é polimórfico**: cada tipo de `Expression` sabe se reduzir (ou o Bank despacha).
- **Progresso incremental**: primeiro Money (identidade), depois Sum (soma), depois taxas.

## Anti-patterns
- Tentar implementar `reduce` genérico (com taxas) de uma vez.
- Usar `instanceof` como solução permanente (prefira polimorfismo quando possível).

## Code Example
```java
// Sum
Money reduce(String to) {
    return new Money(augend.amount + addend.amount, to);
}
```
- **O que demonstra**: reduzir uma soma de moedas iguais.

## Worked Example
O teste `$5+$5=$10` falha porque `Bank.reduce` não lida com `Sum`. O autor primeiro garante o caso `Money` (reduce devolve o próprio, com a moeda pedida), depois implementa `Sum.reduce(String)` somando os `amount`s. Roda a suíte: verde. A conversão entre moedas diferentes ainda não existe — entra na test list para o capítulo de taxas.

## Key Takeaways
1. **Make it pass** pelo caminho mais curto; refine depois.
2. `reduce` trata `Money` (identidade) e `Sum` (soma) em passos.
3. Adição de moedas iguais = soma simples de `amount`.
4. Conversão (taxas) fica anotada para o próximo passo.

## Connects To
- **Ch 12** (Expression/Bank), **Ch 14** (Change — reduce de Sum via Bank e identidade), **Ch 15** (taxas).
