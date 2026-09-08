# Capítulo 14 — Change

**Livro**: TDD by Example (Beck) · `chapters/ch14-change.md`

## Core Idea
O `reduce` de `Sum` precisa de **taxas de câmbio** para "Change" (troca/conversão). O capítulo move a lógica de redução de `Sum` para depender do **`Bank`** (que conhece as taxas) e introduz a **identidade monetária** (moeda → ela mesma, taxa 1:1). A conversão `reduce(Expression, currency)` consulta a taxa no `Bank`.

## Frameworks Introduced
- `Sum.reduce(Bank, String)` — reduzir usando o banco (taxas).
- **Identidade**: converter uma moeda para ela mesma = multiplicar por 1 (sem taxa registrada).
- `Bank.rate(from, to)` e `addRate`.

## Key Concepts
- `Sum.reduce` precisa do banco:
```java
// Sum
Money reduce(Bank bank, String to) {
    int amount = augend.reduce(bank, to).amount + addend.reduce(bank, to).amount;
    return new Money(amount, to);
}
```
- `Money.reduce(Bank, String)`:
```java
// Money
Money reduce(Bank bank, String to) {
    int rate = bank.rate(currency, to);
    return new Money(amount / rate, to);
}
```
- `Bank.rate(from, to)`: retorna 1 se `from == to` (identidade), senão a taxa registrada via `addRate` (guardada num mapa com chave `Pair` de moedas).
- Teste de identidade: `bank.reduce(Money.dollar(1), "USD")` deve dar `$1`.

## Mental Models
- **Conversão é divisão pela taxa**: `amount / rate` (taxa 2 → 10 CHF / 2 = $5).
- **Identidade = taxa 1**: moeda convertida nela mesma não precisa de taxa registrada.
- **Centralize as taxas no `Bank`**: Sum não decide taxa; pergunta ao banco.

## Anti-patterns
- `Sum` somando valores de moedas diferentes **sem converter**.
- Taxa "chumbada" no código em vez de registrada/configurável no `Bank`.
- Esquecer a **identidade** (moeda→moeda) no `rate`.

## Code Example
```java
class Bank {
    private Hashtable rates = new Hashtable();
    void addRate(String from, String to, int rate) { rates.put(new Pair(from, to), rate); }
    int rate(String from, String to) {
        if (from.equals(to)) return 1;
        return (Integer) rates.get(new Pair(from, to));
    }
}
```
- **O que demonstra**: taxas centralizadas + identidade.

## Worked Example
O teste agora exercita reduzir `Sum` de `$5+$5` para "USD" — e o autor quer preparar o caso de moedas diferentes. Move `reduce` para receber o `Bank`, implementa `Money.reduce` dividindo pela taxa (com identidade = 1), e `Sum.reduce` somando as parcelas já convertidas pelo banco. Roda: verde. `addRate`/`Pair` entram para o próximo capítulo (moedas mistas).

## Key Takeaways
1. `reduce` **pergunta a taxa ao `Bank`** — Sum não decide câmbio.
2. **Identidade monetária** (moeda→moeda = 1) evita registrar taxa consigo mesma.
3. Conversão = **divisão pela taxa**.
4. Taxas centralizadas são configuráveis e testáveis.

## Connects To
- **Ch 13** (reduce), **Ch 15** (mixed currencies — usar addRate/Pair de verdade).
- **Conceito**: mapa/registro de taxas; Pair como chave.
