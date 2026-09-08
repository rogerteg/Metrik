# Capítulo 9 — Multilevel Security (MLS)

**Livro**: Security Engineering (Anderson) · `chapters/ch09-multilevel-security.md`

## Core Idea
Multilevel Security (MLS) trata de **políticas obrigatórias** em que dados de classificações diferentes (e pessoas com autorizações diferentes) convivem no mesmo sistema sem vazamento. Nasce do mundo militar (relatório Anderson, Bell-LaPadula) e evolui para **MAC/IFC** em SOs modernos. Anderson mostra o que funcionou, o que sempre quebra (canais encobertos, composabilidade) e por que o MLS clássico fracassou como produto geral, mas suas ideias sobreviveram.

## Frameworks Introduced
- **Security Policy Model**: o que é um modelo formal de política (estados, regras, prova de que a política vale).
- **Bell-LaPadula (BLP)**: o modelo canônico de MLS para **confidencialidade**.
- **Biba**: modelo dual para **integridade**.
- Evolução: MLS → **MAC** → **IFC (Information Flow Control)**.
- **Anderson Report** (1972): origem das ideias de referência-monitor e MLS.

## Key Concepts
- **Política MLS**: rótulos de classificação (ex.: Não-classificado < Confidencial < Secreto) e autorizações (clearance); objetos têm classificação, sujeitos têm clearance.
- **Bell-LaPadula**:
  - **No read up** (simple security property): sujeito só lê objetos com classificação ≤ seu clearance.
  - **No write down** (*-property / star property): sujeito só escreve em objetos com classificação ≥ seu nível (evita baixar dado secreto).
- **Críticas clássicas ao BLP**: não trata integridade, canais encobertos, "write up" cria problemas práticos (quem pode ler o que o secreto escreveu?).
- **Biba**: espelho para integridade — *no read down* (não ler dado não confiável de baixa integridade), *no write up*.
- **Sistemas históricos**: **SCOMP** (primeiros produtos MLS) e **data diodes** (one-way gateways — só saem dados de rede classificada).
- **MAC→IFC moderno**:
  - **Windows** (integrity levels, UAC, AppContainer);
  - **SELinux** (rótulos, políticas de tipo — base do Android);
  - **Embedded/loT** (isolamento).
- **O que dá errado**:
  - **Composability**: dois sistemas MLS seguros, quando conectados, deixam de ser.
  - **Cascade problem**: encadeamento de sistemas com níveis diferentes cria caminhos de downgrade.
  - **Covert channels**: vazamento por canais laterais de *timing/storage* que a política de rótulos não controla.
  - **Ameaça de malware**: se o malware roda no nível alto, pode ler tudo do nível alto.
  - **Polyinstantiation**: quando um dado aparece com classificações diferentes → inconsistências e enganos.
  - **Problemas práticos**: usabilidade, custo, e o "insider autorizado" que pode vazar de qualquer forma.

## Mental Models
- **Política de fluxo de informação, não só de acesso**: a pergunta é *para onde a informação pode fluir*, não apenas quem toca o quê.
- **O rótulo segue o dado**: informação é contaminada pelo nível em que é criada/lida.
- **Composição quebra garantias**: juntar sistemas seguros não produz sistema seguro.
- **Canais encobertos tornam qualquer "prova" incompleta** se o adversário pode medir tempo/recursos.
- **Integridade e confidencialidade são duais** (Biba ↔ BLP): escolha conforme o ativo (dados de alta integridade vs. alta confidencialidade).

## Anti-patterns
- Tratar MLS como "rótulos que resolvem tudo" sem lidar com **canais encobertos** e **composição**.
- **Polyinstantiation** sem estratégia clara de reconciliação.
- Conectar domínios de segurança sem **data diode** ou revisão de downgrade.
- Ignorar o **malware no nível alto** (o nível mais privilegiado é o mais apetitoso).
- Copiar o modelo militar para o comercial sem adaptar (BLP não protege integridade/contabilidade).

## Worked Example
**SELinux/Android como MLS prático**: apps Android rodam com UIDs e domínios SELinux; o sistema impõe que um app não leia dados de outro (MAC) mesmo que ambos sejam do mesmo usuário. Quando o usuário dá permissão de contatos, o *sistema* (não o app) controla o fluxo. O atacante tenta escalar via kernel (quebrar o enforcement) ou via canais encobertos (timing). A lição do BLP — *o rótulo e o enforcement estão no núcleo, não no app* — é o que torna o modelo útil.

## Key Takeaways
1. MLS/BLP controla **fluxo de confidencialidade** (no read up / no write down); Biba é o dual de integridade.
2. **Composição, cascata e canais encobertos** são as falhas estruturais clássicas.
3. As ideias sobrevivem como **MAC/IFC** em SOs modernos (SELinux, Windows integrity, Android).
4. **Quem roda no nível mais alto** é o maior risco — proteja o núcleo.

## Connects To
- Cap. 6 (controle de acesso) — DAC vs. MAC.
- Cap. 10 (boundaries) — onde MLS encontra compartimentação e aplicações.
- Cap. 19 (side channels) — canais encobertos na prática.
