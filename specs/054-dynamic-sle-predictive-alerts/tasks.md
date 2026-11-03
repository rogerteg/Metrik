# Tasks: 054 — Previsibilidade Dinâmica & Alertas de SLE (Service Level Expectation)

**Input**: Design documents from `specs/054-dynamic-sle-predictive-alerts/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/sle-prediction-contracts.ts`, `quickstart.md`)  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`  
**Tests**: Included per TDD methodology and project guidelines.  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdades fundamentais e invariantes:**
  - O tempo de ciclo (*Cycle Time*) é uma métrica histórica estática calculada apenas após a conclusão (`completedAt - startedAt`).
  - O envelhecimento do trabalho em progresso (*WIP Aging*) é a variável dinâmica do tempo presente (`Date.now() - (task.startedAt || task.createdAt)`).
  - A Expectativa de Nível de Serviço (*Service Level Expectation - SLE*) é uma previsão probabilística empírica fundamentada na distribuição histórica observada do time (P50, P85, P95).
  - Distribuições de tempo de ciclo em desenvolvimento de software são não-paramétricas, assimétricas e possuem cauda longa. O cálculo por percentis empíricos ordenados (NIST / interpolação linear) é o único método matematicamente coerente; média e desvio-padrão gaussianos são epistemologicamente falhos neste domínio.
  - Para um conjunto amostral de itens concluídos inferior a 5 tarefas (`sampleSize < 5`), não existe base empírica suficiente para inferência estatística sem risco de ruído; logo, o motor deve declarar estado `insufficient_data` e silenciar alertas precoces.
- **Premissas acidentais descartadas:**
  - Descartada qualquer dependência de bibliotecas de Machine Learning ou chamadas a servidores remotos: o cálculo estatístico é 100% puro, determinístico e executado em memória pelo navegador ($O(1)$ por cartão ativo após computação dos percentis em $O(N \log N)$).
  - Descartada a exibição de badges de SLE em colunas de categoria `done` (itens concluídos possuem tempo definitivo) e colunas de categoria `todo` (itens não iniciados não possuem aging ativo).

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)
- **Cenários de falha antecipados:**
  - *Cenário 1 (Timestamps anômalos ou relógio com skew)*: `startedAt` ou `createdAt` com timestamp no futuro ou corrompido gerando aging negativo ou `NaN`.
    - *Mitigação*: Normalização defensiva com `Math.max(0, elapsedMs)` e guarda de parsing que converte datas inválidas para 0 dias sem lançar exceções.
  - *Cenário 2 (Degradação de desempenho por re-render do Kanban)*: Recalcular SLE em loop contínuo gerando re-renders visíveis e congelamento de interface com centenas de cartões.
    - *Mitigação*: Percentis computados uma única vez via `useMemo` na alteração de tarefas concluídas e avaliação de cards acoplada ao tick de 60s do temporizador global do Metrik.
  - *Cenário 3 (Corrupção de localStorage)*: Leitura de JSON inválido na chave `metrik_sle_config_${boardId}` causando travamento da aplicação.
    - *Mitigação*: Leitura defensiva com `try/catch` e fallback automático para a configuração padrão `DEFAULT_SLE_CONFIG`.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Duplicação):**
  - `src/types/sle.ts`: Unicamente definições de tipos e interfaces do domínio.
  - `src/utils/slePredictor.ts`: Motor estatístico desacoplado de React e de manipulação de DOM.
  - `src/utils/sleStorage.ts`: Gerenciamento exclusivo de I/O no `localStorage`.
  - `src/hooks/useDynamicSle.ts`: Único ponto de orquestração reativa de estado e memoização por quadro.
  - `src/components/Task/TaskSleBadge.tsx`: Componente visual puro de renderização do badge no cartão.
  - `src/components/Task/TaskSlePopover.tsx`: Popover flutuante contendo régua e detalhes estatísticos.
  - `src/components/FilterBar.tsx` & `src/hooks/useBoardFilters.ts`: Responsáveis unicamente pelo filtro rápido de cartões.
  - `src/components/Settings/BoardPoliciesTab.tsx`: Configuração de preferências e sensibilidade.
- **Exaustão Coletiva (Cobertura 100%):**
  - Cobre 100% dos requisitos funcionais (FR-001 a FR-010) e cenários de aceitação de todas as User Stories (P1 a P4), além dos critérios de sucesso (SC-001 a SC-005) e salvaguardas constitucionais.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Caminhos avaliados para o cálculo:**
  - *Opção 1 (Cálculo individual por cartão no próprio componente `Task`)*: Cada cartão receberia a lista de todas as tarefas e calcularia os percentis. *Podada:* Complexidade $O(C \times N \log N)$, gerando dezenas de ordenações repetidas do histórico.
  - *Opção 2 (Cálculo centralizado no quadro via hook `useDynamicSle`)*: Os percentis são gerados uma única vez ($O(N \log N)$) e os cartões ativos são indexados em um mapa `Record<string, CardSlePrediction>` com acesso $O(1)$. *Escolhida:* Desempenho sub-milissegundo comprovado.
- **Caminhos avaliados para o Popover Informativo:**
  - *Opção 1 (Tooltip nativo HTML `title`)*: *Podada:* Limita a visualização a texto puro, impedindo a exibição da régua visual graduada dos percentis e deltas coloridos requeridos na US2.
  - *Opção 2 (Popover flutuante com suporte a mouse/teclado)*: *Escolhida:* Permite visual rico, régua comparativa e fechamento suave com tolerância de 150ms.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Escrever testes unitários em `tests/unit/slePredictor.test.ts` que falhem comprovando a ausência do cálculo de P50/P85/P95, envelhecimento e classificação de risco antes de implementar `slePredictor.ts`.
  - Escrever testes em `tests/unit/sleStorage.test.ts` e `tests/unit/TaskSleBadge.test.tsx` garantindo falhas prévias antes dos componentes visuais e de persistência.
- **Critério determinístico de aceite (Green Bar):**
  - Suíte completa de testes passando via `npm test -- --run`.
  - Verificação de tipos TypeScript (`npm run build`) e estilo de código (`npm run lint` e `npm run format:check`) sem erros.
  - `tests/unit/moduleLineCountGuard.test.ts` validando que nenhum arquivo excede o limite de 400 linhas.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Artigo I (SDD)**: Especificação, plano, contratos e tarefas formalizados antes da implementação.
- **Artigo II (Modularidade)**: Todos os novos módulos estruturados para ficarem abaixo de 200 linhas (limite constitucional de 400 linhas).
- **Artigo III (Testes Automatizados)**: Testes unitários para motor estatístico, persistência e componentes visuais.
- **Artigo IV (Sem Falhas Silenciosas)**: Logs diagnósticos estruturados com prefixo `[Metrik][SLE]`.
- **Artigo V (Simplicidade & YAGNI)**: Reutilização de rotinas estatísticas já validadas no Metrik sem dependências externas.
- **Artigo VII (Identidade de Marca)**: Terminologia estritamente científica/ágil (*Service Level Expectation*, *NIST Percentiles*, *Cycle Time*, *WIP Aging*). Zero referências a marcas comerciais externas.
- **Artigo VIII (Local-First)**: Execução 100% no cliente sem dependência de nuvem, banco remoto ou rede.
- **Artigo IX (Proteção de Dados)**: Validação defensiva contra JSON inválido ou campos nulos.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição canônica de tipos e contratos de dados para SLE

- [X] T001 Criar tipos e interfaces canônicas de SLE em `src/types/sle.ts` com constraints verbatim de `data-model.md`: `SleRiskLevel` (`'normal' | 'warning_p50' | 'risk_p85' | 'critical_p95' | 'insufficient_data'`), `SleThresholds` (`p50Days`, `p85Days`, `p95Days`, `sampleSize`, `isStatisticallySignificant`), `CardSlePrediction` (`taskId`, `agingDays`, `thresholds`, `effectiveTargetDays`, `riskLevel`, `daysToBreach`, `percentageOfTarget`, `label`), e `SleConfig` (`boardId: string`, `customTargetDays: number | null`, `enableP50Alert: boolean`, `enableP95Alert: boolean`, `updatedAt: string`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Motor puro estatístico de SLE, persistência defensiva Local-First e hook de estado reativo

- [X] T002 [P] Criar testes unitários do motor estatístico de SLE em `tests/unit/slePredictor.test.ts` validando cálculo de P50/P85/P95, aging days, classificação de risco (`normal`, `warning_p50`, `risk_p85`, `critical_p95`), limiar amostral mínimo (`sampleSize < 5 -> insufficient_data`) e datas anômalas/futuras
- [X] T003 Implementar motor puro de cálculo de percentis e diagnóstico preditivo em `src/utils/slePredictor.ts` exportando `calculateThresholds` e `predictCardSle` com normalização defensiva de datas e logs `[Metrik][SLE]`
- [X] T004 [P] Criar testes unitários de persistência Local-First de configuração de SLE em `tests/unit/sleStorage.test.ts` testando leitura, gravação e recuperação defensiva contra JSON corrompido no `localStorage`
- [X] T005 Implementar serviço de persistência Local-First em `src/utils/sleStorage.ts` para chave `metrik_sle_config_${boardId}` com esquema padrão `DEFAULT_SLE_CONFIG` e validação defensiva
- [X] T006 [P] Criar testes unitários do hook reativo de SLE em `tests/unit/useDynamicSle.test.ts` verificando memoização de percentis e atualização temporal
- [X] T007 Implementar hook reativo de SLE por quadro em `src/hooks/useDynamicSle.ts` retornando `thresholds`, `predictions` (mapa indexado por `taskId`), `config` e mutador `updateConfig`

---

## Phase 3: User Story 1 - Badges Preditivos de Risco de SLE nos Cartões do Quadro (Priority: P1) 🎯 MVP

**Goal**: Exibir nos cartões em andamento do Kanban um badge visual preditivo indicando o nível de saúde de entrega frente ao histórico da equipe (Atenção P50, Risco SLE P85, Crítico P95).

**Independent Test**: Quadro com percentis históricos P50 = 2d, P85 = 4d, P95 = 7d. Cartão em progresso com aging de 2.5d renderiza badge amarelo `⏳ Atenção (P50)`; com aging de 4.5d renderiza badge laranja `⚠️ Risco SLE (P85)`; com aging de 8d renderiza badge vermelho pulsante `🚨 Crítico (P95)`. Cartões em colunas `todo` e `done` não renderizam o badge.

### Tests for User Story 1 🧪

- [X] T008 [P] [US1] Criar testes unitários e de renderização de `TaskSleBadge` em `tests/unit/TaskSleBadge.test.tsx` testando renderização de cada nível de risco (`warning_p50`, `risk_p85`, `critical_p95`), estado neutro para `insufficient_data` e ausência de renderização para status `normal`

### Implementation for User Story 1

- [X] T009 [US1] Implementar componente visual `src/components/Task/TaskSleBadge.tsx` com paleta semântica do Metrik (amarelo P50, laranja P85, vermelho P95), ícones correspondentes, atributo `aria-label` e microinterações
- [X] T010 [US1] Estender `TaskBadgesProps` em `src/components/Task/types.ts` e `TaskProps` em `src/components/Task.tsx` para aceitar `slePrediction?: CardSlePrediction` e `isColumnActive?: boolean`
- [X] T011 [US1] Integrar `TaskSleBadge` em `src/components/Task/TaskBadges.tsx` para renderizar o badge preditivo apenas quando a tarefa estiver ativa (não concluída e coluna de processamento)
- [X] T012 [US1] Conectar previsões de SLE em `src/components/BoardTask.tsx` repassando `slePrediction={predictions[task.id]}` para `<Task />`

**Checkpoint**: User Story 1 concluída e testada de forma independente. O quadro Kanban já exibe badges de SLE em tempo real nos cartões (MVP funcional!).

---

## Phase 4: User Story 2 - Popover / Tooltip Analítico de Previsibilidade ao Passar o Mouse (Priority: P2)

**Goal**: Exibir popover contextual rico com régua graduada horizontal de percentis (P50, P85, P95), dias decorridos e distância para estouro ao passar o cursor ou focar o badge de SLE.

**Independent Test**: Posicionar o cursor sobre o badge de um cartão com 4.5 dias de aging e verificar abertura do popover flutuante contendo régua graduada, aging formatado ("4,5 dias"), SLE P85 da equipe e delta de estouro (+0,5 dias). Verificar fechamento com tolerância de 150ms ao retirar o cursor.

### Tests for User Story 2 🧪

- [X] T013 [P] [US2] Criar testes unitários para o popover analítico em `tests/unit/TaskSlePopover.test.tsx` testando exibição da régua graduada, cálculos de porcentagem na barra, indicador de delta de estouro, fechamento suave por timeout e acessibilidade (`role="tooltip"`)

### Implementation for User Story 2

- [X] T014 [US2] Implementar componente de popover analítico `src/components/Task/TaskSlePopover.tsx` com régua graduada de percentis (P50, P85, P95), marcador do aging atual, exibição de dias restantes ou estourados e proteção contra overflow de tela
- [X] T015 [US2] Conectar `TaskSlePopover` em `src/components/Task/TaskSleBadge.tsx` com disparadores de mouse (`mouseenter`/`mouseleave` com debounce de 150ms) e teclado (`focus`/`blur`/`Escape`)

**Checkpoint**: User Stories 1 e 2 funcionam de forma integrada. O usuário visualiza o badge e inspeciona o popover explicativo.

---

## Phase 5: User Story 3 - Filtro de Foco Rápido em Itens com Risco de SLE (Priority: P3)

**Goal**: Permitir filtrar o quadro Kanban com um único clique para exibir apenas os cartões que estão com alertas de SLE ativos (P50, P85 ou P95).

**Independent Test**: Em um quadro com 10 cartões ativos (6 saudáveis, 2 em P50 e 2 em P85), clicar no chip de filtro "Risco de SLE" na barra de filtros e validar que apenas os 4 cartões com alerta permanecem visíveis. Desmarcar o chip e validar restauração de todos os cartões.

### Tests for User Story 3 🧪

- [X] T016 [P] [US3] Criar testes unitários de filtragem por SLE em `tests/unit/sleBoardFiltering.test.ts` validando isolamento de tarefas com níveis `warning_p50`, `risk_p85` e `critical_p95` e restauração na desativação

### Implementation for User Story 3

- [X] T017 [US3] Estender `FilterState` e `UseBoardFiltersReturn` em `src/types/filter.ts` adicionando `onlySleRisk: boolean` e `toggleOnlySleRisk: () => void`
- [X] T018 [US3] Atualizar `src/hooks/useBoardFilters.ts` para integrar a condição `onlySleRisk`, filtrando tarefas cujos IDs constam como em risco no mapa de previsões de SLE
- [X] T019 [US3] Adicionar botão/chip rápido de filtro "⚠️ Risco de SLE" em `src/components/FilterBar.tsx` com contador de itens em risco e feedback visual de ativação

**Checkpoint**: User Stories 1, 2 e 3 funcionando de maneira consistente e independente.

---

## Phase 6: User Story 4 - Preferências de Sensibilidade de SLE do Quadro (Priority: P4)

**Goal**: Permitir ao administrador do quadro estipular uma meta fixa em dias para o SLE (substituindo o P85 observado) ou desativar badges preventivos de P50 nas preferências do quadro.

**Independent Test**: Nas configurações do quadro (aba Políticas de Fluxo), configurar meta de 5 dias e desativar alertas P50. Verificar que cartões com envelhecimento entre P50 e P85 não exibem badge amarelo e que o alerta de risco passa a disparar a partir de 5 dias.

### Tests for User Story 4 🧪

- [X] T020 [P] [US4] Criar testes unitários de preferências de SLE em `tests/unit/BoardPoliciesTabSle.test.tsx` testando formulário de configuração, validação de número positivo de dias e alternância de toggles
- [X] T021 [US4] Adicionar seção de configuração de SLE em `src/components/Settings/BoardPoliciesTab.tsx` com campos para meta customizada em dias (`customTargetDays: number | null`) e alternadores para alertas P50 (`enableP50Alert: boolean`) e P95 (`enableP95Alert: boolean`)
- [X] T022 [US4] Conectar atualizações de configuração de SLE de `BoardPoliciesTab.tsx` ao `sleStorage` e ao estado reativo do quadro em `src/components/Settings/SettingsView.tsx`

**Checkpoint**: Todas as User Stories (P1 a P4) plenamente implementadas e configuráveis.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de conformidade constitucional, cobertura de testes e qualidade de código

- [X] T023 [P] Validar limite constitucional de linhas de código em todos os módulos novos e alterados via `tests/unit/moduleLineCountGuard.test.ts` (garantir estritamente <= 400 linhas)
- [X] T024 [P] Executar checagem estática de tipos e linter: `npm run lint` e `npm run build` garantindo zero erros de TypeScript e zero avisos de `any`
- [X] T025 [P] Executar validação de formatação Prettier: `npm run format:check`
- [X] T026 Executar suíte completa de testes automatizados com `npm test -- --run` para garantir zero regressões nos mais de 880 testes existentes
- [X] T027 Validar os cenários de uso manual descritos no guia rápido `specs/054-dynamic-sle-predictive-alerts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - inicia imediatamente.
- **Foundational (Phase 2)**: Depende da Phase 1 (tipos definidos) - **BLOQUEIA** todas as user stories.
- **User Story 1 (Phase 3 - P1 MVP)**: Depende da Phase 2 concluída.
- **User Story 2 (Phase 4 - P2)**: Depende da Phase 3 (US1 - `TaskSleBadge`).
- **User Story 3 (Phase 5 - P3)**: Depende da Phase 2 (hook e mapa de predições) e pode ser executada em paralelo com US2.
- **User Story 4 (Phase 6 - P4)**: Depende da Phase 2 (`sleStorage`) e estende configurações do quadro.
- **Polish (Phase 7)**: Depende de todas as User Stories concluídas.

### User Story Dependencies

- **US1 (P1 - Badges)**: Fundamento visual no cartão. Requer apenas a Phase 2 (motor e hook de SLE).
- **US2 (P2 - Popover)**: Estende visualmente o badge criado na US1.
- **US3 (P3 - Filtro rápido)**: Consome o mapa de predições da Phase 2; não depende da US2.
- **US4 (P4 - Configurações)**: Consome persistência da Phase 2; atualiza parâmetros de cálculo.

### Parallel Opportunities

- **Phase 2**:
  - `T002` (testes de predictor) e `T004` (testes de storage) podem rodar em paralelo.
  - `T006` (testes de hook) pode ser escrito em paralelo com `T005`.
- **Phase 3**:
  - `T008` (testes de badge) pode ser criado em paralelo com os tipos de `T010`.
- **Phase 4 & Phase 5**:
  - US2 (`T013`-`T015`) e US3 (`T016`-`T019`) podem ser desenvolvidas em paralelo por atuarem em arquivos desacoplados (`TaskSlePopover` vs `FilterBar`/`useBoardFilters`).
- **Phase 7**:
  - `T023`, `T024` e `T025` podem rodar em paralelo.

---

## Parallel Example: User Story 1 & 2

```bash
# Execução paralela de testes unitários TDD:
Task: "T008 [P] [US1] Criar testes unitários e de renderização de TaskSleBadge em tests/unit/TaskSleBadge.test.tsx"
Task: "T013 [P] [US2] Criar testes unitários para o popover analítico em tests/unit/TaskSlePopover.test.tsx"
Task: "T016 [P] [US3] Criar testes unitários de filtragem por SLE em tests/unit/sleBoardFiltering.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 (Setup: Tipos `src/types/sle.ts`).
2. Concluir Phase 2 (Foundational: Motor `slePredictor.ts`, Storage `sleStorage.ts` e Hook `useDynamicSle.ts`).
3. Concluir Phase 3 (User Story 1: `TaskSleBadge.tsx` e integração em `TaskBadges.tsx`).
4. **VALIDAR MVP**: Verificar cartões no quadro exibindo os badges amarelo (P50), laranja (P85) e vermelho (P95).

### Incremental Delivery

1. Setup + Foundational -> Motor matemático e hook prontos.
2. US1 -> Badges visuais imediatos nos cartões (MVP funcional!).
3. US2 -> Popover analítico explicativo com régua graduada.
4. US3 -> Filtro rápido "Risco de SLE" na barra de filtros.
5. US4 -> Configurações de sensibilidade e meta customizada.
6. Polish -> Conformidade de linter, formatação e suíte de testes íntegra.

