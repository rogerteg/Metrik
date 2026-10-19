# Tasks: Governança de Qualidade Estática & Arquitetura (Ciclo 4 - P2)

**Feature**: `047-static-quality-governance`  
**Input Documents**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [checklists/code-quality.md](./checklists/code-quality.md)  
**Constitution Authority**: [constitution.md](../../.specify/memory/constitution.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais da Cascata CSS:** Uma regra CSS é uma tupla `(seletor, bloco_de_declaracoes, especificidade, ordem_no_manifesto)`. Quando o mesmo seletor simples de topo existe em múltiplos arquivos importados no manifesto, a precedência é ditada exclusivamente pela ordem de importação, criando acoplamento oculto e fragilidade visual.
- **Invariante de Isolamento:** Cada elemento de interface deve ter suas propriedades declaradas no módulo de domínio canônico correspondente (tarefas em `02`, filtros e ações de coluna em `03`, chips de links e dependências em `08`, modais em `06`, workspaces em `12`).
- **Verdade Fundamental de Testabilidade:** Um limiar de cobertura não auditado por relatórios estruturados é uma promessa inerte; limiares devem refletir o patamar factual da suíte (Functions ≥ 60%, Statements ≥ 85%, Branches ≥ 78%) comprovados por relatórios LCOV e HTML em `coverage/`.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modo de Falha 1 (Inversão ou perda de estilos):** Ao remover as declarações duplicadas de `02-task-detail-inline.css` (ex.: `.add-column-card`), propriedades aplicadas a estados `:hover` poderiam ser perdidas.
  - *Mitigação:* As regras mantidas em `03-priority-tags-filters.css` já contêm as declarações completas, incluindo `:hover:not(:disabled)` e `:disabled`. Validar que o visual do botão e cartão de coluna permanece íntegro nos temas Light, Dark e High Contrast.
- **Modo de Falha 2 (Quebra do teste estrutural de manifesto):** Remover `@import './styles/13-recovered.css'` de `src/App.css` sem atualizar `tests/unit/appCssStructure.test.ts` quebrará imediatamente a suíte de testes.
  - *Mitigação:* Atualização coordenada e atômica de `src/App.css` e `tests/unit/appCssStructure.test.ts`, garantindo que ambos reflitam a lista canônica de 12 módulos.
- **Modo de Falha 3 (Flutuação de cobertura abaixo do novo limiar):** Se um limiar de `functions` for configurado acima de 62.01%, qualquer refatoração futura falhará indevidamente o pipeline.
  - *Mitigação:* Calibrar os limiares com margem defensiva segura (`functions: 60`, `statements: 85`, `lines: 85`, `branches: 78`), travando contra regressões sem criar testes instáveis.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas:** 
  - Fase 3 atua estritamente na reconciliação dos 12 seletores duplicados (`02`, `03`, `08`, `10` e `cssDuplicationGuard.test.ts`).
  - Fase 4 atua estritamente na redistribuição dos blocos de `13-recovered.css` e atualização do manifesto e guarda estrutural (`01`, `02`, `06`, `12`, `App.css` e `appCssStructure.test.ts`).
  - Fase 5 atua estritamente na calibração de cobertura em `vite.config.ts`.
  - Nenhuma tarefa duplica responsabilidade ou concorre pela edição concorrente do mesmo bloco de código.
- **Coletivamente Exaustivas:** A totalidade dos 7 requisitos funcionais (`FR-001` a `FR-007`) e 5 critérios de sucesso (`SC-001` a `SC-005`) é coberta por tarefas atômicas explícitas.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A (Descartada):** Manter o arquivo `13-recovered.css` com comentários de exceção.
  - *Poda:* Rejeitada na clarificação (Pergunta 1); manter um arquivo heterogêneo perpetua dívida técnica e viola o Princípio II (Clean Architecture).
- **Alternativa B (Descartada):** Reduzir a baseline de seletores duplicados para 5 em vez de zerar.
  - *Poda:* Rejeitada na clarificação (Pergunta 3); a meta da visão oficial (`OPP-001`) é erradicação total (0 duplicatas).
- **Caminho Escolhido:** Deduplicação canônica completa, extinção de `13-recovered.css`, blindagem dos limiares em `vite.config.ts` e atualização das travas para tolerância zero.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Red-Bar Inicial:**
  - `tests/unit/cssDuplicationGuard.test.ts` passa apenas porque `DUPLICATE_BASELINE` possui 12 exceções; ao zerar a baseline para `new Set([])`, o teste reprova (Red-Bar) apontando as 12 violações.
  - `tests/unit/appCssStructure.test.ts` exige a presença de `13-recovered.css`.
- **Green-Bar Final:**
  - `tests/unit/cssDuplicationGuard.test.ts` passa com `DUPLICATE_BASELINE` vazio (`0` duplicatas).
  - `tests/unit/appCssStructure.test.ts` passa com 12 módulos canônicos.
  - `npm run test:coverage` passa com todos os limiares elevados satisfeitos e relatórios emitidos.
  - `npm test` passa com 701/701 testes verdes.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constituição I (Model Integrity):** Coerência total com a visão do projeto e histórico rastreável.
- **Constituição II (Clean Architecture):** Separação estrita de responsabilidade de apresentação por domínio.
- **Constituição III (Automated Quality Gates):** Travas mais rigorosas sem enfraquecer nenhum teste existente.
- **Constituição V (Simplicity & YAGNI):** Zero novas bibliotecas em `package.json`.

---

## Phase 1: Setup & Diagnóstico de Linha de Base

**Purpose**: Registrar o inventário de baseline dos seletores duplicados e das métricas de cobertura

- [x] T001 Mapear inventário e linha de base dos 12 seletores duplicados executando npx vitest run tests/unit/cssDuplicationGuard.test.ts ([#280](https://github.com/rogerteg/Metrik/issues/280))
- [x] T002 Registrar linha de base de cobertura executando npm run test:coverage e verificando artefatos em coverage/ ([#281](https://github.com/rogerteg/Metrik/issues/281))

---

## Phase 2: Foundational (Preparação das Travas de Regressão)

**Purpose**: Configurar as travas de qualidade para o novo patamar estrito

- [x] T003 Atualizar DUPLICATE_BASELINE para new Set([]) em tests/unit/cssDuplicationGuard.test.ts para atuar como red-bar estrito de deduplicação ([#282](https://github.com/rogerteg/Metrik/issues/282))

---

## Phase 3: User Story 1 - Deduplicação de Seletores CSS e Integridade da Cascata Visual (Priority: P1) 🎯 MVP

**Goal**: Eliminar 100% dos 12 seletores duplicados consolidando regras em seus módulos canônicos.

**Independent Test**: Executar `npx vitest run tests/unit/cssDuplicationGuard.test.ts` atestando código de saída 0 com zero seletores duplicados.

- [x] T004 [P] [US1] Remover declarações espúrias de .add-column-card, .add-column-icon e .btn-add-column em src/styles/02-task-detail-inline.css preservando as regras canônicas em src/styles/03-priority-tags-filters.css ([#283](https://github.com/rogerteg/Metrik/issues/283))
- [x] T005 [P] [US1] Consolidar as declarações duplicadas internas de .badge-cycle-time, .badge-lead-time e .badge-metric-time em um único bloco coeso em src/styles/02-task-detail-inline.css ([#284](https://github.com/rogerteg/Metrik/issues/284))
- [x] T006 [P] [US1] Consolidar as declarações duplicadas internas de .task-indicator-badge, .task-indicators e .task-metrics-badges em src/styles/02-task-detail-inline.css ([#285](https://github.com/rogerteg/Metrik/issues/285))
- [x] T007 [P] [US1] Remover a declaração duplicada de .task-blocked-dependency-chip em src/styles/02-task-detail-inline.css mantendo a regra canônica em src/styles/08-task-types-links.css ([#286](https://github.com/rogerteg/Metrik/issues/286))
- [x] T008 [P] [US1] Consolidar a declaração de .task-card-header em src/styles/01-design-system-core.css e src/styles/03-priority-tags-filters.css evitando redeclaração estrutural idêntica ([#287](https://github.com/rogerteg/Metrik/issues/287))
- [x] T009 [P] [US1] Unificar as duas declarações de topo de .metrik-comment-list em src/styles/10-comments-containment.css em uma única regra canônica ([#288](https://github.com/rogerteg/Metrik/issues/288))
- [x] T010 [US1] Executar npx vitest run tests/unit/cssDuplicationGuard.test.ts e validar que todos os 12 seletores foram 100% deduplicados (Green-Bar) ([#289](https://github.com/rogerteg/Metrik/issues/289))

**Checkpoint**: User Story 1 concluída — CSS com zero seletores duplicados e trava de regressão zerada.

---

## Phase 4: User Story 2 - Decomposição Modular e Redistribuição Coesa de Estilos (Priority: P2)

**Goal**: Redistribuir as regras de `src/styles/13-recovered.css` para domínios coesos e descontinuar o arquivo.

**Independent Test**: Executar `npx vitest run tests/unit/appCssStructure.test.ts` atestando aprovação da estrutura de 12 módulos.

- [x] T011 [P] [US2] Mover regras de .header-cluster, .header-cluster-divider, .task-nav-buttons e .btn-settings-trigger de src/styles/13-recovered.css para src/styles/01-design-system-core.css ([#290](https://github.com/rogerteg/Metrik/issues/290))
- [x] T012 [P] [US2] Mover regras de .task-qa-section, .task-qa-summary e .task-qa-summary-item de src/styles/13-recovered.css para src/styles/02-task-detail-inline.css ([#291](https://github.com/rogerteg/Metrik/issues/291))
- [x] T013 [P] [US2] Mover regras de .board-workspace-tag, .edit-ws-name e .board-metrics-summary de src/styles/13-recovered.css para src/styles/12-workspace.css ([#292](https://github.com/rogerteg/Metrik/issues/292))
- [x] T014 [P] [US2] Mover regras de .modal-title-with-color e .modal-error-banner de src/styles/13-recovered.css para src/styles/06-team-squad-modal.css ([#293](https://github.com/rogerteg/Metrik/issues/293))
- [x] T015 [US2] Remover @import './styles/13-recovered.css'; do manifesto src/App.css e excluir o arquivo src/styles/13-recovered.css ([#294](https://github.com/rogerteg/Metrik/issues/294))
- [x] T016 [US2] Atualizar EXPECTED_ORDER para os 12 módulos canônicos em tests/unit/appCssStructure.test.ts e validar aprovação do teste ([#295](https://github.com/rogerteg/Metrik/issues/295))

**Checkpoint**: User Story 2 concluída — arquitetura de estilos 100% modularizada e sem arquivos heterogêneos órfãos.

---

## Phase 5: User Story 3 - Governança de Cobertura de Testes e Limiares Automatizados (Priority: P2)

**Goal**: Elevar os limiares de cobertura em `vite.config.ts` e blindar a geração de relatórios.

**Independent Test**: Executar `npm run test:coverage` e certificar que todos os 4 limiares são atendidos e os relatórios são gravados.

- [x] T017 [US3] Atualizar thresholds em vite.config.ts para functions: 60, statements: 85, lines: 85, branches: 78 ([#296](https://github.com/rogerteg/Metrik/issues/296))
- [x] T018 [US3] Executar npm run test:coverage validando que a suíte atende a todos os novos limiares e que coverage/index.html e coverage/lcov.info são atualizados ([#297](https://github.com/rogerteg/Metrik/issues/297))

**Checkpoint**: User Story 3 concluída — cobertura protegida com limiares elevados e auditáveis.

---

## Phase 6: Polish & Validação Integrada

**Purpose**: Verificações finais de formatação, lint, suíte completa e build de produção

- [x] T019 [P] Executar npm run format para assegurar conformidade Prettier em todos os arquivos modificados ([#298](https://github.com/rogerteg/Metrik/issues/298))
- [x] T020 Executar npm run lint para garantir 0 erros e 0 warnings com a regra estrita de no-explicit-any ([#299](https://github.com/rogerteg/Metrik/issues/299))
- [x] T021 Executar suíte de testes unitários com npm test atestando 701/701 testes verdes ([#300](https://github.com/rogerteg/Metrik/issues/300))
- [x] T022 Executar compilação de produção com npm run build atestando tempo < 5s e zero erros ([#301](https://github.com/rogerteg/Metrik/issues/301))
- [x] T023 Executar o roteiro completo de validação documentado em specs/047-static-quality-governance/quickstart.md ([#302](https://github.com/rogerteg/Metrik/issues/302))

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Inicia imediatamente.
- **Phase 2 (Foundational)**: Zera a baseline na trava para que as deduplicações façam o teste transitar de Red para Green.
- **Phase 3 (User Story 1 - MVP)**: Reconciliação dos 12 seletores duplicados.
- **Phase 4 (User Story 2)**: Redistribuição de `13-recovered.css` e remoção do arquivo.
- **Phase 5 (User Story 3)**: Elevação dos limiares em `vite.config.ts`.
- **Phase 6 (Polish)**: Execução pós-conclusão de todas as histórias.

### Parallel Opportunities
- `T004`, `T005`, `T006`, `T007`, `T008`, `T009` podem ser executados com paralelismo de inspeção e edição por tratarem de arquivos/seções distintas.
- `T011`, `T012`, `T013`, `T014` podem ser desenvolvidos em paralelo antes de `T015` e `T016`.
- `T017` pode ser configurado em paralelo com a fase 4.

---

## Implementation Strategy: MVP First
1. Zerar a trava e eliminar os 12 seletores duplicados de CSS (`T003` a `T010`) -> **MVP Entregue**.
2. Redistribuir `13-recovered.css` e atualizar `App.css` e `appCssStructure.test.ts` (`T011` a `T016`).
3. Elevar limiares em `vite.config.ts` (`T017` e `T018`).
4. Validação integrada de linter, testes, cobertura e build (`T019` a `T023`).
