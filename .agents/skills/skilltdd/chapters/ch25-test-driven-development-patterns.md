# Capítulo 25 — Test-Driven Development Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch25-test-driven-development-patterns.md`

## Core Idea
Este capítulo abre a Parte III com os padrões **estratégicos** do TDD — as decisões de mais alto nível: como começar (Stress/Test List), como manter o ritmo (Run Tests, Isolated Test), em que ordem escrever (Test First, Assert First) e como escolher os dados dos testes (Test Data, Evident Data).

## Frameworks Introduced
- **Stress** (o gatilho): escolha a próxima história/teste pelo que mais te deixa estressado/nervoso.
- **Run Tests**: rode os testes com frequência (a cada poucos minutos).
- **Isolated Test**: nunca rode um teste que dependa de outros; isole para rodar em qualquer ordem.
- **Test List**: mantenha a lista do que testar (e do que refatorar).
- **Test First**: escreva o teste um instante antes do código.
- **Assert First**: quando o teste não sai, escreva primeiro a asserção (o "então").
- **Test Data**: use dados de teste que não colidam com dados reais.
- **Evident Data**: escolha dados que tornem a relação esperado/real evidente.

## Key Concepts
- **Stress**: escolher o que fazer a seguir pela **ansiedade** — o que mais te preocupa é o que deve virar o próximo teste. (Se nada te estressa, faça algo que agregue valor ou pare.)
- **Run Tests**: rodar com frequência (a cada mudança pequena) dá feedback rápido; a suíte precisa ser rápida.
- **Isolated Test**: um teste deve poder rodar sozinho — sem depender de ordem, estado global ou outros testes (por isso setUp/tearDown, mocks de fronteira).
- **Test List**: escrever a lista (testes + refatorações) antes de começar; riscar conforme avança. É a memória de trabalho do TDD.
- **Test First**: teste um instante antes do código de produção — garante que o teste realmente falha sem o código.
- **Assert First**: para escrever um teste difícil, comece pela asserção (o resultado esperado) e pergunte "o que precisa existir para isso?" — preenchendo para trás.
- **Test Data**: evite usar os mesmos dados em teste e produção (ex.: não teste com a conta do cliente real); use dados claramente de teste.
- **Evident Data**: escolha números/valores que **revelam a relação** (ex.: `2 × 2 = 4` ou valores que distinguem variáveis), facilitando ver se o código está certo.

## Mental Models
- **Siga a ansiedade**: o lugar onde você mais teme quebrar é onde o próximo teste agrega mais.
- **Feedback rápido é tudo**: suíte rápida + rodar sempre = coragem para mudar.
- **Testes isolados são a base** de rodar em paralelo e em qualquer ordem.
- **Test First garante que o teste testa algo** (você o viu falhar antes do código existir).

## Anti-patterns
- Testes **dependentes de ordem/estado** (quebram isolados).
- Suíte **lenta** (ninguém roda → ninguém confia).
- Testes com dados que **colidem com produção** ou que **não evidenciam** o resultado.
- Escrever código antes do teste (perde a chance de ver o teste falhar).

## Code Example (conceitual)
```java
// Assert First: comece pelo resultado esperado
assertEquals(10, bank.reduce(sum, "USD")); // depois crie sum, bank...
```
- **O que demonstra**: escrever a asserção primeiro e derivar o arranjo.

## Worked Example (reconstrução)
Diante de uma feature nova, o autor: (1) pergunta "o que me deixa estressado?" → a conversão de moeda; (2) anota na **Test List**; (3) escreve o teste **Assert First** (o resultado `$10`); (4) roda e vê falhar; (5) implementa; (6) **roda os testes** de novo; (7) escolhe **dados evidentes** (5 e 2, taxa 2) para o próximo caso. A ansiedade guia a ordem; a lista guarda o resto.

## Key Takeaways
1. Escolha o próximo teste pelo que **mais te estressa**.
2. **Rode os testes com frequência**; mantenha-os **isolados** e rápidos.
3. Use a **Test List** como memória de trabalho (testes + refatorações).
4. **Test First** (e **Assert First** quando travar) garante testes que realmente falham.
5. **Test Data/Evident Data**: dados de teste claros e reveladores.

## Connects To
- **Ch 26** (Red Bar — o "quando/qual teste"), **Ch 17** (test list no Money).
- **Conceito**: TDD como gestão de ansiedade/risco.
