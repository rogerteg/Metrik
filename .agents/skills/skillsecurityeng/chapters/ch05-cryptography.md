# Capítulo 5 — Cryptography

**Livro**: Security Engineering (Anderson) · `chapters/ch05-cryptography.md`

## Core Idea
Criptografia é a **matéria-prima** da segurança moderna — mas é apenas uma primitiva. Anderson apresenta a criptografia do ponto de vista do engenheiro: o que cada primitiva *garante*, quais modelos de segurança existem, como os algoritmos funcionam por dentro e — crucialmente — **onde as coisas dão errado** quando usadas fora do contexto certo.

## Frameworks Introduced
- **Modelos de segurança por primitiva** (a "matemática" que cada ferramenta promete):
  - *Random functions* → **hash functions**;
  - *Random generators* → **stream ciphers**;
  - *Random permutations* → **block ciphers**;
  - *Trapdoor one-way permutations* → **public-key encryption**;
  - *Digital signatures* (autenticidade/não-repúdio).
- Arquitetura de cifras: **SP-networks** (AES) vs. **Feistel ciphers**.
- **Modos de operação** e por que o modo errado destrói a segurança.
- História para intuição: Vigenère, one-time pad, Playfair, primeiras hashs — e **como foram quebrados**.

## Key Concepts
- **Cifras simétricas**: AES (padrão, SP-network); modos: **CBC**, **CTR (counter)**, **GCM** (authenticated encryption), **XTS** (disco), **MAC** (integridade). Cada modo tem propriedades; CTR+MAC mal combinados quebram.
- **Hash functions**: SHA-2/SHA-3; aplicações — integridade, **HMAC** (autenticação de mensagem com chave), commitments.
- **Cripto assimétrica**: baseada em **fatoração** (RSA), **logaritmos discretos** (Diffie-Hellman/DSA), **curvas elípticas** (ECC); **certification authorities** e **TLS** como o uso público dominante.
- **Primitivas especiais** e a pergunta incômoda: **quão fortes são as primitivas assimétricas?** (quebra quântica, tamanho de chave, vazamentos).
- **"What else goes wrong"**: implementações, padding oracles, RNG ruins, chaves fracas, side channels — algoritmos raramente são o elo mais fraco.

## Mental Models
- **Modelo de segurança = o que o adversário não pode fazer** mesmo tendo texto cifrado, escolhendo mensagens, etc. (notions de segurança).
- **One-time pad é inquebrável mas inútil** na prática (chave do tamanho da mensagem, uma vez) — serve como ideal teórico.
- **Nunca role sua própria cripto**: a diferença entre um esquema seguro e um quebrado é frequentemente um detalhe invisível (padding, nonce reuse, modo).
- **Nonce reuse é fatal** (especialmente em GCM/CTR): reutilizar contador entrega o plaintext.
- **Criptografia protege dados, não sistemas**: ainda há protocolos, implementações e pessoas.

## Anti-patterns
- Usar **ECB** (vaza estrutura) ou modos sem autenticação para dados sensíveis.
- **Criptografia caseira** ou "obscurecida".
- **Reuso de nonce/IV**.
- Ignorar **autenticação** (encrypt-only sem MAC → padding oracle/CCA).
- Gerenciamento de chaves frágil (chaves hardcoded, sem rotação) — anula qualquer algoritmo.

## Worked Example
**Cifrar dados em repouso em um app**: em vez de inventar, use uma biblioteca padrão com **AES-GCM** (autenticado) + **chave derivada de senha com KDF forte** (argon2/scrypt) + **nonce aleatório por operação**, e armazene a chave mestre em HSM/keystore do SO. O erro típico — cifrar com ECB ou com senha como chave direta — foi exatamente o que quebrou inúmeros produtos reais. Seguir primitivas+modos+gestão consagrados elimina a classe inteira de erros.

## Key Takeaways
1. Conheça o **modelo de segurança** de cada primitiva antes de usá-la.
2. **AES-GCM/ChaCha20** para dados; **HMAC/SHA-2/3** para integridade; **ECC/RSA** para assimétrica — via bibliotecas padrão.
3. **Modo e gestão de chaves** importam tanto quanto o algoritmo.
4. O histórico mostra: o que parece "bom o suficiente" frequentemente é **quebrável** — confie em padrões auditados.

## Connects To
- Cap. 4 (protocolos) — como as primitivas são orquestradas.
- Cap. 20 (engenharia cripto avançada) — Signal, Tor, HSMs, blockchain.
- Cap. 19 (side channels) — ataques a implementações cripto.
