# Data Model: 055 — Governança Documental & Eliminação de Dívida Técnica

**Feature**: `055-documentary-governance-debt`  
**Date**: 2026-11-04  

---

## Entidades de Governança Documental

### 1. `SpecMetadataAudit`
Representa o estado de integridade e auditoria de um arquivo de especificação (`specs/<feature>/spec.md`).

```typescript
export interface SpecMetadataAudit {
  featureNumber: number;            // Ex.: 53
  featureDirectory: string;         // Ex.: "053-flow-automation-policies"
  specPath: string;                 // Caminho absoluto para o spec.md
  title: string;                    // Título extraído do cabeçalho H1
  status: 'Implemented & Verified' | 'Draft' | 'Deprecated';
  ratificationDate: string | null;  // Data extraída no formato YYYY-MM-DD
  hasNeedsClarification: boolean;   // Se ainda possui marcadores não resolvidos
  isCompliant: boolean;             // True se segue todas as regras constitucionais
}
```

### 2. `SystemHealthSnapshot`
Representa a fotografia factual do ecossistema Metrik consumida e declarada em `specs/043-system-health-and-roadmap/vision.md`.

```typescript
export interface SystemHealthSnapshot {
  measuredAt: string;               // ISO 8601 (ex.: "2026-11-04")
  totalDeliveredSpecs: number;      // 54 funcionalidades entregues
  testSuite: {
    totalTestFiles: number;         // 150 arquivos
    totalTestsPassed: number;       // 926 testes verdes
    totalTestsFailed: number;       // 0 testes falhando
    durationSeconds: number;        // ~54s
  };
  buildStatus: {
    isSuccess: boolean;             // true
    durationSeconds: number;        // < 5s (ex.: 4.21s)
    bundleSizeKb: number;           // Tamanho dos chunks do bundle Vite
  };
  staticAnalysis: {
    lintErrors: number;             // 0 erros
    lintWarnings: number;           // 0 avisos bloqueantes
    prettierCompliant: boolean;     // true
    maxModuleLines: number;         // <= 400 linhas (386 linhas no App.tsx)
  };
  activeRoadmapHorizon: string[];   // Lista de próximas metas analíticas
}
```

### 3. `GitHubTaskIssueSync`
Representa a projeção de uma tarefa do SpecKit (`tasks.md`) para o rastreador de issues do repositório GitHub `rogerteg/Metrik`.

```typescript
export interface GitHubTaskIssueSync {
  taskId: string;                   // Ex.: "T001"
  featureNumber: number;            // Ex.: 53
  featureDirectory: string;         // "053-flow-automation-policies"
  phase: string;                    // "Phase 1: Setup (Shared Infrastructure)"
  title: string;                    // "[Feature 053] T001: <descrição>"
  body: string;                     // Markdown com metadados e links canônicos
  isCompleted: boolean;             // true
  githubIssueNumber?: number;       // Número atribuído pelo GitHub (ex.: 481)
  closedComment?: string;           // "Concluída e verificada conforme especificações da Feature 053."
}
```

---

## Regras de Integridade e Invariantes de Dados

1. **Invariante de Status**: Toda especificação em `specs/<NNN-feature>/` cujo número $NNN \le 54$ DEVE possuir o status `Implemented & Verified`.
2. **Invariante de Não-Divergência**: O campo de data no cabeçalho DEVE respeitar o formato `YYYY-MM-DD`.
3. **Invariante de Título no GitHub**: Toda issue criada para uma tarefa DEVE iniciar com `[Feature NNN] T###: ` para manter a busca e deduplicação consistentes com `\bT\d{3,}\b`.
4. **Invariante Constitucional VII**: Nenhuma entidade ou título pode conter referências a produtos de terceiros ou marcas concorrentes.

