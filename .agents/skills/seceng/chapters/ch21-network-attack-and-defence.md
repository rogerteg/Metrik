# Capítulo 21 — Network Attack and Defence

**Livro**: Security Engineering (Anderson) · `chapters/ch21-network-attack-and-defence.md`

## Core Idea
A internet foi projetada para **confiabilidade e abertura, não para segurança**. Anderson mapeia o ataque e a defesa de rede: DoS (BGP, DNS, SYN floods), o ecossistema de **malware**, e as defesas (firewalls, IDS, PKI/CAs, Certificate Transparency). A lição central: a fronteira da rede é **"ragged" (recortada)** — cripto e filtragem se misturam, e a topologia decide o que é defensável.

## Frameworks Introduced
- Ataques de **negação de serviço** sobre protocolos de infraestrutura (BGP, DNS, TCP/UDP).
- **Taxonomia de malware** (trojans, worms, botnets) e sua evolução.
- **Defesa em camadas de rede**: filtragem/firewall, detecção de intrusão, cripto de borda (SSH, wireless).
- **PKI e CAs**, e **Certificate Transparency** como correção estrutural.
- Papel da **topologia** na segurança.

## Key Concepts
- **Denial of service na infraestrutura**:
  - **BGP**: roteamento baseado em confiança entre ASes; **sequestro de prefixo** e vazamentos derrubam/desviam tráfego (defesa: RPKI/BGPsec, monitoramento).
  - **DNS**: **cache poisoning** e **amplificação** (open resolvers); DNSSEC como defesa parcial.
  - **UDP/TCP, SYN floods e reflection**: pequenos pedidos com spoofed source geram respostas grandes contra a vítima (amplificação). 
  - **Outros amplificadores** (NTP, memcached, etc.) e formas de DoS (aplicação, estado).
  - **E-mail — de spooks a spammers**: abuso histórico de e-mail (spam, phishing) e as contramedidas (filtros, autenticação de remetente).
- **Malware**:
  - História (dos primeiros vírus ao **Internet worm** de 1988 — Morris), evolução: worms auto-propagantes, trojans, ransomware, **botnets**.
  - **Como o malware funciona**: exploração, injeção, persistência, C2 (comando e controle), movimento lateral, exfiltração.
  - **Contramedidas**: AV, EDR, sandboxing, patching, segmentação, hardening.
- **Defesa**:
  - **Filtragem**: firewalls, "censorware", e a linha tênue com interceptação legal (wiretaps).
  - **Intrusion Detection (IDS/IPS)**: detectar por assinatura/anomalia; limites (falsos positivos, evasão, cripto).
- **Cripto na fronteira recortada**: **SSH** (acesso remoto seguro), **wireless** na periferia (WPA2/3) — a cripto "rasga" a fronteira clássica (o tráfego cifrado não pode ser inspecionado).
- **CAs e PKI**: a web confia em CAs; uma CA comprometida pode emitir certificados para qualquer domínio → **Certificate Transparency** (logs públicos auditáveis de certificados emitidos) detecta emissões fraudulentas.
- **Topologia**: onde você coloca seus ativos e filtros define a superfície de ataque; arquiteturas defensáveis (DMZ, segmentação, zero trust).

## Mental Models
- **A internet é hostil por padrão**: nada na rede interna deve ser tratado como confiável sem autenticação.
- **DoS é um problema econômico e de arquitetura**: capacidade + filtragem + redundância; nenhum filtro resolve amplificação sozinho.
- **Malware segue a cadeia de infecção**: entrada (phishing/exploit) → execução → persistência → C2 → dano; interrompa qualquer elo.
- **Cripto move a fronteira**: com E2E/SSH/TLS, o perímetro deixa de ser a rede e passa a ser o **endpoint**.
- **Confiança na PKI é concentrada**: muitos certificados, poucas CAs — por isso transparência (CT) e pinning/monitoramento.
- **A defesa boa é a que sobrevive à topologia real**: conheça seu grafo de tráfego e seus pontos de estrangulamento.

## Anti-patterns
- **Perímetro único** ("firewall resolve") sem segmentação interna (movimento lateral).
- Ignorar **BGP/DNS** (infraestrutura que você não controla mas depende).
- Confiar em **IDS** como prevenção (é detecção; e cripto o cega).
- Sem **patching rápido** (a maioria dos breaches explora vulnerabilidades conhecidas).
- **Wireless/serviços de borda** sem cripto e autenticação fortes.

## Worked Example
**Ransomware corporativo**: entra por phishing (um usuário executa anexo), estabelece C2, e se espalha lateralmente pela rede interna até cifrar backups e sistemas. Defesas que quebram a cadeia: (a) filtro de e-mail + treino; (b) **segmentação** (o workstation não alcança o servidor de backups); (c) EDR com detecção de comportamento; (d) **backups offline/imutáveis**; (e) patching rápido de RDP e expostos; (f) plano de resposta. Cada camada eleva o custo do atacante (cap. 8).

## Key Takeaways
1. Proteja **infraestrutura que você não controla** (BGP/DNS) com monitoramento e boas práticas.
2. Malware é uma **cadeia** — interrompa entrada, persistência, C2 e movimento lateral.
3. **Segmentação + patching + backups** valem mais que firewalls sofisticados.
4. **Certificate Transparency** é a correção real para a fragilidade das CAs; cripto move a fronteira para os endpoints.

## Connects To
- Cap. 7 (distributed systems) — DoS, nomes, topologia.
- Cap. 20 (HSMs/CAs) — PKI e CT.
- Cap. 27 (secure development) — a rede como parte do ciclo de vida.
