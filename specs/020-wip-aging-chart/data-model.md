# Data Model & Architecture: Feature 020 - Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

**Feature**: `020-wip-aging-chart` | **Date**: 2026-09-11

---

## 1. Estruturas de Entidades e Tipos de Dados

### 1.1 `AgingWorkItem` (Item de Trabalho Ativo em Envelhecimento)
```typescript
export interface AgingWorkItem {
  id: string;
  title: string;
  columnId: string;
  columnTitle: string;
  ageDays: number;              // Idade total no fluxo em dias corridos (precisão decimal)
  timeInStageDays: number;       // Tempo decorrido na coluna atual
  createdAt: string;            // ISO 8601
  startedAt?: string;           // ISO 8601
  isBlocked?: boolean;          // Verdadeiro se a tarefa possuir impedimento/bloqueio
  blockedReason?: string;
  riskZone: 'green' | 'yellow' | 'orange' | 'red';
}
```

### 1.2 `StagePacePercentiles` (Faixas de Ritmo da Coluna)
```typescript
export interface StagePacePercentiles {
  columnId: string;
  columnTitle: string;
  sampleCount: number;          // Quantidade de tarefas concluídas usadas no cálculo
  isFallback: boolean;          // Verdadeiro se utilizou fallback do ciclo global (< 3 amostras)
  p50: number;                  // Mediana (topo da zona verde)
  p70: number;                  // 70% (topo da zona amarela)
  p85: number;                  // 85% SLE (topo da zona laranja)
  p95: number;                  // 95% Cauda (início da zona vermelha)
}
```

### 1.3 `StageWipColumn` (Coluna Agrupada com WIP e Geometria)
```typescript
export interface StageWipColumn {
  id: string;
  title: string;
  wipCount: number;             // Quantidade total de cartões em andamento nesta etapa
  items: AgingWorkItem[];       // Tarefas ativas pertencentes a esta etapa
  percentiles: StagePacePercentiles;
}
```

### 1.4 `WipAgingControlState` (Estado dos Controles do Gráfico)
```typescript
export interface WipAgingControlState {
  showP50: boolean;
  showP70: boolean;
  showP85: boolean;
  showP95: boolean;
  highlightBlockedOnly: boolean;
  highlightStalled: boolean;
  referenceDate: string;        // Formato 'YYYY-MM-DD' (Data "As of")
}
```

---

## 2. Invariantes Matemáticas e Relações de Ordem

1. **Ordenação dos Percentis por Etapa**:
   $$0 \le P_{50} \le P_{70} \le P_{85} \le P_{95}$$
2. **Definição Estrita das Zonas de Risco**:
   - $\text{green}$: $\text{age} < P_{50}$
   - $\text{yellow}$: $P_{50} \le \text{age} < P_{70}$
   - $\text{orange}$: $P_{70} \le \text{age} < P_{95}$
   - $\text{red}$: $\text{age} \ge P_{95}$
3. **Conservação de WIP**:
   $$\text{WIP Total} = \sum_{\text{colunas ativas}} \text{wipCount} = \sum \text{items.length}$$
