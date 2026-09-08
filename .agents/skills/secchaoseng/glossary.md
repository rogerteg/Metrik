# Glossário — Security Chaos Engineering

## Resiliência & sistemas complexos (ch. 1)
- **Complex system** — sistema com *variety* (muitos componentes/elementos diversos), *adaptativo* e *holístico* (o todo ≠ soma das partes); ex.: software distribuído moderno.
- **Failure** — desvio do comportamento esperado; inevitável em sistemas complexos.
- **Acute stressor** — estressor agudo (ex.: ataque, pico, queda de dependência). **Chronic stressor** — estressor crônico (ex.: dívida técnica, déficit de observabilidade).
- **Surprise** — evento que o modelo mental não previu; o que realmente testa a resiliência.
- **Resilience** — capacidade de *recuperar* de falhas e *se adaptar* conforme o contexto muda. **É um verbo** (processo), não um estado.
- **Critical functionality** — a função que precisa continuar operando para o sistema cumprir seu propósito.
- **Safety boundary (threshold)** — o limite entre operar bem e falhar; conhecer onde estão (via observabilidade/experimentos) é essencial.
- **Interactions across space-time** — interações entre componentes distribuídos no espaço e no tempo; fonte de surpresas.
- **Feedback loop / learning culture** — ciclo de aprender com falhas e adaptar.
- **Robustness** — resistir sem mudar (≠ resiliência).

## Mental models & avaliação (ch. 2)
- **Mental model** — modelo interno de como o sistema se comporta; sempre incompleto; atacantes exploram os erros dele.
- **Resilience stress testing** — testar o sistema sob estresse para revelar limites reais.
- **E&E Resilience Assessment** — abordagem em 2 fases: **Evaluation (Tier 1)** e **Experimentation (Tier 2)**.
- **Attacker math / decision trees** — modelar o atacante como decisor racional (ROI, custo/benefício) em árvores de decisão.
- **Feedback flywheel** — ciclo: avaliar → experimentar → aprender → adaptar (girando continuamente).
- **Fail-safe** — projetar para falhar de forma segura quando algo der errado.
- **Safe-to-fail** — projetar para que falhas localizadas não derrubem o todo *e* gerem aprendizado.
- **Uncertainty vs. ambiguity** — incerteza (probabilidades conhecidas) vs. ambiguidade (não se sabe nem as opções).
- **Security theater** — ações que *parecem* melhorar a segurança (checklists, compliance) sem evidência de eficácia.
- **RAVE** — Repeatability, Accessibility, Variability: critérios para tornar segurança prática para engenheiros.

## Design (ch. 3)
- **Effort investment portfolio** — alocar esforço de segurança com base no contexto local e no risco, não uniformemente.
- **Coupling (acoplamento)** — o quanto componentes dependem uns dos outros; *tight coupling* amplifica falhas; *loose coupling* contém.
- **Complexity** — *essential* (inerente ao problema) vs. *accidental* (criada pela solução).
- **Linearity** — previsibilidade das relações causa-efeito; sistemas mais lineares são mais compreensíveis.
- **Preserve possibilities** — manter opções futuras (design que não "pinta num canto").
- **Four failure modes from design** — falhas estruturais induzidas por decisões de design (acoplamento/complexidade).

## Build & deliver (ch. 4)
- **Raw materials** — dependências e "matérias-primas" de software; padronizar reduz surpresas.
- **Boring technology** — tecnologia madura/conhecida; "boring technology is resilient technology".
- **Configuration as code** — infraestrutura/configuração versionada e revisável.
- **Fault injection** — injetar falhas de propósito durante o desenvolvimento (não só em produção).
- **Test theater** — testes que passam mas não validam nada real (teatro).
- **Feature flags / dark launches** — liberar mudanças de forma reversível e gradual.
- **Strangler fig pattern** — substituir um sistema aos poucos (como a figueira estranguladora), reduzindo risco de migração.
- **Airlock** — metáfora: decidir deliberadamente "o que joga fora" vs. "o que mantém" ao mudar.

## Operar & observar (ch. 5)
- **SRE** — Site Reliability Engineering; engenharia de confiabilidade; objetivos muito sobrepostos com segurança.
- **DORA metrics** — métricas de entrega (deployment frequency, lead time, change failure rate, time to restore).
- **SLO / SLA** — service level objective/agreement; metas de nível de serviço.
- **Confidence-based security** — basear decisões de segurança em confiança medida por evidência, não em medo.
- **Attack observability** — observar o sistema como o atacante o vê (telemetria de ataque, não só de falha).
- **Thresholding** — usar thresholds/limiares para revelar safety boundaries.
- **Toil** — trabalho manual repetitivo; automatizar.

## Responder & recuperar (ch. 6)
- **Action bias** — tendência a agir (mexer) mesmo sem informação, piorando incidentes.
- **Hindsight bias** — achar que o resultado era previsível depois de acontecer.
- **Outcome bias** — julgar a decisão pelo resultado, não pela qualidade da decisão no momento.
- **Just-world hypothesis** — tendência a acreditar que quem sofreu "mereceu" (culpar a vítima).
- **Blameless culture** — cultura sem culpa; foco em sistema, não em indivíduo.
- **Human error** — rótulo que *encerra* a investigação em vez de revelar causas sistêmicas.
- **Neutral practitioner questions** — perguntas neutras (sem culpabilizar) para investigação.

## Plataforma (ch. 7)
- **Platform engineering** — construir plataformas internas (produtos) para times de engenharia.
- **Ice Cream Cone Hierarchy of Security Solutions** — hierarquia de soluções de segurança, do topo (eliminar perigo) à base (controles administrativos), inspirada na hierarquia de controle de riscos.
- **Control strategy vs. resilience strategy** — controlar (prevenir/limitar) vs. resiliência (absorver/adaptar); equilibrar.
- **Guardrails** — limites que guiam sem bloquear (defaults seguros, políticas por padrão).

## Experimentação (ch. 8)
- **Security Chaos Engineering (SCE)** — extensão do chaos engineering para segurança: experimentação contínua para validar resiliência/segurança sob condições adversas.
- **Chaos engineering** — experimentação contínua para verificar que o sistema se comporta como acreditamos.
- **Hypothesis** — explicação proposta/falsificável que guia o experimento.
- **EMPAK loop** — Execute, Monitor, Plan, Analyze + Knowledge base: ciclo de experimentos de segurança.
- **Experiment design specification** — documento que define hipótese, método, métricas, riscos e critérios de um experimento.
- **Game day** — exercício/ensaio planejado (forma de "aquecer" para o caos).
- **Evidence** — observações coletadas durante o experimento; base para decisão.

## Casos (ch. 9)
- **ChaoSlingr** — ferramenta de SCE da UnitedHealth Group (injetar cenários adversos em segurança).
- **CVV (Continuous Verification and Validation)** — processo da Cardinal Health (4 passos).
- **Security as a product** — tratar soluções de segurança como produto para usuários internos.
