# Feature 012: Gestão de Bloqueios & Impedimentos (Blocked Tasks)

## 1. Context & Rationale
No método Kanban e na teoria das filas (Little's Law), o tempo em que uma tarefa permanece impedida (*Blocked Time*) é o principal vilão do *Lead Time* e da previsibilidade de entrega. Diferente de um item aguardando naturalmente em uma coluna, um item **bloqueado** possui um impedimento externo ativo (ex.: dependência técnica, pendência de aprovação, bloqueio de infraestrutura).

Esta feature introduz o suporte de primeira classe à sinalização de bloqueios, registro do motivo do impedimento, medição do tempo acumulado de bloqueio e indicação visual destacada nos cartões e no modal de detalhes.

## 2. Business Value
- **Visibilidade Imediata de Gargalos:** Cartões bloqueados ganham destaque visual imediato (badge vermelho e borda de alerta), alertando o time nas reuniões diárias (*Daily/Standup*).
- **Rastreabilidade de Impedimentos:** Permite registrar o motivo textual do bloqueio para análise posterior de causas-raiz em retrospectivas.
- **Métrica de Tempo Bloqueado:** Mede o tempo exato em que a tarefa permaneceu paralisada, permitindo futuramente calcular a Eficiência de Fluxo (*Flow Efficiency* = Tempo Ativo / Lead Time Total).

## 3. Scope & Requirements

### 3.1. In Scope
- **Atualização do Modelo de Dados (`src/types/kanban.ts`):**
  - Adicionar a `TaskModel`:
    - `blocked?: boolean`: Flag indicando se a tarefa está atualmente impedida.
    - `blockedReason?: string`: Descrição do motivo do impedimento.
    - `blockedAt?: string`: Timestamp ISO do início do bloqueio atual.
    - `totalBlockedMs?: number`: Tempo total acumulado de bloqueio em milissegundos.
- **Lógica de Transição de Bloqueio (`useTaskCollection.ts`):**
  - Adicionar método `toggleTaskBlocked(taskId: string, reason?: string)`.
  - Ao bloquear: define `blocked = true`, `blockedReason = reason`, `blockedAt = new Date().toISOString()`.
  - Ao desbloquear: define `blocked = false`, acumula o intervalo decorrido em `totalBlockedMs = (totalBlockedMs || 0) + (agora - blockedAt)`, e limpa `blockedAt`.
- **Interface nos Cartões (`src/components/Task.tsx`):**
  - Renderizar badge de alerta `⛔ Bloqueado` com o motivo em tooltip/title.
  - Aplicar classe CSS `.task-card-blocked` com borda e destaque de atenção no cartão.
- **Interface no Modal de Detalhes (`src/components/TaskDetailsModal.tsx`):**
  - Seção dedicada de "Impedimento / Bloqueio":
    - Botão/Toggle para alternar entre "Marcar como Bloqueado" e "Desbloquear".
    - Campo de texto para preencher ou editar o motivo do impedimento.
    - Exibição formatada do tempo total bloqueado (ex.: "2h 15m").
- **Métrica no Cabeçalho / Métricas (`MetricsBar.tsx` ou indicador):**
  - Exibir indicador de tarefas bloqueadas no quadro caso haja pelo menos uma tarefa bloqueada.
- **Testes Automatizados:**
  - Testes unitários para a transição de bloqueio e cálculo de duração acumulada em `taskTransitions.test.ts` e `useTaskCollection.test.ts`.
  - Testes de renderização visual em `Task.test.tsx` e `TaskDetailsModal.test.tsx`.

### 3.2. Out of Scope
- Notificações por e-mail ou webhook de tarefas bloqueadas.
- Gráfico histórico de motivos de bloqueio (escopo futuro para módulo de relatórios avançados).

## 4. User Stories
- **US1:** Como membro do time, quero marcar uma tarefa como bloqueada informando o motivo para que meus colegas saibam imediatamente que há um impedimento.
- **US2:** Como agilista/líder técnico, quero visualizar rapidamente no quadro quais tarefas estão bloqueadas e há quanto tempo.
- **US3:** Como membro do time, quero desbloquear a tarefa quando o problema for resolvido, para que o tempo de bloqueio seja congelado e o trabalho continue.

## 5. Critérios de Aceitação
1. A tarefa bloqueada exibe indicador visual inconfundível no cartão sem quebrar a acessibilidade ou o layout.
2. O tempo em que a tarefa permanece bloqueada é computado precisamente mesmo após múltiplos ciclos de bloqueio e desbloqueio.
3. Desbloquear a tarefa preserva o histórico de `totalBlockedMs` e permite que a tarefa continue transitando normalmente no fluxo.
4. Suíte de testes automatizados com 100% de aprovação e build de produção sem erros de tipagem.
