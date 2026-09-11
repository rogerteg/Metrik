# Specification Quality Checklist: Feature 020 - Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

**Feature Branch**: `020-wip-aging-chart`  
**Date**: 2026-09-11  
**Status**: Clarified & Ready for Implementation Plan  

---

## 1. Content Completeness & Benchmark Fidelity

- [x] **Definição de Problema e Motivação Lean**: Análise proativa e em tempo real dos itens ativos no fluxo de trabalho (ao contrário do scatter plot de tempo de ciclo que olha apenas para o passado), permitindo agir antes da quebra de acordos de nível de serviço (SLE).
- [x] **Fidelidade à Imagem de Referência do Aging WIP Chart**:
  - [x] Eixo horizontal com as colunas/etapas em ordem sequencial com contagem de `WIP: N` no topo de cada coluna.
  - [x] Eixo vertical `Age (Day)` marcando a idade em dias decorridos.
  - [x] Bandas de risco por coluna com cores escalonadas (Verde, Amarelo, Laranja e Vermelho) baseadas nos percentis históricos (50%, 70%, 85%, 95%).
  - [x] Pontos individuais (`Aging Work Items`) com coordenadas precisas de idade e coluna.
  - [x] Painel esquerdo de filtros (`Dataset configuration`) e painel direito de controles (`Controls for this Chart`).
- [x] **Decisões de Clarificação Consolidadas**:
  - [x] **Drawers Retráteis Duais**: Drawer colapsável à esquerda para *Dataset configuration* e drawer retrátil à direita para *Controls for this Chart*, garantindo 100% da área útil para o canvas SVG.
  - [x] **Pace Percentiles por Etapa**: Percentis calculados especificamente para a permanência histórica de cada coluna individualmente, com fallback automático gracioso para o percentil global de ciclo caso uma coluna específica possua poucas amostras históricas (< 3 tarefas).
- [x] **User Stories com Racional e Casos de Teste Independentes**:
  - [x] **US1 (P1)**: Visualização de Itens Ativos em Colunas com Bandas de Percentil.
  - [x] **US2 (P1)**: Inspeção Detalhada de Aging Work Items com Tooltip e Destaque de Bloqueios.
  - [x] **US3 (P2)**: Painel de Controles e Filtros de Percentil (50%, 70%, 85%, 95%).
  - [x] **US4 (P2)**: Contagem de WIP por Coluna e Data de Referência "As of Date".
- [x] **Requisitos Funcionais Rigorosos (FR-001 a FR-009)**:
  - [x] FR-001: Cálculo de idade em dias corridos com precisão decimal.
  - [x] FR-002: Cálculo dos percentis de ritmo histórico por etapa via NIST linear interpolation.
  - [x] FR-003: Alinhamento das colunas ativas do board no eixo X.
  - [x] FR-004: Renderização das bandas coloridas de fundo por coluna.
  - [x] FR-005: Plotagem dos pontos com diferenciação para cartões bloqueados.
  - [x] FR-006: Badge `WIP: N` no topo de cada coluna.
  - [x] FR-007: Adição da aba `wip` no `AnalyticsNavHeader.tsx` e `AnalyticsDashboard.tsx`.
  - [x] FR-008: Painéis laterais colapsáveis de configuração e controles de percentil.
  - [x] FR-009: Estado vazio didático para boards sem WIP ativo ou sem histórico concluído.

---

## 2. Conformidade Constitucional Metrik (v1.2.0)

- [x] **Princípio I (Core Kanban First & Minimalista)**: Visualização analítica focada em métricas de fluxo sem poluir o quadro Kanban operacional.
- [x] **Princípio II (TypeScript Estrito e Zero `any`)**: Todas as interfaces de dados de envelhecimento, geometria SVG e filtros formalmente tipadas.
- [x] **Princípio III (Estado Centralizado Previsível)**: Leitura pura e imutável das tarefas do board ativo.
- [x] **Princípio IV (Testes Automatizados Rigorosos)**: Mínimo de 10 novos testes unitários planejados; garantia de integridade dos 234 testes existentes.
- [x] **Princípio V (Simplicidade & YAGNI)**: Renderização vetorial em SVG nativo responsivo, sem bibliotecas pesadas de gráficos de terceiros.
- [x] **Princípio VI (Foco em Eficiência e Previsibilidade de Fluxo)**: Implementação canônica da literatura Lean (Daniel Vacanti, Frank Vega, Lei de Little).
- [x] **Princípio VII (Independência Estrita de Marca)**: Higienização rigorosa. Nenhuma menção a produtos concorrentes; nomenclatura 100% científica e autônoma do Metrik.

---

## 3. Qualidade Técnica & Casos de Borda

- [x] Tratamento de tarefas recém-criadas (idade < 1 dia, ex: 0.1 a 0.5 dias).
- [x] Tratamento de colunas sem nenhum cartão em andamento (`WIP: 0`).
- [x] Tarefas bloqueadas com destaque visual diferenciado para atrair atenção imediata.
- [x] Responsividade visual para boards com muitas colunas (scroll horizontal gracioso no container do SVG).
