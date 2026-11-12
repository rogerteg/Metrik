# Data Model: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso

**Feature**: `058-flow-leverage-simulator`  
**Date**: 2026-11-12  
**Status**: Completed  

---

## 1. Entidades Principais & Tipos de Domínio

### 1.1 `FlowLeverageCategory`
Classificação semântica do tipo de alavanca de fluxo identificada no quadro:
```typescript
export type FlowLeverageCategory =
  | 'cascade_unblock'   // Desbloqueio de item que retém tarefas a jusante
  | 'aging_swarming'    // Foco em item crítico que ultrapassou o SLE P85
  | 'wip_reduction';    // Otimização de gargalo por redução de WIP (Lei de Little)
```

### 1.2 `FlowLeverageItem`
Representa uma oportunidade cirúrgica de intervenção para reduzir o prazo P85:
```typescript
export interface FlowLeverageItem {
  id: string;                      // Identificador único da alavanca (ex.: "lev-task-123")
  taskId: string;                  // ID da tarefa alvo no quadro
  taskTitle: string;               // Título da tarefa alvo
  category: FlowLeverageCategory;  // Categoria da intervenção
  impactDaysP85: number;           // Dias projetados de economia no horizonte P85 se resolvida
  dependentTaskCount: number;      // Quantidade de tarefas a jusante destravadas
  dependentTaskIds: string[];      // IDs das tarefas beneficiadas
  currentAgingDays: number;        // Idade atual da tarefa em dias
  rationale: string;               // Justificativa estatística legível em linguagem natural
  columnId?: string;               // Coluna atual da tarefa
  columnTitle?: string;            // Título da coluna
}
```

### 1.3 `CascadeImpactResult`
Resultado da travessia direcionada do grafo de dependências e bloqueios:
```typescript
export interface CascadeImpactResult {
  rootTaskId: string;              // Tarefa bloqueadora analisada
  dependentTaskIds: string[];      // Todas as tarefas a jusante retidas
  maxDepth: number;                // Profundidade máxima da cadeia de dependência
  hasCycle: boolean;               // Indicador de ciclo circular detectado
  cycleTaskIds?: string[];         // Tarefas envolvidas no ciclo (se houver)
  estimatedDelayDaysP85: number;   // Atraso cumulativo estimado em dias no P85
}
```

### 1.4 `SimulatedPolicyScenario`
Estrutura em memória representando o cenário "What-If" de políticas de fluxo:
```typescript
export interface SimulatedPolicyScenario {
  boardId: string;
  scopeType: 'all' | 'initiative' | 'sprint';
  scopeId?: string;
  currentWipByColumn: Record<string, number>;          // WIP ativo por coluna
  configuredLimits: Record<string, number | null>;     // Limites reais do quadro
  simulatedLimits: Record<string, number | null>;      // Limites ajustados no simulador
  swarmingEnabled: boolean;                            // Foco prioritário em itens > P85
  currentCycleTimeP50: number;                         // Tempo de ciclo P50 atual (dias)
  currentCycleTimeP85: number;                         // Tempo de ciclo P85 atual (dias)
  simulatedCycleTimeP50: number;                       // Tempo de ciclo P50 projetado (dias)
  simulatedCycleTimeP85: number;                       // Tempo de ciclo P85 projetado (dias)
  deltaDaysP85: number;                                // Ganho em dias (negativo = aceleração)
  averageDailyThroughput: number;                      // Vazão média diária da equipe
  isSampleSufficient: boolean;                         // Validação NIST (N >= 10)
}
```

### 1.5 `TopLeveragesSummary`
Resumo compacto das 3 principais alavancas para consumo rápido no painel e na Mika:
```typescript
export interface TopLeveragesSummary {
  boardId: string;
  calculatedAt: string;            // Timestamp ISO de cálculo
  items: FlowLeverageItem[];       // Top 3 ordenados por impactDaysP85 desc
  isSampleSufficient: boolean;     // Confiança estatística NIST
  deliveryDaysCount: number;       // Dias de entrega observados no histórico
}
```

---

## 2. Relações com o Modelo Existente

```
TaskModel (Kanban)
   ├── links: TaskLinkModel[] ───► Analisado por calculateCascadeImpact()
   ├── blocked & blockedReason ──► Identificado para alavanca 'cascade_unblock'
   └── startedAt & lastMovedAt ──► Cruzado com CardSlePrediction para 'aging_swarming'

ColumnModel (Quadro)
   ├── wipLimit ─────────────────► Ponto de partida para simulação de WIP
   └── category: 'in_progress' ──► Alvo da Lei de Little no simulador

MikaMonteCarloTelemetry (AI)
   └── topLeverages ─────────────► Snapshot injetado na telemetria estocástica da Mika
```

---

## 3. Validações e Regras de Negócio

1. **Proteção de Ciclos**: A travessia de dependências (`blocks`, `is_blocked_by`, `parent`, `child`) utiliza pilha de recursão para identificar repetições; se uma tarefa já estiver na pilha corrente, a travessia registra `hasCycle = true` e interrompe aquele ramo sem lançar exceções.
2. **Isolamento de Escopo (Sandbox)**: `SimulatedPolicyScenario` nunca altera `board.columns` diretamente; modificações só ocorrem via ação voluntária do usuário no botão de confirmação (`onSavePolicy`).
3. **Resguardo NIST**: Se o quadro tiver menos de 10 dias com entregas ($N < 10$), `isSampleSufficient` é marcado como `false`, exibindo aviso de margem de erro elevada sem suprimir as análises de dependências estruturais.
4. **Ordenação das Alavancas**: As alavancas são estritamente ordenadas por `impactDaysP85` decrescente; em caso de empate, o desempate favorece a alavanca com maior número de tarefas dependentes (`dependentTaskCount`).

