# Capítulo 6 — Equality for All, Redux

**Livro**: TDD by Example (Beck) · `chapters/ch06-equality-for-all-redux.md`

## Core Idea
Agora que existem `Dollar` e `Franc`, o `equals` precisa tratar **objetos de classes diferentes** (`Dollar(5).equals(Franc(5))` deve ser **false**) e `null`. O capítulo resolve isso **comparando a classe** no `equals` e mostra como a necessidade de código comum entre Dollar e Franc começa a **puxar uma superclasse (`Money`)**.

## Frameworks Introduced
- Tratar os casos adiados do `equals`: **null** e **outra classe**.
- Primeiro movimento rumo à **superclasse comum** (comparar `getClass()`).

## Key Concepts
- Testes novos:
```java
public void testEquality() {
    assertTrue(new Dollar(5).equals(new Dollar(5)));
    assertFalse(new Dollar(5).equals(new Dollar(6)));
    assertFalse(new Franc(5).equals(new Dollar(5)));  // moedas diferentes!
}
```
- **Red**: `Dollar.equals` compara só `amount`, então `Franc(5).equals(Dollar(5))`... na verdade o teste chama `new Franc(5).equals(new Dollar(5))` → `Franc.equals` compara `amount` e retornaria true (errado).
- **Green**: comparar também a classe:
```java
public boolean equals(Object object) {
    return object instanceof Dollar && amount == ((Dollar) object).amount;
}
```
- Perceba: Dollar e Franc agora têm **`equals` quase idênticos** — a duplicação pede uma superclasse comum onde `amount` e o padrão de igualdade moram.

## Mental Models
- **Igualdade entre tipos diferentes deve ser false** (a menos que você queira igualdade entre moedas — que vem depois com conversão).
- **Comparar a classe** (`getClass()`/`instanceof`) resolve "apples and oranges" no equals.
- **A superclasse nasce da duplicação**: quando duas classes repetem o mesmo método, é o sinal de subir para `Money`.

## Anti-patterns
- `equals` que retorna true para objetos de classes diferentes sem querer.
- Ignorar `null` no equals (deve retornar false).
- Criar a superclasse "porque faz sentido" antes de a duplicação doer.

## Code Example
```java
public boolean equals(Object object) {
    return object instanceof Dollar && amount == ((Dollar) object).amount;
}
```
- **O que demonstra**: checagem de tipo no equals.

## Worked Example
O autor adiciona o assert de que `Franc(5)` não é igual a `Dollar(5)`. Ele falha (os `equals` só comparavam `amount`). A correção adiciona `instanceof` no equals do Dollar (e depois no do Franc). Os casos `null` e classe diferente entram na test list. A repetição entre os dois `equals` e o campo `amount` **acelera** a decisão de introduzir `Money` como superclasse nos próximos capítulos.

## Key Takeaways
1. `equals` deve tratar **null e classes diferentes** (false).
2. **Moedas diferentes não são iguais** — por enquanto; conversão virá depois.
3. **Duplicação entre classes irmãs sinaliza superclasse**.
4. Casos adiados voltam como testes quando relevante.

## Connects To
- **Ch 5** (Franc), **Ch 8** (Makin' Objects — subir para Money), **Ch 7** (equals Dollar vs Franc e hashCode).
