# Capítulo 12 — Banking and Bookkeeping

**Livro**: Security Engineering (Anderson) · `chapters/ch12-banking-and-bookkeeping.md`

## Core Idea
O sistema financeiro é o **maior sistema de segurança do mundo** e o mais atacado. Anderson usa bancos como laboratório de engenharia de segurança: contabilidade (integridade), pagamentos interbancários (SWIFT), caixas eletrônicos, cartões (EMV), banco online e pagamentos móveis. Cada camada revela como **incentivos, protocolos e fraude real** interagem — e onde a segurança falha quando a responsabilidade está mal alocada.

## Frameworks Introduced
- **Double-entry bookkeeping** como raiz da integridade contábil.
- **Modelo Clark-Wilson** de integridade comercial (CDIs, TPs, separação de deveres).
- Arquiteturas de sistemas de pagamento: ATM, cartões (EMV), SWIFT, online banking, M-Pesa.
- O **princípio da responsabilidade (liability)** como controle.

## Key Concepts
- **Bookkeeping**:
  - **Double-entry**: cada transação afeta ≥2 contas → erros/fraudes deixam rastro; a soma é verificável.
  - **Clark-Wilson**: *Constrained Data Items* (CDIs — integridade preservada), *Transformation Procedures* (TPs — únicas formas de mudar CDIs), *Unconstrained Data Items* (UDIs — entrada), *Integrity Verification Procedures* (IVPs), e **separation of duty** (nobody sozinho completa transação sensível).
  - **Design de controles internos e o que dá errado**: fraudes de executivos (o CEO que contorna controles), fraudes contábeis (Enron-style), encontrar os pontos fracos.
- **Interbancário**: história do e-commerce (protocolos de pagamento antigos e suas falhas), **SWIFT** como a espinha dorsal; o que dá errado (ex.: ataques ao SWIFT de bancos centrais — Bangladesh).
- **ATM**: autenticação por cartão+PIN; o que dá errado (skimming, PIN harvesting, fraude interna); **incentivos e injustiças** (quem arca com a fraude).
- **Cartões de crédito**: fraude presencial vs. online; **fraud engines** (detecção estatística de anomalias em tempo real).
- **EMV (chip)**: cartão com chip criptográfico; **preplay attack** (capturar transação e reusar antes do uso legítimo — ataque real ao EMV); **contactless** (conveniência vs. fraude).
- **Online banking**: phishing; **CAP** (chip authentication program — que foi quebrado por MITM); **banking malware** (cavalos de troia que manipulam a sessão); telefone como segundo fator; **liability**; **Authorised Push Payment (APP) fraud** (fraude em que o *próprio usuário* autoriza a transferência enganado).
- **Nonbank payments**: **M-Pesa** (dinheiro móvel no Quênia — sucesso com modelo de agentes), outros pagamentos por telefone, **Sofort/open banking** (terceiros acessando contas).

## Mental Models
- **Bancos não protegem "dinheiro", protegem *registros* (ledgers)** — a contabilidade é o objeto de segurança; fraude = manipular o ledger.
- **Separation of duty** é a defesa contra o insider (fraude exige conluio).
- **O atacante segue o caminho de menor resistência no *fluxo de autorização***: phishing → usuário autoriza; malware → sessão manipulada; insider → contorna processo.
- **Liability move o comportamento**: quando o banco arcava com fraude online, havia menos autenticação forte; quando a responsabilidade mudou, os controles apareceram.
- **A fraude em escala é um problema estatístico**: detecção por anomalias (fraud engines) + resposta, não só prevenção perfeita.
- **"O adversário pode ser o dono da loja, o funcionário ou o próprio cliente"** (fraude de primeira parte).

## Anti-patterns
- Autenticação que o atacante pode **relay/replay** (CAP foi derrotada por MITM/preplay).
- Responsabilizar **sempre o consumidor** por fraude que o sistema permitiu (risk dumping).
- Confiar num **único fator** compartilhado pelo mesmo canal (SMS OTP no mesmo aparelho comprometido por malware).
- Sem **fraud engine/limites** para fraude em massa.
- Sem trilha de auditoria dupla entrada / sem separação de deveres (convida fraude interna).

## Worked Example
**Ataque combinado a banco online**: o malware no PC do usuário espera o login; quando o usuário digita o valor da transferência, o malware *altera* o destinatário e o valor na tela (o usuário "vê" o que digitou, mas o banco recebe outro). O SMS OTP também é capturado porque o malware o intercepta ou porque o push vai ao mesmo aparelho. Defesas que funcionaram: transações com **segundo canal independente** (confirmar valor/destinatário num dispositivo separado e confiável), **detecção de anomalias** (destinatário novo, valor atípico), limites de valor, e **liability** clara com reembolso para APP fraud quando o banco não protegeu.

## Key Takeaways
1. **Integridade do ledger + separação de deveres + auditoria** são a base (Clark-Wilson/double-entry).
2. Conheça os ataques reais: **preplay**, phishing, malware de sessão, fraude APP.
3. **Fraud engines/limites** são indispensáveis para fraude em escala.
4. **Aloque a responsabilidade** em quem pode implementar a defesa — incentivo é controle.

## Connects To
- Cap. 4 (protocolos) — EMV/CAP e ataques de protocolo.
- Cap. 8 (economia) — liability, incentivos, ecossistema criminal.
- Cap. 3 (phishing/psicologia) — a porta de entrada do usuário.
