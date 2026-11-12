# Modelo de Dados: Mika AI Copilot Preditivo de Monte Carlo

**Feature**: `057-mika-monte-carlo-copilot`  
**Date**: 2026-11-05  
**Spec Reference**: [`specs/057-mika-monte-carlo-copilot/spec.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/057-mika-monte-carlo-copilot/spec.md)  

---

## 1. Entidades Principais e Atributos

### 1.1 `MikaMonteCarloTelemetry`
Snapshot compilado da situação estocástica do quadro para alimentar tanto o motor determinístico local quanto o prompt do Gemini.

| Atributo | Tipo | Descrição |
|:---|:---|:---|
| `sampleValidation` | `ThroughputSampleValidation` | Resultado da avaliação de suficiência amostral NIST ($N \ge 10$ dias de entregas). |
| `initiatives` | `MikaInitiativeForecastSummary[]` | Previsões estocásticas de cada iniciativa ativa no quadro. |
| `activeSprint` | `MikaSprintForecastSummary` (opcional) | Previsão e probabilidade de cumprimento do prazo da sprint ativa. |
| `defaultCapacity14Days` | `MikaCapacityForecastSummary` (opcional) | Simulação de quantos itens cabem em uma janela típica de 14 dias. |
| `generalBacklogPendingCount` | `number` | Total de tarefas pendentes abertas no quadro. |
| `generalBacklogP85Days` | `number` | Dias corridos estimados no percentil P85 para concluir todo o backlog. |
| `generalBacklogP85Date` | `string` (YYYY-MM-DD) | Data de calendário projetada no percentil P85. |

---

### 1.2 `MikaInitiativeForecastSummary`
Representa o diagnóstico probabilístico individual de uma iniciativa.

| Atributo | Tipo | Descrição |
|:---|:---|:---|
| `id` | `string` | Identificador único da tarefa tipo iniciativa. |
| `title` | `string` | Título da iniciativa. |
| `pendingCount` | `number` | Quantidade de tarefas vinculadas ainda pendentes. |
| `completedCount` | `number` | Quantidade de tarefas vinculadas já concluídas. |
| `targetDate` | `string` (opcional) | Data alvo/prazo cadastrado na iniciativa (`dueDate` ou `endDate`). |
| `p50Days` / `p50Date` | `number` / `string` | Percentil P50 (Cenário otimista / mediana). |
| `p85Days` / `p85Date` | `number` / `string` | Percentil P85 (Cenário recomendado / SLE de entrega). |
| `p95Days` / `p95Date` | `number` / `string` | Percentil P95 (Cenário conservador / cauda longa). |
| `targetProbability` | `number` (0 a 100, opcional) | Probabilidade percentual de entrega até a `targetDate`. |
| `riskLevel` | `TargetDateRiskLevel` (opcional) | `'low'` \| `'moderate'` \| `'high'` \| `'critical'`. |

---

### 1.3 `MikaForecastActionPayload`
Ação consultiva interativa anexada às respostas da Mika para navegação contextual direta.

| Atributo | Tipo | Descrição |
|:---|:---|:---|
| `type` | `'NAVIGATE_TO_FORECAST'` | Identificador do tipo de ação. |
| `label` | `string` | Texto do botão de ação (ex: *"📊 Ver Simulação Completa da Iniciativa"*). |
| `scopeType` | `'initiative' \| 'sprint' \| 'all' \| 'tag'` | Tipo de escopo a ser pré-selecionado no painel. |
| `scopeId` | `string` (opcional) | ID específico da iniciativa, sprint ou tag. |

---

## 2. Relacionamento e Extensão dos Modelos Existentes

### 2.1 Extensão de `MikaBoardTelemetryContext` (`src/types/mika.ts`)
O contexto de telemetria já enviado ao construtor de prompts e ao motor heurístico é estendido com:
```typescript
export interface MikaBoardTelemetryContext {
  // ... campos existentes (boardId, columns, blockedTasks, cycleTimeP85Days, throughputLast14Days)
  monteCarloTelemetry?: MikaMonteCarloTelemetry;
}
```

### 2.2 Extensão de `MikaChatMessage` (`src/types/mika.ts`)
A interface de mensagem é estendida com o campo opcional `action`:
```typescript
export interface MikaChatMessage {
  id: string;
  sender: 'user' | 'mika';
  content: string;
  timestamp: string;
  referencedTaskIds?: string[];
  action?: MikaForecastActionPayload; // Nova ação consultiva (Princípio X)
}
```

### 2.3 Extensão de `MikaQuickPromptCategory` (`src/types/mika.ts`)
Novas categorias de consultas rápidas suportadas no chat:
```typescript
export type MikaQuickPromptCategory =
  | 'bottleneck'
  | 'blocked'
  | 'sle'
  | 'throughput'
  | 'forecast_initiative'  // Nova
  | 'forecast_sprint'      // Nova
  | 'forecast_capacity';   // Nova
```

