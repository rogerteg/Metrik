# Implementation Plan: 054 — Previsibilidade Dinâmica & Alertas de SLE

**Branch**: `054-dynamic-sle-predictive-alerts` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/054-dynamic-sle-predictive-alerts/spec.md`  

---

## Summary

Implementar a camada de **Previsibilidade Dinâmica e Alertas de SLE (Service Level Expectation)** diretamente nos cartões do quadro Kanban e na barra de filtros. O motor estatístico analisa o tempo decorrido (*WIP Aging*) de cartões em andamento contra os percentis históricos observados de tempo de ciclo da equipe (P50, P85, P95), sinalizando proativamente riscos de atraso antes que o acordo de entrega seja quebrado.

---

## Technical Context

**Language/Version**: TypeScript 5.7 (ES2022, `strict`, `noUnusedLocals`)  
**Primary Dependencies**: React 19, Vite 6 (Zero novas dependências externas; utiliza funções puras de estatística existentes)  
**Storage**: Local-First via `localStorage` (chave `metrik_sle_config_${boardId}`) com fallback defensivo  
**Testing**: Vitest 3, `@testing-library/react` 16, `jsdom` 26 (`npm run test`)  
**Target Platform**: Navegadores Web modernos (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single Page Application (SPA), React + TypeScript  
**Performance Goals**: Tempo de cálculo de SLE preditivo < 1ms para 500 cartões; renderização de badges sem re-renders desnecessários  
**Constraints**: 100% offline e client-side; zero vazamento de marca (Constituição VII); arquivos mantidos rigorosamente abaixo de 400 linhas (Constituição II)  
**Scale/Scope**: Quadros com centenas de tarefas e dezenas de colunas  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Conformidade | Justificativa / Mecanismo de Garantia |
|---|:---:|---|
| **I. SDD (Spec-Driven)** | ✅ PASS | Artefatos `spec.md`, `research.md`, `data-model.md`, `contracts/` e `quickstart.md` gerados antes de qualquer código. |
| **II. Modularidade & Limite de Linhas** | ✅ PASS | Motor de cálculo desacoplado em `src/utils/slePredictor.ts`, componentes isolados em `src/components/Task/TaskSleBadge.tsx`, hook em `src/hooks/useDynamicSle.ts`. Todos os arquivos abaixo de 200 linhas. |
| **III. Testes Automatizados** | ✅ PASS | TDD estrito com suíte de testes unitários dedicada (`tests/unit/slePredictor.test.ts` e `tests/unit/TaskSleBadge.test.tsx`). |
| **IV. Observabilidade** | ✅ PASS | Logs estruturados com prefixo `[Metrik][SLE]` para diagnóstico de anomalias em timestamps. |
| **V. Simplicidade & YAGNI** | ✅ PASS | Reutilização das rotinas estatísticas existentes (`calculatePercentile`), sem bibliotecas pesadas de machine learning. |
| **VII. Identidade de Marca** | ✅ PASS | Terminologia estritamente científica/ágil (*Service Level Expectation*, *NIST Percentiles*, *Cycle Time*, *WIP Aging*). Zero referências a marcas externas. |
| **VIII. Local-First** | ✅ PASS | Execução 100% no cliente sem dependência de nuvem, banco remoto ou rede. |
| **IX. Proteção de Dados** | ✅ PASS | Persistência determinística de preferências e leitura defensiva contra JSON corrompido. |

---

## Project Structure

### Documentation (this feature)

```text
specs/054-dynamic-sle-predictive-alerts/
├── spec.md              # Especificação de Requisitos e Cenários
├── checklists/
│   └── requirements.md  # Checklist de Qualidade da Especificação
├── plan.md              # Este Plano de Implementação
├── research.md          # Decisões Técnicas e Trade-offs
├── data-model.md        # Modelos de Dados e Estrutura de Armazenamento
├── quickstart.md        # Guia Rápido de Verificação Manual e Cenários
├── contracts/           # Interfaces TypeScript formais
│   └── sle-prediction-contracts.ts
└── tasks.md             # Decomposição em Tarefas (próxima fase: /speckit-tasks)
```

### Source Code Layout

```text
src/
├── types/
│   └── sle.ts                         # Tipos canônicos de SLE e predição (espelha contratos)
├── utils/
│   ├── slePredictor.ts                # Motor puro de cálculo de percentis e diagnóstico preditivo
│   └── sleStorage.ts                  # Persistência Local-First com validação defensiva
├── hooks/
│   ├── useDynamicSle.ts               # Hook de estado e computação memoizada de SLE por quadro
│   └── useBoardFilters.ts             # Extensão para suportar filtro rápido de cartões com alerta SLE
├── components/
│   ├── Task/
│   │   ├── TaskSleBadge.tsx           # Badge visual de SLE no cartão Kanban
│   │   ├── TaskSlePopover.tsx         # Popover/tooltip analítico com régua graduada
│   │   └── TaskBadges.tsx             # Integração do TaskSleBadge na esteira de badges
│   ├── FilterBar.tsx                  # Chip de filtro rápido de cartões em risco de SLE
│   └── Settings/
│       └── BoardPoliciesTab.tsx       # Configuração de sensibilidade do SLE nas preferências
tests/
└── unit/
    ├── slePredictor.test.ts           # Testes unitários do motor puro de predição
    ├── useDynamicSle.test.ts          # Testes do hook de estado de SLE
    ├── TaskSleBadge.test.tsx          # Testes visuais e de interação do badge e popover
    └── sleBoardFiltering.test.ts      # Testes de integração do filtro rápido no quadro
```

---

## Phase Execution Summary

- **Phase 0 (Research)**: Concluída em `research.md`. Decisões sobre percentis NIST, fórmulas de aging, classificação de risco e tolerância amostral validadas.
- **Phase 1 (Design & Contracts)**: Concluída em `data-model.md`, `contracts/sle-prediction-contracts.ts` e `quickstart.md`.
- **Phase 2 (Tasks)**: Próximo passo através do comando `/speckit-tasks`.
