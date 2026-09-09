# Feature 009: Due Dates & Overdue Alerts

## 1. Context & Rationale
Kanban is generally flow-based, but real-world tasks often have hard external deadlines. Metrik currently has no way to track when a task is due. Introducing Due Dates will allow users to set a deadline via the Task Details Modal and see visual alerts on the board if a task is approaching its deadline or is already overdue.

## 2. Business Value
- **Prioritization:** Users can visually distinguish urgent tasks that are nearing their deadline.
- **Risk Management:** Overdue tasks are highlighted in red to ensure they are addressed immediately.

## 3. Scope & Requirements

### 3.1. In Scope
- **Data Model:** Add `dueDate?: string` (ISO format) to `TaskModel`.
- **Task Details Modal:** Add a native HTML5 date input (`<input type="date" />`) to set, change, or clear the due date.
- **Task Card (Board):** 
  - Display a badge showing the due date if it exists.
  - **Overdue Logic:** If `dueDate` < `today` AND task is NOT in a `done` column -> Red badge.
  - **Warning Logic:** If `dueDate` is within the next 48 hours AND task is NOT in a `done` column -> Amber/Yellow badge.
  - **Normal Logic:** Otherwise -> Neutral gray badge.
  - Format the date beautifully (e.g., "12 Out").
- **Testing:** Unit tests verifying the color logic of the due date badge.

### 3.2. Out of Scope
- Time tracking (hours/minutes for the due date). We will strictly use Dates (YYYY-MM-DD).
- Email or push notifications (Metrik is a local-only app).
- Filtering the board by due date (might be added later if requested).

## 4. User Stories
- **US1:** As a user, I want to assign a due date to a task in its details modal so I can track deadlines.
- **US2:** As a user, I want to see a red warning on tasks that have missed their deadline so I know to prioritize them.
- **US3:** As a user, I want to easily remove a due date if the deadline is no longer applicable.

## 5. Technical Constraints
- The date picker must use native `<input type="date">` to keep dependencies at 0.
- Date comparisons must safely ignore timezones or consistently use local time to prevent off-by-one errors when comparing "today" to the selected date.

## 6. Analytical Reasoning (Pre-Task Creation)

### 6.1. Date Math (First-Principles)
- HTML5 `<input type="date">` outputs a string in `YYYY-MM-DD` format.
- To compare with "today", we should construct `today` as `YYYY-MM-DD` string in local time, or parse both as local dates set to midnight.
- Overdue: `taskDueDate < today`
- Warning: `taskDueDate <= today + 2 days`

### 6.2. Premortem Analysis (Failure Modes)
- *Risk:* Timezone offsets shift the date when converting the `YYYY-MM-DD` string into a `Date` object, making a task appear overdue a day early.
  - *Mitigation:* Always parse the string as a local date (e.g., `new Date(dueDateStr + 'T00:00:00')`) or extract the YYYY-MM-DD from the local `new Date()` for string comparison.

### 6.3. MECE Task Validation
- Schema Update -> Modal Input -> Card Display Logic -> Unit Tests.
