# Tasks: Limites de WIP e Métricas de Fluxo (Fase 2)

**Input**: Design documents from `/specs/002-wip-limits-and-flow-metrics/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdades fundamentais e invariantes:**
  - O Lead Time é uma função estritamente monotônica do tempo: $LeadTime = completedAt - createdAt$. Sempre $\ge 0$.
  - O Cycle Time mede o tempo de processamento efetivo: $CycleTime = completedAt - startedAt$.
  - A política de Soft WIP Limit opera sobre a relação de desigualdade: $isOverloaded \iff currentTaskCount > wipLimit$.
  - O estado de limites de WIP é ortogonal à coleção de tarefas: separar em `metrik_column_wip_limits` preserva a imutabilidade do schema anterior.
- **Premissas acidentais descartadas:**
  - Descartado o uso de bibliotecas pesadas de manipulação de data (`date-fns`, `moment.js`): funções puras de milissegundos cumprem 100% dos requisitos com custo zero de bundle (YAGNI).
  - Descartada a abordagem de bloqueio rígido (Hard Limit): a sobrecarga é visível e desconfortável, mas não impede a dinâmica real do fluxo operacional.

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)
- **Cenários de falha antecipados:**
  - *Modo de falha 1:* Tarefas antigas sem `startedAt` ou `completedAt` causando erros de `NaN` ou `Invalid Date` no cálculo de métricas.
  - *Modo de falha 2:* Divisão por zero ao calcular a média de Lead/Cycle Time quando não houver nenhuma tarefa concluída.
  - *Modo de falha 3:* Usuário digitando números negativos, zero ou caracteres não numéricos no input inline de WIP limit.
  - *Modo de falha 4:* Tarefa movida diretamente de `Todo` para `Completed` sem registrar `startedAt`.
- **Mitigações desenhadas nas tarefas:**
  - Utilitário `timeFormatters.ts` (T005) implementa guard clauses defensivas retornando `null` ou `"-"` para datas ausentes ou inválidas.
  - Hook `useFlowMetrics` (T018) verifica `throughput === 0` e emite médias nulas de forma segura.
  - Validador `isValidWipLimitsState` (T004) e input `type="number" min="1"` com sanitização no `onChange`/`onBlur` (T009).
  - Regra de transição no `useTaskCollection` (T014): se `startedAt` for `undefined` ao concluir, assume `createdAt` como fallback.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Duplicação):**
  - Módulos estritamente isolados: `timeFormatters.ts` (cálculo puro), `useWipLimits.ts` (armazenamento de limites), `WipLimitBadge.tsx` (edição e UI do limite), `MetricsBar.tsx` (visualização agregada). Nenhuma tarefa duplica o escopo de outra.
- **Exaustão Coletiva (Cobertura 100%):**
  - 100% dos requisitos funcionais (`FR-001` a `FR-012`) e histórias (`US1`, `US2`, `US3`) mapeados em tarefas atômicas e testáveis.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Caminhos avaliados:**
  - *Ramo 1:* Modal centralizado para configuração de WIP limits.
    - *Poda:* Descartado em favor de clique inline no badge do cabeçalho da coluna (resolvido na clarificação #1), reduzindo cliques e mantendo a interface leve.
  - *Ramo 2:* Deduzir tempo na coluna `Blocked` do Cycle Time.
    - *Poda:* Descartado (resolvido na clarificação #2) em favor do Lead/Cycle Time canônico do Método Kanban (tempo contínuo decorrido).

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - As tarefas de testes T003, T008, T013 e T017 devem ser criadas e falhar demonstrando a ausência das novas funções antes de suas implementações.
- **Critério determinístico de aceite (Green Bar):**
  - 100% das asserções de formatação de duração, detecção de sobrecarga de WIP e agregações de média passam no Vitest.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - *I. SDD:* Segue estritamente a precedência constitucional.
  - *II. Modularidade:* Componentes desacoplados, novos hooks encapsulados.
  - *III. Testes:* Testes unitários para utilitários de tempo, hooks de limite e componentes.
  - *IV. Observabilidade:* Logs defensivos para sanitização de limites de WIP.
  - *V. YAGNI:* Zero dependências externas; sem features prematuras de relatórios gráficos.
  - *VI. Raciocínio Analítico:* Formalizado e registrado neste documento.

---

## Phase 1: Setup (Shared Types & Contracts)

**Purpose**: Extensão dos tipos de domínio e preparação da infraestrutura da Feature 002.

- [X] T001 [P] Estender `TaskModel` com timestamps `startedAt` e `completedAt` e tipar `WipLimitsState` em `src/types/kanban.ts`
- [X] T002 [P] Atualizar `INITIAL_SEED_TASKS` com timestamps simulados e definir `INITIAL_WIP_LIMITS` em `src/utils/seedData.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários matemáticos de formatação de tempo e engine de persistência de limites de WIP que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma história de usuário pode ser finalizada antes da conclusão desta fase.

- [X] T003 [P] Criar teste unitário para funções de cálculo de Lead Time, Cycle Time e formatação de duração em `tests/unit/timeFormatters.test.ts`
- [X] T004 [P] Implementar funções de validação de schema e formatação defensiva de durações em `src/utils/timeFormatters.ts`
- [X] T005 Implementar hook de persistência reativa de limites de WIP em `src/hooks/useWipLimits.ts`
- [X] T006 [P] Criar teste unitário para persistência e validação defensiva do hook `useWipLimits` em `tests/unit/useWipLimits.test.ts`
- [X] T007 Adicionar estilos CSS para sobrecarga de WIP (tema âmbar pulsante e badges de tempo) em `src/App.css`

**Checkpoint**: Fundação pronta — implementação das histórias de usuário pode prosseguir.

---

## Phase 3: User Story 1 - Configuração e Sinalização de Limites de WIP (Priority: P1) 🎯 MVP

**Goal**: Permitir edição inline de limites de WIP clicando no contador da coluna e sinalizar visualmente sobrecarga (`4/3 ⚠️` com borda e badge âmbar).

**Independent Test**: Configurar WIP da coluna `In Progress` para 2. Inserir 3 tarefas. Comprovar que o contador muda para `3/2 ⚠️` e adquire borda âmbar de sobrecarga. Clicar no limite, alterar para 4 e verificar o retorno ao estado neutro.

### Tests for User Story 1
- [X] T008 [P] [US1] Criar teste unitário para o componente `WipLimitBadge` e sinalização de sobrecarga em `tests/unit/WipLimitBadge.test.tsx`

### Implementation for User Story 1
- [X] T009 [P] [US1] Implementar componente `WipLimitBadge` com edição numérica inline e salvamento no blur/Enter em `src/components/WipLimitBadge.tsx`
- [X] T010 [US1] Integrar `WipLimitBadge` e classes de sobrecarga `.kanban-column-wip-exceeded` em `src/components/Column.tsx`
- [X] T011 [US1] Conectar limites de WIP e propagação de atualização em `src/components/Board.tsx`
- [X] T012 [US1] Integrar hook `useWipLimits` no componente principal `src/App.tsx`

**Checkpoint**: User Story 1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Rastreamento e Exibição de Lead Time e Cycle Time por Cartão (Priority: P1) 🎯 MVP

**Goal**: Rastrear automaticamente `startedAt` e `completedAt` nas transições de coluna e exibir badges de Lead Time e Cycle Time em cartões concluídos.

**Independent Test**: Mover tarefa de `Todo` para `In Progress` e depois para `Completed`. Verificar a presença das badges informativas com os tempos formatados no rodapé do cartão.

### Tests for User Story 2
- [X] T013 [P] [US2] Criar teste unitário para gravação de timestamps nas transições e renderização de métricas no cartão em `tests/unit/taskMetrics.test.tsx`

### Implementation for User Story 2
- [X] T014 [US2] Atualizar função `moveTask` para registrar `startedAt`, `completedAt` e limpeza ao reabrir em `src/hooks/useTaskCollection.ts`
- [X] T015 [P] [US2] Adicionar badges visuais de Lead Time e Cycle Time para cartões na coluna `Completed` em `src/components/Task.tsx`
- [X] T016 [US2] Atualizar testes existentes de transição para validar persistência de timestamps em `tests/unit/taskTransitions.test.ts`

**Checkpoint**: User Stories 1 e 2 integradas e funcionais.

---

## Phase 5: User Story 3 - Barra de Métricas de Fluxo do Quadro (Priority: P2)

**Goal**: Exibir painel consolidado no topo com médias de Lead Time, Cycle Time e Throughput total de tarefas concluídas.

**Independent Test**: Com 2 ou mais tarefas em `Completed`, verificar se a barra de métricas exibe a contagem e as médias calculadas com precisão e atualização em tempo real.

### Tests for User Story 3
- [X] T017 [P] [US3] Criar teste unitário para o hook `useFlowMetrics` e componente `MetricsBar` em `tests/unit/MetricsBar.test.tsx`

### Implementation for User Story 3
- [X] T018 [P] [US3] Implementar hook memoizado `useFlowMetrics` calculando Throughput, Lead Time Médio e Cycle Time Médio em `src/hooks/useFlowMetrics.ts`
- [X] T019 [P] [US3] Implementar componente visual `MetricsBar` com estética glassmorphism em `src/components/MetricsBar.tsx`
- [X] T020 [US3] Integrar `MetricsBar` entre o cabeçalho e o quadro em `src/App.tsx`

**Checkpoint**: Todas as histórias de usuário implementadas e integradas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final de roteiro, responsividade e auditoria de código.

- [X] T021 [P] Validar roteiro completo de testes manuais de limites de WIP e métricas conforme `specs/002-wip-limits-and-flow-metrics/quickstart.md`
- [X] T022 [P] Ajustar responsividade da `MetricsBar` para telas mobile e tablets em `src/App.css`
- [X] T023 Executar suíte completa de testes (`npm test`), build limpo (`npm run build`) e auditoria de código limpo

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as histórias de usuário.
- **User Stories (Phase 3 a 5)**: Todas dependem da Fundação (Phase 2). Executadas em ordem de prioridade (P1 → P2).
- **Polish (Phase 6)**: Depende da conclusão de todas as histórias.

### Within Each User Story
- Testes unitários escritos e falhando antes da implementação (TDD / Red-Bar First).
- Utilitários e hooks puros antes de componentes visuais.
- Validação individual da story antes de avançar para a próxima.

---

## Implementation Strategy: MVP First (User Stories 1 e 2)

1. Concluir **Phase 1: Setup** (Tipos e seeds estendidos)
2. Concluir **Phase 2: Foundational** (Utilitários de tempo e hook de WIP)
3. Concluir **Phase 3: User Story 1** (Limites de WIP com edição inline e sobrecarga)
4. Concluir **Phase 4: User Story 2** (Rastreamento de Lead Time e Cycle Time nos cartões)
5. **PARAR e VALIDAR**: Neste ponto, o Metrik possui o coração de um sistema de gestão de fluxo Kanban funcional.
6. Avançar para **Phase 5: User Story 3** (Barra de métricas agregadas do quadro) e **Phase 6: Polish**.
