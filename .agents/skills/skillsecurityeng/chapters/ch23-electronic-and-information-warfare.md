# Capítulo 23 — Electronic and Information Warfare

**Livro**: Security Engineering (Anderson) · `chapters/ch23-electronic-and-information-warfare.md`

## Core Idea
O campo de batalha moderno é eletromagnético e informacional. Anderson cobre a **guerra eletrônica** (sinais, radar, jammer, IFF) e a **guerra de informação** (ataques a sistemas de controle, infraestrutura, eleições), mostrando que as mesmas técnicas de segurança de sistemas civis aparecem — com requisitos extremos e adversários estatais — e que as **fronteiras entre civil e militar** estão cada vez mais borradas.

## Frameworks Introduced
- Fundamentos de **EW (Electronic Warfare)**: interceptar, enganar, negar o espectro.
- **Signals intelligence (SIGINT)** e contramedidas (proteção de comunicações).
- Radar: tipos, **jamming** e contramedidas.
- **IFF (Identification Friend or Foe)** — autenticação no campo de batalha.
- **Guerra de informação**: ataques cibernéticos a infraestrutura crítica e processos políticos.

## Key Concepts
- **Básicos de EW**: o espectro é um domínio disputado — quem controla sinais controla o campo.
- **Sistemas de comunicação**:
  - **Técnicas de SIGINT**: interceptação, direction finding, análise de tráfego.
  - **Ataques às comunicações**: jamming (negar), spoofing (enganar), interceptação (ouvir).
  - **Proteção**: spread spectrum, frequência hopping, cripto, emissão controlada (LPI/LPD).
  - **Interação civil-militar**: infraestrutura civil (satélites, cabos, celular) é usada e atacada na guerra.
- **Vigilância e aquisição de alvos**:
  - **Tipos de radar** e suas assinaturas.
  - **Técnicas de jamming** (ruído, decepção) e **contramedidas** (radares avançados: LPI, AESA, processamento de sinais, ECCM).
  - **Sensores múltiplos** e fusão (radar+IR+EO) para reduzir engano.
- **IFF**: o "desafio-resposta" do campo de batalha para distinguir amigo de inimigo; **modos criptografados** para evitar spoofing; falhas trágicas quando IFF falha (fogo amigo).
- **IEDs (improvised explosive devices)**: a guerra assimétrica — adversário barato (bomba artesanal) vs. defesa cara (blindagem, jamming de rádio de detonação); lição de custo assimétrico.
- **Directed energy weapons**: lasers/EMP — novas formas de negar eletrônicos.
- **Guerra de informação (cyber)**:
  - **Ataques a sistemas de controle** (ICS/SCADA — ex.: Stuxnet): infraestrutura física como alvo cibernético.
  - **Ataques a outras infraestruturas** (energia, finanças, transporte).
  - **Ataques a eleições e estabilidade política**: desinformação, intrusão em campanhas/sistemas de votação, influência.
  - **Doutrina**: como estados pensam a guerra cibernética (dissuasão, atribuição, resposta).

## Mental Models
- **EW é "segurança do espectro"**: interceptar/enganar/negar são os equivalentes físicos de violar confidencialidade/integridade/disponibilidade.
- **A guerra moderna é assimétrica em custo**: um IED barato força gasto enorme em defesa; jammers baratos ameaçam drones caros.
- **Civil e militar convergem**: a mesma internet/SCADA/satélite é infraestrutura dupla — vulnerabilidade civil vira alvo militar.
- **Atribuição é o problema central da guerra cibernética**: sem atribuição confiável, não há dissuasão.
- **O ciberataque mais devastador visa *física* através do *lógico*** (Stuxnet: código destrói centrífugas).

## Anti-patterns
- Tratar **sistemas de controle/SCADA** como isolados ("air gap") quando há pontes reais (manutenção, rede corporativa).
- Confiar em **obscuridade** de radar/IFF/sinais em vez de cripto e processamento robusto.
- Subestimar **desinformação/operações de influência** como "só marketing".
- Sem **planos de resposta e redundância** para infraestrutura crítica sob ataque cibernético.
- Ignorar a **cadeia de suprimentos e o insider** em sistemas militares.

## Worked Example
**Stuxnet como guerra de informação**: malware sofisticado (atribuído a um estado) atravessou o "air gap" via USB, explorou múltiplas vulnerabilidades zero-day e atacou o **controle industrial** de centrífugas, destruindo fisicamente equipamentos enquanto mostrava leituras normais aos operadores. Lições: (a) air gap não é isolamento; (b) ataques cibernéticos podem ter **efeito físico**; (c) a defesa de infraestrutura crítica exige segmentação real, monitoramento de ICS e resposta a incidentes dedicada.

## Key Takeaways
1. EW e guerra de informação são **segurança sob requisitos extremos** — mas os princípios são os mesmos.
2. **SCADA/ICS** é o elo onde o ciber atinge o físico — proteja como tal.
3. **Atribuição e dissuasão** são os problemas centrais da guerra cibernética.
4. A **fronteira civil-militar** sumiu: proteja infraestrutura dupla.

## Connects To
- Cap. 15 (comando e controle nuclear) — interação com cyberwar.
- Cap. 21 (ataque/defesa de rede) — as ferramentas da guerra de informação.
- Cap. 26 (vigilância/estado) — o papel dos serviços de inteligência.
