# Capítulo 9 — Security Chaos Engineering in the Wild

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch09-security-chaos-engineering-in-the-wild.md`

## Core Idea
SCE não é teoria: organizações reais (UnitedHealth Group, Verizon, OpenDoor, Cardinal Health, Accenture, Capital One) implementaram experimentos de caos de segurança e compartilham lições. Este capítulo destila esses **experience reports**: por que começaram, como construíram as práticas/ferramentas, que experimentos rodaram e o que aprenderam — o "caminho das pedras" para adotar SCE em escala enterprise.

## Frameworks Introduced
- **Experience reports** como fonte de padrões de adoção de SCE.
- **ChaoSlingr** (UnitedHealth) como framework open source de experimentos de segurança.
- **CVV — Continuous Verification and Validation** (Cardinal Health).
- Categorias de experimentos (Verizon): **reliability, cost, performance, risk**.
- **Roadmap de adoção enterprise** (Accenture) e **Cyber Chaos Engineering** (Capital One).
- Temas transversais: **redução de guesswork**, **driving value**, **"o que é seguro hoje pode não ser amanhã"**.

## Key Concepts
- **UnitedHealth Group — "ordem através do caos" (ChaoSlingr)** (por Aaron Rinehart):
  - **Problema original**: documentação técnica incompleta em revisões de arquitetura; recomendações de segurança sem **feedback** sobre se foram implementadas/eficazes. Precisavam "perguntar ao sistema" sobre seu estado de segurança operacional **depois do deploy**.
  - Nasceu da migração ao **AWS** + conversa com o primeiro SRE (inspiração no chaos engineering da Netflix/Chaos Monkey).
  - **ChaoSlingr**: framework serverless em Python/Boto3 para AWS, composto de 3 funções Lambda:
    - **Generatr** — identifica o alvo da falha e chama o Slingr;
    - **Slingr** — injeta a falha;
    - **Trackr** — registra detalhes do experimento.
    - (+ *experiment description* com parâmetros de entrada/saída).
  - **Exemplo real**: experimento de **porta mal configurada** — hipótese: "firewall detecta e bloqueia; incidente é logado". Resultado: *metade das vezes* o firewall falhou em detectar; uma ferramenta de config em nuvem sempre bloqueava, mas **não logava** de forma que o time achasse. **A evidência abalou a crença do time na própria postura** — exatamente o valor do SCE.
  - Lição: os experimentos **provam se suas premissas são verdadeiras**; você para de adivinhar sobre sua instrumentação.
- **Verizon — "uma busca por confiabilidade mais forte"**:
  - Foco em **confiabilidade**; "quanto maior, mais...": desafios de escala; "all hands on deck = no hands on the helm" (todo mundo apagando incêndio = ninguém no leme).
  - Prática de **"assert your hypothesis"** e **reliability experiments**, com categorias: **cost experiments**, **performance experiments**, **risk experiments** e experimentos mais tradicionalmente conhecidos — evoluindo para o paradigma **contínuo** (não eventos pontuais).
- **OpenDoor — security monitoring**: experiência em usar SCE para validar/calibrar **monitoramento de segurança** (os alertas realmente disparam quando o cenário adverso ocorre?).
- **Cardinal Health — "Applied Security" e CVV** (por Jamie Dicken e Rob Duhart, Jr.):
  - SCE cresceu organicamente numa empresa global de saúde (Fortune 20).
  - **Construir a cultura SCE**; missão da "Applied Security".
  - Método: **CVV — Continuous Verification and Validation**, com um processo de **4 passos** que verifica e valida continuamente os controles de segurança (verificação/validação contínua em vez de auditoria pontual).
- **Accenture Global — equilibrando reliability e security**:
  - **Roadmap para capacidade enterprise de SCE** e **processo de adoção**: como levar SCE de piloto a prática organizacional.
- **Capital One — Cyber Chaos Engineering** (por David Lavezzo):
  - Banco Fortune 100, "viciado em tecnologia", primeiro banco a sair de datacenters para nuvem.
  - Tema: **"o que é seguro hoje pode não ser seguro amanhã"** — por isso verificação contínua.
  - Como começaram, como era "nos velhos tempos", **lições aprendidas ao longo do caminho**: **redução de guesswork** e **driving value** (entregar valor mensurável).
- **Síntese**: comunidade SCE cresce; ferramentas genéricas de chaos engineering amadurecem e ganham experimentos de segurança — mas times ainda devem **desenhar seus próprios experimentos** (scripting) ou usar frameworks como ChaoSlingr.

## Mental Models
- **"Você não está adivinhando: está perguntando ao sistema"** — o experimento substitui a suposição sobre a própria postura de segurança.
- **Adoção é uma jornada, não um evento**: começa com um problema real (validação de controles, monitoramento), vira ferramenta/prática e só então escala (roadmap).
- **A migração à nuvem é um gatilho natural**: quando tudo muda (cloud, DevOps, CI/CD), a incerteza sobre segurança cresce — e o SCE floresce.
- **Evidência > orgulho**: o experimento que "falha" (refuta a crença) é o mais valioso.
- **Cultura e ferramenta andam juntas**: ferramenta sem cultura de aprendizado não sustenta; cultura sem experimento vira opinião.

## Anti-patterns
- Fazer SCE como **evento único** (um game day por ano) em vez de prática **contínua**.
- **Todos na resposta, ninguém no leme**: sem dono/ritmo, a prática morre.
- Adotar ferramenta sem **problema real** definido (ChaoSlingr nasceu de uma dor concreta).
- **Esconder resultados que refutam premissas** (o aprendizado real é o desconfortável).
- Esperar que ferramentas genéricas cubram segurança sem **desenhar seus experimentos**.

## Worked Example
**O experimento da porta mal configurada (UHG)**: a equipe presume que o firewall detecta e bloqueia portas mal configuradas e que o incidente fica logado. O experimento (ChaoSlingr: Generatr escolhe o alvo → Slingr injeta a misconfiguração → Trackr registra) roda repetidamente. **Evidência**: 50% das vezes o firewall **não** bloqueia; uma ferramenta de config sempre bloqueia, mas sem log identificável. Consequências: (a) a premissa sobre o firewall cai; (b) descobre-se que a ferramenta certa é a de config (não o firewall) e que **logging** precisa melhorar; (c) o time ganha um método para não "adivinhar" a postura. Isso vira melhoria concreta de instrumentação e nova rodada de experimentos.

## Key Takeaways
1. Adoção de SCE parte de uma **dor real** (validar controles, monitoramento, migração à nuvem) e evolui para prática **contínua**.
2. **ChaoSlingr** mostra o padrão: gerar alvo → injetar falha → registrar (Generatr/Slingr/Trackr), e o valor de **provar premissas** (ex.: firewall que falha 50%).
3. Categorize experimentos (Verizon): **reliability, cost, performance, risk**; **"assert your hypothesis"**.
4. Cardinal Health usa **CVV (4 passos)**; Accenture tem **roadmap enterprise**; Capital One reforça **"seguro hoje ≠ seguro amanhã"**.
5. Resultado final: **redução de guesswork** e **driving value** mensurável — e uma comunidade open source crescendo.

## Connects To
- **Ch 8**: todos os case studies executam o processo do cap. 8 (hipóteses, EMPAK, game days).
- **Ch 2**: a E&E Assessment (Tier 2) é o que esses times institucionalizaram.
- **Ch 5**: monitoramento/observabilidade aparece como dor em todos (OpenDoor, UHG).
- **Conceitos**: Netflix Chaos Monkey, Principles of Chaos, SRE, DORA.
