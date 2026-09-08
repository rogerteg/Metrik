# Capítulo 19 — Side Channels

**Livro**: Security Engineering (Anderson) · `chapters/ch19-side-channels.md`

## Core Idea
Informação vaza **por canais que o design não previu**: tempo, consumo de energia, radiação eletromagnética, som, luz, até comportamento social. Side channels quebram cripto "matematicamente perfeita" e isolamentos "garantidos". Anderson cobre da clássica **emission security (TEMPEST)** aos modernos **Meltdown/Spectre**, mostrando que segredo exige controle do *ambiente físico* e do *comportamento temporal*.

## Frameworks Introduced
- Taxonomia de canais laterais: **passivos** (ouvir) vs. **ativos** (injetar falha), e por meio físico (EM, potência, tempo, acústico, óptico, social).
- **Emission security / TEMPEST**: vazamento por radiação eletromagnética de cabos e telas.
- **Técnicas de ataque ativo**: glitching, fault injection, rowhammer, voltagem.
- **Microarquitetura**: Meltdown/Spectre e canais entre processos/enclaves.
- **TSCM (Technical Surveillance and Counter-Measures)**.

## Key Concepts
- **Emission security**: monitores e cabos emitem; é possível reconstruir o que aparece na tela à distância; **TEMPEST** = padrões/contramedidas (blindagem, filtragem, distância).
- **Vazamento por cabos de energia/sinal e por RF**; o que dá errado (equipamentos sem blindagem, salas sem controle).
- **Ataques entre e dentro de computadores**:
  - **Timing analysis**: o tempo de uma operação revela dados (ex.: comparação de senha, expoente RSA, cache).
  - **Power analysis**: o consumo de energia durante a cripto revela chave (SPA — simples; DPA — diferencial/estatística).
  - **Glitching e differential fault analysis (DFA)**: induzir falha (clock/voltagem/laser) e comparar saídas corrompidas para recuperar chave.
  - **Rowhammer, CLKscrew, Plundervolt**: manipular memória/voltagem para virar bits ou quebrar isolamento.
  - **Meltdown, Spectre e side channels de enclave**: especulação e cache vazam dados entre processos e *para fora de enclaves* (SGX).
- **Canais ambientais**: **acústicos** (som do teclado, do CPU), **ópticos** (reflexo na janela, LED), e outros (térmicos, vibração).
- **Canais sociais**: o comportamento observável das pessoas (quem acessa o quê, quando) também é um side channel organizacional.

## Mental Models
- **"Se o adversário puder medir, pode vazar"**: qualquer correlação mensurável (tempo, energia, EM, som) com um segredo é um canal.
- **Canais encobertos clássicos vs. side channels**: o primeiro é *criado* pelo sistema (storage/timing), o segundo é *inerente à física/implementação*.
- **Proteção = reduzir a correlação**: tempo constante, mascaramento, blindagem, isolamento físico, minimizar dados sensíveis em superfícies mensuráveis.
- **Fault injection converte bugs em quebras**: um glitch no momento certo contorna checks (boot, assinatura).
- **Microarquitetura compartilhada = fronteira ilusória**: se CPU/cache são compartilhados, o "isolamento" lógico não basta.

## Anti-patterns
- Cripto/implementações com **tempo variável dependente do segredo** (ex.: comparação ingênua de MAC/senha).
- Rodar segredos de longa vida em **hardware compartilhado** sem considerar canais de cache/especulação.
- **Sem controle físico** do ambiente (quem pode medir EM/som/potência?).
- Ignorar **fault injection** em verificações críticas (boot, autenticação de firmware).
- Tratar side channels como "ataque de laboratório" irrelevante.

## Worked Example
**Verificação de PIN/senha com timing**: um loop que compara caractere por caractere e para no primeiro erro vaza *quantos caracteres estavam certos* pelo tempo. Com repetição, o atacante reconstrói o segredo caractere a caractere. Correção: comparação em **tempo constante** (ex.: XOR acumulado sobre toda a string) + limite de tentativas. Lição: a "mesma" lógica, implementada com vazamento de tempo, é insegura — micro-otimizações viram vulnerabilidades.

## Key Takeaways
1. Side channels **existem sempre**; o trabalho é reduzir a correlação mensurável.
2. Timing, potência, EM, som, luz e **fault injection** são vetores reais — incluindo Meltdown/Spectre.
3. Use **tempo constante**, mascaramento, blindagem e isolamento físico onde o segredo vale.
4. **Proteja o ambiente**: quem pode medir seu hardware é metade do caminho para te quebrar.

## Connects To
- Cap. 5 (cripto) — implementações cripto como alvo.
- Cap. 18 (tamper resistance) — ataques físicos invasivos/não-invasivos.
- Cap. 9 (canais encobertos) — parentesco conceitual.
