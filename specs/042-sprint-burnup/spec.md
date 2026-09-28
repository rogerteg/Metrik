# Feature Specification: Burnup da Sprint

**Feature Branch**: `042-sprint-burnup`
**Created**: 2026-09-28
**Status**: Draft
**Input**: Alternar a visualização da sprint entre burndown e burnup (escopo vs. concluído), derivado dos dados existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o burnup da sprint (Priority: P1) 🎯 MVP

Como líder de squad, quero ver o burnup (escopo acumulado vs. trabalho concluído) para avaliar o progresso contra o aumento de escopo.

**Independent Test**: Definir uma sprint com datas, atribuir tarefas (algumas concluídas) e alternar para burnup; conferir a linha de escopo e a de concluído.

**Acceptance Scenarios**:

1. **Given** uma sprint datada, **When** o modo burnup é selecionado, **Then** o gráfico mostra escopo (acumulado) e concluído (acumulado) por dia.
2. **Given** uma tarefa concluída dentro da janela, **When** o burnup é recalculado, **Then** o concluído sobe no dia de `completedAt`.
3. **Given** uma tarefa adicionada no meio da sprint, **When** o burnup é exibido, **Then** a linha de escopo sobe.
4. **Given** uma sprint sem datas, **When** o burnup é solicitado, **Then** o sistema informa indisponibilidade.

### Edge Cases

- Sprint sem tarefas → linhas zero.
- Estimativas presentes → burnup exibido em pontos; ausentes → em tarefas.
- Janela futura → linha visível limitada a hoje.

## Requirements *(mandatory)*

- **FR-001**: O sistema MUST derivar o burnup de `createdAt`/`completedAt` (sem novos dados persistidos).
- **FR-002**: Escopo do dia = tarefas criadas até o dia; concluído do dia = tarefas concluídas até o dia.
- **FR-003**: A UI MUST permitir alternar entre burndown e burnup.
- **FR-004**: Sem datas → aviso, sem gráfico inválido.
- **FR-005**: Sem dependências externas; acessível.

### Key Entities

- **SprintBurnup**: `{ available, committed, points: [{ day, scope, completed }] }` — derivado.

## Success Criteria

- **SC-001**: Burnup coerente com os dados em 100% das verificações.
- **SC-002**: Alternância burndown/burnup sem erro.
- **SC-003**: Zero regressões.

## Fora de Escopo

- CFD por sprint (exigiria histórico de transições por dia).
- Comparação entre sprints.
