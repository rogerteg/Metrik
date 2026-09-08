# Capítulo 4 — Privacy

**Livro**: TDD by Example (Beck) · `chapters/ch04-privacy.md`

## Core Idea
Depois que `equals` existe e os testes de multiplicação usam `times(...).amount`, dá para **tornar o campo `amount` privado** — o teste que antes "espiou" o campo público agora pode verificar via `equals`. O capítulo mostra como o TDD permite **melhorar a API (encapsulamento) com segurança**, e como a duplicação no teste (comparar com `assertEquals(10, ...)`) é eliminada pelo equals.

## Frameworks Introduced
- **Refatoração de encapsulamento** guiada por testes.
- Usar a igualdade recém-criada para **remover duplicação nos testes**.

## Key Concepts
- Antes, o teste usava o campo público:
```java
Dollar five = new Dollar(5);
assertEquals(10, five.times(2).amount);   // espia amount
```
- Depois, com `equals`, compara objetos:
```java
assertEquals(new Dollar(10), five.times(2));
```
- Agora `amount` pode virar **privado** (`private int amount;`) sem quebrar testes — ninguém de fora depende dele.
- Refatoração do teste: `assertEquals(expected, actual)` com objetos compara via `equals`.

## Mental Models
- **Testes são a rede de segurança do refactor**: com eles, mudar visibilidade/API é barato e seguro.
- **Não exponha estado só para o teste**: se o teste precisou de `amount` público, é sinal de que faltava `equals` — a API certa resolve.
- **Duplicação em testes também deve ser eliminada** (aqui, a leitura manual de campo).

## Anti-patterns
- Deixar campos públicos "porque o teste usa".
- Refatorar visibilidade **sem** teste que cubra o comportamento.

## Code Example
```java
// teste refatorado:
assertEquals(new Dollar(10), five.times(2));

// classe:
private int amount;
```
- **O que demonstra**: encapsulamento habilitado pela igualdade.

## Worked Example
O teste de multiplicação comparava `five.times(2).amount == 10`. Com `equals` pronto, o autor reescreve para `assertEquals(new Dollar(10), five.times(2))`. A suíte continua verde. Então declara `amount` como `private` — compila e passa, porque nenhum teste acessa o campo diretamente. O design ficou mais limpo sem risco.

## Key Takeaways
1. **Encapsule quando o teste permitir** — equals habilita esconder `amount`.
2. Elimine **duplicação também nos testes**.
3. O TDD dá confiança para **mudanças de API**.
4. Público "só para o teste" é cheiro de API faltando.

## Connects To
- **Ch 3** (equals), **Ch 5** (aplicar o mesmo a Franc).
- **Conceito**: encapsulamento; testes como especificação executável da API.
