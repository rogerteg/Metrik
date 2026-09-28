# Change Proposal (Modo 2 — Brownfield): Fechamento do Delta da 027

**Change ID**: `027-delta-subtask-comments`
**Feature base**: `027-card-subtasks-and-comments`
**Data**: 2026-09-28
**Status**: Proposed — aguardando aprovação antes de `/speckit-tasks` e implementação
**Tipo**: Alteração em módulo brownfield (delta de requisitos sobre spec existente)

**Fonte da verdade (precedência)**:
`constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` (027) > `plan.md` (027) > este `proposal.md` > `tasks.md` (027) > código.

**Spec base**: [spec.md](spec.md) · **Plano base**: [plan.md](plan.md) · **Data model**: [data-model.md](data-model.md) · **Contrato**: [contracts/subtask-comment.contract.md](contracts/subtask-comment.contract.md) · **Reconciliação**: [tasks.md](tasks.md) §Reconciliação (2026-09-28).

---

## 1. Por que (motivação)

A feature 027 foi **parcialmente entregue por features posteriores** (035–037) fora da arquitetura especificada. A auditoria de 2026-09-28 (`tasks.md`) apurou **5/18 tarefas concluídas** e os seguintes requisitos da spec **não atendidos**:

| Requisito base | Lacuna observada | Evidência |
|---|---|---|
| FR-006, FR-009 (US2) — comentário no cartão pai, edição | Não há composer de comentário **no cartão** nem **edição** de comentário | `Task.tsx` sem `comments`; `useTaskCollection` só tem `addTaskComment`/`deleteTaskComment` |
| FR-007 (US3) — comentário na subtarefa | **Ausente** | Nenhuma referência a comentário de subtarefa em `src/` |
| FR-013 — cascata com confirmação | Remoção de subtarefa sem diálogo | `Task.tsx::handleDeleteSubtask` |
| FR-015 — contagem de comentários no cartão | Sem badge de contagem | `Task.tsx` |
| FR-019, FR-020 — contenção de rolagem | Sem `max-height`/`overflow-y` dedicados | `App.css` sem `max-height: 240px` |
| FR-008/010/016 — autoria, edição e permissões | Sem matriz de permissão para editar/excluir comentário | contrato §3 não implementado |

Além disso, os artefatos base descrevem um modelo de domínio (`CommentModel`, módulo puro `cardChildren.ts`) **que nunca existiu no código**, enquanto o código usa `TaskComment` inline. Esta proposta resolve as duas frentes: **fecha os requisitos ausentes** e **reconcilia o modelo de dados**.

---

## 2. Escopo

### 2.1 Dentro do escopo
- Composer + lista de comentários **no cartão pai** (`Task.tsx`), com badge de contagem derivado.
- **Edição** de comentário (mantendo `createdAt`, atualizando `updatedAt`).
- Comentários **na subtarefa** (cartão filho), com isolamento estrito pai × filho.
- Diálogo de **confirmação** ao remover subtarefa que possui comentários (cascata avisada).
- **Contenção de rolagem** (`max-height` + `overflow-y: auto`) nas listas de subtarefas/comentários.
- Matriz de **permissões** (autor edita; autor/admin exclui; guest somente leitura) aplicada na UI e no domínio.
- Testes automatizados (domínio + componente) e atualização dos checklists.

### 2.2 Fora do escopo (YAGNI)
- Renomear título de subtarefa existente (já podado na spec, `CHK020`).
- Markdown rico, anexos, menções, notificações.
- Histórico de edições de comentário (auditoria fina).
- Reescrita da arquitetura para `cardChildren.ts` (ver Decisão D-1).
- Alteração de fluxo métrico do cartão (coluna/timestamps) — invariante CI-02.

---

## 3. Delta de Requisitos

> Convenção: `[ADDED]` novo · `[MODIFIED]` muda comportamento/redação · `[REMOVED]` sai do escopo.

- **`[MODIFIED]` FR-006** — "O cartão oferece campo de comentário próprio" passa a exigir **composer e lista no cartão** (não apenas no modal), com **badge de contagem** derivado (absorve FR-015).
- **`[ADDED]` FR-006a** — Comentário do cartão pode ser **editado** pelo autor; edição preserva `createdAt` e atualiza `updatedAt`.
- **`[ADDED]` FR-007a** — Comentário da subtarefa é **estruturalmente isolado**: nunca é listado no cartão pai, e vice-versa (invariante 2).
- **`[MODIFIED]` FR-013** — Remover subtarefa com comentários exige **confirmação explícita** que avisa da exclusão em cascata; sem comentários, remoção direta é permitida.
- **`[MODIFIED]` FR-020** — Conteúdo passa a exigir **contenção explícita**: `max-height` de 240 px e `overflow-y: auto` nas listas.
- **`[MODIFIED]` FR-016 / contrato §3** — Matriz de permissão ratificada nesta proposta (autor edita/exclui o próprio; admin exclui qualquer; member não-autor não edita nem exclui; guest nenhuma escrita).
- **`[REMOVED]` FR-012 parcial** — Obrigação de um `CommentModel` separado é retirada; o modelo canônico passa a ser `TaskComment` (Decisão D-2).

---

## 4. Decisões de Arquitetura

### D-1 — Não adotar `cardChildren.ts` (módulo puro dedicado)
- **Decisão**: **poda** do módulo puro. As operações de subtarefa/comentário continuam **inline** em `Task.tsx` / `TaskDetailsModal.tsx`, delegando a persistência a `useTaskCollection`.
- **Justificativa**: o código real já opera inline há várias features (035–037) sem regressão; criar uma camada pura agora é refatoração ampla, contraria YAGNI (Constituição V) e aumenta risco sem requisito que a exija.
- **Mitigação da perda**: as regras não-triviais (normalização, autorização, cascata) serão extraídas para **helpers puros pequenos** em `src/utils/cardComments.ts`, com testes — sem reproduzir a abstração completa de `cardChildren.ts`.
- **Tarefas base afetadas**: T002, T003, T004 de `tasks.md` → **Won't do** (registrar no delta).

### D-2 — Modelo canônico de comentário: `TaskComment`
- **Decisão**: reutilizar `TaskComment` (`src/types/taskActivity.ts`), **não** criar `CommentModel`.
- **Delta de tipo**: adicionar `comments?: TaskComment[]` a `SubtaskModel` (`src/types/kanban.ts`); `TaskModel.comments` já existe.
- **Vínculo**: comentário de subtarefa é identificado pela **posição estrutural** (array da subtarefa). `taskId` continua sendo o **id do cartão pai** (não o da subtarefa), evitando novo campo discriminante.
- **Justificativa**: um único modelo evita conversões e mantém compatibilidade com `activityLog`/timeline e `syncService` que já usam `TaskComment`.

### D-3 — Permissões centralizadas em predicado puro
- **Decisão**: implementar `canEditComment`/`canDeleteComment` em `src/utils/cardComments.ts` e consumir no componente; guest curto-circuitado por `isReadOnly` (feature 023).
- **Justificativa**: ponto único de mudança para ratificação futura (contrato §3), testável sem UI.

---

## 5. Modelos de Raciocínio Analítico (Constituição VI)

1. **Primeiros princípios**: um comentário é uma anotação imutável em `createdAt`, com autor, pertencente a **exatamente uma** dona estrutural; progresso e contagem são **derivados**, nunca persistidos; adicionar contexto não toca estado de fluxo.
2. **Pré-mortem**: (a) comentário órfão ao remover subtarefa → cascata testada; (b) colisão de DnD ao digitar → isolar inputs (`stopPropagation`); (c) explosão de altura → contenção `max-height`; (d) guest escrevendo via Enter → `disabled`/guarda de permissão.
3. **MECE**: cada arquivo tem dona única — tipos (`kanban.ts`), helper puro (`cardComments.ts` + teste), cartão (`Task.tsx`), modal (`TaskDetailsModal.tsx`), hook (`useTaskCollection.ts`), CSS (`App.css`). Cobre FR-006/006a/007/007a/013/015/016/020 e CC-05..CC-14.
4. **Árvore de decisões**: podadas a arquitetura `cardChildren.ts` (D-1) e um `CommentModel` paralelo (D-2); escolhido o menor caminho que fecha os requisitos com o código existente.
5. **Falsificabilidade (TDD)**: testes de domínio (normalização, permissão, cascata, isolamento pai×filho) e de componente (composer/listar/editar/excluir; subtarefa com comentário) devem falhar antes de implementar.
6. **Triangulação constitucional**: Local-First (VIII), sem marca (VII), sem dependência nova (V/NFR-006), diagnóstico `[Metrik Guard]` (IV), testes obrigatórios (III).

---

## 6. Impacto

| Arquivo | Mudança |
|---|---|
| `src/types/kanban.ts` | `SubtaskModel.comments?: TaskComment[]` |
| `src/utils/cardComments.ts` | **Novo** — normalização, autorização, helpers de cascata |
| `tests/unit/cardComments.test.ts` | **Novo** — domínio puro |
| `src/hooks/useTaskCollection.ts` | `editTaskComment`, `addSubtaskComment`, `editSubtaskComment`, `deleteSubtaskComment`; `removeSubtask` com cascata |
| `src/components/Task.tsx` | Composer+lista do cartão, badge de contagem, confirmação de cascata, contenção |
| `src/components/TaskDetailsModal.tsx` | Paridade de comentários do cartão (edição) + subtarefa |
| `src/App.css` | `max-height: 240px; overflow-y: auto`; estilos de comentário/edição |
| `tests/unit/*` | `Task.test.tsx`, `TaskDetailsModal.test.tsx`, `useTaskCollection` (cascata/permissão) |
| `specs/027-.../checklists/*` | Atualizar itens abertos após implementação |

**Sem** migração de dados: campos opcionais; quadros existentes seguem válidos (invariante 10).

---

## 7. Plano de Verificação (falsificável)

- **Domínio**: rejeitar texto vazio (FR-011); ordenar por `createdAt`; `updatedAt` só após edição; isolamento pai×filho; cascata remove comentários da subtarefa.
- **Permissão**: guest nunca cria/edita/exclui; member não-autor não edita/exclui; autor edita/exclui o próprio; admin exclui qualquer.
- **Componente**: cartão cria/toggle/remove subtarefa; cartão cria/edita/exclui comentário e mostra contagem; subtarefa cria/edita/exclui comentário sem aparecer no pai; confirmação de cascata.
- **Integração**: exportar→importar preserva comentários/subtarefas (CI-06); criar/editar/remover não altera coluna nem `startedAt`/`completedAt`/`blocked*` (CI-01/CI-02).
- **Gate final**: `npm test` (sem regressão sobre 556) e `npm run build` limpos; nenhuma dependência nova.

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Refatoração de modal/cartão quebrar contratos de teste (`data-testid`, placeholders) | Preservar ganchos; ajustar testes de design explicitamente (lição 2026-09-25) |
| Reintroduzir framework CSS inexistente | CSS vanilla com tokens (anti-padrão conhecido) |
| Divergência `TaskComment` × spec | Este proposal ratifica `TaskComment` como canônico (D-2) |
| Escopo crescer para "rich text" | Fora de escopo explícito (§2.2) |

---

## 9. Critério de Aceite (DoD)

1. Todos os itens §2.1 entregues com teste automatizado correspondente.
2. `spec.md`/`data-model.md` reconciliados com `TaskComment` e com a matriz de permissão (remover `CommentModel` ou marcá-lo como histórico).
3. `tasks.md`: T002–T004 marcados **Won't do**; T001, T005, T009–T016 atualizados para o delta.
4. Suíte e build verdes; zero novas dependências.

---

*Proposto em 2026-09-28. Próximo passo: aprovação → `/speckit-tasks` (com os Modelos de Raciocínio Analítico) → implementação.*
