# Capítulo 2 — Systems-Oriented Security

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch02-systems-oriented-security.md`

## Core Idea
Segurança falha porque trabalhamos com **modelos mentais incompletos** dos sistemas e tentamos impor controles de cima para baixo. A alternativa é **segurança orientada a sistemas**: refinar modelos mentais continuamente, **avaliar a resiliência** (E&E Assessment) e substituir o "security theater" por evidência — com **fail-safe → safe-to-fail** e os critérios **RAVE** para tornar a segurança praticável.

## Frameworks Introduced
- **Mental models de comportamento do sistema** (e como atacantes os exploram).
- **Resilience stress testing** e a **E&E Resilience Assessment** (Evaluation/Tier 1 + Experimentation/Tier 2).
- **Attacker math / decision trees** (modelar o atacante como decisor racional).
- **Feedback flywheel** (ciclo contínuo de avaliação e aprendizado).
- **Fail-safe vs. safe-to-fail** e **uncertainty vs. ambiguity**.
- **SCE vs. Security Theater**.
- **RAVE**: Repeatability, Accessibility, Variability.

## Key Concepts
- **Modelos mentais**: nossa compreensão do sistema é sempre uma simplificação. Atacantes **exploram exatamente as lacunas** entre o modelo e a realidade (ex.: você acha que "a rede interna é confiável"; o atacante sabe que não).
  - **Refinar modelos**: observar, medir, experimentar — aproximar o modelo da realidade.
- **Resilience stress testing**: submeter o sistema a condições adversas para revelar limites reais (não os presumidos).
- **E&E Resilience Assessment**:
  - **Evaluation (Tier 1)** — fase de prontidão, sem experimentação:
    - **Mapear fluxos** (dados, acesso, controle) e conectá-los à **funcionalidade crítica**.
    - **Documentar premissas sobre safety boundaries** (onde você acha que está o limite?).
    - **Fazer a matemática do atacante**: modelar decisões do atacante como **árvores de decisão** ponderando custo, benefício e probabilidade de sucesso (ROI do atacante) — e usar isso para priorizar defesas (decision trees como forma de threat model com ROI).
  - **Experimentation (Tier 2)** — construir sobre a Tier 1:
    - Validar por **experimentos** o que a Tier 1 presumiu; o valor está na **evidência experimental**.
    - **Sustentar**: a avaliação não é evento único — repita e mantenha (as premissas envelhecem).
- **Feedback flywheel**: avaliar → experimentar → aprender → adaptar, girando continuamente (o motor do SCE).
- **Fail-safe vs. safe-to-fail**: fail-safe = quando falhar, falhe de forma segura (muitas vezes desligando). Em sistemas complexos isso não basta — **safe-to-fail** = a falha é contida, não derruba o todo, e **gera aprendizado**. (Fail-safe pode até *piorar*: desligar um serviço crítico pode derrubar o sistema — "fail-safe negligencia a perspectiva sistêmica".)
- **Uncertainty vs. ambiguity**: *uncertainty* = você pode estimar probabilidades; *ambiguity* = você nem sabe quais são as opções. Estratégias diferentes para cada uma.
- **SCE vs. Security Theater**: security theater = ações que parecem proteger (checklists, compliance, selos) mas não têm evidência de eficácia. SCE difere por buscar **evidência empírica** de que os controles funcionam sob adversidade.
- **RAVE** — como tornar segurança acionável para engenheiros:
  - **Repeatability**: dá para repetir (e automatizar) de forma consistente.
  - **Accessibility**: fácil para engenheiros usarem (não um "clube do security").
  - **Variability**: suporta evolução/variação de contexto sem quebrar.

## Mental Models
- **"Seu modelo mental está errado em algum lugar — o atacante vai achar onde."** Segurança é uma corrida entre a precisão do seu modelo e a exploração do atacante.
- **Pense como um decisor racional adversário**: para cada defesa, pergunte qual o custo/benefício para o atacante contorná-la (attacker math) — não "é possível contornar?".
- **Avalie antes de remediar**: você não pode proteger o que não mapeou (Tier 1 antes de experimentar).
- **Experimente para saber, não para confirmar**: experimento busca informação nova (≠ teste que valida o conhecido).
- **Fail-safe pode ser anti-sistêmico**: "desligar para proteger" pode derrubar a funcionalidade crítica — prefira falhas contidas e aprendíveis.

## Anti-patterns
- Confiar no **modelo mental sem validação** (a "rede confiável", o "firewall protege tudo").
- **Threat model estático** (uma vez por ano) sem alimentar experimentos.
- **Security theater**: métricas de atividade (treinos feitos, tools instaladas) no lugar de métricas de resultado.
- **Fail-safe cego**: matar o serviço inteiro em vez de degradar com segurança.
- Entregar segurança **sem RAVE** (processos manuais, inacessíveis, frágeis) que os devs contornam.

## Worked Example
**Avaliação E&E de um app com login**: **Tier 1** — mapeia o fluxo de autenticação (credenciais → token → API), define a funcionalidade crítica (usuário logado acessa recursos), documenta a premissa "o rate limiting protege contra brute force", e monta uma *árvore de decisão do atacante*: força bruta tem custo X e chance Y → vale a pena? **Tier 2** — um experimento injeta tentativas de login em ritmo crescente em staging e mede onde o rate limiting realmente dispara (talvez o limite seja por IP, contornável por distribuição). A **evidência** refuta a premissa → a equipe redesenha (limite por conta + por IP) e registra a nova premissa. O **flywheel** gira: a cada mudança, reavalie e reexperimente.

## Key Takeaways
1. **Modelos mentais são o campo de batalha**: refine-os com observação e experimentação.
2. Use **E&E**: Tier 1 avalia/mapeia (fluxos → funcionalidade crítica; attacker math); Tier 2 experimenta; sustente o ciclo.
3. Prefira **safe-to-fail** a fail-safe ingênuo; distinga **uncertainty** de **ambiguity**.
4. Troque **security theater** por **evidência**; entregue segurança **RAVE** (repetível, acessível, variável).

## Connects To
- **Ch 1**: definição de resiliência que a avaliação mede.
- **Ch 8**: a Tier 2 vira o processo de experimentos (EMPAK).
- **Ch 3/7**: attacker math alimenta design e plataforma.
- **Conceitos**: threat modeling com ROI, DORA (ch. 5), Safety-II.
