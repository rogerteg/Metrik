# Data Model & State Invariants: Trava Estrita de Movimentação para Cartões Bloqueados (025-blocked-task-movement-lock)

**Date**: 2026-09-14  
**Feature**: `025-blocked-task-movement-lock`  
**Status**: Completed  
**Spec**: [specs/025-blocked-task-movement-lock/spec.md](spec.md)

---

## 1. Entidades & Estruturas de Dados

### 1.1 Modelo da Tarefa (`TaskModel`)
A interface `TaskModel` em `src/types/kanban.ts` já possui as propriedades de bloqueio, que passam a ter semântica estrita de imutabilidade de coluna:

```typescript
export interface TaskModel {
  id: string;
  title: string;
  column: string;
  description?: string;
  priority?: PriorityLevel;
  tags?: string[];
  type?: TaskType;
  links?: TaskLinkModel[];
  
  // Campos de Governança de Bloqueio
  blocked?: boolean;              // Indicador estrito de bloqueio ativo
  blockedReason?: string;        // Justificativa textual do impedimento
  blockedAt?: string;            // Timestamp ISO de quando o bloqueio foi iniciado
  totalBlockedMs?: number;       // Tempo acumulado em bloqueio (milissegundos)
  
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
}
```

---

## 2. Constantes e Palavras-Chave de Bloqueio

```typescript
/** Palavras-chave que identificam tags de bloqueio */
export const BLOCKED_TAG_KEYWORDS: readonly string[] = [
  'bloqueado',
  'bloqueada',
  'blocked',
  'impedimento',
] as const;

/** Mensagem de aviso padrão para bloqueio de movimentação */
export const BLOCKED_TASK_MOVE_WARNING_MESSAGE =
  'Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas.';
```

---

## 3. Predicado de Domínio Canônico (`isTaskBlocked`)

```typescript
/**
 * Determina deterministicamente se uma tarefa está bloqueada,
 * checando tanto a propriedade booleana `blocked` quanto a presença
 * de etiquetas/tags semânticas de bloqueio.
 */
export function isTaskBlocked(task: TaskModel | undefined | null): boolean {
  if (!task) return false;
  
  if (task.blocked === true) {
    return true;
  }

  if (Array.isArray(task.tags) && task.tags.length > 0) {
    return task.tags.some((tag) => {
      const clean = tag.trim().toLowerCase();
      return BLOCKED_TAG_KEYWORDS.some((kw) => clean === kw || clean.startsWith(kw));
    });
  }

  return false;
}
```

---

## 4. Máquina de Estados e Transições

```
        ┌─────────────────────────────────────────────────────────────┐
        │                                                             │
        ▼                                                             │
┌──────────────┐         Ação do Usuário: Bloquear                   ┌──────────────┐
│              ├────────────────────────────────────────────────────►│              │
│  DESBLOQUEADO│  - Clicar em "Bloquear Tarefa"                      │  BLOQUEADO   │
│ (UNBLOCKED)  │  - Inserir tag "bloqueado"                          │  (BLOCKED)   │
│              │  - Seta: blocked = true, blockedAt = now            │              │
│              │                                                     │              │
│  [Móvel]     │         Ação do Usuário: Retirar Etiqueta           │  [Travado]   │
│              │◄────────────────────────────────────────────────────┤              │
└──────────────┘  - Clicar no badge "⛔ Bloqueado" no cartão         └──────────────┘
                  - Clicar em "Desbloquear Tarefa" no modal           ▲
                  - Excluir a tag "bloqueado"                         │
                  - Reconcilia: totalBlockedMs += (now - blockedAt)   │
                  - Seta: blocked = false, blockedAt = undefined      │
                                                                      │
                  Tentativa de Mover de Coluna (Drag ou Botão)        │
                  ────────────────────────────────────────────        │
                  Intercepta & Rejeita (Mantém na mesma coluna) ──────┘
```

---

## 5. Invariantes de Estado Inegociáveis

1. **Invariante 1 (Imutabilidade de Coluna Sob Bloqueio)**:
   $$\forall t \in \text{Tasks}, \text{ se } \text{isTaskBlocked}(t) = \text{true} \implies \text{TargetColumn}(t) = \text{CurrentColumn}(t)$$
   Nenhuma operação pode alterar a coluna de uma tarefa bloqueada. Qualquer tentativa é rejeitada síncrona e deterministicamente.

2. **Invariante 2 (Preservação da Reordenação Intra-Coluna)**:
   $$\forall t \in \text{Tasks}, \text{ se } \text{isTaskBlocked}(t) = \text{true} \land \text{TargetColumn} = \text{CurrentColumn} \implies \text{Reordenação Vertical Permitida}$$
   O usuário pode ajustar a ordem visual do cartão bloqueado dentro da sua própria coluna.

3. **Invariante 3 (Reconciliação Temporal Exata)**:
   Ao transitar de `BLOCKED` para `UNBLOCKED`:
   $$\text{totalBlockedMs}_{\text{novo}} = (\text{totalBlockedMs}_{\text{anterior}} \lor 0) + (\text{now} - \text{blockedAt})$$
   $$\text{blockedAt} = \text{undefined}$$

4. **Invariante 4 (Sincronização Bidirecional de Tags)**:
   - Adicionar uma tag presente em `BLOCKED_TAG_KEYWORDS` ativa automaticamente `task.blocked = true`.
   - Clicar em "Desbloquear" remove simultaneamente qualquer tag correspondente a `BLOCKED_TAG_KEYWORDS` da lista de tags da tarefa.

5. **Invariante 5 (Persistência Local-First Idempotente)**:
   Todas as mudanças de estado de bloqueio/desbloqueio persistem imediatamente no `localStorage` sob a chave `metrik-tasks-${activeBoardId}`.
