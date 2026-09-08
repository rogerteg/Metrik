# Capítulo 7 — Apples and Oranges

**Livro**: TDD by Example (Beck) · `chapters/ch07-apples-and-oranges.md`

## Core Idea
O capítulo confronta diretamente a comparação **Dollar vs. Franc** ("apples and oranges") e resolve de vez o `equals`: em vez de comparar a *classe concreta* (`instanceof Dollar`), passa a comparar por uma **propriedade comum** — no caso, `Franc(5).equals(Dollar(5))` deve ser false porque as moedas diferem. Também introduz o **hashCode** (para o contrato equals/hashCode e para uso em coleções, que virão no `Bank`).

## Frameworks Introduced
- **Comparação de igualdade entre moedas** resolvida por atributo comum (a futura `currency`).
- **hashCode** como parte do contrato de Value Object.

## Key Concepts
- Teste-chave:
```java
assertFalse(new Franc(5).equals(new Dollar(5)));
```
- Como Dollar e Franc ainda são classes separadas, a checagem por classe (`instanceof Dollar` no equals do Dollar) já impede a comparação cruzada — mas a abordagem "certa" (que virá com a superclasse) é comparar por **moeda**.
- O autor aproveita para **adicionar hashCode** de forma consistente com `equals` (mesmo `amount`), preparando o uso em `Hashtable`/`HashMap` (o `Bank` precisará de pares de moedas).

## Mental Models
- **"Apples and oranges"**: comparar objetos de naturezas diferentes deve falhar — decida *o que* define a igualdade (aqui: valor + moeda).
- **equals e hashCode andam juntos**: objetos iguais devem ter o mesmo hashCode.
- **A igualdade "correta" emerge** quando a representação comum (currency) existir.

## Anti-patterns
- `equals` que compara só valor ignorando a moeda (Dollar=Franc).
- Implementar `equals` sem `hashCode` (quebra coleções hash).
- Usar `instanceof` como solução definitiva quando uma **propriedade** (currency) é o critério real.

## Code Example
```java
public boolean equals(Object object) {
    return object instanceof Dollar && amount == ((Dollar) object).amount;
}
public int hashCode() { return amount; }
```
- **O que demonstra**: igualdade por valor + hashCode consistente (ainda por classe; será refinado).

## Worked Example
Teste novo: `Franc(5).equals(Dollar(5))` deve ser false — passa porque os `equals` checam a classe concreta. O autor anota que essa checagem por classe é um "cheiro": quando `Dollar`/`Franc` virarem subclasses de `Money` (ch. 8), a comparação certa será por `currency`. Adiciona `hashCode` para manter o contrato. O caminho para a superclasse e o campo `currency` está pavimentado.

## Key Takeaways
1. Igualdade entre **moedas diferentes** é false — até haver conversão.
2. **equals e hashCode** juntos, sempre.
3. Checagem por classe concreta no equals é provisória; o critério real será a **moeda**.
4. Preparação para coleções hash (o futuro `Bank`).

## Connects To
- **Ch 8** (subir para Money e introduzir currency), **Ch 9** (currency()).
- **Conceito**: contrato equals/hashCode; Value Object.
