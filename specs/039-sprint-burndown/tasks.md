# Tasks: Feature 039 - Burndown da Sprint

**Branch**: `039-sprint-burndown`
**Status**: Ready for Implementation (0/7)
**Spec**: [spec.md](spec.md) | **Data Model/Plan**: [data-model.md](data-model.md)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI)

1. **Primeiros princípios**: burndown é uma projeção **derivada** de `createdAt`/`completedAt` sobre a janela da sprint; não é um dado novo. Ideal é linear por definição; real = criadas − concluídas por dia.
2. **Pré-mortem**: (F1) gráfico quebrado sem datas → modo `available:false`; (F2) divisão por zero em sprint vazia → `ideal`/`remaining` iniciam em 0; (F3) janela longa gerando muitos pontos → cap por dia e clamp em hoje; (F4) `completedAt` anterior ao `createdAt` (dado estranho) → clamp do restante em ≥ 0.
3. **MECE**: `sprintBurndown.ts` (puro) + teste; `SprintBurndownChart.tsx` (apresentação) + teste; integração no `SprintManagerModal`; CSS no módulo da 038. Sem sobreposição.
4. **Tree of Thoughts**: (A, podada) snapshots persistidos — complexidade/armazenamento sem requisito; (B, escolhida) derivação pura — menor estado, consistente com a lição "transparência por dados existentes"; (C, podada) biblioteca de chart — YAGNI.
5. **TDD**: `sprintBurndown.test.ts` falha antes do módulo; `SprintBurndown` UI test falha antes do componente.
6. **Triangulação**: sem dependências novas; não persiste; acessível.

## Phase 1: Domínio
- [X] T001 [P] Write failing tests in `tests/unit/sprintBurndown.test.ts` (no dates → available:false; linear ideal; daily remaining; empty sprint; single-day window)
- [X] T002 Create `src/utils/sprintBurndown.ts` (`buildSprintBurndown`)

## Phase 2: Apresentação
- [X] T003 Create `src/components/SprintBurndownChart.tsx` (SVG inline, ideal tracejado + real sólido, rótulo acessível com valores)
- [X] T004 [P] Tests in `tests/unit/SprintBurndown.test.tsx` (renders points; unavailable message; a11y)

## Phase 3: Integração & Gate
- [X] T005 Show the burndown in `src/components/SprintManagerModal.tsx` for dated sprints
- [X] T006 Add burndown styles to `src/styles/11-sprint.css`
- [X] T007 Run full suite, lint, format:check and build (zero regressions)
