# Capítulo 32 — Mastering TDD

**Livro**: TDD by Example (Beck) · `chapters/ch32-mastering-tdd.md`

## Core Idea
O capítulo final não ensina novas mecânicas — **questiona a prática**: como o TDD muda a forma de pensar, quando faz sentido, como calibrar o tamanho do passo, e os limites/variações do método. Beck levanta perguntas para o leitor ponderar ao "dominar" o TDD (acompanhado dos apêndices: Influence Diagrams e o exercício de Fibonacci).

## Frameworks Introduced
- Reflexões sobre **ritmo, tamanho do passo e estado de fluxo**.
- A matemática emocional do TDD: **medo × confiança**.
- O **exercício de Fibonacci** (apêndice II) como prática de TDD "puro".
- **Influence diagrams** (apêndice I) como ferramenta de pensamento sistêmico.

## Key Concepts
- **O que muda com a maestria**: o TDD deixa de ser "regras" e vira **ritmo** — você sente quando o passo está grande ou pequeno demais.
- **Tamanho do passo**: há um equilíbrio entre passos pequenos (seguros, lentos) e grandes (rápidos, arriscados). Mestria = saber variar **conscientemente** conforme a confiança.
- **Medo e confiança**: escrevemos testes onde temos **medo** de errar. À medida que a suíte cobre o que assusta, a confiança sobe e você pode dar passos maiores. O TDD é uma **gestão de medo**.
- **Quando TDD é difícil**: UI, concorrência, código legado sem testes, algoritmos "óbvios demais" — exige adaptação (testar as bordas, isolar lógica pura, approval tests, etc.).
- **TDD não é bala de prata**: é uma disciplina que combina com design, refatoração e bom senso; às vezes o custo não compensa (código descartável/experimental).
- **Fibonacci (apêndice II)**: exercício clássico de TDD passo a passo — do 0,1 até a sequência — para praticar "qual o próximo teste?" com um problema sem estado.
- **Influence diagrams (apêndice I)**: diagramas de influência (peso, exercício, autoestima...) para pensar em **feedback e causalidade** — a base conceitual de por que feedback rápido (testes) melhora o sistema.

## Mental Models
- **TDD é sobre gerenciar seu próprio medo**: o teste que você reluta em escrever é o que mais precisa ser escrito.
- **Ritmo > regra**: a maestria é sentir o tamanho certo do passo e o momento de refatorar.
- **Feedback é a alavanca**: testes dão feedback em minutos — e feedback rápido é o que permite aprender e mudar sem medo (ligado aos influence diagrams).
- **Adapte o método ao contexto**: legado, UI e concorrência pedem variações, não abandono.

## Anti-patterns
- TDD dogmático (passos minúsculos para sempre, mesmo quando a confiança é alta).
- Aplicar TDD onde o custo supera o benefício (protótipos descartáveis) sem pensar.
- Ignorar a **qualidade dos testes** (testes frágeis/lentos corroem a confiança).
- Nunca variar o passo (sempre pequeno = lento; sempre grande = arriscado).

## Worked Example (Fibonacci — reconstrução)
O autor sugere praticar TDD com Fibonacci: escreva o teste `fib(0) == 0` → implemente; `fib(1) == 1` → implemente; depois os casos seguintes. Em algum ponto os casos viram "óbvios" e você decide entre continuar um-a-um ou generalizar. O exercício revela seu estilo natural de passo e quando você prefere **Obvious Implementation** a **Fake It** — um espelho da sua maestria.

## Key Takeaways
1. Maestria = **ritmo e calibração do passo**, não regras mecânicas.
2. **Escreva testes onde há medo**; a confiança cresce com a cobertura.
3. Adapte o TDD ao contexto (legado, UI, concorrência) — não abandone.
4. Pratique com exercícios (Fibonacci) e pense sistemicamente (influence diagrams): **feedback rápido** é o que sustenta tudo.

## Connects To
- **Ch 25** (Stress/ansiedade), **Ch 28** (tamanho do passo), **Afterword de Fowler** (economia do TDD).
- **Conceito**: ciclos de feedback; prática deliberada.
