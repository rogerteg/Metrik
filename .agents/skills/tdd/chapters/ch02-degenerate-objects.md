# Capítulo 2 — Degenerate Objects

**Livro**: TDD by Example (Beck) · `chapters/ch02-degenerate-objects.md`

## Core Idea
O capítulo apresenta o **ciclo geral do TDD** (1. escreva um teste; 2. veja-o falhar; 3. faça passar; 4. elimine duplicação) e avança o exemplo com um **segundo teste** que força a generalização — mostrando o papel do *degenerate object* (objeto minimalista que só existe para satisfazer o teste) e o valor de **generalizar substituindo constantes por variáveis**.

## Frameworks Introduced
- O **ciclo TDD em 4 passos** explícito.
- **Fake It / generalização por variável** (precursor do padrão do ch. 28).
- **Degenerate object**: implementação "degenerada" (mínima) que depois é refatorada.

## Key Concepts
- **O ciclo** (formulação clássica):
  1. Adicione um teste.
  2. Rode todos os testes e veja o novo falhar.
  3. Faça a menor mudança para passar.
  4. Rode todos os testes e refatore removendo duplicação.
- **Segundo teste**: multiplicar por 3 também precisa funcionar — e deve **reusar** o objeto (não criar novo), o que expõe o *side effect* do `times` que altera `amount`:
```java
public void testMultiplication() {
    Dollar five = new Dollar(5);
    assertEquals(10, five.times(2).amount);   // times retorna novo Dollar
    assertEquals(15, five.times(3).amount);
}
```
- Mudança para o teste passar: `times` passa a **retornar um novo Dollar** em vez de mutar:
```java
Dollar times(int multiplier) {
    return new Dollar(amount * multiplier);
}
```
- **Degenerate**: ainda sem equals, com `amount` público — aceitável por enquanto.

## Mental Models
- **"Primeiro faça o teste passar; depois faça direito."** A implementação "degenerada" é um trampolim, não o destino.
- **Dois testes com a mesma forma forçam a generalização** (aqui: o retorno de novo objeto em vez de mutação).
- **Cada teste deve falhar por uma razão nova** — se o segundo teste já passa, ele não está ensinando nada.

## Anti-patterns
- Pular para a implementação "perfeita" no primeiro verde.
- Escrever um segundo teste que **não falha** (não adiciona pressão de design).
- Refatorar **antes** de ter o verde (muda duas coisas ao mesmo tempo).

## Code Example
```java
Dollar times(int multiplier) {
    return new Dollar(amount * multiplier);
}
```
- **O que demonstra**: o teste (esperar 10 e 15 do *mesmo* objeto) força `times` a ser puro (sem side effect), preparando Value Object.

## Worked Example
O primeiro teste usava `five.times(2)` mutando `amount`. Ao escrever o teste para multiplicar por 3 **reutilizando** `five`, o autor percebe que mutação quebraria a expectativa. O teste novo falha (Red) pelo motivo certo; a correção — retornar um novo `Dollar` — deixa os dois testes verdes. O objeto `Dollar` torna-se mais **degenerado** e mais próximo de um Value Object imutável.

## Key Takeaways
1. Ciclo TDD: **teste → falha → verde mínimo → refactor (remove duplicação)**.
2. O **2º teste** é o que força a generalização correta.
3. Prefira **objetos que retornam novos valores** (imutabilidade) quando o teste expõe side effects.
4. Implementações degeneradas são ok **enquanto intermediárias**.

## Connects To
- **Ch 1**: continua o exemplo; **Ch 28**: Fake It formalizado.
- **Conceito**: Value Object (ch 30); imutabilidade.
