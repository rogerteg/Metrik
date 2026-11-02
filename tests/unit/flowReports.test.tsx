import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ColumnModel } from '../../src/types/kanban';
import { MikaInsight } from '../../src/types/mika';
import { ExportOptions } from '../../src/types/reports';
import {
  buildFlowReportSnapshot,
  projectTasksToExportRows,
  serializeTasksToSpreadsheetCsv,
  downloadTextFile,
  escapeCsvField,
  ReportBoardLike,
  ReportTaskLike,
} from '../../src/utils/flowReportExporter';

describe('flowReportExporter', () => {
  const mockColumns: ColumnModel[] = [
    { id: 'col-backlog', title: 'Backlog', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'col-wip', title: 'Em Progresso', category: 'in_progress', wipLimit: 5, colorScheme: 'progress' },
    { id: 'col-done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const mockBoard: ReportBoardLike = {
    id: 'board-1',
    name: 'Quadro de Engenharia',
    title: 'Quadro de Engenharia',
    columns: mockColumns,
    teamId: 'team-alpha',
  };

  const mockTasks: ReportTaskLike[] = [
    {
      id: 'TASK-1',
      title: 'Implementar autenticação JWT',
      description: 'Adicionar suporte a tokens\nCom expiração',
      columnId: 'col-done',
      priority: 'high',
      category: 'Backend',
      assignee: 'Alice Silva',
      sprint: 'Sprint 42',
      storyPoints: 5,
      createdAt: '2026-10-01T10:00:00.000Z',
      startedAt: '2026-10-02T10:00:00.000Z',
      completedAt: '2026-10-05T10:00:00.000Z', // Lead time: 4 dias, Cycle time: 3 dias
      tags: ['segurança', 'api'],
      subtasks: [
        { id: 'sub-1', title: 'Gerar chaves RSA', completed: true },
        { id: 'sub-2', title: 'Validar middleware', completed: true },
      ],
      blockers: [
        {
          id: 'blk-1',
          reason: 'Aguardando credenciais do IdP',
          blockedAt: '2026-10-03T10:00:00.000Z',
          unblockedAt: '2026-10-03T18:00:00.000Z', // 8 horas
        },
      ],
    },
    {
      id: 'TASK-2',
      title: 'Ajustar layout responsivo; header fixo',
      columnId: 'col-wip',
      priority: 'medium',
      category: 'Frontend',
      assignee: 'Bob Santos',
      sprint: 'Sprint 42',
      storyPoints: 3,
      createdAt: '2026-10-02T08:00:00.000Z',
      startedAt: '2026-10-03T08:00:00.000Z',
      tags: ['ui', 'css'],
    },
    {
      id: 'TASK-3',
      title: 'Cartão sem campos opcionais',
      columnId: 'col-backlog',
      priority: 'low',
      category: 'Geral',
      createdAt: '2026-10-04T08:00:00.000Z',
    },
  ];

  const mockMikaInsights: MikaInsight[] = [
    {
      id: 'insight-1',
      title: 'Gargalo em Revisão',
      summary: 'Tempo de ciclo elevado devido a retenção de PRs.',
      recommendation: 'Priorizar code reviews antes de puxar novos cards.',
      severity: 'warning',
      category: 'cycle-time',
      timestamp: '2026-10-27T10:00:00.000Z',
    },
  ];

  const defaultOptions: ExportOptions = {
    format: 'pdf',
    includeMikaInsights: true,
    includeBlockerBreakdown: true,
    includeSubtasks: true,
  };

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('RFC 4180 CSV Escaping', () => {
    it('escapa aspas duplas dobrando-as e envolvendo em aspas', () => {
      expect(escapeCsvField('Texto com "aspas"')).toBe('"Texto com ""aspas"""');
    });

    it('envolve campos contendo ponto-e-vírgula em aspas', () => {
      expect(escapeCsvField('Item A; Item B')).toBe('"Item A; Item B"');
    });

    it('envolve campos com quebras de linha em aspas', () => {
      expect(escapeCsvField("Linha 1\nLinha 2")).toBe('"Linha 1\nLinha 2"');
    });

    it('retorna texto simples inalterado quando não há caracteres especiais', () => {
      expect(escapeCsvField('Metrik Flow')).toBe('Metrik Flow');
    });
  });

  describe('buildFlowReportSnapshot', () => {
    it('constrói snapshot imutável com métricas de fluxo calculadas', () => {
      const snapshot = buildFlowReportSnapshot(
        mockBoard,
        mockTasks,
        defaultOptions,
        mockMikaInsights,
        'Últimos 30 dias • Todas as tarefas',
      );

      expect(snapshot.boardId).toBe('board-1');
      expect(snapshot.boardTitle).toBe('Quadro de Engenharia');
      expect(snapshot.totalTasks).toBe(3);
      expect(snapshot.completedTasks).toBe(1);
      expect(snapshot.wipCount).toBe(1);

      // Métricas de fluxo
      expect(snapshot.metrics.throughput).toBe(1);
      expect(snapshot.metrics.avgLeadTimeDays).toBeCloseTo(4.0, 1);
      expect(snapshot.metrics.avgCycleTimeDays).toBeCloseTo(3.0, 1);
      expect(snapshot.metrics.sleP85Days).toBeGreaterThan(0);
      expect(snapshot.metrics.totalBlockedHours).toBeCloseTo(8.0, 1);
      expect(snapshot.metrics.blockerRatePercent).toBeCloseTo(33.3, 0);

      // Mika insights
      expect(snapshot.mikaInsights).toHaveLength(1);
      expect(snapshot.mikaInsights?.[0].title).toBe('Gargalo em Revisão');

      // Blocker summary
      expect(snapshot.blockerSummary?.totalBlockers).toBe(1);
      expect(snapshot.blockerSummary?.totalImpactHours).toBeCloseTo(8.0, 1);
      expect(snapshot.blockerSummary?.topReasons[0].reason).toBe(
        'Aguardando credenciais do IdP',
      );
    });

    it('lida com quadro sem tarefas concluídas sem retornar NaN ou erros', () => {
      const emptyTasks: ReportTaskLike[] = [];
      const snapshot = buildFlowReportSnapshot(
        mockBoard,
        emptyTasks,
        defaultOptions,
      );

      expect(snapshot.totalTasks).toBe(0);
      expect(snapshot.completedTasks).toBe(0);
      expect(snapshot.metrics.throughput).toBe(0);
      expect(snapshot.metrics.avgLeadTimeDays).toBe(0);
      expect(snapshot.metrics.avgCycleTimeDays).toBe(0);
      expect(snapshot.metrics.sleP85Days).toBe(0);
      expect(snapshot.metrics.sleComplianceRate).toBe(0);
      expect(snapshot.metrics.blockerRatePercent).toBe(0);
      expect(snapshot.percentiles.p50).toBe(0);
      expect(snapshot.percentiles.p85).toBe(0);
      expect(snapshot.percentiles.p95).toBe(0);
    });

    it('omite Mika Insights quando includeMikaInsights for false', () => {
      const options: ExportOptions = {
        ...defaultOptions,
        includeMikaInsights: false,
      };
      const snapshot = buildFlowReportSnapshot(
        mockBoard,
        mockTasks,
        options,
        mockMikaInsights,
      );
      expect(snapshot.mikaInsights).toBeUndefined();
    });
  });

  describe('projectTasksToExportRows', () => {
    it('projeta tarefas com todas as 18 colunas normativas', () => {
      const rows = projectTasksToExportRows(mockTasks, mockColumns, false);

      expect(rows).toHaveLength(3);

      const row1 = rows[0];
      expect(row1.id).toBe('TASK-1');
      expect(row1.title).toBe('Implementar autenticação JWT');
      expect(row1.type).toBe('Cartão');
      expect(row1.column).toBe('Concluído');
      expect(row1.category).toBe('Backend');
      expect(row1.priority).toBe('Alta');
      expect(row1.assignee).toBe('Alice Silva');
      expect(row1.sprint).toBe('Sprint 42');
      expect(row1.storyPoints).toBe('5');
      expect(row1.leadTimeDays).toBe('4,0');
      expect(row1.cycleTimeDays).toBe('3,0');
      expect(row1.isBlocked).toBe('Não'); // atualmente não bloqueada
      expect(row1.blockedHours).toBe('8,0');
      expect(row1.tags).toBe('segurança; api');
      expect(row1.subtaskCount).toBe(2);

      // Tratamento de campos nulos com '-'
      const row3 = rows[2];
      expect(row3.assignee).toBe('-');
      expect(row3.sprint).toBe('-');
      expect(row3.storyPoints).toBe('-');
      expect(row3.startedAt).toBe('-');
      expect(row3.completedAt).toBe('-');
      expect(row3.leadTimeDays).toBe('-');
      expect(row3.cycleTimeDays).toBe('-');
      expect(row3.blockedHours).toBe('0,0');
      expect(row3.tags).toBe('-');
      expect(row3.subtaskCount).toBe(0);
    });

    it('inclui subtarefas como linhas individuais quando solicitado', () => {
      const rowsWithSubtasks = projectTasksToExportRows(
        mockTasks,
        mockColumns,
        true,
      );
      // 3 tarefas + 2 subtarefas da TASK-1 = 5 linhas
      expect(rowsWithSubtasks).toHaveLength(5);

      const subtaskRow = rowsWithSubtasks.find((r) => r.id === 'TASK-1.1');
      expect(subtaskRow).toBeDefined();
      expect(subtaskRow?.type).toBe('Subtarefa');
      expect(subtaskRow?.title).toBe('Gerar chaves RSA');
    });
  });

  describe('serializeTasksToSpreadsheetCsv', () => {
    it('gera CSV com BOM UTF-8 (\\uFEFF), delimitador ponto-e-vírgula e vírgula decimal', () => {
      const rows = projectTasksToExportRows(mockTasks, mockColumns, false);
      const csv = serializeTasksToSpreadsheetCsv(rows, {
        boardTitle: 'Quadro de Engenharia',
        dateWindowLabel: 'Todos os Dados',
        generatedAt: '2026-10-28T10:00:00.000Z',
      });

      // Deve começar com Byte Order Mark UTF-8 para o Excel
      expect(csv.startsWith('\uFEFF')).toBe(true);

      // Cabeçalho institucional do relatório
      expect(csv).toContain('# Relatório de Fluxo e Inventário — Metrik');
      expect(csv).toContain('Quadro:;Quadro de Engenharia');

      // Cabeçalho tabular com as 18 colunas separadas por ponto-e-vírgula
      expect(csv).toContain(
        'ID;Título;Tipo;Coluna;Categoria;Prioridade;Responsável;Sprint;Story Points;Criado Em;Iniciado Em;Concluído Em;Lead Time (dias);Cycle Time (dias);Bloqueado;Tempo Bloqueado (horas);Tags;Total Subtarefas',
      );

      // Conteúdo com decimais formatados com vírgula (pt-BR)
      expect(csv).toContain('4,0;3,0;Não;8,0');

      // Sanitização de quebra de linha ou delimitador no título da TASK-2
      expect(csv).toContain('"Ajustar layout responsivo; header fixo"');
    });
  });

  describe('downloadTextFile', () => {
    it('dispara criação de Blob e clique simulado sem exceções', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const mockRevokeObjectURL = vi.fn();
      window.URL.createObjectURL = mockCreateObjectURL;
      window.URL.revokeObjectURL = mockRevokeObjectURL;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      downloadTextFile('conteúdo csv', 'teste.csv', 'text/csv;charset=utf-8;');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');

      clickSpy.mockRestore();
    });

    it('exportTasksToSpreadsheet orquestra a projeção, serialização e download', async () => {
      const { exportTasksToSpreadsheet } = await import('../../src/utils/flowReportExporter');
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const mockRevokeObjectURL = vi.fn();
      window.URL.createObjectURL = mockCreateObjectURL;
      window.URL.revokeObjectURL = mockRevokeObjectURL;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      exportTasksToSpreadsheet(mockTasks, mockBoard, false, 'Sprint 42');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
    });
  });

  describe('ExecutiveReportPrintView Component', () => {
    it('renderiza cabeçalho, KPIs, percentis e diagnóstico da Mika no relatório executivo', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { ExecutiveReportPrintView } = await import('../../src/components/ExecutiveReportPrintView');

      const snapshot = buildFlowReportSnapshot(
        mockBoard,
        mockTasks,
        defaultOptions,
        mockMikaInsights,
        'Últimos 30 dias',
      );

      const onClose = vi.fn();
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(<ExecutiveReportPrintView snapshot={snapshot} onClose={onClose} autoPrint={false} />);

      // Verificar cabeçalho
      expect(screen.getByText(/Metrik — Relatório Executivo de Fluxo/i)).toBeInTheDocument();
      expect(screen.getByText('Quadro de Engenharia')).toBeInTheDocument();

      // Verificar KPIs
      expect(screen.getByTestId('kpi-throughput')).toHaveTextContent('1');
      expect(screen.getByTestId('kpi-lead-time')).toHaveTextContent('4,0 dias');
      expect(screen.getByTestId('kpi-cycle-time')).toHaveTextContent('3,0 dias');

      // Verificar Mika Insights
      expect(screen.getByText(/Gargalo em Revisão/i)).toBeInTheDocument();

      // Disparar impressão
      fireEvent.click(screen.getByTestId('btn-trigger-print'));
      expect(printSpy).toHaveBeenCalled();

      // Fechar modal
      fireEvent.click(screen.getByTestId('btn-close-print-view'));
      expect(onClose).toHaveBeenCalled();

      printSpy.mockRestore();
    });
  });

  describe('ExportReportModal Component', () => {
    it('renderiza o modal de configuração de exportação e dispara PDF', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { ExportReportModal } = await import('../../src/components/ExportReportModal');

      const onClose = vi.fn();
      const onGeneratePdf = vi.fn();

      render(
        <ExportReportModal
          isOpen={true}
          onClose={onClose}
          board={mockBoard}
          tasks={mockTasks}
          filteredTasks={mockTasks.slice(0, 2)}
          mikaInsights={mockMikaInsights}
          activeDateFilterLabel="Últimos 14 dias"
          hasActiveFilters={true}
          onGeneratePdf={onGeneratePdf}
        />,
      );

      // Verificar elementos do modal
      expect(screen.getByText('Exportar Relatório de Fluxo')).toBeInTheDocument();
      expect(screen.getByText('Quadro de Engenharia')).toBeInTheDocument();
      expect(screen.getByText(/Filtros Ativos/i)).toBeInTheDocument();

      // Formato padrão é PDF
      fireEvent.click(screen.getByTestId('btn-confirm-export'));
      expect(onGeneratePdf).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('permite alternar para formato Excel e disparar download CSV', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { ExportReportModal } = await import('../../src/components/ExportReportModal');

      const onClose = vi.fn();
      const onGeneratePdf = vi.fn();

      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const mockRevokeObjectURL = vi.fn();
      window.URL.createObjectURL = mockCreateObjectURL;
      window.URL.revokeObjectURL = mockRevokeObjectURL;
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      render(
        <ExportReportModal
          isOpen={true}
          onClose={onClose}
          board={mockBoard}
          tasks={mockTasks}
          filteredTasks={mockTasks}
          onGeneratePdf={onGeneratePdf}
        />,
      );

      // Selecionar formato Excel
      fireEvent.click(screen.getByTestId('format-excel'));
      expect(screen.getByTestId('btn-confirm-export')).toHaveTextContent(/Baixar Planilha/i);

      fireEvent.click(screen.getByTestId('btn-confirm-export'));
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();

      clickSpy.mockRestore();
    });
  });

  describe('Header Trigger Buttons Integration', () => {
    it('dispara onOpenExportModal a partir do AnalyticsNavHeader', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { AnalyticsNavHeader } = await import('../../src/components/AnalyticsNavHeader');

      const onOpenExport = vi.fn();

      render(
        <AnalyticsNavHeader
          activeCategory="dashboard"
          onOpenExportModal={onOpenExport}
        />,
      );

      const exportBtn = screen.getByTestId('export-report-trigger');
      expect(exportBtn).toBeInTheDocument();
      fireEvent.click(exportBtn);
      expect(onOpenExport).toHaveBeenCalledTimes(1);
    });

    it('dispara onOpenExportModal a partir do AppHeader', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { AppHeader } = await import('../../src/components/AppHeader');

      const onOpenExport = vi.fn();

      render(
        <AppHeader
          boards={[mockBoard as any]}
          activeBoardId="board-1"
          onSwitchBoard={vi.fn()}
          teams={[]}
          activeUserId="user-1"
          view="analytics"
          onSelectView={vi.fn()}
          theme="neutral"
          onSelectTheme={vi.fn()}
          users={[]}
          activeUser={null}
          onSelectUser={vi.fn()}
          onCreateUser={vi.fn()}
          onOpenTeamsModal={vi.fn()}
          fileInputRef={{ current: null }}
          onFileChange={vi.fn()}
          onImportClick={vi.fn()}
          onExport={vi.fn()}
          onResetDemo={vi.fn()}
          onClearBoard={vi.fn()}
          isGuest={false}
          onOpenExportModal={onOpenExport}
        />,
      );

      const headerExportBtn = screen.getByTestId('header-export-report-btn');
      expect(headerExportBtn).toBeInTheDocument();
      fireEvent.click(headerExportBtn);
      expect(onOpenExport).toHaveBeenCalledTimes(1);
    });
  });
});
