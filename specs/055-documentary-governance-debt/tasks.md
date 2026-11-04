# Tasks: 055 — Governança Documental & Eliminação de Dívida Técnica

**Input**: Design documents from `specs/055-documentary-governance-debt/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/governance-audit-contracts.ts`, `quickstart.md`)  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`  
**Tests**: Automated governance test suite in Vitest (`tests/unit/documentaryGovernance.test.ts`).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdades fundamentais e invariantes:**
  - Uma especificação viva (*Living Specification - SDD*) é a única fonte de verdade autoritativa sobre o que o software faz e por que faz. Código presente na linha principal (`main`) com especificação declarada como `Draft` viola a integridade ontológica do projeto e quebra a rastreabilidade automatizada.
  - O rastreador de issues público no GitHub é a projeção transparente do histórico de entrega para colaboradores e auditores externos; saltos arbitrários na numeração (ausência de issues para a Feature 053 entre as features 052 e 054) configuram dívida de rastreabilidade.
  - O documento de visão e saúde do sistema (`specs/043/vision.md`) deve ser factual e reprodutível por medição determinística; dados desatualizados induzem decisões arquiteturais errôneas.
  - A conformidade documental não pode depender de disciplina voluntária: deve ser um gate bloqueante automatizado executado pelo Vitest (`npm test`).
- **Premissas acidentais descartadas:**
  - Descartada qualquer alteração no código de runtime da aplicação (componentes React, hooks de estado do Kanban ou utilitários de fluxo): esta feature atua exclusivamente sobre arquivos de governança, scripts de auditoria, testes sentinela e metadados.
  - Descartada a reescrita de cabeçalhos de especificações históricas já ratificadas (`specs/001` a `specs/042`, `044` a `047`, `051`, `052` e `054`): apenas especificações com divergência de status comprovada (`048`, `049`, `050`, `053` e `043`) são alvos de atualização.

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)
- **Cenários de falha antecipados:**
  - *Cenário 1 (Falso Positivo no Teste de Governança)*: O teste sentinela `documentaryGovernance.test.ts` falha ao encontrar a própria especificação ativa `specs/055-documentary-governance-debt` em estado `Draft` durante o desenvolvimento.
    - *Mitigação*: O teste sentinela deve filtrar explicitamente diretórios em desenvolvimento declarados em `.specify/feature.json` ou cujo número seja estritamente superior ao último número ratificado ($> 54$), garantindo que a feature em curso possa operar normalmente como `Draft` até sua ratificação final.
  - *Cenário 2 (Falha ou Limite de Taxa no GitHub API durante Criação em Lote)*: O script de criação de 34 issues atinge rate limit ou falha no meio do processo, deixando tarefas duplicadas ou incompletas.
    - *Mitigação*: Script defensivo que consulta as issues existentes antes de criar cada tarefa (`\bT\d{3,}\b`), pulando tarefas já registradas de forma idempotente.
  - *Cenário 3 (Regressão de Tamanho de Linhas - Constituição II)*: A expansão de `documentaryGovernance.test.ts` ultrapassar o teto constitucional de 400 linhas.
    - *Mitigação*: Modularização do teste com funções puras auxiliares e validação contínua via `moduleLineCountGuard.test.ts`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Duplicação):**
  - Fase 1 e 2: Definição de contratos e scripts auxiliares (infraestrutura de governança).
  - Fase 3 (US1): Reconciliação estrita dos arquivos `spec.md` e teste sentinela `documentaryGovernance.test.ts`.
  - Fase 4 (US2): Atualização factual exclusiva de `specs/043/vision.md` e `specs/043/spec.md`.
  - Fase 5 (US3): Execução e verificação da sincronização de issues no GitHub para a Feature 053.
  - Fase 6 (US4): Atualização exclusiva da memória viva (`lessons-learned.md` e `project-context.md`).
  - Fase 7: Polish e validação constitucional global.
- **Exaustão Coletiva (Cobertura 100%):**
  - Cobre 100% dos requisitos funcionais (FR-001 a FR-008), critérios de sucesso (SC-001 a SC-004) e clarificações da sessão de 2026-11-04.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Caminhos avaliados para o teste sentinela:**
  - *Opção 1 (Script bash/powershell isolado executado apenas manualmente)*: *Podada:* Scripts manuais são esquecidos e não impedem commits ou merges divergentes.
  - *Opção 2 (Teste unitário integrado ao Vitest `npm test`)*: *Escolhida:* Roda automaticamente no pipeline do desenvolvedor e no CI do GitHub Actions, tornando a conformidade constitucional incontornável.
- **Caminhos avaliados para as issues da Feature 053:**
  - *Opção 1 (Ignorar issues da Feature 053 por já estar concluída)*: *Podada:* Deixa um buraco de 34 tarefas na rastreabilidade pública do repositório, violando o princípio de transparência.
  - *Opção 2 (Criar e encerrar automaticamente com comentário de auditoria)*: *Escolhida:* Preserva a rastreabilidade sequencial com fidelidade histórica sem poluir o backlog aberto.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Executar `tests/unit/documentaryGovernance.test.ts` com asserção exigindo que `specs/053`, `specs/050`, `specs/049` e `specs/048` tenham status `Implemented & Verified`, comprovando a falha antes da edição dos cabeçalhos.
- **Critério determinístico de aceite (Green Bar):**
  - `documentaryGovernance.test.ts` passando com 100% de sucesso no Vitest após as correções.
  - 34 issues criadas e fechadas no GitHub via `gh issue list`.
  - 100% da suíte de 926+ testes verdes com zero regressões.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Artigo I (SDD)**: Restaura a conformidade documental de 100% das features entregues.
- **Artigo II (Modularidade)**: Arquivos mantidos rigorosamente $\le 400$ linhas.
- **Artigo III (Testes Automatizados)**: Teste automatizado atua como gate bloqueante contínuo.
- **Artigo IV (Sem Falhas Silenciosas)**: Logs estruturados e idempotência na sincronização de issues.
- **Artigo V (Simplicidade & YAGNI)**: Scripts Node/JS nativos sem dependências externas.
- **Artigo VII (Identidade de Marca)**: Zero nomes de concorrentes em qualquer título ou cabeçalho.
- **Artigo X (Governança & Aprendizados)**: Formalização durável de lições aprendidas em `.specify/memory/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação de contratos e ferramentas de auditoria

- [X] T001 Validar contratos de auditoria em `specs/055-documentary-governance-debt/contracts/governance-audit-contracts.ts` e modelos de dados em `specs/055-documentary-governance-debt/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários auxiliares de auditoria e sincronização de issues

- [X] T002 [P] Criar script utilitário de validação de cabeçalhos de especificação em `scripts/verify-spec-headers.mjs`
- [X] T003 [P] Criar script utilitário idempotente para sincronização das tarefas da Feature 053 no GitHub Issues em `scripts/sync-feature053-issues.mjs` com suporte a autenticação via GitHub CLI (`gh`)

---

## Phase 3: User Story 1 - Reconciliação do Status Canônico das Especificações Entregues (Priority: P1) 🎯 MVP

**Goal**: Garantir que 100% das especificações correspondentes a código ativo em `main` exibam `**Status**: Implemented & Verified (<data>)` e que o teste sentinela bloqueie divergências futuras.

**Independent Test**: Executar `npx vitest run tests/unit/documentaryGovernance.test.ts` e validar que todas as especificações de `specs/001` a `specs/054` são aprovadas com status canônico ratificado, e apenas `specs/055` permanece `Draft`.

### Tests for User Story 1 🧪

- [X] T004 [P] [US1] Atualizar teste de governança `tests/unit/documentaryGovernance.test.ts` com falha Red-Bar demonstrando a divergência de status nas especificações `specs/048`, `specs/049`, `specs/050` e `specs/053`

### Implementation for User Story 1

- [X] T005 [P] [US1] Atualizar cabeçalho da especificação `specs/053-flow-automation-policies/spec.md` para `**Status**: Implemented & Verified (2026-11-02)`
- [X] T006 [P] [US1] Atualizar cabeçalho da especificação `specs/050-artifact-governance-reconciliation/spec.md` para `**Status**: Implemented & Verified (2026-10-21)`
- [X] T007 [P] [US1] Atualizar cabeçalho da especificação `specs/049-modular-decomposition/spec.md` para `**Status**: Implemented & Verified (2026-10-21)`
- [X] T008 [P] [US1] Atualizar cabeçalho da especificação `specs/048-mika-ai-flow-copilot/spec.md` para `**Status**: Implemented & Verified (2026-10-21)`
- [X] T009 [US1] Refatorar asserção em `tests/unit/documentaryGovernance.test.ts` para atuar como gate dinâmico e bloqueante (Green Bar) cobrindo todo o catálogo `specs/001` a `specs/054`

**Checkpoint**: User Story 1 concluída e testada. O catálogo de especificações está formalmente reconciliado e protegido contra regressões (MVP funcional!).

---

## Phase 4: User Story 2 - Atualização da Visão do Sistema e Métricas Reais de Saúde (Priority: P2)

**Goal**: Atualizar o documento de visão e rumo do Metrik (`specs/043/vision.md`) para reportar a realidade factual do sistema (926 testes verdes, 150 arquivos, 54 features entregues) e marcar oportunidades anteriores como superadas.

**Independent Test**: Inspecionar `specs/043-system-health-and-roadmap/vision.md` e validar os indicadores do Sumário Executivo, a resolução formal das oportunidades `OPP-007` a `OPP-014` e a ratificação do cabeçalho de `spec.md`.

### Implementation for User Story 2

- [X] T010 [P] [US2] Atualizar tabela de Sumário Executivo e contagem de testes em `specs/043-system-health-and-roadmap/vision.md` refletindo os dados medidos em novembro de 2026 (926 testes em 150 arquivos, 0 falhas, build < 5s)
- [X] T011 [P] [US2] Assinalar formalmente as oportunidades históricas superadas (`OPP-007` testes temporais, `OPP-008` README, `OPP-009`/`OPP-010` reconciliação e `OPP-014` modularidade) como `[x] Resolvida` em `specs/043-system-health-and-roadmap/vision.md`
- [X] T012 [P] [US2] Documentar no roadmap de `specs/043-system-health-and-roadmap/vision.md` os próximos horizontes analíticos (Monte Carlo preditivo acoplado a SLE e Matriz Touch Time vs Wait Time)
- [X] T013 [US2] Atualizar o cabeçalho de `specs/043-system-health-and-roadmap/spec.md` para `**Status**: Implemented & Verified (2026-11-04)`

**Checkpoint**: User Stories 1 e 2 concluídas. A visão do sistema reflete a verdade factual do produto.

---

## Phase 5: User Story 3 - Sincronização de Tarefas da Feature 053 no GitHub Issues (Priority: P3)

**Goal**: Criar e encerrar as 34 issues correspondentes às tarefas da Feature 053 no GitHub, garantindo paridade total entre `tasks.md` e a governança pública no repositório.

**Independent Test**: Executar `gh issue list --repo rogerteg/Metrik --search "Feature 053" --state all` e comprovar a existência e o fechamento das 34 issues no padrão `[Feature 053] T###: <descrição>`.

### Implementation for User Story 3

- [X] T014 [US3] Executar script `scripts/sync-feature053-issues.mjs` para criar as 34 issues das tarefas da Feature 053 (`T001` a `T034`) no repositório GitHub `rogerteg/Metrik`
- [X] T015 [US3] Validar fechamento automático e registro de comentários de auditoria em todas as 34 issues criadas via consulta à API do GitHub CLI

**Checkpoint**: Rastreabilidade histórica no GitHub restaurada sem lacunas.

---

## Phase 6: User Story 4 - Consolidação dos Aprendizados e Contexto do Projeto (Priority: P4)

**Goal**: Registrar na memória viva do projeto (`lessons-learned.md` e `project-context.md`) os padrões de arquitetura e mitigação validados nas Features 053 e 054.

**Independent Test**: Inspecionar `.specify/memory/lessons-learned.md` e validar a presença das lições sobre (1) parâmetro `referenceDate` em métricas dinâmicas, (2) Depth = 1 para automações sem loops e (3) percentis empíricos NIST com $N \ge 5$.

### Implementation for User Story 4

- [X] T016 [P] [US4] Registrar em `.specify/memory/lessons-learned.md` as diretrizes consolidadas nas Features 053 e 054 (parâmetro `referenceDate` em testes de SLE/aging, Depth = 1 para automações e salvaguarda amostral $N \ge 5$)
- [X] T017 [P] [US4] Atualizar `.specify/memory/project-context.md` ajustando o catálogo para 54 funcionalidades entregues e incorporando as entidades de regras de fluxo e predição de SLE

**Checkpoint**: Todas as 4 User Stories implementadas e reconciliadas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de conformidade constitucional, qualidade de código e integridade de pipeline

- [X] T018 [P] Validar limite constitucional de linhas de código em todos os módulos alterados via `tests/unit/moduleLineCountGuard.test.ts` (garantir estritamente <= 400 linhas)
- [X] T019 [P] Executar checagem estática de tipos e linter: `npm run lint` e `npm run build` garantindo zero erros
- [X] T020 [P] Executar validação de formatação Prettier: `npm run format:check`
- [X] T021 Executar suíte completa de testes automatizados com `npm test -- --run` para garantir zero regressões nos mais de 926 testes existentes
- [X] T022 Validar os cenários de uso manual descritos no guia rápido `specs/055-documentary-governance-debt/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** US1 e US3 (scripts auxiliares).
- **User Story 1 (Phase 3 - P1 MVP)**: Depende de Phase 2 (`verify-spec-headers.mjs`). Entrega a reconciliação central de status e o gate no Vitest.
- **User Story 2 (Phase 4 - P2)**: Depende de US1 (status reconciliados) e atualiza a visão factual do sistema.
- **User Story 3 (Phase 5 - P3)**: Depende de Phase 2 (`sync-feature053-issues.mjs`). Executa a criação no GitHub.
- **User Story 4 (Phase 6 - P4)**: Depende de US1 e US2. Atualiza a memória viva do projeto.
- **Polish (Phase 7)**: Depende de todas as User Stories concluídas.

### User Story Dependencies

- **US1 (P1 - Status Reconciliado)**: Fundação de integridade do catálogo. Desbloqueia US2 e US4.
- **US2 (P2 - Visão Factual)**: Alinha métricas com o estado real do produto.
- **US3 (P3 - Issues GitHub)**: Independente de US2 e US4; consome as tarefas existentes da Feature 053.
- **US4 (P4 - Memória Viva)**: Consolida lições aprendidas após confirmação dos artefatos.

### Parallel Opportunities

- **Phase 2**: `T002` (script de spec headers) e `T003` (script de sync de issues) rodam em paralelo.
- **Phase 3 (US1)**: `T005`, `T006`, `T007` e `T008` (edição dos cabeçalhos) rodam em paralelo.
- **Phase 4 (US2)**: `T010`, `T011` e `T012` rodam em paralelo.
- **Phase 6 (US4)**: `T016` (`lessons-learned.md`) e `T017` (`project-context.md`) rodam em paralelo.
- **Phase 7**: `T018`, `T019` e `T020` rodam em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 (Setup de contratos).
2. Concluir Phase 2 (Scripts utilitários).
3. Concluir Phase 3 (US1: Atualização dos cabeçalhos de spec e teste sentinela no Vitest).
4. **VALIDAR MVP**: Executar `npx vitest run tests/unit/documentaryGovernance.test.ts` e validar 100% verde para todas as specs 001 a 054.

### Incremental Delivery

1. Setup + Foundational -> Ferramental pronto.
2. US1 -> Catálogo de specs reconciliado e gate bloqueante ativo (MVP!).
3. US2 -> Visão e saúde do produto sincronizadas com o estado real.
4. US3 -> Histórico do GitHub Issues restaurado para a Feature 053.
5. US4 -> Memória viva (`lessons-learned.md`, `project-context.md`) enriquecida.
6. Polish -> Conformidade total de tipos, linter, formatação e 926+ testes verdes.

