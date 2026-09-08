# Capítulo 10 — Interesting Times

**Livro**: TDD by Example (Beck) · `chapters/ch10-interesting-times.md`

## Core Idea
A `currency` deixa de ser retornada "na unha" por cada subclasse e vira um **campo** definido no construtor. Com isso, o `equals` pode comparar `amount` **e `currency`**, unificando a definição de igualdade — passo decisivo para Dollar e Franc virarem a mesma classe.

## Frameworks Introduced
- **`currency` como campo** (passado no construtor).
- **`equals` comparando valor + moeda** (a definição "certa" de igualdade monetária).

## Key Concepts
- Testes de igualdade cruzada que agora **devem** falhar de formas distintas:
```java
assertTrue(Money.dollar(5).equals(Money.dollar(5)));
assertFalse(Money.dollar(5).equals(Money.dollar(6)));
assertFalse(Money.franc(5).equals(Money.dollar(5)));  // moedas diferentes
```
- `currency` como campo:
```java
class Dollar extends Money {
    private String currency;
    Dollar(int amount) { this.amount = amount; currency = "USD"; }
    String currency() { return currency; }
}
```
- `equals` em `Money` comparando os dois:
```java
public boolean equals(Object object) {
    if (object instanceof Money) {
        Money other = (Money) object;
        return amount == other.amount && currency().equals(other.currency());
    }
    return false;
}
```

## Mental Models
- **Igualdade monetária = valor + moeda**: dois `Money` são iguais só se o valor e a moeda coincidirem.
- **Um campo vale mais que um método que devolve constante**: a string fixa vira estado configurável.
- **A comparação por classe some** quando há um atributo de identidade.

## Anti-patterns
- Comparar moedas por `instanceof`/classe em vez de por `currency`.
- `currency` como constante repetida em vez de campo único.

## Code Example
```java
public boolean equals(Object object) {
    if (object instanceof Money) {
        Money other = (Money) object;
        return amount == other.amount && currency().equals(other.currency());
    }
    return false;
}
```
- **O que demonstra**: igualdade por valor e moeda.

## Worked Example
O autor move a string "USD"/"CHF" para um campo `currency`, preenchido no construtor. Atualiza `equals` para comparar também `currency()`. Os testes de igualdade (inclusive `franc(5).equals(dollar(5)) == false`) passam pela razão **certa** agora (moeda diferente), não mais pela classe. As subclasses estão cada vez mais vazias — prontas para serem fundidas.

## Key Takeaways
1. **Igualdade = valor + moeda**.
2. Transforme constantes de método em **campo** quando representarem estado.
3. `equals` por atributo de identidade substitui a checagem por classe.
4. Subclasses esvaziando = sinal de fusão iminente.

## Connects To
- **Ch 9** (currency()), **Ch 11** (fundir Dollar e Franc).
- **Conceito**: Value Object com igualdade por valor.
