# Implementation Plan: Distribuição e Categorização dos Gráficos Analíticos de Fluxo

**Branch**: `030-categorized-flow-analytics` | **Date**: 2026-09-17 | **Spec**: [spec.md](spec.md)

---

## Summary

Esta feature redistribui os gráficos e telemetrias de fluxo do Metrik em 8 categorias temáticas navegáveis (*Dashboard*, *Cycle Time*, *Throughput*, *WIP*, *Flow*, *Blockers*, *SLEs*, *Forecasting*). A nova arquitetura elimina a sobrecarga de visualização única contínua, introduz cartões de síntese executiva (*Metric Summary Cards*) baseados em Expectativas de Nível de Serviço (SLEs P85) e disponibiliza uma gaveta lateral retrátil para configuração do conjunto de dados (*Dataset Configuration*), respeitando integralmente o modelo Local-First (Princípio VIII) e a independência de marca (Princípio VII da Constituição).

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19  
**Primary Dependencies**: React 19, `@supabase/supabase-js`, `uuid`, Vanilla CSS (Metrik Design System)  
**Storage**: `localStorage` (`metrik_dataset_filter`, `metrik_board_policies`) com sincronização opcional no Supabase PostgreSQL  
**Testing**: Vitest 3.0+ com `@testing-library/react` e `@testing-library/jest-dom`  
**Target Platform**: Navegadores Web Modernos (Desktop e Mobile responsivo)  
**Project Type**: Single Page Application (SPA) / Local-First Web App  
**Performance Goals**: Tempo de transição entre categorias < 50ms; recálculo estatístico de percentis e SLE em < 20ms para 1.000 tarefas  
**Constraints**: Zero vazamento de marcas de terceiros (Princípio VII); funcionamento autônomo offline no navegador (Princípio VIII)  
**Scale/Scope**: 8 categorias analíticas, 2 sub-visões de ciclo, 2 sub-visões de bloqueios, suporte a 5.000+ tarefas históricas  

---

## Constitution Check

| Princípio Constitucional | Status | Justificativa / Mitigação |
|---|---|---|
| **I. Specification-Driven Development** | ✅ **APROVADO** | `spec.md` formal criada previamente; artefatos de design (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) concluídos. |
| **II. Code Quality & Modularity** | ✅ **APROVADO** | Componentes desacoplados e de responsabilidade única (`AnalyticsNavHeader`, `DashboardSummaryCards`, `DatasetConfigurationDrawer`, `BlockerAnalyticsView`, `SleAnalyticsView`). |
| **III. Automated Verification & Testing** | ✅ **APROVADO** | Suíte de testes unitários no Vitest cobrindo cálculos puros e renderização de componentes com `npm run test` e `npm run build`. |
| **IV. Observability & Structured Logging** | ✅ **APROVADO** | Logs diagnósticos estruturados com prefixo estável `[Metrik]` para anomalias estatísticas ou filtros vazios. |
| **V. Simplicity & YAGNI** | ✅ **APROVADO** | Sem bibliotecas de roteamento adicionais ou dependências externas pesadas; aproveitamento direto do estado reativo do React. |
| **VI. Analytical Reasoning Pre-Task Creation** | ✅ **APROVADO** | Os 6 modelos analíticos serão obrigatoriamente formalizados antes da geração da lista de tarefas no comando `/speckit-tasks`. |
| **VII. Brand Independence & Clean Identity** | ✅ **APROVADO** | Terminologia estritamente científica e proprietária (*Cumulative Flow Diagram*, *Cycle Time Scatter Plot*, *Service Level Expectations*, *WIP Aging*, *Monte Carlo Simulation*). Zero vazamento de marcas externas. |
| **VIII. Local-First Sovereignty** | ✅ **APROVADO** | Cálculos analíticos executados no cliente sobre o `localStorage`, com suporte transparente à sincronização do Supabase. |

---

## Project Structure

### Documentation (this feature)

```text
specs/030-categorized-flow-analytics/
├── spec.md              # Especificação de requisitos funcionais
├── plan.md              # Este plano de arquitetura e implementação
├── research.md          # Pesquisa técnica e decisões de design (Fase 0)
├── data-model.md        # Modelagem de dados, tipos e entidades (Fase 1)
├── quickstart.md        # Guia rápido de validação e cenários ponta a ponta (Fase 1)
├── contracts/           # Contratos de interfaces e funções puras (Fase 1)
│   └── analytics-distribution.contract.md
├── checklists/          # Checklists de qualidade da especificação
│   └── requirements.md
└── tasks.md             # Tarefas atômicas de implementação (Fase 2 - gerado via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── analytics.ts                           # [NEW] Tipos para categorias, SLE, BlockerCluster e DatasetFilter
├── utils/
│   ├── sleCalculator.ts                       # [NEW] Funções puras de cálculo de SLE e conformidade de nível de serviço
│   └── blockerAnalytics.ts                    # [NEW] Funções de agrupamento (clustering) e dinâmica temporal de bloqueios
├── components/
│   ├── AnalyticsNavHeader.tsx                 # [MODIFY] Atualização com as 8 categorias, submenus suspensos e gatilho da gaveta
│   ├── AnalyticsDashboard.tsx                 # [MODIFY] Orquestração da distribuição das 8 categorias analíticas
│   ├── DashboardSummaryCards.tsx              # [NEW] Cartões de síntese executiva do Dashboard (SLE P85, WIP, Vazão)
│   ├── DatasetConfigurationDrawer.tsx         # [NEW] Gaveta retrátil de filtros de amostragem (14d, 30d, 90d, custom)
│   ├── SleAnalyticsView.tsx                   # [NEW] Visão detalhada de conformidade de Nível de Serviço (SLEs)
│   ├── BlockerAnalyticsView.tsx               # [NEW] Visão especializada de bloqueios (Clustering vs. Dynamics)
│   └── Analytics.css                          # [MODIFY] Estilização responsiva do Metrik Design System para novas abas e gaveta
tests/
└── unit/
    ├── sleCalculator.test.ts                  # [NEW] Testes unitários para cálculo de percentil e conformidade SLE
    ├── blockerAnalytics.test.ts               # [NEW] Testes unitários para agrupamento de motivos e impacto de bloqueio
    ├── DashboardSummaryCards.test.tsx         # [NEW] Testes de renderização dos cartões de síntese executiva
    └── AnalyticsNavHeader.test.tsx            # [NEW/MODIFY] Testes de navegação entre as 8 categorias e submenus
```

---

## Phases

### Phase 0: Outline & Research *(Concluída)*
- [x] Resolução de todas as decisões técnicas em `research.md`.
- [x] Avaliação de riscos, trade-offs e premissas.

### Phase 1: Design & Contracts *(Concluída)*
- [x] Modelagem de entidades e tipos em `data-model.md`.
- [x] Definição de contratos de componentes e funções puras em `contracts/analytics-distribution.contract.md`.
- [x] Elaboração do guia de validação ponta a ponta em `quickstart.md`.
- [x] Reavaliação e confirmação da conformidade constitucional.

### Phase 2: Tasks & Implementação *(Próxima Fase)*
- [ ] Executar `/speckit-tasks` para decomposição em tarefas atômicas executáveis precedidas pelos **Modelos de Raciocínio Analítico** (Constitution VI).
