# Capítulo 9 — Times We're Livin' In

**Livro**: TDD by Example (Beck) · `chapters/ch09-times-were-livin-in.md`

## Core Idea
Duas mudanças guiadas por teste: **`times` passa a retornar `Money`** (em vez de `Dollar`/`Franc`) e surge o método **`currency()`** que identifica a moeda. A `currency` vira a base para o `equals` comparar moedas de verdade — aproximando Dollar e Franc de uma única classe `Money` com um campo `currency`.

## Frameworks Introduced
- **`times` polimórfico**: declarado para retornar `Money` (a abstração certa para chamadores).
- **`currency()`** como identidade de moeda (String "USD"/"CHF").
- Continuação da reconciliação Dollar/Franc.

## Key Concepts
- Testes: multiplicação pode ser assertada contra `Money`:
```java
assertEquals(new Dollar(10), five.times(2));
```
- `times` nas subclasses passa a retornar `Money`:
```java
Money times(int multiplier) { return new Dollar(amount * multiplier); }
```
- Teste de moeda:
```java
public void testCurrency() {
    assertEquals("USD", Money.dollar(1).currency());
    assertEquals("CHF", Money.franc(1).currency());
}
```
- Surge **`Money.dollar(int)` / `Money.franc(int)`** como *factory methods* (para não expor as subclasses), e `currency()` retornando "USD"/"CHF".

## Mental Models
- **Programe para a abstração**: retornar `Money` libera os chamadores de saber se é Dollar ou Franc.
- **Factory Method** (`Money.dollar`) esconde a classe concreta — melhora a API e facilita testes.
- **A moeda é um atributo de valor**, não uma classe: quanto mais cedo Dollar/Franc forem só `Money` com `currency`, menos duplicação.

## Anti-patterns
- `times` retornando o tipo concreto quando a abstração (Money) já existe.
- Duplicar "saber a moeda" com if/instanceof em vez de um campo/atributo.

## Code Example
```java
class Money {
    static Money dollar(int amount) { return new Dollar(amount); }
    static Money franc(int amount)  { return new Franc(amount);  }
    // ...
}
class Dollar extends Money {
    Money times(int multiplier) { return Money.dollar(amount * multiplier); }
    String currency() { return "USD"; }
}
```
- **O que demonstra**: factory methods e `currency()`.

## Worked Example
O autor primeiro faz `times` retornar `Money` (os testes de multiplicação continuam verdes). Depois adiciona o teste `currency()` ("USD" p/ dollar, "CHF" p/ franc) e implementa o método em cada subclasse retornando a string fixa. Com a moeda disponível, o próximo passo natural é transformar a string em **campo** e compará-la no `equals` — unificando Dollar e Franc (ch. 10–11).

## Key Takeaways
1. Faça `times`/operações retornarem a **abstração** (`Money`).
2. Introduza **`currency()`** como identidade de moeda.
3. **Factory methods** (`Money.dollar`) melhoram a API e o teste.
4. A moeda como atributo abre caminho para fundir Dollar e Franc.

## Connects To
- **Ch 10** (currency como campo), **Ch 11** (fundir subclasses).
- **Conceito**: Factory Method (ch 30).
