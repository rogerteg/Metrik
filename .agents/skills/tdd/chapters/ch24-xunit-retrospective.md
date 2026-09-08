# Capítulo 24 — xUnit Retrospective

**Livro**: TDD by Example (Beck) · `chapters/ch24-xunit-retrospective.md`

## Core Idea
Retrospectiva da construção do xUnit: o que o exercício ensinou sobre **usar TDD para criar infraestrutura**, sobre o **poder de testar o próprio framework**, e sobre **decisões de design** (Template Method, Composite) que emergiram naturalmente.

## Frameworks Introduced
- Reflexão sobre o processo: **dogfooding** (testar a ferramenta com ela mesma).
- Padrões que emergiram: **Template Method** (TestCase.run), **Composite** (TestSuite), **Collecting Parameter** (TestResult passado adiante).

## Key Concepts
- **Lições do processo**:
  - Começamos com o **comportamento mais simples observável** (WasRun) e crescemos por necessidade (setUp, tearDown, contagem, falha, suíte) — cada passo guiado por um teste que falhava.
  - **Testar o framework com ele mesmo** valida que a ferramenta funciona em condições reais (e é um teste "de verdade" dos padrões que você usará).
  - As decisões de design (método chamado por nome via reflexão, resultado compartilhado) foram **puxadas pelos testes**.
- **Padrões reconhecíveis a posteriori**:
  - `TestCase.run()` é um **Template Method** (setUp → método → tearDown, com passos que subclasses preenchem).
  - `TestSuite` é um **Composite** (trata grupo e elemento igualmente).
  - `TestResult` passado por `run(result)` é um **Collecting Parameter** (objeto que coleta ao longo das chamadas).
  - `WasRun` funcionou como **Crash Test Dummy**/sonda para observar o comportamento do framework.
- **O valor de um framework mínimo**: entender como o xUnit funciona por dentro ensina a **escrever testes melhores** (fixtures, isolamento, falhas claras) e a **estender** frameworks quando precisar.

## Mental Models
- **Ferramentas que você usa devem ser compreensíveis**: construir um xUnit mínimo remove o "misticismo" do framework.
- **Os padrões de design aparecem quando você menos espera** — se você os força antes, perde a chance de vê-los emergir.
- **Teste a infraestrutura como testaria o produto**: mesmo critérios de risco/medo se aplicam.
- **Comece pequeno, generalize por pressão de teste**, não por especulação.

## Anti-patterns
- Usar um framework de testes sem entender o que ele faz (setUp/tearDown/isolamento viram "mágica").
- Projetar o framework inteiro antes de testar o primeiro comportamento.
- Forçar padrões de design prematuramente.

## Worked Example (reconstrução)
Ao revisar, o autor aponta que **nenhuma** das abstrações (TestCase, TestResult, TestSuite, hooks) foi planejada de antemão: cada uma nasceu de um teste que não passava sem ela. A reflexão reforça a tese central do livro: **TDD produz design emergente e infraestrutura confiável**, porque cada linha tem um teste que a justifica.

## Key Takeaways
1. **Teste sua própria infraestrutura** (dogfooding) — ela merece os mesmos cuidados do produto.
2. Padrões (Template Method, Composite, Collecting Parameter) **emergem** dos testes.
3. Construir um xUnit mínimo **desmistifica** o framework que você usa todo dia.
4. Design emergente, guiado por teste, gera código enxuto e justificado.

## Connects To
- **Ch 30** (design patterns), **Ch 29** (xUnit patterns), **Ch 17** (retrospectiva análoga do Money).
