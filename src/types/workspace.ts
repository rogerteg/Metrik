/**
 * Workspace, Favorite Boards, and Settings Data Models
 * Feature 029: Workspace & Board Hub with Separate Settings Module
 */

export interface Workspace {
  /** Identificador único do espaço (ex.: 'ws-gestao', 'ws-producao') */
  id: string;
  /** Nome visível do espaço de trabalho */
  name: string;
  /** Descrição opcional do propósito ou escopo da equipe */
  description?: string;
  /** Código de cor hexadecimal ou HSL para o marcador visual/bullet (ex.: '#eab308') */
  color: string;
  /** Ícone ou avatar representativo opcional */
  icon?: string;
  /** Lista ordenada de identificadores de quadros pertencentes a este espaço */
  boardIds: string[];
  /** Identificador da squad proprietária (opcional, para integração com TBAC Feature 023) */
  teamId?: string;
  /** Data e hora de criação (ISO 8601) */
  createdAt: string;
  /** Data e hora da última alteração (ISO 8601) */
  updatedAt: string;
}

export interface FavoriteBoardRecord {
  /** Identificador do quadro favoritado (chave estrangeira para Board.id) */
  boardId: string;
  /** Identificador do usuário que favoritou (para suporte a múltiplos perfis locais) */
  userId: string;
  /** Timestamp de quando foi adicionado aos favoritos (ISO 8601) */
  favoritedAt: string;
}

export interface AppSettings {
  /** Tema visual ativo */
  theme: 'dark' | 'light' | 'slate' | 'neutral';
  /** Densidade espacial dos cartões e colunas */
  density: 'compact' | 'comfortable';
  /** Visualização inicial padrão */
  defaultView?: 'board' | 'workspaces' | 'analytics';
  /** Limite de Trabalho em Progresso (WIP) padrão sugerido para novas colunas */
  defaultWipLimit: number;
  /** Habilitação de micro-animações visuais */
  enableAnimations: boolean;
  /** Exibir alertas visuais de estouro de WIP */
  showWipLimits?: boolean;
  /** Exibir badges de tempo de ciclo nos cartões */
  showCycleTimeBadges?: boolean;
  /** ID do quadro padrão ao iniciar a aplicação (opcional) */
  defaultBoardId?: string;
  /** Data da última sincronização de configurações */
  updatedAt: string;
}

export interface WorkspaceFilterState {
  /** Termo de busca textual digitado na barra de pesquisa */
  searchQuery: string;
  /** ID do espaço de trabalho selecionado na lateral ('all' para visão consolidada) */
  activeWorkspaceId: string | 'all';
  /** Filtro booleano para exibir exclusivamente quadros favoritos */
  onlyFavorites: boolean;
}
