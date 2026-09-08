---
name: skillsecurityeng
description: Engenharia de Segurança aplicada ao projetar, construir e operar sistemas distribuídos confiáveis — ameaças, adversários, criptografia, controle de acesso, protocolos, economia da segurança, casos reais (bancos, ATM, telefones, DRM, vigilância) e desenvolvimento seguro. Use quando precisar modelar ameaças, escolher controles, desenhar protocolos/sistemas de pagamento ou autenticação, ou decidir trade-offs de segurança com base nos princípios de Ross Anderson (Security Engineering, 3ª ed.).
---

# Security Engineering (seceng)

Essência do livro **Security Engineering: A Guide to Building Dependable Distributed Systems** (Ross Anderson, 3ª edição). Foco: **pensar como engenheiro de segurança** — começar pelo adversário e pelo modelo de ameaça, não pela tecnologia.

## How to Use

1. **Antes de desenhar algo**: consulte `chapters/ch01-what-is-security-engineering.md` (framework) e `chapters/ch02-who-is-the-opponent.md` (adversários). Defina: *o que você protege, contra quem, com que consequências*.
2. **Escolha o domínio**: pagamentos/contabilidade (`ch12`), acesso/OS (`ch06`), cripto (`ch05`, `ch20`), redes/ataque (`ch21`), aplicações (`ch03`, `ch27`), etc. — use o Chapter Index abaixo.
3. **Aplique o processo do cap. 27** (desenvolvimento seguro): ameaça → metas de proteção priorizadas → design top-down/iterativo → garantia contínua.
4. **Controle os custos**: use `cheatsheet.md` para lembretes rápidos e `patterns.md` para padrões reutilizáveis.
5. **Não confie em caixas-pretas**: verifique os modelos mentais em `glossary.md` (dependability, adversário, custodiante de risco, etc.).

## Core Frameworks

- **Framework de engenharia de segurança** (cap. 1): política de segurança → modelo de ameaça → mecanismos → garantia.
- **Modelos de adversário** (cap. 2): espiões, criminosos, geeks, "o pântano" (hacktivistas, abuso) — cada um com recursos, objetivos e persistência distintos.
- **Modelos de política**: Bell-LaPadula/Biba (MLS, cap. 9), Clark-Wilson (integridade contábil, cap. 12), BMA (saúde, cap. 10), Chinese Wall (conflito de interesse).
- **Economia da segurança** (cap. 8): quem paga, quem sofre, quem decide — externalidades, lock-in, "risk dumping".
- **Ciclo de vida de desenvolvimento seguro** (cap. 27) e **garantia/avaliação** (cap. 28).
- **"Engenharia inversa" de ataques reais**: caixas eletrônicos (cap. 12), DRM (cap. 24), telefones (cap. 22), side channels (cap. 19), tamper resistance (cap. 18).

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | What Is Security Engineering? | `chapters/ch01-what-is-security-engineering.md` |
| 2 | Who Is the Opponent? | `chapters/ch02-who-is-the-opponent.md` |
| 3 | Psychology and Usability | `chapters/ch03-psychology-and-usability.md` |
| 4 | Protocols | `chapters/ch04-protocols.md` |
| 5 | Cryptography | `chapters/ch05-cryptography.md` |
| 6 | Access Control | `chapters/ch06-access-control.md` |
| 7 | Distributed Systems | `chapters/ch07-distributed-systems.md` |
| 8 | Economics | `chapters/ch08-economics.md` |
| 9 | Multilevel Security | `chapters/ch09-multilevel-security.md` |
| 10 | Boundaries | `chapters/ch10-boundaries.md` |
| 11 | Inference Control | `chapters/ch11-inference-control.md` |
| 12 | Banking and Bookkeeping | `chapters/ch12-banking-and-bookkeeping.md` |
| 13 | Locks and Alarms | `chapters/ch13-locks-and-alarms.md` |
| 14 | Monitoring and Metering | `chapters/ch14-monitoring-and-metering.md` |
| 15 | Nuclear Command and Control | `chapters/ch15-nuclear-command-and-control.md` |
| 16 | Security Printing and Seals | `chapters/ch16-security-printing-and-seals.md` |
| 17 | Biometrics | `chapters/ch17-biometrics.md` |
| 18 | Tamper Resistance | `chapters/ch18-tamper-resistance.md` |
| 19 | Side Channels | `chapters/ch19-side-channels.md` |
| 20 | Advanced Cryptographic Engineering | `chapters/ch20-advanced-cryptographic-engineering.md` |
| 21 | Network Attack and Defence | `chapters/ch21-network-attack-and-defence.md` |
| 22 | Phones | `chapters/ch22-phones.md` |
| 23 | Electronic and Information Warfare | `chapters/ch23-electronic-and-information-warfare.md` |
| 24 | Copyright and DRM | `chapters/ch24-copyright-and-drm.md` |
| 25 | Taking Stock | `chapters/ch25-taking-stock.md` |
| 26 | Surveillance or Privacy? | `chapters/ch26-surveillance-or-privacy.md` |
| 27 | Secure Systems Development | `chapters/ch27-secure-systems-development.md` |
| 28 | Assurance and Sustainability | `chapters/ch28-assurance-and-sustainability.md` |
| 29 | Beyond "Computer Says No" | `chapters/ch29-beyond-computer-says-no.md` |

## Topic Index

- **Começar / fundamentos**: caps. 1, 2, 27
- **Criptografia**: caps. 4, 5, 20
- **Controle de acesso / SO**: caps. 6, 9, 10
- **Sistemas distribuídos / redes**: caps. 7, 21
- **Economia / incentivos**: cap. 8 (transversal)
- **Pagamentos / contabilidade**: cap. 12
- **Físico / hardware**: caps. 13, 14, 16, 18, 19
- **Biometria**: cap. 17
- **Aplicações / humano**: caps. 3, 22, 25
- **Sociedade / vigilância**: caps. 23, 24, 26, 29

## Supporting Files

- `chapters/ch01..ch29-*.md` — conteúdo por capítulo.
- `glossary.md` — termos e modelos mentais essenciais.
- `patterns.md` — padrões de engenharia de segurança reutilizáveis.
- `cheatsheet.md` — checklist rápido de projeto seguro.

## Scope & Limits

- Síntese da 3ª edição (2020) para **estudo e aplicação**; não substitui o livro nem manuais de referência normativos.
- Detalhes numéricos, tabelas e especificações exatas devem ser conferidos na fonte (o método de extração técnico limita a fidelidade de código/tabelas).
- Uso **privado/local** — obra de terceiros protegida por direitos autorais; não publique este material derivado.
- Relaciona-se com: skills de criptografia/DevSecOps e com a metodologia Spec-Driven Development (SDD) para aplicação prática no desenvolvimento de sistemas.
