# Capítulo 26 — Surveillance or Privacy?

**Livro**: Security Engineering (Anderson) · `chapters/ch26-surveillance-or-privacy.md`

## Core Idea
A segurança moderna é disputada no terreno da **vigilância × privacidade**. Anderson examina a vigilância governamental (de grampos a programas de inteligência em massa — Snowden), o contraterrorismo, a censura, a forense digital e as regulações de privacidade (GDPR). A pergunta central: como equilibrar segurança, ordem e direitos individuais num mundo em que **tudo é rastreável** — e como engenheiros devem responder à "crypto war".

## Frameworks Introduced
- História da **interceptação governamental** e a evolução para coleta em massa.
- O sistema dos **Five Eyes** ("system of systems") e os **crypto wars**.
- Análise de **terrorismo** (causas, psicologia, instituições, resposta democrática).
- **Censura** e moderação (autoritária e de plataformas).
- **Forense e regras de evidência**.
- **Privacidade e proteção de dados**: Europa (GDPR) vs. EUA; fragmentação.

## Key Concepts
- **Vigilância**:
  - *História dos grampos* (wiretapping) e o crescimento da capacidade.
  - **Call data records (CDRs)**: metadados de chamadas — revelam a vida social sem conteúdo.
  - **Termos de busca e dados de localização**: igualmente reveladores (cap. 11).
  - **Processamento algorítmico** em massa.
  - **ISPs e CSPs (provedores)**: o ponto de coleta central.
  - **Five Eyes e o sistema de sistemas**: integração de inteligência de sinais entre agências.
  - **Crypto wars**: a tensão entre cripto forte (privacidade) e acesso governamental; **Crypto War 2 — "going spotty"**: o debate sobre backdoors/encryption e a fragmentação.
  - **Controle de exportação** de cripto (histórico que moldou a disponibilidade de cripto).
- **Terrorismo**:
  - *Causas da violência política* e a **psicologia** da violência política.
  - **Papel das instituições** e a **resposta democrática** (o que funciona: estado de direito, resiliência, não super-reação que alimenta o recrutamento).
- **Censura**:
  - **Censura por regimes autoritários** (Great Firewall e congêneres) — técnica e evasão.
  - **Filtragem, discurso de ódio e radicalização** nas plataformas — o dilema da moderação.
- **Forense e regras de evidência**:
  - **Forense digital** (recuperar dados, atribuição) e os limites.
  - **Admissibilidade da evidência** (cadeia de custódia, integridade).
  - **O que dá errado**: falsos positivos, evidência contaminada, excesso de confiança.
- **Privacidade e proteção de dados**:
  - **Proteção de dados europeia (GDPR)**: direitos do titular, minimização, responsabilidade — o padrão global de facto.
  - **Regulação de privacidade nos EUA**: setorial e fragmentada (sem lei geral federal).
  - **Fragmentação**: o mundo dividido entre jurisdições (e o que isso significa para engenheiros: onde estão os dados, qual lei vale).

## Mental Models
- **Metadados também são conteúdo**: quem você chama, quando, de onde — revela quase tudo.
- **A coleta em massa muda o equilíbrio de poder**: vigilância barata + armazenamento barato = vigilância permanente por padrão.
- **Backdoor de cripto é backdoor para todos**: enfraquecer cripto para "bons" também enfraquece para "maus" — o debate central da crypto war.
- **A resposta ao terrorismo pode criar mais terrorismo** se sacrificar direitos e alimentar narrativas — instituições e estado de direito importam.
- **Censura gera evasão (e vice-versa)**: toda barreira técnica de censura encontra técnicas de evasão; a batalha é política e econômica.
- **Para o engenheiro: privacidade é um requisito de design** (data minimization, E2E, DP), não um extra.

## Anti-patterns
- Tratar **metadados como "menos sensíveis"** que conteúdo.
- Defender **backdoors/keys escrow** sem reconhecer o custo para todos os usuários.
- **Coleta máxima "por segurança"** sem necessidade e sem supervisão (cria incentivos a abuso).
- Forense sem **cadeia de custódia** e sem entender limites de atribuição.
- Tratar GDPR como "burocracia" em vez de requisito de engenharia (privacy by design).

## Worked Example
**App de mensageria sob vigilância**: a escolha de design decide quem pode ver o quê. Um app **E2E** (chaves só nos dispositivos) impede o provedor e reduz o valor da interceptação; um app sem E2E entrega conteúdo a pedido legal/coerção. Para jornalistas/dissidentes, **metadata ainda vaza** (quem fala com quem) mesmo com E2E — daí PETS (Tor, e-mail cifrado com cuidado de metadata). A lição: o *design* (E2E, minimização, onde vivem as chaves) é uma decisão política de segurança.

## Key Takeaways
1. **Metadados e localização** revelam tanto quanto conteúdo — proteja ambos.
2. Cripto forte é a defesa técnica central; **backdoors** enfraquecem a todos.
3. Contraterrorismo eficaz respeita **instituições e direitos** (estado de direito).
4. **Privacy by design** (GDPR, minimização, E2E) é requisito de engenharia, não opcional.

## Connects To
- Cap. 11 (inference) — o que metadados/dados permitem inferir.
- Cap. 20/22 (Signal, Tor, celular) — as ferramentas e seus limites.
- Cap. 2 (spooks) — quem vigia e por quê.
