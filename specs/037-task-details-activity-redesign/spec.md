# Feature Specification: Task Details Activity & Objective Fields Redesign

**Feature Branch**: `037-task-details-activity-redesign`

**Created**: 2026-09-23

**Status**: Implemented — reconciled 2026-09-25

**Input**: User description: "Recrie, organize, a funcao detalhe da tarefa. Use como inspiração a tela em anexo. Crie logs e campos objetivos."

## Clarifications

### Session 2026-09-23

- Q: What is the exact maximum number of recent activity log items to display before collapsing older items under the `> Mostrar mais` toggle? → A: Option C - Show 5 most recent entries, collapse remaining older entries behind `> Mostrar mais`.

### Session 2026-09-25 (Reconciliação pós-implementação)

> Esta sessão alinha a especificação ao que foi efetivamente entregue (reconciliação de artefatos, tarefas T021/T022/T024). As decisões abaixo **substituem** as do rascunho inicial de 2026-09-23 onde houver conflito.

- Q: O detalhe foi entregue com abas, e não com o painel lateral de atividade previsto no plano. Qual passa a ser o requisito? → A: O detalhe organiza-se em **abas** — *Visão Geral*, *Atividade* e *Métricas*. O feed de atividade vive na aba *Atividade*; o painel lateral de atividade foi descontinuado.
- Q: O feed usa timeline unificada (cartões + pílulas de diff) em vez de lista com bullets `disc` e accordion de 5 itens. Qual passa a ser o requisito? → A: Feed cronológico **unificado** de comentários e auditoria, **agrupado por baldes temporais** (Hoje / Ontem / Esta Semana / Anteriores), com **busca**, **filtros** (Todos / Decisões / Comentários / Auditoria), **controle de densidade** (detalhado / compacto) e **spotlight da decisão mais recente**.
- Q: O responsável (assignee) entra no escopo como campo objetivo? → A: Sim. O campo **Responsável** é editável no detalhe e cada alteração gera um evento objetivo de auditoria (`assignment` / `unassignment`).
- Q: Métricas de fluxo devem aparecer no detalhe? → A: Sim, em uma seção/aba dedicada de transparência: Lead Time, Cycle Time, Tempo Bloqueado, Idade do Cartão e contadores de composição.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Activity Section with Search, Filters & Decision Spotlight (Priority: P1)

As a team member inspecting a task, I want the activity section to provide real-time search, category filters, a density control and a decision spotlight so that I can quickly navigate and track relevant updates without visual overload.

**Why this priority**: Fast access to activity search, filters and decisions is essential for workflow visibility without cluttering the task detail.

**Independent Test**: Can be tested by opening the task detail, switching to the "Atividade" tab, entering a search term and selecting a category filter, then verifying the feed filters in real time and the latest decision is highlighted.

**Acceptance Scenarios**:

1. **Given** a task detail open, **When** the user opens the "Atividade" tab, **Then** the unified history/comments feed is displayed with search, filters and density controls.
2. **Given** the activity filters, **When** the user selects "Decisões", **Then** only decision comments are shown.
3. **Given** the activity search, **When** the user enters a search term, **Then** the feed filters in real-time to matching entries.
4. **Given** at least one decision comment, **When** the feed renders, **Then** a decision spotlight highlights the most recent decision.

---

### User Story 2 - Objective Activity Log with Diffs & Timestamps (Priority: P1)

As a project manager or team collaborator, I want a chronological activity feed showing who performed each action, an objective Portuguese description, a from→to diff when applicable, and a timestamp, so that I have an objective audit trail of all task modifications.

**Why this priority**: Objective activity logging ensures transparency and accountability regarding status, assignee, priority, due date, tags, subtasks and comments.

**Independent Test**: Can be tested by performing mutations (assigning a responsible, changing priority, moving columns) and verifying entries appear with actor, Portuguese description, diff and timestamp.

**Acceptance Scenarios**:

1. **Given** a newly created task, **When** viewing the activity feed, **Then** an entry displays `[User Name] criou esta tarefa` with a timestamp.
2. **Given** an existing task whose responsible changed, **When** viewing the activity feed, **Then** an entry displays the responsible added/removed with the previous/new value.
3. **Given** any task field update (status, priority, due date, tags, subtasks), **When** the mutation occurs, **Then** an objective entry is generated reflecting the exact field diff.

---

### User Story 3 - Time-Bucketed Feed & Comment Composer (Priority: P2)

As a user reviewing tasks with long histories, I want entries grouped into time buckets and a clear comment composer, so that the interface stays uncluttered and easy to converse in.

**Why this priority**: Large tasks accumulate dozens of entries over time; time-bucketing prevents visual overload while preserving full audit history on demand.

**Independent Test**: Can be tested on a task with multiple entries by verifying grouping into Hoje / Ontem / Esta Semana / Anteriores, toggling density, and submitting a comment that is added to the feed.

**Acceptance Scenarios**:

1. **Given** a task with a long history, **When** the activity feed renders, **Then** entries are grouped by time bucket.
2. **Given** the density control, **When** toggled, **Then** the feed switches between detailed and compact presentation.
3. **Given** the comment composer displaying placeholder `Escreva um comentário...`, **When** the user submits non-empty text, **Then** a new comment is added to the feed.

---

### User Story 4 - Organized Objective Task Detail Layout (Priority: P2)

As a task executor, I want the task detail organized into objective tabs and sections (Status, Assignee, Priority, Tags, Due Date, Flow Metrics, Description, Subtasks, Activity) so that I can quickly read and edit task metadata without confusion.

**Why this priority**: Organizing metadata into objective, well-structured sections improves readability and reduces cognitive load when managing complex Kanban tasks.

**Independent Test**: Can be tested by opening any task detail and verifying the tabs "Visão Geral", "Atividade" and "Métricas", the objective fields in the sidebar, and the description/subtasks/links in "Visão Geral".

**Acceptance Scenarios**:

1. **Given** the task detail view, **When** rendered, **Then** it displays a context header (board/column status badge, short task ID, task type) and the section tabs.
2. **Given** the metadata sidebar, **When** rendered, **Then** it exposes the Assignee selector, Priority, Task Type, Dates and Impediment (Status is shown in the context header).
3. **Given** the "Métricas" tab, **When** opened, **Then** it shows Lead Time, Cycle Time, Blocked Time, card age and composition counters.
4. **Given** any objective field, **When** modified by the user, **Then** the updated value persists instantly and triggers an objective event log entry in the activity feed.

---

### Edge Cases

- What happens when an activity log item contains an extremely long user name or field value? Text MUST truncate gracefully with ellipsis or wrap neatly without overflowing right-aligned timestamps.
- How does the system handle a task with no activity yet? Display a user-friendly empty state indicating that there are no records for the selected filters.
- What happens when a user submits a blank comment? The submit action MUST be disabled until valid text is entered.
- What happens when there are no registered users to assign? The Assignee field MUST degrade gracefully to free-text input without errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an Activity section within the task detail containing a unified history/comments feed, a real-time search field, category filters (Todos / Decisões / Comentários / Auditoria), a density control and a decision spotlight for the most recent decision.
- **FR-002**: System MUST display activity entries as a chronological unified feed with the actor name, an objective Portuguese action description, a from→to diff when applicable, and a timestamp.
- **FR-003**: System MUST format activity timestamps into a concise, human-readable Portuguese date-time format.
- **FR-004**: System MUST group activity entries into time buckets (Hoje / Ontem / Esta Semana / Anteriores) and allow the user to switch between detailed and compact density.
- **FR-005**: System MUST include a comment composer with placeholder text "Escreva um comentário...", Markdown support and a Ctrl+Enter shortcut for posting comments.
- **FR-006**: System MUST record objective log events for task creation, assignee assignment/removal, status changes, priority changes, due date modifications, tag edits, subtask status updates and user comments.
- **FR-007**: System MUST organize the task detail into clear, objective sections exposed through tabs — *Visão Geral* (Description, Acceptance Criteria, Test Scenarios, Checklist, Links), *Atividade* (activity feed and comments) and *Métricas* — with a context header exposing the Status (current column) and a metadata sidebar exposing Assignee, Priority, Task Type, Dates and Impediment.
- **FR-008**: System MUST allow real-time filtering of activity entries by text query and category filter choices.
- **FR-009**: System MUST present flow-transparency metrics in the *Métricas* section: Lead Time, Cycle Time, Blocked Time, card age, key lifecycle dates, checklist/initiative progress and composition counters (comments, decisions, events, links, blockers).
- **FR-010**: System MUST NOT require third-party brand names in any visible UI text, DOM attribute or source-code comment (project brand-independence rule).

### Key Entities *(include if feature involves data)*

- **ActivityLogEntry**: Represents a single historical audit event for a task. Attributes include: ID, Task ID, Actor Name, Event Type (creation, assignment, unassignment, status/priority/date/tag/subtask change, comment), Detailed Action Description, Field Name, Previous Value, New Value, and Timestamp.
- **TaskDetailView**: Represents the organized view of a task's metadata, containing task core attributes, objective status indicators, subtask lists, flow metrics, and associated ActivityLogEntry items.
- **Assignee**: The user responsible for a task, stored on the task as a display name (`assignee`); changes produce `assignment`/`unassignment` audit entries.
- **FlowMetrics**: Derived transparency values for a task — Lead Time, Cycle Time, Blocked Time, card age and composition counters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of task mutations (creation, assignment, field edits, comments) automatically generate an objective log entry with a timestamp.
- **SC-002**: Users can search or filter task activity and see matching results in under 200ms visual response time.
- **SC-003**: 95% of users can locate specific past task changes within 10 seconds using grouped search and filters.
- **SC-004**: Zero visual overlap between activity log text and right-aligned timestamps across all standard desktop and responsive screen sizes.

## Assumptions

- User names and field values in activity logs are presented in Portuguese, matching the existing system localization.
- Activity logs and assignment data are stored locally in the local-first architecture and synchronized optionally.
- The task detail modal was refactored into tabs without breaking existing Kanban board state management.
- A user picker is available when users are registered; otherwise the Assignee field degrades to free text.
