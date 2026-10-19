# Implementation Plan: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Branch**: `043-system-health-and-roadmap` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/043-system-health-and-roadmap/spec.md`

## Summary

Feature **documental e de governança**: produz e mantém o **Documento de Visão e Rumo** ([vision.md](./vision.md)) que responde a três perguntas — como o sistema está hoje, quais oportunidades de melhoria existem e quais são os próximos passos — e fixa os contratos que tornam essas afirmações auditáveis.

**Abordagem técnica**: nenhum código é escrito. O trabalho consiste em (a) estruturar o documento de visão conforme os requisitos FR-001..FR-008, (b) fixar três contratos de documentação que têm consumidores reais (o manifesto de sentinelas que a verificação executável da feature `045` irá parsear, o formato de item de checklist pertencente ao revisor e o formato de evidência de validação) e (c) provar a aceitação por **comparação de conjunto de arquivos** (SC-012) e por **identidade das falhas pré-existentes** (sem regressão), já que FR-017 proíbe esta feature de tocar código, testes ou documentação de entrada.

**Decisão de pronto registrada com o mantenedor (2026-10-07)**: dado que a suíte está vermelha por 5 falhas pré-existentes atribuídas à OPP-007 / feature `044`, a definição de pronto desta feature é **"sem regressão"** — a identidade e a contagem das falhas permanecem inalteradas, o que é *prova* de que nenhum código mudou. A restauração do verde é aceita na feature `044`.

## Technical Context

**Language/Version**: Markdown (documentação em português, terminologia canônica do Metrik Design System). Nenhum código de runtime é produzido.

**Primary Dependencies**: **Nenhuma nova.** Ferramental existente apenas, e inalterado: Git (comparação de conjunto de arquivos), PowerShell 7+ e Bash (execução) e a suíte já configurada — Vitest, `tsc`, ESLint, Prettier.

**Storage**: Arquivos versionados em `specs/043-system-health-and-roadmap/`. Sem `localStorage`, sem nuvem, sem persistência de runtime.

**Testing**: Sem testes novos — FR-017 restringe o conjunto de artefatos e proíbe alterar testes. A verificação usa: (1) `git` para provar o conjunto de arquivos alterados; (2) a suíte existente para provar ausência de regressão; (3) integridade de links relativos entre artefatos.

**Target Platform**: Repositório Git. Os comandos de verificação devem funcionar em Windows (PowerShell) e em Linux (CI), conforme a cláusula de compatibilidade cross-platform da constituição.

**Project Type**: Single project — artefatos documentais em `specs/043-system-health-and-roadmap/`. Não há frontend, backend, API ou biblioteca a construir.

**Performance Goals**: Não se aplica. A feature não tem superfície de execução.

**Constraints**:
- **FR-017** — conjunto de artefatos restrito ao diretório da própria feature (`specs/043-system-health-and-roadmap/**`), incluindo os artefatos exigidos pela metodologia de especificação. Nenhum artefato fora desse diretório pode ser criado ou alterado.
- **FR-017** — proibido alterar código de produto, arquivos de teste, documentação de entrada do repositório e nomes de diretórios de artefato existentes.
- Nenhum script novo pode ser criado (consequência direta de FR-017); portanto a verificação usa apenas ferramental já existente.
- Compatibilidade Windows (PowerShell) e Linux (CI) em todo comando documentado.

**Scale/Scope**: 1 documento de visão; 24 requisitos funcionais; 13 critérios de sucesso; 17 oportunidades de melhoria; 10 arquivos-sentinela; 4 fases de próximos passos; 6 entidades de dados; 3 contratos de documentação.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Veredito | Justificativa |
|---|---|---|
| **I. Specification-Driven Development** | ✅ PASS | Este plano existe antes de qualquer execução. FR-001..FR-008 produzem artefatos de especificação; o diagnóstico não se confunde com implementação. |
| **II. Code Quality & Modularity** | ✅ PASS | A feature não adiciona código. Os artefatos são autocontidos e referenciam-se por links relativos, sem duplicar conteúdo entre si. |
| **III. Automated Verification & Testing** | ⚠️ **PASS com justificativa explícita** | A suíte está vermelha por **5 falhas pré-existentes** (OPP-007), e FR-017 **proíbe** esta feature de corrigi-las. Resolução: SC-012 prova que **zero arquivos de código são alterados**; se nenhum código muda, o estado da suíte é provadamente idêntico e a obrigação do Princípio III não é acionada em substância. O gate desta feature passa a ser **ausência de regressão** — identidade e contagem das 5 falhas inalteradas, aferidas por comparação antes/depois. A verificação **não** é manual: usa Git e a suíte existente. Restauração do verde: feature `044`. Ver *Complexity Tracking*. |
| **IV. Observability & Structured Logging** | ✅ PASS | Sem superfície de runtime. A rastreabilidade substitui o log: cada afirmação do documento carrega evidência (caminho de arquivo, medida ou artefato de origem), conforme FR-005. |
| **V. Simplicity & YAGNI** | ✅ PASS | Deliberadamente não se cria script de validação, não se duplica a estrutura da visão em contrato e não se introduz ferramenta nova. Os 3 contratos existem porque têm consumidores reais (features corretivas e verificação futura); a estrutura do documento **não** vira contrato separado por já estar especificada em FR-001..FR-008. |
| **VI. Analytical Reasoning Pre-Task Creation** | ⏳ PENDENTE POR DESIGN | Nenhuma tarefa é criada nesta fase. Os 6 Modelos de Raciocínio Analítico são obrigatórios imediatamente antes de `/speckit-tasks` e não foram contornados aqui — ver a seção *Analytical Reasoning*. |
| **VII. Brand Independence & Clean Identity** | ✅ PASS, **e ativo** | O documento usa terminologia canônica e **não** introduz nome de marca de terceiros. FR-011 e SC-003 elevam a independência de marca a obrigação mensurável; a violação existente (OPP-009) é declarada e atribuída à feature `046`, não corrigida aqui. |
| **VIII. Local-First Sovereignty & Squad Isolation** | ✅ PASS | O modelo local-first com nuvem opt-in é documentado como identidade consolidada (§2 da visão), não como lacuna. A migração pendente de nuvem é registrada como dependência externa (FR-016), não como defeito. |
| **IX. User Data Integrity & Draft Protection** | ✅ PASS | Sem superfície de persistência de usuário. Nenhum dado textual de usuário é tocado. |
| **Security & Technical Standards** | ✅ PASS | Nenhum segredo é introduzido ou referenciado. Todo comando de verificação documentado funciona em Windows (PowerShell) e Linux (CI). Nenhum caminho absoluto de máquina é gravado nos artefatos. |

**Veredito do gate:** aprovado. Há uma justificativa explícita registrada para o Princípio III, sem violação não justificada.

### Analytical Reasoning (Princípio VI) — preparação para `/speckit-tasks`

Registrado aqui para que a fase de tarefas não precise produzi-lo tarde. As tarefas **só podem ser geradas** depois que `/speckit-tasks` formalizar os 6 modelos; este plano deixa o insumo pronto e **não** cria tarefas.

| Modelo | Insumo deixado por este plano |
|---|---|
| **1. Primeiros Princípios** | A verdade irredutível: um documento de estado só tem valor se cada afirmação for rastreável a evidência datada. Toda decisão abaixo deriva disso. |
| **2. Pré-Mortem / Inversão** | Falhas mapeadas em `research.md` **R1..R6** — as mais prováveis: documento que envelhece em silêncio, verificação que depende do relógio e sentinela ambíguo que a verificação da feature `045` não consegue parsear. |
| **3. MECE** | Fronteira de artefatos fechada (FR-017) e fronteira de execução fechada (diagnóstico ≠ correção); nenhuma tarefa pode tocar código, o que elimina sobreposição com `044`, `045` e `046`. |
| **4. Árvore de Decisão / Poda** | Cada decisão de `research.md` registra alternativas descartadas e o critério de poda. |
| **5. Falsificabilidade (TDD Red-Bar First)** | `quickstart.md` define cenários que **falham antes** e passam depois: SC-012 (conjunto de arquivos), SC-006 (protocolo em duas partes) e SC-013 (validade por sentinela). |
| **6. Triangulação Adversarial** | A tabela `Constitution Check` acima, mais a *Post-Design Constitution Re-evaluation* ao fim deste documento. |

## Project Structure

### Documentation (this feature)

```text
specs/043-system-health-and-roadmap/
├── plan.md                              # Este arquivo (/speckit-plan)
├── spec.md                              # Especificação (já existente)
├── vision.md                            # ENTREGÁVEL principal (já existente)
├── research.md                          # Fase 0 (/speckit-plan)
├── data-model.md                        # Fase 1 (/speckit-plan)
├── quickstart.md                        # Fase 1 (/speckit-plan)
├── contracts/                           # Fase 1 (/speckit-plan)
│   ├── sentinel-manifest.md             # Contrato consumido pela verificação da feature 045
│   ├── checklist-item.md                # Contrato de item pertencente ao revisor
│   └── evidence-record.md               # Contrato da evidência de validação (FR-019b)
├── checklists/
│   ├── requirements.md                  # Mantido por /speckit-specify e /speckit-clarify
│   └── planning-readiness.md            # Gerado por /speckit-checklist (revisor)
└── tasks.md                             # Fase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
# Nenhuma alteração de código nesta feature (FR-017).
# A árvore abaixo é o repositório real, listada apenas para
# deixar explícito o que esta feature NÃO toca.

src/                     # NÃO TOCADO — código de produto
tests/                   # NÃO TOCADO — FR-017 proíbe alterar testes
.github/workflows/ci.yml # NÃO TOCADO — gates inalterados
README.md                # NÃO TOCADO — correção pertence à feature 045
specs/001..042/          # NÃO TOCADO — reconciliação pertence à Fase 2 da visão
specs/043-.../           # ÚNICO conjunto de artefatos desta feature
```

**Structure Decision**: projeto único, exclusivamente documental, restrito à árvore `specs/043-system-health-and-roadmap/`. A escolha é forçada pela constituição e pela spec: FR-017 fecha o conjunto de artefatos e SC-012 torna esse fechamento verificável. Não há `src/`, `tests/` ou código a criar — o diretório `contracts/` desta feature contém **contratos de documentação**, não interfaces executáveis.

## Complexity Tracking

> Preenchido apenas para a única justificativa de gate desta feature.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Princípio III não pode ser satisfeito literalmente (suíte com 5 falhas pré-existentes) | A suíte está vermelha por defeito determinístico de dependência do relógio nos testes (`tests/unit/MonteCarloSimulationView.test.tsx` e `tests/unit/CycleTimeScatterPlot.test.tsx`), já declarado como OPP-007 na visão e atribuído à feature `044`. FR-017 **proíbe** esta feature de alterar testes para obter verde. Corrigir aqui violaria FR-017 e misturaria diagnóstico com correção, quebrando o critério de aceite isolável (SC-012). | (a) **Absorver as falhas nesta feature** — exigiria emendar FR-017 e reabrir a fronteira de escopo; descartado porque reintroduziria exatamente a contradição que a sessão de esclarecimento resolveu. (b) **Sequenciar `044` antes de `043`** — criaria dependência artificial de ordem para uma feature documental que não toca código; descartado por não agregar verificação real. (c) **Adotado:** "sem regressão" — como SC-012 prova que zero arquivos de código mudam, a identidade e a contagem das 5 falhas permanecem inalteradas por construção, e isso é aferido objetivamente antes e depois. |

## Spec Reconciliations

Os itens abaixo vêm do checklist de prontidão (`checklists/planning-readiness.md`) e são resolvidos **por decisão de desenho**, sem alterar requisitos — exceto onde indicado.

| Item do checklist | Resolução no desenho |
|---|---|
| **CHK014** — atributo *custo relativo* declarado e sem uso | `data-model.md` mantém o atributo como **opcional e não bloqueante**, e a visão passa a exibi-lo apenas quando populado. Nenhum requisito é inventado para forçá-lo. Removê-lo seria emenda de spec (Princípio V), não trabalho de implementação. |
| **CHK015** — identidade e unicidade dos identificadores de oportunidade | `data-model.md` fixa a convenção canônica: `OPP-NNN`, **permanente e nunca reutilizado**, com histórico de resolução **append-only** (oportunidade resolvida nunca é removida, apenas marcada e datada). É regra de dados, não contrato de interface. |
| **CHK033** — medidas de cobertura com data de origem anterior à data de referência | A verificação de aceitação **remede** a cobertura com `npm run test:coverage` e regrava os três indicadores com a data de referência, eliminando a inconsistência em vez de documentá-la. Rodar a suíte existente não viola FR-017. |
| **CHK034** — determinismo da suíte sem atribuição explícita | `quickstart.md` e a visão passam a atribuir a remediação de forma inequívoca à feature `044`, na condição de encerramento de OPP-007 e na Fase 0. Não há requisito novo: apenas remoção de ambiguidade de atribuição. |
| **CHK026** — critérios de qualificação do leitor independente | `contracts/evidence-record.md` torna o campo de qualificação do executor **obrigatório** (declara que o leitor não tem conhecimento prévio do projeto), tornando o registro auditável. |
| **Contradição FR-017 × metodologia de especificação** (encontrada ao escrever `quickstart.md`) | FR-017 enumerava o conjunto de artefatos como "`spec.md`, `vision.md` e `checklists/`", mas a metodologia exige `plan.md`, `research.md`, `data-model.md`, `contracts/` e `quickstart.md`. Como a redação original tornava **SC-012 impossível de satisfazer**, FR-017 e SC-012 foram corrigidos para declarar a fronteira como **o diretório da própria feature** (`specs/043-system-health-and-roadmap/**`). A intenção permanece intacta e verificável: zero código, zero teste, zero documentação de entrada e zero renomeação de diretório; nenhum script novo. É correção de redação que preserva o requisito, não afrouxamento de gate. |

### Reconciliações da análise cruzada — `/speckit-analyze`, 2026-10-07

Doze achados foram levantados na análise cruzada entre `spec.md`, `plan.md` e `tasks.md`. Os que alteram **requisitos** foram aplicados como refinamento explícito de especificação, registrados aqui para preservar a trilha (Princípio I). Os demais permanecem como trabalho das tarefas indicadas.

| Achado | Severidade | Resolução aplicada |
|---|---|---|
| **I1** — SC-003 exigia "zero marca em documentos", mas o próprio `vision.md` contém a citação necessária em OPP-009, com a exceção declarada **apenas** em `quickstart.md` `VS-09` | HIGH | SC-003 reescrito para qualificar o escopo ("usados como identidade, inspiração declarada ou termo de domínio") e reconhecer a exceção de citação acionável; a exceção passou a viver na spec, em `§Edge Cases` |
| **I1 (cont.)** — o indicador de marca media `1 diretório` enquanto seu método varria documentos + diretórios + interface + comentários | HIGH | Indicador renomeado para "Nomes de marca de terceiros usados como identidade" e seu valor passou a declarar as duas populações, com a exceção contabilizada em separado |
| **C3/C4 verificados por script** — `Nomes de marca de terceiros em artefatos` e `Ramificações obsoletas` não eram invalidados por **nenhuma** sentinela (violação de C4); o manifesto citava meta-afirmações no lugar de nomes de indicador (violação de C3) | HIGH | Duas sentinelas acrescentadas ao manifesto: `README.md` (documentação de entrada) e **conjunto de ramificações do repositório**. C4 real caiu de **2 → 0**. As 13 imprecisões de nome permanecem e passaram a ser exigidas explicitamente por T008 e T022, que agora verificam **C3 e C4** |
| **U1** — `Arquivo-sentinela` era entidade de primeira classe em `data-model.md` §6.2 e objeto central de FR-022, mas **ausente** das Key Entities da spec | MEDIUM | Entidade adicionada a `spec.md` §Key Entities, com o invariante "todo indicador invalidado por ao menos um arquivo-sentinela" |
| **U2** — contagem de entidades e sentinelas divergente entre `plan.md` (5 entidades, 8 sentinelas), `data-model.md` (6 entidades) e `vision.md` (12 indicadores) | MEDIUM | `plan.md` §Scale/Scope corrigido para **6 entidades de dados** e **10 arquivos-sentinela**, verificado por contagem das linhas do manifesto |
| **I2** — plano enquadrava o Princípio III como gate não satisfeito, enquanto a spec já escopara SC-001 | MEDIUM | Mantido: não há violação a resolver. O Princípio III não é acionado porque **zero arquivos de código são alterados** (SC-012), e a justificativa está registrada em §Complexity Tracking |
| **I3** — "visão markdown" (8 ocorrências em `spec.md`) contradiz o termo canônico de `data-model.md` §9 | MEDIUM | Pertence a T009. Nota de execução: T009 reescreve a redação de FR-001, o que deve ser feito conscientemente, não como efeito colateral |
| **I4** — escala P1/P2/P3 definida duas vezes com redações diferentes (spec §Assumptions vs `data-model.md` §3) | MEDIUM | `data-model.md` §3 é a fonte canônica da escala; a spec deve referenciá-la |
| **G1** — cenários de aceite de US1 exigem suíte verde, não alcançável por esta feature | MEDIUM | A nota "Delivered by" de US1 é a mitigação aceita; os cenários permanecem como critério de rumo |
| **G2** — mapa de cobertura de `tasks.md` lista SC-008/SC-009 como cobertos por T032, que apenas registra campos de indicador | MEDIUM | As entradas passam a ser lidas como "escopo-de-rumo, sem trabalho executável nesta feature" |
| **G3** — T040 atribuía a `/speckit-implement` a atualização de `checklists/requirements.md`, cujo ciclo de vida pertence a `/speckit-specify` e `/speckit-clarify` (`contracts/checklist-item.md` §5) | MEDIUM | T040 deve sair da fase de polish ou ser executado pelos comandos de especificação |
| **D1, D2, A1, I5** | LOW | Achados de forma: FR-021 duplica FR-020; justificativa do Princípio III repetida no plano; "documentos" em SC-003 qualificado; nota de dependência T030/T001 incorreta em `tasks.md` |

## Post-Design Constitution Re-evaluation

*Executada após a Fase 1.*

| Princípio | Veredito pós-desenho | O que o desenho mudou |
|---|---|---|
| I — Spec-Driven | ✅ PASS | `research.md`, `data-model.md`, `contracts/` e `quickstart.md` derivam da spec; nenhum deles introduz requisito novo. |
| II — Qualidade & Modularidade | ✅ PASS | Cada artefato tem propósito único e referencia os demais por link, sem duplicação: `quickstart.md` aponta para contratos e modelo de dados em vez de copiá-los. |
| III — Verificação Automatizada | ⚠️ **PASS com a justificativa já registrada** | O desenho confirma e reforça a justificativa: `quickstart.md` torna a ausência de regressão **mensurável** (contagem e identidade das falhas antes/depois) e SC-012 verificável por comando de Git. Nenhum teste novo é criado, conforme FR-017. |
| IV — Observabilidade | ✅ PASS | A rastreabilidade substitui o log; `contracts/evidence-record.md` padroniza o registro datado exigido por FR-019b. |
| V — Simplicidade & YAGNI | ✅ PASS | 3 contratos, não 4: a estrutura da visão **não** foi promovida a contrato por já estar em FR-001..FR-008. Nenhum script, dependência ou artefato além do exigido. |
| VI — Raciocínio Analítico Pré-Tarefas | ⏳ PENDENTE POR DESIGN | Mantido como gate obrigatório antes de `/speckit-tasks`; o insumo está preparado na seção *Analytical Reasoning*. |
| VII — Independência de Marca | ✅ PASS, e ativo | O desenho não introduz marca alguma; `contracts/checklist-item.md` inclui a verificação de marca como item de revisão. |
| VIII — Local-First & Isolamento por Squad | ✅ PASS | O desenho não toca persistência, autenticação ou isolamento. |
| IX — Integridade de Dados do Usuário | ✅ PASS | Sem superfície de dados de usuário. |
| Security & Technical Standards | ✅ PASS | Nenhum segredo; todos os comandos documentados são cross-platform (Git e npm), sem caminho de máquina gravado. |

**Veredito final do gate:** aprovado, com uma única justificativa explícita e rastreada (Princípio III), aceita pelo mantenedor em 2026-10-07.
