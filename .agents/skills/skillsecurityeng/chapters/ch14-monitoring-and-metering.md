# Capítulo 14 — Monitoring and Metering

**Livro**: Security Engineering (Anderson) · `chapters/ch14-monitoring-and-metering.md`

## Core Idea
Sistemas de **medição e monitoramento** (medidores de energia, taxímetros, tacógrafos, etiquetas de tornozeleira, franqueadoras) precisam ser seguros *contra o próprio cliente* que tem incentivo a fraudar. Anderson usa esses "medidores" como exemplos perfeitos de **sistemas cujo adversário principal é o usuário legítimo tentando pagar menos** — uma inversão do modelo usual que ensina muito sobre incentivos e detecção.

## Frameworks Introduced
- **Threat model invertido**: proteger contra o *cliente/usuário*, não contra o externo.
- Arquitetura medidor central (token/prepay) vs. pós-pago.
- Lições de **fraude de medição** aplicáveis a qualquer sistema de cobrança/uso.
- A evolução para **smart meters / smart grids** e medidores digitais conectados.

## Key Concepts
- **Medidores pré-pagos (Prepayment Meters)**:
  - *Utility metering* (energia, água, gás): como o sistema funciona (token, cartão, crédito).
  - **O que dá errado**: engenharia reversa do token, clonagem de cartões de crédito, compartilhamento de crédito, adulteração do medidor (ímã, corte de fio).
- **Smart meters e smart grids**: medidores conectados que reportam consumo em tempo real — conveniência (tarifas dinâmicas) mas nova superfície de ataque (privacidade do consumo, hacking remoto, segurança da rede elétrica).
- **Ticketing fraud**: fraudes em bilhetagem (transporte) — sistemas de valor armazenado.
- **Taxímetros, tacógrafos e velocidade de caminhões**:
  - **Tacógrafo** (registrador de velocidade/tempo de motoristas) — fraude clássica de adulteração para esconder horas de direção.
  - **O que dá errado**: calibrar errado, ímãs, adulteração mecânica.
  - **Tacógrafos digitais** e *smart tachographs* (4ª geração): a guerra entre regulador (detectar) e motorista (fraudar); **sensor defeats**.
- **Curfew tags (GPS como policial)**: tornozeleiras eletrônicas que monitoram localização — privacidade, spoofing de GPS, e a confiabilidade da vigilância remota.
- **Postage meters (franqueadoras)**: máquinas de franquear correspondência e suas fraudes históricas (impressão falsa de valor).

## Mental Models
- **Quando o adversário é o cliente, o controle precisa estar no *ponto de venda/uso*** (o medidor), não na borda.
- **"Custo de fraude < benefício da fraude"** = fraude garantida: aumente o risco/custo e reduza o benefício.
- **Medidor é um computador adversário-hostil no campo**: sem controle físico/criptográfico, será adulterado.
- **Smart = mais dados = mais privacidade em risco e mais superfície de ataque** (não apenas mais conveniência).
- **Detecção estatística** (padrões anômalos de consumo/uso) complementa a prevenção.

## Anti-patterns
- Confiar que o medidor "no campo" não será adulterado (sem tamper-evidence/resistance).
- Tokens/chaves de valor armazenado **sem cripto e sem rotação** (viram alvo de engenharia reversa).
- Smart meters com **segurança fraca de rede** (toda a rede elétrica vira vetor).
- Ignorar a **privacidade dos dados de consumo** (perfil de vida revelado pelo uso de energia).
- Vigilância (tornozeleira/GPS) sem lidar com **spoofing** e falsos positivos que punem inocentes.

## Worked Example
**Smart meter de energia**: o medidor reporta consumo à concessionária. Ameaças: (a) o cliente quer pagar menos → adulterar leitura ou atacar o token; (b) um terceiro quer *espionar* o consumo (saber quando a casa está vazia); (c) atacante remoto quer derrubar/controlar medidores em massa (risco à rede). Defesas: medidor com **firmware assinado e atualizável**, **comunicação criptografada e autenticada**, **tamper-evidence**, **anonimização/agregação** dos dados de consumo, e separação da rede de medição dos sistemas críticos.

## Key Takeaways
1. Quando o **cliente é o adversário**, proteja o ponto de uso e os incentivos.
2. Medidores conectados ("smart") ampliam **privacidade** e **superfície de ataque**.
3. **Fraude segue o incentivo**: reduza o benefício e aumente o risco do fraudador.
4. Detecção estatística + tamper-evidence + cripto no dispositivo são o pacote.

## Connects To
- Cap. 13 (locks/alarms) — tamper-evidence físico.
- Cap. 8 (economia) — incentivos do fraudador.
- Cap. 12 (pagamentos) — tokens de valor armazenado e fraude.
