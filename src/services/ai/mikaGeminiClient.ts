/**
 * Cliente HTTP nativo para Google Gemini API (Feature 048)
 * Utiliza fetch nativo do navegador sem nenhuma dependência npm (Constituição V - YAGNI).
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-007, FR-010)
 */

import { TaskModel } from '../../types/kanban';
import { MikaDecomposition, MikaInsight } from '../../types/mika';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class MikaGeminiClient {
  /**
   * Envia o prompt de contexto analítico para o Gemini e retorna os insights estruturados.
   */
  public async generateInsights(apiKey: string, contextPrompt: string): Promise<MikaInsight[]> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Chave de API do Gemini não fornecida');
    }

    const systemInstruction = `Você é a Mika, copiloto especialista em métricas de fluxo ágil (Kanban, Flow Metrics, Monte Carlo, Cycle Time, Lei de Little) do aplicativo Metrik.
Seu idioma nativo é Português do Brasil (pt-BR). Seu tom é consultivo, técnico, objetivo, encorajador e focado em previsibilidade de entrega.
Responda EXCLUSIVAMENTE em formato JSON contendo um array de objetos MikaInsight com as propriedades:
- id: string
- title: string
- summary: string
- recommendation: string opcional
- severity: "info" | "warning" | "critical"
- category: "cycle-time" | "wip-bottleneck" | "monte-carlo" | "sle-risk" | "throughput"
- metricValue: string opcional`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nContexto das métricas do quadro atual:\n${contextPrompt}\n\nGere diagnósticos prioritários em JSON puro.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Falha na chamada Gemini API (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawText);
      const list = Array.isArray(parsed) ? parsed : parsed.insights || [];
      const timestamp = new Date().toISOString();

      return list.map((item: Partial<MikaInsight>, idx: number) => ({
        id: item.id || `gemini-insight-${Date.now()}-${idx}`,
        title: item.title || 'Diagnóstico de Fluxo',
        summary: item.summary || '',
        recommendation: item.recommendation,
        severity: item.severity || 'info',
        category: item.category || 'throughput',
        metricValue: item.metricValue,
        timestamp: item.timestamp || timestamp,
      }));
    } catch (err) {
      throw new Error(`Erro ao interpretar JSON retornado pelo Gemini: ${String(err)}`);
    }
  }

  /**
   * Solicita ao Gemini a decomposição refinada de uma tarefa em subtarefas e critérios de aceite.
   */
  public async decomposeTask(apiKey: string, task: TaskModel): Promise<MikaDecomposition> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Chave de API do Gemini não fornecida');
    }

    const systemInstruction = `Você é a Mika, copiloto do Metrik. Refine a tarefa a seguir em subtarefas atômicas técnicas claras (3 a 6 itens) e critérios de aceite no formato BDD (Dado / Quando / Então).
Responda EXCLUSIVAMENTE em formato JSON com a estrutura:
{
  "suggestedSubtasks": [ { "id": string, "title": string, "completed": false } ],
  "suggestedAcceptanceCriteria": [ string ],
  "explanation": string
}`;

    const prompt = `${systemInstruction}\n\nTarefa:\nTítulo: ${task.title}\nDescrição: ${task.description || 'Sem descrição'}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Falha na chamada Gemini API (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Resposta vazia da Gemini API');
    }

    const parsed = JSON.parse(rawText);
    const timestamp = new Date().toISOString();

    return {
      taskId: task.id,
      suggestedSubtasks: (parsed.suggestedSubtasks || []).map(
        (st: { id?: string; title?: string; text?: string }, idx: number) => ({
          id: st.id || `sub-gemini-${Date.now()}-${idx}`,
          title: st.title || st.text || `Subtarefa ${idx + 1}`,
          text: st.text || st.title || `Subtarefa ${idx + 1}`,
          completed: false,
        }),
      ),
      suggestedAcceptanceCriteria: parsed.suggestedAcceptanceCriteria || [],
      explanation: parsed.explanation || 'Refinamento gerado com sucesso via Mika Gemini.',
      timestamp,
    };
  }
}

export const mikaGeminiClient = new MikaGeminiClient();
