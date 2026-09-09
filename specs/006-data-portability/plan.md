# Technical Implementation Plan: Feature 006 (Data Portability)

## 1. Architectural Approach
The data portability feature will be built as a custom React Hook (`useDataPortability.ts`) to encapsulate the file I/O operations, keeping the UI components clean and adhering to single-responsibility principles. The UI controls will be integrated into the main `App.tsx` header.

## 2. Component Modifications

### 2.1 `src/hooks/useDataPortability.ts` (NEW)
Create a new hook responsible for handling the export and import logic.
- **Dependencies:** Needs access to the current `board` state and a mechanism to overwrite the `board` state (e.g., `overwriteBoard` function from `useTaskCollection`).
- **`exportData` Function:**
  1. Serializes the `board` state to a formatted JSON string.
  2. Creates a `Blob` with `type: 'application/json'`.
  3. Uses `URL.createObjectURL` to generate a download link.
  4. Programmatically creates an `<a>` element, sets the `download` attribute to `metrik-board-export.json`, and clicks it.
  5. Cleans up the URL object.
- **`importData` Function:**
  1. Accepts a `File` object.
  2. Uses `FileReader` to read the file contents as text.
  3. Parses the text to JSON within a `try/catch` block.
  4. Runs the parsed JSON through `isValidBoardState` (from `seedData.ts`).
  5. If valid, calls `overwriteBoard(parsedState)`.
  6. If invalid, alerts the user (or returns an error).

### 2.2 `src/hooks/useTaskCollection.ts` (MODIFY)
- Add a new function `overwriteBoard(newState: BoardState)` that allows completely replacing the current board state and saving it to `localStorage`.
- Export this new function in the hook's return object.

### 2.3 `src/App.tsx` (MODIFY)
- Add a hidden `<input type="file" accept=".json" />` element.
- Add two new buttons in the header actions area:
  - **Exportar**: Triggers the `exportData` function.
  - **Importar**: Triggers a programmatic click on the hidden file input, which then triggers the `importData` function on change.

## 3. Testing Strategy (`tests/unit/useDataPortability.test.ts`)
- Mock `URL.createObjectURL` and `URL.revokeObjectURL`.
- Mock `document.createElement('a')` to verify the download trigger.
- Mock `FileReader` to test successful parsing and validation.
- Test failure modes:
  - Corrupted JSON (SyntaxError).
  - Valid JSON but invalid schema (`isValidBoardState` returns false).
- Ensure that the error callbacks or alerts are triggered on failure, and `overwriteBoard` is NOT called.

## 4. Risks & Migrations
No breaking changes. This feature is purely additive. The `upgradeStorage` logic implemented in the `useTaskCollection` initialization phase will handle edge cases where imported JSON might be slightly outdated but parseable, though `isValidBoardState` is strict. To make it user-friendly, if the user imports V1 data (using the old enum approach), it will be rejected unless we implement an explicit V1-to-V2 migration inside the import flow. Given the scope, we will enforce strict V2 validation.
