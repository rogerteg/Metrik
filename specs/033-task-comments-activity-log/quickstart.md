# Quickstart Validation Guide: Comentários e Trilha de Auditoria de Ações da Tarefa

**Feature Branch**: `033-task-comments-activity-log`  
**Spec**: [`spec.md`](spec.md)  
**Date**: 2026-09-21  

---

## Runnable Verification Scenarios

### Scenario 1: Automated Unit & Component Verification

Run automated test suite covering comments, activity log auto-generation, filtering, and local persistence:

```bash
# Run unit tests specifically for task comments and activity log
npm test -- tests/unit/TaskCommentsActivityLog.test.tsx

# Run full Vitest suite to ensure zero regressions
npm test -- --run

# Run TypeScript compilation and build check
npm run build
```

---

### Scenario 2: Manual End-to-End Visual Verification

1. Start development server:
   ```bash
   npm run dev
   ```
2. Open browser at `http://localhost:5173/`.
3. **Verify Task Comments**:
   - Click on any task card on the Kanban board to open the `TaskDetailsModal`.
   - Scroll to the "Histórico e Comentários" section.
   - Type a comment into the textarea (e.g., *"Atualização de alinhamento com a squad de design"*).
   - Click "Comentar" (or press `Ctrl+Enter`).
   - Verify the comment appears at the top of the timeline with author name ("Rogerio Teixeira"), exact date/time, and blue comment badge.
4. **Verify Automated Audit Log**:
   - Close the modal and drag the task card from "Em Progresso" to "Concluído".
   - Reopen the `TaskDetailsModal` for that task.
   - Verify that an activity log entry appears: *"Movido da coluna 'Em Progresso' para 'Concluído' por Rogerio Teixeira em DD/MM/AAAA às HH:mm"*.
5. **Verify Timeline Filtering**:
   - Toggle filter button "Apenas Comentários": verify task movement events disappear, showing only the human comment.
   - Toggle filter button "Apenas Auditoria": verify human comments disappear, showing only the automated column movement event.
   - Toggle filter button "Todos": verify both human comments and automated events appear in integrated chronological order.
6. **Verify Local-First Persistence**:
   - Reload the browser page (`F5`).
   - Open the task details modal again.
   - Confirm all comments and activity log events remain 100% intact.
