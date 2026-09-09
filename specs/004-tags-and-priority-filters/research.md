# Research: Etiquetas (Tags), Prioridades e Mecanismo de Filtragem

**Feature**: `004-tags-and-priority-filters`  
**Date**: 2026-09-09  
**Status**: Completed  

---

## 1. Contexto & Desafios Técnicos

Com a evolução do Metrik (quadro multi-coluna, limites de WIP, métricas de fluxo e drag-and-drop), usuários passam a acumular dezenas de tarefas ativas simultaneamente. Para gerenciar volume e complexidade sem sobrecarga cognitiva, tornam-se indispensáveis:
1. **Níveis de Prioridade Visuais**: Diferenciação imediata de urgência operacional.
2. **Etiquetas (Tags)**: Categorização multidimensional (ex: `Bug`, `Feature`, `DevOps`).
3. **Barra de Filtragem Instantânea**: Busca em tempo real e filtros combinados por tag e prioridade.

---

## 2. Decisões Arquiteturais e Padrões de Design

### 2.1. Representação e Cores das Prioridades
Definimos 4 níveis padronizados com hierarquia cromática do design system:
- **`urgent`**: Vermelho Carmesim (`#f43f5e`) — Badge com dot pulsante ou destaque de alerta máximo.
- **`high`**: Laranja Âmbar (`#f97316`) — Badge em tom quente destacando importância.
- **`medium`**: Amarelo Ouro (`#eab308`) — Badge neutro-ativo padrão.
- **`low`**: Azul Ardósia (`#38bdf8`) — Badge discreto para demandas de baixa criticidade.

*Interação*: Um seletor de prioridade discreto no cartão permite alternar o nível com 1 ou 2 cliques ou redefinir para neutro.

### 2.2. Algoritmo Determinístico de Cores para Tags (Zero Configuração)
Em vez de forçar o usuário a escolher cores para cada tag manualmente em formulários lentos:
- Implementaremos uma função pura de hash de string (`getTagColor(tag: string)`) que mapeia o nome da tag para uma das 6 cores da paleta glassmorphism do Metrik:
  - `blue`, `emerald`, `amber`, `purple`, `rose`, `cyan`.
- A mesma tag ("Bug") sempre receberá a mesma cor ("rose") em qualquer cartão do quadro automaticamente.

### 2.3. Pipeline Reativo de Filtros (`useBoardFilters`)
Para manter o princípio da responsabilidade única (Clean Architecture / Uncle Bob):
- O hook `useTaskCollection` continua cuidando exclusivamente dos dados reais persistidos em `localStorage`.
- Um hook dedicado `useBoardFilters(board)` gerencia o estado efêmero de filtragem:
  - `searchQuery: string`
  - `priorityFilter: PriorityLevel | 'all'`
  - `selectedTags: string[]`
- A função de filtragem roda em um `useMemo` com predicado cumulativo (AND lógico):
  ```typescript
  task.title.toLowerCase().includes(sanitizedQuery) &&
  (priorityFilter === 'all' || task.priority === priorityFilter) &&
  (selectedTags.length === 0 || selectedTags.some(t => task.tags?.includes(t)))
  ```
- **Integridade Estatística Lean**: A barra de métricas (`MetricsBar`) continua recebendo `board[ColumnType.COMPLETED]` não filtrado, garantindo que métricas de vazão (Throughput) e Lead Time reflitam a realidade de engenharia da equipe, enquanto o quadro exibe a visão filtrada.

---

## 3. Matriz de Compatibilidade Retroativa

| Cenário de Dados | Comportamento do Metrik |
|---|---|
| **Tarefa legada sem `priority`** | Renderiza sem badge de prioridade ou com estado neutro |
| **Tarefa legada sem `tags`** | `task.tags = []` tratado defensivamente, sem erros de `undefined` |
| **Tarefas filtradas (ocultas) e Drag-and-Drop** | Tarefas visíveis mantêm o DnD operacional sem colapsar a ordenação |
| **Persistência `localStorage`** | Campos opcionais `priority` e `tags` serializados no mesmo `metrik_kanban_tasks` |

---

## 4. Conclusão da Pesquisa

A separação do pipeline de filtros através de um hook puro de UI, combinada com cores determinísticas para tags e tokens estritos de prioridade, entrega valor máximo sem inflar o bundle e sem qualquer quebra de dados preexistentes.
