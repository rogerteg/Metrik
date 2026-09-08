# Capítulo 8 — Makin' Objects

**Livro**: TDD by Example (Beck) · `chapters/ch08-makin-objects.md`

## Core Idea
Chega a hora de **subir o código comum para uma superclasse `Money`**: `Dollar` e `Franc` passam a ser subclasses, e o campo `amount`, o `equals` e a lógica começam a migrar para `Money`. É o início da **reconciliação das diferenças** — a duplicação acumulada nos capítulos 5–7 agora é paga com uma abstração.

## Frameworks Introduced
- Introdução da **superclasse `Money`** e subclasses `Dollar`/`Franc`.
- Movimento incremental: subir campos/métodos **um por vez**, com testes verdes entre passos.
- Presságio do campo **`currency`** para diferenciar moedas na igualdade.

## Key Concepts
- Criar `class Money` e fazer `Dollar extends Money`, `Franc extends Money`.
- Subir o campo `amount` para `Money` (protected/private com acesso nas subclasses).
- O `equals` passa a comparar com `Money` (as subclasses são `Money`):
```java
// em Money:
public boolean equals(Object object) {
    return object instanceof Money && amount == ((Money) object).amount;
}
```
- Como Dollar e Franc ainda são classes distintas, `Franc(5).equals(Dollar(5))` continua false? Não — com `instanceof Money`, os dois passariam. A distinção passa a precisar de **`currency`**: o plano é que `equals` compare `amount` **e** `currency`.

## Mental Models
- **Superclasse = duplicação consolidada**: suba um campo/método por vez, rodando testes.
- **Igualdade por classe concreta é frágil**; quando há superclasse, use um **atributo de identidade** (currency).
- **Refactor incremental**: cada passo pequeno mantém a suíte verde.

## Anti-patterns
- Mover tudo de uma vez (campo + equals + construtores) sem rodar testes entre passos.
- Manter `instanceof Dollar`/`Franc` quando a superclasse já existe (perde o polimorfismo).

## Code Example
```java
class Money {
    protected int amount;
    public boolean equals(Object object) {
        return object instanceof Money && amount == ((Money) object).amount;
    }
}
class Dollar extends Money { /* times retorna Dollar */ }
class Franc  extends Money { /* times retorna Franc  */ }
```
- **O que demonstra**: campo e equals sobem para a superclasse.

## Worked Example
O autor cria `Money`, faz as subclasses, e move `amount` e `equals` para cima passo a passo. Em algum momento o teste de que Franc ≠ Dollar passa a falhar (com `instanceof Money`, `Franc(5).equals(Dollar(5))` seria true). Isso **força** a introdução do conceito de `currency` para diferenciar — a abstração correta é puxada por um teste que falha, não por opinião.

## Key Takeaways
1. **Superclasse** nasce da duplicação entre irmãs.
2. Refatore **em passos pequenos**, sempre verde.
3. Com superclasse, a igualdade precisa de **atributo de identidade** (currency).
4. O teste que falha **guia** a abstração certa.

## Connects To
- **Ch 9** (currency() e times em Money), **Ch 11** (eliminar o times duplicado).
- **Conceito**: refatoração para generalização; Template Method (ch 30).
