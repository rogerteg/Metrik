# Tasks: Task Details Modal & Activity System Complete UI/UX Redesign

**Feature Branch**: `036-task-details-modal-redesign` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório por Constituição VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante Irredutível de Negócio**: Um modal de detalhes de tarefa é um centro de leitura e tomada de decisão. Ele requer visibilidade imediata dos metadados principais (prioridade, responsável, datas) e espaço sem fricção para leitura de histórico e redação de comentários.
- **Premissas Descartadas**: Eliminar visualizações de coluna única amontoadas no modal desktop, ícones SVG sem tamanho delimitado que distorcem o alinhamento de texto e a ausência de persistência para preferências de densidade do usuário.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modos de Falha Cobre-Mapeados**:
  - *Cenário 1 (Perda de Rascunho)*: O usuário digita um comentário extenso e clica fora do modal sem querer -> **Mitigação**: Guard de dirty state (`showDirtyConfirmDialog`) e listener `beforeunload`.
  - *Cenário 2 (Distorção Responsiva)*: O modal em 2 colunas quebra em telas de notebook menor (13") -> **Mitigação**: Transição CSS limpa para 1 coluna vertical abaixo de `768px`.
  - *Cenário 3 (Ícones Gigantes)*: SVGs sem classe `flex-shrink: 0` estouram em flexboxes -> **Mitigação**: Regra CSS global e utilitário `w-4 h-4 max-w-[18px] flex-shrink-0`.
  - *Cenário 4 (Incompatibilidade com Supabase)*: Alterações na UI quebram o schema `TaskComment` ou `TaskActivityLog` -> **Mitigação**: 100% de reutilização de tipos e contratos existentes sem mutações destrutivas.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua**: Tarefas divididas com limites claros de arquivos (`TaskDetailsModal.tsx` vs `TaskMetadataSidebar.tsx` vs `ActivityFeed.tsx` vs `useTimelinePreferences.ts`).
- **Exaustividade Coletiva**: A soma de T001 a T018 cobre 100% das histórias de usuário (US1, US2, US3), critérios de aceitação e edge cases da `spec.md`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Caminho Escolhido**: CSS Grid/Flexbox responsivo em 2 colunas com suporte a Tailwind CSS utilities e glassmorphism sutil (`bg-slate-900/90 backdrop-blur-md`).
- **Alternativas Podadas**:
  - *Modal com abas verticais*: Podado por exigir cliques adicionais para ver metadados e histórico ao mesmo tempo.
  - *Biblioteca de UI externa (Chakra/MUI)*: Podado por violar a Constituição V (Simplicidade) e VII (Independência de Marca).

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável (Red Bar)**: Executar `npm test` antes da refatoração deve falhar nos novos testes de persistência de preferências (`useTimelinePreferences`) e guard de dirty state.
- **Green Bar**: Todos os testes unitários (`npm test -- --run`) e a compilação do Vite (`npm run build`) passam com zero erros.

### 6. Triangulação Adversarial & Conformidade Constitucional
- Auditado contra a **Constituição de Metrik**: Simplicidade (YAGNI), Local-First Sovereignty (persistência em `metrik-timeline-prefs`), TBAC Read-Only (restrições para papel `guest`) e integridade de dados (Dirty State Guard).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar tipos e estruturas auxiliares para o redesign visual.

- [X] T001 Exportar tipos de estados e preferências `UserTimelinePreferences` e `TaskDetailsModalState` em `src/types/taskActivity.ts`
- [X] T002 [P] Atualizar utilitários de parser de Markdown com estilos CSS para código e citações em `src/utils/simpleMarkdown.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de estado e hooks que bloqueiam a renderização do novo modal.

- [X] T003 Criar hook de persistência de preferências de timeline `useTimelinePreferences` com sincronização em `localStorage` (`metrik-timeline-prefs`) em `src/hooks/useTimelinePreferences.ts`
- [X] T004 [P] Criar testes unitários para `useTimelinePreferences` em `tests/unit/useTimelinePreferences.test.tsx`

**Checkpoint**: Hook de preferências testado e pronto para consumo.

---

## Phase 3: User Story 1 - Redesign Visual Premium do Modal de Detalhes da Tarefa (Priority: P1) 🎯 MVP

**Goal**: Entregar o layout em 2 colunas (65%-70% principal / 30%-35% lateral) com glassmorphism (`bg-slate-900/90 backdrop-blur-md`), sidebar de metadados padronizada e restrição estrita de SVGs (<=18px).

**Independent Test**: Abrir qualquer tarefa e verificar o layout em 2 colunas em desktop e a transição responsiva para 1 coluna vertical em telas menores (<768px).

### Tests for User Story 1 🧪

- [X] T005 [P] [US1] Criar testes de componente para a estrutura do novo modal de detalhes em `tests/unit/TaskDetailsModalRedesign.test.tsx`

### Implementation for User Story 1

- [X] T006 [P] [US1] Criar o componente de painel lateral de metadados `TaskMetadataSidebar.tsx` em `src/components/TaskMetadataSidebar.tsx`
- [X] T007 [US1] Refatorar a estrutura do modal container `TaskDetailsModal.tsx` para usar o layout responsivo em 2 colunas (65%/35%) com glassmorphism e sidebar de metadados em `src/components/TaskDetailsModal.tsx`
- [X] T008 [P] [US1] Padronizar o dimensionamento e bounding de todos os ícones SVGs internos (14px-18px, `flex-shrink: 0`) em `src/components/TaskMetadataSidebar.tsx` e `src/components/TaskDetailsModal.tsx`

**Checkpoint**: Layout em 2 colunas e sidebar de metadados totalmente funcionais e testáveis independentemente.

---

## Phase 4: User Story 2 - Reformulação de Elite da Seção de Histórico, Comentários e Logs (Priority: P2)

**Goal**: Reformular visualmente o feed de atividades com contraste elevado: cartões de comentários em `bg-slate-900/80`, logs em `bg-slate-950/60` com pílulas diff `[De ➔ Para]`, suporte a Markdown rico e destaque dourado para Decisões de Projeto.

**Independent Test**: Inserir um comentário com Markdown (código inline, quote) e alterar a prioridade/status de uma tarefa, confirmando a diferenciação visual entre comentários e logs.

### Tests for User Story 2 🧪

- [X] T009 [P] [US2] Criar testes unitários para o feed de atividades reformulado em `tests/unit/ActivityFeedRedesign.test.tsx`

### Implementation for User Story 2

- [X] T010 [P] [US2] Estilizar o cartão de comentário de usuário `CommentCard.tsx` com `bg-slate-900/80`, avatares destacados e badge de decisão em `src/components/CommentCard.tsx`
- [X] T011 [P] [US2] Estilizar a linha discreta de auditoria `ActivityLogItem.tsx` com `bg-slate-950/60` e pílulas diff `[De ➔ Para]` em `src/components/ActivityLogItem.tsx`
- [X] T012 [US2] Integrar cartões reformulados e barra de atalhos Markdown no feed de atividades `ActivityFeed.tsx` em `src/components/ActivityFeed.tsx`

**Checkpoint**: Histórico de atividades, comentários e logs com visualização enterprise e formatação de alta qualidade.

---

## Phase 5: User Story 3 - Preservação Invariante de Configurações do Usuário e Rascunhos (Priority: P3)

**Goal**: Garantir persistência determinística de preferências do usuário (densidade e filtro ativo) e proteção contra perda acidental de rascunhos de comentários (Dirty State Guard).

**Independent Test**: Selecionar densidade compacta e filtro "Decisões", fechar o modal e abrir outra tarefa, confirmando a restauração automática. Digitar um texto no rascunho e tentar fechar, confirmando o aparecimento da caixa de diálogo de confirmação.

### Tests for User Story 3 🧪

- [X] T013 [P] [US3] Criar testes de componente para o guard de rascunho sujo e persistência de preferências em `tests/unit/TaskModalDraftGuard.test.tsx`

### Implementation for User Story 3

- [X] T014 [US3] Conectar o hook `useTimelinePreferences` à barra de filtros `TimelineFilterBar.tsx` e ao feed `ActivityFeed.tsx` em `src/components/TimelineFilterBar.tsx`
- [X] T015 [US3] Implementar caixa de diálogo de confirmação de descarte de rascunho (`showDirtyConfirmDialog`) e listener `beforeunload` em `src/components/TaskDetailsModal.tsx`

**Checkpoint**: Todas as 3 histórias de usuário concluídas, testadas e independentemente funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação final de acessibilidade, responsividade, compilação e suíte completa de testes.

- [X] T016 [P] Atualizar documentação visual e notas de contrato em `specs/036-task-details-modal-redesign/quickstart.md`
- [X] T017 Executar suíte de testes unitários sem regressões (`npm test -- --run`)
- [X] T018 Executar compilação TypeScript e bundler Vite (`npm run build`) para validar zero erros de compilação

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências - pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup - BLOQUEIA todas as histórias de usuário.
- **User Stories (Phase 3+)**: Dependem da conclusão da Phase 2.
  - Podem ser executadas em sequência de prioridade (US1 ➔ US2 ➔ US3) ou em paralelo.
- **Polish (Phase 6)**: Depende da conclusão das histórias de usuário desejadas.

### Within Each User Story
- Testes unitários (se inclusos) DEVEM falhar antes da implementação.
- Componentes isolados (`TaskMetadataSidebar`, `CommentCard`, `ActivityLogItem`) antes da integração no container (`TaskDetailsModal`, `ActivityFeed`).

---

## Parallel Execution Examples

### User Story 1 (P1 - MVP)
```powershell
# Executar modelos e sub-componentes em paralelo:
Task: "Criar componente de painel lateral TaskMetadataSidebar.tsx em src/components/TaskMetadataSidebar.tsx"
Task: "Criar testes de componente em tests/unit/TaskDetailsModalRedesign.test.tsx"
```

### User Story 2 (P2)
```powershell
# Executar estilização de cartões em paralelo:
Task: "Estilizar CommentCard.tsx em src/components/CommentCard.tsx"
Task: "Estilizar ActivityLogItem.tsx em src/components/ActivityLogItem.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Concluir Phase 3 (User Story 1 - Layout 2 colunas & metadados).
3. **VALIDAR**: Abrir o modal no navegador e confirmar a transição visual premium.

### Incremental Delivery
1. Entregar MVP (US1).
2. Adicionar US2 (Reformulação de feed de comentários e logs com Markdown rico).
3. Adicionar US3 (Persistência de preferências e proteção contra perda de rascunhos).
4. Executar Phase 6 (Polimento e verificação automatizada `npm test -- --run` e `npm run build`).
