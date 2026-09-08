# Capítulo 26 — Red Bar Patterns

**Livro**: TDD by Example (Beck) · `chapters/ch26-red-bar-patterns.md`

## Core Idea
Padrões para a fase **vermelha** — quando você tem um teste que não passa. Eles respondem: *qual teste escrever agora?* (One Step Test, Starter Test), *como aprender/ensinar?* (Explanation Test, Learning Test), *como tratar bugs?* (Regression Test), *como forçar generalização?* (Another Test) e *o que fazer quando a barriga vermelha não sai?* (Do Over).

## Frameworks Introduced
- **One Step Test**: qual o próximo teste que você sabe escrever e que vai falhar?
- **Starter Test**: o primeiro teste do sistema (o mais simples que exercita a arquitetura).
- **Explanation Test**: teste que explica/ensina o comportamento a alguém.
- **Learning Test**: teste que aprende como uma API/ferramenta de terceiros funciona.
- **Regression Test**: teste que reproduz um bug antes de corrigi-lo.
- **Another Test**: variação que força a generalização da implementação.
- **Do Over**: descartar e recomeçar quando a tentativa está confusa.

## Key Concepts
- **One Step Test**: de uma lista de testes, escolha **um** que você sabe escrever e que vai falhar por uma razão nova e informativa. Se você não consegue pensar em nenhum, faça algo não relacionado (ou pare).
- **Starter Test**: para um sistema novo, o primeiro teste deve ser o mais simples que valida a arquitetura — ex.: no Money, "5×2=10"; o objetivo é **ter algo verde cedo** para começar a iterar.
- **Explanation Test**: alguém pergunta "como isso funciona?" → escreva um teste que demonstra/responde; vira documentação executável.
- **Learning Test**: antes de usar uma API nova, escreva testes que aprendem o comportamento real dela (e documentam o que você descobriu).
- **Regression Test**: bug relatado → primeiro o teste que **reproduz** o bug (vê falhar), depois corrige. Garante que o bug não volta.
- **Another Test**: para escapar de uma implementação "fake"/específica demais, adicione uma **variação** que o código atual não cobre (força generalização) — ou aceite a implementação se ela já for geral.
- **Do Over**: se você se perdeu (teste grande, código confuso), **jogue fora** e recomece de um ângulo menor. Recomeçar costuma ser mais barato que consertar a bagunça.

## Mental Models
- **Cada teste deve falhar por um motivo novo** — se já passa, não aprende nada.
- **O tamanho do passo é variável**: pequeno quando inseguro, grande quando confiante; o One Step Test calibra isso.
- **Bug = teste faltando**: Regression Test transforma bug em especificação permanente.
- **Recomeçar é uma estratégia legítima**: Do Over quando a complexidade local supera o progresso.

## Anti-patterns
- Escrever o mesmo tipo de teste repetido (sem razão nova para falhar).
- Consertar bug sem teste de regressão (ele volta).
- Insistir numa abordagem confusa em vez de recomeçar menor.
- Teste inicial grande demais (demora para ficar verde).

## Code Example (conceitual)
```java
// Regression Test: reproduz o bug antes de corrigir
@Test public void testRateWhenSameCurrency() {
    assertEquals(1, bank.rate("USD", "USD")); // falhava: taxa não registrada
}
```
- **O que demonstra**: teste que captura o bug (identidade monetária).

## Worked Example (reconstrução)
Um usuário reporta que converter USD→USD quebra. O autor: (1) escreve o **Regression Test** `rate("USD","USD") == 1`; (2) vê falhar (Red); (3) implementa a identidade no `rate`; (4) verde. Mais tarde, ensinando o framework a um colega, escreve um **Explanation Test** que demonstra setUp/tearDown. Ao travar num teste grande de integração, aplica **Do Over** e recomeça com um **Child Test** (ch. 27) menor.

## Key Takeaways
1. **One Step Test**: um teste por vez, falhando por razão nova.
2. **Starter Test** simples para sistemas novos; **Explanation/Learning Tests** para ensinar/aprender.
3. Bugs exigem **Regression Test** primeiro.
4. **Another Test** força generalização; **Do Over** quando estiver perdido.

## Connects To
- **Ch 25** (Test List/Stress alimentam o One Step Test), **Ch 27** (Child Test para reduzir), **Ch 28** (sair do vermelho).
