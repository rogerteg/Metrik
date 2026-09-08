# Capítulo 12 — Addition, Finally

**Livro**: TDD by Example (Beck) · `chapters/ch12-addition-finally.md`

## Core Idea
Chega a **adição** (`$5 + $5 = $10`), que exige uma decisão de design: somar devolve `Money`? Não — devolve uma **`Expression`** (um `Sum`), porque somar moedas diferentes não produz um `Money` imediato (precisa de conversão). O capítulo introduz as abstrações **`Expression`** (interface) e **`Sum`**, e o **`Bank.reduce()`** como o lugar que transforma expressões em `Money`.

## Frameworks Introduced
- **Expression** (interface) e **Sum** (implementação: `augend` + `addend`).
- **Bank.reduce(Expression)** como motor de conversão.
- Ideia de que operações retornam a abstração mais geral.

## Key Concepts
- Teste do objetivo: `$5 + $5 = $10` (mesma moeda):
```java
public void testSimpleAddition() {
    Money five = Money.dollar(5);
    Expression sum = five.plus(five);
    Bank bank = new Bank();
    Money reduced = bank.reduce(sum, "USD");
    assertEquals(Money.dollar(10), reduced);
}
```
- `Money.plus(Money)` retorna `Expression` (a princípio, uma `Sum`):
```java
Expression plus(Money addend) { return new Sum(this, addend); }
```
- `Sum` guarda `augend`/`addend`; **ainda não** implementa `reduce` (fica para os próximos capítulos).
- `Bank.reduce(Expression, String)` — esqueleto que ainda não funciona para `Sum`.

## Mental Models
- **Retorne o tipo mais geral** que satisfaça o teste (Expression), mesmo que hoje só haja um caso.
- **Some primeiro, converta depois**: a adição cria uma expressão; a redução (conversão para uma moeda) é outra responsabilidade (`Bank`).
- **Deixe o teste falhar pela razão certa**: aqui, `reduce` de um `Sum` ainda não está implementado.

## Anti-patterns
- Fazer `plus` retornar `Money` e "resolver" conversão na soma (mistura responsabilidades).
- Implementar `Sum.reduce` inteiro de uma vez antes do teste pedir.

## Code Example
```java
class Sum implements Expression {
    Money augend;
    Money addend;
    Sum(Money augend, Money addend) { this.augend = augend; this.addend = addend; }
}
```
- **O que demonstra**: Sum como estrutura de dados (Expression) aguardando reduce.

## Worked Example
O autor quer `$5+$5=$10`. Escreve o teste com `plus` e `bank.reduce`. Para compilar, cria `Expression` (interface vazia) e `Sum` guardando as parcelas; `Money.plus` retorna `new Sum(this, addend)`. O teste fica vermelho porque `Bank.reduce` ainda não sabe reduzir um `Sum`. O palco está montado: os próximos capítulos implementam `reduce` para `Money` (ch. 13), depois para `Sum` (ch. 14) e com taxas (ch. 15).

## Key Takeaways
1. **Adição produz Expression** (Sum), não Money — soma ≠ conversão.
2. Separe responsabilidades: **`Sum` guarda**, **`Bank.reduce` converte**.
3. Deixe a abstração ser puxada pelo teste que falha.
4. `Bank` centraliza a conversão/redução.

## Connects To
- **Ch 13** (reduce de Money), **Ch 14** (reduce de Sum), **Ch 15** (mixed currencies).
- **Conceito**: Expression/Composite; separação soma×conversão.
