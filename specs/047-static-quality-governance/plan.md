# Implementation Plan: Governança de Qualidade Estática & Arquitetura (Ciclo 4 - P2)

**Branch**: `047-static-quality-governance` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/047-static-quality-governance/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

O Ciclo 4 (P2) executa a consolidação arquitetural do sistema de estilos do Metrik e a blindagem automatizada de métricas de qualidade:
1. Reconciliação dos 12 seletores CSS duplicados inventariados pela trava `tests/unit/cssDuplicationGuard.test.ts`, reduzindo a lista-base para 0 duplicatas.
2. Descontinuação do módulo heterogêneo `src/styles/13-recovered.css`, redistribuindo 100% de suas regras para seus respectivos módulos temáticos de domínio e atualizando o manifesto `src/App.css` e o teste `tests/unit/appCssStructure.test.ts`.
3. Elevação e blindagem dos limiares de cobertura em `vite.config.ts` (`functions: 60`, `statements: 85`, `lines: 85`, `branches: 78`) e garantia de emissão dos relatórios HTML/LCOV.
4. Manutenção de 100% dos 701 testes unitários verdes e compilação de produção sem erros em menos de 5 segundos.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode) / React 19  
**Primary Dependencies**: Vite 6, Vitest 3, ESLint 9, Prettier  
**Styling**: Vanilla CSS modular em `src/styles/` integrado via manifesto `@import` em `src/App.css`  
**Storage**: N/A (Esta feature não altera esquemas de banco nem armazenamento local)  
**Testing**: Vitest 3 com ambiente `jsdom`, Coverage Provider `v8`, travas estruturais de CSS (`cssDuplicationGuard.test.ts` e `appCssStructure.test.ts`)  
**Target Platform**: Navegadores modernos (Desktop/Web)  
**Project Type**: Single-Page Application (SPA) Kanban & Fluxo com Sovereign Local-First  
**Performance Goals**: Tempo de build de produção (`npm run build`) < 5 segundos; suíte de testes < 25 segundos  
**Constraints**: Zero avisos no ESLint; regra `@typescript-eslint/no-explicit-any` mantida como `"error"`; zero enfraquecimento de testes (Constituição III)  
**Scale/Scope**: 12 módulos CSS canônicos, 701 testes unitários, 113 arquivos de teste  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Model Integrity)**: ✅ **PASS** — A especificação [spec.md](./spec.md) e o plano rastreiam diretamente a User Story 3 e oportunidades `OPP-001`, `OPP-006`, `OPP-016` e `OPP-018` da visão oficial [043-system-health-and-roadmap](../043-system-health-and-roadmap/vision.md).
- **Princípio II (Clean Architecture)**: ✅ **PASS** — A descontinuação de `13-recovered.css` e a consolidação de seletores em domínios canônicos isola responsabilidades de apresentação e elimina vazamentos entre módulos.
- **Princípio III (Automated Quality Gates)**: ✅ **PASS** — A suíte de 701 testes é preservada na íntegra. As travas de CSS tornam-se mais estritas (`DUPLICATE_BASELINE = new Set([])`) e os limiares de cobertura são elevados.
- **Princípio V (Simplicity & YAGNI)**: ✅ **PASS** — Nenhuma dependência externa ou framework de CSS é introduzido. Toda a otimização utiliza Vanilla CSS e ferramentas nativas já configuradas.
- **Princípio VII (Brand Identity & Hygiene)**: ✅ **PASS** — Sem introdução de nomes de marcas de terceiros.

---

## Project Structure

### Documentation (this feature)

```text
specs/047-static-quality-governance/
├── plan.md              # Este arquivo de planejamento arquitetural
├── research.md          # Diagnóstico detalhado de seletores e cobertura
├── data-model.md        # Modelo da cascata de estilos e entidades de governança
├── quickstart.md        # Roteiro de testes e validação Red-Bar / Green-Bar
├── checklists/
│   ├── requirements.md  # Checklist de qualidade da especificação
│   └── code-quality.md  # Checklist de requisitos de qualidade de código
└── tasks.md             # Tarefas atômicas (gerado pelo /speckit-tasks)
```

### Source Code Touched

```text
src/
├── App.css                                     # Manifesto de estilos (remoção do import 13)
└── styles/
    ├── 01-design-system-core.css               # Absorção de header-clusters e cabeçalho base
    ├── 02-task-detail-inline.css               # Unificação de badges e absorção de QA summary
    ├── 03-priority-tags-filters.css            # Consolidação canônica de add-column e filtros
    ├── 06-team-squad-modal.css                 # Absorção de modal-title e error-banner
    ├── 08-task-types-links.css                 # Consolidação de task-blocked-dependency-chip
    ├── 10-comments-containment.css             # Unificação de metrik-comment-list
    ├── 12-workspace.css                        # Absorção de board-workspace-tag e métricas
    └── 13-recovered.css                        # Descontinuado e removido

vite.config.ts                                  # Elevação dos limiares de cobertura (thresholds)

tests/unit/
├── cssDuplicationGuard.test.ts                 # Atualização da baseline para zero duplicatas
└── appCssStructure.test.ts                     # Atualização do EXPECTED_ORDER para 12 módulos
```

---

## Execution Phases & Verification Gates

### Phase 0: Outline & Research
- [x] Diagnóstico completo da localização dos 12 seletores duplicados documentado em [research.md](./research.md).
- [x] Mapeamento de redistribuição das regras de `13-recovered.css` para domínios coesos.
- [x] Medição factual de cobertura V8 e definição dos novos limiares.

### Phase 1: Design & Contracts
- [x] Modelo de cascata e entidades de governança documentados em [data-model.md](./data-model.md).
- [x] Roteiro executável de validação criado em [quickstart.md](./quickstart.md).
- [x] Checklist de revisão de requisitos registrado em [checklists/code-quality.md](./checklists/code-quality.md).

### Phase 2: Implementation (Scheduled for `/speckit-tasks` & `/speckit-implement`)
1. **Deduplicação de Seletores**:
   - Reconciliar regras redundantes em `02-task-detail-inline.css`, `03-priority-tags-filters.css`, `08-task-types-links.css` e `10-comments-containment.css`.
   - Zerar a lista `DUPLICATE_BASELINE` em `tests/unit/cssDuplicationGuard.test.ts`.
2. **Redistribuição de `13-recovered.css`**:
   - Mover blocos para `01-design-system-core.css`, `02-task-detail-inline.css`, `06-team-squad-modal.css` e `12-workspace.css`.
   - Atualizar `src/App.css` e `tests/unit/appCssStructure.test.ts`, excluindo o arquivo `13-recovered.css`.
3. **Blindagem de Cobertura**:
   - Atualizar `thresholds` em `vite.config.ts`.
4. **Validação Integrada**:
   - Executar `npm run format`, `npm run lint`, `npm test`, `npm run test:coverage` e `npm run build`.
