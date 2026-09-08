# Research: Limites de WIP e Métricas de Fluxo (Lead Time e Cycle Time)

**Feature**: `002-wip-limits-and-flow-metrics`  
**Date**: 2026-09-08  
**Status**: Concluído

---

## 1. Persistência de Limites de WIP e Retrocompatibilidade

### Decisão
Armazenar as configurações de limites de WIP na chave dedicada `metrik_column_wip_limits` no `localStorage`, separada da chave `metrik_kanban_tasks` da Fase 1, usando a tipagem `Record<ColumnType, number | null>`.

### Racional
- **Isolamento de Responsabilidade (Princípio da Responsabilidade Única - SRP)**: As tarefas pertencem ao estado do quadro (`BoardState`), enquanto os limites de WIP pertencem à política de governança do fluxo da coluna.
- **Retrocompatibilidade Garantida (Zero Breaking Changes)**: Os dados de cartões da Fase 1 (`metrik_kanban_tasks`) continuam 100% válidos. Se a chave `metrik_column_wip_limits` não existir no storage, o sistema injeta os limites padrão de seed (`In Progress: 3`, `Blocked: 2`, `Todo: null`, `Completed: null`).

### Alternativas Consideradas
- *Alternativa A: Fundir limites e tarefas num único objeto gigante sob `metrik_kanban_tasks`*: Descartada porque quebraria o validador `isValidBoardState()` da Fase 1 e exigiria migração complexa de schema.
- *Alternativa B: Limites fixos hardcoded no código*: Descartada porque viola o requisito `FR-001` (configurável pelo usuário).

---

## 2. Timestamps de Transição no `TaskModel`

### Decisão
Estender a interface `TaskModel` com propriedades opcionais:
```typescript
export interface TaskModel {
  id: string;
  title: string;
  column: ColumnType;
  createdAt: string;       // ISO 8601 (obrigatório)
  updatedAt?: string;      // ISO 8601
  startedAt?: string;      // ISO 8601 (registrado ao entrar em In Progress)
  completedAt?: string;    // ISO 8601 (registrado ao entrar em Completed)
}
```

### Racional
- **Idempotência**:
  - Quando o cartão move para `In Progress` pela primeira vez, se `startedAt` for `undefined`, atribui `new Date().toISOString()`. Se já tiver valor, mantém o original (preservando o início real do ciclo).
  - Quando move para `Completed`, atribui `completedAt = new Date().toISOString()`.
  - Se o cartão for reaberto (movido para fora de `Completed`), `completedAt` é limpo (`undefined`).
- **Compatibilidade**: Por serem campos opcionais (`?`), todas as tarefas antigas persistidas continuam sendo carregadas sem erro.

### Alternativas Consideradas
- *Array histórico de eventos de transição (`history: TransitionEvent[]`)*: Descartado para a Fase 2 (YAGNI). Para Lead Time e Cycle Time essenciais, apenas `createdAt`, `startedAt` e `completedAt` são matematicamente necessários.

---

## 3. Algoritmo de Cálculo de Métricas e Formatador de Duração

### Decisão
Implementar um utilitário puro em `src/utils/timeFormatters.ts`:
- `calculateLeadTimeMs(task: TaskModel): number | null`: Retorna `completedAt - createdAt`.
- `calculateCycleTimeMs(task: TaskModel): number | null`: Retorna `completedAt - (startedAt || createdAt)`.
- `formatDuration(ms: number | null): string`: Formata milissegundos em texto compacto legível por humanos:
  - `< 60_000` (menos de 1 minuto): `"< 1m"`
  - `< 3_600_000` (minutos): `"${m}m"`
  - `< 86_400_000` (horas): `"${h}h ${m}m"`
  - `>= 86_400_000` (dias): `"${d}d ${h}h"`
  - `null` ou inválido: `"-"`

### Racional
Zero dependências externas (sem `moment`, sem `date-fns`). Implementação puramente funcional, imutável e com custo de bundle de 0 KB adicionais.

---

## 4. Política de Soft WIP Limit vs. Hard WIP Limit

### Decisão
Adotar exclusivamente a política de **Soft WIP Limit**:
- O usuário **pode** mover ou criar cartões além do limite configurado.
- A violação dispara um estado visual enfático de sobrecarga (classe `.kanban-column-wip-exceeded`, badge `4/3 ⚠️` e borda âmbar pulsante).

### Racional
O Método Kanban original preza pela autonomia da equipe e pela visibilidade dos problemas reais. Bloquear artificialmente o clique gera fricção e frustração no usuário durante emergências operacionais. A sobrecarga deve ser visível, evidente e desconfortável, mas nunca um impedimento técnico imposto pelo software.

---

## 5. Performance e Memoização da Barra de Métricas

### Decisão
Criar o hook `useFlowMetrics(tasks: TaskModel[])` utilizando `useMemo` com dependência estrita no array de tarefas da coluna `Completed`.

### Racional
Garante que cálculos de média aritmética e agregação sejam disparados **única e exclusivamente** quando uma tarefa for concluída, reaberta ou excluída. Em operações normais de edição de texto em `Todo` ou `In Progress`, a barra de métricas permanece 100% memorizada, com tempo de execução de 0ms.
