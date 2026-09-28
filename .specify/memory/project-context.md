# Project Context — Metrik

> Artefato vivo do SDD (skill `sdd-spec-driven`, Seção 9). Precedência:
> `constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` > `plan.md` > `tasks.md` > código.
> Local do `constitution.md`: `.specify/memory/constitution.md`.

---

## 9.1 Identidade do Projeto

**Nome:** Metrik
**Domínio:** Gestão Ágil / Kanban e Analytics de Fluxo (Lean/Agile)
**Propósito:** Quadro Kanban local-first com métricas de fluxo (Lead Time, Cycle Time, CFD, Monte Carlo, WIP Aging, Throughput), governança visual, multi-board e colaboração por squads.
**Fase atual:** [ ] Greenfield  [x] Crescimento  [ ] Maturidade  [ ] Legado
**Versão do pacote:** `0.1.0` (37 features especificadas em `specs/`).

---

## 9.2 Stack Real em Uso

> Documentar apenas o que está efetivamente instalado e em uso (`package.json`).

**Runtime/Linguagem:** Node + TypeScript 5.7 (ES2022, `strict`, `noUnusedLocals`)
**Framework principal:** React 19 + Vite 6 (`@vitejs/plugin-react`)
**Banco de dados:** Nenhum obrigatório. Persistência principal: `localStorage`. Cloud opcional: Supabase (PostgreSQL)
**ORM/Query builder:** `@supabase/supabase-js` (client direto; sem ORM)
**Cache:** Não se aplica
**Fila de mensagens:** Não se aplica
**Autenticação:** Sessão local por usuário/squad (`useTeamAccess`); sem servidor de auth dedicado
**Infra/Cloud:** Opcional (Supabase), estritamente opt-in e fault-tolerant
**CI/CD:** GitHub Actions — `.github/workflows/ci.yml` (`tsc --noEmit` + `vitest --coverage` + `vite build`)
**Monitoramento:** Logs estruturados via prefixo `[Metrik]` no console

**Testes:** Vitest 3 + `@testing-library/react` 16 + `jsdom` 26 (`npm run test`); cobertura via `@vitest/coverage-v8` (`npm run test:coverage`, limiares em `vite.config.ts`)
**Lint:** ESLint 9 (flat config `eslint.config.js`) + `typescript-eslint` + `eslint-plugin-react-hooks` (`npm run lint`; 0 erros, avisos de `any` não bloqueiam)
**Formatação:** Prettier 3 (`.prettierrc.json`, printWidth 100, singleQuote); `npm run format` / `npm run format:check` (exigido no CI)
**Build/typecheck:** `npm run build` (`tsc && vite build`)
**Estilo:** CSS vanilla com design tokens (`src/App.css`); **não há framework CSS instalado**

---

## 9.3 Convenções Estabelecidas no Projeto

**Estilo/CSS:** `src/App.css` é um **manifesto de `@import`** (ordem = cascata); os estilos vivem em `src/styles/*.css` por feature. Nunca reordene os imports — há guarda em `tests/unit/appCssStructure.test.ts`.

**Nomenclatura de arquivos:** Componentes em `PascalCase.tsx`; tipos em `camelCase.ts`; hooks `useXxx.ts`
**Nomenclatura de variáveis:** `camelCase`
**Nomenclatura de funções/métodos:** `camelCase` (verbos)
**Nomenclatura de classes/componentes:** `PascalCase`
**Estrutura de pastas:**
- `src/components/` — componentes de UI (CSS co-localizado em alguns casos)
- `src/hooks/` — lógica de estado e persistência (`useTaskCollection`, `useBoards`, `useTeamAccess`, …)
- `src/types/` — modelos de domínio (`kanban.ts`, `taskTypes.ts`, `taskActivity.ts`, `team.ts`, …)
- `src/utils/` — funções puras (`timeFormatters`, `taskRelations`, `taskActivityLogger`, `simpleMarkdown`, …)
- `src/components/charts/` — visualizações de analytics
- `specs/NNN-feature/` — artefatos SpecKit por feature
- `.specify/memory/` — `constitution.md` e artefatos SDD transversais

**Padrão de imports:** relativos (ex.: `../types/kanban`); sem alias configurado
**Formatação:** Prettier 3 configurado (`.prettierrc.json`) e exigido no CI (`npm run format:check`); ESLint 9 também no CI
**CSS:** classes sem prefixo global único; componentes do modal usam `td-*`; feed de atividade usa `mrf-*`; usar tokens semânticos (`--text-primary`, `--bg-card`, `--color-progress`, …), nunca cores fixas quando houver token

---

## 9.4 Padrões Arquiteturais Identificados

**Padrão geral:** Component-based React + custom hooks; separação util (puro) × hook (estado) × componente (apresentação)
**State management (front):** Hooks customizados sobre `localStorage` (sem Redux/Zustand); sync cloud opcional
**Padrão de API:** Não aplicável no cliente; leitura/escrita via hooks (`useTaskCollection` é a fonte de mutações de tarefa)
**Padrão de autenticação:** TBAC local — papéis `admin`/`member`/`guest` por squad; `guest` é somente leitura
**Padrão de testes:** Vitest + RTL, foco em comportamento; contratos via `data-testid`, `aria-label` e textos visíveis
**Tratamento de erros:** Falha rápida com log `[Metrik]`; supressão defensiva exige comentário justificando no ponto de chamada (Princípio IV)

---

## 9.5 Modelos de Dados Principais

| Entidade | Campos-chave | Relacionamentos | Observações |
|---|---|---|---|
| `TaskModel` | `id`, `title`, `column`, `type`, `priority`, `tags`, `description`, `acceptanceCriteria`, `testScenarios`, `subtasks`, `assignee`, `startDate`/`endDate`/`dueDate`, `createdAt`/`startedAt`/`completedAt`/`lastMovedAt`, `blocked`/`blockedReason`/`totalBlockedMs`, `links`, `comments`, `activityLog` | pertence a uma `ColumnModel`; `links` ↔ outras tarefas/quadros/squads | Tipo em `card` \| `subtask` \| `initiative` |
| `ColumnModel` | `id`, `title`, `category` (`todo`/`in_progress`/`done`), `wipLimit`, `colorScheme`, `color` | contém tarefas | `category` dirige as métricas de fluxo |
| `BoardModel` | `id`, `name`, `teamId`, `createdAt`, `lastAccessed` | pertence a um `Team` | Multi-board |
| `SubtaskModel` | `id`, `title`, `completed` | dentro de `TaskModel.subtasks` | |
| `TaskComment` | `id`, `taskId`, `userId`, `userName`, `text`, `isDecision`, `pinned`, `createdAt` | pertence à tarefa | Suporta Markdown simples |
| `TaskActivityLog` | `id`, `taskId`, `userId`, `userName`, `eventType`, `description`, `fromValue`, `toValue`, `timestamp` | trilha de auditoria da tarefa | Imutável |
| `TaskLinkModel` | `id`, `targetTaskId`, `relationType`, `targetBoardId`, `targetTeamId`, `createdAt` | relação entre tarefas | Relações: `parent`/`child`/`blocks`/`is_blocked_by`/`relates_to` |
| `User` / `Team` / `TeamMember` / `TeamInvitation` | papéis e membership | squads e acesso | |

---

## 9.6 Integrações Externas

| Serviço | Propósito | Autenticação | SDK/Client usado |
|---|---|---|---|
| Google Fonts | Tipografia Inter / JetBrains Mono | Nenhuma (link em `index.html`) | — |
| Supabase (opcional) | Sincronização cloud bidirecional de workspaces/boards/tasks | Credenciais via `.env` (nunca no código) | `@supabase/supabase-js` |

---

## 9.7 Áreas de Atenção e Dívida Técnica Conhecida

- 12 seletores duplicados entre os módulos de `src/styles/` (ex.: `.task-indicators`, `.task-card-header`, `.add-column-card`) — sobreposições que exigem análise de cascata para deduplicar; ratchet em `tests/unit/cssDuplicationGuard.test.ts`.
- `App.tsx` (~28 KB) e `Task.tsx` (~30 KB) ainda concentram várias responsabilidades; já delegam a `BoardTask`/`TaskChecklist`/`useTaskComments`. 
- Paridade de parâmetros de largura de coluna entre navegadores (T023/T024 da feature 026) pendente de execução manual nos quatro navegadores; harness pronto em `specs/026-.../tools/`.
- 4 lacunas de qualidade aceitas na feature 027 (quantificação de latência/fluidez e falha de storage) — ver `specs/027-.../checklists/subtasks-and-comments.md`.

### Resolvido em 2026-09-28 (P1)
- ✅ Somente-leitura do guest deixou de usar callbacks no-op: `Task` passou a receber `isReadOnly` e desabilita as superfícies de escrita (sem edição "fantasma").
- ✅ `isTaskStagnant` passou a usar `lastMovedAt` (setado em `moveTask`/`reorderBoard`) em vez de `updatedAt` — edições não resetam mais o selo "Parado".
- ✅ Edição de comentário disponível no modal (`CommentItem`) e no cartão (`CommentThread`).
- ✅ `TaskModel` já possui `assignee`; `TaskActivityPanel` legado não existe mais.
- ✅ Code-splitting (vendor chunks + analytics) e escopo do Vitest já corrigidos; `testTimeout` elevado para 15s.
- ✅ CI/CD (GitHub Actions) e cobertura com limiares configurados (P2); ESLint 9 no CI com 0 erros (P3).

### Resolvido em 2026-09-28 (P3 — parcial)
- ✅ Lint configurado (`eslint.config.js`) e integrado ao CI; corrigido 1 erro real (`no-extra-boolean-cast` em `wipAgingMetrics.ts`).
- ✅ Auditoria de acessibilidade automatizada com `jest-axe` (`tests/unit/accessibility.test.tsx`) cobrindo `CommentThread`, cartão somente-leitura, cartão editável e `Column` — 0 violações.
- ✅ `App.css` fatiado em `src/styles/*.css` (10 módulos por feature) como manifesto de `@import` em ordem preservada; guarda `tests/unit/appCssStructure.test.ts` e contrato de geometria agora resolve imports. Build gerou CSS idêntico (mesmo hash).
- ✅ Trilhas de comentário consolidadas: `CommentThread` (cartão) agora compõe `CommentItem` (mesmo renderizador do feed de atividade), com `testIdPrefix`; CSS `metrik-comment-*` de item removido.
- ✅ Prettier 3 adotado (`.prettierrc.json`) com `format`/`format:check` no CI; 196 arquivos reformatados num commit isolado.
- ✅ Decomposição (início): mutações de comentário extraídas de `useTaskCollection` para `src/hooks/useTaskComments.ts` (composição por `setBoard`, sem mudança de comportamento).
- ✅ Decomposição: checklist/subtarefas extraído de `Task.tsx` para `src/components/TaskChecklist.tsx` (inclui comentários de subtarefa e confirmação de cascata).
- ✅ Decomposição: cartão conectado do quadro extraído de `App.tsx` para `src/components/BoardTask.tsx` (resolve coluna, iniciativa, bloqueadores e handlers; App passa props).
- ✅ CSS: removidos 6 seletores com ocorrência anterior totalmente sobrescrita (movidos para o módulo final; `line-height` dos chips preservado). Restam **12** duplicados com merge pendente, agora protegidos por ratchet em `tests/unit/cssDuplicationGuard.test.ts`.
- ⏳ Pendentes: deduplicar os 12 seletores restantes (merge; exige análise de cascata); demais responsabilidades de `App.tsx` podem ser extraídas incrementalmente.

---

*Atualizado em: 2026-09-28.*
