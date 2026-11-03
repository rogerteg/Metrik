# Tasks: Automações de Fluxo & Políticas de Cartão (Flow Rules)

**Feature**: `053-flow-automation-policies`  
**Input**: Design artifacts from `specs/053-flow-automation-policies/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Status**: Completed  

---

## Modelos de Raciocínio Analítico Pré-Tarefas (MANDATÓRIO — CONSTITUIÇÃO VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante Fundamental de Automação:** Uma automação é uma função determinística de transição de estado: `(EstadoAtual, Evento, Regras) => NovoEstado + EfeitosColaterais`.
- **Invariante de Governança Kanban:** Políticas explícitas (DoR / DoD) são acordos de processo do squad atrelados a uma etapa (coluna) que orientam quem puxa itens ou valida conclusões.
- **Redução ao Mínimo Irredutível:**
  - O motor de regras não precisa de backend, banco remoto nem interpretador complexo de expressões: uma árvore de condições puras (`equals`, `contains`, `is_empty`) e um despachante de ações (`add_tag`, `set_priority`, `set_blocked`, `notify_toast`, `highlight_card`) é 100% suficiente.
  - As políticas de coluna são pares textuais `(entryCriteria, exitCriteria)` associados ao `columnId`, persistidos localmente.
- **Eliminação de Premissas Acidentais:** Não há necessidade de websockets, filas em nuvem ou bibliotecas de workflow (XState, RxJS). Toda a computação ocorre no cliente em frações de milissegundo.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Cenário de Falha 1 (Loop Infinito por Cascata):** Regra A adiciona tag `aging`, que dispara Regra B, que altera prioridade, que re-dispara Regra A.
  - *Mitigação Prévia:* Trava de Profundidade Única (Depth = 1). Mutações derivadas de automação recebem o marcador `isAutomated: true` e são sumariamente ignoradas pelo despachante de eventos, eliminando recursão por construção.
- **Cenário de Falha 2 (Sobrecarga de CPU em Temporizadores de Aging):** Polling de tempo avaliando dezenas de cartões a cada segundo causando travamentos e consumo de bateria.
  - *Mitigação Prévia:* O timer roda a cada 60 segundos (ou no evento `visibilitychange`), avaliando apenas cartões em colunas ativas (categorias `in_progress` e `todo`). Cartões em colunas concluídas (`done`) são descartados imediatamente do cálculo.
- **Cenário de Falha 3 (Corrupção de Estado no localStorage):** Usuário edita manualmente ou importa JSON inválido de regras, quebrando a inicialização do Metrik.
  - *Mitigação Prévia:* Parser defensivo com validação de esquema e fallback transparente para array vazio com log `[Metrik][FlowRules]`, sem falha silenciosa ou crash na renderização.
- **Cenário de Falha 4 (Conflito entre Reordenação DnD e Execução de Regra):** Arrastar o cartão para outra coluna falha ou perde a animação se a mutação de automação concorrer com o estado do drag-and-drop.
  - *Mitigação Prévia:* Avaliação síncrona pós-movimento no callback de sucesso de `useGuardedTaskMove`, garantindo que o cartão já está posicionado antes de aplicar tags/prioridades adicionais.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME):**
  - Fase 1 e 2 cuidam estritamente de tipos, motor puro e persistência (zero UI).
  - Fase 3 (US1) aborda o construtor visual e execução em movimentação (drag-and-drop).
  - Fase 4 (US2) trata exclusivamente dos gatilhos temporizados (aging e prazos).
  - Fase 5 (US3) isola a experiência das políticas explícitas de coluna (DoR / DoD).
  - Fase 6 (US4) contempla templates e portabilidade (import/export).
  - Cada arquivo possui responsabilidade única e sem sobreposição de escopo.
- **Coletivamente Exaustivas (CE):**
  - Cobre 100% dos requisitos funcionais (FR-001 a FR-014) da `spec.md`.
  - Cobre todos os critérios mensuráveis de sucesso (SC-001 a SC-005).
  - Inclui todos os contratos definidos em `data-model.md` e `flow-rules-contracts.ts`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A (Acoplar regras dentro de `ColumnModel`):**
  - *Poda:* Rejeitada porque acoplaria regras ao esquema fundamental do Kanban, quebrando retrocompatibilidade e dificultando a exportação independente de regras.
  - *Escolha:* Armazenamento desacoplado em `metrik_flow_rules_${boardId}` e `metrik_column_policies_${boardId}`.
- **Alternativa B (Web Workers para cálculo de Aging):**
  - *Poda:* Rejeitada porque serializar todo o estado do quadro para um Worker a cada minuto consome mais recursos e complexidade de código do que uma iteração de 20 cartões em memória principal (que leva menos de 0.1ms).
  - *Escolha:* Hook simples `useFlowRulesTimer.ts` com `setInterval(..., 60000)` e limpeza limpa no unmount.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável (Red Bar):**
  - Testes unitários em `tests/unit/flowRulesEngine.test.ts` devem ser escritos primeiro e falhar antes da criação de `flowRulesEngine.ts`.
  - Testes de renderização de `ColumnPolicyPopover.test.ts` e `useFlowRules.test.ts` devem falhar antes da implementação de seus componentes e hooks.
- **Critério Determinístico de Aceite (Green Bar):**
  - Suíte completa do Vitest passando (`npx vitest run tests/unit/flowRules*`).
  - `npx tsc --noEmit` passando com 0 erros de tipagem.
  - `npm run build` gerando bundle de produção sem avisos impeditivos.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Princípio I (SDD):** Artefatos `spec.md`, `plan.md` e `tasks.md` criados e alinhados.
- **Princípio III (Clean Architecture):** Motor puro em `src/utils/`, estado em `src/hooks/`, componentes em `src/components/FlowRules/` e `src/components/ColumnPolicy/`.
- **Princípio VII (Identidade Própria):** Nenhuma terminologia ou menção a marcas concorrentes.
- **Princípio VIII (Local-First):** 100% offline, persistência imediata no `localStorage`.
- **Princípio IX (Proteção de Rascunho):** Confirmação de descarte de regra em edição no construtor.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição dos tipos de domínio, constantes e modelos compartilhados.

- [x] T001 [P] Criar definições de tipos para regras, gatilhos, condições e ações em `src/types/flowRules.ts`
- [x] T002 [P] Criar definições de tipos para políticas de coluna em `src/types/columnPolicy.ts`
- [x] T003 [P] Criar catálogo de templates pré-configurados de boas práticas em `src/utils/flowRulesTemplates.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Motor puro de execução de regras e camada de persistência Local-First.

**⚠️ CRITICAL**: Nenhuma tarefa de interface pode ser finalizada antes da conclusão desta fundação.

- [x] T004 Escrever testes unitários (Red Bar) para o motor de regras em `tests/unit/flowRulesEngine.test.ts`
- [x] T005 Implementar o motor puro de regras e resolução de ações em `src/utils/flowRulesEngine.ts` (Green Bar para T004)
- [x] T006 [P] Implementar utilitário de persistência, sanitização e validação Local-First em `src/utils/flowRulesStorage.ts`
- [x] T007 Escrever testes para o hook de gerenciamento de regras em `tests/unit/useFlowRules.test.ts`
- [x] T008 Implementar hook de estado de regras `useFlowRules.ts` em `src/hooks/useFlowRules.ts` (Green Bar para T007)
- [x] T009 [P] Escrever testes e implementar hook de políticas de coluna `useColumnPolicies.ts` em `src/hooks/useColumnPolicies.ts` e `tests/unit/useColumnPolicies.test.ts`

**Checkpoint**: Fundação de domínio completa e testada. Implementação das histórias de usuário pode começar.

---

## Phase 3: User Story 1 - Construtor Visual de Regras de Fluxo Sem Código (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário criar, editar, listar e ativar regras de fluxo declarativas via interface, e executá-las imediatamente na movimentação de cartões.

**Independent Test**: Criar a regra "Quando cartão mover para Revisão, adicionar tag needs-qa", mover cartão e verificar tag anexada + log de auditoria no cartão.

### Tests for User Story 1 🧪
- [x] T010 [P] [US1] Escrever testes unitários e de integração para formulário construtor e lista em `tests/unit/FlowRuleBuilder.test.tsx`
- [x] T011 [P] [US1] Escrever testes de integração para execução de automação na movimentação de cartões em `tests/unit/flowAutomationMovement.test.ts`

### Implementation for User Story 1
- [x] T012 [P] [US1] Criar componente `FlowRuleListItem.tsx` (linha com toggle, botões de editar, duplicar, excluir e badge de execuções) em `src/components/FlowRules/FlowRuleListItem.tsx`
- [x] T013 [P] [US1] Criar componente `FlowRuleBuilder.tsx` (formulário declarativo: Gatilho -> Condições -> Ações) em `src/components/FlowRules/FlowRuleBuilder.tsx`
- [x] T014 [US1] Criar modal principal `FlowRulesModal.tsx` com listagem e alternância para o construtor em `src/components/FlowRules/FlowRulesModal.tsx`
- [x] T015 [P] [US1] Criar estilos visuais do modal e construtor em `src/components/FlowRules/FlowRules.css`
- [x] T016 [US1] Integrar botão de acionamento do `FlowRulesModal` no cabeçalho em `src/components/AppHeader.tsx`
- [x] T017 [US1] Integrar avaliação de regras pós-movimentação de cartão no hook `useGuardedTaskMove.ts` e atualização com registro no `activityLog`

**Checkpoint**: MVP funcional. Regras declarativas podem ser criadas, salvas e executadas ao movimentar cartões.

---

## Phase 4: User Story 2 - Alertas e Ações Automatizadas por Envelhecimento (Aging) e Prazos (Priority: P2)

**Goal**: Monitorar itens em progresso ou com prazos críticos, aplicando sinalizações visuais, prioridades ou tags de forma autônoma.

**Independent Test**: Configurar regra para cartões com aging > 3 dias em progresso, verificar o disparo pelo timer e a mutação correspondente no cartão.

### Tests for User Story 2 🧪
- [x] T018 [P] [US2] Escrever testes para o monitor de envelhecimento e prazos em `tests/unit/useFlowRulesTimer.test.ts`

### Implementation for User Story 2
- [x] T019 [US2] Implementar hook leve de monitoramento temporal `useFlowRulesTimer.ts` em `src/hooks/useFlowRulesTimer.ts`
- [x] T020 [US2] Integrar `useFlowRulesTimer` no fluxo do quadro em `src/components/Board.tsx` (ou ponto central do quadro)
- [x] T021 [US2] Suportar ações de alerta visual e badges nos cartões (`BoardTask.tsx` / `Task.tsx`)

**Checkpoint**: Histórias 1 e 2 operando perfeitamente. Alertas e regras temporais funcionam de forma autônoma.

---

## Phase 5: User Story 3 - Políticas Explícitas de Entrada e Saída nas Colunas (Priority: P3)

**Goal**: Exibir e editar Definition of Ready (DoR) e Definition of Done (DoD) diretamente no cabeçalho de cada coluna do Kanban.

**Independent Test**: Clicar no indicador de política no cabeçalho da coluna, cadastrar DoR/DoD e verificar a exibição legível no popover flutuante.

### Tests for User Story 3 🧪
- [x] T022 [P] [US3] Escrever testes unitários para popover e modal de políticas em `tests/unit/ColumnPolicyPopover.test.tsx`

### Implementation for User Story 3
- [x] T023 [P] [US3] Criar componente `ColumnPolicyPopover.tsx` (exibição elegante de critérios de entrada e saída) em `src/components/ColumnPolicy/ColumnPolicyPopover.tsx`
- [x] T024 [P] [US3] Criar componente `ColumnPolicyModal.tsx` (editor de texto formatado para DoR e DoD) em `src/components/ColumnPolicy/ColumnPolicyModal.tsx`
- [x] T025 [P] [US3] Criar estilos visuais das políticas em `src/components/ColumnPolicy/ColumnPolicy.css`
- [x] T026 [US3] Integrar botão/indicador de política e popover no cabeçalho da coluna em `src/components/Column.tsx`

**Checkpoint**: Políticas explícitas visíveis e configuráveis em todas as colunas do quadro.

---

## Phase 6: User Story 4 - Biblioteca de Modelos Pré-Configurados & Portabilidade (Priority: P4)

**Goal**: Oferecer galeria de modelos prontos em 1 clique e permitir exportação/importação de regras via JSON.

**Independent Test**: Selecionar modelo "Alerta de WIP Aging em Progresso", confirmar criação e validar regra ativa na lista.

### Tests for User Story 4 🧪
- [x] T027 [P] [US4] Escrever testes para carregamento de templates e serialização JSON em `tests/unit/flowRulesPortability.test.ts`

### Implementation for User Story 4
- [x] T028 [P] [US4] Criar componente `FlowRuleTemplates.tsx` para escolha visual de modelos em `src/components/FlowRules/FlowRuleTemplates.tsx`
- [x] T029 [US4] Implementar botões e handlers de Exportar e Importar JSON no `FlowRulesModal.tsx`

**Checkpoint**: Todas as 4 histórias de usuário concluídas com independência e robustez.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Estilos consolidados, validação completa de qualidade e integridade do projeto.

- [x] T030 Registrar import de estilos de automação e políticas no manifesto `src/App.css`
- [x] T031 [P] Executar bateria completa de testes automatizados (`npm run test`)
- [x] T032 [P] Executar checagem estrita de tipos (`npx tsc --noEmit`) e linter (`npm run lint`)
- [x] T033 Executar build de produção (`npm run build`) para verificar ausência de regressões
- [x] T034 Validar cenários de ponta a ponta descritos em `specs/053-flow-automation-policies/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as histórias de usuário.
- **User Story 1 (Phase 3)**: Depende da Fundação. Entrega o MVP.
- **User Story 2 (Phase 4)**: Depende da Fundação e estende US1 com temporizadores.
- **User Story 3 (Phase 5)**: Depende da Fundação (hook `useColumnPolicies`) — pode rodar em paralelo com US1/US2.
- **User Story 4 (Phase 6)**: Depende de US1 (modal de regras).
- **Polish (Phase 7)**: Depende de todas as histórias concluídas.

---

## Implementation Strategy (MVP First)

1. **Fase 1 + 2**: Tipos, motor puro `flowRulesEngine.ts` com TDD, e hooks de persistência.
2. **Fase 3 (MVP)**: Interface do construtor, lista de regras e execução imediata no drag-and-drop. **VALIDAR MVP**.
3. **Fase 4**: Adicionar monitoramento temporal para aging e prazos.
4. **Fase 5**: Adicionar políticas explícitas nas colunas (DoR / DoD).
5. **Fase 6**: Adicionar galeria de templates e portabilidade JSON.
6. **Fase 7**: Polish, testes gerais, build e documentação viva.
