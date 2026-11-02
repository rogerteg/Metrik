/**
 * tests/unit/mikaChat.test.tsx
 * Suíte de testes unitários do Chat da Mika (Feature 052)
 * Cobre storage FIFO, extrator de telemetria, motor heurístico e cliente Gemini.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadChatSession,
  appendChatMessage,
  clearChatSession,
  loadDrawerActiveTab,
  saveDrawerActiveTab,
  MAX_CHAT_HISTORY,
} from '../../src/services/ai/mikaChatStorageManager';
import {
  buildBoardTelemetryContext,
  buildMikaSystemPrompt,
} from '../../src/services/ai/mikaContextBuilder';
import {
  processMikaHeuristicChat,
  normalizeQuery,
} from '../../src/services/ai/mikaChatHeuristicEngine';
import { mikaGeminiClient } from '../../src/services/ai/mikaGeminiClient';
import { ColumnModel, TaskModel } from '../../src/types/kanban';
import { MikaBoardTelemetryContext, MikaChatMessage } from '../../src/types/mika';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MikaMessageContent } from '../../src/components/Mika/MikaMessageContent';
import { MikaChatInterface } from '../../src/components/Mika/MikaChatInterface';

describe('Mika Chat Storage Manager (Local-First Sovereignty)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna uma sessão vazia inicial para um quadro novo', () => {
    const session = loadChatSession('board-101');
    expect(session.boardId).toBe('board-101');
    expect(session.messages).toEqual([]);
    expect(session.updatedAt).toBeDefined();
  });

  it('adiciona mensagens ao histórico e recupera com sucesso', () => {
    const msg: MikaChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Onde está o gargalo?',
      timestamp: new Date().toISOString(),
      provider: 'gemini',
    };

    const session = appendChatMessage('board-101', msg);
    expect(session.messages).toHaveLength(1);
    expect(session.messages[0].content).toBe('Onde está o gargalo?');

    const loaded = loadChatSession('board-101');
    expect(loaded.messages).toHaveLength(1);
    expect(loaded.messages[0].id).toBe('msg-1');
  });

  it('impõe estritamente o limite de 30 mensagens em regime FIFO (descarta as mais antigas)', () => {
    for (let i = 1; i <= 35; i++) {
      appendChatMessage('board-101', {
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'assistant' : 'user',
        content: `Mensagem ${i}`,
        timestamp: new Date().toISOString(),
        provider: 'heuristic',
      });
    }

    const session = loadChatSession('board-101');
    expect(session.messages).toHaveLength(MAX_CHAT_HISTORY);
    expect(session.messages[0].id).toBe('msg-6'); // Primeiras 5 descartadas
    expect(session.messages[session.messages.length - 1].id).toBe('msg-35');
  });

  it('limpa o histórico da sessão de um quadro', () => {
    appendChatMessage('board-101', {
      id: 'msg-1',
      role: 'user',
      content: 'Teste',
      timestamp: new Date().toISOString(),
      provider: 'heuristic',
    });

    clearChatSession('board-101');
    const session = loadChatSession('board-101');
    expect(session.messages).toHaveLength(0);
  });

  it('armazena e recupera a aba ativa da gaveta', () => {
    expect(loadDrawerActiveTab()).toBe('chat');
    saveDrawerActiveTab('insights');
    expect(loadDrawerActiveTab()).toBe('insights');
    saveDrawerActiveTab('chat');
    expect(loadDrawerActiveTab()).toBe('chat');
  });
});

describe('Mika Context Builder (Telemetria & System Prompt)', () => {
  const mockColumns: ColumnModel[] = [
    { id: 'c1', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'c2', title: 'Em Progresso', category: 'in_progress', wipLimit: 2, colorScheme: 'progress' },
    { id: 'c3', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const mockTasks: TaskModel[] = [
    {
      id: 'task-1',
      title: 'Ajustar Gateway',
      column: 'c2',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      lastMovedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Corrigir Checkout',
      column: 'c2',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      blocked: true,
      blockedReason: 'Aguardando credenciais da API',
      blockedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Refatorar Modal',
      column: 'c2',
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Tarefa Entregue',
      column: 'c3',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  it('compila o snapshot de telemetria detectando violação de WIP e tarefas bloqueadas', () => {
    const context = buildBoardTelemetryContext(
      { id: 'b1', title: 'Squad Pagamentos' },
      mockTasks,
      mockColumns
    );

    expect(context.boardId).toBe('b1');
    expect(context.boardTitle).toBe('Squad Pagamentos');
    expect(context.columns).toHaveLength(3);

    const progressCol = context.columns.find((c) => c.id === 'c2');
    expect(progressCol).toBeDefined();
    expect(progressCol?.taskCount).toBe(3);
    expect(progressCol?.wipLimit).toBe(2);
    expect(progressCol?.isOverWip).toBe(true);

    expect(context.blockedTasks).toHaveLength(1);
    expect(context.blockedTasks[0].id).toBe('task-2');
    expect(context.blockedTasks[0].reason).toBe('Aguardando credenciais da API');
    expect(context.blockedTasks[0].blockedHours).toBeGreaterThanOrEqual(14);

    expect(context.totalActiveTasks).toBe(3);
    expect(context.totalCompletedTasks).toBe(1);
    expect(context.cycleTimeP85Days).toBeCloseTo(3.0, 0);
  });

  it('gera o System Prompt sem nenhuma menção a produtos concorrentes (Princípio VII)', () => {
    const context = buildBoardTelemetryContext(
      { id: 'b1', title: 'Squad Core' },
      mockTasks,
      mockColumns
    );

    const prompt = buildMikaSystemPrompt(context);
    expect(prompt).toContain('Você é a Mika');
    expect(prompt).toContain('Squad Core');
    expect(prompt).toContain('Em Progresso');
    expect(prompt).toContain('VIOLADO');

    // Validação estrita de marca (zero menção a produtos terceiros)
    const forbiddenBrands = ['Jira', 'ClickUp', 'Trello', 'Businessmap', 'ActionableAgile', 'Monday'];
    forbiddenBrands.forEach((brand) => {
      // O prompt só pode citar a marca se for na cláusula de proibição "NUNCA mencione..."
      const promptWithoutDisclaimer = prompt.replace('NUNCA mencione marcas ou produtos de concorrentes ou de terceiros (ex.: Jira, ClickUp, Trello, Businessmap, ActionableAgile, etc.)', '');
      expect(promptWithoutDisclaimer).not.toContain(brand);
    });
  });
});

describe('Mika Chat Heuristic Engine (Offline / Local-First)', () => {
  const baseContext: MikaBoardTelemetryContext = {
    boardId: 'b1',
    boardTitle: 'Quadro de Engenharia',
    columns: [
      { id: 'c1', title: 'Backlog', taskCount: 2, isOverWip: false, avgStageTimeHours: 5 },
      { id: 'c2', title: 'Desenvolvimento', wipLimit: 3, taskCount: 4, isOverWip: true, avgStageTimeHours: 18 },
      { id: 'c3', title: 'Done', taskCount: 10, isOverWip: false, avgStageTimeHours: 0 },
    ],
    blockedTasks: [
      {
        id: '42',
        title: 'Integrar Webhook',
        columnTitle: 'Desenvolvimento',
        reason: 'Dependência de infraestrutura externa',
        blockedHours: 26,
      },
    ],
    cycleTimeP85Days: 4.5,
    throughputLast14Days: 8,
    totalActiveTasks: 6,
    totalCompletedTasks: 10,
    generatedAt: new Date().toISOString(),
  };

  it('normaliza termos removendo acentos e pontuações', () => {
    expect(normalizeQuery('Onde está o gargalo?')).toBe('onde esta o gargalo?');
    expect(normalizeQuery('Previsão & Vazão')).toBe('previsao & vazao');
  });

  it('responde a consultas sobre gargalos destacando a coluna com limite violado', () => {
    const res = processMikaHeuristicChat('Onde está o principal gargalo do fluxo?', baseContext);
    expect(res.category).toBe('bottleneck');
    expect(res.content).toContain('Gargalo Detectado por Violação de WIP');
    expect(res.content).toContain('Desenvolvimento');
    expect(res.content).toContain('**4 tarefas** para um limite de **3**');
  });

  it('responde a consultas sobre tarefas bloqueadas e extrai referencedTaskIds', () => {
    const res = processMikaHeuristicChat('Quais tarefas estão bloqueadas?', baseContext);
    expect(res.category).toBe('blocked');
    expect(res.content).toContain('Integrar Webhook');
    expect(res.content).toContain('#42');
    expect(res.content).toContain('Dependência de infraestrutura externa');
    expect(res.referencedTaskIds).toEqual(['42']);
  });

  it('responde a consultas sobre SLE de 85% informando os percentis reais', () => {
    const res = processMikaHeuristicChat('Qual é o nosso SLE de 85%?', baseContext);
    expect(res.category).toBe('sle');
    expect(res.content).toContain('Expectativa de Nível de Serviço (SLE P85): 4.5 dias');
    expect(res.content).toContain('85% das tarefas concluídas foram entregues em até 4.5 dias');
  });

  it('responde a consultas sobre previsão e ritmo com base na vazão recente', () => {
    const res = processMikaHeuristicChat('Qual é a nossa previsão de entrega e ritmo?', baseContext);
    expect(res.category).toBe('throughput');
    expect(res.content).toContain('concluiu **8 tarefas**');
    expect(res.content).toContain('Tarefas atualmente ativas no quadro: **6**');
  });

  it('retorna mensagem de ajuda cordial para perguntas livres gerais', () => {
    const res = processMikaHeuristicChat('Como você pode me ajudar?', baseContext);
    expect(res.category).toBe('general');
    expect(res.content).toContain('Olá! Sou a Mika');
    expect(res.content).toContain('Quadro de Engenharia');
  });
});

describe('Mika Gemini Client Multi-Turn Chat', () => {
  it('lança erro se a chave de API for vazia', async () => {
    await expect(
      mikaGeminiClient.sendMessage('', 'system instruction', [], 'Olá')
    ).rejects.toThrow('Chave de API do Gemini não fornecida');
  });

  it('lança erro se a mensagem do usuário for vazia', async () => {
    await expect(
      mikaGeminiClient.sendMessage('valid-key', 'system instruction', [], '   ')
    ).rejects.toThrow('Mensagem do usuário vazia');
  });

  it('chama fetch com as últimas 6 mensagens contextuais e systemInstruction', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'O principal gargalo está na coluna Em Progresso.' }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fakeFetch);

    const history = [
      { role: 'user', content: 'Pergunta 1' },
      { role: 'assistant', content: 'Resposta 1' },
      { role: 'user', content: 'Pergunta 2' },
      { role: 'assistant', content: 'Resposta 2' },
      { role: 'user', content: 'Pergunta 3' },
      { role: 'assistant', content: 'Resposta 3' },
      { role: 'user', content: 'Pergunta 4' },
      { role: 'assistant', content: 'Resposta 4' },
    ];

    const answer = await mikaGeminiClient.sendMessage(
      'fake-api-key',
      'System prompt test',
      history,
      'Pergunta atual'
    );

    expect(answer).toBe('O principal gargalo está na coluna Em Progresso.');
    expect(fakeFetch).toHaveBeenCalledTimes(1);

    const callArgs = fakeFetch.mock.calls[0];
    const url = callArgs[0];
    const options = callArgs[1];
    expect(url).toContain('fake-api-key');

    const body = JSON.parse(options.body);
    expect(body.systemInstruction.parts[0].text).toBe('System prompt test');
    // Últimas 6 mensagens do history + 1 pergunta atual = 7 itens em contents
    expect(body.contents).toHaveLength(7);
    expect(body.contents[body.contents.length - 1].parts[0].text).toBe('Pergunta atual');

    vi.unstubAllGlobals();
  });
});

describe('MikaMessageContent (Interactive Task Chips - US1)', () => {
  it('renderiza texto formatado com negrito e quebras de linha', () => {
    render(<MikaMessageContent content="**Atenção:** O fluxo está estável." />);
    expect(screen.getByText('Atenção:')).toBeInTheDocument();
    expect(screen.getByText(/O fluxo está estável/i)).toBeInTheDocument();
  });

  it('converte menções #ID em chips interativos clicáveis', () => {
    const onOpenMock = vi.fn();
    render(
      <MikaMessageContent
        content="A tarefa #task-10 está bloqueada há mais de 12 horas."
        onOpenTaskDetails={onOpenMock}
        availableTaskIds={['task-10']}
      />
    );

    const chip = screen.getByRole('button', { name: /Ver detalhes da tarefa/i });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('#task-10');
    expect(chip).toHaveAttribute('title', 'Abrir detalhes da tarefa #task-10');

    fireEvent.click(chip);
    expect(onOpenMock).toHaveBeenCalledTimes(1);
    expect(onOpenMock).toHaveBeenCalledWith('task-10');
  });
});

describe('MikaChatInterface - US1 & US2 (Chat Conversacional & Chips Rápidos)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockTelemetry: MikaBoardTelemetryContext = {
    boardId: 'board-test-1',
    boardTitle: 'Quadro Principal',
    columns: [
      { id: 'col-1', title: 'A Fazer', taskCount: 2, isOverWip: false, avgStageTimeHours: 10 },
      { id: 'col-2', title: 'Em Progresso', taskCount: 4, wipLimit: 3, isOverWip: true, avgStageTimeHours: 48 },
    ],
    blockedTasks: [
      { id: 'task-10', title: 'Ajuste no Gateway', columnTitle: 'Em Progresso', reason: 'Aguardando credenciais', blockedHours: 12 },
    ],
    cycleTimeP85Days: 4.5,
    throughputLast14Days: 15,
    totalActiveTasks: 6,
    totalCompletedTasks: 20,
    generatedAt: new Date().toISOString(),
  };

  const mockTasks: TaskModel[] = [
    {
      id: 'task-10',
      title: 'Ajuste no Gateway',
      description: '',
      column: 'col-2',
      blocked: true,
      createdAt: new Date().toISOString(),
    },
  ];

  it('renderiza o estado inicial com mensagem de boas-vindas e chips de análise rápida', () => {
    render(
      <MikaChatInterface
        boardId="board-test-1"
        boardTitle="Quadro Principal"
        telemetryContext={mockTelemetry}
        availableTasks={mockTasks}
      />
    );

    expect(screen.getByText(/Olá! Sou a Mika, sua copiloto/i)).toBeInTheDocument();
    expect(screen.getByText('Sugestões de Análise:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🚨 Onde está o gargalo\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🛑 Cartões bloqueados/i })).toBeInTheDocument();
  });

  it('permite digitar uma pergunta e enviá-la via clique no botão Enviar', async () => {
    render(
      <MikaChatInterface
        boardId="board-test-1"
        boardTitle="Quadro Principal"
        telemetryContext={mockTelemetry}
        availableTasks={mockTasks}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i });
    fireEvent.change(textarea, { target: { value: 'Onde está o gargalo?' } });

    const sendBtn = screen.getByRole('button', { name: /Enviar pergunta para Mika/i });
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn);

    // Mensagem do usuário aparece no chat
    expect(screen.getByText('Onde está o gargalo?')).toBeInTheDocument();

    // Resposta heurística da Mika é gerada e renderizada
    await waitFor(() => {
      expect(screen.getByText(/Gargalo Detectado por Violação de WIP!/i)).toBeInTheDocument();
    });
  });

  it('envia a mensagem ao pressionar Enter no teclado', async () => {
    render(
      <MikaChatInterface
        boardId="board-test-1"
        boardTitle="Quadro Principal"
        telemetryContext={mockTelemetry}
        availableTasks={mockTasks}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i });
    fireEvent.change(textarea, { target: { value: 'Quais tarefas estão bloqueadas?' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText(/Identifiquei/i)).toBeInTheDocument();
    });
  });

  it('envia pergunta automaticamente ao clicar em um chip de sugestão rápida', async () => {
    render(
      <MikaChatInterface
        boardId="board-test-1"
        boardTitle="Quadro Principal"
        telemetryContext={mockTelemetry}
        availableTasks={mockTasks}
      />
    );

    const bottleneckChip = screen.getByRole('button', { name: /🚨 Onde está o gargalo\?/i });
    fireEvent.click(bottleneckChip);

    await waitFor(() => {
      expect(screen.getByText(/Gargalo Detectado por Violação de WIP!/i)).toBeInTheDocument();
    });
  });
});

describe('MikaChatInterface - US3 (Persistência, Cópia e Limpeza de Conversa)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockTelemetry: MikaBoardTelemetryContext = {
    boardId: 'board-test-persisted',
    boardTitle: 'Quadro Persistido',
    columns: [],
    blockedTasks: [],
    cycleTimeP85Days: 5,
    throughputLast14Days: 9,
    totalActiveTasks: 0,
    totalCompletedTasks: 0,
    generatedAt: new Date().toISOString(),
  };

  it('carrega mensagens pré-existentes do localStorage para o quadro ativo', () => {
    appendChatMessage('board-test-persisted', {
      id: 'pre-1',
      role: 'user',
      content: 'Mensagem salva no storage',
      timestamp: new Date().toISOString(),
      provider: 'heuristic',
    });

    render(
      <MikaChatInterface
        boardId="board-test-persisted"
        boardTitle="Quadro Persistido"
        telemetryContext={mockTelemetry}
      />
    );

    expect(screen.getByText('Mensagem salva no storage')).toBeInTheDocument();
  });

  it('copia o conteúdo da resposta ao clicar no botão Copiar', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    appendChatMessage('board-test-persisted', {
      id: 'pre-2',
      role: 'assistant',
      content: 'Resposta para copiar',
      timestamp: new Date().toISOString(),
      provider: 'heuristic',
    });

    render(
      <MikaChatInterface
        boardId="board-test-persisted"
        boardTitle="Quadro Persistido"
        telemetryContext={mockTelemetry}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copiar resposta para a área de transferência/i });
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith('Resposta para copiar');

    await waitFor(() => {
      expect(screen.getByText('✓ Copiado!')).toBeInTheDocument();
    });
  });

  it('solicita confirmação e apaga o histórico ao confirmar limpeza', async () => {
    appendChatMessage('board-test-persisted', {
      id: 'pre-3',
      role: 'user',
      content: 'Texto a ser deletado',
      timestamp: new Date().toISOString(),
      provider: 'heuristic',
    });

    render(
      <MikaChatInterface
        boardId="board-test-persisted"
        boardTitle="Quadro Persistido"
        telemetryContext={mockTelemetry}
      />
    );

    expect(screen.getByText('Texto a ser deletado')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Limpar histórico da conversa/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('Apagar tudo?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Sim' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText('Texto a ser deletado')).not.toBeInTheDocument();
    });

    const session = loadChatSession('board-test-persisted');
    expect(session.messages).toEqual([]);
  });
});

describe('MikaChatInterface - US4 (Resiliência Offline e Fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockTelemetry: MikaBoardTelemetryContext = {
    boardId: 'board-test-offline',
    boardTitle: 'Quadro Offline',
    columns: [],
    blockedTasks: [],
    cycleTimeP85Days: 3,
    throughputLast14Days: 10,
    totalActiveTasks: 0,
    totalCompletedTasks: 0,
    generatedAt: new Date().toISOString(),
  };

  it('exibe indicador visual de Local-First (Offline) quando sem chave de API', () => {
    render(
      <MikaChatInterface
        boardId="board-test-offline"
        boardTitle="Quadro Offline"
        telemetryContext={mockTelemetry}
        apiKey=""
        providerName="Local-First (Offline)"
      />
    );

    expect(screen.getByText('Local-First (Offline)')).toBeInTheDocument();
  });

  it('executa fallback gracioso para o motor heurístico local se a chamada Gemini falhar', async () => {
    const fakeFetch = vi.fn().mockRejectedValue(new Error('Network error / offline'));
    vi.stubGlobal('fetch', fakeFetch);

    render(
      <MikaChatInterface
        boardId="board-test-offline"
        boardTitle="Quadro Offline"
        telemetryContext={mockTelemetry}
        apiKey="test-key-with-network-error"
        providerName="Google Gemini"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i });
    fireEvent.change(textarea, { target: { value: 'Qual é o nosso SLE?' } });

    const sendBtn = screen.getByRole('button', { name: /Enviar pergunta para Mika/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Resposta gerada via Local-First por indisponibilidade momentânea da rede/i)
      ).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });
});

