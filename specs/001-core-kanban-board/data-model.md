# Data Model: Core Kanban Board (MVP Fase 1)

## 1. Enumerações de Domínio

### `ColumnType`
Representa os 4 estados essenciais do fluxo Kanban no Metrik:
```typescript
export enum ColumnType {
  TO_DO = 'Todo',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
}
```

---

## 2. Entidades Principais

### `TaskModel`
Representa a unidade atômica de trabalho (o cartão Kanban):
```typescript
export interface TaskModel {
  /** Identificador único universal (UUID v4) */
  id: string;

  /** Conteúdo textual da tarefa (1 a 1000 caracteres) */
  title: string;

  /** Coluna / estado atual da tarefa */
  column: ColumnType;

  /** Cor temática ou identificador de estilo do cartão */
  color?: string;

  /** Timestamp ISO 8601 da criação */
  createdAt: string;

  /** Timestamp ISO 8601 da última atualização */
  updatedAt?: string;
}
```

### `ColumnModel`
Representa a coluna física e lógica no quadro:
```typescript
export interface ColumnModel {
  /** Tipo/identificador da coluna */
  type: ColumnType;

  /** Título legível de exibição */
  title: string;

  /** Identificador de cor / tema para badge e cabeçalho */
  colorScheme: 'gray' | 'blue' | 'red' | 'green';

  /** Lista ordenada de tarefas atribuídas a esta coluna */
  tasks: TaskModel[];
}
```

### `BoardState`
Estrutura serializada gravada no `localStorage` sob a chave `metrik_kanban_tasks`:
```typescript
export type BoardState = Record<ColumnType, TaskModel[]>;
```

---

## 3. Invariantes de Negócio & Regras de Validação

1. **Unicidade de Identificador**: Não podem existir duas tarefas com o mesmo `id` em todo o estado do quadro.
2. **Pertencimento Exclusivo**: Cada tarefa pertence a exatamente **uma** coluna por vez.
3. **Consistência de Coluna**: O atributo `task.column` DEVE ser idêntico à chave de coluna em que o cartão está alocado no `BoardState`.
4. **Resiliência a Títulos Vazios**: Uma tarefa recém-criada pode inicializar com título vazio (`""`), mas cartões não editados após perda de foco são mantidos com placeholder ou limpos conforme configuração.
5. **Destaque do Estado `Blocked`**: Tarefas na coluna `Blocked` recebem renderização com alerta visual diferenciado para indicar impedimento ativo.

---

## 4. Dados Iniciais de Demonstração (Seed Data)

Quando a aplicação é carregada pela primeira vez com `localStorage` vazio:
```json
{
  "Todo": [
    {
      "id": "e1a1-sample-01",
      "title": "Definir requisitos da próxima sprint",
      "column": "Todo",
      "color": "gray.200",
      "createdAt": "2026-09-08T12:00:00.000Z"
    }
  ],
  "In Progress": [
    {
      "id": "e1a1-sample-02",
      "title": "Implementar persistência reativa no Metrik",
      "column": "In Progress",
      "color": "blue.200",
      "createdAt": "2026-09-08T12:00:00.000Z"
    }
  ],
  "Blocked": [
    {
      "id": "e1a1-sample-03",
      "title": "Aguardando aprovação de design do cabeçalho",
      "column": "Blocked",
      "color": "red.200",
      "createdAt": "2026-09-08T12:00:00.000Z"
    }
  ],
  "Completed": [
    {
      "id": "e1a1-sample-04",
      "title": "Configuração inicial do SpecKit e Constituição",
      "column": "Completed",
      "color": "green.200",
      "createdAt": "2026-09-08T12:00:00.000Z"
    }
  ]
}
```
