# Feature Specification: Estimativa em Pontos e Velocity por Pontos

**Feature Branch**: `040-story-points`
**Created**: 2026-09-28
**Status**: Draft
**Input**: Estimar tarefas em story points e acompanhar velocity/capacidade em pontos, estendendo o Planejamento de Sprints (038).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Estimar tarefas em pontos (Priority: P1) 🎯 MVP

Como membro da squad, quero atribuir uma estimativa em pontos a uma tarefa, diretamente no detalhe do cartão, para dimensionar o esforço de forma relativa.

**Independent Test**: Abrir uma tarefa, definir 5 pontos, recarregar a aplicação e confirmar que a estimativa persiste; limpar o campo e confirmar que a tarefa volta a "sem estimativa".

**Acceptance Scenarios**:

1. **Given** uma tarefa sem estimativa, **When** o usuário informa 5 pontos, **Then** a tarefa passa a exibir "5 pts" e persiste após recarregar.
2. **Given** uma tarefa com estimativa, **When** o usuário limpa o campo, **Then** ela deixa de contar nos totais de pontos.
3. **Given** um valor inválido (0, negativo, texto), **When** o usuário confirma, **Then** nada é gravado (estimativa permanece a anterior).
4. **Given** um quadro somente leitura, **When** um convidado tenta editar a estimativa, **Then** nenhuma escrita é oferecida.

---

### User Story 2 - Velocity e progresso em pontos na sprint (Priority: P1)

Como líder de squad, quero ver o progresso da sprint em pontos (concluídos/comprometidos) e a velocity em pontos, para medir capacidade real entregue.

**Independent Test**: Atribuir tarefas com estimativas (algumas concluídas) à sprint ativa e conferir que a barra mostra "concluídos/comprometidos pts" e a velocity em pontos.

**Acceptance Scenarios**:

1. **Given** uma sprint com 3+5 pontos, 3 concluídos, **When** a barra é exibida, **Then** mostra "3/8 pts" e "Velocity: 3 pts".
2. **Given** tarefas sem estimativa na sprint, **When** não há nenhum ponto, **Then** os totais de pontos não são exibidos (mantém-se a contagem por tarefa).
3. **Given** uma conclusão de tarefa, **When** o estado muda, **Then** os pontos concluídos são recalculados imediatamente.

### Edge Cases

- Sprint sem nenhuma estimativa → seção de pontos oculta.
- Estimativa em tarefa fora de sprint → não afeta a sprint.
- Estimativa fracionária → rejeitada (apenas inteiro positivo).
- Estimativa muito alta → aceita até um teto prático (ex.: 100).

## Requirements *(mandatory)*

- **FR-001**: O sistema MUST permitir definir, alterar e limpar a estimativa em pontos de uma tarefa.
- **FR-002**: A estimativa MUST ser um inteiro positivo (1..100); valores inválidos MUST NOT ser gravados.
- **FR-003**: O sistema MUST calcular pontos comprometidos (soma das estimativas das tarefas da sprint) e pontos concluídos (das tarefas concluídas).
- **FR-004**: A velocity em pontos MUST ser igual aos pontos concluídos de uma sprint.
- **FR-005**: A exibição de pontos MUST ser omitida quando a sprint não tiver nenhuma estimativa.
- **FR-006**: Em quadro somente leitura, a edição da estimativa MUST ficar indisponível.
- **FR-007**: Definir/limpar estimativa MUST NOT alterar coluna, timestamps de fluxo nem regras de bloqueio.
- **FR-008**: A estimativa MUST persistir junto ao quadro e sobreviver a export/import.

### Key Entities

- **TaskModel.estimation?**: número inteiro positivo (story points), opcional.
- **SprintPoints**: `{ committed: number; completed: number; percentage: number }` — derivado.

## Success Criteria *(mandatory)*

- **SC-001**: Estimar uma tarefa leva ≤ 2 interações a partir do detalhe.
- **SC-002**: 100% das estimativas persistem após recarregar e export→import.
- **SC-003**: Velocity/progresso em pontos refletem os dados em 100% das verificações.
- **SC-004**: Zero escritas em quadro somente leitura.
- **SC-005**: Nenhuma regressão nas suítes existentes.

## Fora de Escopo

- Planning poker / votação colaborativa.
- Capacidade planejada da squad por pessoa.
- Conversão automática entre pontos e tempo.
