# Cheatsheet — Checklist rápido de projeto seguro

## 1. Antes de codificar
- [ ] Quem é o adversário? (recursos, objetivos, persistência — cap. 2)
- [ ] O que estou protegendo? (ativos e valor real)
- [ ] Quais as consequências de cada falha? (dinheiro? vida? reputação? privacidade?)
- [ ] Política de segurança escrita (CIA + integridade/accountability) — cap. 1
- [ ] Quem paga pelos controles? Quem sofre se falhar? (economia — cap. 8)
- [ ] Trade-offs de usabilidade vs. segurança mapeados (cap. 3)

## 2. Autenticação & identidade
- [ ] Sem senha reutilizável em trânsito — use challenge-response/TLS
- [ ] 2FA em canal independente quando o valor justificar
- [ ] Proteção contra MIG-in-the-middle e reflection (autenticação mútua)
- [ ] Anti-replay (nonces), tempo e ordem verificados
- [ ] Senhas: hash com salt + KDF forte (argon2/bcrypt); nunca armazenar plaintext
- [ ] Política de recuperação de senha segura (o elo mais fraco!)

## 3. Autorização & acesso
- [ ] Least privilege; separação de deveres para ações críticas
- [ ] Fail-safe defaults (negar por padrão)
- [ ] ACL/capabilities corretos; revisar herança e permissões default
- [ ] Validação em toda entrada (evita buffer overflow/injection)
- [ ] Compartimentação para dados sensíveis (IFC/MAC quando aplicável)

## 4. Criptografia & dados
- [ ] Primitivas padrão (AES-GCM/ChaCha20, SHA-2/3, ECDSA/Ed25519); nada caseiro
- [ ] Authenticated encryption; nunca CBC+MAC separado à mão
- [ ] Gerenciamento de chaves: rotação, backup, destruição, HSMs p/ alto valor
- [ ] Forward secrecy em transporte
- [ ] Dados em repouso cifrados com gerenciamento de chaves real
- [ ] Backups cifrados e testados

## 5. Redes & infraestrutura
- [ ] TLS configurado corretamente (versões, cipher suites, CT para CAs)
- [ ] DNSSEC/BGP segurança onde o domínio importa; monitorar roteamento
- [ ] Defesa contra DoS: rate limiting, capacidade, filtragem
- [ ] Firewall/segmentação; nunca confie na rede interna
- [ ] Patch management rápido (vulnerability cycle — cap. 21/27)

## 6. Aplicações & pessoas
- [ ] Threat modeling por feature (STRIDE/ataque real — cap. 27)
- [ ] O caminho seguro é o caminho fácil
- [ ] Logs de auditoria imutáveis p/ transações (double-entry)
- [ ] Treinar contra phishing/social engineering (e testar)
- [ ] Plano de resposta a incidentes + disclosure coordenado

## 7. Hardware & físico (quando relevante)
- [ ] Ameaça física incluída? (roubo de dispositivo, portas, supply chain)
- [ ] Tamper-evidence suficiente? (lacres, selos, HSM quando necessário)
- [ ] Side channels considerados (tempo, potência, EM) para segredos de longa vida
- [ ] Cadeia de suprimentos de hardware verificada

## 8. Garantia & ciclo de vida
- [ ] Revisão de segurança independente ("hostile review")
- [ ] Testes de segurança automatizados no CI (SAST/DAST, fuzzing)
- [ ] Gated development: critérios de saída em cada fase
- [ ] Monitoramento de vulnerabilidades pós-lançamento + plano de atualização
- [ ] Documentar modelo de ameaça e decisões (sustentabilidade)
