---
description: "Task list for feature 027 - Card Subtasks and Comments"
---

# Tasks: Feature 027 - Subtarefas e Comentários nos Cartões

**Input**: Design documents from `/specs/027-card-subtasks-and-comments/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required), [research.md](research.md), [data-model.md](data-model.md), [contracts/subtask-comment.contract.md](contracts/subtask-comment.contract.md), [quickstart.md](quickstart.md)

**Tests**: **Incluídos** — Constituição III (Verificação Automatizada) e Constituição VI.5 (Falsificabilidade & TDD Red-Bar) tornam a elaboração de testes automatizados obrigatória.

**Organization**: Tarefas agrupadas por fases e histórias de usuário (US1, US2, US3) para execução e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos distintos, sem dependência bloqueante)
- **[Story]**: História de usuário à qual a tarefa pertence (US1, US2, US3)
- Todas as descrições incluem caminho de arquivo exato

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Verdades fundamentais e invariantes:**
  - Uma subtarefa é uma partição de escopo de uma tarefa-mãe. Ela deve herdar o ciclo de vida do pai (se o pai é removido, os filhos deixam de existir).
  - Um comentário é uma anotação imutável em seu registro temporal (`createdAt`) com autor vinculado. Ele tem uma **única entidade dona** (`TaskModel` OU `SubtaskModel`).
  - O estado de conclusão de uma subtarefa é booleano e seu cálculo de progresso é puramente derivado: $\text{progresso} = \frac{\sum [completed = true]}{\text{total}}$.
  - A adição de contexto (subtarefas/comentários) **nunca** altera o estado de fluxo do cartão (coluna, lead time, cycle time ou WIP).
- **Premissas acidentais descartadas:**
  - Descartada a premissa de que comentários devam ser uma coleção relacional plana no topo do quadro com chave estrangeira: aninhamento estrutural garante integridade referencial em cascata sem varredura de órfãos (D1).
  - Descartada a necessidade de sincronização ou websocket: o Metrik é estritamente local-first (Constitution VIII).
  - Descartada a necessidade de suporte a Markdown rico ou anexos: complexidade desnecessária rejeitada (Constitution V - YAGNI).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)

- **Cenário de Falha 1: Explosão de altura e quebra de layout no quadro.**
  - *Falha:* Cartões com dezenas de comentários ou subtarefas longas estouram a altura da coluna, empurrando o quadro para baixo e quebrando a paridade recém-conquistada na Feature 026.
  - *Mitigação:* Seção recolhível no cartão por padrão e contenção estrita de rolagem com `max-height` e `overflow-y: auto` (FR-019, FR-020).
- **Cenário de Falha 2: Conflito de eventos de clique e arrastar (Drag and Drop).**
  - *Falha:* Tentar clicar no checkbox ou no campo de texto dispara o arraste do cartão (DnD), impossibilitando a digitação ou foco.
  - *Mitigação:* Isolar campos de formulário, botões e checkboxes com `e.stopPropagation()` ou atributo `data-no-dnd` prevenindo a ativação do handler de arraste pai.
- **Cenário de Falha 3: Inconsistência de comentários órfãos ao deletar subtarefas.**
  - *Falha:* Subtarefa removida mas comentários persistem em memória ou geram vazamento de estado.
  - *Mitigação:* Remoção aninhada pura em `src/utils/cardChildren.ts` e diálogo de confirmação explícito alertando a perda dos comentários vinculados (FR-013).
- **Cenário de Falha 4: Modificação indevida por usuário somente leitura (Guest).**
  - *Falha:* Convidado consegue submeter comentário via atalho Enter no input.
  - *Mitigação:* Guarda de permissão em `cardChildren.ts` e desativação explícita (`disabled`) nos componentes visuais baseada em `useTeamAccess` (FR-016).

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

- **Mutuamente Exclusivas (Zero sobreposição):**
  - `src/types/kanban.ts`: Apenas definições de tipos e interfaces.
  - `src/utils/cardChildren.ts`: Funções puras de manipulação e regras de negócio.
  - `tests/unit/cardChildren.test.ts`: Testes unitários puros das regras de negócio.
  - `tests/unit/cardChildrenContract.test.ts`: Testes de invariantes e matriz de permissões.
  - `src/components/Task.tsx`: Renderização da área recolhível e interações do cartão no quadro.
  - `src/components/TaskDetailsModal.tsx`: Renderização e gestão detalhada de comentários no modal.
  - `src/App.css`: Estilização e contenção de rolagem.
- **Coletivamente Exaustivas (100% de cobertura dos requisitos):**
  - FR-001 a FR-005 (Subtarefas no cartão) → Cobertos por T005, T006, T007, T008.
  - FR-006 a FR-011 (Comentários no pai e filho, autoria, ordem, validação) → Cobertos por T002, T003, T009, T010, T011, T012, T013.
  - FR-012 a FR-015 (Persistência, cascata, badges) → Cobertos por T002, T007, T010, T014.
  - FR-016 a FR-020 (Somente leitura, contenção de layout, ausência de impacto em métricas) → Cobertos por T004, T008, T015, T016.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)

- **Alternativa A: Comentários como coleção separada por quadro (`Board.comments`).**
  - *Poda:* Exigiria chaves compostas, relacionamentos bidirecionais e lógica de limpeza de órfãos ao deletar cartões/subtarefas. Podada em favor do aninhamento estrutural (D1).
- **Alternativa B: Edição/renomeação de subtarefas existentes inline.**
  - *Poda:* Não solicitada na spec e abre riscos de complexidade de foco e estado de edição concorrente. Podada (D6) para manter foco cirúrgico no pedido original (criar, concluir, remover).
- **Alternativa C: Criação de componente modal separado para comentários da subtarefa.**
  - *Poda:* Criaria proliferação de modais aninhados, péssimo para acessibilidade e usabilidade mobile/desktop. Podada em favor da visualização colapsável inline e integração natural no modal existente (D4, D7).

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

- **Red-Bar 1 (Tipagem & Domínio):** `tests/unit/cardChildren.test.ts` falha inicialmente pois `src/utils/cardChildren.ts` não existe.
- **Red-Bar 2 (Contrato de Permissões):** `tests/unit/cardChildrenContract.test.ts` falha ao verificar a rejeição de comentários por convidados e descarte de strings em branco.
- **Red-Bar 3 (UI de Subtarefas no Cartão):** `tests/unit/Task.test.tsx` falha ao tentar localizar o formulário de criação de subtarefas no cartão.
- **Red-Bar 4 (Comentários no Cartão & Modal):** `tests/unit/TaskDetailsModal.test.tsx` falha ao buscar seção de comentários.
- **Green-Bar:** 100% dos testes unitários e de integração passam, mantendo zero regressões nas 393 suítes anteriores.

### 6. Triangulação Adversarial & Verificação da Constituição

- **I. SDD:** Spec, plano, contrato e modelo de dados formalizados antes da codificação.
- **II. Modularidade:** Módulo puro `cardChildren.ts` sem efeitos colaterais.
- **III. Verificação:** Testes de domínio, componentes e regressão completa.
- **IV. Observabilidade:** Avisos com prefixo canônico `[Metrik]`.
- **V. YAGNI & Simplicidade:** Sem dependências externas de texto rico ou componentes pesados.
- **VI. Raciocínio Analítico:** Modelos 1 a 6 registrados na íntegra.
- **VII. Independência de Marca:** Terminologia neutra e canônica.
- **VIII. Soberania Local-First:** Persistência estrita em `localStorage`.

---

## Phase 1: Setup & Data Models

- [ ] T001 Update TypeScript types in `src/types/kanban.ts` to include `CommentModel`, optional `comments` on `SubtaskModel`, and optional `comments` on `TaskModel`.

---

## Phase 2: Foundational Domain & Contract Tests (Blocking Prerequisites)

- [ ] T002 [P] Write failing unit tests in `tests/unit/cardChildren.test.ts` covering subtask addition, toggle, cascade deletion, and comment creation/normalization/validation.
- [ ] T003 Create pure domain utility functions in `src/utils/cardChildren.ts` (`addSubtaskToCard`, `toggleSubtaskInCard`, `removeSubtaskFromCard`, `addCommentToTarget`, `editCommentInTarget`, `removeCommentFromTarget`, `canManageComment`).
- [ ] T004 [P] Write contract and authorization tests in `tests/unit/cardChildrenContract.test.ts` ensuring guest read-only enforcement and single-owner invariants (CC-01 to CC-14).

---

## Phase 3: User Story 1 - Subtarefas Direto no Cartão (Priority: P1) 🎯 MVP

- [ ] T005 [P] [US1] Write failing component tests in `tests/unit/Task.test.tsx` asserting subtask creation input, toggle, removal, and counter updates directly in `Task.tsx`.
- [ ] T006 [US1] Implement collapsible subtasks section with inline creation and completion toggle in `src/components/Task.tsx`.
- [ ] T007 [US1] Update progress badge in `src/components/Task.tsx` to react immediately to subtask additions and state changes.
- [ ] T008 [US1] Add CSS styles for inline subtask items, checkboxes, and scroll containment in `src/App.css`.

---

## Phase 4: User Story 2 - Comentar no Cartão Pai (Priority: P1)

- [ ] T009 [P] [US2] Write failing tests in `tests/unit/TaskDetailsModal.test.tsx` and `tests/unit/Task.test.tsx` for parent card comment creation, listing, editing, and deletion.
- [ ] T010 [US2] Implement parent card comments list and comment composer in `src/components/Task.tsx` with comment count badge.
- [ ] T011 [US2] Implement parent card comments section in `src/components/TaskDetailsModal.tsx` maintaining parity with card capabilities.

---

## Phase 5: User Story 3 - Comentar na Subtarefa / Cartão Filho (Priority: P2)

- [ ] T012 [P] [US3] Write tests in `tests/unit/cardChildren.test.ts` and `tests/unit/Task.test.tsx` verifying comment isolation between parent card and subtasks.
- [ ] T013 [US3] Implement subtask comment composer and list inside subtask items in `src/components/Task.tsx` and `src/components/TaskDetailsModal.tsx`.
- [ ] T014 [US3] Implement confirmation dialog on subtask removal warning that linked child comments will be cascade-deleted.

---

## Phase 6: Polish, Accessibility & Regression

- [ ] T015 [P] Ensure WCAG 2.1 AA accessibility (aria labels, keyboard navigation, focus trap in delete confirmation) in `src/components/Task.tsx` and `src/components/TaskDetailsModal.tsx`.
- [ ] T016 [P] Add CSS scroll containment rules (`max-height: 240px; overflow-y: auto`) to prevent cards from expanding infinitely when containing up to 50 subtasks or 200 comments in `src/App.css`.
- [ ] T017 Run full automated test suite (`npm test`) and production build (`npm run build`) ensuring zero regressions and all tests green.
- [ ] T018 Review and close `specs/027-card-subtasks-and-comments/checklists/requirements.md` and `subtasks-and-comments.md`.
