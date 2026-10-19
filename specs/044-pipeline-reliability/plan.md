# Implementation Plan: Confiabilidade do Pipeline e Verificação Automatizada (Ciclo 1)

**Branch**: `044-pipeline-reliability` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/044-pipeline-reliability/spec.md`

---

## Summary

O objetivo deste plano é restabelecer o sinal de integridade do pipeline de desenvolvimento do Metrik conforme o **Princípio III da Constituição**, eliminando as 7 falhas ativas na suíte de testes unitários causadas por acoplamento temporal com a data do sistema (`new Date()`) e garantindo a persistência comprovada dos relatórios do gate de cobertura em disco (`coverage/`).

A abordagem técnica consiste em:
1. Isolar temporalmente os arquivos [CycleTimeScatterPlot.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/CycleTimeScatterPlot.test.tsx) e [MonteCarloSimulationView.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/MonteCarloSimulationView.test.tsx) utilizando as APIs do Vitest `vi.useFakeTimers({ toFake: ['Date'] })` e `vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z'))`, com limpeza estrita no `afterEach(() => vi.useRealTimers())`.
2. Validar o gerador de relatórios do Vitest/V8 para assegurar que a execução de `npm run test:coverage` grave os arquivos `coverage/index.html` e `coverage/lcov.info` sem abortar prematuramente.
3. Garantir que a análise estática (`npm run lint`) permaneça com zero erros e contagem de avisos estritamente controlada (≤ 40).

---

## Technical Context

**Language/Version**: TypeScript 5.7.2, Node.js 20+  
**Primary Dependencies**: React 19, Vitest 3.2.7, `@vitest/coverage-v8`, `@testing-library/react` 16.2  
**Storage**: N/A (Camada de infraestrutura de testes)  
**Testing**: Vitest (`npm run test`), V8 Coverage (`npm run test:coverage`)  
**Target Platform**: Navegadores modernos (Chromium, Firefox, WebKit) & Node.js/CI (Ubuntu / Windows PowerShell)  
**Project Type**: Web Application SPA (Local-First Kanban & Flow Metrics)  
**Performance Goals**: Tempo de execução da suíte completa de 113 arquivos < 45 segundos  
**Constraints**: Zero enfraquecimento ou remoção de asserções de teste existentes (Constituição III.3); persistência obrigatória de artefatos de cobertura em `coverage/` (Constituição III.4)  
**Scale/Scope**: 113 arquivos de teste, 701 casos de teste, 2 suítes corrigidas  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Avaliação de Conformidade |
|---|---|---|
| **I. Specification-Driven Development** | ✅ Aprovado | Especificação formal (`spec.md`) e checklist de requisitos concluídos antes de qualquer linha de código de produção. |
| **II. Code Quality & Modularity** | ✅ Aprovado | Mantém testes modulares e isolados; o congelamento de relógio é confinado ao escopo de cada arquivo de teste. |
| **III. Automated Verification & Testing** | ✅ Aprovado | Esta feature existe primariamente para cumprir este princípio: restabelece a suíte 100% verde (III.1), respeita o ratchet de avisos (III.2), proíbe enfraquecer asserções (III.3) e exige evidências físicas do gate de cobertura (III.4). |
| **IV. Observability & Structured Logging** | ✅ Aprovado | Os reporters do Vitest e do coverage emitem resumos claros no terminal (`text-summary`) com prefixos rastreáveis. |
| **V. Simplicity & YAGNI** | ✅ Aprovado | Utiliza a API nativa já existente no Vitest (`vi.setSystemTime`), sem instalar novas bibliotecas nem criar abstrações artificiais. |
| **VI. Analytical Reasoning Pre-Task Creation** | ⏳ Pendente | Os 6 modelos analíticos obrigatórios serão formulados imediatamente antes da geração de `tasks.md`. |
| **VII. Brand Independence & Clean Identity** | ✅ Aprovado | Nenhuma menção a marcas de terceiros é introduzida. |
| **VIII. Local-First Sovereignty & TBAC** | ✅ Aprovado | Não altera as regras de isolamento de quadros por squad. |
| **IX. User Data Integrity & Autosave** | ✅ Aprovado | Não altera regras de persistência de dados de usuários. |

---

## Project Structure

### Documentation (this feature)

```text
specs/044-pipeline-reliability/
├── spec.md                  # Especificação funcional refinada
├── checklists/
│   └── requirements.md      # Validação de qualidade da especificação (16/16 aprovados)
├── research.md              # Decisões de mock de tempo e V8 coverage (Phase 0)
├── data-model.md            # Estrutura temporal de fixtures e artefatos de cobertura (Phase 1)
├── contracts/
│   └── pipeline-contracts.md # Contratos de exit codes e evidências de CI (Phase 1)
├── quickstart.md            # Guia de validação executável dos comandos (Phase 1)
├── plan.md                  # Este documento de planejamento técnico
└── tasks.md                 # Decomposição em tarefas (Phase 2 - via /speckit-tasks)
```

### Source Code Touched

```text
tests/
└── unit/
    ├── CycleTimeScatterPlot.test.tsx      # Inclusão de fake timers controlados (setSystemTime)
    └── MonteCarloSimulationView.test.tsx  # Inclusão de fake timers controlados (setSystemTime)

vite.config.ts                             # Validação de diretório e reporters de coverage
```

---

## Complexity Tracking

> **Nenhuma violação constitucional identificada.**  
> A solução adota a menor verdade irredutível e utiliza capacidades nativas do test runner já instalado no projeto.
