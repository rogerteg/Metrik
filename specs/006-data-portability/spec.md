# Feature 006: Data Portability (Export & Import)

## 1. Context & Rationale
Metrik operates exclusively on the client-side utilizing the browser's `localStorage` to persist the Kanban board state. While this ensures zero latency, offline capability, and strong privacy (no server dependencies), it traps the user's data within a specific browser profile. If the user clears their browser data, switches devices, or changes browsers, their entire Kanban board is lost.

To elevate Metrik to a production-grade utility, it must offer data portability. Users need a reliable mechanism to backup their data and migrate it seamlessly between environments.

## 2. Business Value
- **Data Security:** Users can create manual backups of their boards.
- **Portability:** Users can migrate their workflow between desktop and mobile, or between different browsers.
- **State Versioning:** By exporting JSON snapshots, users can keep a historical version of their projects.

## 3. Scope & Requirements

### 3.1. In Scope
- **JSON Export:** A feature to download the entire `BoardState` as a structured, human-readable `.json` file.
- **JSON Import:** A feature to upload a `.json` file, validate its schema, and seamlessly overwrite the existing `localStorage` state.
- **Defensive Validation:** Strict schema validation during import to prevent arbitrary or malformed JSON from corrupting the application state. The validation must reuse existing `isValidBoardState` logic and provide clear error feedback if validation fails.
- **UI Integration:** Minimal, accessible UI controls (buttons) integrated cleanly into the `App.tsx` header (e.g., adjacent to "Restaurar Demo" and "Limpar Quadro").
- **Unit Testing:** Comprehensive test coverage for export formatting, import parsing, and error handling for malformed data.

### 3.2. Out of Scope
- Automatic cloud sync.
- Partial imports (merging specific tasks or columns; import will be a full overwrite).
- Export to formats other than JSON (e.g., CSV, PDF).

## 4. User Stories
- **US1 (Export):** As a user, I want to click an "Exportar Dados" button so that my entire Kanban board is downloaded as a `.json` file to my local machine.
- **US2 (Import):** As a user, I want to click an "Importar Dados" button and select a `.json` file so that my board state is completely restored from the backup.
- **US3 (Validation):** As a user, if I try to import an invalid or corrupted file, I want to see an error message and have my current board state remain untouched so that I don't break the application.

## 5. Technical Constraints
- File manipulation MUST use native HTML5 File API (`FileReader` and `Blob`/`URL.createObjectURL`).
- No external libraries for validation; use TypeScript types and the existing `isValidBoardState` guard.
- Must maintain the 0-dependency native feel (avoid heavy modal libraries if a simple native `alert`/`input type="file"` suffices).

## 6. Analytical Reasoning (Pre-Task Creation)

### 6.1. First-Principles Thinking
- **Invariant:** The application must never render an invalid state.
- **Core Mechanism:** Export is simply serializing the current React state to a Blob. Import is deserializing a File to JSON and dispatching a state update.

### 6.2. Premortem Analysis (Failure Modes)
- *Risk:* User imports a JSON from an older version (e.g. before dynamic columns).
  - *Mitigation:* The existing `upgradeStorage` and `isValidBoardState` functions must be robust enough to reject or migrate old schemas. We must run the imported JSON through the same validation pipeline as reading from `localStorage`.
- *Risk:* Memory leaks from `URL.createObjectURL`.
  - *Mitigation:* The `href` created for the download anchor must be explicitly revoked (`URL.revokeObjectURL`) after the click event.

### 6.3. MECE Task Validation
- Task definition must exclusively cover: Hook logic for export, Hook logic for import/validation, UI button implementations, and Unit Tests.

### 6.4. Falsifiability & TDD
- Test cases must simulate file read errors, parse errors (invalid JSON), schema errors (missing columns/tasks), and successful data restoration.
