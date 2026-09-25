import { describe, it, expect } from 'vitest';
import { filterTimelineItems } from '../../src/utils/taskActivityLogger';
import { TaskComment, TaskActivityLog } from '../../src/types/taskActivity';

/**
 * T026 — Verificação automatizada de performance da busca/filtro do histórico.
 * Requisito: SC-002 (<200ms de resposta visual).
 * O filtro é puro (sem React), então a medição é determinística.
 */
describe('Timeline filtering performance (Feature 037 / T026, SC-002)', () => {
  const buildData = () => {
    const comments: TaskComment[] = Array.from({ length: 2500 }, (_, i) => ({
      id: `c-${i}`,
      taskId: 't1',
      userId: 'u1',
      userName: `Usuário ${i}`,
      text: i % 7 === 0 ? `Comentário com palavra-chave alvo ${i}` : `Comentário comum ${i}`,
      isDecision: i % 11 === 0,
      createdAt: new Date(Date.now() - i * 60_000).toISOString(),
    }));

    const activityLog: TaskActivityLog[] = Array.from({ length: 2500 }, (_, i) => ({
      id: `a-${i}`,
      taskId: 't1',
      userId: 'u1',
      userName: `Usuário ${i}`,
      eventType: 'moved',
      description: `Movido da coluna "A Fazer" para "Em Progresso" ${i}`,
      fromValue: 'A Fazer',
      toValue: 'Em Progresso',
      timestamp: new Date(Date.now() - i * 60_000).toISOString(),
    }));

    return { comments, activityLog };
  };

  it('filtra e ordena 5.000 entradas em menos de 200ms', () => {
    const { comments, activityLog } = buildData();

    const start = performance.now();

    const all = filterTimelineItems(comments, activityLog, 'all', '');
    const search = filterTimelineItems(comments, activityLog, 'all', 'palavra-chave alvo');
    const decisions = filterTimelineItems(comments, activityLog, 'decisions', '');

    const elapsed = performance.now() - start;

    expect(all).toHaveLength(5000);
    expect(search.length).toBeGreaterThan(0);
    expect(decisions.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });
});
