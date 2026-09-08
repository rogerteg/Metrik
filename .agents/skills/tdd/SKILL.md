---
name: tdd
description: Test-Driven Development (TDD) aplicado ao codar — as duas regras (só escrever código novo com teste automatizado falhando; eliminar duplicação), o ciclo red/green/refactor, o Money Example e o xUnit Example como worked examples, e os padrões de TDD (red bar, testing, green bar, xUnit, design patterns, refactoring) de Kent Beck (Test-Driven Development: By Example). Use quando precisar praticar ou ensinar TDD, escrever código guiado por testes, escolher o tamanho do próximo passo, ou aplicar padrões de teste/refatoração.
---

# Test-Driven Development: By Example (skilltdd)

Essência de **Test-Driven Development: By Example** (Kent Beck, Addison-Wesley). Objetivo: **"clean code that works"** (código limpo que funciona) guiado por duas regras simples — escrever código novo só quando um teste automatizado falha, e eliminar duplicação — que geram o ritmo **red → green → refactor**.

## How to Use

1. **Ritmo básico**: siga `chapters/ch01-multi-currency-money.md` e o mantra red/green/refactor; use `chapters/ch25-test-driven-development-patterns.md` para as decisões estratégicas.
2. **Quando o teste não sabe escrever / barriga vermelha parada**: consulte `chapters/ch26-red-bar-patterns.md` (qual o menor passo) e `chapters/ch27-testing-patterns.md` (como testar).
3. **Quando está verde e quer refatorar com segurança**: `chapters/ch28-green-bar-patterns.md` (como chegar ao verde rápido), `chapters/ch31-refactoring.md` (refatorações) e `chapters/ch30-design-patterns.md`.
4. **Construindo frameworks de teste/prática**: `chapters/ch29-xunit-patterns.md` e o worked example do xUnit (ch18–24).
5. **Checklist rápido**: `cheatsheet.md`; padrões reutilizáveis: `patterns.md`.

## Core Frameworks

- **As duas regras do TDD** (Prefácio):
  1. Escreva código novo **apenas se um teste automatizado falhou**.
  2. **Elimine duplicação**.
  - Consequências: design orgânico com feedback do código rodando; você escreve seus próprios testes; ambiente com resposta rápida; componentes coesos e fracamente acoplados.
- **O ciclo**:
  - **Red** — escreva um teste pequeno que não funciona (talvez nem compile).
  - **Green** — faça o teste passar rápido, cometendo os pecados necessários.
  - **Refactor** — elimine toda a duplicação criada para passar no teste.
- **A pergunta de progresso** (ch1): em vez de "quanto falta?", pergunte "qual é o próximo teste que vai me fazer avançar?" — a **test list** como fonte de progresso.
- **Estratégias para o verde** (ch28): **Fake It** ('til you make it — retorne constante e generalize), **Obvious Implementation**, **Triangulate** (2º exemplo força generalização), **One to Many** (opere em coleção usando o caso de 1).
- **Padrões de design que emergem** (ch30): Command, Value Object, Null Object, Template Method, Pluggable Object/Selector, Factory Method, Imposter, Composite, Collecting Parameter, Singleton — escolhidos por *testabilidade*.
- **Refatorações** (ch31): Reconcile Differences, Isolate Change, Migrate Data, Extract/Inline Method, Extract Interface, Move Method, Method Object, Add Parameter.
- **A matemática por trás** (ch33/Afterword, Fowler): TDD como gestão de *custo de mudança* e *risco* — reduz "mean time between failures" percebido e aumenta confiança para mudar.

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Multi-Currency Money | `chapters/ch01-multi-currency-money.md` |
| 2 | Degenerate Objects | `chapters/ch02-degenerate-objects.md` |
| 3 | Equality for All | `chapters/ch03-equality-for-all.md` |
| 4 | Privacy | `chapters/ch04-privacy.md` |
| 5 | Franc-ly Speaking | `chapters/ch05-franc-ly-speaking.md` |
| 6 | Equality for All, Redux | `chapters/ch06-equality-for-all-redux.md` |
| 7 | Apples and Oranges | `chapters/ch07-apples-and-oranges.md` |
| 8 | Makin' Objects | `chapters/ch08-makin-objects.md` |
| 9 | Times We're Livin' In | `chapters/ch09-times-were-livin-in.md` |
| 10 | Interesting Times | `chapters/ch10-interesting-times.md` |
| 11 | The Root of All Evil | `chapters/ch11-the-root-of-all-evil.md` |
| 12 | Addition, Finally | `chapters/ch12-addition-finally.md` |
| 13 | Make It | `chapters/ch13-make-it.md` |
| 14 | Change | `chapters/ch14-change.md` |
| 15 | Mixed Currencies | `chapters/ch15-mixed-currencies.md` |
| 16 | Abstraction, Finally | `chapters/ch16-abstraction-finally.md` |
| 17 | Money Retrospective | `chapters/ch17-money-retrospective.md` |
| 18 | First Steps to xUnit | `chapters/ch18-first-steps-to-xunit.md` |
| 19 | Set the Table | `chapters/ch19-set-the-table.md` |
| 20 | Cleaning Up After | `chapters/ch20-cleaning-up-after.md` |
| 21 | Counting | `chapters/ch21-counting.md` |
| 22 | Dealing with Failure | `chapters/ch22-dealing-with-failure.md` |
| 23 | How Suite It Is | `chapters/ch23-how-suite-it-is.md` |
| 24 | xUnit Retrospective | `chapters/ch24-xunit-retrospective.md` |
| 25 | Test-Driven Development Patterns | `chapters/ch25-test-driven-development-patterns.md` |
| 26 | Red Bar Patterns | `chapters/ch26-red-bar-patterns.md` |
| 27 | Testing Patterns | `chapters/ch27-testing-patterns.md` |
| 28 | Green Bar Patterns | `chapters/ch28-green-bar-patterns.md` |
| 29 | xUnit Patterns | `chapters/ch29-xunit-patterns.md` |
| 30 | Design Patterns | `chapters/ch30-design-patterns.md` |
| 31 | Refactoring | `chapters/ch31-refactoring.md` |
| 32 | Mastering TDD | `chapters/ch32-mastering-tdd.md` |

## Topic Index

- **Ritmo/regras do TDD** → Prefácio (em `ch01`), ch25
- **Test list / próximo passo** → ch01, ch25
- **Barriga vermelha (red)** → ch26
- **Testes (como testar)** → ch27, ch29
- **Barriga verde (green): Fake It, Triangulate, Obvious Impl, One to Many** → ch28
- **Refatoração** → ch31 (e ch30, design)
- **Framework xUnit** → ch18–24, ch29
- **Money example (worked example completo)** → ch01–17
- **Objetos: Value Object, Null Object, Command, Template Method…** → ch30
- **Fibonacci (exercício)** → Apêndice II (mencionado em ch32)

## Supporting Files

- `glossary.md` — termos do TDD.
- `patterns.md` — catálogo de padrões (red/green/testing/xUnit/design/refactoring).
- `cheatsheet.md` — regras de decisão rápidas (qual passo? como testar? como refatorar?).

## Scope & Limits

- Síntese do livro (Addison-Wesley, 2002) para **estudo e prática**; exemplos originais em Java (Money) e Python (xUnit) — adapte a sintaxe à sua linguagem.
- O livro não prescreve ferramentas; foca princípios e ritmo.
- Uso **privado/local** — obra de terceiros protegida por direitos autorais; não publique.
- Relaciona-se com: `clean-code` (qualidade/refatoração) e com o fluxo Spec-Driven Development (SDD) para prática guiada por especificação + testes.
