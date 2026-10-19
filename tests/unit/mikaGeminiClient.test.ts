import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MikaGeminiClient } from '../../src/services/ai/mikaGeminiClient';
import { TaskModel } from '../../src/types/kanban';

describe('MikaGeminiClient', () => {
  let client: MikaGeminiClient;
  const mockApiKey = 'AIzaSyTestApiKey1234567890';

  beforeEach(() => {
    client = new MikaGeminiClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve chamar o endpoint do Google Gemini com payload estruturado e retornar insights', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify([
                  {
                    id: 'gemini-insight-1',
                    title: 'Gargalo em Revisão de Código',
                    summary: 'A coluna possui 6 tarefas e tempo médio superior a 4 dias.',
                    recommendation: 'Realizar sessão de code review pareada.',
                    severity: 'warning',
                    category: 'wip-bottleneck',
                  },
                ]),
              },
            ],
          },
        },
      ],
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    } as unknown as Response);

    const insights = await client.generateInsights(mockApiKey, 'Contexto do quadro kanban...');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(insights.length).toBe(1);
    expect(insights[0].title).toBe('Gargalo em Revisão de Código');
    expect(insights[0].category).toBe('wip-bottleneck');
  });

  it('deve lançar erro descritivo quando a chave de API estiver ausente', async () => {
    await expect(client.generateInsights('', 'contexto')).rejects.toThrow(
      'Chave de API do Gemini não fornecida',
    );
  });

  it('deve lançar erro quando a API retornar status HTTP de erro (ex: 403 ou 429)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => 'API key not valid',
    } as unknown as Response);

    await expect(client.generateInsights(mockApiKey, 'contexto')).rejects.toThrow(
      'Falha na chamada Gemini API (403): Forbidden',
    );
  });

  it('deve decompor uma tarefa via Gemini retornando subtarefas e critérios de aceite', async () => {
    const mockTask: TaskModel = {
      id: 'task-ai',
      title: 'Implementar autenticação OAuth2 Google',
      description: 'Permitir login via conta Google com escopo de perfil básico.',
      column: 'col-todo',
      createdAt: '2026-10-15T10:00:00Z',
    };

    const mockDecompResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  suggestedSubtasks: [
                    {
                      id: 'sub-1',
                      title: 'Configurar credenciais no Google Cloud Console',
                      completed: false,
                    },
                    { id: 'sub-2', title: 'Criar botão de login social na tela', completed: false },
                    { id: 'sub-3', title: 'Persistir token e sessão no cliente', completed: false },
                  ],
                  suggestedAcceptanceCriteria: [
                    'Dado usuário não autenticado, Quando clicar em Entrar com Google, Então deve redirecionar para consentimento.',
                  ],
                  explanation: 'Refinamento técnico da autenticação OAuth2.',
                }),
              },
            ],
          },
        },
      ],
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDecompResponse,
    } as unknown as Response);

    const result = await client.decomposeTask(mockApiKey, mockTask);
    expect(result.taskId).toBe(mockTask.id);
    expect(result.suggestedSubtasks.length).toBe(3);
    expect(result.suggestedAcceptanceCriteria?.length).toBe(1);
  });
});
