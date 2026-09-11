# Specification Quality Checklist: Feature 018 - CFD Avançado no Padrão Businessmap / ActionableAgile

**Feature**: `018-cfd-advanced-flow-analytics`  
**Date**: 2026-09-11  
**Status**: Validated & Converged  

---

## 1. Content Completeness & Benchmark Fidelity
- [x] **Problem Definition & Motivation**: O diagrama de fluxo cumulativo do Metrik precisa evoluir para o padrão internacional (ActionableAgile / Businessmap) para permitir inspeção analítica de gargalos e medição contínua de WIP e Lead Time.
- [x] **Benchmark Model & Reference**:
  - Medição vertical de WIP com badge de quantidade de itens.
  - Medição horizontal de Lead Time com seta bidirecional e badge de dias.
  - Anotação de gargalo em expansão (*A queue column expanding*).
  - Painel lateral com datas `Requested after` e `Finished before`.
  - Sub-gráfico inferior de navegação temporal (*Timeline Scrubber*).
- [x] **Clarifications Recorded**: Formalizadas 2 decisões em `spec.md` (painel retrátil à esquerda e inspeção interativa ao pousar o mouse).
- [x] **User Stories com Racional e Casos de Teste (P1/P2)**:
  - US1 (P1): Inspeção Dual Interativa de Lead Time e WIP no CFD.
  - US2 (P1): Barra Lateral de Filtros Temporais e Configurações de Workflow.
  - US3 (P2): Timeline Scrubber / Navegador de Zoom Inferior.
- [x] **Functional Requirements (FR-001 a FR-006)**:
  - FR-001: Medição dinâmica vertical de WIP e horizontal de Lead Time.
  - FR-002: Detecção e tag de gargalo em expansão (*A queue column expanding*).
  - FR-003: Painel retrátil à esquerda com filtros de data inicial, final e seletor de colunas.
  - FR-004: Mini-timeline scrubber com alças arrastáveis de zoom.
  - FR-005: Atualização coerente no `AnalyticsDashboard.tsx` (visão geral consolidada e aba focada `cfd`).
  - FR-006: Manutenção de 100% dos 213 testes unitários e performance de renderização vetorial.

---

## 2. Technical & Scope Integrity
- [x] Preserva todas as regras do Kanban Board (fluxo unidirecional, bloqueios, limite de WIP e âncora fixa).
- [x] Respeita o Princípio V da Constituição (Simplicidade & YAGNI) implementando SVG vetorial nativo sem dependências pesadas de terceiros.
- [x] Mantém compatibilidade com a Feature 017 (Cycle Time Scatter Plot com Percentis e Navegação por Abas).
- [x] Design escuro e harmonioso com o tema dark slate do Metrik.
