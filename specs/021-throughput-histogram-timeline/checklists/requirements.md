# Specification Quality Checklist: Feature 021 - Gráfico de Vazão Avançado com Histograma e Linha do Tempo

**Feature Branch**: `021-throughput-histogram-timeline`  
**Date**: 2026-09-11  
**Status**: Clarified & Approved for Implementation (Ready for Tasks / Implementation)  

---

## 1. Content Completeness & Benchmark Fidelity

- [x] **Definição de Problema e Motivação Lean**: Evoluir o gráfico simplificado de barras de 14 dias para um instrumento profissional duplo de análise de vazão (Throughput Histogram + Daily Run Chart) para diagnóstico de capacidade e estabilidade do time.
- [x] **Fidelidade à Imagem de Referência do Throughput Histogram & Timeline**:
  - [x] Histograma superior com barras azuis de frequência (# de dias) por volume diário de itens concluídos (0, 1, 2, 3, 4, 5...).
  - [x] Linhas verticais pontilhadas no topo para percentis 50%, 70%, 85% e 95%.
  - [x] Gráfico inferior de linha do tempo (*Daily Throughput*) com pontos conectados por linha ao longo dos meses.
  - [x] Tooltips interativos de frequência e datas.
- [x] **User Stories com Racional e Casos de Teste Independentes**:
  - [x] **US1 (P1)**: Histograma de Frequência de Vazão com Percentis.
  - [x] **US2 (P1)**: Gráfico Sequencial de Vazão Diária (Run Chart / Linha do Tempo).
  - [x] **US3 (P2)**: Seletor de Período e Resumo Estatístico de Vazão.
- [x] **Requisitos Funcionais Rigorosos (FR-001 a FR-008)**:
  - [x] FR-001: Extração da série diária completa com dias vazios mapeados como zero.
  - [x] FR-002: Construção do histograma de contagem de dias por valor de vazão.
  - [x] FR-003: Projeção de percentis NIST no topo do histograma.
  - [x] FR-004: Renderização do Daily Throughput Run Chart inferior.
  - [x] FR-005: Gráficos 100% SVG vetorial nativo responsivo.
  - [x] FR-006: Tooltips interativos flutuantes.
  - [x] FR-007: Integração na aba `throughput` do `AnalyticsNavHeader.tsx` e `AnalyticsDashboard.tsx`.
  - [x] FR-008: Estado vazio didático para boards sem tarefas concluídas.

---

## 2. Conformidade Constitucional Metrik (v1.2.0)

- [x] **Princípio I (Core Kanban First & Minimalista)**: Funcionalidade concentrada na visão analítica sem poluir o board Kanban.
- [x] **Princípio II (TypeScript Estrito e Zero `any`)**: Interfaces de dados de vazão, histograma e série temporal formalmente tipadas.
- [x] **Princípio III (Estado Centralizado Previsível)**: Leitura pura e imutável das tarefas do board ativo.
- [x] **Princípio IV (Testes Automatizados Rigorosos)**: Mínimo de 8 novos testes planejados; preservação dos 246 testes existentes.
- [x] **Princípio V (Simplicidade & YAGNI)**: Renderização vetorial nativa em SVG puro, sem dependências de Chart.js ou D3.
- [x] **Princípio VI (Foco em Eficiência e Previsibilidade de Fluxo)**: Foco total nas métricas empíricas de Throughput (Daniel Vacanti, Frank Vega).
- [x] **Princípio VII (Independência Estrita de Marca)**: Nomenclatura 100% científica e neutra. Zero menções a marcas concorrentes.

---

## 3. Qualidade Técnica & Casos de Borda

- [x] Tratamento de dias com zero entregas (essencial para capturar fins de semana e dias ociosos sem viés).
- [x] Seleção de janelas flexíveis (14, 30, 60, 90 dias ou todo o histórico).
- [x] Picos atípicos de vazão (escalonamento dinâmico do eixo Y).
- [x] Responsividade visual em diferentes resoluções.
