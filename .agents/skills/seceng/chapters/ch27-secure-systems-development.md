# Capítulo 27 — Secure Systems Development

**Livro**: Security Engineering (Anderson) · `chapters/ch27-secure-systems-development.md`

## Core Idea
Como **construir** sistemas seguros, não apenas analisá-los. Anderson sintetiza o livro num processo: **gestão de risco → lições da engenharia de segurança (safety) → priorização de metas → metodologia (top-down + iterativa) → gestão do time**. É o capítulo mais operacional: transforma princípios em prática de desenvolvimento (do threat modeling ao DevSecOps).

## Frameworks Introduced
- **Gestão de risco** como ponto de partida.
- Métodos da **engenharia de segurança (safety)**: hazard analysis, fault trees, FMEA, threat modelling.
- **Secure Development Lifecycle (SDL)** e desenvolvimento em fases com portões ("gated development").
- DevOps → **DevSecOps**; ciclo de vulnerabilidades.
- Gestão de **times de engenharia** (elite, diversidade, cultura).

## Key Concepts
- **Gestão de risco**: identificar, avaliar e priorizar riscos (probabilidade × impacto) — e aceitar conscientemente o residual.
- **Lições da engenharia de safety**:
  - **Metodologias de safety engineering** maduras (aviação, nuclear) — aplicar à segurança.
  - **Hazard analysis**: identificar perigos antes do design.
  - **Fault trees e threat trees**: decompor como uma falha/ataque acontece (top-down lógico).
  - **FMEA (Failure Modes and Effects Analysis)**: o que acontece se cada componente falhar.
  - **Threat modelling**: o equivalente de segurança (modelar o atacante, não só a falha acidental).
  - **Quantificar riscos**: difícil e frequentemente enganoso — use com humildade.
- **Priorizar metas de proteção**: nem tudo é igualmente crítico; decida o que proteger primeiro (confidencialidade vs. integridade vs. disponibilidade por ativo).
- **Metodologia**:
  - **Top-down design**: especificar política e arquitetura antes de codificar (a favor do SDD!).
  - **Iterativo: do espiral ao ágil**: equilibrar rigor com velocidade.
  - **Secure development lifecycle**: requisitos de segurança, design seguro, codificação segura, teste, deploy, operação.
  - **Gated development**: critérios de entrada/saída em cada fase — não avança sem cumprir os requisitos.
  - **Software as a Service (SaaS)**: segurança contínua pós-deploy (o software nunca "termina").
  - **DevOps → DevSecOps**: segurança embutida no pipeline (não um time separado no fim).
  - **O ciclo de vulnerabilidades**: descoberta → disclosure → patch → exploit — gerencie a velocidade.
  - **Má gestão organizacional do risco**: quando a cultura/gerência trata segurança como custo e não como requisito.
- **Gestão do time**:
  - **Elite engineers**: poucos engenheiros excepcionais têm impacto desproporcional — recrute/retém.
  - **Diversidade**: times diversos acham mais bugs e melhores soluções (variação de perspectivas).
  - **Nutrir habilidades e atitudes**: treino, segurança como valor, blameless postmortems.
  - **Propriedades emergentes**: segurança surge da interação do time/processo — não é só checklist.
  - **Evoluir o workflow**: melhorar o processo continuamente (retrospectivas, métricas).

## Mental Models
- **Segurança é um processo, não um produto**: começa na especificação e continua na operação.
- **"Safety" e "security" aprendem um com o outro**: a engenharia de safety (aviação/nuclear) tem décadas de metodologia; segurança cibernética deve importar (hazard analysis, gates) — e vice-versa.
- **Threat modeling é o coração**: se você não modelou o atacante, você está adivinhando.
- **Rigor no começo (especificação) paga mais que testes no fim** — ideias alinhadas ao Spec-Driven Development.
- **A cultura do time decide**: elitos, diversidade e blameless learning produzem sistemas mais seguros que qualquer ferramenta.
- **Tudo que é "terminado" está desatualizado**: SaaS/DevSecOps reconhece que segurança é contínua.

## Anti-patterns
- **Security como fase final** (testar no fim) em vez de requisito desde a especificação.
- Sem **gates** — avançar com débitos de segurança conhecidos.
- **Threat modeling** feito uma vez e esquecido (desatualiza).
- Confiar em **quantificação precisa de risco** como se fosse ciência exata.
- Cultura de **culpa** que esconde bugs e impede aprendizado.
- Times homogêneos e sem diversidade (menos perspectivas = mais pontos cegos).

## Worked Example
**Adicionar uma feature sensível (ex.: pagamento) num app ágil**: (1) threat modeling rápido (quem ataca: fraude, insider, malware do usuário); (2) metas priorizadas (integridade do ledger + autenticação forte); (3) design top-down com o modelo de dados seguro (Clark-Wilson-like); (4) **gate**: revisão de segurança + testes obrigatórios antes do merge; (5) DevSecOps: SAST/DAST no CI, dependências escaneadas; (6) pós-deploy: monitoramento, plano de resposta, ciclo de patch. Cada etapa pequena, contínua — segurança embutida, não empilhada no fim.

## Key Takeaways
1. **Risco + threat modeling + priorização** antes de codificar.
2. Importe métodos de **safety** (hazard/FTA/FMEA) e use **gated development**.
3. Segurança é **contínua** (DevSecOps, ciclo de vulnerabilidades), não fase final.
4. **Cultura do time** (elite, diversidade, sem culpa) é um controle de segurança real.

## Connects To
- Cap. 1 (framework) — de onde parte o processo.
- Cap. 28 (assurance) — como garantir que o processo funcionou.
- Cap. 8 (economia) — organização e incentivos internos.
