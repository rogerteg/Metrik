# Capítulo 20 — Advanced Cryptographic Engineering

**Livro**: Security Engineering (Anderson) · `chapters/ch20-advanced-cryptographic-engineering.md`

## Core Idea
Criptografia *aplicada* em sistemas reais — **Signal, Tor, full-disk encryption, HSMs, enclaves, blockchain** — é onde a teoria encontra a prática e onde "crypto dreams" morrem. Anderson mostra que os sistemas criptográficos que usamos diariamente são moldados tanto por **protocolo e gestão de chaves** quanto por **incentivos**, e que mesmo designs "provados" falham quando atacados no nível de *implementação, compatibilidade e ecossistema*.

## Frameworks Introduced
- Estudo de caso de sistemas cripto reais: **Signal** (mensageria E2E), **Tor** (anonimato), **HSMs** em produção, **enclaves** (SGX), **blockchain/criptomoedas**.
- Análise de **full-disk encryption**.
- Padrões de **falha de sistemas cripto** (ataques de protocolo, compatibilidade, memória-tempo).

## Key Concepts
- **Full-disk encryption (FDE)**: protege dados em repouso (disco roubado). Limitações: não protege dados em uso, e a segurança depende da chave na RAM/do atacante com acesso ao sistema ligado.
- **Signal**: protocolo de mensageria com **end-to-end encryption + forward secrecy** (chaves efêmeras por sessão, Double Ratchet). Por que é referência: metadata ainda visível, mas conteúdo inacessível ao provedor.
- **Tor**: anonimato por **circuitos de relays** (onion routing). Ameaças: observação global, correlação de tráfego, nós de saída maliciosos, deanonymização por análise de timing/volume. Anonimato é frágil contra adversários com visão de rede.
- **HSMs em produção** e seus ataques reais:
  - **xor-to-null-key attack**: induzir o HSM a usar uma chave que o atacante conhece (ex.: chave derivada de XOR de valores controlados).
  - **Ataques por retrocompatibilidade e trade-offs tempo-memória**: modos fracos legados rebaixam a segurança.
  - **Ataques diferenciais de protocolo** e o **EMV attack** (forçar o HSM a assinar o que não devia).
  - **Hacking HSMs de CAs e nuvens**: comprometer o *software* que usa o HSM (não o chip) — voltando ao trusted interface problem.
  - **Gerenciando risco de HSM**: segmentar chaves, limitar o que a API permite, dual control, monitorar.
- **Enclaves (SGX/TrustZone)**: executar código com isolamento do SO. Ameaças: side channels de microarquitetura (Meltdown/Spectre — cap. 19), ataques de cache, e a confiança na infraestrutura de atestação.
- **Blockchain/criptomoedas**:
  - **Wallets**: gestão de chaves privadas — o elo mais fraco (chaves perdidas/roubadas).
  - **Miners/consenso**: ataques de maioria, reorgs, gasto duplo.
  - **Smart contracts**: bugs = perda irreversível (por design, sem rollback).
  - **Mecanismos off-chain** (canais de pagamento) e seus riscos.
  - **Exchanges, cryptocrime e regulação**: exchanges são alvos (hacks), lavagem, e a tensão com regulação.
  - **Permissioned blockchains**: quando o consenso é controlado, o valor do "descentralizado" muda.
- **Crypto dreams que falharam**: sistemas que prometeram resolver tudo (ex.: DRM com cripto forte, anonimato perfeito) e colapsaram por economia/ecossistema — não por matemática.

## Mental Models
- **"A criptografia resolve confidencialidade, não o sistema"**: metadata, gestão de chaves, ecossistema e humanos continuam sendo o problema.
- **Forward secrecy > confidencialidade de longo prazo** quando o adversário pode gravar tráfego hoje e quebrar chaves depois.
- **Anonimato é posicional e frágil**: depende de quem observa a rede; Tor protege contra muitos, não contra um adversário global.
- **O HSM mais forte falha se o software que o usa for tolo**: ataque à API/ecossistema, não ao chip.
- **Blockchain troca confiança em instituições por confiança em código+incentivos** — mas o código tem bugs e as chaves têm donos humanos.
- **Todo "sonho cripto" esbarra no elo mais fraco** (chave, usabilidade, incentivo) — cripto não remove o problema, só o move.

## Anti-patterns
- Confiar cegamente em **"está criptografado"** sem considerar metadata e gestão de chaves.
- FDE como única defesa (ignora dados em uso e atacante com o sistema ligado).
- Contratos inteligentes com **lógica crítica sem auditoria/limites** (bugs irreversíveis).
- **Chaves privadas em software** de wallets sem backup/segurança.
- Assumir que HSM/enclave resolve, ignorando **API e side channels**.

## Worked Example
**Comprometimento de um HSM de CA**: o atacante não fura o chip — explora o *software* de assinatura de certificados (API do HSM) para assinar um certificado fraudulento, ou usa um ataque de retrocompatibilidade para forçar um modo fraco. A defesa real: **segmentação** (HSMs separados por finalidade), **limitação da API** (o que pode ser assinado), dual control, auditoria contínua, e **Certificate Transparency** (cap. 21) para detectar certificados fraudulentos emitidos. Lição: proteja o ecossistema ao redor do componente cripto.

## Key Takeaways
1. Sistemas cripto reais (Signal, Tor, FDE, HSMs, blockchain) são **projetos de engenharia + economia**, não só matemática.
2. **Forward secrecy** e **gestão de chaves** decidem a segurança prática.
3. HSMs/enclaves falham pela **interface e pelo ecossistema**, não pelo chip.
4. Blockchain: **bugs e chaves** são os riscos dominantes; cripto não remove a confiança, realoca-a.

## Connects To
- Cap. 4/5 (protocolos e cripto) — base.
- Cap. 18/19 (tamper/side channels) — ataques a hardware cripto.
- Cap. 24 (DRM) — "crypto dreams" que falharam.
