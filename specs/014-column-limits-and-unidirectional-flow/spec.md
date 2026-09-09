# Feature 014: Limite de Colunas com Alerta & Fluxo Unidirecional com Guarda de Métricas

## 1. Context & Rationale
O método Kanban apoia-se em dois pilares essenciais: a visibilidade do processo e o fluxo contínuo puxado. Contudo, em quadros com excesso de etapas (colunas), o sistema perde visibilidade, sobrecarrega o foco cognitivo da equipe e dilui os limites de Trabalho em Progresso (WIP). O limite recomendado de colunas em quadros ágeis eficientes não deve exceder a capacidade de visualização clara da esteira de valor.

Além disso, o princípio do fluxo lean e o cálculo de métricas de tempo de ciclo (*Cycle Time*) pressupõem a evolução contínua da esquerda para a direita (sentido único). Mover cartões para trás quebra a integridade temporal do fluxo, mascara gargalos e invalida medições acumuladas. Logo, quando um cartão é movido no sentido inverso, o sistema deve alertar firmemente a equipe sobre a perda de métricas e bloquear ou exigir confirmação consciente com descarte das métricas de fluxo do item.

## 2. Business Value
- **Clareza de Processo & Anti-Sobrecarga de Etapas:** Impede a proliferação desenfreada de colunas com teto de 12 colunas e alerta visível `"Excesso de colunas, cuidado."`.
- **Integridade Analítica de Fluxo:** Garante que tarefas avancem no sentido lean único (da esquerda para a direita), protegendo as métricas de tempo de ciclo contra distorções retrógradas.
- **Transparência com o Usuário:** Adverte claramente antes de qualquer movimento para trás com a mensagem `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."` e zera as métricas do cartão se confirmado.

## 3. Scope & Requirements

### 3.1. In Scope
- **Criação de Colunas & Teto Máximo:**
  - Adicionar botão interativo no quadro `+ Nova Coluna` que abre formulário/modal simples para título, categoria (`todo`, `in_progress`, `done`) e WIP Limit opcional.
  - Constante de limite: `MAX_COLUMNS = 12`.
  - Desabilitar adição se `columns.length >= MAX_COLUMNS`.
  - Banner/alerta visual em destaque quando `columns.length >= 12`: `"Excesso de colunas, cuidado."`.
- **Guarda de Fluxo Unidirecional (Sentido Único):**
  - Identificar a direção do movimento de cards via Drag & Drop ou API programática:
    - Se `sourceColumnIndex > targetColumnIndex`, o movimento é retrógrado (da direita para a esquerda).
  - Exibir modal ou diálogo de alerta/confirmação:
    `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."`
  - Se o usuário cancelar: a movimentação é bloqueada e o cartão permanece na coluna de origem.
  - Se o usuário confirmar: a tarefa é movida para a coluna anterior e suas métricas de fluxo (`startedAt`, `completedAt`, `totalBlockedMs`, `blocked`, `blockedAt`, `blockedReason`) são resetadas, cumprindo a regra de perda de métricas.
- **Suíte de Testes Automatizados:**
  - Testes unitários para validação de `addColumn` até 12 colunas e rejeição na 13ª.
  - Testes de renderização do alerta `"Excesso de colunas, cuidado."`.
  - Testes de detecção de movimento retrógrado em `reorderBoard` / `useTaskCollection`.
  - Testes de cancelamento (bloqueio) e confirmação (reset de métricas).

### 3.2. Out of Scope
- Workflow engine de transições personalizadas baseadas em regras de permissão de papéis de usuário.
- Histórico de reversão (Undo) para cartões cujas métricas foram intencionalmente resetadas.

## 4. User Stories
- **US1:** Como usuário do quadro, quero poder adicionar novas colunas até o teto de 12 colunas, para mapear as etapas do meu processo de trabalho.
- **US2:** Como líder de equipe, quando o quadro tiver 12 colunas, quero ver um aviso em destaque `"Excesso de colunas, cuidado."` para alertar o time sobre a complexidade excessiva da esteira.
- **US3:** Como membro do time, ao tentar arrastar um card para trás (da direita para a esquerda), quero receber o aviso `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."` para evitar mover cartões indevidamente e ter o movimento bloqueado caso eu cancele.

## 5. Critérios de Aceitação
1. O quadro não permite adicionar mais que 12 colunas sob nenhuma circunstância.
2. Quando houver 12 colunas no quadro ativo, uma mensagem de alerta visível `"Excesso de colunas, cuidado."` é renderizada na tela.
3. Arrastar ou mover uma tarefa para uma coluna localizada à esquerda da coluna atual dispara o alerta `"Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita."`.
4. Se a ação de mover para trás for cancelada, o card permanece intacto na coluna atual. Se confirmada, o card se move e todas as métricas acumuladas (`startedAt`, `completedAt`, `totalBlockedMs`, etc.) são limpas.
5. Todos os testes unitários passam com 100% de sucesso e o build `tsc && vite build` compila sem erros.
