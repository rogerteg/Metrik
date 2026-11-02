/**
 * Contracts and Type Signatures for Feature 051: Exportable Flow Reports
 */

import { TaskModel, BoardModel, ColumnModel } from '../../../src/types/kanban';
import { MikaInsight } from '../../../src/types/mika';
import {
  FlowReportSnapshot,
  TaskExportRow,
  ExportOptions,
} from '../data-model';

/**
 * Interface contract for building the immutable flow report snapshot.
 */
export interface FlowReportSnapshotBuilder {
  (
    board: { id: string; name?: string; title?: string; columns?: ColumnModel[] },
    tasks: TaskModel[],
    options: ExportOptions,
    mikaInsights?: MikaInsight[],
    filterSummary?: string,
  ): FlowReportSnapshot;
}

/**
 * Interface contract for building tabular rows from kanban tasks.
 */
export interface TaskRowProjector {
  (
    tasks: TaskModel[],
    columns: ColumnModel[],
    includeSubtasks: boolean,
  ): TaskExportRow[];
}

/**
 * Interface contract for serializing task rows into an RFC-compliant, pt-BR Excel CSV string.
 */
export interface SpreadsheetCsvSerializer {
  (
    rows: TaskExportRow[],
    metadataHeader?: {
      boardTitle: string;
      dateWindowLabel: string;
      generatedAt: string;
    },
  ): string;
}

/**
 * Interface contract for client-side file downloader.
 */
export interface FileDownloader {
  (
    content: string,
    filename: string,
    mimeType: string,
  ): void;
}

/**
 * Props for the Export Configuration & Trigger Modal.
 */
export interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: { id: string; name?: string; title?: string; columns?: ColumnModel[] };
  tasks: TaskModel[];
  filteredTasks: TaskModel[];
  mikaInsights: MikaInsight[];
  activeDateFilterLabel?: string;
  hasActiveFilters?: boolean;
}

/**
 * Props for the Executive Print View component rendered for @media print.
 */
export interface ExecutiveReportPrintViewProps {
  snapshot: FlowReportSnapshot;
  onClose?: () => void;
}
