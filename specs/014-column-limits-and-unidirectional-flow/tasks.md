# Tasks: Feature 014 — Limite de Colunas com Alerta & Fluxo Unidirecional com Guarda de Métricas

## Pre-Task Analytical Models (Constitution VI)

### 1. Desconstrução por Primeiros Princípios (First-Principles)
- **Natureza do Kanban:** O método Kanban existe para limitar o trabalho em progresso e tornar o fluxo de trabalho visível e previsível.
- **Complexidade de Etapas:** Cada coluna adicionada aumenta os pontos de transição e o esforço cognitivo ($O(N)$ em colunas, $O(N \times M)$ em possíveis gargalos). 12 colunas é mais que o dobro de uma esteira típica (4-5 colunas). Ultrapassar 12 colunas destrói o propósito de clareza do quadro e dilui a eficácia do WIP limit. O aviso `"Excesso de colunas, cuidado."` alerta diretamente sobre esse risco sistêmico.
- **Sentido Único e Entropia de Métricas:** Métricas de fluxo (Lead Time, Cycle Time, Throughput) assumem um vetor direcional monotonically non-decreasing no tempo e no espaço da esteira. Retroceder um item é uma quebra desse axioma: ou o trabalho anterior foi descartado (retrabalho), ou a medição de tempo passa a conter períodos inválidos. Logo, o aviso `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."` e o consequente reset de métricas de fluxo são matematicamente e conceitualmente coerentes.

### 2. Premortem & Análise de Modos de Falha de Limite
- **Modo de Falha 1 (Bypassing do Limite via Drag-and-Drop ou Importação):** Se `MAX_COLUMNS` for checado apenas no botão da UI, importações de arquivo `.json` com mais de 12 colunas poderiam violar a regra.
  - *Mitigação:* Validar tanto no `addColumn` quanto no `isValidBoardState` / importação, ou garantir que o aviso de excesso continue disparando sempre que `columns.length >= 12`.
- **Modo de Falha 2 (Falso Positivo no Fluxo Unidirecional - Reordenação Vertical):** Ao reordenar uma tarefa dentro da mesma coluna (`sourceColumn === targetColumn`), `sourceIdx === targetIdx`. Se a lógica comparasse `>=` em vez de `>`, reordenações internas disparariam o alerta indevidamente.
  - *Mitigação:* `targetIdx < sourceIdx` garante estritamente que o alerta só dispara se a coluna de destino estiver fisicamente à esquerda da coluna de origem.
- **Modo de Falha 3 (Loop de Confirmação em Testes de Unidade):** Se `window.confirm` for invocado diretamente sem fallback ou mock nos testes unitários, os testes travariam.
  - *Mitigação:* Mockar `window.confirm` nos testes com `vi.spyOn(window, 'confirm')`.

### 3. Categorização MECE (Mutuamente Exclusiva e Coletivamente Exaustiva)
- **Direções de Movimento de Tarefa:**
  1. `targetIdx === sourceIdx`: Reordenação intra-coluna (Neutro: sem alerta de regressão).
  2. `targetIdx > sourceIdx`: Avanço no fluxo (Lean Forward: avanço padrão, atualiza `startedAt`/`completedAt` conforme as regras da esteira).
  3. `targetIdx < sourceIdx`: Regressão no fluxo (Backward / Sentido Contrário: dispara confirmação; se confirmada, zera métricas; se cancelada, reverte movimento).
- **Contagem de Colunas:**
  1. `columns.length < 12`: Criação liberada, sem banner de alerta de excesso.
  2. `columns.length === 12`: Criação bloqueada, banner `"Excesso de colunas, cuidado."` visível.
  3. `columns.length > 12`: Criação bloqueada, banner `"Excesso de colunas, cuidado."` visível.

### 4. Árvore de Decisão e Trade-offs (Tree of Thoughts)
- **Decisão: Bloqueio Estrito vs Confirmação com Reset de Métricas**
  - *Abordagem A (Bloqueio Total / Proibição Absoluta):* O usuário nunca pode arrastar para a esquerda.
    - *Contra:* Em cenários do mundo real, um card pode ter sido movido por engano para a coluna errada (erro de digitação/arraste). Proibir totalmente força o usuário a deletar e recriar o card.
  - *Abordagem B (Confirmação Consciente com Alerta e Reset Integral das Métricas — Escolhida):* Exibe o diálogo com o texto exato `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."`. Se o usuário recusar, o card é bloqueado e não se move. Se o usuário aceitar conscientemente, o card volta e suas métricas são zeradas, atendendo perfeitamente à regra do sentido único.

### 5. Critério de Falsificabilidade & Testabilidade (TDD / Red-Bar First)
- Teste 1: Tentar chamar `addColumn` quando o quadro já tiver 12 colunas. Deve recusar a adição e manter o total em 12.
- Teste 2: Renderizar `Board` com 12 colunas. Deve renderizar texto `"Excesso de colunas, cuidado."`.
- Teste 3: Chamar `reorderBoard` ou `moveTask` da coluna 2 para a coluna 0 recusando a confirmação (`confirm -> false`). O quadro deve manter o card na coluna 2.
- Teste 4: Chamar `reorderBoard` ou `moveTask` da coluna 2 para a coluna 0 aceitando a confirmação (`confirm -> true`). O card deve ir para a coluna 0 com `startedAt`, `completedAt` e `totalBlockedMs` limpos/resetados.

### 6. Triangulação Adversarial & Verificação Constitucional (Polygraph Verification)
- **Constituição II & V (Modularity & Minimal Footprint):** Zero dependências externas instaladas. Utiliza puramente React e TypeScript nativo.
- **Constituição III (Automated Verification):** 100% dos testes da suíte devem passar e o bundle de produção deve compilar com zero erros de tipagem.

---

## Tasks

### Phase 1: Core Domain Rules & Utility Updates
- [x] T001 Definir constante `MAX_COLUMNS = 12` e `FLOW_REGRESSION_WARNING_MESSAGE` em `src/types/kanban.ts`.
- [x] T002 Atualizar `src/utils/taskReorder.ts` para suportar detecção de regressão e reset de métricas em movimentações retrógradas.
- [x] T003 Atualizar `src/hooks/useTaskCollection.ts` para aplicar o teto máximo de 12 colunas em `addColumn` e guarda de sentido único em `moveTask` e `reorderOrMoveTask`.

### Phase 2: Unit Testing Core Logic
- [x] T004 Criar `tests/unit/columnLimitAndFlowGuard.test.tsx` testando o limite de 12 colunas em `addColumn`, recusa da 13ª, e os comportamentos de recusa e aceitação de movimento retrógrado com reset de métricas.

### Phase 3: UI Components & Visual Warnings
- [x] T005 Criar modal de criação de colunas `src/components/NewColumnModal.tsx`.
- [x] T006 Atualizar `src/components/Board.tsx` para renderizar o banner de alerta `"Excesso de colunas, cuidado."` e o botão "+ Nova Coluna" (desabilitado se $\ge 12$).
- [x] T007 Conectar modal e estados no `src/App.tsx`.
- [x] T008 Adicionar estilos CSS em `src/App.css` para o banner de excesso de colunas e o botão/modal de criação de colunas.

### Phase 4: Integration Verification & Regression Tests
- [x] T009 Executar `npm test` garantindo 100% de aprovação em todos os arquivos de teste.
- [x] T010 Executar `npm run build` garantindo zero erros de tipagem TypeScript e empacotamento Vite.
- [x] T011 Atualizar `tasks.md` e registrar commit no Git.
