# Capítulo 30 — Design Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch30-design-patterns.md`

## Core Idea
Padrões de design vistos pela lente do TDD: o autor mostra padrões clássicos (GoF) e como a **testabilidade** e o **design emergente** influenciam a escolha. A tabela do capítulo cruza cada padrão com onde ele ajuda em *testes*, *escrita de código* e *refatoração*.

## Frameworks Introduced
Padrões cobertos (com o papel deles no TDD):
- **Command**: encapsular uma ação como objeto.
- **Value Object**: objeto imutável, igualdade por valor.
- **Null Object**: objeto que "não faz nada" no lugar de `null`.
- **Template Method**: esqueleto de algoritmo com passos preenchidos por subclasses.
- **Pluggable Object** e **Pluggable Selector**: variar comportamento sem condicionais.
- **Factory Method**: criar objetos por método (injetável).
- **Imposter**: objeto que "se passa por" outro para simplificar.
- **Composite**: tratar grupo e elemento uniformemente.
- **Collecting Parameter**: objeto que coleta resultados ao longo de chamadas.
- **Singleton**: garantir instância única (e o custo para testes).

## Key Concepts
- **Command**: transforme uma ação (ex.: "debitar", "enviar") num objeto; facilita testar a ação isoladamente, desfazer/logar.
- **Value Object**: imutável e igual por valor — o Money do livro. Naturalmente testável; sem identidade/estado para dar problema.
- **Null Object**: em vez de devolver `null` e espalhar `if (x != null)`, devolva um objeto que implementa a interface fazendo "nada". Remove condicionais e casos especiais; fácil de testar.
- **Template Method**: `TestCase.run()` (setUp → método → tearDown) é o exemplo: o esqueleto fica na superclasse; subclasses preenchem passos. Teste o esqueleto com subclasses-sonda (WasRun).
- **Pluggable Object / Pluggable Selector**: para evitar `if/switch` por tipo, **pluge** o comportamento (objeto) ou selecione por nome de método (selector). Reduz condicionais e facilita variar em teste.
- **Factory Method**: crie objetos via método (ex.: `Money.dollar`) — permite substituir a criação em testes (injetar mock/fake).
- **Imposter**: um objeto que se passa por outro (parente de Mock/Null) para simplificar o sistema sob teste.
- **Composite**: `TestSuite` contendo `TestCase`s — grupo e elemento têm a mesma interface `run()`. Permite recursão e uniformidade.
- **Collecting Parameter**: passe um objeto que **coleta** resultados através das chamadas (o `TestResult` passado por `run(result)`). Evita retornos complexos.
- **Singleton**: garante uma única instância — mas cria **estado global** que dificulta testes (testes interferem entre si). Prefira injeção; use Singleton com moderação.
- **Como escolher**: a motivação central no TDD é **reduzir acoplamento e viabilizar o próximo teste** — o padrão que facilita testar tende a ser o certo.

## Mental Models
- **Padrão certo = o que o teste pede**: no TDD, os padrões aparecem como solução para fazer um teste passar/facilitar refactor — não como decoração.
- **Prefira composição/objetos a condicionais**: Command, Null Object, Pluggable, Imposter, Composite eliminam `if` e `switch`, que são difíceis de testar em todas as ramificações.
- **Desconfie de estado global**: Singleton/statics dificultam isolamento (ch. 25).
- **Value Object sempre que possível**: imutabilidade + igualdade por valor = teste simples e previsível.

## Anti-patterns
- Aplicar padrões **antes** de os testes pedirem (design especulativo).
- **Singleton/estado global** em código que você quer testar isoladamente.
- `null` espalhado com `if`s (em vez de Null Object).
- `switch` por tipo (em vez de Pluggable/Polymorphism).
- Padrão que **aumenta o acoplamento** só para "ficar bonito".

## Code Example (conceitual)
```java
// Null Object: devolve um objeto que "não faz nada" em vez de null
interface Discount { int apply(int price); }
class NoDiscount implements Discount { public int apply(int p) { return p; } }
// uso: Discount d = find() == null ? new NoDiscount() : find();
```
- **O que demonstra**: Null Object removendo checagem de null.

## Worked Example (reconstrução — Money como Value Object)
No exemplo Money, `Dollar`/`Franc`/`Money` são **Value Objects** (imutáveis, igualdade por valor) — isso tornou os testes triviais (comparar objetos). `Money.dollar()` é um **Factory Method**. `Sum`/`Expression` formam um **Composite**. `TestResult` no xUnit é um **Collecting Parameter**. Cada padrão apareceu porque **facilitou o próximo teste**, não porque foi pré-escolhido.

## Key Takeaways
1. No TDD, **padrões emergem** como resposta a testes/refactors.
2. Prefira **Value Object, Null Object, Command, Pluggable, Composite** — reduzem condicionais e facilitam testes.
3. Use **Factory Method** para permitir injeção; **Collecting Parameter** para acumular resultados.
4. **Evite Singleton/estado global** — dificulta isolamento.

## Connects To
- **Ch 17/24** (padrões que emergiram nos exemplos), **Ch 31** (refatorações que revelam padrões).
- **Conceito**: GoF Design Patterns.
