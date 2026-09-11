# Specification Quality Checklist: Feature 017 - Cycle Time Scatter Plot & Analytics Navigation

**Feature**: `017-cycle-time-scatter-plot-percentiles`  
**Date**: 2026-09-11  
**Status**: Validated & Converged  

---

## 1. Content Completeness
- [x] **Problem Definition & Motivation**: A necessidade de elevar os gráficos analíticos do Metrik ao padrão internacional da indústria (ActionableAgile / Daniel Vacanti / Businessmap) foi fundamentada com base direta na imagem enviada pelo usuário.
- [x] **Benchmark Model & Principles**:
  - Padrão internacional de dispersão de tempo de ciclo (*Cycle Time Scatter Plot*).
  - Determinação probabilística de prazos e Service Level Expectations (SLE) baseados em percentis (50%, 85%, 95%).
  - Separação analítica por abas temáticas.
  - Painel de controles dedicados (*Controls for this Chart*).
- [x] **Clarifications Recorded**: As 3 decisões de design da sessão de clarificação foram registradas em `spec.md` (percentis 50%, 85%, 95%; painel lateral retrátil à direita; barra de abas integrada dentro da visão Analytics).
- [x] **User Stories com Racional e Casos de Teste (P1/P2)**:
  - US1 (P1): Visualização do Scatter Plot com Linhas de Percentis Estatísticos.
  - US2 (P1): Barra de Navegação de Métricas & Sub-Menu Cycle Time.
  - US3 (P2): Painel de Controles e Destaque de Itens Bloqueados.
- [x] **Functional Requirements (FR-001 a FR-008)**:
  - FR-001: Utilitário de cálculo de percentis (`calculatePercentile`).
  - FR-002: Renderização vetorial SVG de pontos com data de conclusão e cycle time em dias.
  - FR-003: Projeção de linhas horizontais de percentil (50%, 85%, 95%) pontilhadas e coloridas com labels.
  - FR-004: Barra de abas de navegação analítica (`AnalyticsNavHeader`).
  - FR-005: Painel lateral de controles com toggles para cada percentil e filtro de bloqueados.
  - FR-006: Tooltips interativos ricos com título, datas e status de bloqueio.
  - FR-007: Respeito à definição de tarefas concluídas (coluna `done` ou `completedAt`).
  - FR-008: 100% de retrocompatibilidade com a suíte de testes.
- [x] **Requisitos Não-Funcionais & Estéticos**: Paleta dark slate, tipografia monospace para rótulos, performance para 1.000 pontos e acessibilidade WCAG AA.

---

## 2. Technical & Scope Integrity
- [x] Preserva todas as regras do quadro Kanban (fluxo unidirecional, bloqueios de tarefas, limites de WIP e âncora fixa).
- [x] Visão do `Dashboard` consolidado atualizada de forma harmoniosa com o novo `CycleTimeScatterPlot`, preservando o grid e a experiência de usuário.
- [x] 100% da suíte de testes unitários passando (**213 testes em 34 arquivos**).
- [x] Compilação de produção (`tsc && vite build`) validada com zero erros e bundle otimizado.
