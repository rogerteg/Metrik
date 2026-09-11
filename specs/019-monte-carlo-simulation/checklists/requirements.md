# Specification Quality Checklist: Feature 019 - Simulações de Monte Carlo no Gerenciamento de Projetos

**Feature Branch**: `019-monte-carlo-simulation`  
**Date**: 2026-09-11  
**Status**: Ready for Clarification / Technical Planning  

---

## 1. Completude da Especificação & Fundamentação Teórica

- [x] **Definição de Problema e Motivação**: O planejamento ágil tradicional sofre com estimativas determinísticas falhas; a Simulação de Monte Carlo traz previsões probabilísticas empíricas baseadas na distribuição real de Throughput do Metrik.
- [x] **Resolução das Duas Questões Fundamentais do Fluxo Lean**:
  - [x] **"How Many" (Capacidade para Prazo Fixo)**: Quantos itens conseguimos entregar até a data $D$ ou em $N$ dias com 50%, 85% e 95% de probabilidade.
  - [x] **"When" (Previsão de Data para Escopo Fixo)**: Em que data ou em quantos dias concluiremos $X$ itens de backlog com 50%, 85% e 95% de probabilidade.
- [x] **Rastreabilidade e Casos de Teste das User Stories**:
  - [x] **US1 (P1)**: Simulação de Prazo Fixo ("How Many?") com testes independentes especificados.
  - [x] **US2 (P1)**: Simulação de Escopo Fixo ("When?") com testes independentes e atalho de backlog aberto.
  - [x] **US3 (P2)**: Visualização Gráfica do Histograma e Curva Cumulativa (CDF) em SVG nativo.
  - [x] **US4 (P2)**: Seleção de Janela Histórica (30/60/90 dias ou custom) e iterações (10.000 ensaios).
- [x] **Requisitos Funcionais Rigorosos (FR-001 a FR-009)**:
  - [x] FR-001: Extração correta de Throughput diário com preservação de dias vazios (valor zero).
  - [x] FR-002: Amostragem aleatória uniforme com reposição (*Bootstrap Sampling*).
  - [x] FR-003: Cálculo e derivação decrescente de percentis para "How Many".
  - [x] FR-004: Acúmulo de dias e conversão em datas de calendário para "When".
  - [x] FR-005: Integração da nova aba `Simulação Monte Carlo` no `AnalyticsNavHeader.tsx` e tela dedicada.
  - [x] FR-006: Estado vazio didático para boards com histórico insuficiente (< 5 dias registrados).
  - [x] FR-007: Performance de computação $\le 100\text{ ms}$ para 10.000 ensaios.
  - [x] FR-008: Gráficos 100% SVG nativo responsivo com suporte a temas.
  - [x] FR-009: Gerador pseudoaleatório com semente configurável para testes unitários determinísticos.

---

## 2. Conformidade Constitucional Metrik (v1.2.0)

- [x] **Princípio I (Core Kanban First & Minimalista)**: A funcionalidade complementa o analytics existente sem poluir a visão operacional do Kanban Board.
- [x] **Princípio II (TypeScript Estrito e Zero `any`)**: Todas as assinaturas, estados de simulação e interfaces estatísticas formalmente tipadas.
- [x] **Princípio III (Estado Centralizado Previsível)**: Não muta as tarefas do board nem o estado dos cards; lê o histórico de forma imutável e pura.
- [x] **Princípio IV (Testes Automatizados Rigorosos)**: Mínimo de 10 testes unitários específicos previstos com semente determinística fixa (Vitest). Preservação dos 219 testes pré-existentes.
- [x] **Princípio V (Simplicidade & YAGNI)**: Gráficos vetoriais em SVG nativo, sem bibliotecas pesadas como Chart.js, D3 ou bibliotecas externas de simulação.
- [x] **Princípio VI (Foco em Eficiência e Previsibilidade de Fluxo)**: Foco total nas métricas de throughput e tempo de ciclo (Daniel Vacanti / Padrão NIST).
- [x] **Princípio VII (Independência Estrita de Marca)**: Higienização e conformidade total. Zero menções a nomes de ferramentas de terceiros no código, labels de tela, CSS ou documentação.

---

## 3. Qualidade Técnica & Casos de Borda

- [x] Tratamento de dias sem conclusão de cartões (fins de semana / feriados / dias sem entrega) computados explicitamente como Throughput = 0 para evitar superestimação irrealista.
- [x] Validação de entradas de usuário (datas no passado, quantidade negativa de itens, prazos zerados).
- [x] Feedback visual e estado de carregamento/cálculo instantâneo sem congelar a thread principal.
- [x] Projeção de datas reais no calendário respeitando fusos horários locais.
