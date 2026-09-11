import { CfdDataPoint } from '../types/analytics';

/**
 * Representa a medição pontual de fluxo no CFD:
 * - WIP vertical (diferença entre topo e base da etapa)
 * - Lead Time horizontal aproximado (dias decorridos no mesmo patamar de itens)
 */
export interface CfdInspectionMeasurement {
  date: string;
  wipItems: number;
  leadTimeDays: number;
  isExpandingQueue: boolean;
  topYPercent: number;
  bottomYPercent: number;
  currentXPercent: number;
  departureXPercent: number;
}

/**
 * Calcula o tempo de permanência horizontal aproximado (Lead Time)
 * rastreando em qual data anterior a curva de chegada esteve no mesmo patamar da curva de saída na data ativa.
 */
export function calculateHorizontalLeadTime(
  dataPoints: CfdDataPoint[],
  activeIdx: number,
  arrivalKey: 'total' | 'cumulativeStarted' | string,
  departureKey: 'cumulativeStarted' | 'cumulativeDone' | string
): number {
  if (!dataPoints || dataPoints.length === 0 || activeIdx < 0 || activeIdx >= dataPoints.length) {
    return 0;
  }

  const activePoint = dataPoints[activeIdx];
  const departureVal = getPointValue(activePoint, departureKey);

  if (departureVal <= 0) {
    return 0;
  }

  // Procurar o primeiro ponto histórico (da esquerda para a direita)
  // onde a curva de chegada (arrival) atingiu ou ultrapassou esse valor de saída
  let arrivalIdx = -1;
  for (let i = 0; i <= activeIdx; i++) {
    const arrVal = getPointValue(dataPoints[i], arrivalKey);
    if (arrVal >= departureVal) {
      arrivalIdx = i;
      break;
    }
  }

  if (arrivalIdx === -1) {
    return 0;
  }

  const activeDate = new Date(activePoint.date).getTime();
  const arrivalDate = new Date(dataPoints[arrivalIdx].date).getTime();

  if (isNaN(activeDate) || isNaN(arrivalDate) || activeDate < arrivalDate) {
    return 0;
  }

  const diffDays = (activeDate - arrivalDate) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(diffDays));
}

/**
 * Detecta se a banda de uma etapa está em expansão de fila desproporcional (gargalo acumulando).
 * Avalia a variação da espessura vertical na segunda metade do período em relação à primeira.
 */
export function detectQueueExpansion(
  dataPoints: CfdDataPoint[],
  topKey: string,
  bottomKey: string
): boolean {
  if (!dataPoints || dataPoints.length < 4) {
    return false;
  }

  const mid = Math.floor(dataPoints.length / 2);
  const startPoints = dataPoints.slice(0, mid);
  const recentPoints = dataPoints.slice(mid);

  const getThickness = (pt: CfdDataPoint) => {
    const top = getPointValue(pt, topKey);
    const bottom = getPointValue(pt, bottomKey);
    return Math.max(0, top - bottom);
  };

  const avgStart = startPoints.reduce((acc, pt) => acc + getThickness(pt), 0) / startPoints.length;
  const avgRecent = recentPoints.reduce((acc, pt) => acc + getThickness(pt), 0) / recentPoints.length;

  // Se a espessura média recente for pelo menos 40% maior e tiver no mínimo 3 itens
  return avgRecent >= 3 && avgRecent >= avgStart * 1.4;
}

/**
 * Extrai o valor de uma etapa seja das propriedades padrão (total, cumulativeStarted, cumulativeDone)
 * ou dos cumulativeStages dinâmicos por ID de coluna.
 */
export function getPointValue(point: CfdDataPoint, key: string): number {
  if (!point) return 0;
  if (key === 'total') return point.total || 0;
  if (key === 'cumulativeStarted') return point.cumulativeStarted || 0;
  if (key === 'cumulativeDone') return point.cumulativeDone || 0;
  if (point.cumulativeStages && typeof point.cumulativeStages[key] === 'number') {
    return point.cumulativeStages[key];
  }
  return 0;
}
