# Capítulo 3 — Equality for All

**Livro**: TDD by Example (Beck) · `chapters/ch03-equality-for-all.md`

## Core Idea
Adicionar **igualdade por valor** (`equals`) ao `Dollar`, guiado por testes de verdadeiro/falso. O capítulo mostra o padrão de escrever a **asserção primeiro**, implementar o mínimo (`equals` comparando `amount`) e deixar pendências conhecidas (comparar com `null` e com outras classes) para a test list — **anotar o que falta é parte do método**.

## Frameworks Introduced
- Testar **igualdade** (assertTrue/assertFalse) e não só igualdade numérica.
- **Assert First**: formular a asserção desejada antes do código.
- Uso disciplinado da **test list** para adiar casos (null, classes diferentes).

## Key Concepts
- Testes novos:
```java
public void testEquality() {
    assertTrue(new Dollar(5).equals(new Dollar(5)));
    assertFalse(new Dollar(5).equals(new Dollar(6)));
}
```
- **Red**: `equals` não existe (herda de `Object`, compara referência) → o 1º assert falha.
- **Green mínimo**:
```java
public boolean equals(Object object) {
    return amount == ((Dollar) object).amount;
}
```
- **Pendências anotadas** (adiadas conscientemente): comparar `Dollar` com `null` deve ser false; comparar com objeto de outra classe também. Entram na test list.

## Mental Models
- **Igualdade por valor é uma decisão de design** (Value Object): dois objetos com o mesmo `amount` são iguais.
- **Teste o caso verdadeiro E o falso** — um só não prova nada.
- **A lista de testes é a memória do design**: o que você decidiu adiar fica registrado, não esquecido.

## Anti-patterns
- Implementar `equals` completo (null, classe, hashCode) de uma vez sem testes.
- Escrever só `assertTrue` (sem o caso negativo).
- Esquecer de **anotar** as pendências (null, outras classes) na test list.

## Code Example
```java
public boolean equals(Object object) {
    return amount == ((Dollar) object).amount;
}
```
- **O que demonstra**: implementação mínima dirigida pelos dois asserts.

## Worked Example
O autor quer comparar `Dollar`s. Escreve os asserts (verdadeiro para 5=5, falso para 5≠6). O teste falha porque `Object.equals` compara referência. Implementa `equals` comparando `amount` com cast. Verde. Na sequência, anota na test list os casos que ainda não testou (`equals(null)`, `equals` com outra classe, e `hashCode`) — serão tratados no ch. 6–7.

## Key Takeaways
1. Teste **igualdade e desigualdade**.
2. **Assert First**: escreva a asserção que você quer antes do código.
3. Implemente o **mínimo** e **anote** o que ficou para depois.
4. Igualdade por valor prepara o Value Object.

## Connects To
- **Ch 4** (privacidade), **Ch 6** (equals, redux — null/outras classes), **Ch 7** (apples & oranges).
- **Conceito**: contrato equals/hashCode em Java.
