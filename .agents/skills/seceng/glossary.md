# Glossário — Security Engineering

## Dependability & básicos
- **Dependability (confiabilidade)**: propriedade sistêmica que engloba disponibilidade, confiabilidade, segurança (safety), integridade e confidencialidade. Segurança (security) é uma faceta da dependability.
- **Política de segurança**: o *que* o sistema deve garantir (confidencialidade, integridade, disponibilidade) — declarada antes dos mecanismos.
- **Modelo de ameaça (threat model)**: descrição do adversário — recursos, objetivos, capacidades, oportunidades — que determina quais mecanismos são suficientes.
- **Garantia (assurance)**: evidência de que os mecanismos realmente impõem a política sob ataque.
- **Mecanismo vs. política**: mecanismos (cripto, ACLs) são meios; a política é o fim. Não confundir os dois.

## Adversários (cap. 2)
- **Spooks (serviços de inteligência)**: adversário com recursos quase ilimitados; Five Eyes, China, Rússia; atacam infraestrutura, interceptam em massa.
- **Crooks (criminosos)**: motivados por dinheiro; ecossistemas de crime (malware-as-a-service), fraude bancária, ataques internos, crimes de CEO, whistleblowers.
- **Geeks**: curiosos/hackers por desafio; capacidade alta, mas motivação limitada.
- **The Swamp (o pântano)**: hacktivismo, campanhas de ódio, bullying, abuso em relacionamentos — motivação emocional e persistente.

## Criptografia & protocolos
- **Primitivas**: hash (função aleatória), stream cipher (gerador aleatório), block cipher (permutação aleatória), PKI (trapdoor), assinaturas digitais.
- **Modos de operação**: CBC, CTR, GCM, XTS, MAC — cada um com propriedades e armadilhas próprias.
- **Resurrecting duckling**: modelo de posse/emparelhamento de dispositivos (o "patinho" adota o primeiro "pato" que o acordar).
- **MIG-in-the-middle / reflection attack**: ataques clássicos a protocolos de autenticação.
- **Kerberos / Needham-Schroeder**: protocolos de distribuição de chaves com terceira parte confiável.

## Controle de acesso
- **DAC vs. MAC**: controle discricionário (dono decide) vs. obrigatório (política global, rótulos).
- **ACL vs. capabilities**: listas por objeto vs. capacidades por sujeito.
- **Bell-LaPadula**: MLS — "no read up, no write down" (confidencialidade).
- **Biba**: integridade — "no read down, no write up".
- **Clark-Wilson**: integridade comercial via *constrained data items* (CDIs), *transformation procedures* (TPs), separação de deveres e logs.
- **Chinese Wall**: impedir conflito de interesse entre clientes/negócios concorrentes.
- **IFC (Information Flow Control)**: generalização de MAC em SOs modernos (SELinux, Android, iOS).

## Aplicações & pessoas
- **Social engineering**: ataque à pessoa, não à máquina; phishing, pretexting, pretextos de confiança.
- **Economia da segurança**: externalidades (quem paga ≠ quem sofre), custodiante de risco, lock-in, public goods (patching), "lemons market".
- **Risk dumping / custodiante de risco**: transferir o risco para o elo mais fraco que não pode recusar (ex.: comerciante, consumidor).
- **Preplay attack**: capturar e reusar um desafio/transação válida antes do uso legítimo (fraude EMV).

## Físico & hardware
- **Tamper resistance**: resistência ativa à violação física (HSMs, smartcards).
- **Side channels**: vazamento por tempo, potência, EM, acústico, óptico; TEMPEST; rowhammer; Meltdown/Spectre.
- **PUF (Physical Unclonable Function)**: identidade de hardware derivada de variações físicas.
- **PAL (Permissive Action Link)**: controle de autorização em armas nucleares — "authorization, environment, intent".
- **Security printing / seals**: dificultar falsificação (papel-moeda, lacres, hologramas); "seal é tão bom quanto o homem da maleta".

## Processo & sociedade
- **Secure development lifecycle**: threat modeling, hazard analysis, design top-down, revisão, testes de segurança, resposta a incidentes.
- **Evaluation regimes**: Common Criteria, FIPS 140, Orange Book; "Principle of Maximum Complacency".
- **Assurance vs. sustainability**: sistemas precisam ser seguros *e* sustentáveis a longo prazo (atualizáveis, auditáveis).
- **Inference control / differential privacy**: impedir inferência sobre indivíduos a partir de dados agregados.
- **Surveillance vs. privacy**: tensão entre vigilância estatal/corporativa e direitos individuais (Five Eyes, cripto wars, GDPR).
