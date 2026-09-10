# Implementation Plan: Feature 015 — Governança Visual, Fluxo Unidirecional, Estagnação e CFD Dinâmico

**Branch**: `main` | **Date**: 2026-09-10 | **Spec**: [specs/015-visual-governance-and-dynamic-cfd/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/015-visual-governance-and-dynamic-cfd/spec.md)

## Summary
Documentação técnica e plano arquitetural consolidado para as capacidades recentes implementadas no Metrik:
- Trava de primeira coluna e desbloqueio de reordenação nas demais.
- Bloqueio rígido de movimentos retrógrados para garantir fluxo estritamente unidirecional.
- Personalização de paleta por coluna com herança visual direta nos cartões.
- Detecção e destaque de tarefas estagnadas (cartão marrom) com campos explícitos de início/fim (`startedAt` e `completedAt`).
- Paleta visual *clean* nos gráficos analíticos e sincronização em tempo real das ondas do CFD com as cores das colunas do quadro.
- Branding oficial Metrik no cabeçalho e favicon.

## Technical Context
- **Linguagem & Framework**: TypeScript, React 18, Vite.
- **Armazenamento**: LocalStorage nativo com persistência desacoplada em hooks (`useTaskCollection`, `useBoardFilters`).
- **Arquitetura Visual**: CSS puro com variáveis temáticas (Glassmorphism), zero dependências de bibliotecas de terceiros para gráficos (SVG/CSS nativos).
- **Cobertura de Testes**: Vitest + React Testing Library com 193 testes automatizados cobrindo transições de estado, reordenação, limites e renderização.

## Project Structure & Key Files
- `src/types/kanban.ts`: Tipos `TaskModel`, `ColumnModel`, utilitário `getDefaultColumnColor`, `isTaskStagnant` e mensagens de aviso.
- `src/hooks/useTaskCollection.ts`: Lógica de transição, bloqueio estrito de sentido inverso (`targetColIndex < sourceColIndex`), reordenação de colunas (trava na coluna 0).
- `src/components/Column.tsx`: Seletor de cores da coluna no cabeçalho.
- `src/components/Task.tsx`: Renderização do cartão com herança de cor da coluna e classe `.card-stagnant` quando estagnado.
- `src/components/TaskDetailsModal.tsx`: Edição e exibição de data/hora de início e fim da tarefa.
- `src/components/charts/CumulativeFlowChart.tsx`: Renderização de ondas dinâmicas por etapa usando `getDefaultColumnColor(col)`.
- `src/components/Analytics.css`: Estilização *clean* de Throughput e Lead Time, modal de expansão.
