# Capítulo 6 — Responding and Recovering

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch06-responding-and-recovering.md`

## Core Idea
Depois do incidente, nossos **vieses cognitivos** distorcem decisão e aprendizado: *action bias* (agir cedo demais), *hindsight* e *outcome bias* (julgar pelo resultado), e a *just-world hypothesis* (culpar quem sofreu). O capítulo ensina a **responder com método**, **praticar a resposta** antes do incidente, e adotar **cultura sem culpa** — erradicando o "human error" como "causa raiz", que encerra a investigação em vez de revelar as condições do sistema.

## Frameworks Introduced
- **Respondendo a surpresas em sistemas complexos**.
- **Incident Response e o effort investment portfolio**.
- **Action bias** na resposta a incidentes.
- **Praticar resposta** (ensaios).
- **Recuperando de surpresas**.
- **Blameless culture** e o problema de culpar "human error".
- **Hindsight bias, outcome bias e just-world hypothesis**.
- **Neutral practitioner questions**.

## Key Concepts
- **Responder a surpresas**: em sistemas complexos o incidente raramente tem uma causa única e óbvia; a resposta deve buscar *estabilizar* primeiro, entender depois.
- **IR como portfólio de esforço**: nem todo incidente merece o mesmo esforço — aloque resposta proporcional ao impacto (como no portfólio do ch. 3), em vez de "guerra total" sempre.
- **Action bias**: a pressão para "fazer algo" leva a mexer no sistema sem entender, **piorando** o incidente (ex.: reiniciar o serviço errado, reverter o commit errado). Contraponto: **perguntar antes de agir** — o que sabemos? agir muda o quê? qual o risco da ação?
- **Praticar resposta**: ensaie (game days, simulações de incidente) para que a resposta seja **treinada**, não improvisada sob estresse. A prática reduz o action bias e melhora a coordenação.
- **Recuperar**: voltar à funcionalidade crítica com segurança; recuperação também é aprendizado (o que faltou para recuperar mais rápido?).
- **Blameless culture**:
  - **Culpar "human error"** é um beco sem saída: encerra a investigação ("foi o João") e não muda o sistema.
  - Pergunte: **que condições** (ferramentas, pressão, ambiguidade, falta de treino/feedback) levaram o humano a errar? O humano é o *herdeiro* das condições, não a causa.
  - **Blameless ≠ sem responsabilidade**: accountability sim; culpa punitiva não.
- **Vieses**:
  - **Hindsight bias**: depois do fato, "era óbvio" — distorce a leitura de quão previsível era.
  - **Outcome bias**: julgar a decisão pelo resultado (uma decisão razoável que deu errado é tratada como erro; uma decisão ruim que deu certo é elogiada). Avalie pela qualidade da decisão *no momento*.
  - **Just-world hypothesis**: acreditar que o mundo é justo leva a culpar a vítima ("ela clicou, foi culpa dela") e a subestimar fatores sistêmicos.
- **Neutral practitioner questions**: substituir "quem fez?" por perguntas neutras que mapeiam condições e decisões (ex.: "o que você estava tentando alcançar?", "que informação você tinha naquele momento?", "o que teria ajudado?").

## Mental Models
- **Estabilize antes de entender**: em incidente, primeiro contenha o dano à funcionalidade crítica; a análise profunda vem depois (e sem pressão de ação).
- **"Fazer algo" ≠ "fazer a coisa certa"**: ação sob incerteza pode amplificar o problema — a melhor ação às vezes é observar.
- **O operador é o último elo de um sistema de condições**: culpar a pessoa é parar de aprender sobre o sistema.
- **Decisões são avaliadas no momento, não pelo resultado**: combate hindsight/outcome bias.
- **Ensaiar faz a resposta virar reflexo**: o que você praticou, você executa sob estresse; o que não praticou, você improvisa (e erra).

## Anti-patterns
- **Action bias**: reiniciar/reverter às cegas durante o incidente.
- **"Root cause: human error"**: encerrar a investigação na pessoa.
- **Postmortem punitivo** (caça à bruxa) → esconde problemas e impede aprendizado.
- **Julgar decisões pelo resultado** (hindsight/outcome bias) em revisões.
- **Just-world thinking**: "o usuário mereceu" — culpar vítima e ignorar design.
- **Nunca ensaiar resposta** (primeira vez do time é no incidente real).

## Worked Example
**Incidente com feature flag**: uma flag mal configurada derruba o checkout. O plantonista, sob pressão, **reinicia o serviço** (action bias) — não resolve. A equipe então segue o protocolo treinado: primeiro **estabiliza** desligando a flag (ação reversível conhecida), depois investiga. No postmortem, em vez de "quem mergeou a flag?", perguntas **neutras**: "que informação o revisor tinha?", "a flag tinha validação de configuração?", "o que teria impedido?". Descobrem que faltava **validação de config** e **teste de feature flag** no CI (condições do sistema). A melhoria vira hipótese de experimento (ch. 8). Ninguém foi culpado; o sistema mudou.

## Key Takeaways
1. **Combata o action bias**: estabilize com ações conhecidas/reversíveis; entender vem depois.
2. **Pratique resposta** (game days) — não improvise sob estresse.
3. **Cultura sem culpa**: erradique "human error" como causa raiz; pergunte pelas **condições**.
4. Vigie **hindsight, outcome e just-world bias** ao revisar incidentes; use **perguntas neutras**.
5. Todo incidente é **matéria-prima para o próximo experimento**.

## Connects To
- **Ch 5**: observabilidade do incidente alimenta a resposta.
- **Ch 8**: incidentes passados são fonte de hipóteses/experimentos (lição #2).
- **Ch 1**: "erro humano" revisitado à luz de sistemas complexos.
- **Conceitos**: blameless postmortems, *The Field Guide to Understanding Human Error* (Dekker).
