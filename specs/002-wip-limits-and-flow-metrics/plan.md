# Implementation Plan: 002-wip-limits-and-flow-metrics

**Branch**: `002-wip-limits-and-flow-metrics` | **Date**: 2026-09-08 | **Spec**: [specs/002-wip-limits-and-flow-metrics/spec.md](spec.md)

**Input**: Feature specification from `/specs/002-wip-limits-and-flow-metrics/spec.md`

---

## Summary

Implementação das capacidades nucleares de gestão de fluxo do Metrik (Fase 2):
1. **Limites de WIP (Work in Progress)** por coluna com edição inline no cabeçalho e sinalização visual de sobrecarga (*Soft WIP Limit*).
2. **Métricas de Fluxo Automáticas**: rastreamento de timestamps (`createdAt`, `startedAt`, `completedAt`) para cálculo de **Lead Time** e **Cycle Time** exibidos em cada cartão concluído.
3. **Barra de Métricas do Quadro (Metrics Bar)**: painel superior com médias de fluxo e *throughput* em tempo real.
4. **Persistência Reativa**: armazenamento independente no `localStorage` sob a chave `metrik_column_wip_limits`, preservando total compatibilidade com os dados existentes da Fase 1.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19  
**Primary Dependencies**: Vite 6, Emotion / Vanilla CSS tokens, `uuid` (v4)  
**Storage**: Web Storage API (`localStorage` sob a chave `metrik_column_wip_limits` para WIP e `metrik_kanban_tasks` para tarefas)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Navegadores Web Modernos (Desktop & Mobile)  
**Project Type**: Single Page Web Application (SPA)  
**Performance Goals**: Renderização da barra de métricas < 5ms via memoização (`useMemo`); resposta de edição de limite < 16ms (60 FPS)  
**Constraints**: 100% offline-first; zero dependências externas para cálculo e formatação de datas (código puro e leve)  
**Scale/Scope**: Suporte a cálculo instantâneo de métricas com até 1.000 cartões no histórico local  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Specification-Driven Development**: **PASS** — Segue a precedência estrita: `constitution.md` ➔ `spec.md` ➔ `clarify` ➔ `plan.md` ➔ `tasks.md` antes de qualquer alteração de código.
- **II. Code Quality & Modularity**: **PASS** — Arquitetura desacoplada: novo hook `useWipLimits`, hook `useFlowMetrics`, componente `MetricsBar`, e utilitários puros `timeFormatters.ts`.
- **III. Automated Verification & Testing**: **PASS** — Testes unitários para cálculos de tempo, transições com timestamps, limites de WIP e componentes visuais.
- **IV. Observability & Structured Logging**: **PASS** — Logs defensivos em console para validação de limites e recuperação de storage.
- **V. Simplicity & YAGNI**: **PASS** — Formatador de tempo puro (sem bibliotecas externas pesadas); política de Soft Limit sem bloqueio coercitivo.
- **VI. Analytical Reasoning Pre-Task Creation**: **PASS** — O comando `/speckit-tasks` aplicará obrigatoriamente os 6 modelos analíticos prévios antes de emitir as tarefas.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-wip-limits-and-flow-metrics/
├── spec.md              # Especificação de requisitos funcionais e critérios de aceitação
├── plan.md              # Este plano de arquitetura técnica
├── research.md          # Decisões técnicas e trade-offs avaliados
├── data-model.md        # Modelos TypeScript e regras de transição de timestamps
├── quickstart.md        # Roteiro de validação manual
├── contracts/           # Contrato de schema JSON para persistência de limites de WIP
│   └── wip-limits-storage-contract.json
└── tasks.md             # Tarefas atômicas geradas pelo /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── MetricsBar.tsx         # [NEW] Painel superior exibindo Throughput, Lead Time Médio e Cycle Time Médio
│   ├── WipLimitBadge.tsx      # [NEW] Badge interativo de limite de WIP com edição inline no cabeçalho da coluna
│   ├── Board.tsx              # [MODIFY] Integração com limites de WIP e repasse para colunas
│   ├── Column.tsx             # [MODIFY] Exibição de sobrecarga de WIP e integração com WipLimitBadge
│   ├── Task.tsx               # [MODIFY] Exibição de badges de Lead Time e Cycle Time em cartões concluídos
│   └── AutoResizeTextarea.tsx # Componente existente
├── hooks/
│   ├── useWipLimits.ts        # [NEW] Hook de gerenciamento e persistência reativa dos limites de WIP
│   ├── useFlowMetrics.ts      # [NEW] Hook de agregação memoizada das métricas de fluxo
│   ├── useTaskCollection.ts   # [MODIFY] Registro de startedAt e completedAt nas transições de coluna
│   └── useColumnTasks.ts      # [MODIFY] Suporte aos novos timestamps
├── types/
│   └── kanban.ts              # [MODIFY] Extensão de TaskModel com startedAt/completedAt e WipLimitsState
├── utils/
│   ├── timeFormatters.ts      # [NEW] Funções puras de cálculo e formatação de Lead Time e Cycle Time
│   └── seedData.ts            # [MODIFY] Inclusão de startedAt/completedAt nas tarefas de demonstração
├── App.tsx                    # [MODIFY] Inclusão da MetricsBar e gerenciamento de limites de WIP
├── App.css                    # [MODIFY] Estilos para sobrecarga de WIP (âmbar), badges de tempo e MetricsBar
└── main.tsx                   # Ponto de montagem
```

---

## Complexity Tracking

> **Status**: Nenhuma violação aos princípios constitucionais. Arquitetura 100% modular, sem dependências adicionais e perfeitamente compatível com a base de código da Fase 1.
