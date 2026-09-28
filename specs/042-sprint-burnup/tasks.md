# Tasks: Feature 042 - Burnup da Sprint

**Branch**: `042-sprint-burnup`
**Status**: Ready for Implementation (0/6)
**Spec**: [spec.md](spec.md)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI)

1. **Primeiros princípios**: burnup é a leitura **acumulada** do burndown — escopo (crescente por criação) e concluído (crescente por conclusão). Derivado, sem estado.
2. **Pré-mortem**: (F1) sem datas → `available:false`; (F2) janela futura → clamp em hoje; (F3) sprint vazia → linhas zero; (F4) alternância corrompendo o gráfico → o componente recebe `mode` e escolhe as séries.
3. **MECE**: `sprintBurndown.ts` (novo `buildSprintBurnup`) · `SprintBurndownChart` (prop `mode`) · `SprintManagerModal` (toggle) · testes. Sem sobreposição.
4. **Tree of Thoughts**: (A, podada) CFD por sprint — exigiria snapshots/histórico diário; (B, escolhida) burnup derivado + modo no gráfico existente (reuso).
5. **TDD**: `sprintBurndown.test.ts` (burnup) e teste do gráfico falham antes da implementação.
6. **Triangulação**: sem dependências; Local-First; acessível; reuso do componente evita duplicação.

## Phase 1: Domínio
- [X] T001 [P] Extend `tests/unit/sprintBurndown.test.ts` with `buildSprintBurnup` cases (unavailable without dates, scope/completed accumulation, future clamp)
- [X] T002 Add `SprintBurnup` + `buildSprintBurnup` to `src/utils/sprintBurndown.ts`

## Phase 2: Apresentação
- [X] T003 Add a `mode` prop to `src/components/SprintBurndownChart.tsx` (burndown/burnup series + legend + aria-label)
- [X] T004 Toggle burndown/burnup in `src/components/SprintManagerModal.tsx`
- [X] T005 Extend `tests/unit/SprintBurndown.test.tsx` for the burnup mode

## Phase 3: Gate
- [X] T006 Run full suite, lint, format:check and build (zero regressions)
