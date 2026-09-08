# Capítulo 31 — Refactoring

**Livro**: TDD by Example (Beck) · `chapters/ch31-refactoring.md`

## Core Idea
Refatorações específicas que aparecem com frequência no TDD — mudanças pequenas e seguras (com a suíte verde) que melhoram o design: **Reconcile Differences**, **Isolate Change**, **Migrate Data**, **Extract/Inline Method**, **Extract Interface**, **Move Method**, **Method Object** e **Add Parameter**.

## Frameworks Introduced
- **Reconcile Differences**: unificar duas implementações semelhantes.
- **Isolate Change**: isolar o que varia para mudar com segurança.
- **Migrate Data**: mudar a representação dos dados gradualmente.
- **Extract Method / Inline Method**: extrair/colapsar métodos.
- **Extract Interface**: extrair interface para desacoplar.
- **Move Method**: mover método para a classe que tem os dados que ele usa.
- **Method Object**: transformar método grande em objeto.
- **Add Parameter**: adicionar parâmetro (dependência) explicitamente.

## Key Concepts
- **Reconcile Differences**: quando duas classes/métodos quase iguais (Dollar vs. Franc), una-os **um passo por vez**: suba um método, rode os testes; suba outro, rode. A diferença restante vira parâmetro/atributo.
- **Isolate Change**: para mudar algo arriscado, primeiro **isole** a parte que varia (extraia método/classe) para que a mudança não vaze para o resto.
- **Migrate Data**: mudar de uma representação de dados para outra (ex.: campo → outro campo, int → objeto) em **passos pequenos**, mantendo os testes verdes entre eles; os dois podem coexistir temporariamente.
- **Extract Method**: dar nome e unidade a um bloco de código (melhora legibilidade e permite reuso/teste do método isolado).
- **Inline Method**: o oposto — quando um método é trivial e só adiciona indireção, colapse-o no chamador.
- **Extract Interface**: quando um cliente depende de uma classe concreta, extraia a **interface** que ele realmente usa — desacopla e permite substituir (mock) em testes.
- **Move Method**: um método que usa mais dados de outra classe do que da própria deve **mover-se** para lá (coesão).
- **Method Object**: um método longo com muitas variáveis locais vira um **objeto** cujos campos são as variáveis — transforma o método grande em vários métodos pequenos do objeto.
- **Add Parameter**: quando um método precisa de uma dependência/valor novo, **adicione como parâmetro** (em vez de buscar global) — torna a dependência explícita e injetável em teste.

## Mental Models
- **Refatore em passos pequenos, sempre com a suíte verde** — o teste é a rede de segurança.
- **Duplicação é o guia**: Reconcile Differences onde há cópia; extraia onde há repetição.
- **Mudança de dados é migração, não edição**: Migrate Data em fases, com código antigo e novo coexistindo.
- **Explicite dependências** (Add Parameter, Extract Interface) para testar com injeção.
- **Nomeie e una**: métodos com bons nomes e classes coesas (Move Method, Method Object) são mais fáceis de testar e mudar.

## Anti-patterns
- Refatorar **sem teste verde** (rede de segurança ausente).
- Mudanças grandes de uma vez (misturar refactor com feature).
- Duas classes gêmeas mantidas para sempre (não reconciliar).
- Dependências globais/implícitas em vez de parâmetros.
- Métodos longos que ninguém consegue testar isoladamente.

## Code Example (conceitual)
```java
// Antes: método usa mais dados de outra classe → Move Method
// Depois: método mora na classe que tem os dados
```
```python
# Method Object: método grande vira objeto com vários métodos pequenos
```
- **O que demonstra**: refatorações estruturais guiadas por testes.

## Worked Example (reconstrução — Money)
Fundir Dollar e Franc usou **Reconcile Differences**: subir `times`/`equals`/`amount` um por vez, rodando testes, até sobrar só o `currency` — que virou campo via **Migrate Data** (a string fixa virou atributo). No xUnit, `run()` virou **Extract Method** para `runTest` etc. Quando `Money` precisou ser criado com moedas, **Add Parameter** (currency no construtor) deixou a dependência explícita.

## Key Takeaways
1. Refatore com a **suíte verde**, em passos pequenos.
2. **Reconcile Differences** une classes gêmeas; **Migrate Data** muda representação em fases.
3. **Extract/Move/Method Object** melhoram coesão e testabilidade.
4. **Extract Interface + Add Parameter** tornam dependências explícitas e injetáveis.

## Connects To
- **Ch 11** (Reconcile na prática), **Ch 28** (verde antes de refatorar), **Ch 30** (padrões revelados por refactor).
- **Conceito**: refatorações do catálogo de Fowler.
