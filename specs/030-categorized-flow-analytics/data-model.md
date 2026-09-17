# Data Model: Distribuição e Categorização dos Gráficos Analíticos de Fluxo

**Feature Branch**: `030-categorized-flow-analytics`  
**Date**: 2026-09-17  
**Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

---

## 1. Definições de Tipos e Entidades Analíticas

### 1.1 `AnalyticsCategory` (Categorias da Navegação Analítica)
Representa as 8 seções analíticas de alto nível exibidas na barra superior:

```typescript
export type AnalyticsCategory =
  | 'dashboard'    // Visão consolidada executiva com cartões de síntese
  | 'cycle-time'   // Dispersão e histograma de tempo de ciclo
  | 'throughput'   // Ritmo de entrega e histograma de vazão
  | 'wip'          // Envelhecimento do trabalho em progresso (WIP Aging)
  | 'flow'         // Diagrama de Fluxo Cumulativo (CFD) e estabilidade
  | 'blockers'     // Agrupamento (clustering) e dinâmica de impedimentos
  | 'sles'         // Expectativas de Nível de Serviço e conformidade
  | 'forecasting'; // Previsibilidade com Simulação de Monte Carlo
```

---

### 1.2 `ServiceLevelExpectation` (Expectativa de Nível de Serviço / SLE)
Representa o indicador de compromisso de prazo baseado em probabilidade histórica ou meta estipulada:

```typescript
export interface ServiceLevelExpectation {
  /** Percentil estatístico de referência (padrão: 85) */
  targetPercentile: number;
  /** Prazo em dias calculado a partir do histórico (NIST Nearest Rank) */
  observedDays: number;
  /** Meta de dias configurada manualmente pela equipe (opcional) */
  targetDays?: number | null;
  /** Taxa percentual de conformidade real observada (0 a 100%) */
  complianceRate: number;
  /** Total de itens concluídos analisados na amostra */
  sampleSize: number;
  /** Data mais recente considerada no cálculo */
  calculatedAt: string;
}
```

---

### 1.3 `BlockerCluster` e `BlockerDynamicsSummary` (Métricas de Impedimento)
Estrutura para as duas sub-visões especializadas de bloqueios:

```typescript
export interface BlockerClusterItem {
  /** Causa raiz ou motivo textual normalizado do bloqueio */
  reason: string;
  /** Quantidade de tarefas que sofreram este impedimento */
  occurrenceCount: number;
  /** Percentual do total de ocorrências */
  percentage: number;
  /** Duração acumulada em milissegundos retida por este motivo */
  totalDurationMs: number;
  /** Média de dias retidos por ocorrência */
  avgDurationDays: number;
}

export interface BlockerDynamicsSummary {
  /** Total de tarefas que já foram ou estão bloqueadas */
  totalBlockedTasks: number;
  /** Duração total acumulada em bloqueio no quadro (ms) */
  accumulatedBlockedMs: number;
  /** Percentual de impacto do bloqueio no Lead Time total das tarefas */
  impactOnLeadTimePercentage: number;
  /** Lista ordenada de clusters por frequência/impacto */
  clusters: BlockerClusterItem[];
}
```

---

### 1.4 `DatasetFilterConfig` (Configuração do Escopo de Amostragem)
Representa as preferências ativas do conjunto de dados selecionadas na gaveta lateral:

```typescript
export type DatasetTimeWindow = 14 | 30 | 90 | 180 | 'all' | 'custom';

export interface DatasetFilterConfig {
  /** Janela temporal predefinida em dias */
  timeWindow: DatasetTimeWindow;
  /** Data inicial ISO para intervalo customizado */
  customStartDate?: string;
  /** Data final ISO para intervalo customizado */
  customEndDate?: string;
  /** Filtro opcional por tipo de item ('card' | 'subtask' | 'initiative') */
  selectedTypes?: string[];
  /** Visão salva ativa (opcional) */
  savedViewId?: string;
}
```

---

## 2. Invariantes de Negócio & Integridade

1. **Invariante de Dados Históricos Mínimos (Zero-Divide Guard)**:
   - Se a amostra de cartões concluídos for inferior a 1, `ServiceLevelExpectation.observedDays` deve retornar `0` e `complianceRate` `100%`, com flag visual informativa indicando amostra insuficiente.

2. **Invariante de Preservação Local-First (State Isolation)**:
   - Alterações no `DatasetFilterConfig` são mantidas em memória reativa de sessão, com persistência opcional das preferências no `localStorage` sob a chave `metrik_dataset_filter`, sem dependência de rede.

3. **Invariante de Segurança e Isolamento de Squads (TBAC)**:
   - Os cálculos de SLE, Throughput e CFD de um determinado quadro operam exclusivamente sobre tarefas associadas ao `board.id` ativo e acessíveis pela squad correspondente.
