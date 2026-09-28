# Feature Specification: Planejamento de Sprints

**Feature Branch**: `038-sprint-planning`
**Created**: 2026-09-28
**Status**: Draft
**Input**: Capacidade de planejar e acompanhar iterações (sprints) por quadro, atribuindo tarefas e medindo progresso/velocity, mantendo a soberania Local-First.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciar sprints do quadro (Priority: P1) 🎯 MVP

Como líder de squad, quero criar, editar e excluir sprints (nome, meta e janela de datas) para organizar o trabalho por iteração sem sair do quadro.

**Why this priority**: É a base da capacidade — sem a entidade sprint não há atribuição nem acompanhamento.

**Independent Test**: Criar uma sprint, editar sua meta/datas, recarregar a aplicação e confirmar que os dados persistem; excluir a sprint e confirmar que as tarefas permanecem no quadro.

**Acceptance Scenarios**:

1. **Given** um quadro sem sprints, **When** o usuário cria uma sprint com nome válido, **Then** a sprint aparece como "planejada" e persiste após recarregar.
2. **Given** uma sprint existente, **When** o usuário edita nome/meta/datas, **Then** os valores atualizados são exibidos e persistidos.
3. **Given** uma sprint com tarefas atribuídas, **When** o usuário a exclui e confirma, **Then** a sprint deixa de existir e as tarefas permanecem no quadro **sem** sprint.
4. **Given** um nome vazio ou só com espaços, **When** o usuário confirma, **Then** nada é criado.
5. **Given** datas de início e fim informadas, **When** o fim é anterior ao início, **Then** a criação/edição é rejeitada com aviso.

---

### User Story 2 - Ativar sprint e atribuir tarefas (Priority: P1)

Como membro da squad, quero ativar uma sprint (uma por vez) e atribuir/remover tarefas a ela, para delimitar o escopo da iteração corrente.

**Why this priority**: Conecta o trabalho real (tarefas) à iteração; é o que dá utilidade operacional à sprint.

**Independent Test**: Ativar uma sprint, atribuir duas tarefas, remover uma, e confirmar que apenas a sprint ativa recebe novas atribuições por padrão e que a persistência se mantém.

**Acceptance Scenarios**:

1. **Given** duas sprints planejadas, **When** o usuário ativa uma, **Then** ela se torna a única sprint ativa do quadro e as demais permanecem planejadas.
2. **Given** uma sprint ativa, **When** o usuário atribui uma tarefa a ela, **Then** a tarefa passa a exibir a marcação da sprint e o progresso é recalculado.
3. **Given** uma tarefa atribuída, **When** o usuário remove a atribuição, **Then** a tarefa deixa de contar no progresso da sprint.
4. **Given** uma sprint ativa, **When** o usuário a conclui, **Then** ela sai de "ativa" e nenhuma tarefa é movida ou concluída automaticamente.
5. **Given** um quadro somente leitura, **When** um convidado tenta criar/ativar/atribuir, **Then** nenhuma ação de escrita é oferecida.

---

### User Story 3 - Acompanhar progresso e velocity (Priority: P2)

Como líder de squad, quero ver o progresso da sprint ativa (concluídas/total, %) e a velocity (concluídas na sprint), para acompanhar a entrega da iteração.

**Why this priority**: Valor analítico incremental; depende de US1/US2.

**Independent Test**: Atribuir N tarefas (algumas concluídas) à sprint ativa e conferir que o painel exibe `concluídas/total` e `%` corretos e que a velocity equivale às concluídas.

**Acceptance Scenarios**:

1. **Given** uma sprint ativa com 4 tarefas, 1 concluída, **When** o painel é exibido, **Then** mostra "1/4" e "25%".
2. **Given** uma tarefa da sprint é concluída, **When** o estado muda, **Then** o progresso é recalculado imediatamente.
3. **Given** uma sprint sem tarefas, **When** o painel é exibido, **Then** mostra "0/0" e 0% sem erro.

### Edge Cases

- Sprint sem tarefas → progresso "0/0", sem divisão por zero.
- Tarefa já concluída antes de ser atribuída → conta como concluída na sprint.
- Sprint excluída enquanto era ativa → `activeSprintId` é limpo.
- Ativar uma nova sprint com outra ativa → a anterior volta a "planejada".
- Datas ausentes → sprint válida (janela opcional).
- Tarefa atribuída a sprint inexistente (dado corrompido) → ignorada nos cálculos; nenhuma exclusão em cascata de tarefa.
- Concluir sprint com tarefas pendentes → permanecem atribuídas (sem auto-mover nem auto-concluir).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O quadro MUST permitir criar uma sprint com nome obrigatório e meta/datas opcionais.
- **FR-002**: O usuário MUST poder editar nome, meta, data de início e data de fim de uma sprint.
- **FR-003**: O sistema MUST permitir no máximo **uma** sprint ativa por quadro; ativar uma sprint MUST rebaixar a anterior para "planejada".
- **FR-004**: O usuário MUST poder concluir a sprint ativa; concluir MUST NOT mover nem concluir tarefas automaticamente.
- **FR-005**: Excluir uma sprint MUST remover a associação (`sprintId`) das tarefas sem excluí-las.
- **FR-006**: O usuário MUST poder atribuir e remover uma tarefa de uma sprint.
- **FR-007**: O painel da sprint ativa MUST exibir progresso como concluídas/total e percentual.
- **FR-008**: O sistema MUST calcular a velocity como o número de tarefas concluídas na sprint.
- **FR-009**: Sprints e associações MUST persistir localmente junto ao quadro e sobreviver a recarregar, trocar de quadro e exportar/importar.
- **FR-010**: Em quadro somente leitura, as ações de criar/editar/excluir/ativar/concluir/atribuir MUST ficar indisponíveis.
- **FR-011**: Gerenciar sprints ou atribuir tarefas MUST NOT alterar a coluna, `startedAt`, `completedAt`, `blocked*` nem as regras de movimentação de cartões bloqueados.
- **FR-012**: Nome vazio ou só com espaços MUST NOT criar/editar sprint; fim anterior ao início MUST ser rejeitado.
- **FR-013**: A conclusão de uma sprint MUST NOT alterar as métricas de fluxo (Lead Time, Cycle Time, CFD, WIP).

### Non-Functional Requirements

- **NFR-001 [Local-First]**: Sprints permanecem no `localStorage` do quadro; sem servidor ou conta.
- **NFR-002 [Acessibilidade]**: Controles de sprint com rótulos acessíveis e operação por teclado (WCAG 2.1 AA).
- **NFR-003 [Simplicidade]**: Sem novas dependências externas.
- **NFR-004 [Paridade]**: As novas superfícies seguem a tolerância de renderização do produto (feature 026).
- **NFR-005 [Independência de Marca]**: Terminologia neutra e canônica (*Sprint*, *Velocity*), sem marcas de terceiros.

### Key Entities

- **Sprint**: iteração do quadro — `id`, `name`, `goal?`, `status` (`planned`/`active`/`completed`), `startDate?`, `endDate?`, `createdAt`, `completedAt?`.
- **Quadro (Board)**: passa a conter `sprints` e `activeSprintId`.
- **Tarefa (Task)**: passa a ter `sprintId?` (referência opcional a uma Sprint).

## Success Criteria *(mandatory)*

- **SC-001**: O usuário cria uma sprint em, no máximo, 2 interações a partir do quadro.
- **SC-002**: 100% das sprints e atribuições persistem após recarregar e após exportar→importar.
- **SC-003**: O progresso da sprint ativa reflete o estado real em 100% das verificações após atribuir/concluir/remover.
- **SC-004**: Zero escritas oferecidas em quadro somente leitura.
- **SC-005**: Nenhuma regressão nas suítes automatizadas existentes.

## Assumptions

- Sprints são **por quadro** (não globais à squad) e armazenadas no estado do quadro.
- Não há burndown chart nesta versão (escopo futuro); o MVP entrega progresso e velocity.
- Uma tarefa pertence a **zero ou uma** sprint.
- Concluir uma sprint não reorganiza o quadro.

## Fora de Escopo

- Gráfico de burndown/burnup e snapshots diários.
- Capacidade/estimativa em pontos e velocity em pontos (apenas contagem de tarefas).
- Múltiplas sprints simultâneas ativas.
- Sincronização de sprints com calendário externo.
