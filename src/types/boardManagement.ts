/**
 * Tipos e Modelos de Estado para o Gerenciamento Premium de Quadros (Feature 031)
 * Especificações:
 * - specs/031-premium-board-management/spec.md
 * - specs/031-premium-board-management/data-model.md
 * - specs/031-premium-board-management/contracts/board-management.contract.md
 */

/**
 * Representa a telemetria calculada pura de um quadro para apresentação
 * na grade de cartões e na tabela de gerenciamento corporativo.
 */
export interface BoardSummaryMetrics {
  /** Identificador único do quadro */
  boardId: string;
  /** Quantidade total de colunas configuradas no quadro */
  columnsCount: number;
  /** Quantidade total de tarefas distribuídas em todas as colunas */
  totalTasksCount: number;
  /** Quantidade de tarefas atualmente em colunas de categoria 'in_progress' (Trabalho em Andamento / WIP) */
  wipTasksCount: number;
  /** Quantidade de tarefas em colunas de categoria 'done' (Concluídas) */
  doneTasksCount: number;
  /** Se o quadro é o quadro atualmente ativo na sessão de trabalho */
  isActive: boolean;
}

/**
 * Modos de visualização suportados na tela de gerenciamento de quadros.
 */
export type BoardViewMode = 'grid' | 'table';

/**
 * Controla os filtros interativos e modo de exibição da tela de gerenciamento.
 */
export interface BoardManagementFilterState {
  /** Termo de busca textual filtrado em tempo real por nome */
  searchQuery: string;
  /** Filtro por Squad/Time específico ou 'all' para todas as squads autorizadas */
  selectedTeamId: string | 'all';
  /** Modo ativo de apresentação da visualização ('grid' | 'table') */
  viewMode: BoardViewMode;
}

/**
 * Controla a abertura, contexto e segurança da exclusão de um quadro.
 */
export interface DeleteBoardModalState {
  /** Se a caixa de diálogo de confirmação está aberta */
  isOpen: boolean;
  /** ID do quadro alvo de exclusão */
  targetBoardId: string | null;
  /** Nome legível do quadro para exibição em destaque */
  targetBoardName: string;
  /** Total de tarefas que serão permanentemente removidas */
  tasksCount: number;
  /** Indicador se o quadro é o único restante no sistema (bloqueando a exclusão) */
  isSoleBoard: boolean;
}
