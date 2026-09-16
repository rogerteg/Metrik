---
description: "Task list for feature 026 - Cross-Browser Board Render Parity"
---

# Tasks: Feature 026 - Paridade de Renderização do Quadro entre Navegadores

**Input**: Design documents from `/specs/026-cross-browser-column-layout/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required), [research.md](research.md), [data-model.md](data-model.md), [contracts/layout-parity.contract.md](contracts/layout-parity.contract.md), [quickstart.md](quickstart.md)

**Tests**: **Incluídos** — a Constitution III (Verificação Automatizada) e a Constitution VI.5 (Falsificabilidade & TDD Red-Bar) tornam os testes obrigatórios neste projeto, ainda que o template os trate como opcionais.

**Organization**: Tarefas agrupadas por história de usuário para permitir implementação e verificação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos distintos, sem dependência pendente)
- **[Story]**: História de usuário à qual a tarefa pertence (US1, US2, US3)
- Todas as descrições incluem caminho de arquivo exato

## Path Conventions

- Projeto único (SPA): `src/` e `tests/` na raiz do repositório
- Artefatos de design em `specs/026-cross-browser-column-layout/`

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)

- **Verdades fundamentais e invariantes:**
  - A largura de uma coluna é uma **decisão única**, não o resultado da interação de quatro declarações. Portanto: existe exatamente **uma** fonte de verdade para padrão, mínimo e máximo, e ela é a mesma para CSS e TypeScript.
  - A largura efetiva de uma coluna **é função somente da preferência persistida e das constantes** — nunca do navegador, da janela, da ampliação ou do histórico local de outro navegador.
    $$w(c) = \text{clamp}(\text{pref}(c), \text{MIN}, \text{MAX}) \ \lor\ w(c) = \text{DEFAULT}$$
  - Nenhuma coluna pode renderizar sem largura definida: `undefined` é o estado que cria dois caminhos de renderização, e é justamente a raiz do defeito.
  - Restaurar é uma operação de **remoção**, não de escrita: o estado inicial é ausência de preferência, não um número fixo.
  - A interação de arraste é **relativa** ao estado renderizado, nunca a uma constante paralela.
- **Premissas acidentais descartadas:**
  - Que o CSS deva decidir a largura padrão (290 px) enquanto o TypeScript decide outra (280 px) — duplicação acidental, não design.
  - Que o mínimo do CSS (220 px) deva prevalecer sobre a escolha do usuário (200 px) — o CSS estava sobrescrevendo silenciosamente a preferência.
  - Que o defeito esteja em recurso de CSS não suportado por um navegador — **refutado na investigação**: não há uso de `:has()`, `subgrid`, `@container`, `field-sizing`, `dvh` ou `@supports` em `src/`.
  - Que "restaurar" precise gravar um valor — gravar é o que congela a coluna em 280 px para sempre.

### 2. Análise Pré-Mortem & Inversão (Premortem & Inversion)

- **Cenário 1 — Regressão silenciosa nos quadros existentes:** preferências já salvas (200 px, 650 px) passam a renderizar valores diferentes e o usuário percebe as colunas "mudando sozinhas" após a correção. *Mitigação:* a faixa é ancorada na geometria hoje visível (padrão 290, mínimo 220, máximo 650) e a tarefa **T013** exige teste explícito de fronteira antes de fechar os limites; preferências válidas continuam honradas exatamente.
- **Cenário 2 — Divisão por zero ou largura não finita:** uma preferência corrompida (`"abc"`, `null`, `Infinity`, negativa) entra no cálculo e produz `NaN` no estilo, colapsando a coluna. *Mitigação:* **T004** concentra a validação em função pura que descarta entradas inválidas; **T013** e **T017** cobrem o caminho corrompido com teste dedicado; **GC-09** fecha o critério.
- **Cenário 3 — Reintrodução do drift por uma alteração futura:** alguém ajusta o valor no CSS e esquece o TypeScript, e o defeito volta meses depois. *Mitigação:* **T005** e **T006** criam a guarda automatizada que falha se CSS e TypeScript divergirem, e que proíbe literais de largura no componente.
- **Cenário 4 — Correção que não corrige:** altera-se o código, tudo passa em teste, e o Chrome continua diferente porque a causa real era ambiental (janela, ampliação, estado local). *Mitigação:* **T002** captura a medição de referência **antes** de qualquer alteração, e **T023** fixa a matriz com janela e ampliação iguais; o desfecho de H1–H4 é registrado em **T026**.
- **Cenário 5 — Salto de geometria durante a interação:** o arraste parte de base fixa e a coluna pula no primeiro movimento, gerando novo relato de "coluna errada" durante o uso. *Mitigação:* **T014** mede antes/depois do primeiro movimento e **T015** usa a largura renderizada como base.
- **Cenário 6 — Falso verde do jsdom:** acreditamos ter coberto geometria porque a suíte ficou verde, mas o jsdom não calcula layout. *Mitigação:* `research.md` §D6 é explícito; as suítes verificam **invariantes** (GC-01 a GC-09) e a paridade medida é verificada por medição real em **T023**/**T024**.

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)

- **Exclusividade Mútua (zero duplicação):** cada tarefa é dona de **um** arquivo e **uma** responsabilidade:

| Arquivo | Tarefas que o tocam |
|---|---|
| `git` (branch) | T001 |
| `quickstart.md` | T002 (baseline), T023, T024, T026 (registro) |
| `tests/unit/columnGeometry.test.ts` | T003 (cria), T021 (estende: diagnóstico) |
| `src/utils/columnGeometry.ts` | T004 (cria), T018 (inteiros), T020 (diagnóstico) |
| `tests/unit/columnGeometryContract.test.ts` | T005 (cria), T019 (estende: guarda anti-detecção de navegador) |
| `src/App.css` | T006 (geometria), T012 (contenção de rolagem) |
| `tests/unit/Board.test.tsx` | T007 |
| `tests/unit/Column.test.tsx` | T008 (paridade), T014 (arraste/restauração) |
| `src/components/Board.tsx` | T009 |
| `src/components/Column.tsx` | T010 (largura resolvida), T015 (arraste), T016 (restauração) |
| `src/hooks/useColumnWidths.ts` | T011 (módulo puro), T016 (restauração), T017 (descarte de inválidos) |
| `tests/unit/useColumnWidths.test.ts` | T013 (cria) |
| `checklists/*.md` | T025 |

  Nenhum arquivo é editado por duas tarefas com a mesma finalidade; onde há duas tarefas no mesmo arquivo, são subtarefas distintas e sequenciadas (criar → estender).
- **Exaustão Coletiva (cobertura 100%):** todo requisito e critério tem tarefa correspondente:

| Origem | Tarefas |
|---|---|
| FR-001 (largura/ordem/alinhamento idênticos) | T004, T006, T009, T010 |
| FR-002 (nada cortado/sobreposto) | T009, T012, T024 |
| FR-003 (rolagem horizontal contida) | T012, T024 |
| FR-004 (altura útil estável) | T006, T012 |
| FR-005 (textos não estouram a coluna) | T006, T012, T024 |
| FR-006 (sem identificação de navegador) | T019 |
| FR-007 (recurso ausente tem alternativa funcional) | T006, T019 |
| FR-008 (ampliação 50%–200%, densidade 100%–200%) | T018, T023 |
| FR-009 (preferências inválidas descartadas) | T013, T017 |
| FR-010 (largura inicial cabe na janela) | T004, T009, T011 |
| FR-011 (interações operáveis, mesma área) | T010, T014, T015 |
| FR-012 (temas mantêm layout) | T023 |
| FR-013 (Analytics e modais com paridade) | T023 |
| FR-014 (fallback íntegro + diagnóstico) | T020, T021 |
| NFR-001 (recursos amplamente suportados) | T006, T019 |
| NFR-002 (tolerância ≤ 1 px) | T004, T018, T023 |
| NFR-003 (fluidez mantida) | T018, T022 |
| NFR-004 (WCAG 2.1 AA preservada) | T010, T022 |
| NFR-005 (local-first preservado) | T011, T017 |
| NFR-006 (sem dependências novas) | T022 |
| SC-001, SC-003 (paridade medida) | T002, T023 |
| SC-002 (2 a 12 colunas sem defeito) | T024 |
| SC-004 (sem ajuste manual do usuário) | T004, T011, T023 |
| SC-005 (relatos encerrados) | T026 |
| SC-006 (sem regressão) | T022 |

  Cobertura: **14/14 FRs, 6/6 NFRs e 6/6 SCs** mapeados; nenhum critério sem tarefa.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)

- **Caminho A — Sincronizar os valores duplicados agora (290→280 e 220→200):** podado. Corrige o sintoma e deixa quatro declarações divergentes prontas para divergir de novo na próxima alteração.
- **Caminho B — Ler a geometria do estilo computado em tempo de execução:** podado. Acopla o layout à leitura de estilo computado, adiciona custo por coluna e falha silenciosamente quando o CSS não carrega. Viola YAGNI (Constitution V).
- **Caminho C — Adotar biblioteca externa de layout/regressão visual:** podado. Introduz dependência nova, contraria NFR-006 e não é exigida por nenhum requisito.
- **Caminho D (selecionado) — Fonte única pura + largura explícita + guarda anti-drift:** a geometria passa a existir num módulo puro consumido por hook, componentes e CSS, a largura é sempre explícita, e uma guarda automatizada impede a reintrodução do drift. **Critério de poda:** menor acoplamento (função pura, sem efeitos colaterais), menor superfície de alteração (5 arquivos de produção), zero dependências novas e verificação objetiva — alinhado a Simplicidade (YAGNI) e Modularidade (Constitution II e V).
- **Decisão de escopo podada (D7 de `research.md`):** esticar colunas para preencher a janela foi podado porque alteraria a referência de aceite (o Edge atual) e ampliaria o escopo para redesenho visual, que está formalmente fora de escopo.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)

- **Falha demonstrável (Red Bar):**
  - `tests/unit/columnGeometry.test.ts` falha antes de T004: o módulo de geometria ainda não existe.
  - `tests/unit/columnGeometryContract.test.ts` falha antes de T006: o CSS ainda declara `width: 290px` e `min-width: 220px` enquanto o TypeScript declara 280 e 200.
  - `tests/unit/useColumnWidths.test.ts` falha antes de T016/T017: restaurar grava 280 px e valores inválidos não são descartados.
- **Critério determinístico de aceite (Green Bar):**
  - Toda largura resolvida é um número inteiro finito dentro de `[MIN, MAX]`, comprovado por teste de fronteira.
  - Padrão, mínimo e máximo do CSS **idênticos** aos do TypeScript, comprovado pela guarda anti-drift.
  - Nenhum literal de largura de coluna permanece em `Column.tsx` ou `Board.tsx`, comprovado por varredura automatizada.
  - `npm run test` sem regressão (linha de base: 335 testes) e `npm run build` sem erros — verificados em T022.
  - Paridade medida entre navegadores com diferença ≤ 1 px, registrada em T023.

### 6. Triangulação Adversarial & Conformidade Constitucional

- **I. SDD:** spec, plano, research, data-model, contrato, quickstart e checklists produzidos antes desta lista.
- **II. Modularidade:** `columnGeometry.ts` é função pura, sem efeitos colaterais, sem dependência circular e sem conhecer React.
- **III. Verificação Automatizada:** quatro arquivos de teste (dois novos, dois estendidos); T022 exige suíte e build limpos.
- **IV. Observabilidade:** T020 implementa diagnóstico com prefixo `[Metrik Guard]` contendo os valores medidos; nenhum dado sensível, nenhuma telemetria remota.
- **V. Simplicidade & YAGNI:** nenhuma dependência nova, nenhum redesenho, nenhuma abstração além do módulo puro exigido pelos requisitos.
- **VI. Raciocínio Analítico:** este documento é a evidência prévia obrigatória.
- **VII. Independência de Marca:** nomenclatura neutra (*Metrik Column Geometry Contract*); nenhuma marca de terceiros em código, CSS ou comentários.
- **VIII. Soberania Local-First:** preferências continuam exclusivamente no `localStorage`; nenhuma chamada de rede é adicionada.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparação do ambiente e captura da linha de base de medição antes de qualquer alteração de código

- [X] T001 Create and switch to the feature branch `026-cross-browser-column-layout` from `main` (repository root)
- [X] T002 [P] Capture the reference geometry baseline in Microsoft Edge using the measurement probe in `specs/026-cross-browser-column-layout/quickstart.md` (§4.2) and record the measured widths in §4.3

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fonte única de verdade para a geometria da coluna — pré-requisito bloqueante de todas as histórias

**⚠️ CRITICAL**: Nenhuma história de usuário pode ser finalizada antes desta fase

- [X] T003 [P] Write failing unit tests for geometry resolution and clamping in `tests/unit/columnGeometry.test.ts`
- [X] T004 Create the single-source geometry module with `DEFAULT_COLUMN_WIDTH`, `MIN_COLUMN_WIDTH`, `MAX_COLUMN_WIDTH`, `resolveColumnWidth` and `clampColumnWidth` in `src/utils/columnGeometry.ts`
- [X] T005 [P] Write the failing anti-drift contract test comparing CSS geometry to the TypeScript constants in `tests/unit/columnGeometryContract.test.ts`
- [X] T006 Expose the geometry as custom properties and remove the width literals from `.kanban-column` in `src/App.css`

**Checkpoint**: Geometria única e verificada — as histórias de usuário podem começar

---

## Phase 3: User Story 1 - Quadro idêntico em qualquer navegador (Priority: P1) 🎯 MVP

**Goal**: Toda coluna recebe largura explícita vinda da fonte única, eliminando a divergência 290/280 (G1/G2) que fazia o mesmo quadro renderizar diferente em cada navegador.

**Independent Test**: Abrir o mesmo quadro no Edge e no Chrome com a mesma janela e ampliação e medir as larguras com a sonda do `quickstart.md` §4.2: quantidade, ordem e larguras devem coincidir (diferença ≤ 1 px).

### Tests for User Story 1

> **NOTE: Escrever os testes PRIMEIRO e garantir que FALHAM antes da implementação**

- [X] T007 [P] [US1] Write component tests asserting every column receives an explicit resolved width, never undefined, in `tests/unit/Board.test.tsx`
- [X] T008 [P] [US1] Write component tests asserting the inline width equals the resolved width and honours a valid preference in `tests/unit/Column.test.tsx`

### Implementation for User Story 1

- [X] T009 [US1] Pass the resolved width for every column in `src/components/Board.tsx`
- [X] T010 [US1] Apply the resolved width as the single inline geometry source in `src/components/Column.tsx`
- [X] T011 [US1] Reuse the geometry module for defaults and clamping in `src/hooks/useColumnWidths.ts`
- [X] T012 [US1] Make the horizontal scroll containment of `.kanban-board-grid` explicit so the last column is never clipped in `src/App.css`

**Checkpoint**: US1 funcional e verificável de forma independente (MVP entregue)

---

## Phase 4: User Story 2 - Layout previsível em janelas, ampliação e densidade (Priority: P2)

**Goal**: Remover os literais e o estado oculto das interações (G4, G5, G6) para que a geometria seja previsível em qualquer janela, ampliação e densidade de tela.

**Independent Test**: Sem preferências salvas, arrastar a alça 1 px altera a largura em ~1 px sem salto; restaurar duas vezes retorna ao padrão nas duas; gravar um valor corrompido não quebra o layout.

### Tests for User Story 2

- [X] T013 [P] [US2] Write `tests/unit/useColumnWidths.test.ts` covering default resolution, boundary clamping and discard of invalid or corrupted persisted values
- [X] T014 [P] [US2] Extend `tests/unit/Column.test.tsx` with drag-baseline (no jump on first move) and idempotent restore coverage

### Implementation for User Story 2

- [X] T015 [US2] Start the resize drag from the rendered width and remove the width literals in `src/components/Column.tsx`
- [X] T016 [US2] Make restore clear the persisted preference instead of writing a fixed value in `src/components/Column.tsx` and `src/hooks/useColumnWidths.ts`
- [X] T017 [US2] Discard invalid or out-of-range persisted widths on load in `src/hooks/useColumnWidths.ts`
- [X] T018 [US2] Guarantee integer resolved widths to prevent subpixel accumulation across zoom and density in `src/utils/columnGeometry.ts`

**Checkpoint**: US1 e US2 funcionando de forma independente

---

## Phase 5: User Story 3 - Nenhum ajuste dependente de navegador (Priority: P3)

**Goal**: Garantir que nenhuma decisão de layout dependa do navegador (FR-006), que recursos ausentes degradem de forma funcional (FR-007) e que divergências sejam diagnosticáveis (FR-014).

**Independent Test**: A guarda automatizada falha se qualquer detecção de navegador ou ramificação de layout por suporte for introduzida; e a largura descartada gera registro `[Metrik Guard]` com os valores medidos.

### Tests for User Story 3

- [X] T019 [P] [US3] Write a guard test asserting no browser/OS detection or layout `@supports` branch exists in the column geometry path, in `tests/unit/columnGeometryContract.test.ts`

### Implementation for User Story 3

- [X] T020 [US3] Implement the `[Metrik Guard]` geometry diagnostic with `columnId`, `expected`, `resolved`, `preference` and `reason` in `src/utils/columnGeometry.ts`
- [X] T021 [US3] Extend `tests/unit/columnGeometry.test.ts` to assert the diagnostic payload fields and each discard reason

**Checkpoint**: Todas as três histórias independentemente funcionais

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, verificação de paridade medida e encerramento documental

- [X] T022 [P] Run the full test suite and the production build from `package.json` scripts, confirming zero regressions and clean output
- [ ] T023 [P] Execute the cross-browser parity matrix from `quickstart.md` (§4.3) in Edge, Chrome, Firefox and Safari and record the samples
- [ ] T024 [P] Verify the containment and clipping scenarios for 2, 6 and 12 columns from `quickstart.md` (§5) and record results
- [X] T025 Review and close `checklists/requirements.md` and `checklists/browser-parity.md` against the implemented behaviour
- [X] T026 Record the final parity verdict and the H1–H4 outcome in `specs/026-cross-browser-column-layout/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — inicia imediatamente. T002 é a linha de base obrigatória antes de qualquer alteração de estilo.
- **Foundational (Phase 2)**: depende do Setup — **BLOQUEIA** todas as histórias.
- **US1 (Phase 3)**: depende da Fase 2. É o MVP.
- **US2 (Phase 4)**: depende da Fase 2; integra-se a US1 mas é verificável de forma independente.
- **US3 (Phase 5)**: depende da Fase 2 (T004 para T020; T005 para T019).
- **Polish (Phase 6)**: depende de US1, US2 e US3.

### User Story Dependencies

- **US1 (P1)**: nenhuma dependência de outra história — entrega a paridade de largura explícita.
- **US2 (P2)**: nenhuma dependência de outra história — entrega previsibilidade das interações.
- **US3 (P3)**: nenhuma dependência de outra história — entrega garantia de ausência de ramificação por navegador e diagnóstico.

### Within Each Story

- Testes antes da implementação (Red-Bar First).
- Módulo puro antes de hook, hook antes de componente.
- Cada história validada no seu checkpoint antes da seguinte.

### Task-level Dependencies

- T004 depende de T003 (Red-Bar antes da implementação).
- T006 depende de T005.
- T009, T010 e T011 dependem de T004.
- T015 e T016 dependem de T010.
- T017 depende de T011.
- T020 depende de T004; T021 depende de T020 e T003.
- T019 depende de T005.

---

## Parallel Opportunities & Examples

### Parallel Example: Setup e Fundação

```bash
# Sem dependência mútua de arquivos:
Task T002: "Capture the reference geometry baseline in Microsoft Edge"
Task T003: "Write failing unit tests in tests/unit/columnGeometry.test.ts"
Task T005: "Write the failing anti-drift contract test in tests/unit/columnGeometryContract.test.ts"
```

### Parallel Example: User Story 1

```bash
Task T007: "Component tests in tests/unit/Board.test.tsx"
Task T008: "Component tests in tests/unit/Column.test.tsx"
```

### Parallel Example: User Story 2

```bash
Task T013: "Unit tests in tests/unit/useColumnWidths.test.ts"
Task T014: "Extend tests/unit/Column.test.tsx with drag and restore coverage"
```

### Parallel Example: Polish

```bash
Task T022: "Full suite and production build"
Task T023: "Cross-browser parity matrix"
Task T024: "Containment and clipping scenarios"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir **Phase 1: Setup** (T001–T002) — a medição de referência é obrigatória antes de tocar no estilo.
2. Concluir **Phase 2: Foundational** (T003–T006).
3. Concluir **Phase 3: User Story 1** (T007–T012).
4. **PARAR E VALIDAR**: medir a paridade Edge × Chrome. A divergência 290/280 (G1/G2) deve ter desaparecido — MVP entregue.

### Incremental Delivery

1. Setup + Foundational → geometria única com guarda anti-drift.
2. US1 → paridade de largura explícita (MVP).
3. US2 → interações previsíveis (sem salto, restaurar idempotente, inválidos descartados).
4. US3 → ausência de ramificação por navegador e diagnóstico.
5. Polish → regressão, matriz de paridade medida e encerramento dos checklists.

### Nota de verificação

O jsdom **não** calcula layout (ver `research.md` §D6): as suítes comprovam invariantes de geometria (GC-01 a GC-09), e a paridade medida (GP-01 a GP-10) é verificada por medição em navegador real nas tarefas T023 e T024. Nenhuma tarefa pode ser considerada concluída apenas porque a suíte ficou verde.

---

## Notes

- `[P]` = tarefa paralelizável (arquivos distintos, sem dependência pendente).
- `[US1]`, `[US2]`, `[US3]` = rastreabilidade direta às histórias da `spec.md`.
- Cada história tem critérios de teste independentes e checkpoint próprio.
- Nenhuma dependência nova é adicionada (NFR-006); nenhuma marca de terceiros é citada (Constitution VII).
- T001 cria a branch porque o hook `before_tasks` não existe neste projeto (`.specify/extensions.yml` ausente) e o trabalho ainda está em `main`.
- A decisão D7 de `research.md` (espaço horizontal excedente permanece com largura fixa) é pressuposto destas tarefas; alterá-la exige `/speckit-clarify` antes da implementação.

---

## Status da Execução (2026-09-14)

**24 de 26 tarefas concluídas** — T001 a T022, T025 e T026. Permanecem abertas **T023** e **T024**, que exigem navegadores reais e quadros de 2, 6 e 12 colunas.

### Evidência

| Item | Resultado |
|---|---|
| `npm run test` | **393 testes em 58 arquivos, todos aprovados** (linha de base anterior: 335 — 58 novos) |
| `npm run build` | **Limpo** — `tsc` sem erros, 121 módulos, bundle gerado |
| Barra vermelha | `tests/unit/columnGeometryContract.test.ts` falhava em **9 testes** antes da correção do CSS (290/220 no CSS contra 280/200 no TypeScript) |
| Medição real (Chromium, 1148×960, densidade 1,25) | 4 colunas com largura **inline explícita de 290 px**, espaçamento constante de 304 px; preferência válida de 400 px aplicada **exatamente**; preferência de 99999 **descartada** com diagnóstico `[Metrik Guard] … reason=out-of-range` |

### Arquivos alterados

| Arquivo | Natureza |
|---|---|
| `src/utils/columnGeometry.ts` | **Novo** — fonte única de geometria e diagnóstico |
| `tests/unit/columnGeometry.test.ts` | **Novo** — 16 testes |
| `tests/unit/columnGeometryContract.test.ts` | **Novo** — 21 testes (guarda anti-drift) |
| `tests/unit/useColumnWidths.test.ts` | **Novo** — 10 testes |
| `tests/unit/Board.test.tsx` | **Novo** — 4 testes |
| `src/hooks/useColumnWidths.ts` | Reusa o módulo puro; restauração limpa a preferência; descarta inválidos |
| `src/components/Board.tsx` | Entrega sempre a largura resolvida |
| `src/components/Column.tsx` | Largura resolvida explícita; arraste a partir da largura renderizada; restauração sem valor fixo |
| `src/App.css` | Custom properties de geometria; literais removidos de `.kanban-column`; contenção documentada |
| `tests/unit/Column.test.tsx` | +6 testes de geometria e interação |

### Riscos remanescentes

- A reprodução visual do sintoma original **no Chrome do usuário** não foi confirmada — o ambiente disponível tem um único motor Chromium (`quickstart.md §8.3`).
- Comparação Edge × Chrome × Firefox × Safari, cenários de 2/6/12 colunas, ampliação (50%/150%/200%), densidade (1,50/2,00) e paridade de Analytics/modais/temas seguem pendentes (T023, T024).

### Desvios

Nenhum desvio de escopo: nenhuma dependência adicionada, nenhum redesenho, nenhuma alteração de esquema de dados ou de regra de negócio.

---

## Phase 7: Convergence

**Purpose**: Fechar as lacunas identificadas entre `spec.md`/`plan.md`/`data-model.md` e o estado atual do código após a implementação (varredura de convergência). Ordenadas por severidade (HIGH → LOW).

- [ ] T027 Reconcile the initial column width with FR-010 — either implement a window-aware default width or formalize the fixed-default decision (D7) via `/speckit-clarify` — so that code and specification agree on whether first-load horizontal scrolling is expected per FR-010 (partial)
- [ ] T028 Reserve the horizontal scrollbar lane deterministically in `src/App.css` so the measured column height no longer varies with the browser's scrollbar style (6 px in Chromium/WebKit, default thickness in Firefox, zero with overlay scrollbars), then record the measured heights per FR-004 (partial)
- [ ] T029 Prune discarded width preferences from `localStorage` on load in `src/hooks/useColumnWidths.ts` so the `[Metrik Guard]` geometry diagnostic is reported once instead of on every page load per FR-009 (partial)


