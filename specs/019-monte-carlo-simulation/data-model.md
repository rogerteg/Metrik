# Data Model & Architecture: Feature 019 - Simulações de Monte Carlo no Gerenciamento de Projetos

**Feature**: `019-monte-carlo-simulation` | **Date**: 2026-09-11

---

## 1. Estruturas de Entidades e Tipos de Dados

### 1.1 `DailyThroughputSample` (Série Histórica Diária)
```typescript
export interface DailyThroughputSample {
  date: string;       // Formato 'YYYY-MM-DD'
  count: number;      // Cartões finalizados naquela data (pode ser 0)
}
```

### 1.2 Parâmetros e Resultados da Simulação "How Many" (Quantos Itens?)
```typescript
export interface MonteCarloHowManyParams {
  targetDays: number;         // Janela de dias futuros para entrega
  trials?: number;            // Quantidade de ensaios (default: 10000)
  rng?: () => number;         // Gerador pseudoaleatório injetável para testes
}

export interface MonteCarloHowManyResult {
  p50: number;                // 50% de probabilidade de entregar pelo menos X itens
  p85: number;                // 85% de probabilidade de entregar pelo menos X itens
  p95: number;                // 95% de probabilidade de entregar pelo menos X itens
  min: number;
  max: number;
  mean: number;
  trials: number;
  targetDays: number;
  histogram: MonteCarloHistogramBin[];
}
```

### 1.3 Parâmetros e Resultados da Simulação "When" (Quando?)
```typescript
export interface MonteCarloWhenParams {
  itemCount: number;          // Quantidade de itens do backlog
  startDate?: string;         // Data de início da projeção (default: hoje)
  trials?: number;            // Quantidade de ensaios (default: 10000)
  rng?: () => number;         // Gerador pseudoaleatório injetável para testes
}

export interface MonteCarloWhenPercentile {
  days: number;               // Dias corridos necessários
  projectedDate: string;      // Data estimada no formato 'YYYY-MM-DD'
}

export interface MonteCarloWhenResult {
  p50: MonteCarloWhenPercentile;
  p85: MonteCarloWhenPercentile;
  p95: MonteCarloWhenPercentile;
  minDays: number;
  maxDays: number;
  meanDays: number;
  trials: number;
  itemCount: number;
  histogram: MonteCarloHistogramBin[];
}
```

### 1.4 `MonteCarloHistogramBin` (Baldes de Frequência para o Gráfico)
```typescript
export interface MonteCarloHistogramBin {
  value: number;              // Valor do eixo X (número de itens ou número de dias)
  frequency: number;          // Contagem de ensaios que atingiram este valor
  relativeFrequency: number;  // Frequência percentual (0.00 a 1.00)
  cumulativeProbability: number; // Probabilidade acumulada (CDF)
}
```

---

## 2. Invariantes Matemáticas e Relações de Ordem

1. **Ordem Decrescente no "How Many"**:
   Em simulações de capacidade, a meta mais segura (P95) entrega um quantitativo menor ou igual à meta otimista (P50):
   $$\text{P95} \le \text{P85} \le \text{P50}$$
   *Exemplo*: Em 30 dias, temos 95% de chance de entregar pelo menos 14 itens, 85% de entregar pelo menos 18 itens e 50% de entregar 24 itens.

2. **Ordem Crescente no "When"**:
   Em simulações de prazo, a data de maior certeza (P95) exige mais dias ou tempo igual à data otimista (P50):
   $$\text{P50 (dias)} \le \text{P85 (dias)} \le \text{P95 (dias)}$$
   *Exemplo*: Para entregar 20 itens, 50% de chance em 15 dias, 85% de chance em 22 dias e 95% de chance em 29 dias.

3. **Conservação Amostral**:
   $$\sum \text{histogram.frequency} = \text{trials} = 10.000$$
