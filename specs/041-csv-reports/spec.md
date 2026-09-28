# Feature Specification: Relatórios Exportáveis (CSV)

**Feature Branch**: `041-csv-reports`
**Created**: 2026-09-28
**Status**: Draft
**Input**: Exportar tarefas e sprints do quadro em CSV, complementando o backup JSON (feature 006).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exportar tarefas em CSV (Priority: P1) 🎯 MVP

Como líder de squad, quero exportar as tarefas do quadro em CSV para analisar em planilha.

**Independent Test**: Com tarefas no quadro, exportar o CSV e abrir em planilha: colunas de id, título, coluna, prioridade, responsável, estimativa, sprint, tags e datas, com acentuação preservada.

**Acceptance Scenarios**:

1. **Given** um quadro com tarefas, **When** o usuário exporta tarefas em CSV, **Then** o arquivo contém uma linha por tarefa com cabeçalho.
2. **Given** títulos/tags com vírgula, aspas ou quebra de linha, **When** o CSV é gerado, **Then** os valores são escapados corretamente.
3. **Given** um quadro vazio, **When** exporta, **Then** o CSV contém apenas o cabeçalho.

---

### User Story 2 - Exportar sprints em CSV (Priority: P2)

Como líder de squad, quero exportar o resumo das sprints (status, datas, tarefas, pontos) em CSV.

**Acceptance Scenarios**:

1. **Given** sprints com tarefas, **When** exporta, **Then** cada sprint tem uma linha com tarefas/concluídas e pontos comprometidos/concluídos.

### Edge Cases

- Sem sprints → CSV apenas com cabeçalho.
- Tarefa sem sprint/responsável/estimativa → célula vazia.
- Valores com `;` → preservados dentro de aspas (o campo é delimitado por `,`).

## Requirements *(mandatory)*

- **FR-001**: O sistema MUST gerar CSV com cabeçalho e uma linha por tarefa, com as colunas documentadas.
- **FR-002**: Valores MUST ser escapados (aspas duplicadas; campos com `,`/`"`/quebra de linha entre aspas).
- **FR-003**: O sistema MUST gerar CSV de sprints com contagens e pontos derivados.
- **FR-004**: A exportação MUST ocorrer 100% no cliente (Local-First), sem rede.
- **FR-005**: CSV de tarefas vazio/sem sprints MUST conter apenas o cabeçalho (sem erro).
- **FR-006**: Nenhuma dependência externa nova.

### Key Entities

- **CSV**: `escapeCsvValue`, `toCsv(headers, rows)`, `buildTasksCsv(board)`, `buildSprintsCsv(sprints, tasks)`.

## Success Criteria

- **SC-001**: CSV de tarefas abre em planilha com colunas corretas e acentuação preservada.
- **SC-002**: Exportação não lança erro com quadro vazio ou valores especiais.
- **SC-003**: Zero regressões nas suítes existentes.

## Fora de Escopo

- Geração de PDF.
- Exportação de analytics/gráficos.
- Agendamento de relatórios.
