# Technical Research: Trava Estrita de Movimentação para Cartões Bloqueados (025-blocked-task-movement-lock)

**Date**: 2026-09-14  
**Feature**: `025-blocked-task-movement-lock`  
**Status**: Completed  
**Spec**: [specs/025-blocked-task-movement-lock/spec.md](spec.md)

---

## 1. Diagnóstico do Problema Atual (Root Cause Analysis)

A investigação minuciosa do código-fonte e das interações do usuário no Metrik revelou que um cartão bloqueado ainda podia ser movido de coluna devido a quatro vulnerabilidades de contorno no fluxo de arraste e movimentação:

1. **Vulnerabilidade de Arraste sobre Outros Cartões (`handleDrop` em `Task.tsx`)**:
   - Quando um cartão era solto sobre outro cartão em uma coluna diferente, o evento `handleDrop` do cartão de destino capturava `e.dataTransfer.getData('text/plain')`. Embora houvesse verificação em `reorderOrMoveTask`, a função pura subjacente `reorderBoard` em `taskReorder.ts` não validava o status de bloqueio do cartão ativo.
2. **Arrasto de Seleção de Texto ou Elementos Internos**:
   - Mesmo com `draggable={!task.blocked}` no elemento raiz `<article>`, navegadores baseados em Chromium e WebKit permitem o arrasto nativo de seleções de texto ou nós filhos (como títulos ou descrições) a menos que `user-select: none`, `draggable="false"` explícito e prevenção no `onDragStart` sejam rigidamente impostos.
3. **Desconexão Semântica entre Tags e Status Bloqueado**:
   - No vocabulário dos usuários, a palavra "etiqueta" é sinônimo de "tag". Muitos usuários adicionavam a etiqueta textual `"bloqueado"` diretamente pelo componente `TagList`, acreditando que isso travava o cartão. No entanto, o sistema apenas checava a propriedade booleana `task.blocked` (ativada exclusivamente pelo modal de detalhes).
4. **Uso de Alertas Nativos Obstrutivos (`window.alert`)**:
   - A dependência de `window.alert` bloqueava a thread principal de renderização e, em testes automatizados ou em certas configurações de navegador onde alertas são suprimidos ou fechados rapidamente, o retorno defensivo podia falhar ou causar inconsistência no estado do React.

---

## 2. Decisões Arquiteturais & Avaliação de Alternativas

### Decisão 1: Defesa em Profundidade em 4 Camadas (Defense-in-Depth Lockout)

Para garantir que NENHUMA interação consiga transferir um cartão bloqueado entre colunas, a trava será implementada em 4 camadas independentes e concorrentes:

| Camada | Ponto de Aplicação | Comportamento quando Bloqueado |
|---|---|---|
| **Camada 1: DOM & CSS** | `<article className="task-card">` | `draggable="false"`, `cursor: not-allowed`, `user-select: none`, `aria-disabled="true"`. |
| **Camada 2: Eventos de UI** | `Task.tsx` (`onDragStart`, `handleDragStart`) | Cancelamento imediato com `e.preventDefault()` e `e.stopPropagation()`. |
| **Camada 3: Handlers de Drop** | `App.tsx` (`handleGuardedDropTask`, `handleGuardedMoveTask`) | Interceptação preventiva antes de chamar qualquer mutação de estado. |
| **Camada 4: Modelo de Domínio** | `useTaskCollection.ts` e `taskReorder.ts` | Validação incondicional em `moveTask`, `reorderOrMoveTask` e `reorderBoard`. Se `isTaskBlocked(task) && sourceCol !== targetCol`, retorna o estado inalterado. |

*Alternativa Descartada*: Implementar trava apenas no `useTaskCollection`.  
*Motivo do Descarte*: Permitir que o usuário inicie o drag e solte o cartão para só então descobrir que o movimento falhou gera frustração visual e sensação de bug. A trava deve ser evidente desde a tentativa de clique/arraste no DOM.

---

### Decisão 2: Predicado Unificado de Bloqueio (`isTaskBlocked`)

Criar uma função utilitária pura canônica:
```typescript
export const BLOCKED_TAG_KEYWORDS = ['bloqueado', 'bloqueada', 'blocked', 'impedimento'];

export function isTaskBlocked(task: TaskModel): boolean {
  if (task.blocked === true) return true;
  if (Array.isArray(task.tags)) {
    return task.tags.some((tag) => 
      BLOCKED_TAG_KEYWORDS.includes(tag.trim().toLowerCase())
    );
  }
  return false;
}
```
Além disso, se o usuário adicionar a tag `"bloqueado"` pelo `TagList`, o sistema sincroniza automaticamente `task.blocked = true` e `blockedAt = now`. Da mesma forma, ao remover a tag ou clicar em desbloquear, ambos os indicadores são retirados simultaneamente.

*Alternativa Descartada*: Manter tags e status `blocked` totalmente separados.  
*Motivo do Descarte*: Viola o princípio do modelo mental do usuário, que considera a etiqueta visual e a tag como a mesma coisa ("etiqueta de bloqueado").

---

### Decisão 3: Desbloqueio Rápido com 1 Clique no Badge (`⛔ Bloqueado`)

Atualmente, para desbloquear, o usuário precisa clicar no cartão, abrir o modal de detalhes, descer até a seção de impedimento e clicar em "Desbloquear".  
**Solução**:
- No próprio cartão no Kanban, o badge `⛔ Bloqueado` passa a ser interativo com indicação de clique (ex: `title="Clique para retirar o bloqueio e liberar movimentação"`).
- Ao clicar no badge, um diálogo rápido de confirmação ou desbloqueio direto ocorre instantaneamente, retirando a etiqueta e destravando a movimentação.
- O botão no modal de detalhes continua funcionando como canal alternativo com preenchimento opcional de justificativa de resolução.

---

### Decisão 4: Reordenação Vertical Restrita à Mesma Coluna

Conforme ratificado no `/speckit-clarify`:
- Se `sourceColumnId === targetColumnId`: a reordenação vertical de posição (`before`/`after`) é **PERMITIDA**. Isso é vital para a governança ágil, permitindo ao time priorizar qual card impedido deve ser resolvido primeiro dentro da coluna.
- Se `sourceColumnId !== targetColumnId`: a transferência é **ESTRITAMENTE VETADA**.

---

### Decisão 5: Feedback Visual Suave com Notificação Não-Obstrutiva (Toast)

Substituir os alertas nativos `window.alert` por uma notificação contextual não-obstrutiva na interface:
- Um banner/toast discreto no topo ou tooltip sobre o cartão com mensagem amigável: *"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas."*
- O cursor exibe `not-allowed` e a borda do cartão pulsa suavemente em vermelho sem travar o navegador.

---

## 3. Conformidade com a Constituição do Metrik

- **Princípio I (SDD)**: Planejamento detalhado em `plan.md`, `research.md` e `data-model.md` antes da escrita de código.
- **Princípio II (Qualidade & Modularidade)**: Lógica isolada em funções puras (`isTaskBlocked`, `reorderBoard`).
- **Princípio III (Verificação Automatizada)**: Testes unitários cobrindo todos os cenários de tentativa de movimentação (drag, drop na coluna, drop no card, botões laterais, reordenação interna).
- **Princípio VIII (Local-First)**: Persistência síncrona no `localStorage` sob a chave do quadro ativo, sem dependências externas.
