# Feature Specification: Tipos de Tarefas (Cards, Subtarefas, Iniciativas), Vinculação Hierárquica e Vínculos Cross-Squad

**Feature Branch**: `024-task-types-and-linking`  
**Created**: 2026-09-12  
**Status**: Implemented & Verified (Converged)  
**GitHub Issues**: [#44](https://github.com/rogerteg/Metrik/issues/44), [#45](https://github.com/rogerteg/Metrik/issues/45), [#46](https://github.com/rogerteg/Metrik/issues/46), [#47](https://github.com/rogerteg/Metrik/issues/47), [#48](https://github.com/rogerteg/Metrik/issues/48), [#49](https://github.com/rogerteg/Metrik/issues/49), [#50](https://github.com/rogerteg/Metrik/issues/50)  
**Input**: Solicitação do usuário: *"Criar função tipos de tarefas, inserir nos cards. Tipos: Cards; subtarefas; iniciativas; vincular tarefas com outras tarefas, e permitir anexar tarefa de outro time, squad."*

---

## 1. Visão Geral & Contexto

O Metrik evoluiu com sucesso com suporte a múltiplos quadros (Feature 010) e controle de acesso por squad/time (Feature 023). No entanto, todas as tarefas no sistema atualmente são homogêneas, sem distinção de granularidade ou nível de abstração, e existem como entidades isoladas sem relacionamentos estruturados entre si ou entre diferentes equipes.

No gerenciamento moderno de fluxo de valor, o trabalho opera em múltiplos níveis hierárquicos e depende fortemente da colaboração e coordenação entre diferentes times:
1. **Iniciativas (Initiatives / Épicos)**: Entregas estratégicas de alto nível que agrupam múltiplos cartões e demandam acompanhamento de progresso agregado.
2. **Cards (Tarefas Padrão / Histórias)**: Unidades regulares de trabalho que percorrem as etapas de fluxo do quadro Kanban.
3. **Subtarefas (Subtasks / Itens Operacionais)**: Trabalhos granulares ou divisões operacionais de um cartão.
4. **Vinculação entre Tarefas (Task Linking)**: Relações explícitas de hierarquia (`pai/filho`), dependência (`bloqueia / é bloqueada por`) e associação (`relacionada a`).
5. **Vínculos Cross-Squad (Dependências Inter-Times)**: Capacidade de anexar e monitorar tarefas pertencentes a outras squads/quadros, permitindo rastrear dependências organizacionais sem violar o isolamento de governança estabelecido na Feature 023.

Esta especificação define o modelo de dados, as regras de negócio, a interface nos cartões e modais, e as validações de integridade referencial necessárias para suportar tipos de tarefas e vínculos intra e cross-squad com excelência visual e soberania Local-First.

### Decisões Clarificadas (/speckit-clarify)
1. **Alcance de Descoberta Cross-Squad**: O usuário pode pesquisar e vincular tarefas de **qualquer squad cadastrada no sistema**. A vinculação exibe um resumo seguro da dependência (título, squad e status da coluna), garantindo transparência máxima de fluxo entre equipes sem quebrar a privacidade de edição dos quadros externos.
2. **Reação a Dependências Pendentes (Soft Block)**: Caso uma tarefa possua vínculo `is_blocked_by` cuja tarefa bloqueadora ainda não esteja concluída, o cartão exibe badge de alerta de dependência pendente. Se o operador tentar arrastar ou mover o cartão para a coluna "Concluído" (`done`), o sistema aciona uma confirmação explícita (Soft Block) com aviso de bloqueio antes de efetivar a movimentação.
3. **Representação Visual nos Cartões**: O cabeçalho de cada `TaskCard` exibe um **badge dedicado com ícone e texto** (🎯 Iniciativa, 📋 Card, 🔹 Subtarefa) alinhado ao Metrik Design System. Na área inferior/metadados do cartão, é exibido um chip compacto com contador de links e identificação de squad externa vinculada (ex: `🏢 Squad Engenharia`).

---

## 2. User Scenarios & Casos de Teste *(mandatory)*

### User Story 1 - Tipos de Tarefas e Exibição Visual nos Cards (Priority: P1)

Como membro de uma squad, quero classificar minhas tarefas entre **Cards**, **Subtarefas** e **Iniciativas**, e visualizar distintamente o tipo de cada tarefa diretamente no seu cartão no Kanban, para que a equipe compreenda instantaneamente o nível de granularidade e o propósito de cada item no quadro.

**Why this priority**: É o alicerce fundamental da funcionalidade. Sem a definição tipada do item e sua representação visual no cartão, não é possível estabelecer hierarquias nem dependências coerentes.

**Independent Test**:
- Criar três tarefas no quadro Kanban: uma como `Iniciativa`, uma como `Card` e uma como `Subtarefa`.
- O quadro deve renderizar os três cartões com seus respectivos badges/ícones (🎯 Iniciativa, 📋 Card, 🔹 Subtarefa) e estilos temáticos correspondentes.
- Ao abrir o modal de detalhes de qualquer tarefa, o usuário pode alterar seu tipo, e a alteração reflete imediatamente no cartão.

**Acceptance Scenarios**:
1. **Given** um formulário de criação de tarefa ou modal de detalhes, **When** o usuário seleciona o tipo de tarefa (`Iniciativa`, `Card` ou `Subtarefa`), **Then** o sistema salva o tipo correspondente e o persiste localmente.
2. **Given** um cartão no quadro Kanban, **When** ele é renderizado, **Then** exibe um badge/chip elegante indicando claramente seu tipo com ícone e cor semântica do design system.
3. **Given** tarefas legadas criadas antes desta funcionalidade, **When** o sistema as carrega do `localStorage`, **Then** todas recebem automaticamente o tipo padrão `card` sem erros de tipagem nem quebra de dados.
4. **Given** a alternância de temas (`dark`, `light`, `neutral`), **Then** os badges de tipo mantêm legibilidade, contraste WCAG AA e harmonia visual em todos os modos.

---

### User Story 2 - Vinculação entre Tarefas no Mesmo Quadro (Priority: P1)

Como líder ou membro do time, quero vincular tarefas entre si no mesmo quadro Kanban (definindo relações de `pai`, `filha`, `bloqueia`, `bloqueada por` ou `relacionada`), para que a equipe acompanhe dependências críticas e quebras hierárquicas de trabalho.

**Why this priority**: Elimina silos de informação e explicita impedimentos técnicos entre itens antes que causem bloqueios no fluxo.

**Independent Test**:
- Acessar os detalhes da Tarefa A (Iniciativa) e vincular a Tarefa B (Card) como "Filha / Sub-item".
- Verificar que a Tarefa B passa a listar a Tarefa A como "Pai / Superior".
- Vincular a Tarefa C como "Bloqueia Tarefa D"; verificar que o cartão da Tarefa D exibe sinalização de dependência pendente.

**Acceptance Scenarios**:
1. **Given** o modal de detalhes de uma tarefa, **When** o usuário clica em "Adicionar Vínculo" e escolhe outra tarefa do mesmo quadro com o tipo de relação (`parent`, `child`, `blocks`, `is_blocked_by`, `relates_to`), **Then** o vínculo é registrado bidirecionalmente e exibido na lista de vínculos.
2. **Given** uma tarefa com vínculos existentes, **When** ela é exibida no quadro Kanban, **Then** o cartão apresenta um indicador compacto de links (ex: `🔗 2 vínculos` ou tags contextuais de dependência).
3. **Given** um vínculo indesejado ou superado, **When** o usuário clica no botão de remover vínculo no modal, **Then** a relação é desfeita de forma segura em ambas as tarefas.
4. **Given** uma tentativa de vincular uma tarefa a ela mesma, **When** o usuário tenta salvar, **Then** o sistema bloqueia a ação com mensagem de validação clara.

---

### User Story 3 - Anexo / Vínculo de Tarefa Cross-Squad (Outro Time / Squad) (Priority: P1) 🎯 MVP Core

Como integrante de uma squad com dependências externas, quero anexar e vincular uma tarefa pertencente a **outro time/squad** e a **outro quadro Kanban**, para que possamos monitorar dependências inter-equipes sem quebrar o isolamento e a privacidade dos dados de cada equipe.

**Why this priority**: É o requisito não negociável explicitamente demandado pelo usuário (*"e permitir anexar tarefa de outro time, squad"*), viabilizando alinhamento organizacional entre squads independentes.

**Independent Test**:
- Usuário na Squad Frontend (Quadro "App Web") abre o modal da tarefa "Integração de Pagamento".
- Na seção de vínculos, seleciona a opção "Vincular Tarefa de Outro Time / Squad".
- O seletor exibe a lista de squads disponíveis (ex: "Squad Backend") e seus quadros (ex: "API Gateway").
- Seleciona a tarefa "Endpoint de Checkout v2" da Squad Backend e define a relação como "Bloqueada por".
- O cartão na Squad Frontend passa a exibir um chip de dependência externa: `🏢 Squad Backend • #T-API • Endpoint de Checkout v2`.

**Acceptance Scenarios**:
1. **Given** a seção de vínculos no modal de detalhes, **When** o usuário escolhe adicionar um vínculo externo, **Then** o sistema lista as squads cadastradas e seus respectivos quadros para seleção do item alvo.
2. **Given** uma tarefa vinculada a uma squad externa, **When** ela é renderizada no cartão e no modal, **Then** exibe o nome da squad remota, o título da tarefa externa e o status atual daquela tarefa (ex: `A Fazer`, `Em Progresso`, `Concluído`).
3. **Given** a política de isolamento da Feature 023, **When** um usuário visualiza um vínculo cross-squad, **Then** ele tem acesso apenas aos metadados essenciais da dependência (título, squad, coluna/status), preservando a soberania e confidencialidade dos detalhes internos do quadro externo.
4. **Given** que o usuário ativo também é membro da squad remota, **When** clica no vínculo externo, **Then** o sistema oferece a opção de navegar diretamente para o quadro daquela squad.

---

### User Story 4 - Progresso de Iniciativas e Alerta de Bloqueio por Dependência (Priority: P2)

Como gestor de fluxo ou product owner, quero que tarefas do tipo **Iniciativa** exibam automaticamente o percentual de conclusão de suas tarefas filhas, e que tarefas bloqueadas por dependências não finalizadas apresentem um alerta visual preventivo, para que tenhamos previsibilidade sobre o avanço de épicos e gargalos de fluxo.

**Why this priority**: Agrega inteligência analítica ao modelo de trabalho, transformando o Kanban operacional em uma visão de fluxo de valor estratégico.

**Independent Test**:
- Criar a Iniciativa "Redesign do Metrik" e vincular a ela 4 cards filhos.
- Conforme 2 dos 4 cards são movidos para a coluna Concluído (`done`), a Iniciativa deve exibir uma barra de progresso visual em `50%`.
- Se um card possui vínculo `is_blocked_by` apontando para uma tarefa ainda em `todo`, o card deve exibir um aviso de "Dependência Pendente".

**Acceptance Scenarios**:
1. **Given** uma tarefa do tipo `Iniciativa` com cards/subtarefas vinculadas como filhas, **When** visualizada no quadro ou modal, **Then** exibe uma barra de progresso e indicador numérico `(X/Y concluídas • Z%)`.
2. **Given** uma tarefa que possui um vínculo `is_blocked_by`, **When** a tarefa bloqueadora ainda não está em uma coluna da categoria `done`, **Then** o cartão exibe uma sinalização visual de dependência não resolvida.
3. **Given** que todas as tarefas bloqueadoras de um cartão foram concluídas, **When** o cartão é renderizado, **Then** o alerta de dependência pendente é automaticamente limpo.

---

## 3. Edge Cases & Tratamento Defensivo

- **Exclusão de Tarefa com Vínculos Ativos**:
  - *Comportamento*: Se a Tarefa X for excluída, qualquer Tarefa Y que possuía vínculo com X deve ter a referência limpa automaticamente, ou exibir graciosa e defensivamente um estado descontinuado sem lançar exceções no React.
- **Exclusão de Squad ou Quadro Remoto**:
  - *Comportamento*: Se uma squad ou quadro externo for excluído, os vínculos cross-squad pré-existentes devem exibir fallback informativo (ex: `[Time Removido] #ID`) sem interromper o carregamento do quadro atual.
- **Vínculos Cíclicos ou Auto-Vínculo**:
  - *Comportamento*: O seletor de tarefas deve filtrar a própria tarefa atual da lista de seleção. Ciclos diretos (ex: A bloqueia B e B tenta bloquear A) devem ser prevenidos pela interface.
- **Coexistência de Subtarefas Internas (Checklist) e Subtarefas como Cards**:
  - *Comportamento*: A propriedade existente `subtasks?: SubtaskModel[]` (checklist leve de checkboxes dentro do cartão) é mantida integralmente para quem deseja anotações rápidas. O novo tipo `subtask` no nível de `TaskModel` é uma entidade de fluxo que pode viver no quadro e ter suas próprias métricas.
- **Usuários Convidados (`guest`)**:
  - *Comportamento*: Usuários com papel `guest` na squad ativa podem visualizar tipos de tarefas e vínculos existentes, mas os botões de adicionar e remover vínculos devem estar desabilitados (somente-leitura).
- **Quadros em Branco / Sem Tarefas para Vincular**:
  - *Comportamento*: O seletor de tarefas deve apresentar estado vazio amigável ("Nenhuma outra tarefa disponível para vínculo neste quadro").

---

## 4. Requisitos Funcionais *(mandatory)*

### Tipos de Tarefas (Work Item Types)
- **FR-001**: O sistema DEVE definir e suportar o tipo de trabalho `TaskType` com três opções obrigatórias:
  - `'initiative'` (Iniciativa / Épico estratégico)
  - `'card'` (Card regular / História de fluxo)
  - `'subtask'` (Subtarefa / Item granular)
- **FR-002**: O sistema DEVE atribuir o valor padrão `'card'` para qualquer tarefa pré-existente ou criada sem tipo explícito, garantindo 100% de retrocompatibilidade.
- **FR-003**: O componente `TaskCard` no quadro Kanban DEVE renderizar um badge dedicado no cabeçalho do cartão com ícone e texto (🎯 Iniciativa, 📋 Card, 🔹 Subtarefa) alinhado ao Metrik Design System, além de contador de links e chip com a squad externa na base do cartão.
- **FR-004**: O modal `TaskDetailsModal` DEVE conter um seletor visual permitindo alterar o tipo da tarefa a qualquer momento.

### Modelo de Vínculos & Relacionamentos
- **FR-005**: O sistema DEVE suportar a estrutura de vínculos `TaskLinkModel` contendo:
  - `id`: identificador único do vínculo.
  - `targetTaskId`: identificador da tarefa vinculada.
  - `relationType`: tipo semântico (`'parent'`, `'child'`, `'blocks'`, `'is_blocked_by'`, `'relates_to'`).
  - `targetBoardId`: identificador do quadro onde a tarefa reside.
  - `targetTeamId`: identificador da squad/time à qual a tarefa pertence.
  - `createdAt`: data/hora de criação do vínculo.
- **FR-006**: O sistema DEVE permitir a criação de vínculos bidirecionais consistentes entre tarefas do mesmo quadro.
- **FR-007**: O sistema DEVE permitir a remoção de vínculos diretamente na interface da tarefa.

### Vínculos Cross-Squad (Dependências entre Times)
- **FR-008**: O sistema DEVE permitir ao usuário buscar e vincular tarefas de **qualquer squad cadastrada no sistema**, exibindo resumo informativo da dependência (título, squad e status da coluna) para máxima transparência entre equipes.
- **FR-009**: O seletor de vínculos DEVE disponibilizar dropdowns em cascata para Squad Alvo -> Quadro Alvo -> Tarefa Alvo.
- **FR-010**: Cartões com vínculos cross-squad DEVEM exibir uma identificação clara da squad de origem/destino no Kanban e no modal.
- **FR-011**: O sistema DEVE preservar as restrições de permissão da squad remota, não permitindo edições no cartão externo a partir de uma squad não autorizada.

### Indicadores e Progresso
- **FR-012**: O sistema DEVE calcular e exibir o progresso percentual `(concluídas / total * 100)` para tarefas do tipo `initiative` que possuam itens filhos vinculados.
- **FR-013**: O sistema DEVE sinalizar visualmente no cartão quando uma tarefa possui vínculos do tipo `is_blocked_by` cujas tarefas bloqueadoras ainda não estejam em colunas da categoria `done`.
- **FR-014**: O sistema DEVE implementar validação com confirmação (Soft Block): ao tentar mover para a coluna de categoria `done` um cartão com dependência pendente (`is_blocked_by` não concluída), o sistema DEVE exibir diálogo/confirmação alertando sobre a dependência antes de prosseguir com a movimentação.

---

## 5. Entidades & Modelo de Dados *(mandatory)*

### `TaskType`
```typescript
export type TaskType = 'card' | 'subtask' | 'initiative';

export interface TaskTypeConfig {
  type: TaskType;
  label: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}
```

### `TaskRelationType`
```typescript
export type TaskRelationType = 
  | 'parent'         // Esta tarefa é filha da tarefa alvo (alvo é pai)
  | 'child'          // Esta tarefa é pai da tarefa alvo (alvo é filha)
  | 'blocks'         // Esta tarefa bloqueia a tarefa alvo
  | 'is_blocked_by'  // Esta tarefa está bloqueada pela tarefa alvo
  | 'relates_to';    // Associação simples / relacionada
```

### `TaskLinkModel`
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

### Extensão de `TaskModel`
```typescript
export interface TaskModel {
  // ... campos existentes preservados
  type?: TaskType;
  links?: TaskLinkModel[];
}
```

---

## 6. Critérios de Sucesso & Verificação *(mandatory)*

### Resultados Mensuráveis
- **SC-001**: 100% das tarefas novas e existentes no Metrik possuem tipagem válida (`card`, `subtask` ou `initiative`) sem quebras de execução.
- **SC-002**: Criação de vínculo local ou cross-squad concluída com sucesso em menos de 4 cliques na interface de detalhes.
- **SC-003**: 100% de integridade referencial: exclusão de tarefas remove automaticamente referências de links órfãos.
- **SC-004**: Regressão zero na suíte de testes do Metrik (todos os 287 testes existentes continuam passando com 100% de sucesso).
- **SC-005**: Mínimo de 15 novos testes unitários dedicados cobrindo tipagem de tarefas, relações locais, resolução cross-squad e cálculo de progresso de iniciativas.
- **SC-006**: Compilação TypeScript limpa com zero erros no comando `npm run build`.

---

## 7. Premissas & Suposições

- As squads e quadros continuam armazenados sob o padrão Local-First em `localStorage` através dos hooks unificados `useBoards` e `useTeamAccess`.
- O link cross-squad lê os metadados da tarefa remota a partir da lista geral de quadros armazenados localmente, garantindo visualização em tempo real do título e status da dependência.
- O design system do Metrik fornecerá tokens semânticos para as três categorias de tarefas compatíveis com os 3 temas visuais (`dark`, `light`, `neutral`).
- Métricas analíticas legadas (CFD, Cycle Time, Throughput, WIP Aging) continuarão operando sobre todas as tarefas do quadro sem alteração de comportamento.
