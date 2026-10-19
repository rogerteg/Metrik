# Tasks: Confiabilidade do Pipeline e Verificação Automatizada (Ciclo 1)

**Feature**: `044-pipeline-reliability`  
**Input**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md) | [data-model.md](./data-model.md) | [contracts/pipeline-contracts.md](./contracts/pipeline-contracts.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório per Constitution VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais Irredutíveis:**
  1. Um teste automatizado só é confiável se seu resultado for **puro e determinístico**, dependendo exclusivamente de suas entradas e asserções, nunca de variáveis de ambiente externas não controladas (como o relógio físico do sistema operacional).
  2. As falhas observadas em `CycleTimeScatterPlot.test.tsx` e `MonteCarloSimulationView.test.tsx` ocorrem porque os componentes computam janelas temporais relativas a `new Date()` (14, 30, 60 dias) enquanto as massas mockadas possuem datas estáticas (agosto/setembro de 2026).
  3. Para que a verificação seja imutável ao longo do tempo, o relógio do ambiente deve ser controlado explicitamente via `vi.useFakeTimers()` no contexto do teste, restaurando `vi.useRealTimers()` no término.
  4. Um gate de qualidade de cobertura só é válido se gravar artefatos auditáveis em disco (`coverage/index.html` e `coverage/lcov.info`), comprovando que o código foi efetivamente exercitado.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Cenários Hipotéticos de Falha Grave em Produção/CI:**
  - *Falha 1 (Vazamento de Timers Mockados):* Se `vi.useFakeTimers()` for chamado sem um `afterEach(() => vi.useRealTimers())` limpo e robusto, outros testes executados na mesma thread de worker que dependem de timeouts reais podem travar ou disparar falsos positivos.
    - *Mitigação:* Isolar estritamente o lifecycle dentro de `beforeEach` e `afterEach` específicos dos arquivos afetados, garantindo a restauração mesmo em caso de falha de asserção.
  - *Falha 2 (Enfraquecimento Oculto de Asserções):* Um desenvolvedor tenta fazer o teste passar alterando o expect para aceitar estado vazio ou removendo asserções de dots do gráfico.
    - *Mitigação:* Violação expressa da Constituição III.3. Nenhuma asserção existente deve ser deletada ou afrouxada; os elementos gráficos originais (`scatter-dot-task-*`, `target-days-input`, histograma) devem ser renderizados e encontrados.
  - *Falha 3 (Aborto Silencioso do Reporter de Cobertura):* O comando de cobertura falha silenciosamente sem gravar arquivos se o diretório de destino não tiver permissão ou se o processo terminar abruptamente.
    - *Mitigação:* Contrato explícito validando `Test-Path coverage/index.html` com tamanho > 0 bytes.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME):**
  - Fase 3 (US1) cuida unicamente da resolução determinística dos 7 testes com acoplamento temporal nos 2 arquivos afetados.
  - Fase 4 (US2) cuida unicamente da configuração, geração e persistência física dos relatórios de cobertura.
  - Fase 5 (US3) cuida unicamente da verificação estática do ESLint e do teto de avisos (ratchet ≤ 40).
  - Nenhuma tarefa sobrepõe arquivos ou responsabilidades de outra.
- **Coletivamente Exaustivas (CE):**
  - A união de todas as tarefas cobre 100% dos requisitos funcionais (FR-001 a FR-006) e dos critérios de sucesso (SC-001 a SC-005) definidos em `spec.md`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Ramo A (Geração Dinâmica de Datas nas Fixtures):** Calcular datas de tarefas com base em `Date.now() - 5 dias`.
  - *Poda:* Descartado porque quebra testes que validam a formatação textual explícita de datas renderizadas nas tooltips dos gráficos e exige alteração invasiva em dezenas de fixtures.
- **Ramo B (Adicionar prop `referenceDate` nos Componentes de Produção):**
  - *Poda:* Descartado por violar o Princípio V (Simplicity & YAGNI) — modificaria contratos de produção exclusivamente para conveniência de teste.
- **Ramo C Escolhido (Congelamento Temporal com `vi.setSystemTime` no Teste):**
  - *Critério de Escolha:* Menor superfície de alteração, zero impacto no código de produção, garantia de isolamento hermético e compatibilidade total com Vitest e JSDOM.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável (Red Bar):**
  - Executar `npm test tests/unit/CycleTimeScatterPlot.test.tsx tests/unit/MonteCarloSimulationView.test.tsx` hoje resulta em **7 testes falhando** com erro `Unable to find an element`.
- **Critério Determinístico de Aceite (Green Bar):**
  - Após a aplicação de `vi.useFakeTimers({ toFake: ['Date'] })` e `vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z'))`, a execução dos mesmos arquivos resulta em **100% dos testes aprovados** (14/14 testes passando).
  - A execução de `npm run test` passa em todos os 113 arquivos (701 testes verdes).
  - A execução de `npm run test:coverage` grava comprovadamente os arquivos `coverage/index.html` e `coverage/lcov.info`.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constituição:**
  - *Princípio I (SDD):* As tarefas derivam diretamente de `spec.md` e `plan.md`.
  - *Princípio III (Automated Verification):* Restabelece a suíte verde sem afrouxamento de asserções (III.3) e garante que o gate de cobertura comprove seus relatórios (III.4).
  - *Princípio V (Simplicity):* Nenhuma dependência externa adicionada.
  - *Princípio VII (Brand Independence):* Nenhuma nomenclatura de fornecedor terceiro é utilizada.

---

## Phase 1: Setup & Verificação da Linha de Base

**Purpose**: Capturar a linha de base de falhas pré-existentes e garantir ambiente pronto

- [X] T001 Executar a suíte de testes atual e registrar as falhas em tests/unit/CycleTimeScatterPlot.test.tsx e tests/unit/MonteCarloSimulationView.test.tsx conforme baseline da Constituição III.3

---

## Phase 2: Foundational (Infraestrutura de Testes e Coverage)

**Purpose**: Garantir que as configurações do Vitest suportem reporters completos de cobertura e isolamento temporal

- [X] T002 Verificar e ajustar a configuração de coverage em vite.config.ts para assegurar os reporters ['text-summary', 'html', 'lcov'] e reportsDirectory './coverage'

---

## Phase 3: User Story 1 - Confiança na Suíte sem Dependência Temporal (Priority: P1) 🎯 MVP

**Goal**: Eliminar o apodrecimento temporal dos testes garantindo que 100% dos testes em CycleTimeScatterPlot e MonteCarloSimulationView executem com sucesso em qualquer data.

**Independent Test**: Executar `npm test tests/unit/CycleTimeScatterPlot.test.tsx tests/unit/MonteCarloSimulationView.test.tsx` e validar 100% de aprovação (zero falhas).

- [X] T003 [P] [US1] Adicionar beforeEach com vi.useFakeTimers({ toFake: ['Date'] }) e vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z')) e afterEach com vi.useRealTimers() em tests/unit/CycleTimeScatterPlot.test.tsx
- [X] T004 [P] [US1] Adicionar beforeEach com vi.useFakeTimers({ toFake: ['Date'] }) e vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z')) e afterEach com vi.useRealTimers() em tests/unit/MonteCarloSimulationView.test.tsx
- [X] T005 [US1] Executar a suíte completa de testes com npm run test e validar que todos os 113 arquivos e mais de 700 casos de teste passam com zero falhas

**Checkpoint**: Suíte de testes 100% verde (701/701 testes passando).

---

## Phase 4: User Story 2 - Comprovação de Cobertura com Relatórios Persistidos (Priority: P1)

**Goal**: Garantir que a execução do gate de cobertura gere e persista fisicamente os relatórios em disco (`coverage/`), cumprindo a Constituição III.4.

**Independent Test**: Executar `npm run test:coverage` e validar a presença física e legibilidade dos arquivos `coverage/index.html` e `coverage/lcov.info`.

- [X] T006 [US2] Executar npm run test:coverage e verificar a geração dos relatórios no terminal e no diretório coverage/
- [X] T007 [US2] Validar a existência dos arquivos coverage/index.html e coverage/lcov.info com tamanho maior que zero bytes

**Checkpoint**: Gate de cobertura auditável e comprovado com artefatos físicos persistidos.

---

## Phase 5: User Story 3 - Ratchet Estrito de Qualidade e Teto de Avisos Estáticos (Priority: P2)

**Goal**: Garantir que o linter passe com zero erros e contagem de avisos não-crescente (ratchet ≤ 40).

**Independent Test**: Executar `npm run lint` e validar exit code 0 com no máximo 40 avisos.

- [X] T008 [US3] Executar npm run lint e certificar que nenhum erro impeditivo foi introduzido e que a contagem de avisos permanece ≤ 40

---

## Phase 6: Polish & Validação Integrada

**Purpose**: Verificações finais de empacotamento e conformidade global

- [X] T009 [P] Executar npm run build e certificar compilação limpa (tsc e vite build com exit code 0)
- [X] T010 [P] Executar npm run format:check e certificar conformidade Prettier
- [X] T011 Executar o cenário de validação rápida documentado em specs/044-pipeline-reliability/quickstart.md


---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Pode iniciar imediatamente.
- **Phase 2 (Foundational)**: Bloqueia a execução do gate de cobertura.
- **Phase 3 (User Story 1 - MVP)**: Pode executar em paralelo ou logo após Phase 1.
- **Phase 4 (User Story 2)**: Depende da conclusão da Phase 3 (suíte precisa estar verde para gerar cobertura completa).
- **Phase 5 (User Story 3)**: Depende das alterações nos arquivos de teste para validar ausência de novos warnings.
- **Phase 6 (Polish)**: Depende de todas as fases anteriores.

### Parallel Opportunities
- T003 e T004 operam em arquivos de teste distintos e podem ser implementados em paralelo.
- T009 e T010 podem ser executados em paralelo.

---

## Implementation Strategy: MVP First
1. Implementar **T003** e **T004** para restaurar o verde dos 7 testes com falha.
2. Validar imediatamente com **T005** (`npm run test`). Isso entrega o **MVP (User Story 1)**.
3. Rodar **T006** e **T007** para gerar e certificar os artefatos de cobertura (User Story 2).
4. Validar o teto do linter com **T008** (User Story 3) e concluir com a validação integrada (Phase 6).
