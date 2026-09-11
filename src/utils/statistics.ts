/**
 * Utilitários estatísticos para métricas de fluxo (Daniel Vacanti / Padrão NIST)
 */

/**
 * Calcula percentis para um conjunto numérico usando interpolação linear padrão (NIST / R-6).
 * 
 * @param values Array de valores numéricos (ex: tempos de ciclo em dias)
 * @param percentile Número entre 0 e 100 representando o percentil desejado (ex: 50, 85, 95)
 * @returns O valor correspondente ao percentil calculado, arredondado para 1 casa decimal
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (!values || values.length === 0) {
    return 0;
  }

  // Ordenar valores em ordem ascendente
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  if (n === 1) {
    return Number(sorted[0].toFixed(1));
  }

  // Caso extremo: percentil 0 ou menor retorna o mínimo
  if (percentile <= 0) {
    return Number(sorted[0].toFixed(1));
  }

  // Caso extremo: percentil 100 ou maior retorna o máximo
  if (percentile >= 100) {
    return Number(sorted[n - 1].toFixed(1));
  }

  // Posição baseada em interpolação linear contínua:
  // rank = (p / 100) * (n - 1)
  const index = (percentile / 100) * (n - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const weight = index - lowerIndex;

  if (lowerIndex === upperIndex) {
    return Number(sorted[lowerIndex].toFixed(1));
  }

  const interpolated = sorted[lowerIndex] * (1 - weight) + sorted[upperIndex] * weight;
  return Number(interpolated.toFixed(1));
}

/**
 * Retorna os percentis padrão de fluxo: 50% (Mediana), 85% (SLE) e 95% (Certeza / Cauda).
 */
export interface FlowPercentiles {
  p50: number;
  p85: number;
  p95: number;
  min: number;
  max: number;
  count: number;
}

export function calculateFlowPercentiles(cycleTimes: number[]): FlowPercentiles {
  if (!cycleTimes || cycleTimes.length === 0) {
    return {
      p50: 0,
      p85: 0,
      p95: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const validValues = cycleTimes.filter((v) => typeof v === 'number' && !isNaN(v) && v >= 0);
  if (validValues.length === 0) {
    return {
      p50: 0,
      p85: 0,
      p95: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const sorted = [...validValues].sort((a, b) => a - b);

  return {
    p50: calculatePercentile(sorted, 50),
    p85: calculatePercentile(sorted, 85),
    p95: calculatePercentile(sorted, 95),
    min: Number(sorted[0].toFixed(1)),
    max: Number(sorted[sorted.length - 1].toFixed(1)),
    count: sorted.length,
  };
}
