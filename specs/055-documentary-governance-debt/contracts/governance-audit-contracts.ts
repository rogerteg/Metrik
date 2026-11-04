/**
 * Contracts for Documentary Governance and Technical Debt Reconciliation
 * Feature: 055-documentary-governance-debt
 */

export interface SpecHeaderMatch {
  raw: string;
  status: 'Implemented & Verified' | 'Draft' | 'Deprecated';
  date: string | null;
}

export interface GovernanceValidationResult {
  totalAudited: number;
  totalPassed: number;
  totalFailed: number;
  divergentSpecs: Array<{
    feature: string;
    reason: string;
  }>;
}

export interface IssueSyncResult {
  featureNumber: number;
  totalTasksProcessed: number;
  createdIssues: Array<{
    taskId: string;
    issueNumber: number;
    issueUrl: string;
    isClosed: boolean;
  }>;
}

