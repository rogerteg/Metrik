# Tasks: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Feature**: `043-system-health-and-roadmap`
**Input**: Design documents from `/specs/043-system-health-and-roadmap/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: **NÃO solicitados.** A especificação não pede TDD e **FR-017 proíbe** esta feature de criar ou alterar arquivos de teste. Os "testes" desta feature são os cenários de validação de [quickstart.md](./quickstart.md) (`VS-01`..`VS-10`), executados com ferramental já existente: eles verificam os **artefatos documentais**, não o produto. Nenhuma tarefa abaixo cria teste automatizado, script ou configuração.

**Organization**: tarefas agrupadas por história de usuário para permitir entrega e verificação independentes, na ordem de prioridade da `spec.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos ou seções diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história de usuário a que a tarefa pertence (`US1`..`US5`)
- Todo caminho de arquivo é relativo à raiz do repositório

## Path Conventions

Projeto único, **exclusivamente documental**. Toda tarefa altera apenas arquivos sob `specs/043-system-health-and-roadmap/`, conforme FR-017. `src/`, `tests/`, `.github/workflows/ci.yml` e `README.md` **não são tocados por nenhuma tarefa**.

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** os modelos abaixo foram formulados **antes** da listagem de tarefas. As tarefas foram derivadas deles, não o contrário.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Verdades fundamentais e invariantes:**
  1. Um documento de estado só possui valor se cada afirmação for rastreável a evidência com data — sem data, a afirmação é opinião.
  2. Uma medida sem regra de invalidação é indistinguível de opinião, porque não se sabe quando deixa de valer.
  3. Um item de dívida sem critério de encerramento aferível não é trabalho: é intenção.
  4. A fronteira de escopo é o que torna a aceitação isolável — sem fronteira, o critério de pronto é inverificável.
  5. Um identificador que pode ser reutilizado não permite acumular prova de progresso.
- **Premissas acidentais descartadas:**
  - Que a correção do produto pertence a esta feature → descartada em `Clarifications` Q1 (resposta: somente diagnóstico).
  - Que o verde da suíte é pré-requisito desta entrega → descartada: as 5 falhas são de `OPP-007`/feature `044`, e FR-017 impede corrigi-las aqui.
  - Que um script de verificação é necessário → descartado: `git` já responde SC-012; criar script violaria FR-017 e o Princípio V.
  - Que a estrutura do documento precisa de contrato próprio → descartada: já está em FR-001..FR-008; duplicá-la criaria duas fontes de verdade.
  - Que "visão markdown" é um termo suficiente → descartada: sem termo canônico, `spec.md`, `vision.md` e contratos divergem no vocabulário.

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)

Assumindo que a feature **falhou** em produzir um artefato confiável, os modos de falha antecipados e as mitigações embutidas nas tarefas:

| Modo de falha | Como se manifestaria | Mitigação nas tarefas |
|---|---|---|
| Documento envelhece em silêncio | Medidas usadas em decisão depois de já invalidáveis | **T008** (manifesto de sentinelas), **T029** (data de medição), **T022** (invariante C4) |
| Verificação que depende do relógio | Resultado muda conforme a data de execução | **T001** (linha de base explícita), **T034** (compara contagem e identidade, não "verde") |
| Sentinela ambíguo que a `045` não consegue parsear | Formato renegociado depois, retrabalho | **T008** + [contracts/sentinel-manifest.md](./contracts/sentinel-manifest.md) com C1..C5 |
| Medida de cobertura vencida usada como atual | Indicador desatualizado sustentando aceitação | **T029** (remedição com data de referência) |
| Tarefa que extrapola para código | Feature documental alterando `src/`, `tests/` ou `README.md` | **T003** e **T035** (`VS-01` como gate de fronteira) |
| Auto-validação documental | Quem escreveu a documentação aprova a própria documentação | **T017** (qualificação do executor obrigatória no contrato de evidência) |
| Oportunidade "resolvida" sem prova | Item desaparece sem data nem critério aferido | **T006**, **T028** (append-only com `data_resolucao`) |
| Renumeração destrói auditoria | Identificador reaproveitado, histórico incoerente | **T005** (`OPP-NNN` permanente; transição `resolvida → aberta` proibida) |
| Sobreposição entre fases (viola MECE) | Mesma ação sob duas fases, dono ambíguo | **T023** (exclusividade mútua das fases) |
| Designação de P1 que fica no ar | Oportunidade crítica sem responsável | **T012**, **T015**, **T026**, **T036** (`VS-06`) |

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

- **Exclusividade Mútua:** cada tarefa edita **uma seção distinta** de `vision.md` (§3.3, §3.4, §3.6, §4.1, §4.2, §4.3, §4.4, §5, §6, §7, §8) ou um artefato distinto. Não há duas tarefas editando a mesma seção, exceto as tarefas de medição (`T029`, **T038**), que são explicitamente dependentes. Nenhuma tarefa cria arquivo novo: todos os artefatos já existem (os 3 contratos, o modelo de dados e o guia de validação foram produzidos em `/speckit-plan`).
- **Exaustão Coletiva:** o mapa de cobertura abaixo confirma que **24 de 24 requisitos funcionais** e **13 de 13 critérios de sucesso** são cobertos por ao menos uma tarefa de implementação e por ao menos um cenário de validação.

| Requisito | Tarefas de implementação | Cenário de validação (tarefa de execução) |
|---|---|---|
| FR-001, FR-002 | T010, T011 | VS-08 (T037) |
| FR-003 | T010 | VS-02 (T035) |
| FR-004 | T019, T028 | VS-05 (T037) |
| FR-005, FR-006 | T013, T019 | VS-05 (T037) |
| FR-007, FR-008 | T023 | VS-08 (T037) |
| FR-009 | T011, T012, T013 | VS-02 (T035) |
| FR-010 | T014 | VS-07 (T037) |
| FR-011 | T027 | VS-09 (T038) |
| FR-012 | T025 | VS-06 (T037) |
| FR-013 | T028 | VS-06 (T037) |
| FR-014 | T007, T032 | VS-04 (T036) |
| FR-015, FR-016 | T024 | VS-10 (T038) |
| FR-017 | T003, T004 | VS-01 (T034) |
| FR-018 | T012, T015, T027 | VS-06 (T037) |
| FR-019 | T016, T017 | VS-07 (T037) |
| FR-020, FR-021 | T018, T031, T032 | VS-07 (T037) |
| FR-022 | T008, T022, T030 | VS-04 (T036) |
| FR-023 | T033 | VS-04 (T036) |
| FR-024 | T025 | VS-06 (T037) |
| SC-001 | T012, T035 | VS-02 |
| SC-002 | T014 | VS-07 |
| SC-003 | T027, T038 | VS-09 |
| SC-004 | T025, T026 | VS-06 |
| SC-005 | T028 | VS-06 |
| SC-006 | T016, T017 | VS-07 |
| SC-007 | T019, T037 | VS-05 |
| SC-008 | T032 | VS-04 |
| SC-009 | T032 | VS-04 |
| SC-010 | T021, T032 | VS-04 |
| SC-011 | T012, T015, T027, T037 | VS-06 |
| SC-012 | T003, T034 | VS-01 |
| SC-013 | T022, T030, T033, T039 | VS-04 |

Nenhuma tarefa existe sem requisito de origem, e nenhum requisito fica sem tarefa — a checagem é bidirecional.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)

| Caminho | Veredito | Critério de poda |
|---|---|---|
| (A) Visão como documento único, sem contratos | **Podado** | A verificação executável da feature `045` teria de renegociar o formato do manifesto depois, convertendo uma decisão barata hoje em retrabalho certo |
| (B) Promulgar 3 contratos para os formatos com consumidores reais | **Adotado** | Formato acordado agora; nenhum consumidor inventado; cada contrato tem uso identificado |
| (C) Promulgar 4º contrato para a estrutura da visão | **Podado** | FR-001..FR-008 já especificam a estrutura; o contrato seria cópia, criando duas fontes de verdade (Princípio V) |
| (D) Criar verificação executável nesta feature | **Podado** | FR-017 proíbe adicionar script ou teste; a verificação executável pertence à `045` |
| (E) Sequenciar `044` antes de `043` para partir de baseline verde | **Podado** | Dependência artificial de ordem para uma feature que não toca código; não agrega verificação real |
| (F) Absorver as 5 falhas nesta feature | **Podado** | Exigiria emendar FR-017 e reintroduziria a contradição resolvida em `Clarifications` Q1 |
| (G) Revalidação periódica das medidas | **Podado** | Rejeitado pelo mantenedor em `Clarifications` Q4: trabalho periódico sem causa |
| (H) Revalidação sob demanda | **Podado** | Rejeitado em `Clarifications` Q4: depende de alguém desconfiar do documento, que é o comportamento que falhou |

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

Como não se pode adicionar testes (FR-017), a falsificabilidade é garantida pelos cenários de `quickstart.md`, todos com **estado que reprova** declarado:

| Cenário | Falha demonstrável (Red Bar) | Aprova (Green Bar) |
|---|---|---|
| VS-01 | Qualquer caminho na saída **não vazia** de `git diff --name-only HEAD` ou de `git ls-files --others --exclude-standard`, filtradas por `grep -v '^specs/043-system-health-and-roadmap/'` (comparação contra a **árvore de trabalho**, não entre commits) | Ambas as saídas vazias |
| VS-02 | Contagem ≠ 2 arquivos / 5 testes, ou nome de caso diferente da linha de base | 2 arquivos, 5 testes, mesmos nomes |
| VS-03 | Indicador com `data_medicao` anterior a uma alteração de sentinela que o invalida | Todas as medidas posteriores às suas sentinelas |
| VS-04 | Algum indicador de §7 não invalidado por nenhuma sentinela (viola C4) | C1..C5 satisfeitos |
| VS-05 | Oportunidade sem `evidencia` ou sem `criterio_encerramento` aferível | Zero oportunidades incompletas |
| VS-06 | Qualquer `P1` sem identificador de feature corretiva | 100% dos `P1` designados |
| VS-07 | Apenas uma das duas partes do protocolo declarada | Ambas declaradas, com a parte (b) referenciando o contrato |
| VS-08 | Link relativo quebrado, tabela malformada, `OPP-NNN` duplicado | Tudo íntegro |
| VS-09 | Marca de terceiros usada como identidade ou inspiração | Única ocorrência é a citação factual do diretório a renomear |
| VS-10 | `CHK###` com lacuna, item começando por verbo de teste, ou item gerado já marcado | C2, C5 e C6 satisfeitos |

### 6. Triangulação Adversarial & Conformidade Constitucional

| Princípio | Veredito sobre o conjunto de tarefas |
|---|---|
| I — Spec-Driven | ✅ Nenhuma tarefa existe fora da `spec.md`; as tarefas reconciliam artefatos, não antecipam implementação |
| II — Qualidade & Modularidade | ✅ Cada tarefa edita uma seção; nenhuma cria duplicação entre artefatos |
| III — Verificação Automatizada | ⚠️ **Conforme com justificativa registrada em `plan.md` §Complexity Tracking**: nenhuma tarefa altera código, e VS-02 prova a ausência de regressão por contagem e identidade das falhas. Nenhuma tarefa cria teste, conforme FR-017 |
| IV — Observabilidade | ✅ T010 e T011 tornam diagnóstico explícito e rastreável; T018 padroniza o registro datado |
| V — Simplicidade & YAGNI | ✅ Zero arquivo novo, zero dependência, zero script; 3 contratos e não 4 (poda C) |
| VI — Raciocínio Analítico Pré-Tarefas | ✅ **Satisfeito por esta própria seção**, formulada antes da lista de tarefas |
| VII — Independência de Marca | ✅ T026 e T037 tratam a marca como violação a declarar e corrigir fora desta feature; nenhuma tarefa introduz marca |
| VIII — Local-First & Isolamento | ✅ Nenhuma tarefa toca persistência, autenticação ou isolamento |
| IX — Integridade de Dados do Usuário | ✅ Nenhuma tarefa toca superfície de dados de usuário |
| Security & Technical Standards | ✅ Comandos documentados são apenas `git` e `npm`, idênticos em Windows (PowerShell) e Linux (CI); nenhum segredo, nenhum caminho de máquina |

**Fora de escopo por imposição de FR-017** (não são tarefas desta feature, e sua ausência é intencional): atualizar `.specify/memory/lessons-learned.md`, `project-context.md` ou `constitution.md`; corrigir a suíte vermelha; reescrever o `README.md`; renomear o diretório de especificação com marca; reconciliar os estados das features `001`..`042`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: fixar a linha de base e a fronteira de escopo antes de qualquer edição, para que a verificação seja falsificável.

- [X] T001 Registrar a linha de base de regressão em `specs/043-system-health-and-roadmap/quickstart.md` §VS-02, executando `npx vitest run --reporter=basic` e gravando a contagem de arquivos de teste falhando (2), de testes falhando (5) e os nomes dos casos
- [X] T002 [P] Registrar o commit base da feature (`git rev-parse HEAD`) em `specs/043-system-health-and-roadmap/quickstart.md` §Pré-requisitos, para que `VS-01` seja reproduzível
- [X] T003 [P] Confirmar em `specs/043-system-health-and-roadmap/plan.md` §Project Structure que `src/`, `tests/`, `.github/workflows/ci.yml` e `README.md` permanecem intocados, e que a fronteira de artefatos é o diretório `specs/043-system-health-and-roadmap/**` conforme FR-017
- [X] T004 [P] Conferir em `specs/043-system-health-and-roadmap/` que nenhum artefato ainda descreve a fronteira como "`spec.md`, `vision.md` e `checklists/`", exceto a menção histórica já registrada em `plan.md` §Spec Reconciliations

**Checkpoint**: linha de base e fronteira fixadas — nenhuma edição posterior pode invalidá-las sem detecção.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: estrutura dos dados documentais que **todas** as histórias consomem. Derivada de [data-model.md](./data-model.md) e de [contracts/](./contracts/).

**⚠️ CRITICAL**: nenhuma história de usuário pode ser verificada antes desta fase.

- [X] T005 Aplicar a convenção de identificador a todas as oportunidades de `specs/043-system-health-and-roadmap/vision.md` §4.1 e §4.2: `OPP-NNN`, três dígitos, **permanente e nunca reutilizado**, único, com lacunas permitidas e ordem **não** definindo prioridade (`data-model.md` §7)
- [X] T006 [P] Garantir que `specs/043-system-health-and-roadmap/vision.md` §4.3 declare o histórico de resolução como **append-only**, com a data de cada resolução, e que a transição `resolvida → aberta` esteja vedada (um problema que retorna recebe **novo** identificador) — `data-model.md` §4 e §7
- [X] T007 [P] Estruturar a tabela de indicadores de `specs/043-system-health-and-roadmap/vision.md` §7 com os campos de `data-model.md` §6.1: `nome`, `valor_medido`, `data_medicao`, `meta`, `mecanismo` (domínio fechado: `bloqueante` \| `consultivo`), `como_medir` e `proximo_passo` (obrigatório **se fora da meta**)
- [X] T008 [P] Estruturar a tabela de `specs/043-system-health-and-roadmap/vision.md` §3.6 conforme `contracts/sentinel-manifest.md` §2 e §3: exatamente 3 colunas (`Arquivo-sentinela`, `Por que invalida`, `Indicadores que invalida`), caminho **relativo** à raiz com `/`, sempre entre crases, e indicadores separados por `;` — usando **exatamente** o `nome` declarado na tabela de indicadores (§7), sendo proibido abreviar, traduzir ou citar meta-afirmação no lugar de um nome de indicador (invariante C3)
- [X] T009 Aplicar a terminologia canônica de `data-model.md` §9 (**visão**, **medida**, **sentinela**, **bloqueante**, **consultivo**, **entregue**, **oportunidade**, **lacuna aceita**, **feature corretiva**) de forma idêntica em `specs/043-system-health-and-roadmap/spec.md`, `vision.md`, `plan.md` e `contracts/`, eliminando o termo informal "visão markdown"

**Checkpoint**: estrutura documental pronta — as histórias podem ser verificadas de forma independente.

---

## Phase 3: User Story 1 — Confiar no sinal automatizado de saúde do repositório (Priority: P1) 🎯 MVP

**Goal**: a visão declara a ruptura do sinal automatizado, sua causa raiz determinística e a feature corretiva responsável, com designação explícita.

**Independent Test**: `VS-02` (linha de base inalterada) e `VS-06` (todo `P1` designado). A restauração do verde é aceita na feature `044`, não aqui.

- [X] T010 [US1] Registrar em `specs/043-system-health-and-roadmap/vision.md` §3.3 o resultado medido de cada verificação automatizada com a data de referência **2026-10-08** (as medidas foram refeitas nesta data sobre a árvore restaurada; a data original de 2026-10-07 caiu por não ser mais a data da última medição), incluindo a contagem exata de 2 arquivos e 5 testes falhando (FR-002, FR-003)
- [X] T011 [US1] Documentar em `specs/043-system-health-and-roadmap/vision.md` §3.3 a causa raiz determinística das 5 falhas: janela móvel de 30 dias contada a partir de `new Date()` contra datas absolutas de ago/set 2026, com a nota de que o defeito está nos testes, não no produto (FR-009)
- [X] T012 [US1] Atribuir de forma inequívoca a remediação do determinismo da suíte à feature `044` — em `specs/043-system-health-and-roadmap/vision.md` §4.4, em §5 Fase 0 (ação 0.1) e no `criterio_encerramento` de OPP-007 — eliminando a lacuna de atribuição CHK034 (FR-009, FR-018)
- [X] T013 [US1] Garantir que OPP-007 declare `prioridade = P1`, `evidencia` datada e `criterio_encerramento` aferível **sem afrouxar, ignorar ou remover nenhum teste**, em `specs/043-system-health-and-roadmap/vision.md` §4.2 (FR-005, FR-006)

**Checkpoint**: o sinal rompido está declarado, diagnosticado e com dono.

---

## Phase 4: User Story 2 — Reconhecer o produto real a partir da documentação (Priority: P1)

**Goal**: a visão declara a divergência entre a documentação de entrada e o produto real, e o protocolo que impede sua repetição.

**Independent Test**: `VS-07` (protocolo em duas partes declarado) e `VS-09` (independência de marca).

- [X] T014 [US2] Registrar em `specs/043-system-health-and-roadmap/vision.md` §4.2 a divergência entre a documentação de entrada e o produto real, com evidência que confronte `README.md` com o manifesto de dependências (`package.json`) e com o contexto de projeto (FR-010)
- [X] T015 [US2] Designar a feature corretiva `045` para OPP-008 em `specs/043-system-health-and-roadmap/vision.md` §4.4, explicitando o escopo da correção e o que a feature atual **não** faz (FR-017, FR-018)
- [X] T016 [US2] Declarar o protocolo de verificação em **duas partes** — (a) verificação automatizada de consistência que falha quando a documentação cita tecnologia ausente das dependências reais ou omite tecnologia presente, e (b) walkthrough registrado como evidência datada — em `specs/043-system-health-and-roadmap/vision.md` §5 Fase 0 (ação 0.2) e §7 (FR-019)
- [X] T017 [P] [US2] Referenciar, a partir de `specs/043-system-health-and-roadmap/quickstart.md` §VS-07, o contrato `contracts/evidence-record.md` como forma do registro de validação, **sem duplicar** seu conteúdo; garantir que o campo de **qualificação do executor** (ausência de conhecimento prévio) conste como obrigatório (FR-019, CHK026)
- [X] T018 [P] [US2] Garantir que a linha de indicador de consistência documental em `specs/043-system-health-and-roadmap/vision.md` §7 classifique o `mecanismo` como `consultivo` hoje e `bloqueante` quando a verificação executável da `045` existir, jamais apresentando indicador consultivo como garantido pelo pipeline (FR-020, FR-021)

**Checkpoint**: a documentação divergente está declarada, atribuída e com protocolo que impede recorrência.

---

## Phase 5: User Story 3 — Enxergar a dívida estrutural e o custo de entrega (Priority: P2)

**Goal**: as 17 oportunidades são auditáveis — cada uma com evidência, prioridade, critério de encerramento e vínculo com indicadores.

**Independent Test**: `VS-05` (nenhuma oportunidade incompleta) e `VS-04` (invariantes do manifesto).

- [X] T019 [US3] Conferir e completar `origem`, `evidencia`, `impacto`, `prioridade` e `criterio_encerramento` das oportunidades em `specs/043-system-health-and-roadmap/vision.md` §4.1 e §4.2, eliminando todo critério redigido como "melhorar X" ou "otimizar Y" e assegurando que `origem = já registrada` cite o artefato de memória correspondente (FR-004, FR-005, FR-006)
- [X] T020 [P] [US3] Marcar `custo_relativo` como **opcional e não bloqueante** em `specs/043-system-health-and-roadmap/vision.md` §4, exibido apenas quando populado, sem que sua ausência reprove qualquer critério (CHK014, `data-model.md` §2)
- [X] T021 [P] [US3] Garantir que todo indicador **fora da meta** em `specs/043-system-health-and-roadmap/vision.md` §7 tenha `proximo_passo` associado, referenciando um `OPP-NNN` existente ou uma ação datada (SC-010)
- [X] T022 [US3] Verificar as invariantes **C3 e C4** de `contracts/sentinel-manifest.md`: (C4) todo indicador de `specs/043-system-health-and-roadmap/vision.md` §7 é invalidado por **ao menos uma** sentinela em §3.6 — indicador sem sentinela deve ser declarado imune ao tempo por escrito, nunca por omissão; e (C3) todo nome citado na 3ª coluna do manifesto é idêntico a um `nome` de indicador declarado em §7 (FR-022, SC-013)
- [X] T023 [US3] Garantir exclusividade mútua das fases em `specs/043-system-health-and-roadmap/vision.md` §5: nenhuma ação corretiva aparece sob duas fases, toda fase tem `resultado_verificavel` aferível sem inspeção manual, e nenhuma referência `OPP-NNN` aponta para oportunidade inexistente (FR-007, FR-008, `data-model.md` §5)
- [X] T024 [US3] Registrar em `specs/043-system-health-and-roadmap/vision.md` §6 cada bloqueio de ambiente e cada dependência externa com `verificacao`, `causa`, `responsavel` e `escopo_nao_verificado` explícitos, de modo que nenhuma verificação impossível seja apresentada como concluída (FR-015, FR-016)

**Checkpoint**: a dívida está mensurável, priorizada e vinculada a indicadores — nada é intenção disfarçada de trabalho.

---

## Phase 6: User Story 4 — Reconciliação de governança dos artefatos (Priority: P2)

**Goal**: o estado declarado nos artefatos corresponde ao estado real, e a definição de "entregue" é objetiva.

**Independent Test**: `VS-06` (designações completas) e `VS-09` (independência de marca).

- [X] T025 [US4] Aplicar a definição de **entregue** de FR-024 — código que implementa as capacidades **presente na linha principal** *e* funcionalidade **referenciada no registro de mudanças** — à `evidencia` e ao `criterio_encerramento` de OPP-010 em `specs/043-system-health-and-roadmap/vision.md` §4.2, e garantir que funcionalidade que satisfaça apenas uma das condições seja declarada **ambígua**, nunca contada como entregue nem como não entregue (FR-012, FR-024)
- [X] T026 [P] [US4] Garantir que a ação 2.1 de `specs/043-system-health-and-roadmap/vision.md` §5 use a definição de FR-024 e exija **zero** funcionalidade em estado ambíguo ao término (SC-004)
- [X] T027 [US4] Declarar OPP-009 em `specs/043-system-health-and-roadmap/vision.md` §4.2 com a evidência do diretório de especificação que carrega marca de terceiros, e designar a feature corretiva `046` em §4.4, sem renomear nada nesta feature (FR-011, FR-018)
- [X] T028 [P] [US4] Declarar OPP-011, OPP-012, OPP-013 e OPP-017 em `specs/043-system-health-and-roadmap/vision.md` §4.2 com evidência e critério de encerramento, incluindo o estado dos 5 artefatos de tarefas antigos como **histórico**, explicitamente sem preenchimento retroativo de marcações (FR-013)
- [X] T029 [US4] Garantir que `specs/043-system-health-and-roadmap/vision.md` §4.3 não perca nenhum item já registrado e que cada resolução carregue sua data — histórico **append-only** conforme `data-model.md` §7

**Checkpoint**: nenhum artefato em estado ambíguo ou divergente da entrega.

---

## Phase 7: User Story 5 — Sustentar qualidade e desempenho ao longo do tempo (Priority: P3)

**Goal**: os indicadores estão declarados com valor, data, meta e mecanismo de verificação, e as medidas publicadas são válidas sob a regra de sentinelas.

**Independent Test**: `VS-03` (medidas posteriores às suas sentinelas) e `VS-04` (classificação completa dos indicadores).

- [ ] T030 [US5] Remedir a cobertura executando `npm run test:coverage` e regravar os três indicadores de cobertura em `specs/043-system-health-and-roadmap/vision.md` §3.4 e §7 com a **data de referência**, eliminando a data de origem anterior (CHK033); atualizar a nota do Anexo que hoje declara a data antiga (FR-022)

  > 🚫 **BLOQUEADA — não executável.** `npm run test:coverage` anuncia "Coverage enabled with v8" e termina normalmente **sem produzir resumo nem arquivos de relatório**, em 5 execuções independentes, inclusive com `reportsDirectory` apontado para fora do repositório. Sem relatório, não existe número novo a datar: reapresentar o valor de 2026-09-28 sob a data de hoje seria falsificação de medida, exatamente o que FR-022 proíbe.
  >
  > **O que foi feito em vez de contornar:** a impossibilidade foi declarada como **OPP-018** (§4.2, prioridade P1), com a premissa do plano corrigida — a instrução original supunha que a cobertura seria remedível. A feature corretiva `047-fix-coverage-report-output` foi designada (§4.4), uma ação de Fase 0 (0.5) foi criada para ela, e o cenário `VS-03` do `quickstart.md` está registrado como **bloqueado**, nunca como aprovado. Os indicadores mantêm a data verdadeira, com a causa declarada ao lado.
  >
  > **Critério de desbloqueio:** OPP-018 encerrada. Esta tarefa só pode ser marcada após `047` produzir relatório.

  **Consequência declarada (SC-013):** para os três indicadores de cobertura, SC-013 **não é atestável** enquanto OPP-018 existir. A lacuna está registrada na visão e no `quickstart.md`, e não é contornada por inspeção manual.
- [X] T031 [P] [US5] Declarar em `specs/043-system-health-and-roadmap/vision.md` §7 a regra de transição de `consultivo` para `bloqueante`, com a condição exata de disparo — entrada de verificação executável na suíte automatizada — consistente com a política de gate de FR-020 e SC-013
- [X] T032 [P] [US5] Garantir que todo indicador de `specs/043-system-health-and-roadmap/vision.md` §3.4 declare valor medido, meta e `como_medir` reproduzível por terceiros, sem indicador sem `mecanismo` classificado (FR-014, FR-020, FR-021)
- [X] T033 [US5] Confirmar que `specs/043-system-health-and-roadmap/vision.md` §3.6 e §8 vedam **explicitamente** prazo fixo e revalidação sob demanda, e que o gatilho por evento é o único declarado (FR-023)

**Checkpoint**: as metas são sustentáveis e as medidas publicadas são válidas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: executar os cenários de validação de [quickstart.md](./quickstart.md) e reconciliar o documento com os resultados.

- [X] T034 [P] Executar `VS-01` e registrar a saída vazia como prova de SC-012, confirmando que nenhum arquivo fora de `specs/043-system-health-and-roadmap/` foi alterado (FR-017)
- [X] T035 [P] Executar `VS-02` e registrar contagem (2 arquivos / 5 testes) e identidade dos casos como prova de ausência de regressão; contagem **menor** deve ser investigada antes de aceita
- [X] T036 [P] Executar `VS-04` e registrar a conformidade do manifesto às invariantes C1..C5 de `contracts/sentinel-manifest.md`, com atenção especial a C4
- [X] T037 [P] Executar `VS-05`, `VS-06`, `VS-07` e `VS-08` e registrar: zero oportunidades sem evidência e critério (SC-007), 100% dos `P1` designados (SC-011), as duas partes do protocolo declaradas (SC-006) e integridade de links, tabelas e sequência de `OPP-NNN`
- [X] T038 [P] Executar `VS-09` e `VS-10` e registrar independência de marca (SC-003) e conformidade dos itens de checklist às invariantes C2, C5 e C6
- [X] T039 Reconciliar em `specs/043-system-health-and-roadmap/vision.md` §7 os valores medidos que os cenários `VS-03` e `VS-05` deslocaram, atualizando a data de referência do cabeçalho (FR-002, SC-013)
- [X] T040 Atualizar `specs/043-system-health-and-roadmap/checklists/requirements.md` registrando a reconciliação de FR-017/SC-012 feita em `/speckit-plan`, alterando **somente** marcadores cujo estado de fato mude e preservando todo o restante do conteúdo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: depende da Fase 1 — **BLOQUEIA** todas as histórias
- **User Stories (Fases 3–7)**: todas dependem da Fase 2
  - US1 e US2 (ambas P1) podem rodar em paralelo
  - US3 e US4 (ambas P2) podem rodar em paralelo, após US1/US2 se houver necessidade de coerência de numeração
  - US5 (P3) depende de US3 (compartilha a tabela §7)
- **Polish (Fase 8)**: depende de todas as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: independente — §3.3, §4.2 (OPP-007), §4.4, §5
- **US2 (P1)**: independente de US1 — §4.2 (OPP-008), §4.4, §5, §7
- **US3 (P2)**: independente, mas **T022** pressupõe a estrutura de §7 (T007) e §3.6 (T008)
- **US4 (P2)**: independente — §4.2, §4.3, §4.4, §5
- **US5 (P3)**: depende de **US3/T021** (ambos editam §7); **T030** depende de T001 (linha de base)

### Within Each User Story

- Tarefas de estrutura antes das de conteúdo
- Medição antes de gravação do resultado
- História completa e verificada antes de avançar de prioridade

### Parallel Opportunities

- Fase 1: `T002`, `T003`, `T004` em paralelo (arquivos distintos); `T001` primeiro (produz a linha de base)
- Fase 2: `T006`, `T007`, `T008` em paralelo (seções distintas de `vision.md`); `T005` e `T009` antes
- Fase 4: `T017` e `T018` em paralelo
- Fase 5: `T020` e `T021` em paralelo
- Fase 6: `T026` e `T028` em paralelo
- Fase 7: `T031` e `T032` em paralelo
- Fase 8: `T034`..`T038` todos em paralelo

---

## Parallel Example: User Story 1 e User Story 2

```bash
# Após a Fase 2, as duas histórias P1 podem ser trabalhadas em paralelo:
Task: "T010 [US1] Registrar resultados medidos das verificações em vision.md §3.3"
Task: "T011 [US1] Documentar a causa raiz determinística em vision.md §3.3"
Task: "T014 [US2] Registrar a divergência da documentação de entrada em vision.md §4.2"
Task: "T017 [US2] Referenciar contracts/evidence-record.md em quickstart.md §VS-07"
Task: "T018 [US2] Classificar o mecanismo do indicador de consistência em vision.md §7"
```

⚠️ `T012`, `T013`, `T015` e `T016` editam `vision.md` §4.4 e §5 — não paralelizar entre si sem coordenar a seção.

---

## Implementation Strategy

### MVP First (User Story 1 apenas)

1. Fase 1 (Setup) — fixar linha de base e fronteira
2. Fase 2 (Foundational) — estrutura documental
3. Fase 3 (US1) — declarar o sinal rompido, sua causa raiz e seu dono
4. **PARAR e VERIFICAR**: `VS-02` e `VS-06`
5. Neste ponto, a decisão mais urgente do roadmap está documentada e atribuída — o MVP da feature está entregue

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → ruptura do sinal declarada e atribuída (MVP)
3. US2 → divergência documental declarada com protocolo anti-recorrência (segundo P1)
4. US3 → dívida auditável
5. US4 → governança reconciliada
6. US5 → metas sustentáveis
7. Polish → todos os cenários de validação executados e registrados

### Notas de execução

- Nenhuma tarefa cria arquivo, teste, script ou dependência — todos os artefatos já existem desde `/speckit-plan`
- **Nenhuma tarefa escreve fora de `specs/043-system-health-and-roadmap/`**; se alguma exigir isso, ela viola FR-017 e deve parar
- Se `VS-01` reprovar em qualquer momento, a execução para: significa que a fronteira de escopo foi rompida
- A suíte permanecerá vermelha ao fim desta feature — isso é o esperado, e `VS-02` é a prova de que nada regrediu
