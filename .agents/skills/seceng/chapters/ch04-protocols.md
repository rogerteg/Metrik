# Capítulo 4 — Protocols

**Livro**: Security Engineering (Anderson) · `chapters/ch04-protocols.md`

## Core Idea
Um **protocolo de segurança** é uma sequência de mensagens entre partes que, juntas, estabelecem confiança (autenticação, chaves, autorização). A história está repleta de protocolos que pareciam corretos e foram quebrados por **ataques de ordem, reuso, reflexão e interposição (MIG-in-the-middle)**. Projetar protocolo é um campo onde "óbvio" costuma estar errado.

## Frameworks Introduced
- Taxonomia dos **ataques a protocolos**: eavesdropping, MIG-in-the-middle, reflection, manipulação de mensagem, mudança de ambiente, chosen-protocol attacks.
- Protocolos clássicos de **gerenciamento de chaves**: Needham-Schroeder, Kerberos, e o modelo de posse **resurrecting duckling**.
- Noções de **design assurance** para protocolos (por que formalismo e análise ajudam).

## Key Concepts
- **Riscos de eavesdropping de senha**: reutilizar segredo em rede observável.
- **"Who goes there?" — autenticação simples**: provar identidade sem revelar o segredo.
  - **Challenge-response**: provar conhecimento sem enviar o segredo (imune a replay direto).
  - **Two-factor authentication (2FA)**: algo que você sabe + algo que você tem.
  - **MIG-in-the-middle (MITM)**: o atacante se interpõe e repassa mensagens entre duas partes que acham que falam entre si — *sem* quebrar cripto.
  - **Reflection attacks**: devolver o desafio ao desafiante para obter uma assinatura útil.
- **Manipulating the message**: reordenar, repetir, dividir, atrasar mensagens (ataques de ordem e replay).
- **Changing the environment**: executar o mesmo protocolo em contexto diferente (ex.: usar uma resposta de um sistema como desafio em outro).
- **Chosen protocol attacks**: quando o atacante consegue escolher com qual protocolo você fala (cross-protocol).
- **Gerenciamento de chaves**:
  - **Resurrecting duckling**: dispositivo recém-fabricado "adota" o primeiro dono que o emparelhar — modelo para IoT/periféricos.
  - **Remote key management** e os problemas de atualizar chaves à distância.
  - **Needham-Schroeder**: protocolo de distribuição de chave com servidor confiável (sofreu ataques clássicos de replay).
  - **Kerberos**: Needham-Schroeder adaptado com tickets e timestamps — padrão em redes corporativas.
  - **Practical key management**: ciclo de vida completo (geração, distribuição, uso, rotação, destruição) e onde as coisas dão errado.

## Mental Models
- **Cada mensagem carrega significado de "quem, quando, o quê, em qual ordem"** — atacante tenta confundir esses quatro.
- **Dois problemas distintos**: *criptografia* (proteger mensagens) vs. *protocolo* (orquestrar o que as mensagens significam). Quebrar o segundo não exige quebrar o primeiro.
- **Pense no pior alinhamento de mundos**: o adversário pode ser uma das partes, ou um servidor, ou um observador.
- **A chave não é o segredo; é o gerenciamento dela** (quem pode pedir, quando, e o que pode fazer).

## Anti-patterns
- Autenticação só de um lado (permite MITM).
- Desafios previsíveis ou reutilizáveis (permite replay/reflection).
- Protocolo sem **autenticação mútua e sem nonces**.
- Usar o **mesmo segredo/chave** em múltiplos papéis e protocolos (cross-protocol).
- Gerenciamento de chaves manual/improvisado (a causa mais comum de falha real).

## Worked Example
**Wi-Fi WEP (lição clássica)**: usava RC4 com IV pequeno e reuso de chave — a criptografia em si não era o único problema; o protocolo reutilizava estado, permitindo recuperação da chave após tráfego suficiente. A correção (WPA2/3) mudou o protocolo e o gerenciamento de chaves (handshake com nonces e derivação por sessão). Lição: **não basta cifrar** — o handshake, a derivação de chave e a não-reutilização são o que torna o sistema seguro.

## Key Takeaways
1. Projete protocolos com **autenticação mútua, nonces e anti-replay**.
2. Conheça os ataques clássicos (MITM, reflection, ordem, ambiente, cross-protocol) antes de "inventar".
3. Use **protocolos testados** (TLS, Kerberos/SSO maduros); não crie o seu.
4. **Gerenciamento de chaves** é onde protocolos morrem na prática.

## Connects To
- Cap. 5 (criptografia) — as primitivas que os protocolos usam.
- Cap. 20 (engenharia cripto avançada) — Signal, TLS, protocolos de mensageria.
- Cap. 12 (EMV, CAP) — ataques reais a protocolos de pagamento.
