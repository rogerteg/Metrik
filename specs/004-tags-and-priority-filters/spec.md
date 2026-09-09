# Feature Specification: Etiquetas (Tags), Níveis de Prioridade e Barra de Filtragem

**Feature Branch**: `004-tags-and-priority-filters`  
**Created**: 2026-09-09  
**Status**: Draft  
**Input**: User description: "Sistema de etiquetas (tags coloridas), prioridades (Alta, Média, Baixa) com indicadores visuais, e barra de busca e filtragem dinâmica"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Atribuição e Visualização de Níveis de Prioridade (Priority: P1)

Como um membro da equipe organizando tarefas no quadro Kanban,  
Eu quero atribuir um nível de prioridade claro (`Urgente`, `Alta`, `Média`, `Baixa`) a cada cartão de tarefa,  
Para que qualquer pessoa do time consiga identificar visualmente e em fração de segundos quais itens demandam atenção imediata.

**Why this priority**: A gestão visual de prioridades é essencial no Kanban para combater sobrecargas e focar na conclusão dos itens mais críticos primeiro.

**Independent Test**: Criar ou editar um cartão, selecionar prioridade "Alta", e verificar se o badge e a cor de destaque são renderizados no cartão e persistidos no `localStorage`.

**Acceptance Scenarios**:
1. **Given** um cartão de tarefa aberto ou existente no quadro,  
   **When** o usuário seleciona um nível de prioridade (ex: `Alta` ou `Urgente`),  
   **Then** o cartão exibe um badge visual estilizado com a cor correspondente e borda indicadora sutil.
2. **Given** um cartão com prioridade definida,  
   **When** o usuário altera a prioridade para `Baixa` ou remove a prioridade,  
   **Then** o badge do cartão atualiza imediatamente e a mudança é persistida.
3. **Given** tarefas criadas antes da Feature 004 (retrocompatibilidade),  
   **When** são carregadas do `localStorage`,  
   **Then** assumem prioridade padrão `Média` (ou `null`/neutra) sem causar erros ou quebras na interface.

---

### User Story 2 - Etiquetas Customizadas (Tags Coloridas) por Cartão (Priority: P1)

Como um usuário categorizando diferentes tipos de demandas,  
Eu quero adicionar e remover etiquetas coloridas (ex: `Bug`, `Frontend`, `API`, `Design`) nos cartões,  
Para classificar o trabalho por área técnica, tipo de item ou iniciativa estratégica.

**Why this priority**: Permite categorização multidimensional flexível, permitindo que a equipe diferencie facilmente bugs de novas funcionalidades ou débitos técnicos.

**Independent Test**: Digitar uma nova tag "Bug" em um cartão, pressionar Enter, e verificar que a tag é adicionada como um chip colorido no cartão com botão para remoção rápida.

**Acceptance Scenarios**:
1. **Given** um cartão de tarefa,  
   **When** o usuário digita o nome de uma tag e confirma (Enter ou botão adicionar),  
   **Then** a tag é adicionada ao cartão com uma cor harmoniosa derivada automaticamente ou selecionada da paleta do design system.
2. **Given** um cartão contendo tags,  
   **When** o usuário clica no botão `×` de uma tag específica,  
   **Then** a tag é removida exclusivamente daquele cartão.
3. **Given** tentativa de adicionar tag vazia ou duplicada no mesmo cartão,  
   **When** o usuário submete a tag,  
   **Then** o sistema ignora a inserção silenciosamente sem poluir os dados.

---

### User Story 3 - Barra de Busca Instantânea e Filtros Rápidos (Priority: P1)

Como um usuário navegando por um quadro com dezenas de cartões,  
Eu quero buscar tarefas pelo texto do título e filtrar por prioridade ou tag através de uma barra de controle dedicada,  
Para isolar rapidamente apenas os cartões relevantes para minha atividade no momento.

**Why this priority**: É o recurso que transforma a categorização em produtividade real, permitindo visões focadas em menos de 100ms.

**Independent Test**: Digitar um termo na barra de busca e verificar que apenas os cartões que contêm o termo no título permanecem visíveis, com contador de resultados ("Exibindo X de Y tarefas").

**Acceptance Scenarios**:
1. **Given** o quadro Kanban exibindo várias tarefas,  
   **When** o usuário digita um termo na caixa de busca (ex: "API"),  
   **Then** apenas os cartões cujo título contenha o termo (case-insensitive) permanecem visíveis em suas respectivas colunas.
2. **Given** a barra de filtros,  
   **When** o usuário clica no filtro de prioridade `Alta`,  
   **Then** somente tarefas com prioridade `Alta` são exibidas nas colunas.
3. **Given** filtros ou busca ativos,  
   **When** o usuário clica no botão "Limpar Filtros",  
   **Then** todos os critérios são resetados e o quadro volta a exibir todas as tarefas.
4. **Given** uma coluna onde todos os cartões foram ocultados pelos filtros ativos,  
   **When** visualizada pelo usuário,  
   **Then** a coluna exibe uma mensagem amigável: "Nenhuma tarefa corresponde aos filtros aplicados".

---

### User Story 4 - Preservação Estrita de DnD, Métricas de Fluxo e Limites de WIP (Priority: P2)

Como um usuário utilizando os recursos avançados de fluxo do Metrik,  
Eu quero que os filtros ativos não alterem os cálculos reais de Throughput, Lead Time, Cycle Time nem os limites de WIP,  
Para que a visibilidade estatística do quadro permaneça íntegra e sem distorções metodológicas.

**Why this priority**: Garante fidelidade aos princípios Lean/Kanban: filtros são lentes de visualização da UI, não deleções ou alterações do fluxo real.

**Independent Test**: Filtrar tarefas e verificar que o Throughput e o Lead Time Médio na `MetricsBar` continuam calculados sobre o total real de tarefas concluídas, e que o contador de WIP continua monitorando a carga real da coluna.

**Acceptance Scenarios**:
1. **Given** filtros ativos que ocultam tarefas em `Completed`,  
   **When** a `MetricsBar` é observada,  
   **Then** seus valores refletem o estado real de todas as tarefas da base, sem reduções causadas pela lente de filtro.
2. **Given** um cartão visível sob filtro ativo,  
   **When** o usuário o arrasta para outra coluna via Drag-and-Drop,  
   **Then** o movimento é executado e persistido normalmente.

---

## Edge Cases

1. **Filtros com 0 Resultados no Quadro Inteiro**:  
   Se nenhum cartão corresponder aos critérios combinados de busca, prioridade e tags, o quadro deve exibir um estado vazio global suave: "Nenhuma tarefa encontrada para os filtros selecionados", com botão de ação para limpar filtros.
2. **Tags com Caracteres Especiais ou Muito Longas**:  
   Tags devem ter limite de caracteres (máximo de 20 caracteres) e `text-overflow: ellipsis` para não quebrar o layout do cartão em resoluções menores.
3. **Busca com Espaços em Branco**:  
   Termos de busca com espaços nas extremidades devem ser sanitizados com `.trim()`.
4. **Combinação Conflitante de Filtros (Busca + Prioridade + Tags)**:  
   A lógica de filtragem deve ser cumulativa (AND lógico entre critérios diferentes): uma tarefa só é exibida se satisfizer simultaneamente o termo de busca, a prioridade selecionada e as tags ativas.

---

## Clarifications & Defaults

- [CLARIFICATION 1]: **Níveis de Prioridade**:  
  *Decisão*: Quatro níveis fixos com tokens visuais padronizados:
  - `urgent` (Urgente / Vermelho Carmesim `#f43f5e`)
  - `high` (Alta / Laranja Âmbar `#f97316`)
  - `medium` (Média / Amarelo Dourado `#eab308`)
  - `low` (Baixa / Azul Ardósia `#38bdf8`)
  - `none` / `undefined` (Sem prioridade definida / neutro)
- [CLARIFICATION 2]: **Estrutura de Armazenamento das Tags e Prioridades**:  
  *Decisão*: Estender o `TaskModel` existente em `src/types/kanban.ts` com propriedades opcionais:
  `priority?: PriorityLevel` e `tags?: string[]`.
  Isto garante 100% de compatibilidade retroativa com tarefas já salvas no `localStorage`.
- [CLARIFICATION 3]: **Paleta de Cores das Tags**:  
  *Decisão*: As cores das tags serão atribuídas deterministicamente a partir de um hash do nome da tag mapeado para uma paleta temática elegante do Metrik (`blue`, `emerald`, `amber`, `purple`, `rose`, `cyan`), evitando que o usuário precise gerenciar paletas complexas manualmente.

---

## Functional Requirements

- **FR-001**: O sistema DEVE suportar 4 níveis de prioridade (`urgent`, `high`, `medium`, `low`) no modelo de tarefa.
- **FR-002**: O sistema DEVE exibir um badge de prioridade clicável no cabeçalho ou rodapé do cartão, permitindo alternar ou selecionar a prioridade rapidamente.
- **FR-003**: O sistema DEVE suportar um array de strings `tags?: string[]` em cada tarefa.
- **FR-004**: O sistema DEVE permitir a adição de tags via input inline discreto no cartão, aceitando submissão ao pressionar Enter ou vírgula.
- **FR-005**: O sistema DEVE permitir a remoção de cada tag individualmente através de um botão `×` no chip da tag.
- **FR-006**: O sistema DEVE fornecer uma barra de filtros (`FilterBar`) posicionada entre a `MetricsBar` e o quadro Kanban.
- **FR-007**: A `FilterBar` DEVE conter:
  - Campo de busca textual rápida (filtra pelo título do cartão).
  - Seletor de prioridade (Todos, Urgente, Alta, Média, Baixa).
  - Pílulas selecionáveis para tags presentes nas tarefas ativas.
  - Botão "Limpar Filtros" visível apenas quando houver filtros ativos.
  - Indicador de contagem de tarefas visíveis vs total.
- **FR-008**: A filtragem DEVE ser reativa e instantânea (tempo de resposta inferior a 50ms), sem recarregar a página.
- **FR-009**: O sistema DEVE preservar todas as tarefas ocultas pelos filtros no `localStorage`, sem qualquer mutação destrutiva.
- **FR-010**: A `MetricsBar` e os contadores de limite de WIP das colunas DEVEM continuar computando o total real do quadro para manter a integridade dos dados de fluxo.
- **FR-011**: O sistema DEVE manter 100% de retrocompatibilidade com tarefas geradas nas Features 001, 002 e 003.

---

## Key Entities & Data Model

```typescript
// src/types/kanban.ts

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskModel {
  id: string;
  title: string;
  column: ColumnType;
  color?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  // Campos adicionados na Feature 004:
  priority?: PriorityLevel;
  tags?: string[];
}

export interface BoardFilterState {
  searchQuery: string;
  priorityFilter: PriorityLevel | 'all';
  selectedTags: string[];
}
```

---

## Success Criteria *(mandatory)*

- **SC-001**: O usuário consegue atribuir ou alterar a prioridade de um cartão em menos de 2 cliques.
- **SC-002**: A busca textual e filtragem por tag refletem na interface em menos de 50ms após a digitação.
- **SC-003**: 100% das tarefas existentes sem tags ou prioridades continuam funcionando perfeitamente sem erros.
- **SC-004**: O Drag-and-Drop e os botões direcionais continuam funcionando sem falhas sobre as tarefas filtradas.
- **SC-005**: 100% dos testes unitários novos e legados passam no Vitest (`npm test`).
