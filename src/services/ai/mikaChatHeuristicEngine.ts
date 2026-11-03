/**
 * mikaChatHeuristicEngine.ts - Motor analítico determinístico para o chat da Mika (Feature 052)
 * Classificador determinístico de intenções por palavras-chave com templates dinâmicos.
 * Opera 100% offline em < 10ms, sem chamadas externas nem consumo de tokens (Princípio VIII).
 */

import { MikaBoardTelemetryContext, MikaQuickPromptCategory } from '../../types/mika';

export interface MikaHeuristicChatResult {
  content: string;
  referencedTaskIds: string[];
  category: MikaQuickPromptCategory | 'general';
}

/**
 * Remove acentos e converte para minúsculas para correspondência semântica robusta
 */
export function normalizeQuery(query: string): string {
  return (query || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Processa uma pergunta do usuário em linguagem natural usando a telemetria do quadro
 */
export function processMikaHeuristicChat(
  query: string,
  context: MikaBoardTelemetryContext,
): MikaHeuristicChatResult {
  const normalized = normalizeQuery(query);
  const referencedTaskIds: string[] = [];

  // 1. Intenção: Tarefas Bloqueadas / Impedimentos
  if (
    normalized.includes('bloquead') ||
    normalized.includes('impedid') ||
    normalized.includes('impedimento') ||
    normalized.includes('travad') ||
    normalized.includes('obstacul')
  ) {
    if (context.blockedTasks.length === 0) {
      return {
        content: `🎉 **Ótimo sinal!** Não há nenhuma tarefa marcada como bloqueada no quadro **${context.boardTitle}** no momento.\n\nO fluxo de trabalho está desimpedido. Continue monitorando os limites de WIP para garantir que os itens fluam sem atrito.`,
        referencedTaskIds: [],
        category: 'blocked',
      };
    }

    context.blockedTasks.forEach((b) => referencedTaskIds.push(b.id));

    const list = context.blockedTasks
      .map(
        (b) =>
          `- #${b.id} **${b.title}**\n  📍 Coluna: *${b.columnTitle}* | ⏳ Bloqueada há: ~${b.blockedHours}h\n  ⚠️ Motivo: *${b.reason}*`,
      )
      .join('\n\n');

    return {
      content: `Identifiquei **${context.blockedTasks.length} ${
        context.blockedTasks.length === 1 ? 'tarefa bloqueada' : 'tarefas bloqueadas'
      }** que demandam atenção imediata da equipe:\n\n${list}\n\n💡 **Recomendação Lean**: Bloqueios são as maiores fontes de variabilidade no tempo de ciclo. Recomendo reunir a equipe em torno desses itens (*swarming*) para destravar o fluxo antes de puxar novo trabalho.`,
      referencedTaskIds,
      category: 'blocked',
    };
  }

  // 2. Intenção: Gargalos / Fila / Estrangulamento / WIP Congestionado
  if (
    normalized.includes('gargalo') ||
    normalized.includes('estrangulamento') ||
    normalized.includes('onde esta') ||
    normalized.includes('afunilamento') ||
    normalized.includes('travamento') ||
    normalized.includes('congestao')
  ) {
    const overWipCols = context.columns.filter((c) => c.isOverWip);
    const sortedByAging = [...context.columns].sort(
      (a, b) => (b.avgStageTimeHours || 0) - (a.avgStageTimeHours || 0),
    );
    const highestAgingCol = sortedByAging[0];

    if (overWipCols.length > 0) {
      const col = overWipCols[0];
      return {
        content: `🚨 **Gargalo Detectado por Violação de WIP!**\n\nA coluna **${col.title}** está operando acima da capacidade acordada, acumulando **${col.taskCount} tarefas** para um limite de **${col.wipLimit}**.\n\n- Permanência média na etapa: ~**${col.avgStageTimeHours} horas**\n\n💡 **Ação recomendada**: Suspenda a entrada de novos cartões nesta coluna (*Stop Starting, Start Finishing*). Ajude os membros alocados nela a concluir ou mover os itens em andamento para restabelecer o fluxo contínuo.`,
        referencedTaskIds: [],
        category: 'bottleneck',
      };
    }

    if (
      highestAgingCol &&
      highestAgingCol.taskCount > 0 &&
      (highestAgingCol.avgStageTimeHours || 0) > 12
    ) {
      return {
        content: `⚠️ **Atenção ao Ponto Crítico de Permanência!**\n\nNenhuma coluna violou o limite numérico de WIP, mas a coluna **${highestAgingCol.title}** apresenta o maior tempo médio de permanência do quadro (~**${highestAgingCol.avgStageTimeHours} horas** por cartão), com **${highestAgingCol.taskCount} tarefas** ativas.\n\n💡 **Ação recomendada**: Verifique se os itens nesta coluna estão sofrendo dependências externas não sinalizadas ou se o escopo das tarefas precisa de refinamento e quebra em itens menores.`,
        referencedTaskIds: [],
        category: 'bottleneck',
      };
    }

    return {
      content: `✅ **Fluxo Estável!** As colunas do quadro **${context.boardTitle}** estão operando dentro dos limites de WIP configurados e sem acúmulo desproporcional de tarefas.\n\n- Total de tarefas ativas em progresso: **${context.totalActiveTasks}**\n- Mantenha a disciplina de respeitar os limites para preservar essa estabilidade.`,
      referencedTaskIds: [],
      category: 'bottleneck',
    };
  }

  // 3. Intenção: SLE / Service Level Expectation / Tempo de Ciclo / Percentil 85%
  if (
    normalized.includes('sle') ||
    normalized.includes('percentil') ||
    normalized.includes('85') ||
    normalized.includes('tempo de ciclo') ||
    normalized.includes('cycle time') ||
    normalized.includes('prazo acordado')
  ) {
    if (context.cycleTimeP85Days === null) {
      return {
        content: `📊 **Amostra Estatística Preliminar**\n\nAinda não temos tarefas concluídas suficientes com datas de início e fim no quadro **${context.boardTitle}** para calcular a Expectativa de Nível de Serviço (SLE) de 85% com significância estatística.\n\n💡 **Próximo passo**: Conforme a equipe for concluindo cartões, o Metrik calculará automaticamente o percentil com base no padrão científico NIST.`,
        referencedTaskIds: [],
        category: 'sle',
      };
    }

    return {
      content: `🎯 **Expectativa de Nível de Serviço (SLE P85): ${context.cycleTimeP85Days} dias**\n\nCom base no histórico do quadro, **85% das tarefas concluídas foram entregues em até ${context.cycleTimeP85Days} dias** desde o início do trabalho.\n\n- Tarefas concluídas no histórico: **${context.totalCompletedTasks}**\n- Vazão dos últimos 14 dias: **${context.throughputLast14Days} tarefas**\n\n💡 **Como usar esse número**: Se um item estiver em progresso há mais de 85% desse tempo (ou seja, acima de ${(context.cycleTimeP85Days * 0.85).toFixed(1)} dias), ele deve ser inspecionado proativamente nas reuniões diárias (*dailies*) para evitar estourar o SLE da equipe.`,
      referencedTaskIds: [],
      category: 'sle',
    };
  }

  // 4. Intenção: Previsão / Monte Carlo / Vazão / Throughput
  if (
    normalized.includes('previs') ||
    normalized.includes('quando') ||
    normalized.includes('data') ||
    normalized.includes('entrega') ||
    normalized.includes('monte carlo') ||
    normalized.includes('vazao') ||
    normalized.includes('throughput') ||
    normalized.includes('ritmo')
  ) {
    const dailyRate = context.throughputLast14Days / 14;
    const rateText = dailyRate > 0 ? dailyRate.toFixed(1) : '0';

    return {
      content: `📈 **Diagnóstico de Vazão & Previsibilidade**\n\nNos últimos 14 dias, a equipe concluiu **${context.throughputLast14Days} tarefas**, resultando em um ritmo médio de entrega de **~${rateText} tarefas por dia**.\n\n- Tarefas atualmente ativas no quadro: **${context.totalActiveTasks}**\n- Tarefas concluídas no histórico: **${context.totalCompletedTasks}**\n\n💡 **Dica de Previsibilidade**: Para obter estimativas probabilísticas detalhadas (ex.: data de conclusão com 50%, 85% e 95% de certeza), utilize a aba de **Simulação de Monte Carlo** no menu de Analytics. Ela roda 10.000 iterações baseadas diretamente no seu histórico real!`,
      referencedTaskIds: [],
      category: 'throughput',
    };
  }

  // 5. Intenção: Limites de WIP / Capacidade
  if (
    normalized.includes('wip') ||
    normalized.includes('limite') ||
    normalized.includes('capacidade') ||
    normalized.includes('sobrecarga')
  ) {
    const colsWithWip = context.columns.filter((c) => c.wipLimit !== undefined);
    const colsOverWip = context.columns.filter((c) => c.isOverWip);

    let details = colsWithWip
      .map(
        (c) =>
          `- **${c.title}**: ${c.taskCount}/${c.wipLimit} ${c.isOverWip ? '⚠️ (Acima do limite)' : '✅'}`,
      )
      .join('\n');

    if (!details) {
      details = 'Nenhuma coluna possui limite de WIP numérico configurado.';
    }

    return {
      content: `📋 **Estado dos Limites de Trabalho em Andamento (WIP)**:\n\n${details}\n\n${
        colsOverWip.length > 0
          ? `⚠️ Há **${colsOverWip.length} coluna(s)** com excesso de WIP. A Lei de Little demonstra que WIP excessivo aumenta diretamente o tempo de ciclo e reduz a previsibilidade.`
          : '✅ Todos os limites de WIP configurados estão sendo respeitados!'
      }`,
      referencedTaskIds: [],
      category: 'bottleneck',
    };
  }

  // 6. Resposta Padrão / Ajuda Geral
  return {
    content: `👋 **Olá! Sou a Mika**, sua copiloto analítica de fluxo (operando em modo Local-First Offline).\n\nPosso analisar a telemetria do quadro **${context.boardTitle}** para te apoiar em decisões técnicas. Experimente perguntar:\n\n- *"Onde está o principal gargalo do fluxo?"*\n- *"Quais tarefas estão bloqueadas?"*\n- *"Qual é o nosso SLE de 85%?"*\n- *"Como está a nossa vazão recente e ritmo de entrega?"*\n\nVocê também pode utilizar os chips de atalho rápido logo acima para consultas com apenas um clique!`,
    referencedTaskIds: [],
    category: 'general',
  };
}
