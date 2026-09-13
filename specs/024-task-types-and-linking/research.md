# Research & Technical Decisions: Tipos de Tarefas, Vinculação Hierárquica e Vínculos Cross-Squad

**Feature**: `024-task-types-and-linking` | **Date**: 2026-09-13 | **Branch**: `024-task-types-and-linking`

---

## 1. Contexto & Fundamentação Teórica de Gestão Hierárquica e Dependências

Nas metodologias ágeis e sistemas Kanban modernos, o trabalho não se resume a cartões uniformes e isolados. Existem múltiplos níveis de agregação e complexas teias de dependência entre squads:
1. **Níveis de Granularidade (Work Item Hierarchy)**:
   - **Iniciativas (Initiatives / Épicos)**: Objetivos de negócio de longo prazo ou grandes entregas que agrupam múltiplos cartões operacionais.
   - **Cards (Tarefas Padrão / Histórias de Usuário)**: Unidades regulares de trabalho que transitam pelas colunas do fluxo Kanban e alimentam as métricas estatísticas (Lead Time, Throughput, CFD).
   - **Subtarefas (Subtasks / Itens Granulares)**: Desdobramentos técnicos ou operacionais de um cartão.
2. **Topologia de Dependências (Task Linking)**:
   - **Relação Hierárquica (`parent` / `child`)**: Estabelece que uma tarefa faz parte de um escopo maior ou se desdobra em etapas filhas.
   - **Relação de Bloqueio (`blocks` / `is_blocked_by`)**: Estabelece ordem de precedência técnica.
   - **Relação de Associação (`relates_to`)**: Referência contextual sem restrição de precedência.
3. **Dependências Inter-Times (Cross-Squad Dependencies)**:
   - Em organizações multi-squad, entregas de front-end dependem de APIs de back-end, squads de produto dependem de squads de infraestrutura, etc.
   - O Metrik implementou isolamento estrito de quadros na Feature 023 (TBAC). A capacidade de anexar e monitorar tarefas de outras squads preenche a necessidade de visibilidade sem violar a soberania e a segurança de dados de cada equipe.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Modelagem e Identificação Visual de Tipos de Tarefas
- **Opções Avaliadas**:
  - *Opção A*: Usar apenas tags de texto livres (`tags: ['iniciativa', 'subtarefa']`).
  - *Opção B*: Adicionar campo tipado formal `type: 'card' | 'subtask' | 'initiative'` na interface `TaskModel`, com fallback automático para `'card'`.
- **Decisão**: **Opção B (`type: TaskType`)**.
- **Justificativa**: A tipagem em nível de schema permite renderização visual nativa, cálculos analíticos de progresso, validações de integridade e distinção semântica em relação a tags cosméticas.
- **Padrão Visual**:
  - `initiative`: Ícone 🎯, cor tema Púrpura/Índigo (`#8b5cf6`), badge elegante `🎯 Iniciativa`.
  - `card`: Ícone 📋, cor tema Azul Real (`#3b82f6`), badge `📋 Card`.
  - `subtask`: Ícone 🔹, cor tema Ciano/Esmeralda (`#06b6d4`), badge `🔹 Subtarefa`.
  - Compatibilidade garantida com os 3 temas visuais (`dark`, `light`, `neutral`).

### Decisão 2: Modelo Relacional de Vínculos (`TaskLinkModel`) e Consistência Bidirecional
- **Opções Avaliadas**:
  - *Opção A*: Array simples de IDs de tarefas filhas (`childrenIds?: string[]`).
  - *Opção B*: Estrutura normalizada de links com tipos semânticos de relação:
    ```typescript
    export interface TaskLinkModel {
      id: string;
      targetTaskId: string;
      relationType: TaskRelationType;
      targetBoardId: string;
      targetTeamId: string;
      createdAt: string;
    }
    ```
- **Decisão**: **Opção B (`TaskLinkModel`)**.
- **Justificativa**: Suporta múltiplos tipos de relação (`parent`, `child`, `blocks`, `is_blocked_by`, `relates_to`), registra a squad e o board de origem/destino, e viabiliza integridade relacional bidirecional instantânea ($O(1)$).
- **Consistência Recíproca**:
  - Quando a Tarefa A cria um link `blocks` para a Tarefa B, o sistema atualiza a Tarefa B com um link recíproco `is_blocked_by` apontando para A.
  - Ao remover o vínculo em uma extremidade, a extremidade recíproca é atualizada em sincronia.

### Decisão 3: Descoberta e Anexo de Tarefas Cross-Squad com Isolamento de Governança
- **Opções Avaliadas**:
  - *Opção A*: Restringir vínculos apenas a squads onde o usuário é membro.
  - *Opção B*: Permitir busca e vinculação a tarefas de **qualquer squad cadastrada no sistema**, exibindo apenas um resumo seguro da dependência (título, squad e status da coluna).
- **Decisão**: **Opção B (Busca Global Cross-Squad com Exposição Segura de Metadados)** *(Ratificada em `/speckit-clarify`)*.
- **Justificativa**: Em organizações reais, uma squad precisa sinalizar dependência de um serviço de outro time mesmo que seus desenvolvedores não sejam administradores daquele outro time. A leitura em modo seguro respeita o Princípio VIII da Constituição: nenhuma operação de mutação (excluir coluna, mover cartão alheio) é permitida no quadro externo a partir de um usuário sem privilégios.

### Decisão 4: Política de Movimentação para Concluído com Dependências Pendentes (Soft Block)
- **Opções Avaliadas**:
  - *Opção A*: Bloqueio rígido (Hard Block) — impede o arrasto ou seleção da coluna `done`.
  - *Opção B*: Alerta preventivo com diálogo de confirmação explícita (Soft Block) — exibe aviso claro sobre as tarefas bloqueadoras pendentes e solicita confirmação do operador para prosseguir.
  - *Opção C*: Apenas indicativo cosmético sem validação.
- **Decisão**: **Opção B (Soft Block com Confirmação Explícita)** *(Ratificada em `/speckit-clarify`)*.
- **Justificativa**: O Kanban valoriza transparência de fluxo e responsabilização da equipe (*empowerment*). Bloqueios rígidos podem engessar a operação em casos excepcionais (ex: dependência dispensada verbalmente pelo tech lead); o diálogo de confirmação garante que o operador esteja ciente da dependência sem criar bloqueios intransponíveis.

### Decisão 5: Cálculo Reativo de Progresso de Iniciativas
- **Fórmula de Progresso**:
  $$\text{Progresso}(\text{Iniciativa}) = \frac{\sum_{c \in \text{Filhos}} [c.\text{coluna} \in \text{done}]}{|\text{Filhos}|} \times 100\%$$
- Se $|\text{Filhos}| = 0$, a barra de progresso é omitida ou exibe 0% com indicação de que não há sub-itens vinculados.
- A barra de progresso visual é renderizada tanto no corpo do cartão `TaskCard` quanto no cabeçalho do `TaskDetailsModal`.

### Decisão 6: Coexistência de Subtarefas Granulares e Checklist Interno
- O Metrik já possui a propriedade `subtasks?: SubtaskModel[]` que funciona como checklist leve de afazeres dentro da tarefa.
- O novo tipo `subtask` no nível de `TaskModel` é uma entidade de fluxo completa: possui seu próprio cartão no quadro Kanban, transita entre colunas, possui tempo de ciclo e pode ter seus próprios responsáveis.
- Ambas as estruturas coexistem harmonicamente sem conflito de nomes ou tipos.

---

## 3. Matriz de Compatibilidade e Performance Local-First

| Operação | Complexidade Temporal | Impacto em `localStorage` | Mitigação de Concorrência |
| :--- | :--- | :--- | :--- |
| **Renderizar Card com Badge de Tipo** | $O(1)$ | Zero (apenas leitura do campo `type`) | Inline no componente `TaskCard` |
| **Adicionar Link Intra-Quadro** | $O(1)$ | Atualiza array `links` em 2 tarefas | Operação atômica no hook `useBoards` |
| **Adicionar Link Cross-Squad** | $O(B)$ onde $B$ é o total de quadros | Atualiza 1 tarefa local e 1 tarefa no quadro alvo | Sincronização via `updateBoard` |
| **Calcular Progresso de Iniciativa** | $O(K)$ onde $K$ é o número de filhos | Apenas em memória durante renderização | Memoização com `useMemo` |
| **Limpeza de Links na Exclusão** | $O(N)$ onde $N$ é o total de tarefas | Limpa referências órfãs | Varredura de integridade referencial |

---

## 4. Conclusão & Prontidão para Implementação
Todas as decisões arquiteturais estão em plena conformidade com a Constituição do Metrik (Simplicidade, TDD, Independência de Marca e Soberania Local-First). A especificação técnica está validada para detalhamento no `data-model.md` e `plan.md`.
