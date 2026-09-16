# Data Model: Hub de Espaços de Trabalho, Favoritos e Configurações

**Feature Branch**: `029-workspace-hub-and-settings`
**Date**: 2026-09-15
**Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

---

## 1. Definição das Entidades de Dados

### 1.1 `Workspace` (Espaço de Trabalho)

Representa a unidade organizacional de alto nível demonstrada no protótipo (ex.: *Gestão, Produção, Projetos Estratégicos, P&D, Contabilidade, Vendas*), agrupando um conjunto de quadros de fluxo.

```typescript
export interface Workspace {
  /** Identificador único do espaço (ex.: 'ws-gestao', 'ws-producao') */
  id: string;
  /** Nome visível do espaço de trabalho */
  name: string;
  /** Descrição opcional do propósito ou escopo da equipe */
  description?: string;
  /** Código de cor hexadecimal para o marcador visual/bullet (ex.: '#eab308') */
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
```

---

### 1.2 `FavoriteBoard` (Quadro Favorito)

Mapeia a relação de preferência do usuário com quadros destacados para acesso rápido na vitrine superior do Hub.

```typescript
export interface FavoriteBoardRecord {
  /** Identificador do quadro favoritado (chave estrangeira para Board.id) */
  boardId: string;
  /** Identificador do usuário que favoritou (para suporte a múltiplos perfis locais) */
  userId: string;
  /** Timestamp de quando foi adicionado aos favoritos (ISO 8601) */
  favoritedAt: string;
}
```

---

### 1.3 `AppSettings` (Configurações Globais da Aplicação)

Modelo persistido de preferências administrativas e de experiência do usuário, gerenciadas exclusivamente pelo Módulo Separado de Configurações.

```typescript
export interface AppSettings {
  /** Tema visual ativo */
  theme: 'dark' | 'light' | 'slate';
  /** Densidade espacial dos cartões e colunas */
  density: 'compact' | 'comfortable';
  /** Limite de Trabalho em Progresso (WIP) padrão sugerido para novas colunas */
  defaultWipLimit: number;
  /** Habilitação de micro-animações visuais */
  enableAnimations: boolean;
  /** ID do quadro padrão ao iniciar a aplicação (opcional) */
  defaultBoardId?: string;
  /** Data da última sincronização de configurações */
  updatedAt: string;
}
```

---

### 1.4 `WorkspaceFilterState` (Estado de Filtro da Interface)

Representa o estado transitório de busca e filtro da barra em formato de pílula (*Pill Filter*).

```typescript
export interface WorkspaceFilterState {
  /** Termo de busca textual digitado na barra de pesquisa */
  searchQuery: string;
  /** ID do espaço de trabalho selecionado na lateral ('all' para visão consolidada) */
  activeWorkspaceId: string | 'all';
  /** Filtro booleano para exibir exclusivamente quadros favoritos */
  onlyFavorites: boolean;
}
```

---

## 2. Invariantes de Negócio & Integridade Referencial

1. **Invariante 1 (Espaço Padrão Indestrutível)**:
   - O sistema sempre mantém ao menos um espaço de trabalho inicial padrão (`id: 'workspace-default'`), que não pode ser excluído, garantindo que nenhum quadro fique órfão.
2. **Invariante 2 (Preservação de Quadros na Remoção de Espaço)**:
   - Se um espaço de trabalho personalizado for removido pelo usuário, os quadros nele contidos NÃO são deletados do Metrik; eles são automaticamente remanejados para o espaço de trabalho padrão.
3. **Invariante 3 (Validação Cromática)**:
   - Toda cor de identificador visual de espaço (`color`) deve ser uma string de formato HEX (`#RRGGBB`) ou HSL válida, garantindo renderização correta em navegadores modernos.
4. **Invariante 4 (Idempotência de Favoritos)**:
   - Marcar um quadro como favorito duas vezes seguidas produz o mesmo resultado determinístico; duplicatas na lista de favoritos são descartadas estruturalmente.
5. **Invariante 5 (Soberania Local-First)**:
   - Todas as entidades são armazenadas no `localStorage` do navegador com prefixos isolados:
     - `metrik_workspaces`: Coleção de objetos `Workspace`.
     - `metrik_favorite_boards`: Mapeamento de quadros favoritos por usuário.
     - `metrik_app_settings`: Objeto único de configurações globais.

---

## 3. Estratégia de Migração Automática (Brownfield Coexistence)

No primeiro carregamento com a Feature 029 ativa:

```text
Se localStorage.getItem('metrik_workspaces') === null:
  1. Carregar lista de quadros existentes de localStorage.getItem('metrik_boards')
  2. Criar Workspace 'workspace-default' ("Geral", cor #38bdf8, boardIds = [todos os IDs existentes])
  3. Criar Workspaces demonstrativos inspirados no protótipo:
     - 'ws-producao' ("Produção", cor #f97316)
     - 'ws-ped' ("P&D", cor #3b82f6)
     - 'ws-gestao' ("Gestão", cor #eab308)
     - 'ws-contabilidade' ("Contabilidade", cor #22c55e)
     - 'ws-vendas' ("Vendas", cor #ec4899)
  4. Salvar 'metrik_workspaces' no localStorage
```

Essa lógica assegura que o usuário veja imediatamente uma interface rica e populada, sem que nenhuma tarefa, coluna ou configuração anterior seja impactada.
