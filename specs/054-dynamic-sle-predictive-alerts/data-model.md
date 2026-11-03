# Data Model: 054 — Previsibilidade Dinâmica & Alertas de SLE

**Feature**: `054-dynamic-sle-predictive-alerts`  
**Date**: 2026-11-03  
**Status**: Completed  

---

## 1. Modelos de Domínio

### 1.1 `SleRiskLevel` (Enumeração / Tipo União)
Representa o nível de risco probabilístico de quebra de SLE de um cartão:
```typescript
export type SleRiskLevel =
  | 'normal'            // Aging < P50 (Dentro do ritmo típico saudável)
  | 'warning_p50'       // P50 <= Aging < P85 (Ultrapassou a mediana)
  | 'risk_p85'          // P85 <= Aging < P95 (Ultrapassou o SLE acordado)
  | 'critical_p95'      // Aging >= P95 (Cauda longa extrema / risco severo)
  | 'insufficient_data';// Menos de 5 tarefas concluídas para inferência
```

### 1.2 `SleThresholds`
Parâmetros percentis consolidados do quadro a partir do histórico de tarefas concluídas:
```typescript
export interface SleThresholds {
  p50Days: number;
  p85Days: number;
  p95Days: number;
  sampleSize: number;
  isStatisticallySignificant: boolean; // sampleSize >= 5
}
```

### 1.3 `CardSlePrediction`
Diagnóstico preditivo calculado para um cartão individual:
```typescript
export interface CardSlePrediction {
  taskId: string;
  agingDays: number;
  thresholds: SleThresholds;
  effectiveTargetDays: number; // P85 observado ou customTargetDays
  riskLevel: SleRiskLevel;
  daysToBreach: number;        // Diferença: effectiveTargetDays - agingDays (negativo = estourado)
  percentageOfTarget: number;  // (agingDays / effectiveTargetDays) * 100
  label: string;               // Ex: "Atenção (P50)", "Risco SLE (P85)", "Crítico (P95)"
}
```

### 1.4 `SleConfig`
Configuração personalizada do quadro para expectativas de nível de serviço:
```typescript
export interface SleConfig {
  boardId: string;
  customTargetDays: number | null; // null = dinâmico pelo P85 observado
  enableP50Alert: boolean;         // default: true
  enableP95Alert: boolean;         // default: true
  updatedAt: string;
}
```

---

## 2. Esquema de Armazenamento Local-First (`localStorage`)

- **Chave de armazenamento**: `metrik_sle_config_${boardId}`
- **Valor padrão**:
  ```json
  {
    "boardId": "default-board",
    "customTargetDays": null,
    "enableP50Alert": true,
    "enableP95Alert": true,
    "updatedAt": "2026-11-03T14:00:00.000Z"
  }
  ```
- **Resiliência a falhas**: Parser com validação de esquema; em caso de JSON inválido, retorna os valores padrão com aviso controlado `[Metrik][SLE]`.

