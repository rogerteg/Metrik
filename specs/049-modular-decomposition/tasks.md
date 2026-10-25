# Tasks: Decomposição de Módulos Extensos (OPP-002)

**Feature**: `049-modular-decomposition`  
**Input Documents**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [checklists/architecture.md](./checklists/architecture.md)  
**Constitution Authority**: [constitution.md](../../.specify/memory/constitution.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdade Fundamental de Tamanho e Coesão:** Módulos com mais de 700 linhas em React/TypeScript sofrem de acoplamento temporal e estrutural, onde estado do modal, menus de contexto, drag-and-drop e formatação de texto competem pelas mesmas re-renderizações e closures. A menor verdade irredutível da decomposição é: subcomponentes puros (*presentational components*) que recebem props primitivas/específicas eliminam re-renderizações em cascata e possuem naturalmente menos de 200 linhas de código.
- **Invariante de Não-Regressão e Contratos:** O Metrik possui 744 testes automatizados dependendo das assinaturas existentes de `Task`, `TaskDetailsModal` e `useTaskCollection`. A verdade irredutível para não quebrar a suíte é: os pontos de entrada originais (`src/components/Task.tsx`, `src/components/TaskDetailsModal.tsx`, `src/hooks/useTaskCollection.ts`) devem atuar como fachadas (*facades*) preservando 100% das assinaturas públicas de props e hooks, delegando internamente para os submódulos atômicos.
- **Invariante de Integridade de Dados:** O modal de detalhes gerencia rascunho sujo (`isDirty`), atalhos `Ctrl+S`/`Escape` e listener `beforeunload`. Essa máquina de estado de persistência deve residir centralizada no container orquestrador, enquanto os inputs e o editor Markdown atuam como componentes controlados.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modo de Falha 1 (Flickering ou quebra de DND no Kanban):** Ao extrair subcomponentes de `Task.tsx`, perder as referências `provided.innerRef`, `provided.draggableProps` ou `provided.dragHandleProps`, ou envolver o card em nós `div` adicionais que quebrem os seletores CSS de flex/grid.
  - *Mitigação:* `TaskCardContainer.tsx` preserva estritamente o elemento raiz com `ref={provided.innerRef}` e os exatos atributos de DND sem adicionar wrappers intermediários na árvore DOM.
- **Modo de Falha 2 (Perda acidental de rascunhos no modal):** Ao modularizar o editor Markdown ou o painel de campos, desacoplar a flag `isDirty` e fazer o modal fechar sem disparar `showDirtyConfirmDialog`.
  - *Mitigação:* O container `TaskDetailsModal.tsx` mantém o gerenciamento de `isDirty` como fonte única da verdade e os subcomponentes emitem callbacks explícitos de alteração (`onChangeField`, `onSaveDescription`, `onDiscardDescription`).
- **Modo de Falha 3 (Loop de renderização ou quebra de hooks em `useTaskCollection`):** Sub-hooks instanciados condicionalmente ou gerando novas referências de funções em cada render, causando loop em `useEffect` de componentes consumidores.
  - *Mitigação:* Todos os sub-hooks utilizam `useCallback` com dependências estritas; a fachada `useTaskCollection.ts` apenas consolida e expõe os métodos memoizados.
- **Modo de Falha 4 (Re-inflação de linhas no futuro):** Arquivos ultrapassarem novamente 400 linhas após refatorações subsequentes.
  - *Mitigação:* `moduleLineCountGuard.test.ts` automatiza a verificação e falha no CI se qualquer arquivo alvo ou submódulo ultrapassar 400 linhas.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas:**
  - Fase 1 foca estritamente na infraestrutura de pastas e no teste de guarda de linhas de base.
  - Fase 2 (US1) aborda exclusivamente `Task.tsx` e seus 5 subcomponentes em `src/components/Task/`.
  - Fase 3 (US2) aborda exclusivamente `TaskDetailsModal.tsx` e suas seções em `src/components/TaskDetailsModal/`.
  - Fase 4 (US3) aborda exclusivamente `useTaskCollection.ts` e seus 4 sub-hooks especialistas em `src/hooks/taskCollection/`.
  - Fase 5 (US4) aborda exclusivamente `App.tsx` e a segregação de `AppHeaderBar.tsx` e `AppDialogsContainer.tsx`.
  - Fase 6 (Polish) valida lint, coverage, suite completa de 744 testes e build de produção.
  - Nenhum arquivo é modificado em fases concorrentes.
- **Coletivamente Exaustivas:** A totalidade dos 4 módulos alvos da OPP-002 (`Task.tsx`, `App.tsx`, `TaskDetailsModal.tsx`, `useTaskCollection.ts`), todos os requisitos funcionais (`FR-001` a `FR-008`) e critérios de sucesso (`SC-001` a `SC-005`) estão 100% cobertos por tarefas atômicas explícitas.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A (Descartada):** Refatorar `useTaskCollection` dividindo-o em 4 hooks públicos avulsos consumidos diretamente pelos componentes.
  - *Poda:* Rejeitada na clarificação Q2; forçaria a modificação de mais de 15 arquivos consumidores e quebraria testes de integração legados. O Padrão Fachada preserva a estabilidade e a regra de YAGNI.
- **Alternativa B (Descartada):** Criar Context API global (`AppContext`) para orquestrar os modais e gavetas do `App.tsx`.
  - *Poda:* Rejeitada na clarificação Q3; adicionaria boilerplate desnecessário de providers e consumidores em componentes que já recebem props explicitamente. A extração pura de `AppDialogsContainer.tsx` e `AppHeaderBar.tsx` é mais simples e direta.
- **Alternativa C (Descartada):** Co-localizar todos os subcomponentes de `Task` no diretório raiz `src/components/`.
  - *Poda:* Rejeitada na clarificação Q1; geraria poluição visual massiva na raiz de componentes, onde já existem mais de 30 arquivos.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Red-Bar Inicial:**
  - O teste de guarda `tests/unit/moduleLineCountGuard.test.ts` deve ser criado no início da implementação e FALHAR (Red Bar), pois `Task.tsx` (907 > 400), `App.tsx` (762 > 400), `TaskDetailsModal.tsx` (728 > 400) e `useTaskCollection.ts` (751 > 400) estão acima do limite de 400 linhas.
- **Green-Bar Intermediário & Final:**
  - Conforme cada fase for concluída, os respectivos módulos atingem ≤ 400 linhas.
  - Ao final da Fase 5, `moduleLineCountGuard.test.ts` passa verde em 100% dos arquivos.
  - A suíte completa (`npm test`) atesta 744+ testes verdes sem nenhuma quebra de regressão.
  - `npm run lint` atesta 0 erros e 0 warnings.
  - `npm run build` atesta compilação em < 5 segundos com zero erros de tipagem.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constituição I (SDD):** Todas as tarefas rastreiam diretamente para a spec, clarificações Q1–Q3 e o plan.
- **Constituição II (Clean Architecture & Modularity):** Eliminação de God Components; separação estrita de responsabilidades em subcomponentes coesos.
- **Constituição III (Automated Quality Gates):** 744 testes mantidos verdes; novos testes de guarda de linhas adicionados; cobertura mantida acima dos limiares.
- **Constituição V (Simplicidade & YAGNI):** Zero novas dependências npm adicionadas em `package.json`.
- **Constituição IX (User Data Integrity & Draft Protection):** Preservação absoluta do diálogo `showDirtyConfirmDialog` no `TaskDetailsModal.tsx`.

---

## Phase 1: Setup & Teste de Guarda de Linhas (Base TDD)

**Purpose**: Criação da infraestrutura de pastas e do teste automatizado de guarda que atua como Red-Bar inicial

- [x] T001 [P] Criar teste automatizado de guarda de linhas de módulos em `tests/unit/moduleLineCountGuard.test.ts` (Red Bar: falha com os 4 módulos alvos > 400 linhas)
- [x] T002 [P] Criar diretórios modulares estruturais `src/components/Task/`, `src/components/TaskDetailsModal/`, `src/components/App/` e `src/hooks/taskCollection/`
- [x] T003 [P] Criar definições de tipos e interfaces de props internas em `src/components/Task/types.ts` e `src/components/TaskDetailsModal/types.ts`

---

## Phase 2: User Story 1 - Decomposição Modular do Cartão Kanban `Task.tsx` (Priority: P1) 🎯 MVP

**Goal**: Reduzir `src/components/Task.tsx` de 907 linhas para menos de 200 linhas através da extração de 5 subcomponentes coesos em `src/components/Task/`, mantendo 100% da fidelidade visual, DND e contratos de props.

**Independent Test**: Executar `npm test -- tests/unit/Task` e verificar que todas as informações do cartão (título, tag, prioridade, bloqueio, SLE, cycle time, checklist e comentários) continuam renderizando com fidelidade, menus de ação operacionais e arrasto fluido.

- [x] T004 [P] [US1] Extrair subcomponente de cabeçalho do cartão `TaskHeader.tsx` (título, ID, badges de prioridade/tipo, menu de contexto) em `src/components/Task/TaskHeader.tsx`
- [x] T005 [P] [US1] Extrair subcomponente de badges analíticas `TaskBadges.tsx` (Cycle Time, Lead Time, SLE, Story Points, Due Date) em `src/components/Task/TaskBadges.tsx`
- [x] T006 [P] [US1] Extrair subcomponente de impedimentos `TaskBlockerChips.tsx` (chip de bloqueio, tooltip de motivo, links de dependência) em `src/components/Task/TaskBlockerChips.tsx`
- [x] T007 [P] [US1] Extrair subcomponente de resumo de checklist `TaskChecklistSummary.tsx` (barra de progresso e contadores) em `src/components/Task/TaskChecklistSummary.tsx`
- [x] T008 [US1] Extrair subcomponente container draggable `TaskCardContainer.tsx` (encapsulamento de innerRef, draggableProps e seleção) em `src/components/Task/TaskCardContainer.tsx`
- [x] T009 [US1] Refatorar `src/components/Task.tsx` como fachada e container orquestrador delegando para os subcomponentes (< 200 linhas)
- [x] T010 [US1] Validar aprovação dos testes de unidade de Task com `npx vitest run tests/unit/taskTypesAndLinking.test.ts tests/unit/priorityAndTags.test.ts tests/unit/stagnation.test.ts`

**Checkpoint**: `Task.tsx` refatorado para < 200 linhas com zero regressão em DND e renderização visual.

---

## Phase 3: User Story 2 - Decomposição Modular do Modal de Detalhes `TaskDetailsModal.tsx` (Priority: P2)

**Goal**: Reduzir `src/components/TaskDetailsModal.tsx` de 728 linhas para menos de 250 linhas isolando seções estruturadas em `src/components/TaskDetailsModal/`, preservando estritamente o guard de rascunhos sujos (`showDirtyConfirmDialog`) e persistência.

**Independent Test**: Executar `npm test -- tests/unit/TaskDetailsModal*` e verificar que a edição de campos, formulário Markdown, abas de atividades e diálogo de confirmação de descarte funcionam sem nenhuma alteração perceptível.

- [x] T011 [P] [US2] Extrair subcomponente de cabeçalho do modal `TaskModalHeader.tsx` (título, ID clicável, indicador de salvamento e botão fechar) em `src/components/TaskDetailsModal/TaskModalHeader.tsx`
- [x] T012 [P] [US2] Extrair subcomponente de metadados primários `TaskModalPrimaryFields.tsx` (coluna, responsável, estimativa, datas e tags) em `src/components/TaskDetailsModal/TaskModalPrimaryFields.tsx`
- [x] T013 [P] [US2] Extrair subcomponente de editor de descrição `TaskModalDescription.tsx` (toolbar Markdown, toggle preview, botões Salvar/Descartar) em `src/components/TaskDetailsModal/TaskModalDescription.tsx`
- [x] T014 [P] [US2] Extrair subcomponente de abas de histórico/comentários `TaskModalActivityTab.tsx` (feed de atividade, lista de comentários, formulário) em `src/components/TaskDetailsModal/TaskModalActivityTab.tsx`
- [x] T015 [US2] Refatorar container principal `src/components/TaskDetailsModal.tsx` orquestrando as seções e preservando `isDirty`, listeners de atalhos (`Ctrl+S`, `Escape`) e `showDirtyConfirmDialog` (< 250 linhas)
- [x] T016 [US2] Executar suíte de testes de modal com `npx vitest run tests/unit/TaskDetailsModalAutosave.test.tsx tests/unit/TaskModalDraftGuard.test.tsx tests/unit/TaskDetailsModalRedesign.test.tsx`
- [x] T017 [US2] Validar que o guard de rascunho sujo impede o fechamento acidental quando o texto foi editado no novo subcomponente

**Checkpoint**: `TaskDetailsModal.tsx` refatorado para < 250 linhas com o guard de rascunho sujo 100% preservado.

---

## Phase 4: User Story 3 - Desacoplamento e Composição do Gerenciador `useTaskCollection.ts` (Priority: P3)

**Goal**: Reduzir `src/hooks/useTaskCollection.ts` de 751 linhas para menos de 220 linhas através da composição de sub-hooks especialistas em `src/hooks/taskCollection/`, mantendo a assinatura de retorno pública 100% inalterada (*Facade Pattern*).

**Independent Test**: Executar a suíte de testes de coleções e reordenação (`tests/unit/useTaskCollection.test.ts`, `taskReorder.test.ts`, `taskTransitions.test.ts`) garantindo que todas as mutações locais e persistência no localStorage continuem funcionando sem alterações nos arquivos consumidores.

- [x] T018 [P] [US3] Implementar sub-hook especialista `useTaskMutations.ts` (CRUD de tarefas: add, update, delete, archive) em `src/hooks/taskCollection/useTaskMutations.ts`
- [x] T019 [P] [US3] Implementar sub-hook especialista `useTaskReorderManager.ts` (movimentações DND entre colunas e reordenação relativa `reorderTaskRelative`) em `src/hooks/taskCollection/useTaskReorderManager.ts`
- [x] T020 [P] [US3] Implementar sub-hook especialista `useTaskChecklistManager.ts` (operações atômicas no checklist da tarefa) em `src/hooks/taskCollection/useTaskChecklistManager.ts`
- [x] T021 [P] [US3] Implementar sub-hook especialista `useTaskCommentsManager.ts` (comentários, decisões de projeto e pinagem) em `src/hooks/taskCollection/useTaskCommentsManager.ts`
- [x] T022 [US3] Refatorar `src/hooks/useTaskCollection.ts` compondo os sub-hooks especialistas e re-exportando a interface idêntica `UseTaskCollectionReturn` (< 220 linhas)
- [x] T023 [US3] Executar suíte de testes de hook com `npx vitest run tests/unit/useTaskCollection.test.ts tests/unit/taskReorder.test.ts tests/unit/taskTransitions.test.ts`
- [x] T024 [US3] Validar que a persistência no `localStorage` mantém timestamps (`createdAt`, `startedAt`, `completedAt`) e estrutura determinística

**Checkpoint**: `useTaskCollection.ts` refatorado como fachada coesa (< 220 linhas) sem quebrar nenhum componente consumidor.

---

## Phase 5: User Story 4 - Decomposição Estrutural da Casca `App.tsx` (Priority: P4)

**Goal**: Reduzir `src/App.tsx` de 762 linhas para menos de 250 linhas segregando a barra de navegação/ações em `AppHeaderBar.tsx` e os modais/gavetas em `AppDialogsContainer.tsx`.

**Independent Test**: Iniciar a aplicação, navegar entre as visões (Quadro, Analytics, Configurações, Workspace Hub), abrir os diálogos globais (Novo Quadro, Mika Drawer, Exportação CSV) e validar estabilidade total.

- [x] T025 [P] [US4] Extrair componente de navegação superior `AppHeaderBar.tsx` (logo, seletor de quadro/squad, abas de visualização, alternador de tema e botão Mika) em `src/components/App/AppHeaderBar.tsx`
- [x] T026 [P] [US4] Extrair componente hospedeiro de diálogos `AppDialogsContainer.tsx` (modais de novo quadro, nova squad, exportação CSV, importação, Mika Drawer e wipe data) em `src/components/App/AppDialogsContainer.tsx`
- [x] T027 [US4] Refatorar `src/App.tsx` simplificando-o para um layout container limpo (< 250 linhas) integrando `AppHeaderBar` e `AppDialogsContainer`
- [x] T028 [US4] Validar que atalhos de teclado de navegação e abertura de modais continuam respondendo normalmente no layout raiz
- [x] T029 [US4] Executar testes de integração de App com `npx vitest run tests/unit/AnalyticsDashboard.test.tsx` e `tests/unit/appCssStructure.test.ts`

**Checkpoint**: `App.tsx` refatorado para < 250 linhas; casca da aplicação limpa e altamente modular.

---

## Phase 6: Polish & Validação dos Portões de Qualidade (Constituição III)

**Purpose**: Verificação final da suíte completa de testes, limites de linhas, linter estrito e performance de compilação

- [x] T030 Executar teste de guarda `npx vitest run tests/unit/moduleLineCountGuard.test.ts` certificando que os 4 módulos alvos e todos os novos submódulos possuem rigorosamente ≤ 400 linhas (Green Bar completo)
- [x] T031 [P] Executar `npm run format` para garantir conformidade Prettier em todos os novos arquivos criados
- [x] T032 Executar `npm run lint` assegurando 0 erros e 0 warnings com a regra estrita de `no-explicit-any`
- [x] T033 Executar suíte completa de testes automatizados com `npm test` atestando 744+ testes verdes sem nenhuma regressão
- [x] T034 Executar `npm run test:coverage` validando que todos os 4 limiares constitucionais (Functions ≥ 60%, Statements ≥ 85%, Lines ≥ 85%, Branches ≥ 78%) permanecem verdes
- [x] T035 Executar compilação de produção com `npm run build` atestando tempo < 5s e zero erros TypeScript/Vite

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup & Red-Bar Base)**: Inicia imediatamente; bloqueia todas as fases subsequentes.
- **Phase 2 (User Story 1 - Task.tsx)**: Pode iniciar após a Fase 1.
- **Phase 3 (User Story 2 - TaskDetailsModal.tsx)**: Pode iniciar após a Fase 1 (independente de US1).
- **Phase 4 (User Story 3 - useTaskCollection.ts)**: Pode iniciar após a Fase 1 (independente de US1 e US2).
- **Phase 5 (User Story 4 - App.tsx)**: Depende da estabilização de US1, US2 e US3 para consolidação final da casca.
- **Phase 6 (Polish)**: Execução pós-conclusão de todas as histórias.

### Parallel Opportunities
- `T001`, `T002` e `T003` podem ser executados em paralelo na Fase 1.
- `T004`, `T005`, `T006` e `T007` (subcomponentes de Task) podem ser criados em paralelo na Fase 2.
- `T011`, `T012`, `T013` e `T014` (seções do modal) podem ser criados em paralelo na Fase 3.
- `T018`, `T019`, `T020` e `T021` (sub-hooks especialistas) podem ser criados em paralelo na Fase 4.
- `T025` e `T026` (Header e DialogsContainer) podem ser criados em paralelo na Fase 5.

---

## Implementation Strategy: MVP First

1. **Fase 1**: Criar o guard test `moduleLineCountGuard.test.ts` estabelecendo o Red-Bar de falha.
2. **Fase 2 (MVP Core)**: Decompor `Task.tsx` (o maior arquivo do sistema, 907 linhas) para < 200 linhas.
3. **Fase 3**: Decompor `TaskDetailsModal.tsx` (728 linhas) preservando o guard de rascunhos sujos.
4. **Fase 4**: Decompor `useTaskCollection.ts` (751 linhas) via padrão fachada sem quebrar componentes consumidores.
5. **Fase 5**: Decompor `App.tsx` (762 linhas) extraindo cabeçalho e hospedeiro de modais.
6. **Fase 6**: Certificação dos portões de qualidade (0 erros lint, build < 5s, 744 testes verdes).
