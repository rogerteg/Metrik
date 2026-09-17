# Component Interface Contract: Gerenciamento Premium de Quadros (Feature 031)

**Feature**: `031-premium-board-management`  
**Contract Version**: 1.0.0  
**Date**: 2026-09-17  

---

## 1. `ManageBoardsViewProps`
Contrato do componente principal da tela cheia de gerenciamento de quadros.

```typescript
import { BoardModel } from '../types/kanban';
import { Team, User } from '../types/team';

export interface ManageBoardsViewProps {
  /** Lista completa de quadros acessíveis pelo usuário ativo */
  boards: BoardModel[];
  /** Identificador do quadro atualmente ativo */
  activeBoardId: string | null;
  /** Lista de squads/times disponíveis */
  teams: Team[];
  /** Usuário atualmente autenticado/selecionado na sessão */
  activeUser?: User | null;
  /** Callback para selecionar e alternar para o quadro desejado */
  onSelectBoard: (boardId: string) => void;
  /** Callback para criar um novo quadro (com nome e squad opcional) */
  onCreateBoard: (name: string, teamId?: string) => void;
  /** Callback para renomear um quadro */
  onRenameBoard: (boardId: string, newName: string) => void;
  /** Callback para excluir permanentemente um quadro */
  onDeleteBoard: (boardId: string) => void;
  /** Callback para navegar diretamente para os gráficos analíticos do quadro */
  onOpenAnalytics?: (boardId: string) => void;
}
```

---

## 2. `DeleteBoardModalProps`
Contrato da caixa de diálogo modal segura de exclusão.

```typescript
export interface DeleteBoardModalProps {
  /** Se o modal está visível no DOM */
  isOpen: boolean;
  /** Nome do quadro a ser deletado para destaque */
  boardName: string;
  /** Contagem de tarefas ativas que serão removidas junto com o quadro */
  tasksCount: number;
  /** Se o quadro é o único restante no sistema (bloqueia confirmação) */
  isSoleBoard: boolean;
  /** Ação de fechamento / cancelamento */
  onClose: () => void;
  /** Ação de confirmação da exclusão */
  onConfirm: () => void;
}
```

---

## 3. Pure Utility Contract: `boardMetrics.ts`

```typescript
import { BoardModel } from '../types/kanban';
import { BoardSummaryMetrics } from '../types/boardManagement';

/**
 * Computa de forma pura as métricas de fluxo e telemetria de um quadro.
 * @param board Objeto completo do quadro com colunas e tarefas
 * @param activeBoardId ID do quadro ativo na sessão atual
 * @returns Objeto imutável contendo métricas calculadas
 */
export function computeBoardSummaryMetrics(
  board: BoardModel,
  activeBoardId: string | null
): BoardSummaryMetrics;
```

---

## 4. UI Behavior & Event Contracts

| Ação do Usuário | Gatilho / Evento | Comportamento Contratual |
| :--- | :--- | :--- |
| **Clique na Aba "Gerenciar"** | `onClick` em `.view-toggle button` | `setView('manage')`, destaca aba como ativa e exibe canvas de gerenciamento. |
| **Clique no botão do Seletor** | `onClick` em `BoardSwitcher` | Sincroniza e dispara `setView('manage')`. |
| **Clique no Cartão / "Abrir"** | `onClick` no cartão | Executa `onSelectBoard(id)` e transiciona view para `'board'`. |
| **Clique em "Analytics"** | `onClick` no botão do cartão | Executa `onSelectBoard(id)` e transiciona view para `'analytics'`. |
| **Alternar Modo Grade/Tabela** | `onClick` no pill switcher | Alterna `viewMode` entre `'grid'` e `'table'`, re-renderizando a lista com transição suave. |
| **Salvar Edição de Nome** | `Enter` ou `onBlur` no input | Dispara `onRenameBoard(id, trimmedName)` se nome não estiver vazio. |
| **Cancelar Edição de Nome** | `Escape` no input | Descarta alteração e restaura visualização de texto. |
| **Exclusão de Quadro** | `onClick` em "Excluir" | Abre `DeleteBoardModal`. Se `isSoleBoard`, botão de confirmação permanece desabilitado. |
