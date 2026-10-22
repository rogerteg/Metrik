# Tasks: Reconciliação Documental de Artefatos e Governança (Fase 2 do Roadmap)

**Feature**: `050-artifact-governance-reconciliation`  
**Date**: 2026-10-21  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Status**: Ready for Implementation  

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição Artigo VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdade Fundamental Irredutível:** No desenvolvimento orientado por especificações (Spec-Driven Development), a especificação é o contrato executável vivo que precede e valida o software. Declarar `Draft` para código em produção falseia o estado do sistema, enquanto manter tarefas desmarcadas (`- [ ]`) em funcionalidades entregues gera falso sinal de débito não resolvido.
- **Invariante Computacional de Entrega (FR-024):** Uma funcionalidade só é considerada entregue se, e somente se, satisfaz cumulativamente:
  $$\text{Entrega Válida} \iff \text{Código presente na branch } main \land \text{Citada no } CHANGELOG.md$$
- **Invariante de Integridade do Git:** Uma ramificação de trabalho só pode ser removida com segurança se todos os seus commits forem alcançáveis a partir de `HEAD` (`git branch --merged main`). A deleção forçada (`-D`) é terminantemente proibida.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modo de Falha 1: Deleção acidental de trabalho não integrado no Git.**  
  *Mitigação*: Proibir estritamente o uso de `-D`. Todas as exclusões locais usam exclusivamente `git branch -d`, que falha de forma determinística caso haja commit descolado.
- **Modo de Falha 2: Falsificação de status em funcionalidades em andamento.**  
  *Mitigação*: Restringir a mutação de status às listas explicitamente auditadas (`001` a `042` e `044` a `047`). As especificações `048`, `049` e `050` permanecem intocadas em `Draft`.
- **Modo de Falha 3: Quebra de formatação ou perda de encoding em arquivos Markdown no Windows.**  
  *Mitigação*: Scripts e substituições devem operar com codificação estrita UTF-8 sem BOM, preservando a sintaxe de listas e cabeçalhos.
- **Modo de Falha 4: Bloqueio do fluxo de execução por falha de autenticação na poda remota.**  
  *Mitigação*: A deleção remota é tratada como opcional com fallback gracioso: se `git push origin --delete` for recusado pelo servidor remoto, o comando gera instruções de poda para o mantenedor e prossegue com `git fetch --prune`.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME):**  
  - US1 atua exclusivamente sobre os arquivos `specs/*/spec.md` (campo `Status`).
  - US2 atua exclusivamente sobre `specs/023-team-access-control/spec.md` (marcadores `[NEEDS CLARIFICATION]`).
  - US3 atua exclusivamente sobre os arquivos de tarefas legados `specs/005` a `specs/009` (`tasks.md`).
  - US4 atua exclusivamente sobre os arquivos `specs/*/checklists/*.md`.
  - US5 atua exclusivamente sobre as ramificações locais e remotas do Git.
- **Coletivamente Exaustivas (CE):**  
  - 100% dos requisitos funcionais (FR-001 a FR-012) e critérios mensuráveis (SC-001 a SC-007) possuem tarefas correspondentes, cobrindo integralmente as 5 oportunidades da Fase 2 do Roadmap (OPP-010, OPP-011, OPP-012, OPP-013, OPP-017).

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Decisão A: Formato de Status:** Poda de formatos mistos (`Completed`, `Implemented`). Adotado o formato canônico obrigatório `**Status**: Implemented & Verified (<data-ratificação>)`, permitindo testes determinísticos com regex estrito.
- **Decisão B: Tarefas Legadas:** Poda da deleção física de arquivos `tasks.md` (viola rastreabilidade) e da manutenção de checkboxes em branco (polui scanners). Adotada a marcação `- [x]` com cabeçalho de ratificação histórica na v0.1.0.
- **Decisão C: Checklists de Motores de Navegador:** Poda de marcação fictícia sem teste no host. Adotada a declaração explícita de Bloqueio de Ambiente conforme os Artigos III e IV da Constituição.

### 5. Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)
- **Falha Demonstrável (Red Bar):** A suíte `tests/unit/documentaryGovernance.test.ts` deve ser criada na Fase 1 e falhar imediatamente no estado atual do repositório, detectando as 32 specs com status divergente, os 3 marcadores da spec 023, as 55 tarefas legadas pendentes e as 14 branches locais mescladas.
- **Critério Determinístico de Aceite (Green Bar):** Todas as asserções da suíte de teste passam com 100% de sucesso após as reconciliações, e `npm test` mantém 744+ casos verdes sem nenhuma regressão.

### 6. Triangulação Adversarial & Conformidade Constitucional (*Polygraph Verification*)
- **YAGNI (Artigo V):** Zero adições ao `package.json`. Nenhum framework ou biblioteca de terceiros é adicionada.
- **Isolamento de Código (Artigo II):** Zero alterações em arquivos `src/`. O código de produto permanece imutável.
- **Verificação Automatizada (Artigo III):** A conformidade não depende de inspeção manual; é comprovada via `documentaryGovernance.test.ts`.
- **Identidade e TBAC (Artigos VII e VIII):** Resoluções da spec 023 reafirmam soberania local-first e perfil convidado somente-leitura.

---

## Phase 1: Setup & TDD Red-Bar Base

**Purpose**: Criação da infraestrutura de teste automatizado e validação do estado inicial falhante (Red Bar).

- [x] T001 Criar o arquivo de teste automatizado de governança `tests/unit/documentaryGovernance.test.ts` asserindo as 5 condições da Fase 2 do Roadmap (falha inicial esperada).
- [x] T002 [P] Validar os contratos de cabeçalho e auditoria em `specs/050-artifact-governance-reconciliation/contracts/spec-header-contract.json` e `contracts/governance-audit-report-contract.json`.
- [x] T003 Executar a suíte de teste via `npx vitest run tests/unit/documentaryGovernance.test.ts` comprovando a falha Red Bar determinística no estado atual.

---

## Phase 2: Foundational (Automação de Reconciliação)

**Purpose**: Utilitários auxiliares de manipulação determinística de Markdown e Git.

- [x] T004 Criar o script auxiliar de validação e reconciliação em lote `scripts/reconcile-governance.ps1` com suporte a UTF-8 e chamadas seguras ao Git.

---

## Phase 3: User Story 1 - Reconciliação do Estado Declarado das Especificações (OPP-010)

**Goal**: Atualizar o cabeçalho de todas as especificações funcionais entregues para o padrão canônico obrigatório `**Status**: Implemented & Verified (2026-10-21)` segundo o critério FR-024.

**Independent Test**: Executar a asserção `specs-status-compliance` em `tests/unit/documentaryGovernance.test.ts`, validando 100% de conformidade nas specs 001..042 e 044..047.

- [x] T005 [US1] Inserir o cabeçalho padronizado `**Status**: Implemented & Verified (2026-10-21)` nas especificações sem cabeçalho `specs/005-column-management/spec.md` a `specs/010-multi-board/spec.md`.
- [x] T006 [US1] Inserir o cabeçalho padronizado `**Status**: Implemented & Verified (2026-10-21)` nas especificações sem cabeçalho `specs/011-cumulative-flow-diagram/spec.md` a `specs/015-visual-governance-and-dynamic-cfd/spec.md`.
- [x] T007 [P] [US1] Atualizar o campo `Status` para `Implemented & Verified (2026-10-21)` nas especificações `specs/001-core-kanban-board/spec.md` a `specs/004-tags-and-priority-filters/spec.md`.
- [x] T008 [P] [US1] Atualizar o campo `Status` para `Implemented & Verified (2026-10-21)` nas especificações `specs/016-clean-board-layout-minimalist/spec.md` a `specs/020-wip-aging-chart/spec.md`.
- [x] T009 [P] [US1] Atualizar o campo `Status` para `Implemented & Verified (2026-10-21)` nas especificações `specs/021-throughput-histogram-timeline/spec.md` a `specs/030-categorized-flow-analytics/spec.md`.
- [x] T010 [P] [US1] Atualizar o campo `Status` para `Implemented & Verified (2026-10-21)` nas especificações `specs/031-premium-board-management/spec.md` a `specs/042-sprint-burnup/spec.md`.
- [x] T011 [US1] Validar que as especificações `specs/048-mika-ai-flow-copilot/spec.md`, `specs/049-modular-decomposition/spec.md` e `specs/050-artifact-governance-reconciliation/spec.md` permanecem em `Draft`.

**Checkpoint**: Todas as especificações de funcionalidades entregues no produto declaram o status canônico auditável.

---

## Phase 4: User Story 2 - Resolução de Marcadores da Spec 023 (OPP-011)

**Goal**: Eliminar integralmente os 3 marcadores `[NEEDS CLARIFICATION]` da especificação `specs/023-team-access-control/spec.md`, substituindo-os pelas regras soberanas da Constituição Artigo VIII.

**Independent Test**: Executar a asserção `spec-023-clarifications-resolved` em `tests/unit/documentaryGovernance.test.ts`, validando 0 ocorrências de `[NEEDS CLARIFICATION`.

- [x] T012 [US2] Substituir o marcador `[NEEDS CLARIFICATION: auth-mode ...]` no requisito FR-003 de `specs/023-team-access-control/spec.md` pela especificação mandatória de sessão local-first com chaveamento de perfis no `localStorage` (Constituição VIII.1/VIII.5).
- [x] T013 [US2] Substituir o marcador `[NEEDS CLARIFICATION: guest-permissions ...]` no requisito FR-008 de `specs/023-team-access-control/spec.md` pela definição de acesso estritamente somente-leitura para o papel guest (Constituição VIII.4).
- [x] T014 [US2] Substituir o marcador `[NEEDS CLARIFICATION: board-creation-scope ...]` no requisito FR-011 de `specs/023-team-access-control/spec.md` pelo vínculo mandatório a squads (Constituição VIII.2).
- [x] T015 [US2] Verificar que a contagem de tags `[NEEDS CLARIFICATION` em `specs/023-team-access-control/spec.md` é igual a 0.

**Checkpoint**: A especificação 023 está 100% clarificada e em total harmonia com a Constituição.

---

## Phase 5: User Story 3 - Formalização Histórica de Tarefas Legadas (OPP-012)

**Goal**: Reconciliar as 55 tarefas não marcadas nos arquivos de tarefas legados (`specs/005` a `specs/009`, `tasks.md`), marcando todas como concluídas (`- [x]`) sob aviso formal de conclusão histórica na v0.1.0.

**Independent Test**: Executar a asserção `legacy-tasks-resolved` em `tests/unit/documentaryGovernance.test.ts`, validando 0 checkboxes `- [ ]` nos 5 arquivos.

- [x] T016 [P] [US3] Reconciliar `specs/005-column-management/tasks.md` marcando todas as 12 tarefas como `- [x]` com aviso formal de conclusão histórica na v0.1.0.
- [x] T017 [P] [US3] Reconciliar `specs/006-data-portability/tasks.md` marcando todas as 10 tarefas como `- [x]` com aviso formal de conclusão histórica na v0.1.0.
- [x] T018 [P] [US3] Reconciliar `specs/007-task-details-modal/tasks.md` marcando todas as 11 tarefas como `- [x]` com aviso formal de conclusão histórica na v0.1.0.
- [x] T019 [P] [US3] Reconciliar `specs/008-analytics-dashboard/tasks.md` marcando todas as 11 tarefas como `- [x]` com aviso formal de conclusão histórica na v0.1.0.
- [x] T020 [P] [US3] Reconciliar `specs/009-due-dates/tasks.md` marcando todas as 11 tarefas como `- [x]` com aviso formal de conclusão histórica na v0.1.0.
- [x] T021 [US3] Validar que a contagem de tarefas em aberto (`- [ ]`) em `specs/00[5-9]-*/tasks.md` é exatamente zero.

**Checkpoint**: Nenhum scanner ou script detecta tarefas falsamente pendentes nas features 005 a 009.

---

## Phase 6: User Story 4 - Auditoria e Reconciliação de Checklists de Domínio (OPP-017)

**Goal**: Auditar e categorizar os itens de checklist em `specs/*/checklists/*.md`, marcando como verificados (`- [x]`) ou registrando Bloqueio de Ambiente formal.

**Independent Test**: Executar a asserção `checklists-audit-complete` em `tests/unit/documentaryGovernance.test.ts`.

- [x] T022 [US4] Auditar e reconciliar `specs/023-team-access-control/checklists/access-control.md` e `checklists/requirements.md` marcando itens atestados no código e nos testes unitários.
- [x] T023 [US4] Reconciliar `specs/026-cross-browser-column-layout/checklists/browser-parity.md` inserindo a cláusula formal de Bloqueio de Ambiente para motores WebKit não disponíveis no host.
- [x] T024 [P] [US4] Auditar e reconciliar `specs/027-card-subtasks-and-comments/checklists/subtasks-and-comments.md` e `specs/028-admin-menu-header-layout/checklists/header-layout-and-accessibility.md`.
- [x] T025 [P] [US4] Auditar e reconciliar `specs/031-premium-board-management/checklists/board-management.md` e `specs/032-task-comment-autosave/checklists/task-comment-autosave.md`.
- [x] T026 [P] [US4] Auditar e reconciliar `specs/034-enhanced-task-timeline/checklists/ux-and-audit.md`, `specs/035-clickup-task-activity-redesign/checklists/ux.md`, `specs/036-task-details-modal-redesign/checklists/ux.md` e `specs/037-task-details-activity-redesign/checklists/ux.md`.
- [x] T027 [US4] Auditar e ratificar formalmente o checklist do revisor `specs/043-system-health-and-roadmap/checklists/planning-readiness.md`.

**Checkpoint**: Zero checklists possuem itens em estado ambíguo sem resolução ou bloqueio documentado.

---

## Phase 7: User Story 5 - Limpeza e Higienização de Ramificações Git (OPP-013)

**Goal**: Remover com segurança as 14 ramificações locais e tentar a poda das 3 remotas 100% mescladas em `main`.

**Independent Test**: Executar `git branch --merged main` comprovando ausência de branches obsoletas.

- [x] T028 [US5] Executar a remoção segura (`git branch -d`) das 14 ramificações locais (`019`, `020`, `021`, `022`, `023`, `024`, `025`, `026`, `027`, `028`, `029`, `031`, `032`, `035`).
- [x] T029 [US5] Executar tentativa de deleção remota (`git push origin --delete origin/024 origin/029 origin/031`) com fallback para script de poda manual e sincronização via `git fetch --prune`.
- [x] T030 [US5] Validar com `git branch --merged main` que zero ramificações locais mescladas obsoletas permanecem ativas no repositório.

**Checkpoint**: Ambiente de trabalho Git higienizado sem ramificações residuais antigas.

---

## Phase 8: Polish & Verificação de Gates Globais

**Purpose**: Verificação final da suíte, ratificação da visão e garantia de zero regressões.

- [x] T031 [P] Atualizar a tabela de oportunidades no Documento de Visão `specs/043-system-health-and-roadmap/vision.md` (§4.3) promovendo OPP-010, OPP-011, OPP-012, OPP-013 e OPP-017 para resolvidas com data de encerramento.
- [x] T032 Executar a trava unitária `npx vitest run tests/unit/documentaryGovernance.test.ts` comprovando aprovação 100% verde (Green Bar).
- [x] T033 Executar a formatação estrita do repositório via `npm run format:check`.
- [x] T034 Executar o analisador estático via `npm run lint` assegurando 0 erros.
- [x] T035 Executar a suíte completa de testes do projeto via `npm test` assegurando 744+ casos verdes sem nenhuma regressão (Constituição Artigo III).

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup & Red-Bar)**: Sem dependências. Deve rodar primeiro para capturar o sinal vermelho.
- **Phase 2 (Foundational)**: Depende de Phase 1. Fornece scripts de automação.
- **Phase 3 (User Story 1)**: Depende de Phase 2. Reconcilia o estado das specs.
- **Phase 4 (User Story 2)**: Pode rodar em paralelo ou após Phase 3. Reconcilia a spec 023.
- **Phase 5 (User Story 3)**: Pode rodar em paralelo. Reconcilia as tarefas de specs 005..009.
- **Phase 6 (User Story 4)**: Pode rodar em paralelo. Reconcilia os checklists de domínio.
- **Phase 7 (User Story 5)**: Depende de estar na branch `main`. Executa a remoção segura Git.
- **Phase 8 (Polish & Gates)**: Depende da conclusão de todas as fases anteriores.

### Parallel Opportunities
- Tarefas marcadas com `[P]` (ex: T007 a T010 na US1, T016 a T020 na US3, T024 a T026 na US4) operam em arquivos completamente distintos e podem ser executadas em paralelo.
- User Stories 1, 2, 3 e 4 atuam em diretórios e arquivos isolados e são mutuamente exclusivas (MECE).

---

## Implementation Strategy (MVP & Incremental Delivery)

1. **MVP (Red-Bar Base + User Story 1)**: Estabelecer a trava de teste `documentaryGovernance.test.ts` e reconciliar o status das 32 specs entregues (OPP-010).
2. **Incremento 2 (User Stories 2 & 3)**: Eliminar os marcadores da spec 023 e formalizar o histórico de tarefas legadas (OPP-011, OPP-012).
3. **Incremento 3 (User Stories 4 & 5)**: Auditar os checklists e higienizar as ramificações Git (OPP-017, OPP-013).
4. **Encerramento**: Ratificar o Documento de Visão 043 e assegurar 100% de estabilidade na suíte global (`npm test`).
