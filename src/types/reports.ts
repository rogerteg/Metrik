/**
 * Domain types and data models for Exportable Flow Reports (Feature 051)
 * Based on specifications in specs/051-exportable-flow-reports/data-model.md
 */

import { MikaInsightSeverity } from './mika';

export type ExportFormat = 'pdf' | 'excel';

export interface ReportDateWindow {
  startDate?: string;
  endDate?: string;
  label: string;
}

export interface FlowReportMetrics {
  throughput: number; // Total concluded items in window
  avgLeadTimeDays: number; // Average lead time in days
  avgCycleTimeDays: number; // Average cycle time in days
  sleP85Days: number; // 85th percentile service level expectation in days
  sleComplianceRate: number; // Percentage of items completed within SLE (0-100)
  blockerRatePercent: number; // Percentage of items that experienced a block (0-100)
  totalBlockedHours: number; // Sum of all blocked hours across evaluated items
}

export interface CycleTimePercentiles {
  p50: number; // Median cycle time (days)
  p85: number; // 85th percentile (days)
  p95: number; // 95th percentile (days)
}

export interface MikaInsightSnippet {
  id: string;
  title: string;
  message: string;
  severity: MikaInsightSeverity;
  category?: string;
}

export interface BlockerReportReason {
  reason: string;
  count: number;
  impactHours: number;
}

export interface BlockerReportSummary {
  totalBlockers: number;
  totalImpactHours: number;
  topReasons: BlockerReportReason[];
}

/**
 * Immutable, point-in-time consolidated snapshot of board flow metrics,
 * health indicators, and AI diagnostics for PDF rendering and auditing.
 */
export interface FlowReportSnapshot {
  boardId: string;
  boardTitle: string;
  squadName?: string;
  generatedAt: string; // ISO 8601
  dateWindow: ReportDateWindow;
  filterSummary: string;
  totalTasks: number;
  completedTasks: number;
  wipCount: number;
  metrics: FlowReportMetrics;
  percentiles: CycleTimePercentiles;
  mikaInsights?: MikaInsightSnippet[];
  blockerSummary?: BlockerReportSummary;
}

/**
 * Normalized single-row projection of a task/subtask for tabular CSV / Excel export.
 */
export interface TaskExportRow {
  id: string;
  title: string;
  type: string; // 'Cartão' | 'Subtarefa' | 'Iniciativa'
  column: string;
  category: string;
  priority: string;
  assignee: string;
  sprint: string;
  storyPoints: string; // Number formatted with comma or '-'
  createdAt: string; // 'DD/MM/YYYY HH:mm'
  startedAt: string; // 'DD/MM/YYYY HH:mm' or '-'
  completedAt: string; // 'DD/MM/YYYY HH:mm' or '-'
  leadTimeDays: string; // Formatted decimal with comma or '-'
  cycleTimeDays: string; // Formatted decimal with comma or '-'
  isBlocked: string; // 'Sim' | 'Não'
  blockedHours: string; // Formatted decimal with comma or '0,0'
  tags: string; // Semicolon-separated tags or '-'
  subtaskCount: number;
}

/**
 * User configuration parameters for report generation.
 */
export interface ExportOptions {
  format: ExportFormat;
  includeMikaInsights: boolean;
  includeBlockerBreakdown: boolean;
  includeSubtasks: boolean;
}
