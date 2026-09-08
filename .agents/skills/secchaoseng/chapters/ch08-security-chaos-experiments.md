# Capítulo 8 — Security Chaos Experiments

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch08-security-chaos-experiments.md`

## Core Idea
O coração do SCE: **aplicar o método científico** para descobrir como o sistema realmente se comporta sob condições adversas de segurança — informação que não tínhamos antes. Este capítulo ensina o processo ponta a ponta de um **security chaos experiment**: pré-requisitos, **hipótese falsificável**, **design do experimento** (com specification), execução, **coleta de evidência**, análise/documentação — girando o **EMPAK loop** — e formas de começar (game days, automação).

## Frameworks Introduced
- **SCE = método científico aplicado à segurança** (experimentação ≠ teste).
- **EMPAK loop**: Execute, Monitor, Plan, Analyze + Knowledge base.
- **Lessons learned de early adopters** (3 lições).
- Processo: **set up para sucesso → hipótese → design → condução → evidência → análise/documentação**.
- **Experiment design specifications** e **experiment release notes**.
- **Game days** e automação de experimentos.
- Exemplos por ambiente (produção, build pipelines, cloud native, Windows).

## Key Concepts
- **Experimento ≠ teste**: teste valida um resultado conhecido (já sabemos o que procuramos); **experimento busca informação nova** e desconhecida, que informa adaptações.
- **EMPAK loop** (citado de Kennedy Torkura): ciclo contínuo de:
  1. **Execute** o cenário adverso;
  2. **Monitor** o comportamento (observabilidade — ch. 5);
  3. **Plan** (analisar e planejar a próxima iteração);
  4. **Analyze** os resultados;
  + **Knowledge base** que alimenta os próximos experimentos.
- **Lições de early adopters**:
  1. **Comece em ambientes não-produção** (staging/CI) — ainda se aprende muito.
  2. **Use incidentes passados como fonte de experimentos** (o que falhou vira hipótese).
  3. **Publique e evangelize resultados** (reduz medo de "quebrar produção", espalha aprendizado).
- **Set up para sucesso**: pré-requisitos — bom entendimento do sistema, observabilidade, ambiente seguro para experimentar, apoio organizacional.
- **Design de hipótese**: uma **explicação proposta e falsificável** — "acreditamos que X acontece quando Y". Se não pode ser refutada pela evidência, não é uma boa hipótese.
- **Design do experimento**: escolha o cenário adverso (injeção de falha, ataque simulado), o ambiente, as métricas e o que seria evidência de confirmação/refutação.
  - **Experiment design specification**: documento que registra hipótese, método, escopo, métricas, riscos, rollback e critérios de sucesso — para repetibilidade e segurança.
- **Conduzindo e coletando evidência**: execute com segurança (contenção, rollback), colete dados confiáveis (observabilidade), não confie em impressão.
- **Análise e documentação**: interprete a evidência contra a hipótese; **documente** o que aprendeu.
  - **Capturar conhecimento para feedback loops**: a evidência vira entrada da knowledge base do EMPAK.
  - **Experiment release notes**: documente cada experimento (o que foi testado, o que se aprendeu) como um "release" — visível e auditável.
- **Automatizar experimentos**: rode continuamente (caos como prática regular), não como evento único.
- **Easing into chaos — game days**: comece com **game days** (exercícios planejados, ensaiados) para construir confiança antes de experimentos mais agressivos.
- **Exemplos**:
  - **Produção/infraestrutura**: derrubar um nó/região, revogar credencial, simular perda de dependência e medir o impacto na funcionalidade crítica de segurança.
  - **Build pipelines**: injetar dependência comprometida/indisponível; verificar se o pipeline falha ou entrega inseguro.
  - **Cloud native**: matar pods, revogar permissões IAM, testar políticas de rede.
  - **Windows**: simular falha de AV/EDR, revogação de certificado, falha de domain controller.

## Mental Models
- **"Teste diz o que você já sabe; experimento descobre o que você não sabe"** — o valor do SCE é reduzir a lacuna entre modelo mental e realidade.
- **Hipótese falsificável é a âncora**: sem ela, o "experimento" vira teatro.
- **Toda premissa de segurança é candidata a experimento**: "o rate limiting protege", "o backup funciona", "o EDR detecta" — se é crítico e não verificado, teste.
- **Segurança primeiro no próprio experimento**: rollback e contenção antes de causar caos; experimento não é para quebrar, é para **aprender** (e o objetivo é "consertar em produção", não "sofrer").
- **Comece pequeno e suba**: nonprod → game day → produção com automação.

## Anti-patterns
- **Experimento sem hipótese** (mexer e ver o que acontece = teatro/risco).
- **Teste chamado de experimento** (validar o óbvio e achar que aprendeu).
- **Ir direto à produção** sem staging/game day (lição #1 ignorada).
- **Não documentar** (spec/notas) → sem repetibilidade nem aprendizado compartilhado.
- **Esconder resultados** (não publicar/evangelizar) → medo persiste, aprendizado não espalha.
- **Sem rollback/contenção** — caos irresponsável que derruba funcionalidade crítica de verdade.

## Worked Example
**Hipótese sobre revogação de credencial**: premissa crítica — "se uma chave de API vazar, revogá-la derruba o acesso do atacante em <5 min". Experimento (em staging primeiro, depois produção com spec): (1) **Execute** — rotaciona/revoga uma credencial de um serviço canário; (2) **Monitor** — mede quanto tempo até as chamadas com a chave antiga falharem e se o serviço legítimo sofre; (3) **Analyze** — a evidência mostra que tokens em cache continuam válidos por 30 min (refuta a hipótese!) e que o serviço legítimo teve 2% de erro (risco aceitável); (4) **Plan/Knowledge** — atualiza a knowledge base: "revogação leva 30 min por cache" → novo experimento para reduzir o TTL do cache. **Release note** documenta o achado; resultado **publicado** para os times. A premissa "a revogação é instantânea" foi corrigida pela evidência.

## Key Takeaways
1. **Experimento descobre o desconhecido**; precisa de **hipótese falsificável** e observabilidade.
2. Rode o **EMPAK loop** (Execute→Monitor→Plan→Analyze→Knowledge) continuamente.
3. Siga as 3 lições: **comece fora de produção, mine incidentes passados, publique resultados**.
4. Documente com **experiment design specs e release notes**; automatize e use **game days** para aquecer.
5. Objetivo é **aprender** (consertar em produção), nunca só "quebrar".

## Connects To
- **Ch 2**: a Tier 2 da avaliação E&E é este capítulo em ação.
- **Ch 5**: observabilidade é o que permite Monitor/evidência.
- **Ch 6**: incidentes passados → hipóteses.
- **Conceitos**: chaos engineering (Principles of Chaos), fault injection, game days, método científico.
