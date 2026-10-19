# Data Model: Mika — AI Flow Copilot (Ciclo 5)

**Feature**: `048-mika-ai-flow-copilot`  
**Spec Reference**: [spec.md](./spec.md)  
**Status**: Completed

---

## 1. Entidades Principais

### `MikaInsight`
Representa uma conclusão analítica ou alerta emitido pela Mika sobre o fluxo de trabalho.

```typescript
export type MikaInsightSeverity = 'info' | 'warning' | 'critical';
export type MikaInsightCategory = 'cycle-time' | 'wip-bottleneck' | 'monte-carlo' | 'sle-risk' | 'throughput';

export interface MikaInsight {
  id: string;                      // Identificador único (ex: "insight-monte-carlo-123")
  title: string;                   // Título sintetizado (ex: "Previsibilidade de Entrega: 85% até 24/10")
  summary: string;                 // Diagnóstico em linguagem natural (pt-BR)
  recommendation?: string;         // Ação consultiva recomendada (ex: "Reduzir o limite de WIP na coluna Testes")
  severity: MikaInsightSeverity;   // Nível de criticidade visual (azul, âmbar, vermelho)
  category: MikaInsightCategory;   // Domínio da métrica analisada
  metricValue?: number | string;   // Valor quantitativo de suporte (ex: "4.2 dias", "85%")
  timestamp: string;               // ISO 8601 da geração do insight
  affectedTaskIds?: string[];      // IDs de tarefas relacionadas (ex: tarefas em risco de SLE)
  affectedColumnId?: string;       // ID da coluna afetada pelo gargalo (se aplicável)
}
```

---

### `MikaDecomposition`
Representa a sugestão de decomposição de uma tarefa em subtarefas e critérios de aceite.

```typescript
export interface MikaSubtaskSuggestion {
  id: string;                      // ID temporário para seleção na interface
  text: string;                    // Texto acionável da subtarefa
  completed: boolean;              // Inicialmente false
}

export interface MikaDecomposition {
  taskId: string;                  // ID da tarefa de origem
  suggestedSubtasks: MikaSubtaskSuggestion[]; // Subtarefas sugeridas para o checklist
  suggestedAcceptanceCriteria?: string[];     // Critérios no formato Dado/Quando/Então
  explanation?: string;            // Breve justificativa da quebra de escopo
  timestamp: string;               // ISO 8601
}
```

---

### `MikaPreferences`
Configurações do copiloto persistidas localmente no navegador.

```typescript
export type MikaProvider = 'gemini' | 'heuristic-offline';

export interface MikaPreferences {
  enabled: boolean;                // Se a Mika está ativa na interface
  provider: MikaProvider;          // Provedor ativo ('gemini' ou 'heuristic-offline')
  apiKeyObfuscated?: string;       // Chave do Gemini ofuscada (se configurada)
  autoDiagnoseOnLoad: boolean;     // Se deve gerar insights automaticamente ao abrir dashboards
  tone: 'consultative' | 'direct'; // Tom de comunicação da Mika
}
```

---

### `MikaCacheEntry`
Armazenamento local para evitar recálculos redundantes e economia de chamadas.

```typescript
export interface MikaCacheEntry {
  cacheKey: string;                // Hash composto por boardId + tasksChecksum
  insights: MikaInsight[];         // Lista de insights cacheados
  generatedAt: number;             // Timestamp epoch em milissegundos
}
```

---

## 2. Invariantes de Dados & Regras de Validação

1. **Invariante de Isolamento de Chaves:** A chave `apiKeyObfuscated` NUNCA é enviada para servidores terceiros além do endpoint oficial `generativelanguage.googleapis.com`.
2. **Invariante de Checklist:** Subtarefas aceitas pela Mika devem respeitar estritamente a interface `TaskItem.checklist` existente (`{ id: string, text: string, completed: boolean }`).
3. **Invariante de Fallback:** Se `provider === 'gemini'` falhar por qualquer razão (HTTP 4xx/5xx, timeout, falta de internet), a resposta gerada deve ser preenchida de forma transparente pelo `MikaHeuristicEngine`.
