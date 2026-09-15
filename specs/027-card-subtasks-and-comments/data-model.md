# Data Model & State Invariants: Subtarefas e Comentários nos Cartões (027)

**Date**: 2026-09-14
**Feature**: `027-card-subtasks-and-comments`
**Status**: Completed
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Contract**: [contracts/subtask-comment.contract.md](contracts/subtask-comment.contract.md)

---

## 1. Entidades

### 1.1 Comentário (nova)

```typescript
/** Comentário publicado em um cartão ou em uma subtarefa (Feature 027). */
export interface CommentModel {
  /** Identificador único do comentário. */
  id: string;

  /** Texto do comentário, já normalizado (sem espaços nas extremidades). */
  body: string;

  /** Identificador do autor (perfil ativo no momento do registro). */
  authorId: string;

  /** Nome do autor no momento do registro, para exibição estável. */
  authorName: string;

  /** Timestamp ISO 8601 de criação. */
  createdAt: string;

  /** Timestamp ISO 8601 da última edição, quando houver. */
  updatedAt?: string;
}
```

**Nota de autoria**: `authorName` é copiado no momento da criação para que a exibição não dependa de o perfil continuar existindo na sessão (item `CHK027` do checklist) — o comentário preserva quem o escreveu.

### 1.2 Subtarefa (estendida)

```typescript
/** Subtarefa (cartão filho) vinculada a um cartão (Features 007 e 027). */
export interface SubtaskModel {
  id: string;
  title: string;
  completed: boolean;

  /** Comentários próprios da subtarefa (Feature 027). */
  comments?: CommentModel[];
}
```

### 1.3 Cartão (estendido)

`TaskModel` passa a ter:

```typescript
/** Comentários do cartão pai (Feature 027). */
comments?: CommentModel[];
```

O campo `subtasks` permanece como já existe. Ambos os campos são **opcionais**: quadros existentes continuam válidos, sem migração.

### 1.4 Relações

```text
Quadro (Board)
└── Cartão (TaskModel)                  ← dona de comentários e subtarefas
    ├── comments: CommentModel[]         (comentários do cartão pai)
    └── subtasks: SubtaskModel[]         (cartões filhos)
        └── comments: CommentModel[]     (comentários do filho)
```

Cada comentário tem **exatamente uma** dona: ou um cartão, ou uma subtarefa. O vínculo é estrutural (posição na árvore), não um campo discriminante.

---

## 2. Invariantes

1. **Dona única**: nenhum comentário existe fora de um cartão ou de uma subtarefa.

   $$\forall c \in \text{Comentários},\ \exists!\, d \in \{\text{Cartões} \cup \text{Subtarefas}\}: c \in d.comments$$

2. **Fronteira entre pai e filho**: comentários do cartão nunca aparecem como comentários de uma subtarefa, e vice-versa (FR-007, US3/AC2).

   $$c \in \text{Cartão}.comments \Rightarrow c \notin \bigcup \text{Subtarefa}.comments$$

3. **Cascata de exclusão**: remover a subtarefa remove os comentários dela; remover o cartão remove subtarefas e comentários (FR-013, FR-014).

4. **Autoria íntegra**: todo comentário tem autor identificado e momento de criação; a exibição não depende de o autor estar na sessão ativa (FR-008).

5. **Conteúdo não vazio**: título de subtarefa e texto de comentário são normalizados e rejeitados quando vazios ou só com espaços (FR-011).

   $$\text{normalize}(t) = \varepsilon \Rightarrow \text{rejeitado}$$

6. **Progresso coerente**: a contagem de concluídas nunca excede o total, e o indicador do cartão é sempre derivado do estado das subtarefas, nunca armazenado à parte (FR-003).

7. **Contagem de comentários derivada**: a contagem exibida no cartão é calculada dos comentários do cartão, não persistida (FR-015).

8. **Nenhum efeito de fluxo**: criar, editar ou remover subtarefa/comentário não altera `startedAt`, `completedAt`, `blocked`, `blockedAt`, `totalBlockedMs` nem a coluna do cartão (FR-017, FR-018).

9. **Somente leitura respeitado**: em quadro com permissão somente leitura, nenhuma operação de escrita é oferecida (FR-016).

10. **Compatibilidade retroativa**: quadros sem `comments` carregam normalmente, e a importação continua aceita pela validação de estrutura existente (FR-012).

---

## 3. Regras de Validação

| Regra | Origem |
|---|---|
| Normalizar (aparar extremidades) e rejeitar texto vazio | FR-011 |
| Autor obrigatório e copiado no momento do registro | FR-008 |
| Ordenação cronológica por `createdAt` na exibição | FR-009 |
| `updatedAt` presente apenas após edição | FR-010 |
| Permissão de edição/exclusão conforme matriz do contrato (`§3`) | FR-010, FR-016 |
| Título de subtarefa limitado ao tamanho prático de exibição | Edge Cases |
| Campos opcionais nos dois níveis, sem migração | FR-012 |

---

## 4. Transições de Estado

### 4.1 Comentário

| De | Evento | Para | Efeito |
|---|---|---|---|
| (inexistente) | criar com texto válido | publicado | grava `id`, `body`, `authorId`, `authorName`, `createdAt` |
| (inexistente) | criar com texto vazio | (inexistente) | nenhuma escrita |
| publicado | editar (autor permitido) | editado | atualiza `body` e `updatedAt` |
| publicado | excluir (permitido) | (inexistente) | remove do array da dona |
| publicado | excluir a dona (subtarefa ou cartão) | (inexistente) | removido em cascata |

### 4.2 Subtarefa

| De | Evento | Para | Efeito |
|---|---|---|---|
| (inexistente) | criar com título válido | pendente | adiciona `{ id, title, completed: false }` |
| pendente | alternar conclusão | concluída | `completed = true`; progresso do cartão recalculado |
| concluída | alternar conclusão | pendente | `completed = false`; progresso recalculado (FR-003/FR-004) |
| qualquer | remover (com confirmação) | (inexistente) | remove a subtarefa **e** os comentários dela |
| qualquer | remover o cartão pai | (inexistente) | removida junto com o cartão |

**Nenhuma transição altera a coluna do cartão nem qualquer timestamp de fluxo** (FR-017, FR-018).

---

## 5. Volume e Desempenho

- Limite de referência por cartão: **50 subtarefas** e **200 comentários** (NFR-004), atendido por contenção de rolagem com altura limitada (FR-020).
- A contagem de comentários e o progresso são derivados em tempo de renderização, sem índices persistidos.
- Nenhuma paginação, nenhum carregamento sob demanda e nenhuma chave de armazenamento nova (D8 de `research.md`).
