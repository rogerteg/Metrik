# Capítulo 4 — Building and Delivering

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch04-building-and-delivering.md`

## Core Idea
É na construção e entrega de software que a resiliência é (ou não) incorporada. O capítulo mais prático do livro mapeia como desenvolver, testar e entregar com resiliência: **quem é dono da segurança**, decisões antes de construir, padronização de "matérias-primas", **CI/CD com segurança automatizada**, **configuração como código**, **injeção de falhas durante o desenvolvimento**, e a distinção entre **teste real e "test theater"** — além de modularidade, feature flags e o padrão *strangler fig*.

## Frameworks Introduced
- **Mental models ao desenvolver** e **quem é dono da segurança de aplicação**.
- Decisões de **funcionalidade crítica antes de construir** e o que "jogar fora da airlock".
- **"Boring technology is resilient technology"** e **padronização de raw materials**.
- **Automatizar verificações de segurança via CI/CD**.
- **Configuration as Code** e **fault injection durante o desenvolvimento**.
- **Test theater** vs. testes que validam.
- Táticas de evolução: **modularidade, feature flags/dark launches, typing, strangler fig**.

## Key Concepts
- **Quem é dono?**: segurança de aplicação não pode ser só de um time externo — precisa estar nas mãos de quem constrói, com suporte (o cap. 7 mostra a plataforma como viabilizadora).
- **Decisões antes de construir**: defina **metas do sistema** e **o que jogar fora** deliberadamente (a *airlock* — nem tudo merece ser preservado ao mudar).
- **Code reviews e modelos mentais**: revisão de código corrige modelos mentais compartilhados, não só bugs.
- **Boring technology**: tecnologia madura, conhecida e chata é resiliente; cada adoção de novidade é uma aposta de surpresa.
- **Padronização de raw materials**: dependências e componentes padronizados (versões, licenças, fontes) reduzem variedade → reduzem surpresa e facilitam resposta a vulnerabilidades.
- **Expandir safety boundaries**: desenvolva/entregue de forma a *alargar* os limites seguros (deploys reversíveis, rollback, dark launch).
- **Antecipar escala e SLOs**: defina expectativas de escala e nível de serviço cedo.
- **Automatizar segurança via CI/CD**: verificação de segurança (SAST, segredos, dependências, conformidade) roda **no pipeline**, todo commit — não num "time de segurança no fim".
- **Padronizar padrões e ferramentas**: menos ferramentas divergentes = menos superfície e mais expertise.
- **Análise de dependências e priorização de vulnerabilidades**: saiba o que você usa e priorize por exploração real/ROI (não só por CVSS).
- **Configuração como código**: versionar, revisar e testar configuração — o "drift" de config é fonte clássica de falha e brecha.
- **Fault injection durante o desenvolvimento**: injete falhas (timeouts, respostas ruins de dependências) no build/teste para ver como o código reage — antes de produção.
- **Test theater**: testes que passam mas não validam nada real (ex.: integração com mock perfeito que nunca falha; cobertura alta sem asserções úteis). Contrapor com testes que exercitam comportamento real e falhas.
- **Feedback loops e aprendizado no build**: test automation, **documentar o "porquê"** (não só o como), **distributed tracing e logging** desde cedo.
- **Como humanos interagem com build/delivery**: flexibilidade, iteração (evolução), **modularidade** (trocar partes sem quebrar o todo), **feature flags e dark launches** (liberaçõ gradual e reversível), **typing** (preserva possibilidades de refatoração), **strangler fig** (substituir sistema legado incrementalmente).

## Mental Models
- **"Segurança é um requisito do pipeline, não uma fase"**: se não roda no CI, não é garantido — é esperança.
- **"Teste é validação; experimento é descoberta"** (raiz do cap. 8): no build, use testes; mas não confunda cobertura com conhecimento.
- **Padronize para reduzir variedade**: variedade (raw materials, ferramentas) é o que torna o sistema complexo e imprevisível.
- **Tecnologia "chata" vence**: a empolgação com o novo custa resiliência.
- **Toda mudança deve ser reversível**: feature flag, dark launch, rollback — se não dá para desfazer rápido, a mudança é uma aposta.
- **Documente o porquê**: o "porquê" é o que permite a um humano (ou agente) do futuro adaptar sem quebrar.

## Anti-patterns
- **Segurança como fase final** (pentest "no fim") em vez de checks no CI/CD.
- **Test theater**: mocks que nunca falham, cobertura sem valor, testes que só existem para o relatório.
- **Raw materials não padronizados**: centenas de versões/dependências sem inventário → vulnerabilidade sem dono.
- **Configuração fora de controle** (drift, "só em produção").
- **Mudanças irreversíveis** (sem rollback/feature flag) que "travam" o sistema.
- **Abstrações prematuras** (caixas-pretas incompreensíveis).
- **Ignorar o "porquê"** em comentários/docs (decisões viram mistério).

## Worked Example
**Pipeline de um serviço novo**: a equipe define a funcionalidade crítica e o que "joga fora"; padroniza as dependências (raw materials) e escolhe tecnologia madura. No CI: (a) **SAST + scan de dependências** (com priorização por exploração, não só CVSS); (b) **verificação de segredos**; (c) **config as code** com review; (d) **testes de integração** que usam um *test double que falha* (fault injection): derruba o banco em container e verifica se o serviço degrada com grace; (e) deploy com **feature flag** e métricas de release. Um "test theater" evitado: em vez de mock que sempre responde, o teste injeta timeout para validar o circuit breaker. Resultado: mudanças seguras por padrão, e cada build ensina algo sobre o sistema.

## Key Takeaways
1. Segurança de app pertence a **quem constrói**, com suporte de plataforma.
2. **Automatize segurança no CI/CD** e **padronize raw materials**; prefira **tecnologia chata**.
3. **Config como código + injeção de falhas no build** pegam problemas antes da produção.
4. Evite **test theater**; faça testes que validam comportamento real.
5. Evolua com **modularidade, feature flags, typing e strangler fig**; documente o **porquê**.

## Connects To
- **Ch 3**: as decisões de design que o build materializa.
- **Ch 7**: a plataforma fornece os guardrails que tornam o build seguro por padrão.
- **Ch 8**: testes no build são o degrau antes dos experimentos em produção.
- **Conceitos**: CI/CD, DORA (ch. 5), *Accelerate* (Forsgren).
