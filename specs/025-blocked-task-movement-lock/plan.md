# Implementation Plan: Trava Estrita de Movimentação para Cartões Bloqueados

**Branch**: `025-blocked-task-movement-lock` | **Date**: 2026-09-14 | **Status**: In Planning | **Spec**: [specs/025-blocked-task-movement-lock/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Esta funcionalidade implementa a **trava estrita e universal de movimentação (Strict Movement Lock)** para cartões bloqueados no Metrik.
O objetivo primordial é assegurar que **nenhum cartão bloqueado possa ser transferido de uma coluna para outra**, sob nenhuma interação ou artifício (seja via Drag & Drop, atalhos de botões laterais, seleção forçada ou soltura sobre outro cartão), até que o usuário retire expressamente a etiqueta de bloqueio.

A solução é desenhada com base no princípio de **Defesa em Profundidade (Defense-in-Depth)** em 4 camadas concorrentes:
1. **Camada 1 (DOM & CSS)**: Atributo `draggable="false"` estrito no elemento raiz `<article className="task-card">`, com `cursor: not-allowed` e `user-select: none`.
2. **Camada 2 (Eventos de UI)**: Interceptação incondicional no manipulador `onDragStart` via `e.preventDefault()`, desativação de botões de passo lateral (`←` e `→`), e ação de desbloqueio rápido com 1 clique diretamente no badge `⛔ Bloqueado`.
3. **Camada 3 (Manipuladores de Drop)**: Validação preventiva nos handlers de soltura (`handleGuardedDropTask` em `App.tsx`, `handleDrop` em `Column.tsx` e `Task.tsx`) com emissão de notificação contextual amigável (Toast/Tooltip).
4. **Camada 4 (Domínio & Estado)**: Bloqueio inviolável nas funções puras `reorderBoard` (em `taskReorder.ts`) e no hook `useTaskCollection.ts` (`moveTask`, `reorderOrMoveTask`), garantindo que qualquer tentativa que cruze colunas seja rejeitada e a coluna de origem seja 100% preservada.

A reordenação vertical dentro da **mesma coluna** permanece permitida (conforme ratificado no `/speckit-clarify`), possibilitando à equipe priorizar a fila de resolução dos bloqueios.

---

## 2. Contexto Técnico

- **Linguagem / Versão**: TypeScript 5.7+, React 19+ (Vite 6)
- **Dependências Principais**: React 19, CSS Custom Properties nativas (Zero dependências externas)
- **Armazenamento**: `localStorage` integrado ao schema do board ativo (`metrik-tasks-${activeBoardId}`)
- **Testes**: Vitest, React Testing Library, jsdom
- **Plataforma Alvo**: Navegadores Web Modernos (Edge, Chrome, Firefox, Safari)
- **Metas de Performance**: Validação síncrona em $< 5\text{ ms}$; zero impacto no framerate de 60fps
- **Restrições**: Conformidade WCAG AA, 100% CSS nativo, respeito à Constituição do Metrik v1.3.0

---

## 3. Constitution Check (Gates Constitucionais Metrik v1.3.0)

- [x] **Gate I (Specification-Driven Development)**: `spec.md`, `checklists/`, `research.md`, `data-model.md`, `plan.md` e `quickstart.md` formalizados na branch `025-blocked-task-movement-lock`.
- [x] **Gate II (Qualidade de Código & Modularidade)**: Predicado puro `isTaskBlocked` reutilizável, funções sem efeitos colaterais em `taskReorder.ts`, e sincronização limpa no hook `useTaskCollection`.
- [x] **Gate III (Verificação Automatizada)**: Testes unitários abrangentes cobrindo tentativas de drag, drop na coluna, drop sobre card, botões laterais, e reordenação interna, preservando 315/315 testes anteriores passando.
- [x] **Gate IV (Observabilidade & Logs Estruturados)**: Notificação amigável e logs `[Metrik Guard]` alertando tentativas de movimentação de tarefas bloqueadas.
- [x] **Gate V (Simplicidade & YAGNI)**: Solução elegante sem introduzir bibliotecas pesadas de DnD ou workflows excessivos.
- [x] **Gate VI (Modelos de Raciocínio Analítico Pré-Tarefas)**: Mandatório na formulação das tarefas em `tasks.md`.
- [x] **Gate VII (Independência Estrita de Marca)**: Terminologia canônica e neutra (*Metrik Blocked Task Movement Guard*).
- [x] **Gate VIII (Soberania Local-First & Isolamento de Squads)**: Estado e histórico de bloqueio persistidos deterministicamente no `localStorage`.

---

## 4. User Review Required (Decisões Clarificadas)

> [!IMPORTANT]
> - **Reordenação Vertical na Mesma Coluna Permitida**: O usuário confirmou que cartões bloqueados **podem ser reordenados verticalmente dentro da própria coluna** (ajuda na priorização dos impedimentos pelo time), mas **nunca transferidos entre colunas diferentes**.
> - **Desbloqueio com 1 Clique no Badge**: O badge `⛔ Bloqueado` no cabeçalho do cartão torna-se interativo, permitindo ao usuário retirar a etiqueta de bloqueio com um clique rápido diretamente no card, além de poder fazê-lo pelo modal de detalhes ou removendo a tag.
> - **Sincronização de Tags**: Adicionar a tag/etiqueta `"bloqueado"` / `"blocked"` marca o cartão como bloqueado; retirar a tag desfaz o bloqueio imediatamente.
> - **Feedback sem Travamento**: Substituição de alertas nativos `window.alert` por avisos visuais contextuais suaves que não congelam o navegador.

---

## 5. Estrutura do Projeto & Arquivos Envolvidos

```text
specs/025-blocked-task-movement-lock/
├── spec.md              # Especificação e decisões clarificadas
├── plan.md              # Este plano de implementação
├── research.md          # Diagnóstico técnico e decisões em 4 camadas
├── data-model.md        # Predicado isTaskBlocked e invariantes de estado
├── quickstart.md        # Roteiro de validação manual e verificação
└── checklists/
    ├── requirements.md  # Checklist de qualidade dos requisitos
    └── blocked-task-movement-lock.md # Checklist de integridade e domínio

src/
├── types/
│   └── kanban.ts        # Atualização de constantes de aviso e tipos
├── utils/
│   └── taskReorder.ts   # Implementação de isTaskBlocked e guarda no reorderBoard puro
├── components/
│   ├── Task.tsx         # Trava no DOM, draggable="false", quick unlock no badge
│   ├── Column.tsx       # Guarda defensiva no handleDrop
│   ├── Toast.tsx        # Toast de notificação contextual suave
│   └── TaskDetailsModal.tsx # Sincronização de tags e botão de desbloqueio
├── hooks/
│   └── useTaskCollection.ts # Validação de domínio em moveTask e reorderOrMoveTask
└── App.tsx              # Guarda no handleGuardedDropTask e handleGuardedMoveTask

tests/unit/
├── blockedTaskMoveGuard.test.tsx # Expansão de testes cobrindo todas as 4 camadas
└── taskReorder.test.ts           # Testes unitários do reorderBoard com isTaskBlocked
```

---

## 6. Fases de Implementação (Estratégia TDD Red-Bar First)

### Phase 1: Predicado Canônico de Domínio & Guarda Pura
- Criar a função utilitária pura `isTaskBlocked(task)` e a constante `BLOCKED_TAG_KEYWORDS` em `src/utils/taskReorder.ts`.
- Atualizar a função pura `reorderBoard` para invocar `isTaskBlocked`: se a tarefa ativa estiver bloqueada e `sourceColumnId !== targetColumn`, abortar a movimentação e retornar o `board` inalterado.
- Escrever testes unitários em `tests/unit/taskReorder.test.ts` comprovando que `reorderBoard` rejeita mudanças de coluna mas aceita reordenação interna.

### Phase 2: Defesa de Domínio no Hook `useTaskCollection`
- Atualizar `moveTask` e `reorderOrMoveTask` para utilizar `isTaskBlocked` de forma uniforme.
- Sincronizar automaticamente `task.blocked` e `task.tags` nas funções `addTaskTag`, `removeTaskTag` e `toggleTaskBlocked`.
- Reconciliar os timestamps e acumular `totalBlockedMs` com precisão.
- Atualizar e expandir `tests/unit/blockedTaskMoveGuard.test.tsx`.

### Phase 3: Trava no DOM & Interação no Componente `Task.tsx`
- Adicionar `draggable={!isTaskBlocked(task)}` estrito e classe CSS `task-card-blocked-locked`.
- Em `handleDragStart`, cancelar incondicionalmente o evento se `isTaskBlocked(task)`.
- Desabilitar ou ocultar botões de movimentação lateral (`canMoveLeft = false` e `canMoveRight = false`).
- Tornar o badge `⛔ Bloqueado` clicável para desbloqueio rápido com 1 clique (invocando `onToggleBlocked`).

### Phase 4: Guardas em `Column.tsx` e `App.tsx` com Feedback Visual
- Em `Column.tsx`, verificar no `handleDrop` se o card sendo solto está bloqueado.
- Em `App.tsx`, atualizar `handleGuardedMoveTask` e `handleGuardedDropTask` para exibir notificação contextual amigável caso ocorra tentativa de movimentação de card bloqueado.
- Criar componente leve de notificação contextual (`ToastNotification`) ou banner discreto com a mensagem: *"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas."*

### Phase 5: Verificação de Regressão & Build Completo
- Executar a suíte de 315 testes automatizados e verificar que novos testes cobrem 100% dos fluxos.
- Executar `npm run build` para garantir zero erros de compilação TypeScript e Vite bundling.
- Validar no navegador com a sessão do usuário.

---

## 7. Estratégia de Testes Automatizados

1. **Testes Unitários de Domínio (`taskReorder.test.ts`)**:
   - `isTaskBlocked` retorna `true` para `task.blocked === true`.
   - `isTaskBlocked` retorna `true` quando `task.tags` contém `"bloqueado"`, `"bloqueada"`, ou `"blocked"`.
   - `reorderBoard` rejeita mudança de coluna quando `isTaskBlocked(task) === true`.
   - `reorderBoard` aceita reordenação vertical na mesma coluna mesmo com `task.blocked === true`.
2. **Testes de Integração de Hooks (`blockedTaskMoveGuard.test.tsx`)**:
   - `moveTask` não altera a coluna de card bloqueado.
   - `reorderOrMoveTask` não altera a coluna em drop entre colunas.
   - Adicionar tag `"bloqueado"` ativa a trava de movimento.
   - Remover tag ou clicar em desbloquear libera o movimento instantaneamente.
3. **Testes de Componente (`Task.test.tsx` e `App.test.tsx`)**:
   - O elemento do card possui `draggable="false"` quando bloqueado.
   - O badge `⛔ Bloqueado` aciona callback de desbloqueio ao ser clicado.
   - Botões `←` e `→` não são renderizados ou permanecem inativos.

---

## 8. Plano de Rollback

Caso ocorra qualquer inconsistência inesperada durante a execução:
```bash
git checkout 025-blocked-task-movement-lock
git reset --hard HEAD~1
```
Todas as alterações são puramente aditivas e defensivas, sem quebra de compatibilidade com os boards legados nem alteração de schemas de banco de dados.
