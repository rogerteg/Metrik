# Capítulo 15 — Nuclear Command and Control

**Livro**: Security Engineering (Anderson) · `chapters/ch15-nuclear-command-and-control.md`

## Core Idea
Nenhum sistema de segurança tem requisitos mais extremos que o **comando e controle nuclear**: prevenir uso não autorizado *e* garantir uso autorizado sob condições extremas, com adversários que incluem o próprio Estado e seus operadores. Anderson mostra como esse domínio "impossível" produziu ideias-padrão da segurança moderna — **authorization × environment × intent**, autenticação incondicionalmente segura, esquemas de controle compartilhado e tamper resistance (PALs).

## Frameworks Introduced
- Modelo de decisão **"authorization, environment, intent"** (autorização, ambiente, intenção) — aplicável a qualquer sistema de alto risco.
- **Unconditionally secure authentication** (autenticação incondicional — baseada em one-time pads, não em suposições computacionais).
- **Shared control schemes** (esquemas de controle compartilhado — limiar, dual control).
- **PALs (Permissive Action Links)**: dispositivos de segurança que impedem uso não autorizado de armas.
- **Treaty verification**: verificação de tratados de desarmamento (inspeção com garantias criptográficas).

## Key Concepts
- **Evolução do comando e controle**: do controle centralizado à necessidade de sobrevivência e delegação.
- **Kennedy Memorandum**: decisão de que armas nucleares precisavam de **controles eletrônicos** contra uso não autorizado (após incidentes em que comandantes quase autorizaram uso por engano).
- **Authorization, environment, intent** — o quadro para decidir lançar: *quem* autoriza (cadeia de comando), *o que está acontecendo* (ambiente — há realmente um ataque?), *qual a intenção* (o que se quer alcançar). Previne tanto o **uso acidental** quanto o **uso por comandante desonesto**.
- **Autenticação incondicional**: esquemas de one-time pad que permanecem seguros mesmo contra adversários com poder computacional ilimitado (não dependem de dificuldade computacional).
- **Shared control**: exigir **dois ou mais operadores** (dual control) com partes separadas de um segredo para autorizar — nenhum indivíduo sozinho pode lançar.
- **Tamper resistance e PALs**: o hardware "morre"/se recusa se violado; códigos e mecanismos que impedem o operador de contornar.
- **Verificação de tratados**: técnicas para inspecionar arsenais sem revelar segredos (ex.: provas de que um objeto é realmente uma ogiva sem expor seu projeto).
- **O que dá errado**: acidentes nucleares (quase-lançamentos por falha de sistemas/alerta falso), **interação com cyberwar** (ataques cibernéticos a sistemas de comando), falhas técnicas.
- **Secrecy ou openness?**: o debate sobre quanto do projeto revelar (obscuridade vs. verificação externa).

## Mental Models
- **"Os dois erros são simétricos e ambos fatais"**: lançar sem autorização (falso positivo) e *não* lançar quando autorizado/necessário (falso negativo). Segurança ≠ só impedir o mau uso; é também **garantir o uso correto**.
- **Controle compartilhado**: nenhuma única pessoa/ sistema deve ter poder absoluto (proteção contra insider e erro).
- **Segurança de "última instância"**: quando falhar significa catástrofe, você precisa de garantias *incondicionais* e *físicas*, não só de software.
- **O ambiente decide a resposta**: a mesma ordem pode ser certa ou errada conforme o contexto — por isso "intent" e "environment" importam tanto quanto "authorization".

## Anti-patterns
- **Single point of failure humano**: um único operador com autoridade total.
- Autorização **sem verificação de contexto** (sistema que obedece cegamente).
- Sistemas em que o **erro de um lado é irreversível** sem múltiplas confirmações.
- Confiar em **autenticação computacional** onde um adversário com recursos ilimitados é o modelo (use incondicional).
- **Obscuridade total**: sem verificação externa/tratado, não há como auditar.

## Worked Example
**Sistema de lançamento (conceito)**: dois operadores em locais separados inserem partes complementares de um segredo (shared control); o sistema valida *authorization* (ordem da cadeia de comando com autenticação incondicional via one-time pad), *environment* (sensores/radar confirmam ataque real — reduzindo alertas falsos), e *intent* (regras de engajamento). Hardware com **PAL/tamper resistance** impede uso se a ordem não for válida. Lição transferível: para *qualquer* ação crítica irreversível (pagamento gigante, deploy destrutivo, acesso a cofre), aplique **dual control + contexto + trilha**.

## Key Takeaways
1. Alta consequência exige **controle compartilhado** e múltiplos fatores de decisão.
2. Pense em **authorization × environment × intent**, não só em "quem pode".
3. Contra adversários máximos, use **garantias incondicionais/físicas**.
4. Evite os dois erros simétricos: uso indevido *e* indisponibilidade quando necessário.

## Connects To
- Cap. 4 (protocolos) — autenticação e one-time pads.
- Cap. 18 (tamper resistance) — PALs e hardware à prova de violação.
- Cap. 23 (guerra eletrônica/info) — cyberwar contra comando e controle.
