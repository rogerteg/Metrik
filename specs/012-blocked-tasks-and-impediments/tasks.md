# Tasks: Feature 012 (Blocked Tasks & Impediments)

## Modelos de Raciocínio Analítico Pré-Criação de Tarefas (Constituição VI)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental:** Um bloqueio em Kanban é uma condição em que uma tarefa não pode avançar devido a um obstáculo externo. O tempo de bloqueio é um subconjunto disjunto ou concorrente do Lead Time total.
- **Invariante Matemática:** A duração de bloqueio de uma tarefa nunca pode ser negativa ($T_{\text{blocked}} \ge 0$). O tempo total acumulado em múltiplos ciclos de bloqueio/desbloqueio é a soma estrita de cada intervalo: $T_{\text{total}} = \sum (t_{\text{unblock}, i} - t_{\text{block}, i})$.
- **Persistência Semântica:** Não é necessário criar uma entidade separada de "Bloqueio" no banco/localStorage; quatro campos opcionais em `TaskModel` (`blocked`, `blockedReason`, `blockedAt`, `totalBlockedMs`) são suficientes e minimizam overhead.

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Vazamento de Tempo / Relógio Desincronizado):** Se uma tarefa for bloqueada e o relógio local do usuário sofrer alteração retrógrada, `agora - blockedAt` poderia gerar números negativos.
  - *Mitigação:* Usar `Math.max(0, agora - blockedAt)` para garantir monotonicidade estrita.
- **Modo de Falha 2 (Tarefa Concluída Enquanto Bloqueada):** Um usuário pode arrastar uma tarefa bloqueada diretamente para a coluna "Done" sem antes desmarcá-la.
  - *Mitigação:* Ao mover ou concluir uma tarefa, se estiver marcada como `blocked`, ela pode ser mantida com o histórico ou auto-desbloqueada acumulando o tempo final de bloqueio, impedindo que o cronômetro continue correndo após a conclusão.
- **Modo de Falha 3 (Sobrecarga Visual no Cartão):** O badge de bloqueio competir com prioridade, tags e prazos de entrega.
  - *Mitigação:* Posicionar o badge de bloqueio no topo do cartão com ícone claro `⛔` e borda de destaque suave na lateral esquerda do cartão (`border-left: 4px solid var(--accent-red)`), mantendo o card compacto e legível.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Exclusividade Mútua:**
  - `Phase 1`: Modelagem de dados e utilitários puros de tempo (`kanban.ts`, `timeFormatters.ts`).
  - `Phase 2`: Gerenciamento de estado e métodos no hook (`useTaskCollection.ts`).
  - `Phase 3`: Componentes de apresentação e estilos (`Task.tsx`, `TaskDetailsModal.tsx`, `App.css`).
  - `Phase 4`: Validação global e regressão.
- **Exaustividade Coletiva:** Cobre 100% dos requisitos de negócio (sinalização, motivo, cálculo de tempo decorrido, interface e testes).

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts & Trade-off Pruning)
- **Alternativa A (Criar uma coluna separada "Bloqueados"):** Descartada porque em Kanban um bloqueio é um *estado* que pode acontecer em qualquer etapa (ex.: bloqueado em Análise, bloqueado em Testes), e mover o cartão para uma coluna lateral perde a visibilidade do estágio real do fluxo.
- **Alternativa B (Histórico com array de eventos de bloqueio):** Descartada por YAGNI. Um contador acumulado `totalBlockedMs` com o timestamp atual `blockedAt` atende perfeitamente ao cálculo sem inflar o tamanho do JSON no `localStorage`.
- **Decisão Escolhida:** Atributo booleano `blocked` + `blockedReason` + `blockedAt` + acumulador `totalBlockedMs`.

### 5. Critério de Falsificabilidade & Testabilidade (TDD / Red-Bar First)
- Teste unitário de tempo:
  - `calculateTaskBlockedTimeMs` deve retornar `totalBlockedMs` quando desbloqueado.
  - `calculateTaskBlockedTimeMs` deve somar `now - blockedAt` quando bloqueado.
- Teste de transição:
  - `toggleTaskBlocked` alterna de falso para verdadeiro e vice-versa.
  - Bloquear e desbloquear após X ms incrementa `totalBlockedMs`.
- Teste de componente:
  - `Task.tsx` exibe badge e motivo no hover/title quando `blocked === true`.
  - `TaskDetailsModal.tsx` exibe botão de alternar bloqueio e input de motivo.

### 6. Triangulação Adversarial & Verificação Constitucional (Polygraph Verification)
- **Constituição I & V (SDD & Simplicidade):** Todas as mudanças são rastreadas nesta especificação com a menor implementação funcional possível.
- **Constituição III (Automated Verification):** 100% dos testes passando antes da aprovação da tarefa.

---

## Tasks

### Phase 1: Data Model & Calculation Utilities
- [x] T001 Update `TaskModel` in `src/types/kanban.ts` with `blocked?: boolean`, `blockedReason?: string`, `blockedAt?: string`, and `totalBlockedMs?: number`.
- [x] T002 Implement `calculateTaskBlockedTimeMs` and `formatBlockedTime` in `src/utils/timeFormatters.ts`.
- [x] T003 Write unit tests in `tests/unit/timeFormatters.test.ts` verifying blocked time calculation and formatting.

### Phase 2: State Transitions & Hook Methods
- [x] T004 Add `toggleTaskBlocked` and `updateBlockedReason` methods to `src/hooks/useTaskCollection.ts`.
- [x] T005 Write unit tests in `tests/unit/useTaskCollection.test.ts` verifying blocked state toggling, reason persistence, and cumulative elapsed duration.

### Phase 3: UI Implementation & Styling
- [x] T006 Update `src/components/Task.tsx` to render the `⛔ Bloqueado` badge and apply `.task-card-blocked` styling.
- [x] T007 Update `src/components/TaskDetailsModal.tsx` to add the Blocked toggle, impediment reason field, and elapsed blocked time display.
- [x] T008 Update `src/App.tsx` to connect `toggleTaskBlocked` and `updateBlockedReason` to `TaskDetailsModal`.
- [x] T009 Add CSS styles in `src/App.css` and `src/components/TaskDetailsModal.css` for blocked badges, inputs, and card highlights.

### Phase 4: Component Tests & Verification
- [x] T010 Update `tests/unit/Task.test.tsx` to assert rendering of the blocked badge and tooltip.
- [x] T011 Update `tests/unit/TaskDetailsModal.test.tsx` to verify toggling blocked status and editing the impediment reason.
- [x] T012 Run `npm run build` and `npm test` to ensure 100% pass rate with zero regressions.
