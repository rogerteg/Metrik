# Capítulo 1 — Multi-Currency Money

**Livro**: TDD by Example (Beck) · `chapters/ch01-multi-currency-money.md`

## Core Idea
Começo do *worked example* da Parte I: construir um sistema de **dinheiro multi-moeda** (Dollar/Franc) guiado por TDD. A pergunta de progresso deixa de ser "quanto falta?" e vira **"qual é o próximo teste?"** — a *test list* é o coração do método.

## Frameworks Introduced
- **A test list**: escrever a lista de testes que ainda faltam (o backlog do TDD).
- **O ciclo red/green/refactor** aplicado a um caso real.
- **TDD de fora para dentro**: começar por um teste de comportamento (multiplicação), não por estrutura.

## Key Concepts
- Problema: `$5 + 10 CHF = $10` se a taxa for 2:1. Também multiplicação: `$5 × 2 = $10`.
- **Primeiro teste**: "5 dólares × 2 = 10 dólares". Em Java com JUnit:
```java
public void testMultiplication() {
    Dollar five = new Dollar(5);
    five.times(2);
    assertEquals(10, five.amount);
}
```
- **Red**: a classe `Dollar` não existe — o teste não compila. Esse é o "fail" aceitável do início.
- **Green mínimo**: criar a classe com o mínimo para compilar/passar:
```java
class Dollar {
    int amount;
    Dollar(int amount) { this.amount = amount; }
    void times(int multiplier) { amount *= multiplier; }
}
```

## Mental Models
- **Teste que não compila também é um teste vermelho** — e está tudo bem no passo 1.
- **Pense no próximo teste, não no design final**: o design emerge dos testes que você escolhe.
- **Fake it / mínimo**: faça o teste passar com o menor código possível; a generalização vem no refactor (aqui, nos capítulos seguintes).

## Anti-patterns
- Escrever a classe inteira "de antemão" sem teste falhando.
- Perguntar "quanto falta para terminar?" em vez de "qual o próximo teste?".

## Code Example (representativo)
```java
// test:
Dollar five = new Dollar(5);
five.times(2);
assertEquals(10, five.amount);
```
- **O que demonstra**: o teste dirige a criação da classe e da operação.

## Worked Example
**Passo a passo do capítulo**: (1) anote a test list: *$5+10CHF*, *$5×2*, *amount privado*, *arredondamento*, *equals()*, *hashCode()*, *comparar com null*, *comparar com objeto de outra classe*. (2) Escolha `$5×2` e escreva o teste (Red: `Dollar` não existe). (3) Crie a classe mínima e deixe o teste verde. (4) Refatore pouco (nada de duplicação ainda). A cada passo o teste protege o comportamento; o design "verdadeiro" (fields privados, equals, classes Franc) virá teste a teste.

## Key Takeaways
1. Mantenha uma **test list** e sempre saiba qual é o **próximo teste**.
2. Comece pelo **menor teste de comportamento** que faz sentido.
3. Vermelho (até "não compila") → verde mínimo → refactor; repita.
4. O **design emerge** dos testes, não de um plano prévio.

## Connects To
- **Ch 2**: o ciclo geral e o segundo teste (generalização).
- **Ch 25**: Test List como padrão.
- **Conceito**: JUnit (o próprio Beck criou o xUnit usado aqui).
