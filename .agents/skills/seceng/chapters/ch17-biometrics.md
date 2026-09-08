# Capítulo 17 — Biometrics

**Livro**: Security Engineering (Anderson) · `chapters/ch17-biometrics.md`

## Core Idea
Biometria promete autenticar "quem você é", mas na prática é um **sistema de reconhecimento de padrões com taxas de erro, ataques de apresentação (spoofing) e problemas de revogação**. Anderson examina assinaturas, rosto, impressões digitais, íris e voz com ceticismo de engenheiro: biometria é útil para **verificação (1:1)** e para **vincular a um histórico**, mas é fraca como **identificador secreto** — você não pode trocar seu rosto quando ele vaza.

## Frameworks Introduced
- Distinção entre **verificação (1:1 — "você é quem diz ser?")** e **identificação (1:N — "quem é você?")**.
- Conceitos de **false accept rate (FAR)** e **false reject rate (FRR)** e a curva de troca entre eles.
- Análise de cada modalidade: assinatura, rosto, impressão digital, íris, voz.
- Ataques de **apresentação/spoofing** e o problema da **revogabilidade**.

## Key Concepts
- **Assinaturas manuscritas**: verificação por dinâmica (forma + timing/pressão); historicamente fraca e difícil de automatizar com precisão.
- **Reconhecimento facial**: ótimo para *vigilância e busca* (1:N em multidões) e conveniente, mas vulnerável a spoofing (fotos/vídeos/máscaras), depende de iluminação/ângulo, e tem viés demográfico.
- **Impressões digitais**: boa para **verificar identidade positiva** (vincular a um registro/antecedente) e para **forense de cena de crime** (comparar latentes); porém impressões são **deixadas por aí** (podem ser copiadas de um copo) e sistemas baratos são enganados por réplicas.
- **Verificar identidade positiva ou negativa**: biometria é forte para *negar* que alguém já está registrado (ex.: impedir múltiplos cadastros) e para *confirmar* que a pessoa é quem consta no documento.
- **Iris codes**: alta entropia e estabilidade; mas captura difícil (distância, cooperação) e, uma vez copiado o código, é um segredo **permanente e não revogável**.
- **Voz e morphing**: verificação por voz conveniente; vulnerável a gravação e agora a **morphing/clonagem de voz** por IA.
- **O que dá errado**:
  - **FAR/FRR**: sistemas calibrados para aceitar demais (fraude) ou rejeitar demais (usuários legítimos bloqueados).
  - **Spoofing/presentation attacks**: foto, dedo de silicone, voz gravada.
  - **Não-revogabilidade**: vazar sua biometria = vazar para sempre; não há "trocar a senha".
  - **Privacidade e vigilância**: biometria passiva (rosto em câmeras) permite rastreamento sem consentimento.
  - **Forense vs. verificação**: padrões forenses ≠ padrões de autenticação; confundir os dois causa erros judiciais.

## Mental Models
- **Biometria = nome de usuário, não senha**: identifica *quem*, mas não é um segredo confiável (é coletável, duplicável, permanente).
- **Verificação ≠ identificação**: saber "é o João" (1:1) é bem diferente de "quem é este?" em 1 milhão (1:N) — erros crescem com N.
- **FAR e FRR andam juntos**: você escolhe o ponto na curva; não existe "zero erro".
- **Use biometria com um segundo fator**: o que você *é* deve ser combinado com o que você *sabe/tem*.
- **Se vazou, acabou**: para biometria, o vazamento é permanente — trate o template como dado ultra-sensível (armazene hash/proteja, não o cru).

## Anti-patterns
- Usar biometria como **fator único de autenticação** para algo valioso.
- Armazenar **templates biométricos crus/recuperáveis**.
- Sistemas com FAR alto para "não incomodar" o usuário (aceita spoofing).
- Ignorar **ataques de apresentação** e viés demográfico.
- Confundir **match forense** (baixa evidência) com **prova de identidade** em decisões críticas.

## Worked Example
**Desbloqueio de celular por rosto/impressão**: conveniente e adequado para baixo valor (desbloquear o aparelho). Porém, para *autorizar pagamento de alto valor*, o mesmo fator é fraco — um atacante pode usar foto/vídeo ou forçar o dedo do dono adormecido. Prática recomendada: biometria para conveniência + **PIN** (segredo) para transações sensíveis; e o template biométrico fica **isolado no hardware** (TEE/enclave), nunca no servidor.

## Key Takeaways
1. Biometria **identifica**, mas **não é um segredo** — trate como nome de usuário + fator de conveniência.
2. Entenda **FAR/FRR** e o custo de cada erro no seu domínio.
3. Biometria não é **revogável** — proteja templates e combine com outro fator.
4. Spoofing, viés e vigilância passiva são riscos reais a projetar.

## Connects To
- Cap. 3 (usabilidade) — a promessa de "sem senha".
- Cap. 12 (pagamentos) — biometria em transações.
- Cap. 26 (vigilância/privacidade) — reconhecimento facial em massa.
