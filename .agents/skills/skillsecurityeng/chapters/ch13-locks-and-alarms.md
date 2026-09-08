# Capítulo 13 — Locks and Alarms

**Livro**: Security Engineering (Anderson) · `chapters/ch13-locks-and-alarms.md`

## Core Idea
Antes dos computadores, a segurança já era engenharia — com **fechaduras, barreiras e alarmes**. Anderson mostra que esse mundo físico ensina lições diretas para o digital: a importância do **modelo de ameaça** (quem é o ladrão), a diferença entre **deterrence e barreira**, e como **alarmes** são sistemas de detecção com seus próprios problemas de *feature interaction* e *ataques à comunicação*.

## Frameworks Introduced
- **Threat model** aplicado a proteção física (quem ataca, com que ferramenta, em quanto tempo).
- Taxonomia de respostas: **deterrence** (dissuasão), **barreira** (atraso), **detecção** (alarme), **resposta**.
- Fechaduras **mecânicas vs. eletrônicas**.
- Alarmes como **sistemas distribuídos de detecção** (sensores, comunicação, central).

## Key Concepts
- **Threat model físico**: o adversário típico não é um "master criminal" — é o *oportunista* com ferramentas comuns. O nível de proteção deve ser proporcional ao valor e à exposição.
- **Deterrence**: tornar o alvo pouco atraente (visibilidade, iluminação, presença). **Barreiras**: paredes, cofres, fechaduras — compram *tempo*.
- **Fechaduras mecânicas**: a "segurança" real está na dificuldade de *bumping*, *picking*, impressão e na qualidade do cilindro; muitas fechaduras "seguras" caem com técnicas simples.
- **Fechaduras eletrônicas**: chaves digitais, PIN, cartão, biometria; vantagens (auditoria, revogação remota) e riscos (falha de energia, hacking do controlador, side channels).
- **Alarmes**:
  - **Como não proteger um quadro**: a lição do alarme que pode ser silenciado/enganado.
  - **Sensor defeats**: como enganar sensores (PIR, contato, vídeo) — cegar, mascarar, saturar.
  - **Feature interactions**: sistemas que se atrapalham (ex.: alarme que dispara com o próprio dono, levando a "cry wolf" e dessensibilização).
  - **Ataques às comunicações**: cortar/jammer o link entre sensor e central; spoof da central.
  - **Lessons learned**: alarme só é útil se houver **resposta** confiável e se não gerar alarmes falsos demais.

## Mental Models
- **Barreira = atraso, não perfeição**: o objetivo é fazer o atacante gastar mais tempo/risco do que vale o alvo.
- **Todo alarme tem taxa de falso positivo e negativo**; alarmes falsos demais destroem a utilidade (ninguém responde).
- **O atacante ataca o sistema inteiro, não a peça**: fechadura forte + janela aberta = sem proteção; sensor bom + cabo cortado = cego.
- **Deterrence funciona contra o oportunista, não contra o determinado** — saiba qual você enfrenta (cap. 2).
- **Custo do controle deve ser < perda esperada** (economia, cap. 8).

## Anti-patterns
- Proteção focada só na **porta da frente** ignorando perímetro e outros vetores.
- Alarmes com **muitos falsos positivos** (viram "o menino que gritou lobo").
- **Comunicação do alarme sem proteção** (cabo/canal cortável).
- Depender de **uma única camada**.
- Subestimar o **insider** (quem conhece o código do alarme / a fechadura).

## Worked Example
**Proteger um depósito**: análise: o valor justifica deter *oportunistas* (não um exército). Solução em camadas: (a) **deterrence** — iluminação e visibilidade; (b) **barreira** — fechadura de qualidade + tranca, comprando ~5–10 min; (c) **detecção** — sensores + câmera com gravação em nuvem (não local, que o ladrão levaria); (d) **resposta** — central com verificação e polícia. Lição: nenhuma camada é suficiente sozinha; o *tempo* que as camadas compram é o que permite a resposta.

## Key Takeaways
1. Comece pelo **modelo de ameaça físico** e seja proporcional ao valor.
2. Use **camadas**: dissuadir, atrasar, detectar, responder.
3. Alarmes valem o que vale a **resposta** e sofrem com falsos positivos.
4. Proteja o **sistema inteiro** (inclusive comunicações e insiders).

## Connects To
- Cap. 2 (adversários) — quem é o ladrão.
- Cap. 8 (economia) — proporcionalidade do gasto.
- Cap. 28 (assurance) — avaliação de alarmes/fechaduras (regimes de certificação).
