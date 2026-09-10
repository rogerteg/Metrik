# Tasks: Feature 015 — Governança Visual, Fluxo Unidirecional, Estagnação e CFD Dinâmico

## Pre-Task Analytical Models (Constitution VI)

### 1. Desconstrução por Primeiros Princípios (First-Principles)
- **Imutabilidade da Entrada:** Em um sistema kanban, a primeira coluna representa o ponto de comprometimento ou chegada de novos itens (`To Do`). Alterar sua posição rompe a premissa de que o fluxo nasce na extrema esquerda. Mantê-la fixa (`index === 0`) preserva o modelo mental de entrada do sistema.
- **Fluxo Unidirecional e Integridade Temporal:** O tempo de ciclo e o lead time são grandezas vetoriais que avançam monotonicamente para a direita. Permitir que itens regressem mascara gargalos reais, cria ciclos espúrios de tempo e corrompe a amostragem estatística do throughput. Portanto, a regra de não permitir retrocesso com aviso "Cuidado!" protege a integridade do processo.
- **Herança de Cores e Sincronia CFD:** Uma coluna é uma etapa do processo. Se a etapa possui uma identidade de cor no quadro, essa mesma cor deve ser transmitida deterministicamente tanto para os cartões situados nela quanto para a área/onda representativa daquela etapa no CFD.

### 2. Análise Premortem & Modos de Falha
- **Modo de Falha 1:** Tentativa de reordenar a primeira coluna dispara exceção ou deixa a UI inconsistente.
  - *Mitigação:* O botão de mover à esquerda da primeira coluna permanece desabilitado, e a função `reorderColumns` rejeita silenciosamente qualquer tentativa onde `fromIndex === 0` ou `toIndex === 0`.
- **Modo de Falha 2:** Usuário tenta arrastar card para trás e o estado sofre mutação antes da validação.
  - *Mitigação:* A validação de sentido único ocorre na raiz do manipulador `moveTask` / `reorderOrMoveTask`. Se `targetIndex < sourceIndex`, a função emite o alerta `"Cuidado!"` e retorna o estado anterior intacto sem alteração de coluna.
- **Modo de Falha 3:** Dessincronização entre a cor escolhida na coluna e a onda no CFD devido a cores hardcoded legadas.
  - *Mitigação:* Função unificada `getDefaultColumnColor(col)` utilizada tanto em `Column.tsx`, `Task.tsx` quanto em `CumulativeFlowChart.tsx`.

### 3. Categorização MECE
- **Reordenação de Colunas:**
  - Primeira coluna (`index === 0`): Imutável.
  - Demais colunas (`index > 0`): Movimentação livre entre si.
- **Movimentação de Tarefas:**
  - `targetColIndex === sourceColIndex`: Reordenação vertical (permitida).
  - `targetColIndex > sourceColIndex`: Avanço de fluxo (permitido, atualiza timestamps quando aplicável).
  - `targetColIndex < sourceColIndex`: Movimento retrógrado (bloqueado, emite alerta "Cuidado!").
- **Estagnação de Tarefas:**
  - Tarefa em coluna concluída (`done`): Não é considerada estagnada.
  - Tarefa não concluída sem movimento por > 24h: Estilização marrom e badge de estagnação ativos.

### 4. Árvore de Decisão & Poda de Alternativas
- **Trade-off de Cores no CFD:**
  - *Alternativa A (Cores estáticas fixas por categoria):* Descartada por não refletir as personalizações do usuário no quadro.
  - *Alternativa B (Cores dinâmicas espelhando as colunas):* Adotada, garantindo coerência visual absoluta entre o quadro Kanban e os gráficos.

### 5. Falsifiabilidade & TDD
- Testes automatizados cobrindo:
  - Imutabilidade da coluna 0 na reordenação.
  - Bloqueio de arraste de card da direita para a esquerda mantendo o card na coluna original.
  - Renderização do card marrom para tarefas paradas.
  - Sincronização da cor da coluna com as ondas e legenda do CFD.

### 6. Conformidade Constitucional
- Zero bibliotecas externas de gráficos ou utilitários.
- 100% dos testes da suíte passando e build limpo.

---

## Tasks

### Phase 1: Reordenação e Bloqueio de Sentido Único
- [x] T001 Implementar trava fixa para a primeira coluna (`To Do`) em `useTaskCollection.ts` e botões de reordenação em `Column.tsx`.
- [x] T002 Implementar bloqueio estrito de movimentação para trás (da direita para a esquerda) com alerta "Cuidado!" mantendo o card na coluna vigente.

### Phase 2: Personalização de Cores e Estagnação de Cards
- [x] T003 Adicionar seletor de paleta de cor no cabeçalho da coluna e aplicar cor da coluna nos cards.
- [x] T004 Implementar campos `startedAt` e `completedAt` no `TaskDetailsModal.tsx` e tipo `TaskModel`.
- [x] T005 Implementar regra de tarefa estagnada (`isTaskStagnant`) com classe `.card-stagnant` (marrom) e badge de alerta.

### Phase 3: Analytics Clean e CFD Dinâmico
- [x] T006 Implementar modal de expansão individual para gráficos em `AnalyticsDashboard.tsx`.
- [x] T007 Suavizar visual dos gráficos de Throughput e Lead Time em `Analytics.css` com paleta clean.
- [x] T008 Atualizar `CumulativeFlowChart.tsx` para cobrir todas as etapas do quadro e sincronizar as cores das ondas e legendas com `getDefaultColumnColor(col)`.

### Phase 4: Identidade Visual e Verificação
- [x] T009 Integrar logotipo oficial do Metrik no cabeçalho e favicon.
- [x] T010 Executar suíte completa de testes (`npm test`) e validação de build (`npm run build`).
