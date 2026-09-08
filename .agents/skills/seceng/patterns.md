# Padrões (Patterns) — Security Engineering

Padrões recorrentes extraídos do livro. Use como vocabulário de design, não como receita cega.

## Estruturais / de política
- **Policy precedes mechanism**: escreva a política de segurança antes de escolher ferramentas.
- **Least privilege**: dê o mínimo necessário de permissão pelo menor tempo necessário (falhas disso = raiz de muitos ataques).
- **Defense in depth**: múltiplas camadas independentes; nenhuma deve ser o único ponto de confiança.
- **Separation of duties**: nenhum ator sozinho consegue completar uma operação crítica (fraude exige conluio).
- **Compartmentation**: dividir o sistema em compartimentos com canais de comunicação controlados (lattice, Chinese Wall).
- **Fail-safe defaults**: por padrão negue; só conceda o que for explicitamente autorizado.

## Autenticação / protocolo
- **Challenge-response**: nunca enviar segredo reutilizável; usar desafio não previsível.
- **Mutual authentication**: autentique as duas pontas; um lado só autenticado permite MIG-in-the-middle.
- **Nonces / anti-replay**: impedir reuso (evita preplay e reflection attacks).
- **Resurrecting duckling (posse)**: emparelhar dispositivo com dono no primeiro contato (loT, BLE).
- **Second factor independente**: o 2FA só ajuda se não compartilhar canal com o fator primário (ex.: push no mesmo aparelho é fraco).

## Cripto aplicada
- **Use primitivas padrão e modos seguros**: AES-GCM / ChaCha20; nunca modos "caseiros".
- **Authenticated encryption primeiro**: CCM/GCM; encrypt-then-MAC.
- **Key management explícito**: rotação, backup, destruição; o elo mais fraco costuma ser o gerenciamento, não o algoritmo.
- **Forward secrecy**: nunca reutilize chaves de longa duração para tráfego (Signal, TLS).
- **End-to-end onde a confiança termina no usuário**: não dê a chave ao servidor se o modelo de ameaça incluir o provedor.

## Aplicações & humanos
- **Assume the user is the adversary's ally**: usuários clicam, compartilham, reutilizam senhas; desenhe tolerante a erro.
- **Make the secure path the easy path**: se seguro for difícil, o usuário escolhe inseguro.
- **Visible/confirmable security**: mostre estado seguro de forma compreensível (cadeado, alertas de permissão).
- **Accountable transactions**: mantenha trilhas de auditoria imutáveis para fraude interna e disputas (Clark-Wilson, double-entry).
- **Rate limiting e anomalias**: fraude em escala exige detecção estatística + resposta (fraud engines em cartões).

## Físico / hardware
- **Tamper-evidence + tamper-resistance**: para muitos cenários, detectar violação (lacres, selos) basta; resistir (HSM) é caro.
- **Assume side channels exist**: não coloque segredos onde medidores físicos os revelam; minimize dados sensíveis na CPU/GPU compartilhada.
- **Boundary realism**: toda fronteira física/lógica será atacada no elo mais fraco (rede, energia, social).

## Processo / organizacional
- **Threat model first, then controls**: escolha controles pelo adversário real, não pelo catálogo.
- **Incentives alignment**: quem decide a segurança deve arcar com o custo do fracasso (corrige externalidades).
- **Patch & disclose responsibly**: disclosure coordenado; patch rápido para *public goods* (todos se beneficiam).
- **Secure development lifecycle + gating**: portões de qualidade em cada fase; DevSecOps.
- **Independent evaluation & hostile review**: avaliação externa e "red team" contínuo são mais eficazes que autoavaliação.
- **Sustainability**: software precisa ser mantível, atualizável e auditável por décadas — segurança é um processo contínuo.
