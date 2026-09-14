# Feature Specification: Trava Estrita de Movimentação para Cartões Bloqueados (Blocked Card Movement Lock)

**Feature Branch**: `025-blocked-task-movement-lock`  
**Created**: 2026-09-14  
**Status**: In Review (Draft Specification)  
**Input**: Solicitação do usuário: *"Correção: O card quando esta bloqueado, ainda estou conseguindo mover de uma coluna para outra. Com card bloqueado, ele nao pode ser movido, ate que o usuario retire a etiqueta de bloqueado."*

---

## 1. Visão Geral & Contexto

No gerenciamento ágil de fluxo e método Kanban, um cartão sinalizado como **bloqueado (com impedimento)** representa trabalho paralisado em uma etapa específica do processo. Permitir que um cartão bloqueado seja movido para outra coluna viola princípios fundamentais da gestão visual e da teoria das filas:
1. **Distorção de Métricas de Eficiência e Lead Time**: Se um item bloqueado na etapa "Em desenvolvimento" for arrastado para "Em Testes", a métrica de Cycle Time daquela coluna e o Diagrama de Fluxo Cumulativo (CFD) registrarão dados falsos de progresso.
2. **Ocultação de Gargalos**: Mover itens impedidos cria uma falsa ilusão de avanço e mascara o ponto real de atrito organizacional.

Atualmente no Metrik, embora existam verificações parciais no hook `useTaskCollection`, usuários ainda relatam conseguir mover cartões bloqueados entre colunas (por exemplo, através de interações de arrastar e soltar sobre outros cartões, drops em áreas da coluna, atalhos de navegação ou quando o bloqueio é aplicado por meio de etiquetas/tags de bloqueio).

Esta especificação define uma **regra estrita e universal de bloqueio de movimentação (Strict Movement Lock)**:
> **Regra Fundamental**: Um cartão com a etiqueta de bloqueado ativa (`blocked === true` ou tag de impedimento) **NÃO PODE SER MOVIDO DE UMA COLUNA PARA OUTRA SOB NENHUMA HIPÓTESE**, até que o usuário explicitamente retire a etiqueta de bloqueado.

---

## 2. User Scenarios & Casos de Teste *(mandatory)*

### User Story 1 - Bloqueio Absoluto de Movimento entre Colunas (Priority: P1) 🎯 MVP Core

Como membro da equipe acompanhando o fluxo do Kanban, quero que um cartão bloqueado fique completamente impedido de ser transferido para qualquer outra coluna, para que itens com impedimento não avancem inadvertidamente pelo processo.

**Why this priority**: É a essência do problema reportado pelo usuário. Um cartão bloqueado deve permanecer rigidamente retido na sua coluna de bloqueio.

**Independent Test**:
- Bloquear um cartão na coluna "em desenvolvimento".
- Tentar arrastar o cartão para a coluna "Em Testes" ou "Concluído": o sistema deve impedir o arraste (`draggable="false"`, cancelamento de drop) e manter o cartão na coluna original.
- Tentar mover usando os botões de passo lateral (`←` e `→`): os botões devem estar desabilitados ou ocultos para o cartão bloqueado.
- Tentar acionar qualquer comando ou atalho de movimentação programática: o motor de dados deve rejeitar a transição e preservar a coluna atual.

**Acceptance Scenarios**:
1. **Given** um cartão no Kanban com a etiqueta de bloqueado ativa, **When** o usuário tenta iniciar o arrasto (drag) do cartão, **Then** o evento de arrasto é cancelado imediatamente, o elemento possui `draggable="false"` e o cursor exibe indicação de proibição (`not-allowed`).
2. **Given** um cartão com etiqueta de bloqueado, **When** qualquer evento de drop de coluna ou drop sobre outro cartão tentar transferi-lo para uma coluna diferente, **Then** a ação é categoricamente bloqueada, o cartão permanece na sua coluna vigente e um alerta informativo contextual é exibido.
3. **Given** um cartão bloqueado, **When** renderizado no quadro Kanban, **Then** os botões de navegação lateral (`←` e `→`) para avançar ou recuar coluna permanecem inativos ou ocultos.
4. **Given** um cartão bloqueado na coluna A, **When** o usuário tenta reordenar o cartão dentro da MESMA coluna A, **Then** a reordenação vertical interna da própria coluna é permitida, sem alteração de coluna.

---

### User Story 2 - Gestão e Sincronização da Etiqueta de Bloqueado (Priority: P1)

Como operador do quadro Kanban, quero gerenciar a etiqueta de bloqueado de forma clara e ágil (tanto pelo badge do cartão quanto pelas tags/modal), para que eu possa bloquear uma tarefa quando houver impedimento e desbloqueá-la assim que o impedimento for superado, liberando instantaneamente sua movimentação.

**Why this priority**: O usuário especificou *"ate que o usuario retire a etiqueta de bloqueado"*. É indispensável que a remoção da etiqueta seja intuitiva, acessível e sincronize perfeitamente a liberação de movimento.

**Independent Test**:
- Adicionar etiqueta/marcação de bloqueado a um cartão: o cartão ganha badge visual `⛔ Bloqueado`, visualização temática de bloqueio e trava de movimento.
- Retirar a etiqueta de bloqueado (via clique na etiqueta, remoção da tag ou pelo modal de detalhes): o cartão é imediatamente destravado, permitindo arrastá-lo e movê-lo normalmente.

**Acceptance Scenarios**:
1. **Given** um cartão não bloqueado, **When** o usuário adiciona o bloqueio (pelo modal de detalhes ou inserindo a tag `bloqueado`/`blocked`), **Then** o sistema ativa `task.blocked = true`, registra o timestamp `blockedAt` e exibe o badge `⛔ Bloqueado`.
2. **Given** um cartão bloqueado, **When** o usuário clica na opção de retirar o bloqueio (seja removendo a tag `bloqueado`, clicando no botão "Desbloquear" do modal, ou na ação direta do badge), **Then** o sistema remove a etiqueta de bloqueado (`blocked = false`), acumula o tempo decorrido no `totalBlockedMs` e remove a trava de movimentação.
3. **Given** um cartão recém-desbloqueado, **When** o usuário tenta movê-lo entre colunas, **Then** o movimento é liberado imediatamente sem necessidade de recarregar a página.

---

### User Story 3 - Feedback Visual e Prevenção de Erros (Priority: P2)

Como usuário interagindo com o quadro, quero receber feedback visual imediato e evidente de que o cartão está bloqueado para movimentação, para que eu entenda claramente o motivo de não conseguir movê-lo sem frustração.

**Why this priority**: Melhora a usabilidade, a aderência aos padrões de acessibilidade e evita que o usuário ache que a aplicação congelou.

**Independent Test**:
- Passar o mouse sobre um cartão bloqueado: o cursor deve indicar `not-allowed`.
- Se o usuário tentar forçar a movimentação, exibir mensagem clara: *"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas."*

**Acceptance Scenarios**:
1. **Given** um cartão com status bloqueado, **When** o usuário posiciona o cursor sobre ele, **Then** o cursor deve exibir estilo de bloqueio (`cursor: not-allowed`).
2. **Given** qualquer tentativa de movimentação entre colunas para cartão bloqueado, **When** a ação é interceptada, **Then** o sistema exibe notificação amigável e explicativa sem quebrar a interface nem deixar o card em estado fantasma/órfão.

---

## 3. Requisitos Funcionais (FRs)

- **FR-001 [Strict Drag Prevention]**: O componente `TaskCard` DEVE possuir `draggable="false"` estrito quando a tarefa estiver bloqueada (`task.blocked === true` ou contiver tag de bloqueio ativa).
- **FR-002 [Drag Start Interception]**: O manipulador `onDragStart` DEVE invocar explicitamente `e.preventDefault()` e interromper a propagação se o cartão estiver com bloqueio ativo.
- **FR-003 [Domain-Level Movement Guard]**: A função `moveTask` no hook `useTaskCollection` DEVE rejeitar qualquer chamada que tente alterar a coluna de uma tarefa bloqueada (`sourceColumnId !== targetColumnId`), mantendo o estado inalterado e exibindo aviso claro.
- **FR-004 [Drop Handler Guard]**: O manipulador `reorderOrMoveTask` e a função pura `reorderBoard` DEVEM validar se a tarefa ativa possui bloqueio. Se `activeTask.blocked === true` e a coluna alvo for diferente da coluna atual, a operação DEVE retornar o estado anterior sem nenhuma mutação de coluna.
- **FR-005 [Nav Step Buttons Lock]**: Os botões de navegação lateral (`onMoveLeft` e `onMoveRight`) no cartão DEVEM permanecer inoperantes (`canMoveLeft = false` e `canMoveRight = false`) enquanto a tarefa estiver bloqueada.
- **FR-006 [Tag & Badge Synchronization]**: Se o usuário adicionar a tag `"bloqueado"`, `"bloqueada"` ou `"blocked"` (case-insensitive) à lista de tags de uma tarefa, o sistema DEVE sincronizar automaticamente o estado de bloqueio (`blocked = true`). Ao remover essa tag ou clicar em "Desbloquear", o bloqueio DEVE ser cancelado (`blocked = false`).
- **FR-007 [Quick Unlock Action]**: O badge `⛔ Bloqueado` no cartão DEVE permitir ação direta de desbloqueio ou abrir o modal de desbloqueio rápido com um clique.
- **FR-008 [Flow Metrics Integrity]**: O tempo em que o cartão permanece bloqueado DEVE ser registrado precisamente em `totalBlockedMs` para que o relatório de Eficiência de Fluxo (Flow Efficiency) e os gráficos analíticos reflitam a realidade fidedigna do processo.

---

## 4. Requisitos Não-Funcionais (NFRs)

- **NFR-001 [Latência de Validação]**: A checagem de bloqueio durante interações de arraste e movimentação DEVE ser executada de forma síncrona em < 5ms, sem qualquer atraso perceptível na interface.
- **NFR-002 [Acessibilidade WCAG 2.1 AA]**: O estado bloqueado do cartão e a impossibilidade de movimentação devem ser comunicados por atributos de acessibilidade (`aria-disabled="true"`, `aria-label` descritivo).
- **NFR-003 [Soberania Local-First]**: O estado de bloqueio, timestamps e histórico de tempo bloqueado devem ser persistidos deterministicamente no `localStorage` sob o schema do board ativo.

---

## 5. Casos de Borda e Tratamento de Erros

1. **Reordenação dentro da mesma coluna**: Um cartão bloqueado pode ser reordenado verticalmente dentro da **mesma coluna** (ex: priorizar qual card bloqueado deve ser tratado primeiro). Apenas o movimento **entre colunas distintas** é proibido.
2. **Drop em coluna alvo já cheia (WIP Limit) vs Bloqueado**: A validação de bloqueio tem precedência imediata sobre qualquer validação de WIP ou fluxo direcional.
3. **Cartão com dependências externas (Cross-Squad)**: Se uma tarefa possui bloqueador pendente de outra squad (`pendingBlockersCount > 0`), o sistema já aciona o Soft Block; se o operador também marcar a tarefa como bloqueada com etiqueta, o bloqueio passa a ser estrito (Hard Lock).
4. **Múltiplas tentativas rápidas de drag**: O DOM do cartão não deve entrar em estado fantasma (ghosting) ou travamento de eventos caso o usuário tente arrastar repetidamente um item bloqueado.

---

## 6. Fora de Escopo

- Alterações na fórmula de cálculo de Lead Time ou Cycle Time.
- Bloqueio de edição de título, descrição, tags informativas ou checklists de subtarefas de um cartão bloqueado (apenas a movimentação entre colunas está bloqueada).
- Criação de novos fluxos de aprovação externa ou workflows burocráticos para desbloqueio.

---

## 7. Dependências

- Feature 012: `012-blocked-tasks-and-impediments` (modelo base de impedimentos).
- Feature 014: `014-column-limits-and-unidirectional-flow` (guardas de fluxo direcional).
- Feature 024: `024-task-types-and-linking` (vínculos e dependências entre cards).
