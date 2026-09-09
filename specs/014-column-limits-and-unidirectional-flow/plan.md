# Plan: Feature 014 — Limite de Colunas com Alerta & Fluxo Unidirecional com Guarda de Métricas

## 1. Technical Architecture & Decisions

### 1.1 Limite Rígido de Colunas (`MAX_COLUMNS = 12`)
- **Constante Global:** Definir `export const MAX_COLUMNS = 12;` em `src/types/kanban.ts` ou `src/utils/columnLimits.ts`.
- **Guarda em `useTaskCollection.ts`:**
  - Em `addColumn`:
    ```ts
    if (prev.columns.length >= MAX_COLUMNS) {
      console.warn(`[Metrik] Limite máximo de ${MAX_COLUMNS} colunas atingido.`);
      return prev;
    }
    ```
- **Alerta Visual de Excesso:**
  - Componente de alerta (`ColumnLimitBanner` ou banner no `Board.tsx`):
    ```tsx
    {columns.length >= MAX_COLUMNS && (
      <div className="column-limit-warning-banner" role="alert">
        <span className="warning-icon">⚠️</span>
        <strong>Excesso de colunas, cuidado.</strong>
        <span>O quadro atingiu a capacidade máxima recomendada de 12 colunas.</span>
      </div>
    )}
    ```
- **Interface de Criação de Colunas (`NewColumnModal.tsx` ou Botão `+ Adicionar Coluna`):**
  - Botão "+ Nova Coluna" exibido no cabeçalho ou ao lado das colunas.
  - Se `columns.length >= MAX_COLUMNS`, o botão fica desabilitado com tooltip indicando o teto atingido.
  - Formulário com: Título (obrigatório), Categoria (`todo`, `in_progress`, `done`) e Limite WIP opcional.

### 1.2 Guarda de Fluxo Unidirecional (Sentido Único)
- **Detecção de Movimento Retrógrado:**
  - Uma esteira Kanban flui estritamente da esquerda para a direita.
  - Índices das colunas no array `board.columns`:
    - `sourceIdx = columns.findIndex(c => c.id === sourceColId)`
    - `targetIdx = columns.findIndex(c => c.id === targetColId)`
    - `isBackwardMove = sourceIdx !== -1 && targetIdx !== -1 && targetIdx < sourceIdx;`
- **Mensagem de Alerta:**
  - Texto exato: `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."`
  - Ao detectar `isBackwardMove`:
    - Chamar confirmação/alerta: `window.confirm(FLOW_REGRESSION_WARNING_MESSAGE)`.
    - Se cancelado (`false`): abortar a movimentação. O estado do quadro permanece inalterado.
    - Se confirmado (`true`):
      - Efetuar a movimentação.
      - **Reset Integral de Métricas de Fluxo da Tarefa**:
        ```ts
        startedAt: targetCol.category === 'in_progress' ? nowIso : undefined,
        completedAt: undefined,
        totalBlockedMs: undefined,
        blocked: false,
        blockedAt: undefined,
        blockedReason: undefined,
        ```
        Dessa forma, o cartão perde o histórico acumulado prévio e recomeça seu ciclo do zero na etapa anterior.

## 2. File Changes & Interfaces

### 2.1 Modificados
- `src/types/kanban.ts`:
  - Adicionar constante `MAX_COLUMNS = 12`.
- `src/hooks/useTaskCollection.ts`:
  - Travar `addColumn` quando `columns.length >= MAX_COLUMNS`.
  - Integrar guarda de confirmação e reset de métricas em `moveTask` e `reorderOrMoveTask`.
- `src/utils/taskReorder.ts`:
  - Adicionar suporte a parâmetro de reset de métricas de fluxo quando houver movimento para trás.
- `src/components/Board.tsx`:
  - Renderizar banner de alerta quando `columns.length >= MAX_COLUMNS`.
  - Incluir botão para acionar modal de criação de coluna.
- `src/App.tsx`:
  - Conectar handlers de criação de coluna.
- `src/App.css`:
  - Estilização do banner `.column-limit-warning-banner` e do botão de adicionar coluna.

### 2.2 Novos Arquivos
- `src/components/NewColumnModal.tsx`:
  - Modal acessível para inserção de nova coluna (Título, Categoria, Limite WIP).
- `tests/unit/columnLimitAndFlowGuard.test.ts`:
  - Testes unitários para limite de 12 colunas e confirmação de fluxo retrógrado com reset de métricas.

## 3. Verification Plan
- **Testes Unitários:**
  - Adicionar até 12 colunas com sucesso.
  - Tentar adicionar a 13ª coluna e verificar que o array continua com 12 colunas.
  - Mover card para frente (esquerda -> direita): sem alerta, métricas preservadas.
  - Mover card para trás (direita -> esquerda) com cancelamento: card não é movido.
  - Mover card para trás com confirmação: card é movido e `startedAt`, `totalBlockedMs` são limpos.
  - Teste de renderização do banner `"Excesso de colunas, cuidado."`.
- **Verificação Geral:**
  - `npm test` passando 100%.
  - `npm run build` compilando sem avisos.
