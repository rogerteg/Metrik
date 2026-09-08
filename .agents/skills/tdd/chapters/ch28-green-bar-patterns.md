# Capítulo 28 — Green Bar Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch28-green-bar-patterns.md`

## Core Idea
Padrões para a fase **verde** — como fazer o teste passar **rápido** (chegar ao verde logo) para então refatorar com segurança: **Fake It** ('til you make it), **Obvious Implementation**, **Triangulate** e **One to Many**. O capítulo discute o trade-off entre chegar ao verde "de qualquer jeito" e implementar de forma óbvia.

## Frameworks Introduced
- **Fake It ('til you make it)**: retorne uma constante; depois generalize substituindo a constante por uma variável.
- **Obvious Implementation**: quando a implementação é clara, escreva-a diretamente.
- **Triangulate**: adicione um segundo exemplo para forçar a generalização quando a abstração certa não está óbvia.
- **One to Many**: implemente para um elemento; generalize para operar sobre coleções.

## Key Concepts
- **Fake It ('til you make it)**:
  - Passo 1: faça o teste passar retornando uma **constante** (ex.: `return 10;`).
  - Passo 2: **generalize** substituindo a constante por uma variável/expressão real (ex.: `return amount * multiplier;`).
  - **Por que funciona**: separa "fazer o teste passar" (verde rápido) de "encontrar a implementação" (no refactor). Você nunca fica travado no vermelho.
- **Obvious Implementation**: quando a implementação é tão óbvia que fake seria perda de tempo, escreva direto. Use quando sua **confiança** está alta (conhece o domínio, o teste é claro).
- **Triangulate**: quando **duas** implementações diferentes passariam no teste atual e a certa não está clara, adicione um **segundo exemplo** que apenas uma implementação satisfaz. Só generalize quando dois testes exigirem a mesma abstração. (Beck: use com moderação — fake/óbvio costumam ser mais rápidos.)
- **One to Many**: para operar sobre **coleções**, implemente o caso com **um elemento** e depois generalize para muitos (ex.: operar em uma lista usando o caso de 1 como base). Reduz a complexidade do primeiro passo.

## Mental Models
- **Verde primeiro, elegância depois**: o vermelho não é lugar para pensar; é lugar para sair rápido.
- **Fake It separa "passar" de "implementar"**: cada preocupação no seu momento.
- **Triangulate só quando necessário**: se a abstração é óbvia, não force dois exemplos.
- **De um para muitos**: resolva o caso trivial (1) e generalize (N) — o caso 1 é a semente do caso N.

## Anti-patterns
- Ficar **travado no vermelho** tentando a implementação perfeita.
- **Fake It** sem o passo de generalização (constante fica para sempre).
- **Triangulate** desnecessário quando a implementação é óbvia (perde tempo).
- Implementar para coleções **direto** sem dominar o caso de 1.

## Code Example (conceitual — Money)
```java
// 1) Fake It:
Money times(int multiplier) { return Money.dollar(10); }  // só para o teste 5*2
// 2) Generalize (refactor):
Money times(int multiplier) { return Money.dollar(amount * multiplier); }
```
- **O que demonstra**: constante → variável.

## Worked Example (reconstrução)
No Money, o teste `5×2=10` pode ser satisfeito por `return Money.dollar(10)` (**Fake It**). O autor então adiciona o teste `5×3=15` (**Another Test**), que falha com a constante → generaliza para `amount * multiplier`. Quando a implementação é óbvia (como `equals`), usa **Obvious Implementation** direto. Raramente recorre a **Triangulate** — reservado para quando duas abstrações plausíveis disputam.

## Key Takeaways
1. Chegue ao **verde rápido**: Fake It (constante → generaliza) ou **Obvious Implementation**.
2. **Triangulate** (2º exemplo) só quando a abstração não está clara.
3. **One to Many**: do caso de 1 para a coleção.
4. A generalização mora no **refactor**, não no primeiro verde.

## Connects To
- **Ch 2** (generalização precoce), **Ch 26** (Another Test força o generalizar), **Ch 31** (refactor).
- **Conceito**: "fake it till you make it"; duplicação como guia.
