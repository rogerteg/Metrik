import { PriorityLevel } from '../types/kanban';

export interface PriorityConfig {
  level: PriorityLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const PRIORITY_CONFIG: Record<PriorityLevel, PriorityConfig> = {
  urgent: {
    level: 'urgent',
    label: 'Urgente',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)',
  },
  high: {
    level: 'high',
    label: 'Alta',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
  },
  medium: {
    level: 'medium',
    label: 'Média',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
  },
  low: {
    level: 'low',
    label: 'Baixa',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
  },
};

export const getPriorityConfig = (level?: PriorityLevel): PriorityConfig | undefined => {
  if (!level) return undefined;
  return PRIORITY_CONFIG[level];
};
