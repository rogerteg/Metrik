# Data Model: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Branch**: `056-monte-carlo-backlog-forecast` | **Date**: 2026-11-04  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

---

## 1. Entidades de Domínio

### `BacklogScopeType`
Tipo discriminador que define a estratégia de agrupamento do escopo para o forecast:
```typescript
export type BacklogScopeType = 'all' | 'initiative' | 'sprint' | 'tag';
```

---

### `BacklogForecastScope`
Representa o agrupador de tarefas selecionado e o estado atual de inclusão de cartões:

| Campo | Tipo | Descrição |
|:---|:---|:---|
| `type` | `BacklogScopeType` | Tipo do agrupador selecionado |
| `scopeId` | `string \| undefined` | ID da Iniciativa ou Sprint (se aplicável) |
| `scopeTitle` | `string` | Título legível do escopo (ex.: "Épico: Módulo de Cobrança", "Sprint 14", "Tag: #MVP") |
| `allTasks` | `TaskModel[]` | Total de cartões vinculados a este agrupador |
| `completedTasks` | `TaskModel[]` | Subconjunto de tarefas que já possuem `completedAt` |
| `pendingTasks` | `TaskModel[]` | Subconjunto de tarefas em aberto (`!completedAt`) |
| `selectedTaskIds` | `string[]` | IDs das tarefas pendentes ativamente marcadas para a simulação |
| `inferredTargetDate` | `string \| undefined` | Data meta pré-carregada a partir do `dueDate` ou `endDate` (formato ISO `YYYY-MM-DD`) |

---

### `TargetDateRiskLevel`
Classificação semântica de risco para cumprimento de prazos com base na probabilidade de Monte Carlo:
```typescript
export type TargetDateRiskLevel = 'low' | 'moderate' | 'high' | 'critical';
```

| Nível | Faixa de Probabilidade | Semântica de Negócio | Cor Indicativa |
|:---|:---|:---|:---|
| `low` | $P \ge 85\%$ | Prazo altamente provável; compromisso seguro. | 🟢 Verde |
| `moderate` | $50\% \le P < 85\%$ | Prazo possível, mas sujeito a variabilidade; requer monitoramento. | 🟡 Amarelo |
| `high` | $20\% \le P < 50\%$ | Prazo agressivo; alta probabilidade de atraso. | 🔴 Vermelho |
| `critical` | $P < 20\%$ | Prazo estatisticamente inviável com a vazão atual. | ⚠️ Vermelho Escuro |

---

### `TargetDateProbabilityResult`
Estrutura contendo o resultado da avaliação estocástica de cumprimento de uma data meta:

| Campo | Tipo | Descrição |
|:---|:---|:---|
| `targetDate` | `string` | Data meta avaliada no formato `YYYY-MM-DD` |
| `availableDays` | `number` | Dias corridos disponíveis entre a data de referência e a data meta |
| `probability` | `number` | Porcentagem calculada de ensaios bem-sucedidos ($0.0 \text{ a } 100.0$) |
| `successfulTrials` | `number` | Contagem absoluta de ensaios que terminaram em $\le \text{availableDays}$ |
| `totalTrials` | `number` | Total de iterações executadas (padrão: 10.000) |
| `riskLevel` | `TargetDateRiskLevel` | Classificação de risco correspondente |
| `statusMessage` | `string` | Texto explicativo em linguagem natural para stakeholders |

---

### `BacklogMonteCarloForecastResult`
Estrutura consolidada retornada pelo motor de previsão de backlog:

| Campo | Tipo | Descrição |
|:---|:---|:---|
| `scope` | `BacklogForecastScope` | Metadados do escopo e cartões avaliados |
| `itemCount` | `number` | Quantidade efetiva de itens simulados (`selectedTaskIds.length`) |
| `p50` | `MonteCarloWhenPercentile` | Projeção em 50% de confiança (dias e data de calendário) |
| `p85` | `MonteCarloWhenPercentile` | Projeção em 85% de confiança (dias e data de calendário) |
| `p95` | `MonteCarloWhenPercentile` | Projeção em 95% de confiança (dias e data de calendário) |
| `targetDateAnalysis` | `TargetDateProbabilityResult \| undefined` | Avaliação da data meta (se definida pelo usuário) |
| `sampleDays` | `number` | Total de dias com amostras na série de Throughput |
| `totalDelivered` | `number` | Total de entregas registradas no período histórico |
| `isSampleSufficient` | `boolean` | `true` se amostra atende ao critério $N \ge 10$ dias com entregas |
| `warningReason` | `string \| undefined` | Descrição de insuficiência de dados ou alerta de escopo 100% bloqueado |

---

## 2. Invariantes de Dados & Validação

1. **Invariante de Escopo**: `selectedTaskIds` deve conter estritamente um subconjunto de IDs presentes em `pendingTasks`. Tarefas já concluídas nunca devem ser incluídas no sorteio de dias futuros.
2. **Invariante de Vazão Zero**: Se `totalDelivered === 0`, `isSampleSufficient` é obrigatoriamente `false`, e o cálculo estocástico é suspenso para evitar divisão por zero ou projeções infinitas.
3. **Invariante Temporal**: `availableDays` é calculado como $\lfloor (D_{target} - D_{ref}) / 86.400.000 \rfloor$. Se $D_{target} < D_{ref}$, `availableDays` é negativo e `probability` é fixada em $0\%$.
4. **Respeito à Soberania Local-First**: Todos os cálculos são derivados dos arrays de tarefas já carregados em memória no cliente, com zero chamadas de rede ou persistência de dados sensíveis fora do navegador.

