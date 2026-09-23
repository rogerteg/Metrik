# Feature Specification: Task Details Activity & Objective Fields Redesign

**Feature Branch**: `037-task-details-activity-redesign`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Recrie, organize, a funcao detalhe da tarefa. Use como inspiração a tela em anexo. Crie logs e campos objetivos."

## Clarifications

### Session 2026-09-23

- Q: What is the exact maximum number of recent activity log items to display before collapsing older items under the `> Mostrar mais` toggle? → A: Option C - Show 5 most recent entries, collapse remaining older entries behind `> Mostrar mais`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Objective Activity Header & Interactive Controls (Priority: P1)

As a team member inspecting a task, I want a dedicated Activity panel header featuring a search action toggle, notification counter badge, and log filtering menu so that I can quickly navigate, filter, and track relevant updates on any task.

**Why this priority**: Fast access to activity search, notification indicators, and filters is essential for maintaining workflow visibility without cluttering the task detail modal.

**Independent Test**: Can be tested by opening the activity panel in task details and verifying that clicking the search icon reveals the activity search input, the notification icon displays an active unread badge counter, and the filter icon opens event filter options.

**Acceptance Scenarios**:

1. **Given** a task detail modal open on screen, **When** the user views the Activity header, **Then** the title "Activity" is displayed alongside search, notification bell with unread badge counter, and filter menu controls.
2. **Given** the activity header controls, **When** the user clicks the filter menu button, **Then** options to filter activity by event types (e.g., comments, field changes, creations, assignments) are presented.
3. **Given** the activity search toggle, **When** the user enters a search term, **Then** the activity log stream filters in real-time to match only relevant entries.

---

### User Story 2 - Bulleted Objective Activity Logs & Diff Stream (Priority: P1)

As a project manager or team collaborator, I want a bulleted activity feed showing who performed each action, the exact change description in clear Portuguese, and a right-aligned timestamp so that I have an objective audit trail of all task modifications.

**Why this priority**: Objective activity logging ensures transparency, accountability, and clarity regarding changes to task status, assignees, priorities, due dates, and task creation.

**Independent Test**: Can be tested by performing actions on a task (creating, removing an assignee, changing status) and verifying that bulleted log entries appear formatted as `[Actor] [Action/Field Diff]` with right-aligned timestamp strings like `jun 26 às 10:26 am`.

**Acceptance Scenarios**:

1. **Given** a newly created task, **When** viewing the activity stream, **Then** a bulleted log entry displays `[User Name] criou esta tarefa` with a right-aligned timestamp.
2. **Given** an existing task where an assignee was removed, **When** viewing the activity stream, **Then** a bulleted log entry displays `[User Name] removeu o responsável: [Previous Assignee Name]` with a right-aligned timestamp.
3. **Given** any task field update (status, priority, due date, tags, subtasks), **When** the mutation occurs, **Then** an objective bulleted log entry is immediately generated in the activity feed reflecting the exact field name and new value.

---

### User Story 3 - Collapsible Activity Log Grouping & Comment Input Card (Priority: P2)

As a user reviewing tasks with long activity histories, I want older log items grouped under a collapsible "> Mostrar mais" toggle and a clean bottom comment input card ("Escreva um comentário...") so that the interface remains uncluttered and easy to converse in.

**Why this priority**: Large tasks accumulate dozens of log entries over time. Grouping older entries prevents visual overload while preserving full audit history on demand.

**Independent Test**: Can be tested on a task with multiple activity entries by verifying that older entries beyond the 5 most recent are hidden under `> Mostrar mais` until clicked, and that typing a comment into the bottom input card adds a new comment to the feed.

**Acceptance Scenarios**:

1. **Given** a task with more than 5 activity entries, **When** the activity feed renders, **Then** the 5 most recent entries are displayed and older entries are collapsed behind a `> Mostrar mais` expandable trigger.
2. **Given** a collapsed activity section, **When** the user clicks `> Mostrar mais`, **Then** the list expands smoothly to reveal all hidden historical log entries.
3. **Given** the activity feed footer, **When** the user clicks into the comment card displaying placeholder `Escreva um comentário...`, **Then** the user can enter text and submit a new comment directly into the activity stream.

---

### User Story 4 - Organized Objective Task Detail Fields Layout (Priority: P2)

As a task executor, I want the task details modal organized into distinct, objective field sections (Status, Assignee, Priority, Tags, Due Date, Flow Metrics, Description, Subtasks, Activity) so that I can quickly read and edit task metadata without confusion.

**Why this priority**: Organizing metadata into objective, well-structured sections improves readability and reduces cognitive load when managing complex Kanban tasks.

**Independent Test**: Can be tested by opening any task detail view and verifying that primary fields are logically grouped at the top, followed by description and subtasks, and bounded by the activity & comments panel on the right/bottom.

**Acceptance Scenarios**:

1. **Given** the task details view, **When** rendered, **Then** objective fields (Status badge, Assignee selector, Priority level, Tags list, Due date picker, and Flow/Cycle Time metrics) are clearly displayed in dedicated layout containers.
2. **Given** any objective field, **When** modified by the user, **Then** the updated value persists instantly and triggers an objective event log entry in the activity stream.

---

### Edge Cases

- What happens when an activity log item contains an extremely long user name or field value? Text MUST truncate gracefully with ellipsis or wrap neatly without overflowing right-aligned timestamps.
- How does system handle offline or missing activity logs? Display a user-friendly empty state message indicating "Nenhuma atividade registrada ainda" with a retry button if network fails.
- What happens when a user submits a blank comment? The submit action MUST be disabled until valid text is entered into the comment card.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render an Activity panel header with a title ("Activity"), an activity search toggle, a notification bell icon with an unread count badge, and a filter options menu button.
- **FR-002**: System MUST display activity log events as a bulleted list (`disc` bullet layout) with actor name, Portuguese action description (e.g., "criou esta tarefa", "removeu o responsável: [Nome]", "alterou o status para [Status]"), and right-aligned timestamp.
- **FR-003**: System MUST format timestamps in activity logs into a concise, human-readable Portuguese date format (e.g., "jun 26 às 10:26 am").
- **FR-004**: System MUST provide a collapsible accordion button (`> Mostrar mais`) to group and expand/collapse historical activity log entries when the total entry count exceeds 5 items.
- **FR-005**: System MUST include a prominent comment input card at the bottom of the activity panel with placeholder text "Escreva um comentário..." for posting user comments.
- **FR-006**: System MUST record objective log events for task creation, assignee addition/removal, status changes, priority changes, due date modifications, tag edits, subtask status updates, and user comments.
- **FR-007**: System MUST organize task details into clear, objective metadata sections: Title & ID, Primary Attributes (Status, Assignee, Priority, Tags, Due Date, Flow/Cycle Time metrics), Description, Subtasks checklist, and the Activity & Comment panel.
- **FR-008**: System MUST allow real-time filtering of activity logs by text query and event category filter choices.

### Key Entities *(include if feature involves data)*

- **ActivityLogEntry**: Represents a single historical audit event for a task. Attributes include: ID, Task ID, Actor Name, Event Type (creation, field update, comment, assignee change), Detailed Action Description, Field Name, Previous Value, New Value, and Timestamp.
- **TaskDetailView**: Represents the organized view of a task's metadata, containing Task core attributes, objective status indicators, subtask lists, flow metrics, and associated ActivityLogEntry items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of task mutations (creation, field edits, assignee changes, comments) automatically generate a bulleted activity log entry with right-aligned timestamp.
- **SC-002**: Users can search or filter task activity logs and see matching results in under 200ms visual response time.
- **SC-003**: 95% of users can locate specific past task changes within 10 seconds using the bulleted log format and "> Mostrar mais" grouping.
- **SC-004**: Zero visual overlap between activity log text and right-aligned timestamps across all standard desktop and responsive screen sizes.

## Assumptions

- User names and field values in activity logs will be presented in Portuguese language matching existing system localization.
- Activity logs are stored locally in the local-first repository architecture and synchronized seamlessly.
- Existing task detail modal components can be refactored into the redesigned objective layout without breaking existing Kanban board state management.
