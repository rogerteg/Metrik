# Quickstart & Runnable Verification Scenarios: ClickUp-Inspired Task Activity Redesign

**Feature**: 035-clickup-task-activity-redesign
**Date**: 2026-09-21

## Verification Scenarios

### Scenario 1: SVG Icon Dimension Verification (Fixing the Huge Clock Bug)
1. Launch dev server: `npm run dev`.
2. Open browser at `http://localhost:5173/`.
3. Open any task modal by clicking on a task card.
4. Inspect the "Histórico e Comentários da Tarefa" section at the bottom.
5. **Expected Outcome**: All icons (history clock, comments icon, move icons) measure exactly 16px × 16px. No icon explodes or distorts the modal layout.

### Scenario 2: Rich Markdown Comment & Decision Tagging
1. In the task timeline comment box, write:
   `**Decisão de Arquitetura**: Usaremos *React 18* com parser AST para `markdown_safe`.`
2. Check the "Marcar como Decisão de Projeto" checkbox.
3. Press `Ctrl+Enter` to submit.
4. **Expected Outcome**:
   - Comment submits instantly without page refresh.
   - Comment card displays golden decision badge ("Decisão de Projeto").
   - Markdown text renders formatted HTML nodes (`<strong>`, `<em>`, `<code>`).
   - Spotlight banner at top updates with the new decision.

### Scenario 3: Real-Time Filter & Search
1. Click the "Decisões" filter tab on the timeline filter bar.
2. **Expected Outcome**: Only decision comments are visible. Normal comments and system moves are hidden.
3. In the search input, type "Arquitetura".
4. **Expected Outcome**: The list filters in real time with <16ms latency.

### Scenario 4: Automated Testing & Build Validation
```bash
npm test -- --run
npm run build
```
**Expected Outcome**: All unit tests pass and production build succeeds with code 0.
