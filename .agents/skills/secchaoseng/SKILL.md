---
name: secchaoseng
description: Security Chaos Engineering (SCE) aplicado a sustentar resiliência de software e sistemas — resiliência em sistemas complexos, pensamento sistêmico em segurança, design/construção/operação/resposta, plataforma de segurança, e experimentação de caos de segurança (hipóteses, EMPAK, game days) com base nos princípios de Kelly Shortridge e Aaron Rinehart (O'Reilly). Use quando precisar desenhar um programa de segurança moderno, avaliar/melhorar a resiliência de sistemas, conduzir experimentos de segurança, ou decidir trade-offs de segurança em cada fase da entrega de software.
---

# Security Chaos Engineering (secchaoseng)

Essência de **Security Chaos Engineering: Sustaining Resilience in Software and Systems** (Kelly Shortridge, com Aaron Rinehart, O'Reilly 2023). Foco: transformar segurança de "rituais performáticos" para **resiliência orientada por empirismo** — aceitar que a falha acontece, refinar modelos mentais dos sistemas e **experimentar** para verificar como o sistema realmente se comporta sob adversidade.

## How to Use

1. **Antes de tudo**: leia `chapters/ch01-resilience-in-software-and-systems.md` (o que é resiliência) e `chapters/ch02-systems-oriented-security.md` (mental models + avaliação). Pergunte: *qual a funcionalidade crítica? quais os safety boundaries? como o sistema falha?*
2. **Pela fase de entrega**: use os cap. 3–6 como guia de referência (arquitetar/desenhar → construir/entregar → operar/observar → responder/recuperar).
3. **Para desenhar soluções de segurança como produto**: cap. 7 (platform resilience engineering, Ice Cream Cone Hierarchy).
4. **Para experimentar de verdade**: cap. 8 (método científico, EMPAK, hypothesis design) e cap. 9 (case studies reais).
5. **Checklist rápido**: `cheatsheet.md` (regras de decisão) e `patterns.md` (padrões reutilizáveis).

## Core Frameworks

- **Resiliência ≠ robustez** (cap. 1): resiliência é a *capacidade de se recuperar e se adaptar* (é um verbo), não de resistir sem mudar. Inclui funcionalidade crítica, safety boundaries, interações no espaço-tempo, feedback loops e flexibilidade.
- **E&E Resilience Assessment** (cap. 2): duas fases — **Evaluation (Tier 1)**: mapear fluxos → funcionalidade crítica, documentar premissas de safety boundaries, usar "attacker math" (árvores de decisão); **Experimentation (Tier 2)**: validar por experimentos, girando a "feedback flywheel".
- **Fail-safe vs. safe-to-fail** (cap. 2): em sistemas complexos, não basta falhar com segurança — é preciso **falhar com segurança e aprender**.
- **SCE vs. security theater** (cap. 2): compliance/checklists criam a ilusão de segurança; SCE busca evidência empírica.
- **RAVE** (cap. 2): Repeatability, Accessibility, Variability — como tornar a segurança acionável para engenheiros.
- **Eixos de design resiliente** (cap. 3): **coupling** (acoplamento) e **complexity** (complexidade) — reduzir ambos; **linearity**; preservar possibilidades.
- **Os 5 "raw materials" e teste vs. experimentação** (cap. 4): "boring technology is resilient technology", standardization, CI/CD com segurança automatizada, config as code, fault injection, test theater.
- **Operar e observar** (cap. 5): DORA metrics, SLOs, **confidence-based security**, **attack observability** (observabilidade como o atacante vê).
- **Responder e recuperar** (cap. 6): combater **action bias, hindsight bias, outcome bias, just-world hypothesis**; **blameless culture**; não culpar "human error".
- **Ice Cream Cone Hierarchy of Security Solutions** (cap. 7): preferir eliminar o perigo no design → substituir por métodos menos perigosos → guardas/safety devices → avisos → controles administrativos/treino. **Control strategy vs. resilience strategy**.
- **Experimento de segurança (cap. 8)**: método científico + **EMPAK loop** (Execute, Monitor, Plan, Analyze, Knowledge); hipóteses falsificáveis; experiment design specs; evidence collection; game days.

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Resilience in Software and Systems | `chapters/ch01-resilience-in-software-and-systems.md` |
| 2 | Systems-Oriented Security | `chapters/ch02-systems-oriented-security.md` |
| 3 | Architecting and Designing | `chapters/ch03-architecting-and-designing.md` |
| 4 | Building and Delivering | `chapters/ch04-building-and-delivering.md` |
| 5 | Operating and Observing | `chapters/ch05-operating-and-observing.md` |
| 6 | Responding and Recovering | `chapters/ch06-responding-and-recovering.md` |
| 7 | Platform Resilience Engineering | `chapters/ch07-platform-resilience-engineering.md` |
| 8 | Security Chaos Experiments | `chapters/ch08-security-chaos-experiments.md` |
| 9 | Security Chaos Engineering in the Wild | `chapters/ch09-security-chaos-engineering-in-the-wild.md` |

## Topic Index

- **Resiliência / sistemas complexos** → ch01, ch02
- **Avaliação de resiliência (E&E, Tiers 1–2)** → ch02
- **Mental models / attackers exploiting models** → ch02, ch03
- **Falha / safety boundaries / safe-to-fail** → ch01, ch02
- **Coupling & complexity & linearity** → ch03
- **Design / arquitectura de segurança** → ch03, ch07
- **CI/CD, config as code, supply chain, testes** → ch04
- **Observabilidade, DORA, SLO, attack observability** → ch05
- **Incident response, biases, blameless, postmortem** → ch06
- **Platform engineering, Ice Cream Cone, threat modeling como serviço** → ch07
- **Experimentos, hipóteses, EMPAK, game days, fault injection** → ch04, ch08
- **Casos reais (UnitedHealth, Verizon, Capital One...)** → ch09
- **Security theater / compliance** → ch02

## Supporting Files

- `glossary.md` — termos e modelos mentais essenciais.
- `patterns.md` — padrões e técnicas reutilizáveis.
- `cheatsheet.md` — regras de decisão e checklists rápidos.

## Scope & Limits

- Síntese da 1ª edição (O'Reilly, 2023) para **estudo e aplicação**; não substitui o livro.
- O livro não prescreve ferramentas específicas nem código passo a passo — foca princípios/práticas/trade-offs; detalhes numéricos e figuras devem ser conferidos na fonte (extração técnica tem fidelidade limitada para tabelas/figuras; o livro contém muitas ilustrações e figuras que não foram lidas).
- Uso **privado/local** — obra de terceiros protegida por direitos autorais; não publique este material derivado.
- Relaciona-se com: `seceng` (engenharia de segurança), `clean-code` (qualidade de código) e SDD (desenvolvimento guiado por especificação) para aplicação prática.
