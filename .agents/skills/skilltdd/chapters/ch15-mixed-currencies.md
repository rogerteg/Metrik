# Capítulo 15 — Mixed Currencies

**Livro**: TDD by Example (Beck) · `chapters/ch15-mixed-currencies.md`

## Core Idea
O objetivo original: **`$5 + 10 CHF = $10`** com taxa 2:1. O capítulo registra a taxa no `Bank` (`addRate`) e faz o `reduce` de `Sum` converter as parcelas — validando o cenário de **moedas mistas** de ponta a ponta.

## Frameworks Introduced
- **`Bank.addRate(from, to, rate)`** e o **`Pair`** como chave do mapa de taxas.
- Redução completa de soma com moedas diferentes.

## Key Concepts
- Teste do objetivo:
```java
public void testMixedAddition() {
    Expression fiveBucks = Money.dollar(5);
    Expression tenFrancs = Money.franc(10);
    Bank bank = new Bank();
    bank.addRate("CHF", "USD", 2);
    Money result = bank.reduce(fiveBucks.plus(tenFrancs), "USD");
    assertEquals(Money.dollar(10), result);
}
```
- `Sum.reduce(Bank, to)` converte cada parcela via `Money.reduce` (que divide pela taxa):
```java
int amount = augend.reduce(bank, to).amount + addend.reduce(bank, to).amount;
```
- `Pair` precisa de `equals`/`hashCode` para funcionar como chave do mapa de taxas (o hashCode preparado no ch. 7 é usado aqui).

## Mental Models
- **A taxa pertence ao Bank**: quem soma não conhece câmbio; só o `Bank` converte.
- **Moedas mistas**: cada parcela é convertida para a moeda-alvo antes de somar.
- **`Pair` como chave**: (from,to) determina a taxa; requer equals/hashCode consistentes.

## Anti-patterns
- Somar `amount`s de moedas diferentes sem conversão.
- Registrar taxa só num sentido e esquecer o outro (aqui, CHF→USD; o inverso seria outro registro).
- `Pair` sem hashCode/equals (mapa quebra).

## Code Example
```java
class Pair {
    private String from, to;
    Pair(String from, String to) { this.from = from; this.to = to; }
    public boolean equals(Object o) { /* from e to iguais */ }
    public int hashCode() { return 0; } // no livro: simplificação; em produção, real
}
```
- **O que demonstra**: chave de taxa com equals/hashCode.

## Worked Example
O autor escreve o teste `$5 + 10CHF = $10` com `addRate("CHF","USD",2)`. Para o `Bank` guardar a taxa, cria a classe `Pair` (chave from→to) e o mapa `rates`. `Sum.reduce` converte as duas parcelas para USD (5 + 10/2 = 10) e retorna `$10`. Verde. O objetivo inicial do exemplo está cumprido.

## Key Takeaways
1. Moedas mistas: **converta cada parcela** antes de somar.
2. **Taxas no `Bank`** via `addRate`, chaveadas por `Pair`.
3. `Pair` exige **equals/hashCode** para servir de chave.
4. O objetivo `$5 + 10CHF = $10` fecha o ciclo do exemplo.

## Connects To
- **Ch 14** (identidade e rate), **Ch 7** (hashCode), **Ch 16** (Expression.plus).
- **Conceito**: registro de taxas (mapa).
