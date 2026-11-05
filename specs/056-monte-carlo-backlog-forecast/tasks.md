# Tasks: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Input**: Design documents from `specs/056-monte-carlo-backlog-forecast/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdades fundamentais e invariantes:**
  1. A simulação estocástica de Monte Carlo baseia-se na reamostragem empírica com reposição da série de Throughput diário real do quadro; previsões não podem ser geradas a partir de estimativas subjetivas ou distribuições paramétricas normais/gaussianas.
  2. Tarefas já concluídas (`completedAt` preenchido) representam trabalho pretérito e não demandam tempo futuro; apenas tarefas pendentes (`!completedAt`) compõem o tamanho do lote ($K$).
  3. A probabilidade de cumprimento de uma data meta ($D_{target}$) é a proporção de ensaios simulados que concluíram em até $N_{days} = \lfloor (D_{target} - D_{ref}) / 86.400.000 \rfloor$ dias. Se $D_{target} < D_{ref}$, $P = 0\%$.
  4. Amostras de Throughput com menos de 10 dias com entregas ($N < 10$) possuem alta variância e não possuem significância estatística, exigindo aviso explícito de insuficiência amostral (Padrão NIST).
- **Premissas acidentais descartadas:**
  1. Descartada a necessidade de rodar duas simulações separadas (uma para percentis e outra para a data meta). A CDF acumulada sobre os 10.000 ensaios de `runMonteCarloWhen` entrega o percentual exato da data meta em $< 2\text{ms}$ sem rodar novos sorteios.
  2. Descartada a criação de novas colunas ou estados de persistência para armazenar o escopo do forecast. A resolução opera como uma lente analítica em memória a partir dos cartões já existentes.

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)
- **Cenários de falha antecipados:**
  1. *Skew temporal nos testes*: Se o cálculo de dias até a data meta usar `new Date()`, os testes quebrarão quando o relógio do sistema avançar. **Mitigação**: Injetar `referenceDate?: Date` em todas as funções (`resolveBacklogScope`, `calculateTargetDateProbability`, `useBacklogForecast`).
  2. *Overflow do teto de linhas (Constituição II)*: O componente `MonteCarloSimulationView.tsx` já tem 337 linhas; expandi-lo diretamente geraria violação constitucional ($\ge 400$ linhas). **Mitigação**: Decomposição em 4 módulos especialistas (`monteCarloForecast.ts`, `useBacklogForecast.ts`, `BacklogForecastPanel.tsx`, `ForecastScopeCardList.tsx`), todos com $\le 280$ linhas.
  3. *Divisão por zero ou loop infinito com Throughput zerado*: Se o histórico não tiver nenhuma entrega, o sorteio pode travar ou gerar valores infinitos. **Mitigação**: Guarda de validação prévia em `validateThroughputSample` retornando `isSampleSufficient: false` e bloqueando a simulação.
  4. *Inconsistência de IDs ao alternar escopo*: Desmarcar cartões em uma Iniciativa e trocar para uma Sprint poderia manter IDs zumbis no conjunto de seleção. **Mitigação**: Reset atômico de `selectedTaskIds` na mudança de `scopeId` ou `scopeType`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Duplicação):**
  - `monteCarloForecast.ts`: Funções puras de cálculo matemático e resolução de escopo (sem estado React, sem JSX).
  - `useBacklogForecast.ts`: Hook de orquestração de estado e chamadas reativas (sem renderização visual).
  - `BacklogForecastPanel.tsx`: Componente de apresentação do layout e controles (sem lógica estocástica inline).
  - `ForecastScopeCardList.tsx`: Subcomponente focado exclusivamente na renderização da lista de cartões com checkboxes e selos.
  - Zero sobreposição de arquivos ou responsabilidades.
- **Exaustão Coletiva (Cobertura 100%):**
  - Cobre 100% dos requisitos funcionais (FR-001 a FR-009) e critérios de sucesso (SC-001 a SC-004) da `spec.md`.
  - Cobre todas as 4 User Stories (US1 a US4) com testes unitários e de integração dedicados.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa A**: Modal independente flutuante acionado apenas a partir do menu do cartão da Iniciativa.  
  *Poda*: Reduz a descoberta analítica; usuários não conseguiriam comparar o forecast do épico com a simulação geral do quadro.
- **Alternativa B**: Aba integrada dentro do `MonteCarloSimulationView` com seletor de escopo E botão de atalho contextual no modal da Iniciativa (*Caminho Selecionado*).  
  *Justificativa*: Maximiza a utilidade tanto para quem está na Central de Métricas quanto para quem está navegando no quadro Kanban.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - `tests/unit/monteCarloForecast.test.ts` deve falhar inicialmente comprovando que `calculateTargetDateProbability` e `resolveBacklogScope` ainda não estão implementados.
  - `tests/unit/useBacklogForecast.test.ts` deve falhar demonstrando a ausência do hook de seleção e simulação de escopo.
- **Critério determinístico de aceite (Green Bar):**
  - Todos os testes no Vitest passam com 100% de sucesso.
  - `tests/unit/moduleLineCountGuard.test.ts` passa confirmando que nenhum arquivo ultrapassa 400 linhas.
  - `npm test -- --run` passa com mais de 926 testes verdes sem regressões.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constituição I (SDD)**: Respeitada — especificação, clarificação, plano e contratos concluídos antes das tarefas.
- **Constituição II (Modularidade & Linhas)**: Respeitada — módulos fatiados com limite estrito $\le 400$ linhas.
- **Constituição III (Verificação Automatizada)**: Respeitada — suíte completa de testes no Vitest com blindagem temporal (`referenceDate`).
- **Constituição VII (Independência de Marca)**: Respeitada — terminologia canônica Lean/NIST sem menção a ferramentas comerciais.
- **Constituição VIII (Local-First)**: Respeitada — execução 100% no cliente sem exigência de nuvem.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação de contratos e inicialização de estilos encapsulados

- [X] T001 Validar contratos TypeScript em `specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts.ts` e modelos de dados em `specs/056-monte-carlo-backlog-forecast/data-model.md`
- [X] T002 [P] Criar arquivo de estilos encapsulados em `src/styles/14-monte-carlo-forecast.css` e registrar o `@import` correspondente no manifesto `src/App.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Funções utilitárias puras de escopo, probabilidade estocástica e validação amostral NIST

**⚠️ CRITICAL**: Nenhuma User Story pode ser iniciada antes da conclusão desta fase

- [X] T003 [P] Escrever testes unitários em `tests/unit/monteCarloForecast.test.ts` para `resolveBacklogScope` (filtros por iniciativa, sprint, tag e backlog geral) e `validateThroughputSample` ($N \ge 10$ dias)
- [X] T004 [P] Implementar a função pura `resolveBacklogScope` em `src/utils/monteCarloForecast.ts` mapeando tarefas pendentes (`!completedAt`) por Iniciativa, Sprint ou Tag, com suporte a seleção de IDs
- [X] T005 [P] Implementar a função pura `validateThroughputSample` em `src/utils/monteCarloForecast.ts` validando limiar amostral NIST ($N \ge 10$ dias com entregas na janela) e detecção de vazão zero
- [X] T006 Implementar a função pura `calculateTargetDateProbability` em `src/utils/monteCarloForecast.ts` calculando a CDF de sucesso sobre os ensaios de `runMonteCarloWhen` com suporte a `referenceDate?: Date`

**Checkpoint**: Camada matemática fundamental concluída e testada com 100% de sucesso.

---

## Phase 3: User Story 1 - Previsão Probabilística de Conclusão por Iniciativa ou Épico (Priority: P1) 🎯 MVP

**Goal**: Permitir selecionar uma Iniciativa e calcular as datas estimadas de término com 50%, 85% e 95% de confiança via Monte Carlo.

**Independent Test**: Selecionar uma Iniciativa com 8 tarefas pendentes no seletor de escopo; o sistema deve executar 10.000 iterações estocásticas e exibir os cartões com as datas de calendário projetadas para P50, P85 e P95.

### Tests for User Story 1 🧪

- [X] T007 [P] [US1] Escrever testes unitários para o hook `useBacklogForecast` em `tests/unit/useBacklogForecast.test.ts` verificando carregamento de iniciativas, cálculo de pendências e percentis P50/P85/P95 com `referenceDate` estático

### Implementation for User Story 1

- [X] T008 [US1] Implementar hook reativo `useBacklogForecast` em `src/hooks/useBacklogForecast.ts` gerenciando escopo ativo, itens selecionados e orquestração de simulação com `runMonteCarloWhen`
- [X] T009 [P] [US1] Criar componente `ForecastScopeCardList.tsx` em `src/components/MonteCarlo/ForecastScopeCardList.tsx` exibindo contadores de progresso (concluídas vs pendentes) e caixas de seleção (*checkboxes*)
- [X] T010 [US1] Implementar componente principal `BacklogForecastPanel.tsx` em `src/components/MonteCarlo/BacklogForecastPanel.tsx` com seletor de Iniciativa, cards de percentis de confiança (P50/P85/P95) e visualização de escopo
- [X] T011 [US1] Integrar o modo "Previsão de Backlog & Épicos" no cabeçalho de abas em `src/components/MonteCarloSimulationView.tsx` renderizando `BacklogForecastPanel`

**Checkpoint**: User Story 1 concluída e testada independentemente. O MVP de previsão por iniciativa está plenamente funcional!

---

## Phase 4: User Story 2 - Cálculo de Probabilidade de Cumprimento de Data Meta (Priority: P2)

**Goal**: Permitir definir uma data meta (pré-carregada do `dueDate` da Iniciativa ou editada livremente) e calcular a probabilidade exata de entrega com classificação de risco.

**Independent Test**: Informar uma data meta em que 88% das simulações concluem a tempo; o sistema deve exibir "88% de probabilidade" com selo verde ("Baixo Risco"). Alterar a data para um prazo inviável deve atualizar para selo vermelho com probabilidade $< 20\%$.

### Tests for User Story 2 🧪

- [X] T012 [P] [US2] Escrever testes unitários em `tests/unit/monteCarloForecast.test.ts` para cálculo de probabilidade de data meta avaliando classificação de risco (`low` $\ge 85\%$, `moderate` $50\%..84\%$, `high` $20\%..49\%$, `critical` $<20\%$) e datas passadas

### Implementation for User Story 2

- [X] T013 [P] [US2] Criar componente `TargetDateRiskBadge.tsx` em `src/components/MonteCarlo/TargetDateRiskBadge.tsx` renderizando selo visual com probabilidade percentual, ícone e cor semântica de risco
- [X] T014 [US2] Integrar campo de Data Meta com calendário e inferência automática a partir do `dueDate` da Iniciativa ou `endDate` da Sprint em `src/components/MonteCarlo/BacklogForecastPanel.tsx`
- [X] T015 [US2] Conectar o resultado de `calculateTargetDateProbability` ao estado do hook `useBacklogForecast.ts` e renderizar o card de diagnóstico de probabilidade no painel

**Checkpoint**: User Stories 1 e 2 integradas e testadas. A previsão agora avalia cumprimento de metas acordadas com classificação de risco.

---

## Phase 5: User Story 3 - Filtro por Sprint, Tag ou Backlog Geral com Seleção Fina (Priority: P3)

**Goal**: Expandir o seletor de escopo para Sprints, Tags e Backlog Geral, permitindo desmarcar cartões pontuais para simulações de "what-if".

**Independent Test**: Filtrar por tag `#MVP` (5 tarefas) e desmarcar 1 cartão; a simulação recalcula instantaneamente para 4 tarefas, encurtando as datas projetadas.

### Tests for User Story 3 🧪

- [X] T016 [P] [US3] Escrever testes unitários em `tests/unit/useBacklogForecast.test.ts` para alternância de agrupadores (Sprint, Tag, Backlog Geral) e mutação de seleção pontual de cartões (`toggleTaskSelection`)

### Implementation for User Story 3

- [X] T017 [US3] Estender `useBacklogForecast.ts` com handlers de seleção granular (`toggleTaskSelection`, `selectAll`, `clearSelection`) e extração dinâmica de Sprints e Tags presentes no quadro
- [X] T018 [P] [US3] Adicionar seletor de tipo de escopo (Iniciativas, Sprints, Tags, Backlog Geral) com contadores automáticos em `src/components/MonteCarlo/BacklogForecastPanel.tsx`
- [X] T019 [US3] Adicionar botão de atalho contextual ("🎲 Prever Término") no modal de detalhes da tarefa em `src/components/TaskDetailsModal.tsx` para itens do tipo Iniciativa, direcionando para o painel com o escopo pré-carregado

**Checkpoint**: User Stories 1, 2 e 3 plenamente operacionais. Flexibilidade de escopo e atalhos de navegação entregues.

---

## Phase 6: User Story 4 - Resguardo Amostral e Alinhamento com SLE Dinâmico (Priority: P4)

**Goal**: Alertar sobre amostras de Throughput insuficientes ($N < 10$) ou cartões em andamento violando seus SLEs individuais (P85/P95).

**Independent Test**: Em um quadro com menos de 10 dias com entregas registradas, o painel exibe aviso instrutivo de dados insuficientes e desativa conclusões taxativas.

### Tests for User Story 4 🧪

- [X] T020 [P] [US4] Escrever testes de integração em `tests/unit/BacklogForecastPanel.test.tsx` testando renderização de banner de amostra insuficiente e exibição de selos de risco de SLE nos cartões

### Implementation for User Story 4

- [X] T021 [US4] Integrar selos de SLE dinâmico (`TaskSleBadge`) e indicador de tarefas estagnadas nos itens listados em `src/components/MonteCarlo/ForecastScopeCardList.tsx`
- [X] T022 [US4] Adicionar banner de diagnóstico estatístico NIST em `src/components/MonteCarlo/BacklogForecastPanel.tsx` exibindo alertas quando $N < 10$ dias de vazão ou quando 100% do escopo estiver bloqueado

**Checkpoint**: Todas as 4 User Stories concluídas e protegidas por salvaguardas estatísticas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de conformidade constitucional, qualidade de código e integridade de pipeline

- [X] T023 [P] Validar limite constitucional de linhas de código em todos os módulos novos e alterados via `tests/unit/moduleLineCountGuard.test.ts` (garantir estritamente $\le 400$ linhas)
- [X] T024 [P] Executar checagem estática de tipos (`npx tsc --noEmit`) e linter (`npm run lint`) garantindo zero erros
- [X] T025 [P] Executar validação de formatação Prettier (`npm run format:check`)
- [X] T026 Executar suíte completa de testes automatizados com `npm test -- --run` para garantir zero regressões nos mais de 926 testes existentes
- [X] T027 Validar os cenários de uso manual descritos no guia rápido `specs/056-monte-carlo-backlog-forecast/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as User Stories (funções matemáticas e de escopo).
- **User Story 1 (Phase 3 - P1 MVP)**: Depende da Phase 2. Entrega a previsão por iniciativa e a nova aba no painel.
- **User Story 2 (Phase 4 - P2)**: Depende de US1 (painel existente) e adiciona análise de probabilidade de data meta.
- **User Story 3 (Phase 5 - P3)**: Depende de US1 e US2. Adiciona suporte a Sprints/Tags e atalho no modal de Iniciativa.
- **User Story 4 (Phase 6 - P4)**: Depende de US3. Conecta salvaguardas amostrais NIST e selos de SLE dinâmico.
- **Polish (Phase 7)**: Depende de todas as User Stories concluídas.

### Parallel Opportunities

- **Phase 1**: `T001` e `T002` podem rodar em paralelo.
- **Phase 2**: `T003`, `T004` e `T005` podem rodar em paralelo.
- **Phase 3 (US1)**: `T007` (testes) e `T009` (componente de lista) podem rodar em paralelo antes de `T010` e `T011`.
- **Phase 4 (US2)**: `T012` (testes) e `T013` (badge) podem rodar em paralelo.
- **Phase 5 (US3)**: `T016` (testes) e `T018` (seletor) podem rodar em paralelo.
- **Phase 7**: `T023`, `T024` e `T025` podem rodar em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 (Setup de estilos e contratos).
2. Concluir Phase 2 (Foundational: resolvedor de escopo e motor de CDF).
3. Concluir Phase 3 (US1: Hook de forecast, lista de cartões e aba no painel).
4. **VALIDAR MVP**: Executar `npx vitest run tests/unit/useBacklogForecast.test.ts` e validar seleção de iniciativa e percentis P50/P85/P95.

### Incremental Delivery

1. Setup + Foundational -> Motor matemático e resolvedor de escopo prontos.
2. US1 -> Previsão probabilística por Iniciativa no painel de Monte Carlo (MVP!).
3. US2 -> Cálculo de probabilidade de cumprimento de Data Meta com classificação de risco.
4. US3 -> Suporte a Sprints, Tags, Backlog Geral e atalho contextual no modal da Iniciativa.
5. US4 -> Resguardo amostral NIST ($N \ge 10$) e alinhamento com SLE dinâmico nos cartões.
6. Polish -> Conformidade total de tipos, linter, formatação e 926+ testes verdes.

