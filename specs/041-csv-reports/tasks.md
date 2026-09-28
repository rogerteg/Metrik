# Tasks: Feature 041 - Relatórios Exportáveis (CSV)

**Branch**: `041-csv-reports`
**Status**: Ready for Implementation (0/7)
**Spec**: [spec.md](spec.md)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI)

1. **Primeiros princípios**: CSV é uma **serialização pura** de dados já existentes (tarefas, sprints); não cria estado nem depende de rede.
2. **Pré-mortem**: (F1) vírgula/aspas/quebra no título corrompendo colunas → escape RFC 4180 (aspas duplicadas + campo entre aspas); (F2) acentos corrompidos → Blob `text/csv;charset=utf-8`; (F3) quadro vazio → só cabeçalho; (F4) sprints ausentes → só cabeçalho; (F5) pontos/tarefas derivados errados → reusar `calculateSprintProgress`/`calculateSprintPoints`.
3. **MECE**: `csvExport.ts` (puro) + teste · `useDataPortability.exportCsv` (download) · `DataPortabilityTab` (UI) · `SettingsView`/`App` (wiring). Sem sobreposição.
4. **Tree of Thoughts**: (A, podada) biblioteca de CSV/XLSX — YAGNI; (B, escolhida) serialização manual RFC 4180; (C, podada) PDF — fora de escopo.
5. **TDD**: `csvExport.test.ts` falha antes do módulo; teste de UI do botão.
6. **Triangulação**: sem dependências; Local-First; terminologia neutra; dados não alterados.

## Phase 1: Domínio
- [X] T001 [P] Write failing tests in `tests/unit/csvExport.test.ts` (escape, header-only, escaping, tasks and sprints rows)
- [X] T002 Create `src/utils/csvExport.ts` (`escapeCsvValue`, `toCsv`, `buildTasksCsv`, `buildSprintsCsv`)

## Phase 2: Download & UI
- [X] T003 Add `exportCsv(fileName, content)` to `src/hooks/useDataPortability.ts`
- [X] T004 Add "Exportar tarefas (CSV)" and "Exportar sprints (CSV)" buttons to `src/components/Settings/DataPortabilityTab.tsx`
- [X] T005 Thread the new callbacks through `SettingsView` and wire them in `src/App.tsx`

## Phase 3: Gate
- [X] T006 UI test for the CSV buttons (`tests/unit/DataPortabilityCsv.test.tsx`)
- [X] T007 Run full suite, lint, format:check and build (zero regressions)
