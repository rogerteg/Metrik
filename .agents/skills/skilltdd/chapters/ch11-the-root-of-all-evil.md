# Capítulo 11 — The Root of All Evil

**Livro**: TDD by Example (Beck) · `chapters/ch11-the-root-of-all-evil.md`

## Core Idea
"Times was the root of all evil" — a **duplicação do `times`** entre Dollar e Franc é o que resta de diferente. O capítulo sobe o `times` para `Money` (usando `currency` para criar a moeda certa via factory) e **elimina as subclasses**: Dollar e Franc deixam de existir como classes próprias, e `Money.dollar()`/`Money.franc()` passam a criar `Money` com `currency` "USD"/"CHF". A duplicação morre.

## Frameworks Introduced
- **Eliminação total da duplicação** entre Dollar e Franc.
- `Money` como **única classe**, com `currency` como campo e **factory methods** (`dollar`, `franc`).
- `times` único em `Money`.

## Key Concepts
- `times` sobe para `Money` e precisa criar a moeda certa. Sem subclasses, usa-se um método protegido `Money times(int)` implementado via factory por `currency` — a solução canônica do livro:
```java
// Money
Money times(int multiplier) {
    return new Money(amount * multiplier, currency);
}
```
- Subclasses removidas; construtores de Dollar/Franc substituídos:
```java
static Money dollar(int amount) { return new Money(amount, "USD"); }
static Money franc(int amount)  { return new Money(amount, "CHF"); }
```
- `Money(int amount, String currency)` define os dois campos.
- Todos os testes (multiplicação, igualdade, moeda) continuam verdes — agora com uma única classe.

## Mental Models
- **A duplicação é "o mal"**: cada cópia de lógica é um lugar onde os bugs precisam ser corrigidos duas vezes.
- **Elimine a duplicação quando o teste estiver verde** — é o refactor do mantra.
- **Uma classe + atributo (currency) > duas classes quase iguais**.
- **Factory methods escondem a mudança**: os testes nem percebem que Dollar/Franc sumiram.

## Anti-patterns
- Manter duas classes idênticas "por clareza".
- Duplicar `times` em cada subclasse quando o comportamento é o mesmo.
- Expor construtores de moeda no lugar de factories claras (`Money.dollar(5)` é mais legível).

## Code Example
```java
class Money {
    protected int amount;
    protected String currency;
    Money(int amount, String currency) { this.amount = amount; this.currency = currency; }
    static Money dollar(int amount) { return new Money(amount, "USD"); }
    static Money franc(int amount)  { return new Money(amount, "CHF"); }
    Money times(int multiplier) { return new Money(amount * multiplier, currency); }
    public boolean equals(Object o) { /* amount && currency */ }
    String currency() { return currency; }
}
```
- **O que demonstra**: uma classe única; a duplicação eliminada.

## Worked Example
O autor move `times` para `Money`. Como não há mais subclasse para decidir a moeda do resultado, faz `times` criar `new Money(amount*multiplier, currency)`. Depois apaga `Dollar` e `Franc` (classes vazias), ajusta os factories `Money.dollar/franc` para construir `Money` com a moeda certa, e roda toda a suíte — verde. O sistema de moedas agora tem **uma classe**, e a igualdade por valor+moeda já funcionava.

## Key Takeaways
1. **`times` duplicado era a raiz do mal** — elimine duplicação real.
2. **Uma classe + atributo** substitui hierarquia artificial.
3. **Factory methods** (`dollar`/`franc`) mantêm a legibilidade.
4. A suíte verde é o que permite apagar classes sem medo.

## Connects To
- **Ch 5/8** (a duplicação criada e o movimento para Money), **Ch 31** (Reconcile Differences).
- **Conceito**: um atributo (currency) em vez de subclasses; Value Object.
