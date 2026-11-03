# Research: Automações de Fluxo & Políticas de Cartão (Flow Rules)

**Feature**: `053-flow-automation-policies`
**Date**: 2026-11-02
**Status**: Concluído

---

## 1. Arquitetura do Motor de Regras (Rule Engine)

### Contexto & Decisão
Precisamos de um motor declarativo, reativo e seguro para avaliar gatilhos, condições e disparar ações sobre os cartões do Kanban sem acoplamento rígido à interface ou a serviços externos.

- **Decisão**: Implementar o motor de regras como um conjunto de funções puras no módulo `src/utils/flowRulesEngine.ts`.
  - O motor recebe `(rules: FlowRule[], event: FlowRuleEvent, task: TaskModel, boardContext: FlowBoardContext)` e retorna um plano de execução determinístico `FlowRuleExecutionPlan`.
  - O plano contém a lista de mutações a serem aplicadas no cartão (`updates: Partial<TaskModel>`), novos registros de auditoria (`auditLogs: TaskActivityLog[]`), e efeitos visuais colaterais (mensagens de toast, badges visuais).
- **Racional**:
  - Funções puras garantem testabilidade unitária de 100% sem necessidade de renderizar componentes React ou simular DOM.
  - Separação estrita entre "decisão de automação" (puro) e "aplicação de mutação" (hook/state) respeita a Constituição (Princípio III - Clean Architecture).
- **Alternativas Rejeitadas**:
  - *Máquinas de estado pesadas (XState)*: Descartado por adicionar dependência externa pesada e complexidade excessiva para regras declarativas if/then.
  - *Streams reativos (RxJS)*: Descartado por violar simplicidade (YAGNI) e princípios de zero dependências desnecessárias.

---

## 2. Pontos de Interceptação de Gatilhos (Triggers)

### Contexto & Decisão
As automações devem reagir a 2 tipos de estímulos: eventos imediatos de interação do usuário (movimentação, bloqueio, criação) e eventos temporais de fluxo (aging de permanência na coluna, proximidade de data de entrega).

- **Decisão**:
  1. **Eventos Interativos Imediatos**:
     - Interceptados no hook `useGuardedTaskMove` (para `card_moved`) e nas mutações correspondentes de `useTaskCollection` (`updateTask`, `toggleTaskBlocked`).
     - A avaliação ocorre sincronicamente antes ou imediatamente após o commit do estado, gerando as mutações complementares em um único lote ou transição atômica.
  2. **Eventos Temporais (Aging & Prazos)**:
     - Implementados via hook dedicado `useFlowRulesTimer(boardId, rules, tasks, columns, onApplyRule)`.
     - Executa uma verificação leve a cada 60 segundos (utilizando `setInterval` com limpeza no unmount) ou quando a janela do navegador recupera o foco (`visibilitychange`).
     - Evita execuções duplicadas armazenando o timestamp da última execução (`lastEvaluatedAt` / `card.lastAutomationRun`) ou verificando se a ação já está aplicada (ex: tag já presente).
- **Racional**:
  - Não degrada a performance do drag-and-drop (< 5ms de overhead).
  - Garante que itens abandonados em colunas de progresso sejam sinalizados mesmo sem intervenção manual contínua.
- **Alternativas Rejeitadas**:
  - *Web Workers para polling de tempo*: Descartado porque a checagem de 10 a 50 cartões consome menos de 0.2ms em JavaScript comum; a sobrecarga de serialização do Worker seria superior.

---

## 3. Prevenção de Loops Infinitos & Recursão em Cascata

### Contexto & Decisão
Se a Regra 1 adicionar a tag `revisar`, e a Regra 2 escutar por tags adicionadas e alterar a coluna, que por sua vez re-dispara a Regra 1, teríamos um travamento da aba do usuário.

- **Decisão**:
  - Adotar a política de **Profundidade Única (Depth = 1 / Single-Pass Execution)**.
  - Toda mutação derivada de uma automação carrega a flag interna `isAutomated: true` no contexto de execução.
  - O motor de regras ignora sumariamente eventos disparados com `isAutomated: true`, impedindo qualquer cascata secundária.
- **Racional**:
  - Elimina completamente o risco de loops infinitos em tempo de execução.
  - Mantém o raciocínio mental do usuário simples e previsível ("uma ação acontece como consequência direta de um evento inicial").
- **Alternativas Rejeitadas**:
  - *Detecção de ciclos em grafo*: Descartado por ser propenso a falsos positivos em regras dinâmicas e introduzir complexidade matemática desnecessária no navegador.

---

## 4. Políticas Explícitas de Colunas (Definition of Ready / Done)

### Contexto & Decisão
Colunas de Kanban precisam explicitar claramente suas políticas acordadas (requisitos para entrar e requisitos para sair da coluna) conforme as boas práticas do método Kanban.

- **Decisão**:
  - Criar o modelo `ColumnPolicy`:
    ```typescript
    interface ColumnPolicy {
      columnId: string;
      entryCriteria: string; // Definition of Ready
      exitCriteria: string;  // Definition of Done
      updatedAt: string;
    }
    ```
  - Persistir as políticas em `localStorage` sob a chave `metrik_column_policies_${boardId}`.
  - Integrar um botão discreto de política (`ColumnPolicyButton.tsx`) no cabeçalho de cada coluna em `Column.tsx`.
  - Ao clicar ou passar o mouse, abre um popover elegante (`ColumnPolicyPopover.tsx`) exibindo os critérios formatados. Usuários com permissão podem editar as políticas diretamente em um modal leve (`ColumnPolicyModal.tsx`).
- **Racional**:
  - Desacoplado da estrutura básica de `ColumnModel`, preservando compatibilidade retroativa com versões antigas do board.
  - Interface limpa e visível no ponto exato onde a decisão de movimentação é tomada.

---

## 5. Armazenamento Local-First & Portabilidade

### Contexto & Decisão
A Constituição (Princípio VIII) exige soberania Local-First: nada depende de servidores remotos, e os dados devem ser facilmente exportáveis e importáveis.

- **Decisão**:
  - Chaves de armazenamento:
    - `metrik_flow_rules_${boardId}`: Array de `FlowRule`.
    - `metrik_column_policies_${boardId}`: Dicionário `Record<string, ColumnPolicy>`.
  - Exportação/Importação:
    - O modal de regras (`FlowRulesModal.tsx`) terá botões para "Exportar Regras (JSON)" e "Importar Regras (JSON)".
    - O backup geral do Metrik (`useDataPortability`) incluirá as regras e políticas no JSON unificado do workspace.
- **Racional**:
  - 100% offline, persistência instantânea e fácil compartilhamento entre times e quadros.
