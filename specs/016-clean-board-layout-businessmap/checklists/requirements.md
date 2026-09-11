# Specification Quality Checklist: Feature 016 - Clean Board Layout (Businessmap)

**Feature**: `016-clean-board-layout-businessmap`  
**Date**: 2026-09-11  
**Status**: Passed / Ready for Planning  

## 1. Content Completeness
- [x] **Problem Definition & Motivation**: O problema de densidade visual e ruído gráfico com novos campos foi claramente contextualizado.
- [x] **Inspiration Model (Businessmap)**: As características de referência (alto signal-to-noise ratio, superfícies escuras, bordas finas, hierarquia de cards e grid consistente) estão formalizadas.
- [x] **Clarifications Record**: Sessão de perguntas e respostas registrada com 3 decisões essenciais (toggle inline de QA, faixa lateral de 3-4px para cor de coluna, botões de ação com opacidade 0.6 persistente e 1.0 no hover).
- [x] **User Stories com Prioridades e Racional**:
  - US1 (P1): Grid e Colunas do Board estilo Businessmap.
  - US2 (P1): Cartões de Tarefa com Visual Clean e Organização de Metadados.
  - US3 (P2): Estados Interativos e Feedback de Drag-and-Drop Harmoniosos.
- [x] **Independent Tests**: Cada User Story define um teste isolado e verificável.
- [x] **Acceptance Scenarios**: Cenários estruturados em formato Given-When-Then para cada caso de uso.

## 2. Technical & Aesthetic Scoping
- [x] **Functional Requirements (FR-001 a FR-009)**:
  - FR-001: Cabeçalho unificado de coluna com pill compacto de WIP.
  - FR-002: Fundo neutro escuro com alto contraste e scrollbar refinada.
  - FR-003: Superfície moderna de card com contorno sutil e sombra suave.
  - FR-004: Linha única de cabeçalho do card (prioridade + badges compactas de bloqueio/estagnação).
  - FR-005: Micro-boxes de Critérios de Aceitação e Cenários de Testes com toggle de expandir/recolher inline.
  - FR-006: Rodapé enxuto em linha para tags, prazo e lead time.
  - FR-007: Faixa lateral sutil da cor da coluna (border-left 3px/4px).
  - FR-008: Botões de adicionar coluna/tarefa refinados.
  - FR-009: Compatibilidade estrita e não-regressão de regras de negócio.
- [x] **Design Tokens & Paleta**: Tokens definidos para fundos (`#0b0f19`, `#131b2e`, `#1e293b`), bordas (`rgba(255,255,255,0.08)`) e tipografia.
- [x] **Acessibilidade & Performance**: Contraste WCAG AA e transições 60fps especificadas.

## 3. Scope Integrity & Backward Compatibility
- [x] Regra de fluxo estritamente unidirecional preservada.
- [x] Trava de movimentação de tarefas bloqueadas mantida.
- [x] Proteção da primeira coluna fixa mantida.
- [x] Herança dinâmica de cores do quadro para o gráfico CFD preservada.
- [x] 100% da suíte de 202 testes unitários passando.
- [x] Build de produção (`tsc && vite build`) compilando com sucesso.
