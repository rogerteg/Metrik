# Capítulo 25 — Taking Stock

**Livro**: Security Engineering (Anderson) · `chapters/ch25-taking-stock.md`

## Core Idea
"Taking Stock" aplica as lentes do livro a **tecnologias emergentes**: veículos autônomos e drones, IA/ML, ferramentas de privacidade (PETS) e **votação eletrônica**. Anderson mostra como aplicar o framework (modelo de ameaça, adversário, incentivos) a domínios novos — e como o excesso de confiança na automação e na IA cria novas vulnerabilidades.

## Frameworks Introduced
- Análise de segurança de **veículos autônomos/remotamente pilotados** (drones, self-driving cars, níveis de automação).
- **Segurança de ML** (ataques a modelos, dados e à sociedade).
- **PETS (Privacy-Enhancing Technologies)** e segurança operacional para usuários de risco.
- **Votação eletrônica** e o problema da **software independence**.

## Key Concepts
- **Drones**: segurança de UAVs (controle, GPS spoofing, jamming, interceptação de vídeo, hacking do piloto automático).
- **Self-driving cars**:
  - **Níveis e limites da automação** (de assistência a totalmente autônomo): o risco mora na **transição humano-máquina** e nas falhas de percepção.
  - **Como hackear um carro autônomo**: ataque aos sensores (enganar câmeras/LIDAR — ex.: adesivos, lasers), à rede do veículo (CAN bus), ao software OTA, e ao ecossistema (app, backend, infraestrutura).
- **IA/ML**:
  - **ML e segurança**: ML como ferramenta defensiva e ofensiva.
  - **Ataques a sistemas de ML**: *adversarial examples* (perturbações imperceptíveis que mudam a classificação), *poisoning* (contaminar treino), *extraction* (roubar modelo/dados de treino), *inversion* (reconstruir dados de treino — ligação com cap. 11).
  - **ML e sociedade**: viés, desinformação (deepfakes), responsabilidade e o risco de automatizar decisões.
- **PETS e segurança operacional**:
  - **Dispositivos de mensageria anônima** e **suporte social** para populações de risco.
  - **Living off the land**: usar ferramentas comuns (e não malware exótico) para não chamar atenção — também é a tática de atacantes.
  - **"The name's Bond"**: segurança operacional pessoal para quem enfrenta adversários poderosos (jornalistas, ativistas, dissidentes).
- **Eleições / votação eletrônica**:
  - **História das máquinas de votar**; **hanging chads** (falha das urnas de cartão perfurado em 2000).
  - **Optical scan** e a lição: papel é auditável.
  - **Software independence**: o resultado não deve depender de software não verificado — deve haver registro físico independente auditável.
  - **Por que eleições eletrônicas são difíceis**: anonimato do voto + integridade do resultado + verificação pública + resistência a coerção — requisitos conflitantes.

## Mental Models
- **Automação move o erro, não o elimina**: no carro autônomo, o erro sai do motorista e vai para o *software, sensores e transição*.
- **Sensores são inputs enganáveis**: se o modelo de ameaça inclui adversário, os sensores (visão, GPS, LIDAR) são vetores de ataque.
- **ML é um sistema, não um oráculo**: atacável no treino, na inferência e na saída (viés/deepfake).
- **Papel + software independence**: a verificação de uma eleição não pode depender de software que ninguém auditou.
- **PETS protegem contra adversários específicos** — e a segurança operacional (o que você posta, como se comunica) é tão importante quanto a ferramenta.

## Anti-patterns
- Confiar em **"autopilot"** como se fosse perfeito (excesso de confiança na automação).
- Ignorar **ataques a sensores/ML** no threat model de sistemas de IA.
- **Votação 100% eletrônica sem registro físico independente** (sem software independence).
- Tratar deepfake/desinformação como problema só de "alfabetização".
- Subestimar a **cadeia de suprimentos e o backend** de drones/carros.

## Worked Example
**Votação eletrônica**: uma urna só com software proprietário, sem registro em papel auditável, falha no princípio da *software independence* — um bug ou fraude no software pode alterar o resultado sem detecção. A prática recomendada (em muitos países) é **voto em papel (optical scan) contado por máquina, com auditoria independente** (amostragem/auditoria de risco) comparando o papel com o registro eletrônico. Lição: integridade verificável > conveniência digital.

## Key Takeaways
1. Aplique **threat model + incentivos** a qualquer tecnologia nova — automação e ML incluídos.
2. Carros/drones: **sensores, rede e ecossistema** são vetores; a transição humano-máquina é o ponto frágil.
3. ML é atacável (adversarial, poisoning, extraction) e tem custos sociais (viés, deepfake).
4. **Software independence** (papel auditável) é o padrão ouro para integridade eleitoral.

## Connects To
- Cap. 1/2 (framework e adversários) — aplicados a domínios novos.
- Cap. 11 (inference) — extração/inversão de ML.
- Cap. 26 (vigilância) — PETS, deepfakes e regulação.
