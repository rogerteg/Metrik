# Feature Specification: Interação Drag-and-Drop de Cartões (HTML5 Drag & Drop)

**Feature Branch**: `003-drag-and-drop-interaction`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "Arrastar e soltar cartões nativo (HTML5 Drag & Drop) com feedback visual de drop zone e preservação dos botões direcionais como acessibilidade"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Movimentação Livre de Cartões entre Colunas via Drag-and-Drop (Priority: P1)

Como um usuário do Metrik gerenciando meu fluxo de trabalho no quadro,  
Eu quero clicar e arrastar um cartão de uma coluna e soltá-lo em qualquer outra coluna destino,  
Para atualizar visualmente o status da tarefa de forma rápida e intuitiva, mantendo os timestamps de fluxo e limites de WIP perfeitamente sincronizados.

**Why this priority**: É a interação primordial esperada em quadros Kanban modernos. Agiliza a organização diária do trabalho e reduz o atrito cognitivo.

**Independent Test**: Pode ser testado isoladamente arrastando um cartão da coluna `Todo` e soltando na coluna `In Progress`, verificando se a coluna é atualizada no estado reativo e no `localStorage`.

**Acceptance Scenarios**:
1. **Given** um cartão "Definir arquitetura" na coluna `Todo`,  
   **When** o usuário arrasta o cartão e o solta sobre a coluna `In Progress`,  
   **Then** o cartão passa a pertencer à coluna `In Progress`, seu timestamp `startedAt` é preenchido se estava nulo, e o contador da coluna é atualizado.
2. **Given** um cartão em `In Progress`,  
   **When** o usuário o arrasta e solta na coluna `Completed`,  
   **Then** o cartão muda para `Completed`, seu timestamp `completedAt` é registrado, seus badges de Lead/Cycle Time aparecem no cartão, e a `MetricsBar` é atualizada.
3. **Given** um cartão em `Completed`,  
   **When** o usuário o arrasta de volta para `In Progress` ou `Todo`,  
   **Then** o timestamp `completedAt` é limpo (`null`) e o contador de throughput na `MetricsBar` é recalculado.

---

### User Story 2 - Feedback Visual Rico de Zona de Soltura (Drop Zone) e Cartão Fantasma (Priority: P1)

Como um usuário arrastando um item pelo quadro,  
Eu quero ver claramente qual cartão estou arrastando (com opacidade reduzida/efeito fantasma) e qual coluna é o alvo ativo (com borda iluminada e zona receptora em destaque),  
Para ter certeza imediata de onde o cartão será posicionado antes de soltar o botão do mouse.

**Why this priority**: A ausência de feedback visual causa desorientação, solturas acidentais e sensação de interface engessada ou defeituosa.

**Independent Test**: Pode ser testado inspecionando os estilos CSS aplicados às classes durante os eventos `dragstart`, `dragenter`, `dragover` e `dragleave`.

**Acceptance Scenarios**:
1. **Given** o início do arraste de um cartão (`dragstart`),  
   **When** o cartão é deslocado,  
   **Then** o elemento original adquire opacidade reduzida (ex: `0.4`), cursor de arraste (`grabbing`) e classe `.task-card-dragging`.
2. **Given** um cartão sendo arrastado sobre uma coluna destino (`dragover`),  
   **When** o ponteiro entra na área da coluna,  
   **Then** a coluna recebe a classe indicadora `.kanban-column-drop-target` com brilho/borda sutil destacando a zona de recepção.
3. **Given** um cartão sendo arrastado para fora de uma coluna sem soltá-lo (`dragleave`),  
   **When** o ponteiro deixa a área da coluna,  
   **Then** o estilo indicador `.kanban-column-drop-target` é removido imediatamente.
4. **Given** o cancelamento ou finalização do arraste (`dragend`),  
   **When** o botão do mouse é liberado (mesmo fora do quadro),  
   **Then** todas as classes temporárias de arraste e destaque são removidas de todos os cartões e colunas.

---

### User Story 3 - Reordenação Vertical de Cartões dentro da Mesma Coluna (Priority: P2)

Como um usuário priorizando tarefas em uma coluna específica,  
Eu quero arrastar um cartão para cima ou para baixo entre outros cartões da mesma coluna,  
Para definir a ordem de prioridade de execução visualmente.

**Why this priority**: No Kanban, a ordem vertical dentro da coluna representa frequentemente prioridade (top-to-bottom). Permitir reordenação manual dá poder de priorização refinada.

**Independent Test**: Pode ser testado arrastando o último cartão de uma coluna e soltando-o antes do primeiro cartão da mesma coluna, verificando a persistência da nova ordenação no estado.

**Acceptance Scenarios**:
1. **Given** uma coluna com 3 cartões [A, B, C],  
   **When** o usuário arrasta o cartão C e o solta antes do cartão A,  
   **Then** a lista da coluna é reorganizada para [C, A, B] e a nova ordem é salva no `localStorage`.
2. **Given** um cartão solto sobre a sua própria posição de origem,  
   **When** o evento de soltura ocorre,  
   **Then** o estado não sofre mutações redundantes (no-op).

---

### User Story 4 - Preservação dos Botões Direcionais para Acessibilidade e Mobile (Priority: P2)

Como um usuário que utiliza teclado, navegação por botões direcionais ou está em um smartphone/tablet,  
Eu quero que os botões direcionais (`←` e `→`) permaneçam visíveis e operacionais no rodapé dos cartões,  
Para que eu nunca fique impossibilitado de mover cartões se meu dispositivo não oferecer suporte confiável a drag-and-drop.

**Why this priority**: Garante acessibilidade (WCAG), conformidade universal e redundância à prova de falhas na experiência do usuário.

**Independent Test**: Pode ser testado clicando no botão `→` de um cartão e verificando que ele ainda transiciona para a coluna adjacente independentemente do recurso de drag-and-drop.

**Acceptance Scenarios**:
1. **Given** um cartão em qualquer coluna,  
   **When** o usuário clica no botão `→` ou `←`,  
   **Then** o cartão continua se movendo para a coluna adjacente exatamente como antes.
2. **Given** um leitor de tela ou usuário navegando por teclado,  
   **When** navega até os botões direcionais,  
   **Then** eles continuam focáveis e com rótulos semânticos claros (`aria-label`).

---

## Edge Cases

1. **Soltura Fora de Qualquer Drop Zone**:  
   Se o usuário soltar o cartão fora do quadro ou sobre o cabeçalho/barra de métricas, a ação é cancelada sem erros e o cartão permanece inalterado na coluna de origem.
2. **Interação com Área de Texto (`AutoResizeTextarea`)**:  
   Ao selecionar texto para editar dentro do título do cartão, o evento de drag **NÃO** deve ser acionado acidentalmente. O drag deve ser habilitado no cartão, mas prevenido quando a interação for direta de foco/seleção de texto no textarea (usando `draggable={!isEditing}` ou `event.stopPropagation` no textarea).
3. **Sobrecarga de Limite de WIP ao Soltar**:  
   Se o usuário soltar um cartão em uma coluna cujo limite de WIP será ultrapassado, o Metrik aplica a política *Soft Limit*: a operação é concluída com sucesso, mas a coluna e o badge exibem imediatamente o alerta âmbar (`⚠️`).
4. **Coluna Vazia como Alvo**:  
   Uma coluna que possui 0 cartões deve fornecer uma área receptora (drop target) suficiente em altura (mínimo de altura ou mensagem de lista vazia) para que o usuário possa soltar o cartão facilmente nela.
5. **Prevenção de Comportamento Padrão do Navegador**:  
   Os manipuladores de `dragover` devem executar `e.preventDefault()` explicitamente, caso contrário o navegador rejeita o `drop` por padrão.

---

## Clarifications & Defaults

- [CLARIFICATION 1]: **Liberdade de Movimentação entre Colunas**:  
  *Decisão*: O Drag-and-Drop permitirá soltar em **qualquer coluna** (não apenas adjacentes), dando liberdade total ao usuário, enquanto os botões direcionais (`←` e `→`) mantêm a transição passo a passo adjacente.
- [CLARIFICATION 2]: **Mecanismo de Ordenação**:  
  *Decisão*: A ordem dos itens no array de tarefas mantido pelo hook `useTaskCollection` determinará a ordem de exibição, evitando necessidade de novos campos numéricos de ordenação complexos e mantendo o contrato de dados retrocompatível.
- [CLARIFICATION 3]: **Tecnologia de Drag-and-Drop**:  
  *Decisão*: Utilizaremos a **API nativa HTML5 Drag and Drop** (`draggable`, `onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`, `onDragEnd`) sem instalar bibliotecas externas pesadas (`react-beautiful-dnd`, `dnd-kit`), preservando a performance, o bundle enxuto e a ausência de dependências obsoletas com React 19.

---

## Functional Requirements

- **FR-001**: O sistema DEVE marcar o cartão de tarefa como arrastável via atributo nativo `draggable={true}` quando o cartão não estiver em modo de edição de texto ativa.
- **FR-002**: O sistema DEVE capturar o identificador da tarefa (`taskId`) no evento `dragstart` e disponibilizá-lo via `event.dataTransfer.setData('text/plain', taskId)`.
- **FR-003**: O sistema DEVE aplicar uma classe visual de arraste ativo (`.task-card-dragging`) reduzindo a opacidade do elemento enquanto estiver sendo arrastado.
- **FR-004**: O sistema DEVE permitir que colunas atuem como recipientes de soltura (Drop Targets), interceptando `dragover` com `e.preventDefault()`.
- **FR-005**: O sistema DEVE destacar a coluna sobre a qual o cursor se encontra com a classe `.kanban-column-drop-target` durante `dragenter`/`dragover` e remover no `dragleave` ou `drop`.
- **FR-006**: Ao disparar o evento `drop` sobre uma coluna ou item, o sistema DEVE mover a tarefa para a coluna correspondente através do hook `useTaskCollection`.
- **FR-007**: Se a soltura ocorrer sobre outro cartão dentro da mesma coluna ou entre colunas, o sistema DEVE inserir a tarefa na posição relativa correspondente (reordenação de índice).
- **FR-008**: O sistema DEVE atualizar os timestamps `startedAt` e `completedAt` de acordo com as regras de ciclo de vida já estabelecidas na Feature 002.
- **FR-009**: O sistema DEVE manter os botões direcionais (`←` e `→`) no rodapé dos cartões plenamente funcionais como alternativa acessível ao drag-and-drop.
- **FR-010**: O sistema DEVE garantir que clicar ou selecionar texto dentro de `AutoResizeTextarea` não inicie o arraste acidental do cartão.
- **FR-011**: O sistema DEVE fornecer área clicável/soltável mínima para colunas vazias, garantindo que o usuário possa soltar um item mesmo se a coluna não contiver cartões prévios.
- **FR-012**: O sistema DEVE persistir imediatamente a nova coleção e ordenação de tarefas no `localStorage` sob a chave `metrik_kanban_tasks`.

---

## Key Entities & Data Model

Nenhum campo novo é obrigatório no `TaskModel`. A ordenação dentro das colunas é preservada naturalmente pela sequência dos elementos no array persistido:

```typescript
// src/types/kanban.ts
export interface TaskModel {
  id: string;
  title: string;
  columnId: ColumnId;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
```

O hook `useTaskCollection` será enriquecido com uma nova ação:
```typescript
reorderOrMoveTask: (taskId: string, targetColumnId: ColumnId, targetIndex?: number) => void;
```

---

## Success Criteria *(mandatory)*

- **SC-001**: O usuário consegue arrastar um cartão entre quaisquer duas colunas em menos de 1 segundo de resposta visual.
- **SC-002**: 100% das transições de status e timestamps calculados na Feature 002 permanecem rigorosamente corretos após operações de drag-and-drop.
- **SC-003**: A reordenação de cartões na mesma coluna é persistida entre recarregamentos da página (`F5`).
- **SC-004**: Todas as interações via botões direcionais continuam funcionando com 100% de cobertura nos testes existentes.
- **SC-005**: 100% dos testes unitários novos e existentes continuam passando no Vitest (`npm test`).
