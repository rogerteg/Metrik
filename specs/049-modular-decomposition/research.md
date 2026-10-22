# Technical Research: Decomposição de Módulos Extensos (OPP-002)

**Feature**: `049-modular-decomposition`  
**Status**: Complete  
**Date**: 2026-10-21  
**Spec**: [spec.md](./spec.md)

---

## 1. Contexto & Diagnóstico da Dívida Arquitetural

No diagnóstico da Feature 043 (System Health & Roadmap), o item **OPP-002** identificou quatro módulos centrais de interface e estado que concentram excesso de responsabilidades (God Components / Bloated Modules), excedendo 700 linhas:
- `src/components/Task.tsx`: **907 linhas**
- `src/App.tsx`: **762 linhas**
- `src/components/TaskDetailsModal.tsx`: **728 linhas**
- `src/hooks/useTaskCollection.ts`: **751 linhas**

Total acumulado: **3.148 linhas** em apenas 4 arquivos.

A meta do Roadmap é: **Nenhum módulo acima de 400 linhas sem justificativa registrada**.

---

## 2. Decisões Técnicas de Decomposição

### Decisão 1: Arquitetura de Pastas e Subcomponentes para `Task.tsx`
- **Decisão**: Criar o diretório `src/components/Task/` contendo subcomponentes atômicos com responsabilidade única:
  - `TaskCardContainer.tsx`: Wrapper draggable com refs DND, seleção visual, foco e atalhos (< 200 linhas).
  - `TaskHeader.tsx`: Título, código identificador, tag de prioridade, tag de tipo e menu de contexto (< 130 linhas).
  - `TaskBadges.tsx`: Indicadores de fluxo (Cycle Time, Lead Time, SLE, Story Points, Due Date) (< 150 linhas).
  - `TaskBlockerChips.tsx`: Chips de bloqueio, motivo, impedimentos e links de dependência (< 140 linhas).
  - `TaskChecklistSummary.tsx`: Barra de progresso de checklist e contadores (< 110 linhas).
  - `src/components/Task.tsx`: Fachada raiz que orquestra os subcomponentes e mantém 100% de retrocompatibilidade de props (`TaskProps`) (< 180 linhas).
- **Racional**: Respeita o Princípio II (Qualidade de Código & Modularidade) e mantém zero quebras de importação para quem consome `import Task from './components/Task'`.
- **Alternativas Rejeitadas**:
  - *Arquivos planos em `src/components/`*: Rejeitado para não poluir a raiz de componentes.

### Decisão 2: Arquitetura de Pastas e Seções para `TaskDetailsModal.tsx`
- **Decisão**: Criar o diretório `src/components/TaskDetailsModal/` com isolamento de seções coesas:
  - `TaskModalHeader.tsx`: Título da tarefa, ID clicável, botão de fechar e badge de salvamento/rascunho sujo (< 110 linhas).
  - `TaskModalPrimaryFields.tsx`: Seletores de coluna, responsável, estimativa, datas e tags (< 220 linhas).
  - `TaskModalDescription.tsx`: Editor de texto enriquecido, barra de atalhos Markdown, toggle de preview e ações Salvar/Descartar (< 210 linhas).
  - `TaskModalActivityTab.tsx`: Alternador de abas (Comentários vs. Histórico), lista de comentários, auditoria de diffs e formulário de novo comentário (< 230 linhas).
  - `src/components/TaskDetailsModal.tsx`: Orquestrador container mantendo o estado do formulário, os listeners de atalhos (`Ctrl+S`, `Escape`), o diálogo de proteção contra descarte acidental (`showDirtyConfirmDialog`) e listener `beforeunload` (< 240 linhas).
- **Racional**: Preserva integralmente a proteção contra perda de dados do usuário (Constituição IX) e isola o complexo editor Markdown.
- **Alternativas Rejeitadas**:
  - *Substituir seções por abas adicionais*: Rejeitado porque degradaria o layout em 2 colunas recentemente aprovado na Feature 036.

### Decisão 3: Padrão Fachada (*Facade Pattern*) para `useTaskCollection.ts`
- **Decisão**: Criar o diretório `src/hooks/taskCollection/` com sub-hooks especialistas:
  - `useTaskMutations.ts`: Criação, edição, exclusão e arquivamento de tarefas (< 180 linhas).
  - `useTaskReorderManager.ts`: Transições de coluna, ordenação manual e reordenação relativa DND (`moveTask`, `reorderTaskRelative`) (< 210 linhas).
  - `useTaskChecklistManager.ts`: Operações atômicas de subtarefas no `task.checklist` (< 130 linhas).
  - `useTaskCommentsManager.ts`: Comentários de tarefa, marcação de decisões e pinagem (< 140 linhas).
  - `src/hooks/useTaskCollection.ts`: Fachada integradora que orquestra os sub-hooks e reexporta exatamente a mesma interface pública `UseTaskCollectionReturn` (< 220 linhas).
- **Racional**: Zero alterações nos componentes consumidores (`KanbanBoard`, `TaskDetailsModal`, `App`, etc.) e zero quebras nas suítes de teste de integração.
- **Alternativas Rejeitadas**:
  - *Divisão em múltiplos hooks públicos avulsos*: Rejeitado porque forçaria refatorar mais de 15 arquivos consumidores, aumentando o risco de regressão.

### Decisão 4: Segregação da Casca da Aplicação em `App.tsx`
- **Decisão**: Criar o diretório `src/components/App/`:
  - `AppHeaderBar.tsx`: Barra superior contendo logo Metrik, seletor de quadro/squad, navegação de abas (Kanban, Analytics, Settings, Workspaces), alternador de tema e botão da Mika AI (< 230 linhas).
  - `AppDialogsContainer.tsx`: Hospedeiro de modais e gavetas globais (Novo Quadro, Nova Squad, Exportação CSV, Importação JSON, Wipe Data, Mika Drawer) (< 240 linhas).
  - `src/App.tsx`: Componente raiz simplificado, contendo apenas o estado de visão atual (`currentView`), atalhos de teclado de alto nível e composição do layout (< 250 linhas).
- **Racional**: Reduz `App.tsx` de 762 para ~250 linhas, eliminando o acúmulo de modais em meio à lógica de renderização do quadro.
- **Alternativas Rejeitadas**:
  - *Context API global para modais*: Rejeitado por violar a Constituição V (YAGNI); a extração de componentes puros com repasse de props é mais simples e direta.

### Decisão 5: Portão Automatizado de Verificação de Linhas (*Guard Test*)
- **Decisão**: Criar o teste unitário `tests/unit/moduleLineCountGuard.test.ts`.
- **Racional**: O teste inspeciona o sistema de arquivos via Node.js `fs` e calcula a quantidade de linhas dos 4 módulos alvos e de todos os novos submódulos criados, falhando se qualquer um ultrapassar 400 linhas. Garante conformidade contínua com a Constituição III.
