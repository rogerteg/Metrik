# Implementation Plan: Reconciliação Documental de Artefatos e Governança (Fase 2 do Roadmap)

**Branch**: `050-artifact-governance-reconciliation` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/050-artifact-governance-reconciliation/spec.md`

---

## Summary

Executar a **Fase 2 do Roadmap Estratégico** do Metrik (`specs/043-system-health-and-roadmap/vision.md`), reconciliando a governança documental e a integridade de repositório nas oportunidades **OPP-010 a OPP-017**:
1. Reconciliar o estado declarado de todas as 32 especificações de funcionalidades entregues (`specs/*/spec.md`) segundo o critério formal FR-024, adotando o padrão canônico obrigatório `**Status**: Implemented & Verified (<data-ratificação>)`.
2. Substituir integralmente os 3 marcadores `[NEEDS CLARIFICATION]` na especificação `specs/023-team-access-control/spec.md` pelas decisões ratificadas no Artigo VIII da Constituição.
3. Formalizar as 55 tarefas históricas de `specs/005` a `specs/009` (`tasks.md`), marcando todas como concluídas (`- [x]`) sob cabeçalho declaratório de entrega na `v0.1.0`.
4. Higienizar com segurança (`git branch -d`) as 14 ramificações locais e tentar a poda das 3 ramificações remotas 100% mescladas em `main` (`git branch --merged main`).
5. Auditar os checklists de domínio em `specs/*/checklists/*.md`, classificando cada item como verificado ou com cláusula formal de bloqueio de ambiente.
6. Criar a trava de teste automatizada `tests/unit/documentaryGovernance.test.ts` para blindar a linha principal contra regressões documentais.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 18+ (com PowerShell 7+ para scripts de automação e inspeção de repositório).

**Primary Dependencies**: Vitest 2.1+, Git 2.30+; zero novas dependências no `package.json` (Constituição Artigo V - YAGNI).

**Storage**: Arquivos estáticos em Markdown (`specs/**/*.md`) e referências locais/remotas de controle de versão Git.

**Testing**: Vitest (`npx vitest run tests/unit/documentaryGovernance.test.ts`), integrado ao `npm test`.

**Target Platform**: Execução local no ambiente de desenvolvimento (Windows 11 / PowerShell) e no pipeline de CI/CD do GitHub Actions.

**Project Type**: Governança Documental, Higienização de Repositório e Garantia de Qualidade de Artefatos (Spec-Driven Development).

**Performance Goals**: Execução das varreduras de auditoria e testes de governança em tempo inferior a 2 segundos; build de produção e tempo de teste inalterados.

**Constraints**:
- Zero alterações em código de produto (`src/**/*.ts*`);
- Preservação estrita dos 744 testes automatizados em 125 arquivos;
- Zero uso de `git branch -D` forçado (apenas exclusão segura `-d` de branches comprovadamente mescladas em `main`);
- Conformidade total com a Constituição do Metrik v1.7.0.

**Scale/Scope**:
- 50 diretórios de especificações (`specs/001` a `specs/050`);
- 14 ramificações locais e 3 remotas no Git;
- 11 arquivos de checklist em `specs/*/checklists/*.md`;
- 5 arquivos legados de tarefas com 55 itens.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Análise de Conformidade | Status |
|---|---|---|
| **I. Spec-Driven Development** | A reconciliação restaura a verdade ontológica entre especificações e código entregue na linha principal. | ✅ APROVADO |
| **II. Code Quality & Modularity** | A trava de governança documental isola asserções em módulo de teste dedicado (`tests/unit/documentaryGovernance.test.ts`). | ✅ APROVADO |
| **III. Automated Verification & Testing** | A conformidade de 100% dos artefatos reconciliados é comprovada por teste automatizado executável no Vitest, sem inspeção manual. | ✅ APROVADO |
| **IV. Observability & Structured Logging** | Erros de formato documental reportam mensagens explícitas com caminho do arquivo e regra violada usando o prefixo `[Metrik Guard]`. | ✅ APROVADO |
| **V. Simplicity & YAGNI** | Zero dependências adicionadas; scripts utilizam utilitários nativos do Node/TypeScript e Git. | ✅ APROVADO |
| **VI. Analytical Reasoning Pre-Task** | As tarefas serão estruturadas estritamente após a formulação dos 6 Modelos de Raciocínio Analítico na fase `/speckit-tasks`. | ✅ APROVADO |
| **VII. Brand Independence & Clean Identity** | Padronização e termos de domínio estritamente alinhados à identidade proprietária do Metrik. | ✅ APROVADO |
| **VIII. Local-First Sovereignty & TBAC** | Os esclarecimentos inseridos na spec 023 reafirmam a soberania local-first, o isolamento por squad e o perfil convidado como somente-leitura. | ✅ APROVADO |
| **IX. User Data Integrity & Draft Protection** | Nenhuma alteração afeta a persistência ou proteções de rascunho de tarefas do usuário. | ✅ APROVADO |

---

## Project Structure

### Documentation (this feature)

```text
specs/050-artifact-governance-reconciliation/
├── spec.md              # Especificação formal clarificada (/speckit-specify e /speckit-clarify)
├── plan.md              # Este plano de implementação técnica (/speckit-plan)
├── research.md          # Pesquisa técnica e decisões arquiteturais D1 a D6
├── data-model.md        # Modelagem de dados e diagramas de governança documental
├── quickstart.md        # Guia de validação rápida ponta a ponta
├── contracts/           # Contratos formais em JSON Schema
│   ├── spec-header-contract.json
│   └── governance-audit-report-contract.json
├── checklists/          # Checklists de qualidade
│   └── requirements.md
└── tasks.md             # Tarefas atômicas de execução (/speckit-tasks)
```

### Source Code (repository root)

```text
specs/
├── 001-core-kanban-board/spec.md                # Atualização para Implemented & Verified
├── ...                                          # Atualização de specs 001 a 042 e 044 a 047
├── 005-column-management/tasks.md               # Reconciliação histórica (- [x])
├── ...                                          # Reconciliação histórica 006 a 009
├── 023-team-access-control/spec.md              # Remoção dos 3 marcadores [NEEDS CLARIFICATION]
├── 026-cross-browser-column-layout/checklists/  # Registro de Bloqueio de Ambiente
└── 043-system-health-and-roadmap/vision.md      # Promoção de OPP-010..017 a Resolvidas

tests/
└── unit/
    └── documentaryGovernance.test.ts            # Nova trava executável de governança documental
```

**Structure Decision**: Não há novos arquivos criados em `src/`; a implementação concentra-se em reconciliações documentais nos diretórios existentes de `specs/` e na nova trava de teste automatizado em `tests/unit/`.

---

## Complexity Tracking

> *Zero violações constitucionais. Nenhuma complexidade acidental introduzida.*

| Violação | Justificativa | Alternativa Mais Simples Rejeitada |
|---|---|---|
| *Nenhuma* | *N/A* | *N/A* |

---

## Phases & Execution Strategy

- **Fase 1: Preparação e Trava TDD Red-Bar**:
  - Implementar `tests/unit/documentaryGovernance.test.ts` asserindo as 5 condições da Fase 2 do Roadmap (falha inicialmente nas pendências atuais).
- **Fase 2: Reconciliação do Estado das Especificações (OPP-010)**:
  - Atualizar o cabeçalho de todas as especificações entregues para `**Status**: Implemented & Verified (2026-10-21)`.
- **Fase 3: Resolução dos Marcadores da Spec 023 (OPP-011)**:
  - Substituir os 3 marcadores `[NEEDS CLARIFICATION]` na spec 023 pelas decisões da Constituição Artigo VIII.
- **Fase 4: Formalização de Tarefas Legadas (OPP-012)**:
  - Marcar as 55 tarefas de `specs/005` a `specs/009` como `- [x]` com aviso formal de conclusão histórica.
- **Fase 5: Auditoria e Resolução de Checklists (OPP-017)**:
  - Auditar e classificar os 11 arquivos de checklist em `specs/*/checklists/*.md`.
- **Fase 6: Higienização de Ramificações Integradas (OPP-013)**:
  - Remover com segurança as 14 ramificações locais com `git branch -d` e tentar a deleção das 3 remotas.
- **Fase 7: Verificação Green-Bar e Atualização da Visão**:
  - Rodar `npx vitest run tests/unit/documentaryGovernance.test.ts` (Green Bar).
  - Executar a suíte completa (`npm test` 100% verde).
  - Atualizar a tabela de oportunidades no `vision.md` (§4.3) promovendo OPP-010 a OPP-017 a resolvidas.
