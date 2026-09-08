# Tasks: Core Kanban Board (MVP Fase 1)

**Input**: Design documents from `/specs/001-core-kanban-board/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdades fundamentais e invariantes:**
  - O Kanban é essencialmente uma máquina de estados finita sobre coleções ordenadas de itens (`Todo` → `In Progress` → `Blocked` → `Completed`).
  - Cada cartão possui identidade única imutável (UUID v4) e pertence a exatamente um estado por vez.
  - A persistência é uma função pura: `Storage(State) -> Serialized JSON` e `Rehydrate(JSON) -> State`.
- **Premissas acidentais descartadas:**
  - Eliminada qualquer dependência de backend/servidor no MVP: o navegador é o ambiente de execução e armazenamento suficiente para a Fase 1.
  - Descartado o uso de bibliotecas pesadas de gerenciamento de estado global (Redux, Zustand) em favor de hooks React nativos e modulares (YAGNI).

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)
- **Cenários de falha antecipados:**
  - *Modo de falha 1:* Cartão vazio criado sem intenção do usuário poluindo o storage se ele clicar fora sem digitar.
  - *Modo de falha 2:* Falha silenciosa de parsing se o `localStorage` contiver dados mal formatados ou chave corrompida.
  - *Modo de falha 3:* Textarea causando quebra de layout em telas mobile quando o usuário cola textos longos sem quebra de espaço.
  - *Modo de falha 4:* Exclusão acidental em massa por clique involuntário no botão de limpeza.
- **Mitigações desenhadas nas tarefas:**
  - `FR-013` embutido na tarefa T014: descarte automático no evento `blur` se o cartão estiver vazio.
  - Wrapper com `try/catch` defensivo embutido na tarefa T017: restauração segura do `seedData` em caso de erro de parse.
  - CSS com `word-break: break-word` e `max-height` seguro na tarefa T007.
  - Diálogo de confirmação obrigatório antes de limpar o quadro na tarefa T023.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua (Zero Duplicação):**
  - Cada tarefa possui um arquivo de destino estritamente definido (`src/types/kanban.ts`, `src/hooks/useTaskCollection.ts`, `src/components/Column.tsx`, etc.). Nenhuma tarefa duplica o escopo de outra.
- **Exaustão Coletiva (Cobertura 100%):**
  - 100% dos requisitos funcionais (`FR-001` a `FR-014`) e histórias (`US1` a `US5`) mapeados diretamente nas tarefas das Fases 1 a 8.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Caminhos avaliados:**
  - *Ramo 1:* Tentar implementar Drag & Drop completo já na primeira sprint.
    - *Poda:* Descartado para a Fase 1 porque adicionaria complexidade de dependências (`react-dnd` / backends de touch) antes que a renderização atômica e a persistência estivessem consolidadas.
  - *Ramo 2:* Transição via botões direcionais rápidos no cartão (`←` e `→`).
    - *Escolha:* Selecionado por ser determinístico, rápido, altamente acessível (desktop e mobile) e imediatamente testável via testes unitários.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha demonstrável (Red Bar):**
  - Tarefas de teste T008, T012, T016, T019 e T022 devem ser executadas e falhar antes da codificação dos respectivos componentes e hooks.
- **Critério determinístico de aceite (Green Bar):**
  - Todas as asserções de renderização, mutação de array e persistência no `localStorage` passam com 100% de sucesso no Vitest.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - *I. SDD:* Segue estritamente a hierarquia constitucional.
  - *II. Modularidade:* Componentes desacoplados, hooks reutilizáveis.
  - *III. Testes:* Suíte de testes automatizada para toda lógica de negócio.
  - *IV. Observabilidade:* Logs claros em console no ciclo de vida do storage.
  - *V. YAGNI:* Solução mais direta e elegante possível.
  - *VI. Raciocínio Analítico:* Formalizado e registrado neste documento.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto frontend e infraestrutura básica de desenvolvimento e testes.

- [X] T001 Inicializar estrutura de projeto React 19 + TypeScript com Vite em `package.json` e `vite.config.ts`
- [X] T002 Configurar tokens de design, reset e classes utilitárias em `src/App.css`
- [X] T003 [P] Configurar ambiente de testes unitários com Vitest e Testing Library em `vite.config.ts` e `tests/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelos de domínio, dados seed e engine central de persistência que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma história de usuário pode ser finalizada antes da conclusão desta fase.

- [X] T004 Criar definições de tipos e enums de domínio (`TaskModel`, `ColumnType`, `BoardState`) em `src/types/kanban.ts`
- [X] T005 [P] Criar dados demonstrativos iniciais (*seed data*) e validação de schema em `src/utils/seedData.ts`
- [X] T006 Implementar hook base de armazenamento local reativo com tratamento defensivo de erros em `src/hooks/useTaskCollection.ts`
- [X] T007 [P] Implementar componente de área de texto auto-expansível em `src/components/AutoResizeTextarea.tsx`

**Checkpoint**: Fundação pronta — implementação das histórias de usuário pode prosseguir.

---

## Phase 3: User Story 1 - Visualização do Quadro Multi-Coluna (Priority: P1) 🎯 MVP

**Goal**: Exibir 4 colunas Kanban (`Todo`, `In Progress`, `Blocked`, `Completed`) com badges distintas, contadores numéricos e grid responsivo.

**Independent Test**: Carregar a aplicação no navegador e verificar se as 4 colunas são renderizadas com títulos, contadores e esquemas de cores específicos (cinza, azul, vermelho para bloqueado e verde).

### Tests for User Story 1
- [X] T008 [P] [US1] Criar teste unitário de renderização das 4 colunas e badges em `tests/unit/Column.test.tsx`

### Implementation for User Story 1
- [X] T009 [P] [US1] Implementar componente de coluna individual com badge colorido e contador de tarefas em `src/components/Column.tsx`
- [X] T010 [US1] Implementar componente de quadro (`Board`) organizando as 4 colunas em grid responsivo em `src/components/Board.tsx`
- [X] T011 [US1] Estilizar visual de destaque de alerta (vermelho) para a coluna `Blocked` em `src/App.css`

**Checkpoint**: User Story 1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Criação e Edição Atômica de Tarefas (Priority: P1)

**Goal**: Adicionar novo cartão com botão `+`, editar título inline com auto-resize, descartar cartões vazios no blur (`FR-013`) e excluir individualmente.

**Independent Test**: Clicar em `+`, digitar título expansivo, perder foco mantendo o texto; clicar em `+` e perder foco sem texto (descarte automático); clicar na lixeira para remoção.

### Tests for User Story 2
- [X] T012 [P] [US2] Criar teste unitário para criação, edição inline, descarte no blur e exclusão de tarefa em `tests/unit/Task.test.tsx`

### Implementation for User Story 2
- [X] T013 [P] [US2] Implementar componente de cartão de tarefa com edição inline e botão de lixeira em `src/components/Task.tsx`
- [X] T014 [US2] Implementar hook de coluna `useColumnTasks` com operações atômicas (`addTask`, `updateTask`, `deleteTask`, descarte no blur) em `src/hooks/useColumnTasks.ts`
- [X] T015 [US2] Conectar botão `+` do cabeçalho da coluna para criação de nova tarefa em `src/components/Column.tsx`

**Checkpoint**: User Stories 1 e 2 integradas e funcionais.

---

## Phase 5: User Story 3 - Persistência Local Reativa (Priority: P1)

**Goal**: Sincronizar todas as alterações no `localStorage` (`metrik_kanban_tasks`) e carregar dados seed no primeiro acesso.

**Independent Test**: Modificar o quadro, recarregar a página com `F5` e verificar a restauração exata dos cartões. Simular storage corrompido e verificar restauração sem crash.

### Tests for User Story 3
- [X] T016 [P] [US3] Criar teste unitário para persistência, recarga e recuperação de storage corrompido em `tests/unit/useTaskCollection.test.ts`

### Implementation for User Story 3
- [X] T017 [US3] Integrar serialização automática e desserialização com fallback resiliente em `src/hooks/useTaskCollection.ts`
- [X] T018 [US3] Conectar o estado persistido ao componente principal em `src/App.tsx`

**Checkpoint**: MVP do Core Kanban (Fase 1) completamente funcional e persistente.

---

## Phase 6: User Story 4 - Transição de Estado entre Colunas (Priority: P2)

**Goal**: Mover tarefas entre as colunas adjacentes usando botões direcionais rápidos (`←` e `→`) no cartão.

**Independent Test**: Clicar em `→` em um cartão de `Todo` e verificar sua transferência para `In Progress` com atualização imediata dos contadores.

### Tests for User Story 4
- [X] T019 [P] [US4] Criar teste unitário para transição de tarefas entre colunas em `tests/unit/taskTransitions.test.ts`

### Implementation for User Story 4
- [X] T020 [P] [US4] Adicionar botões direcionais rápidos (`←` e `→`) no rodapé do cartão em `src/components/Task.tsx`
- [X] T021 [US4] Implementar função `moveTask(taskId, targetColumn)` no hook `src/hooks/useTaskCollection.ts` e propagar em `src/hooks/useColumnTasks.ts`

**Checkpoint**: Transições de estado operacionais sem necessidade de drag-and-drop complexo.

---

## Phase 7: User Story 5 - Ações Globais e Limpeza Segura (Priority: P3)

**Goal**: Fornecer controle no cabeçalho para reset ou limpeza do quadro com diálogo de confirmação.

**Independent Test**: Clicar em "Clear Tasks", cancelar (nada muda); clicar novamente e confirmar (quadro é limpo do estado e do storage).

### Tests for User Story 5
- [X] T022 [P] [US5] Criar teste unitário para ação global de limpeza e cancelamento em `tests/unit/boardActions.test.tsx`

### Implementation for User Story 5
- [X] T023 [US5] Implementar cabeçalho da aplicação com botão "Clear Tasks" e confirmação de diálogo em `src/App.tsx`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validação final de roteiro, responsividade e aderência à Constituição.

- [X] T024 [P] Validar roteiro completo de testes manuais conforme `specs/001-core-kanban-board/quickstart.md`
- [X] T025 [P] Ajustar media queries e estilos responsivos para mobile e tablets em `src/App.css`
- [X] T026 Executar verificação de lint, build limpo e auditoria final de código limpo

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende do Setup — **BLOQUEIA** todas as histórias de usuário.
- **User Stories (Phase 3 a 7)**: Todas dependem da Fundação (Phase 2). Executadas em ordem de prioridade (P1 → P2 → P3).
- **Polish (Phase 8)**: Depende da conclusão de todas as histórias desejadas.

### Within Each User Story
- Testes unitários escritos e falhando antes da implementação.
- Tipos antes de componentes.
- Componentes puros antes de integração com hooks.
- Story validada antes de avançar para a próxima prioridade.

---

## Implementation Strategy: MVP First (User Stories 1, 2 e 3)

1. Concluir **Phase 1: Setup**
2. Concluir **Phase 2: Foundational** (Tipos, Seed Data, Hook base)
3. Concluir **Phase 3: User Story 1** (Visualização do Quadro)
4. Concluir **Phase 4: User Story 2** (Criação e Edição de Cartões)
5. Concluir **Phase 5: User Story 3** (Persistência Local)
6. **PARAR e VALIDAR**: Neste ponto, o MVP estará 100% utilizável no dia a dia.
7. Avançar para **Phase 6: User Story 4** (Transições rápidas) e **Phase 7: User Story 5** (Limpeza global).
