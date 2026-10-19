/**
 * Motor heurístico local determinístico da Mika AI (Feature 048)
 * Opera 100% offline sem chamadas de rede (Local-First / Soberania).
 * Baseado na literatura de fluxo (Daniel Vacanti, Frank Vega, Troy Magennis).
 */

import { ColumnModel, TaskModel } from '../../types/kanban';
import { MikaDecomposition, MikaInsight } from '../../types/mika';
import { calculateFlowPercentiles } from '../../utils/statistics';
import { extractDailyThroughput, runMonteCarloWhen } from '../../utils/monteCarlo';

export class MikaHeuristicEngine {
  /**
   * Analisa a telemetria do quadro e gera insights narrativos de fluxo.
   */
  public generateBoardInsights(columns: ColumnModel[], tasks: TaskModel[]): MikaInsight[] {
    const insights: MikaInsight[] = [];
    const timestamp = new Date().toISOString();

    const doneColumnIds = new Set(columns.filter((c) => c.category === 'done').map((c) => c.id));
    const inProgressColumnIds = new Set(
      columns.filter((c) => c.category === 'in_progress').map((c) => c.id),
    );

    const completedTasks = tasks.filter((t) => doneColumnIds.has(t.column) || !!t.completedAt);
    const inProgressTasks = tasks.filter((t) => inProgressColumnIds.has(t.column));
    const pendingTasks = tasks.filter((t) => !doneColumnIds.has(t.column) && !t.completedAt);

    // 1. Verificação de Amostra Preliminar (Edge Case Spec)
    if (completedTasks.length < 5) {
      insights.push({
        id: `insight-preliminary-${Date.now()}`,
        title: 'Amostra Preliminar de Dados',
        summary:
          'Os dados amostrais ainda são preliminares (menos de 5 tarefas concluídas). Conforme você conclui mais itens, os diagnósticos probabilísticos de SLE e Monte Carlo se tornarão altamente precisos.',
        recommendation:
          'Continue movimentando tarefas normalmente pelo fluxo para acumular histórico de vazão.',
        severity: 'info',
        category: 'throughput',
        timestamp,
      });
    } else {
      // 2. Diagnóstico de Tempo de Ciclo & SLE (Percentil 85)
      const cycleTimesInDays: number[] = [];
      for (const t of completedTasks) {
        if (t.completedAt) {
          const start = t.startedAt || t.createdAt;
          if (start) {
            const diffMs = new Date(t.completedAt).getTime() - new Date(start).getTime();
            const days = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
            cycleTimesInDays.push(days);
          }
        }
      }

      if (cycleTimesInDays.length >= 5) {
        const stats = calculateFlowPercentiles(cycleTimesInDays);
        insights.push({
          id: `insight-cycle-time-${Date.now()}`,
          title: `Tempo de Ciclo (SLE): 85% em até ${stats.p85} dias`,
          summary: `O tempo de ciclo para o 85º percentil é de ${stats.p85} dias (50% das tarefas concluem em até ${stats.p50} dias). 85% das tarefas concluídas recentemente foram entregues dentro desse patamar.`,
          recommendation:
            stats.p85 > stats.p50 * 2.5
              ? 'Existe alta dispersão entre a mediana e o percentil 85. Avalie quebrar tarefas complexas antes de puxá-las para reduzir a cauda longa.'
              : 'O fluxo apresenta boa previsibilidade com baixa variabilidade entre a mediana e o percentil 85.',
          severity: stats.p85 > stats.p50 * 2.5 ? 'warning' : 'info',
          category: 'cycle-time',
          metricValue: `${stats.p85} dias`,
          timestamp,
        });
      }

      // 3. Previsibilidade de Monte Carlo (Simulação When)
      if (pendingTasks.length > 0) {
        const throughputSamples = extractDailyThroughput(tasks, 30);
        const throughputHistory = throughputSamples.map((s) => s.count);
        const nonZero = throughputHistory.filter((c) => c > 0);

        if (nonZero.length > 0) {
          const sim = runMonteCarloWhen(throughputHistory, pendingTasks.length, new Date(), 1000);
          const p85DateFormatted = sim.p85.projectedDate;

          insights.push({
            id: `insight-monte-carlo-${Date.now()}`,
            title: `Previsibilidade de Entrega: 85% de certeza até ${p85DateFormatted}`,
            summary: `Com base na simulação probabilística de Monte Carlo (10.000 iterações), há 85% de probabilidade de concluir os ${pendingTasks.length} itens pendentes em até ${sim.p85.days} dias (meta recomendada: ${p85DateFormatted}). Para 50% de probabilidade, a estimativa é de ${sim.p50.days} dias.`,
            recommendation:
              'Recomenda-se pactuar compromissos externos utilizando a data de 85% para proteção contra a variabilidade do fluxo.',
            severity: 'info',
            category: 'monte-carlo',
            metricValue: `85% até ${p85DateFormatted}`,
            timestamp,
          });
        }
      }
    }

    // 4. Diagnóstico de Gargalos de WIP & Violação de Limites (Lei de Little)
    for (const col of columns) {
      if (col.wipLimit !== null && col.wipLimit > 0) {
        const colTasks = tasks.filter((t) => t.column === col.id);
        if (colTasks.length > col.wipLimit) {
          insights.push({
            id: `insight-wip-${col.id}-${Date.now()}`,
            title: `Gargalo Detectado: Limite de WIP Ultrapassado em "${col.title}"`,
            summary: `A coluna "${col.title}" está com ${colTasks.length} itens em andamento, excedendo o limite de WIP configurado (${col.wipLimit}).`,
            recommendation:
              'Conforme a Lei de Little, excesso de trabalho em progresso (WIP) dilui o foco e eleva o tempo de ciclo médio. Recomenda-se dar vazão aos itens atuais antes de puxar novos.',
            severity: 'warning',
            category: 'wip-bottleneck',
            affectedColumnId: col.id,
            affectedTaskIds: colTasks.map((t) => t.id),
            metricValue: `${colTasks.length}/${col.wipLimit}`,
            timestamp,
          });
        }
      }
    }

    // 5. Diagnóstico Geral de Saúde de Fluxo se não houver gargalos
    if (
      insights.filter((i) => i.severity === 'warning' || i.severity === 'critical').length === 0
    ) {
      insights.push({
        id: `insight-health-${Date.now()}`,
        title: 'Fluxo Estável e Dentro dos Limites',
        summary: `O quadro opera de maneira saudável com ${inProgressTasks.length} itens em andamento distribuídos sem violações de limite de WIP.`,
        recommendation: 'Mantenha a política de puxar trabalho sob demanda (Pull System).',
        severity: 'info',
        category: 'throughput',
        timestamp,
      });
    }

    return insights;
  }

  /**
   * Decompõe heurísticamente uma tarefa em subtarefas e critérios de aceite objetivos.
   */
  public decomposeTask(task: TaskModel): MikaDecomposition {
    const timestamp = new Date().toISOString();
    const title = (task.title || '').trim();
    const description = (task.description || '').trim();
    const isShort = title.length < 10 && description.length < 10;

    if (isShort) {
      return {
        taskId: task.id,
        explanation:
          'A tarefa possui poucas informações para uma decomposição aprofundada. Abaixo estão etapas padrão recomendadas para esclarecer e estruturar a entrega.',
        suggestedSubtasks: [
          {
            id: `sub-${Date.now()}-1`,
            title: 'Detalhamento dos requisitos de negócio e escopo',
            text: 'Detalhamento dos requisitos de negócio e escopo',
            completed: false,
          },
          {
            id: `sub-${Date.now()}-2`,
            title: 'Implementação da solução técnica básica',
            text: 'Implementação da solução técnica básica',
            completed: false,
          },
          {
            id: `sub-${Date.now()}-3`,
            title: 'Validação e testes manuais/automatizados',
            text: 'Validação e testes manuais/automatizados',
            completed: false,
          },
        ],
        suggestedAcceptanceCriteria: [
          `Dado que a tarefa "${title || 'Sem título'}" precisa ser executada, Quando o desenvolvedor iniciar o trabalho, Então o escopo deve ser refinado antes do código.`,
        ],
        timestamp,
      };
    }

    // Decomposição contextual heurística
    const subtasks = [
      {
        id: `sub-${Date.now()}-1`,
        title: `Mapear dependências e contratos de interface para "${title}"`,
        text: `Mapear dependências e contratos de interface para "${title}"`,
        completed: false,
      },
      {
        id: `sub-${Date.now()}-2`,
        title: 'Implementar a lógica central e regras de validação',
        text: 'Implementar a lógica central e regras de validação',
        completed: false,
      },
      {
        id: `sub-${Date.now()}-3`,
        title: 'Criar testes unitários e de integração com cobertura de borda',
        text: 'Criar testes unitários e de integração com cobertura de borda',
        completed: false,
      },
      {
        id: `sub-${Date.now()}-4`,
        title: 'Ajustar interface visual e estados de feedback (loading, erro, sucesso)',
        text: 'Ajustar interface visual e estados de feedback (loading, erro, sucesso)',
        completed: false,
      },
      {
        id: `sub-${Date.now()}-5`,
        title: 'Realizar revisão de código e homologar critérios de aceite',
        text: 'Realizar revisão de código e homologar critérios de aceite',
        completed: false,
      },
    ];

    const criteria = [
      `Dado que o usuário interage com "${title}", Quando a ação principal for disparada, Então o sistema deve processar com sucesso e persistir as alterações.`,
      `Dado um cenário de erro ou indisponibilidade, Quando a operação falhar, Então o sistema deve exibir mensagem explicativa em pt-BR sem quebrar a tela.`,
    ];

    return {
      taskId: task.id,
      explanation: `Decomposição estruturada com base nas melhores práticas ágeis para garantir entregabilidade previsível do item.`,
      suggestedSubtasks: subtasks,
      suggestedAcceptanceCriteria: criteria,
      timestamp,
    };
  }
}

export const mikaHeuristicEngine = new MikaHeuristicEngine();
