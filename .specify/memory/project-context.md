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
**Build/typecheck:** `npm run build` (`tsc && vite build`)
**Estilo:** CSS vanilla com design tokens (`src/App.css`); **não há framework CSS instalado**

---

## 9.3 Convenções Estabelecidas no Projeto

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
**Formatação:** sem ESLint/Prettier configurados (a Constituição v1.6.3 reconhece: sem gate de lint, sem obrigação de lint)
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

- `src/App.css` monolítico (~3.470 linhas) com seletores duplicados (ex.: `.kanban-column`, `.task-indicators`, `.task-card-header` aparecem mais de uma vez) — risco de overrides silenciosos.
- Arquivos grandes com múltiplas responsabilidades: `Task.tsx` (~38 KB), `useTaskCollection.ts` (~34 KB), `App.tsx` (~32 KB) — candidatos a decomposição (SRP).
- Sem CI/CD (nenhum `.github/workflows`) e sem gate de lint/format (ESLint/Prettier) — a Constituição v1.6.3 reconhece a ausência de lint.
- Sem cobertura de testes configurada (`coverage` ausente no Vitest).
- Comentários ainda têm dois caminhos de renderização (`CommentThread` no cartão × `CommentItem` no modal); a edição já existe em ambos.
- Paridade de parâmetros de largura de coluna entre navegadores (T023/T024 da feature 026) pendente de execução manual nos quatro navegadores; harness pronto em `specs/026-.../tools/`.
- 4 lacunas de qualidade aceitas na feature 027 (quantificação de latência/fluidez e falha de storage) — ver `specs/027-.../checklists/subtasks-and-comments.md`.

### Resolvido em 2026-09-28 (P1)
- ✅ Somente-leitura do guest deixou de usar callbacks no-op: `Task` passou a receber `isReadOnly` e desabilita as superfícies de escrita (sem edição "fantasma").
- ✅ `isTaskStagnant` passou a usar `lastMovedAt` (setado em `moveTask`/`reorderBoard`) em vez de `updatedAt` — edições não resetam mais o selo "Parado".
- ✅ Edição de comentário disponível no modal (`CommentItem`) e no cartão (`CommentThread`).
- ✅ `TaskModel` já possui `assignee`; `TaskActivityPanel` legado não existe mais.
- ✅ Code-splitting (vendor chunks + analytics) e escopo do Vitest já corrigidos; `testTimeout` elevado para 15s.

---

*Atualizado em: 2026-09-28.*
