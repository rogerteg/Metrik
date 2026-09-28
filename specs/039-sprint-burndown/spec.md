# Feature Specification: Burndown da Sprint

**Feature Branch**: `039-sprint-burndown`
**Created**: 2026-09-28
**Status**: Draft
**Input**: Visualizar o burndown da sprint (linha ideal vs. restante real) a partir dos dados já persistidos (`createdAt`/`completedAt`), sem snapshots.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o burndown da sprint (Priority: P1) 🎯 MVP

Como líder de squad, quero ver o burndown da sprint com datas definidas, para avaliar se a entrega está adiantada ou atrasada em relação ao ideal.

**Independent Test**: Definir uma sprint com início e fim, atribuir tarefas (algumas concluídas em dias diferentes) e conferir que o gráfico mostra a linha ideal decrescente e a linha de restante real derivada de `createdAt`/`completedAt`.

**Acceptance Scenarios**:

1. **Given** uma sprint com início e fim, **When** o burndown é exibido, **Then** a linha ideal vai do total comprometido em 0% do tempo até 0 em 100%, e a linha real reflete o restante por dia.
2. **Given** uma tarefa concluída dentro da janela, **When** o burndown é recalculado, **Then** o restante cai no dia de `completedAt`.
3. **Given** uma sprint sem datas, **When** o burndown é solicitado, **Then** o sistema informa que faltam datas (sem gráfico quebrado).
4. **Given** uma sprint sem tarefas, **When** o burndown é exibido, **Then** as linhas são zero sem erro de divisão.

### Edge Cases

- Sprint de um único dia → dois pontos (início/fim).
- Tarefas adicionadas no meio da sprint → o restante pode subir (scope creep) e isso é refletido, não mascarado.
- Datas invertidas já são rejeitadas na 038.
- Fora da janela (antes do início / depois do fim) → clamp ao intervalo da janela.

## Requirements *(mandatory)*

- **FR-001**: O sistema MUST calcular o burndown a partir de `createdAt` e `completedAt` das tarefas da sprint, sem novos campos persistidos.
- **FR-002**: A linha ideal MUST ser linear do total comprometido (escopo atual da sprint) até 0 ao fim da janela.
- **FR-003**: A linha real MUST representar, por dia, `#criadas_até_o_dia − #concluídas_até_o_dia`.
- **FR-004**: Sem `startDate`/`endDate`, o sistema MUST informar indisponibilidade em vez de renderizar um gráfico inválido.
- **FR-005**: Sprint sem tarefas MUST resultar em linhas zero, sem divisão por zero.
- **FR-006**: O gráfico MUST ser acessível (rótulo textual com valores) e não depender de bibliotecas externas.
- **FR-007**: O burndown NÃO deve alterar estado de fluxo nem persistir dados.

### Key Entities

- **BurndownPoint**: `{ day: ISO date, ideal: number, remaining: number }` — derivado, não persistido.

## Success Criteria *(mandatory)*

- **SC-001**: Com uma sprint datada, o gráfico exibe ideal e real coerentes com os dados em 100% das verificações.
- **SC-002**: Sprint sem datas exibe aviso, não gráfico inválido.
- **SC-003**: Zero regressões nas suítes existentes.

## Fora de Escopo

- Snapshots históricos persistidos e comparação entre sprints.
- Burndown em pontos de história.
- Burnup, CFD por sprint.
