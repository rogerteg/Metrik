# Implementation Plan: Paridade de Renderização do Quadro entre Navegadores

**Branch**: `026-cross-browser-column-layout` | **Date**: 2026-09-14 | **Status**: In Planning | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/026-cross-browser-column-layout/spec.md`

## Summary

A geometria das colunas do quadro está definida hoje em **quatro lugares independentes que divergem entre si**:

| Origem | Largura padrão | Largura mínima | Largura máxima |
|---|---|---|---|
| CSS `.kanban-column` (`src/App.css`) | 290 px | 220 px | — |
| `src/hooks/useColumnWidths.ts` | 280 px (`DEFAULT_COLUMN_WIDTH`) | 200 px | 650 px |
| `src/components/Column.tsx` — arraste de redimensionamento | 280 px (literal) | 200 px (literal) | 650 px (literal) |
| `src/components/Column.tsx` — duplo clique "restaurar" | 280 px (literal) | — | — |

Como a largura efetiva depende de a preferência estar ou não gravada no `localStorage` — e **cada navegador tem o seu próprio** `localStorage` — a mesma coluna pode renderizar 290 px em um navegador e 280 px (ou qualquer valor persistido) em outro. Somado a isso, o arraste parte de uma base fixa de 280 px mesmo quando a coluna está renderizada em 290 px, produzindo um salto visível no primeiro movimento.

**Abordagem técnica**: tornar a geometria de coluna **única, explícita e determinística** — uma só fonte de verdade para padrão/mínimo/máximo, largura sempre aplicada explicitamente (nunca dependente de estado oculto), restauração que volta ao padrão em vez de gravar um número, e guardas automatizadas contra reintrodução de divergência CSS↔TS. Nenhuma dependência nova; permanece 100% CSS nativo.

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Vite 6

**Primary Dependencies**: React 19 + CSS nativo — nenhuma biblioteca de layout é adicionada

**Storage**: `localStorage` local-first — quadros em `metrik-boards` / `metrik-tasks-<boardId>`; geometria em `metrik-col-widths-<boardId>`

**Testing**: Vitest 3 (jsdom) + React Testing Library; verificação de build com `tsc && vite build`

**Target Platform**: Edge, Chrome, Firefox e Safari modernos; Windows 10/11 e macOS

**Project Type**: Web application (SPA local-first, projeto único)

**Performance Goals**: 60 fps em rolagem e arraste; resolução de geometria < 1 ms por coluna

**Constraints**: paridade de ±1 px; zero identificação de navegador; zero dependências novas; WCAG 2.1 AA

**Scale/Scope**: 2 a 12 colunas por quadro; janelas de 1280 a 2560 px; ampliação de 50% a 200%; densidade de tela de 1,0 a 2,0

**Restrição de verificação (crítica)**: o jsdom **não calcula layout**, portanto nenhuma asserção de geometria real é possível nas suítes atuais. A verificação automatizada cobre os **invariantes** (fonte única, ausência de literais, resolução e limites), e a paridade medida é verificada por sonda em navegador real — ver `research.md` §D6.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Specification-Driven Development** — `spec.md`, `checklists/requirements.md` e `checklists/browser-parity.md` formalizados antes de qualquer código.
- [x] **II. Qualidade & Modularidade** — geometria isolada em módulo puro e sem duplicação; o CSS consome um único conjunto de valores.
- [x] **III. Verificação Automatizada** — novas suítes para geometria e guarda anti-drift; `npm run test` e `npm run build` devem passar limpos.
- [x] **IV. Observabilidade** — divergência de geometria reportada com prefixo `[Metrik Guard]` e os valores medidos (FR-014).
- [x] **V. Simplicidade & YAGNI** — sem bibliotecas, sem sistema de design novo, sem redesenho; correção cirúrgica de duplicação existente.
- [x] **VI. Raciocínio Analítico Pré-Tarefas** — obrigatório na criação de `tasks.md` (fase seguinte, `/speckit-tasks`).
- [x] **VII. Independência de Marca** — terminologia neutra (*Metrik Column Geometry Contract*); nenhuma marca de terceiros.
- [x] **VIII. Soberania Local-First** — nenhuma dependência de nuvem; preferências continuam estritamente locais.

**Post-design re-check (após Fase 1)**: mantido — o design não introduz abstrações especulativas nem dependências; todos os gates seguem satisfeitos. `Complexity Tracking` permanece vazio.

## Project Structure

### Documentation (this feature)

```text
specs/026-cross-browser-column-layout/
├── spec.md
├── plan.md                              # este arquivo
├── research.md                          # Fase 0
├── data-model.md                        # Fase 1
├── quickstart.md                        # Fase 1
├── contracts/
│   └── layout-parity.contract.md        # Fase 1
├── checklists/
│   ├── requirements.md
│   └── browser-parity.md
└── tasks.md                             # /speckit-tasks — NÃO criado por /speckit-plan
```

### Source Code (repository root)

```text
src/
├── utils/
│   └── columnGeometry.ts           # NOVO — fonte única: DEFAULT/MIN/MAX + resolveColumnWidth/clampColumnWidth
├── hooks/
│   └── useColumnWidths.ts          # reusa columnGeometry; restauração limpa a preferência
├── components/
│   ├── Column.tsx                  # usa a largura resolvida; arraste e restauração sem literais
│   └── Board.tsx                   # entrega sempre a largura resolvida (nunca indefinida)
└── App.css                         # custom properties de geometria; sem literais duplicados em .kanban-column

tests/unit/
├── columnGeometry.test.ts          # NOVO — resolução, clamp, limites, entradas inválidas
├── columnGeometryContract.test.ts  # NOVO — guarda anti-drift entre App.css e as constantes TS
├── Board.test.tsx                  # ajuste — largura explícita sempre presente
└── Column.test.tsx                 # ajuste — arraste parte da largura renderizada; restaurar limpa a preferência
```

**Structure Decision**: projeto único (SPA local-first). As alterações ficam confinadas a `src/utils`, `src/hooks`, `src/components/Column.tsx`, `src/components/Board.tsx` e `src/App.css`, mais as suítes em `tests/unit/`. Nenhum diretório novo de produção e nenhuma mudança de esquema de dados.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sem violações constitucionais a justificar.

---

## Diagnóstico Verificado (evidência no código)

| # | Evidência | Arquivo | Impacto |
|---|---|---|---|
| G1 | `width: 290px` fixa | `src/App.css` (`.kanban-column`) | Coluna sem preferência renderiza 290 px |
| G2 | `DEFAULT_COLUMN_WIDTH = 280` | `src/hooks/useColumnWidths.ts` | Coluna com preferência renderiza 280 px → mesma coluna, larguras diferentes conforme o navegador |
| G3 | `min-width: 220px` fixa | `src/App.css` (`.kanban-column`) | Mínimo efetivo de 220 px |
| G4 | `MIN_COLUMN_WIDTH = 200` e literais `200` | `useColumnWidths.ts`, `Column.tsx` | Mínimo efetivo de 200 px quando há preferência: o CSS prevalece e ignora a escolha do usuário |
| G5 | `startWidthRef.current = width \|\| 280` | `Column.tsx` | Coluna renderizada em 290 px **salta** para 280 px no primeiro movimento do arraste |
| G6 | Duplo clique grava `280` | `Column.tsx` | "Restaurar" não retorna ao estado inicial; congela 280 px permanentemente |
| G7 | Nenhuma suíte cobre geometria de coluna | `tests/unit/` | Sem barra vermelha: a divergência não é detectada por nenhum teste |

## Estratégia de Correção (Fases)

- **Fase A — Fundação pura**: criar `src/utils/columnGeometry.ts` com padrão/mínimo/máximo e funções puras `resolveColumnWidth`/`clampColumnWidth`. Escrita dos testes antes da implementação (Red-Bar First).
- **Fase B — Fonte única no CSS**: expor a geometria como custom properties (`--metrik-column-width-default|min|max`) e remover os literais de `.kanban-column`; criar a guarda automatizada que compara CSS e constantes TS.
- **Fase C — Consumo explícito**: `Board.tsx` passa sempre a largura resolvida; `Column.tsx` remove os literais do arraste e faz a restauração limpar a preferência; `useColumnWidths` passa a reusar o módulo puro.
- **Fase D — Paridade e diagnóstico**: sonda de medição em navegador real; diagnóstico `[Metrik Guard]` quando a largura resolvida divergir do esperado (FR-014); matriz de verificação do `quickstart.md`.
- **Fase E — Regressão**: suíte completa verde, build limpo e execução da matriz manual entre navegadores.

## Estratégia de Testes

1. **Unitários puros** (`columnGeometry.test.ts`): resolução com e sem preferência; clamp nos limites; descarte de `NaN`, negativos, `Infinity` e valores fora da faixa (FR-009); padrão sempre finito e dentro da faixa (FR-010).
2. **Guarda anti-drift** (`columnGeometryContract.test.ts`): lê `src/App.css` e exige que as custom properties de geometria sejam exatamente as constantes TS e que `.kanban-column` não contenha literais de largura — protege G1–G4 contra reintrodução.
3. **Componente** (`Column.test.tsx`, `Board.test.tsx`): largura explícita sempre presente no estilo inline; arraste parte da largura **renderizada**; restauração retorna ao padrão e limpa a preferência — protege G5 e G6.
4. **Paridade em navegador real** (manual, roteiro em `quickstart.md`): matriz navegador × janela × ampliação × densidade com tolerância de ±1 px (SC-001 e SC-003).

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| A causa real no Chrome ser ambiental (ampliação/janela) e não o drift de geometria | A Fase D fixa a matriz de comparação (mesma janela e ampliação) antes de concluir; G1–G6 são corrigidos independentemente disso, pois são defeitos verificados |
| Regressão visual nos boards existentes que já têm larguras persistidas | Preferências válidas continuam respeitadas; apenas os valores fora da faixa passam a ser descartados |
| Dependência de medição manual para a paridade | A guarda anti-drift é automatizada; a sonda de medição reduz a paridade a uma comparação numérica objetiva |

## Rollback

Alterações aditivas e de substituição de literais por constantes, sem migração de dados e sem mudança de esquema. Reverter o branch restaura o comportamento anterior; nenhum dado do usuário é perdido (preferências inválidas passam a ser apenas ignoradas).

**Nota de escopo**: o comportamento quando a soma das larguras é **menor** que a janela permanece o atual (larguras fixas, espaço restante livre) — decisão registrada em `research.md` §D7 e alinhada a "Fora de Escopo: redesenho visual". Caso se deseje que as colunas estiquem para preencher a janela, isso exige ajuste na spec via `/speckit-clarify` antes da implementação.
