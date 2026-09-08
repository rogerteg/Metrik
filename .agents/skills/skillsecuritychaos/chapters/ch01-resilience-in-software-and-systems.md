# Capítulo 1 — Resilience in Software and Systems

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch01-resilience-in-software-and-systems.md`

## Core Idea
Cibersegurança tradicional tenta **prevenir falhas** — mas em **sistemas complexos** a falha é inevitável. A alternativa é **resiliência**: a capacidade de *se recuperar de falhas e se adaptar* conforme o contexto muda. Este capítulo define sistema complexo, o que é falha, e o que realmente compõe a resiliência — desmontando os mitos que desviam a estratégia de segurança.

## Frameworks Introduced
- **O que é um sistema complexo** (e por que software moderno é um).
- **O que é falha** (e por que "prevenir" é insuficiente).
- **Os 5 atributos da resiliência**: critical functionality, safety boundaries, interações no espaço-tempo, feedback loops/aprendizado, flexibilidade.
- **Resiliência é um verbo** (processo contínuo, não estado).
- **Resiliência: mito vs. realidade** (4 mitos).

## Key Concepts
- **Sistema complexo** tem três marcas:
  1. **Variety**: muitos elementos diversos (times, serviços, dependências) → comportamentos impossíveis de prever pela soma.
  2. **Adaptativo**: os componentes (inclusive humanos) mudam de comportamento em resposta ao ambiente.
  3. **Holístico**: o comportamento do todo não é derivável das partes — as *interações* é que importam.
- **Falha**: desvio do esperado. Em sistemas complexos, é normal, não exceção.
  - **Estressores agudos** (ataque, pico, queda de dependência) e **crônicos** (dívida técnica, déficit de observabilidade, fadiga de alertas).
  - **Surpresas**: eventos que o modelo mental não antecipou — são elas que revelam a verdadeira resiliência.
- **Resiliência** = recuperar + adaptar. Componentes:
  - **Critical functionality**: o que precisa continuar funcionando para o sistema cumprir seu propósito (identificar primeiro).
  - **Safety boundaries (thresholds)**: onde está o limite entre operar bem e falhar; se você não sabe onde estão, não sabe o quanto pode empurrar.
  - **Interações no espaço-tempo**: componentes distribuídos interagem através do espaço e do tempo (estado, filas, timeouts) — fonte clássica de surpresas.
  - **Feedback loops e cultura de aprendizado**: o sistema (e a organização) aprende com falhas e se adapta.
  - **Flexibilidade e abertura à mudança**: capacidade de mudar de curso quando o contexto muda.
- **Resiliência é um verbo**: não é algo que você "tem"; é algo que você *faz* continuamente (reavaliar, adaptar, experimentar).

## Mental Models
- **Robustez ≠ resiliência**: robustez resiste sem mudar (um muro); resiliência se recupera e se adapta (um organismo). Sistemas modernos precisam da segunda.
- **"Podemos e devemos prevenir toda falha" é mito**: gastar 100% em prevenção deixa você sem resposta quando (não se) a falha ocorre.
- **A segurança dos componentes não soma**: um sistema de componentes "seguros" pode ser frágil por causa das *interações* (ex.: dois serviços seguros com um timeout mal calibrado entre eles).
- **"Criar cultura de segurança" não conserta erro humano**: humanos sempre errarão; o que muda é o design das condições (defaults, affordances, tolerância a erro).
- **Pense em estressores agudos E crônicos**: os crônicos (dívida, ruído) degradam a resiliência lentamente e são os mais negligenciados.

## Anti-patterns
- **Só prevenção**: sem plano de detecção/recuperação, uma falha inevitável vira desastre.
- **Endurecer componentes isolados** e ignorar as interações entre eles.
- **Culpar "erro humano"** (isso é do cap. 6, mas a mentalidade nasce aqui: condições > indivíduos).
- **Tratar resiliência como projeto com data de fim** (é processo contínuo).
- **Empurrar até o limite sem conhecer os safety boundaries** (e sem observabilidade para vê-los).

## Worked Example
**Um serviço de pagamentos**: a equipe acha que o sistema é resiliente porque cada microsserviço tem redundância (robustez). Um ataque DDoS derruba o gateway; o timeout do cliente para o gateway é curto e não configurável → o timeout estoura em cascata e todos os serviços a montante falham (interação espaço-tempo não prevista). A "soma de componentes seguros" não produziu resiliência. O conserto é *sistêmico*: definir a **funcionalidade crítica** (aceitar pedidos mesmo com gateway degradado), conhecer os **safety boundaries** (quanto tempo o cliente espera?), ter **feedback loop** (postmortem vira hipótese de experimento), e **flexibilidade** (timeout dinâmico, circuit breaker). Resiliência é o processo de aprender e adaptar, não a soma das partes.

## Key Takeaways
1. Software moderno é **sistema complexo**: variedade, adaptação, holismo.
2. **Falha é inevitável** — invista em recuperar/adaptar, não só prevenir.
3. Resiliência tem partes: **funcionalidade crítica, safety boundaries, interações, feedback, flexibilidade**.
4. **Resiliência é verbo** e desmonta 4 mitos: robustez≠resiliência; não dá para prevenir tudo; componente seguro ≠ sistema seguro; "cultura" não conserta condições ruins.

## Connects To
- **Ch 2**: como avaliar resiliência (E&E) e pensar sistêmico em segurança.
- **Ch 6**: por que "human error" é um beco sem saída.
- **Conceitos**: Safety-I/Safety-II, *Normal Accidents* (Perrow) — base teórica citada no livro.
