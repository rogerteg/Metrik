# Feature Specification: Comentários e Trilha de Auditoria de Ações da Tarefa

**Feature Branch**: `033-task-comments-activity-log`  
**Created**: 2026-09-18  
**Status**: Draft  
**Input**: User description: "Incluir em cada cartao o campo comentario abaixo, para que sejam feitos comentarios nos cartoes, sobre atualizações. E essas fiquem no sistema para uma eventual consulta futura. Crie tambem um registro de todas as ações feitas nos cards. Para uma possivel rastreabilidade. Movimentações, quem moveu, registre o horario e a data, e o usuario que o fez."

---

## Clarifications

### Session 2026-09-18
- Q: Os comentários nas tarefas devem suportar formatação Markdown (negrito, listas, links) ou ser unicamente texto simples (com preservação de quebra de linha)? → A: Texto Simples (Preservação de quebras de linha com `white-space: pre-wrap`, sem parsing de Markdown nem sanitização HTML complexa).
- Q: Os comentários nas tarefas podem ser editados após a criação ou são imutáveis (permitindo apenas criação e exclusão)? → A: Imutáveis (Append-only; comentários criados não podem ter seu texto alterado, sendo permitida apenas a remoção pelo autor ou administrador da squad).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro e Consulta de Comentários na Tarefa (Priority: P1) 🎯 MVP

Como membro de um time/squad, quero adicionar e consultar comentários estruturados em cada cartão de tarefa, para registrar atualizações de progresso e contexto que fiquem armazenados para consultas futuras.

**Why this priority**: Permite comunicação assíncrona e documentação histórica de atualizações diretamente vinculadas à tarefa, atendendo ao requisito principal de registro de comentários.

**Independent Test**: Abrir o modal de detalhes ou seção estendida de qualquer tarefa, digitar um comentário de atualização, clicar em "Comentar" e verificar que o comentário aparece listado com autor, data/horário formatado e permanece salvo no armazenamento local após recarregar a página.

**Acceptance Scenarios**:

1. **Given** o modal de detalhes de uma tarefa aberto, **When** o usuário digita uma atualização de texto na caixa de comentários e confirma, **Then** o sistema registra o comentário vinculando o nome do usuário ativo, a data e horário exatos (`DD/MM/AAAA HH:mm`), exibindo-o no topo da lista cronológica de comentários.
2. **Given** uma tarefa com comentários registrados previamente, **When** qualquer usuário visualiza os detalhes da tarefa, **Then** o sistema exibe o histórico completo de comentários em ordem cronológica com rolagem fluida e indicação clara do autor.
3. **Given** uma tentativa de submeter um comentário em branco ou apenas com espaços, **Then** o botão de envio permanece desativado, impedindo registros vazios.

---

### User Story 2 - Trilha de Auditoria Automática de Ações nos Cartões (Priority: P2)

Como gestor ou membro do time, quero que todas as ações realizadas em uma tarefa (movimentação de coluna, alteração de status de bloqueio, mudança de prioridade, adição/remoção de tags e edições) sejam gravadas automaticamente em um registro de auditoria imutável, para garantir rastreabilidade total de quem fez o quê e quando.

**Why this priority**: Garante governança, transparência e rastreabilidade total de movimentações de fluxo e edições críticas na equipe.

**Independent Test**: Mover uma tarefa de uma coluna para outra (ex.: "Em Progresso" para "Concluído"), abrir os detalhes da tarefa e verificar que a trilha de atividades exibe a entrada: *"Movido da coluna 'Em Progresso' para 'Concluído' por Rogerio Teixeira em 18/09/2026 às 16:20"*.

**Acceptance Scenarios**:

1. **Given** uma tarefa movida entre colunas no quadro (via arrastar e soltar ou botões de movimentação), **When** a movimentação é concluída, **Then** o sistema grava automaticamente um evento contendo o ID do usuário, nome do usuário, timestamp ISO e o texto da alteração (coluna origem e destino).
2. **Given** uma tarefa marcada ou desmarcada como bloqueada, **When** o estado de bloqueio é alterado, **Then** o sistema registra um evento de auditoria especificando a mudança de status, motivo do impedimento e o autor responsável.
3. **Given** alterações em atributos da tarefa (prioridade, tags, datas ou título), **When** o atributo é atualizado, **Then** o sistema registra a alteração no histórico com os valores anteriores e novos.

---

### User Story 3 - Painel Unificado de Histórico e Filtro de Linha do Tempo (Priority: P3)

Como usuário consultando o histórico de uma tarefa antiga, quero visualizar em uma linha do tempo integrada tanto os comentários textuais quanto os eventos de auditoria com opção de filtragem, para compreender rapidamente a evolução completa da tarefa.

**Why this priority**: Melhora a ergonomia e experiência visual ao diferenciar claramente comentários humanos de eventos automáticos do sistema.

**Independent Test**: Acessar a aba/seção de Histórico da tarefa no modal, alternar entre os filtros "Todos", "Apenas Comentários" e "Apenas Auditoria" e verificar a filtragem reativa e precisa da linha do tempo.

**Acceptance Scenarios**:

1. **Given** o histórico de uma tarefa com comentários e eventos de movimentação, **When** o usuário seleciona o filtro "Apenas Comentários", **Then** a visualização oculta os eventos automáticos exibindo unicamente as mensagens de atualização humana.
2. **Given** o histórico exibido na linha do tempo, **When** um evento de auditoria é renderizado, **Then** o sistema exibe um ícone/badge temático distintivo (ex.: ícone de seta para movimentação, ícone de bloqueio para impedimento, ícone de balão para comentário).

---

### Edge Cases

- **Troca de Usuário ou Sessão Anônima**: Se o usuário ativo não estiver identificado no contexto de sessão, o sistema MUST atribuir as ações ao nome default "Usuário do Sistema" mantendo a integridade da gravação.
- **Operação Offline / Local-First**: O histórico de comentários e eventos de auditoria MUST ser gravado atomicamente no `localStorage` em modo Local-First e propagado ao Supabase via `pushToSupabase` / `pullFromSupabase` sem perda de registros.
- **Exclusão de Tarefa**: Se uma tarefa for excluída do quadro, seu histórico de comentários e auditoria é removido atomicamente com o objeto da tarefa.
- **Exclusão de Comentários**: Comentários registrados por um usuário são imutáveis (sem alteração de texto após o envio) e podem ser removidos unicamente pelo autor ou por um administrador da squad, gerando um evento de exclusão no log de auditoria.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma seção de comentários em cada tarefa (no modal de detalhes e/ou expansão do cartão), permitindo a inclusão de atualizações em texto simples com preservação de quebras de linha (`white-space: pre-wrap`).
- **FR-002**: O sistema MUST gravar em cada comentário o identificador do comentário, texto simples, ID do autor, nome do autor, data e horário exatos da criação (`createdAt` em ISO 8601).
- **FR-003**: O sistema MUST manter uma trilha de auditoria (*activity log*) automática e persistente para cada cartão de tarefa.
- **FR-004**: O sistema MUST registrar automaticamente eventos de auditoria para as seguintes ações:
  - Criação da tarefa (data, horário e usuário criador).
  - Movimentação de coluna (coluna origem, coluna destino, data, horário e usuário).
  - Alteração de estado de impedimento/bloqueio (bloqueada/desbloqueada, motivo, data, horário e usuário).
  - Alteração de prioridade (prioridade anterior e nova).
  - Edição de datas (início, fim e entrega).
  - Adição e remoção de tags.
- **FR-005**: Cada registro de evento de auditoria MUST conter: `id`, `taskId`, `eventType`, `userId`, `userName`, `description`, `metadata` (detalhes da alteração) e `timestamp`.
- **FR-006**: O sistema MUST exibir a linha do tempo cronológica no modal de detalhes da tarefa com ordenação da mais recente para a mais antiga (ou ordenação selecionável).
- **FR-007**: O sistema MUST oferecer filtros visuais na linha do tempo para alternar entre: "Todos os eventos", "Comentários" e "Histórico de Movimentações/Ações".
- **FR-008**: O sistema MUST utilizar a infraestrutura de salvamento com debounce e/ou gravação intencional definida na Feature 032 para novas inserções de comentários.
- **FR-009**: O sistema MUST assegurar que os eventos de auditoria sejam imutáveis e protegidos contra alteração manual direta.
- **FR-010**: O sistema MUST integrar os novos arrays de dados (`comments` e `activityLog`) no modelo da tarefa no `localStorage` e na sincronização com Supabase.
- **FR-011**: Usuários com perfil Convidado (*Guest*) MUST poder apenas visualizar os comentários e histórico de auditoria, com a inserção de novos comentários bloqueada conforme o Princípio VIII da Constituição.
- **FR-012**: Os comentários MUST ser imutáveis quanto ao seu conteúdo textual após a criação (sem fluxo ou botões de edição inline), sendo permitida apenas a exclusão do comentário por autor/admin.

### Key Entities

- **TaskComment**:
  - `id`: string (UUID v4)
  - `taskId`: string
  - `userId`: string
  - `userName`: string
  - `text`: string (texto simples com quebras de linha preservadas)
  - `createdAt`: string (timestamp ISO)
- **TaskActivityLog**:
  - `id`: string (UUID v4)
  - `taskId`: string
  - `userId`: string
  - `userName`: string
  - `eventType`: 'created' | 'moved' | 'blocked' | 'unblocked' | 'priority_changed' | 'dates_changed' | 'tags_changed' | 'comment_added' | 'edited'
  - `description`: string (descrição legível do evento)
  - `fromValue`: optional string
  - `toValue`: optional string
  - `timestamp`: string (timestamp ISO)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das movimentações de coluna e alterações de status de bloqueio são gravadas na trilha de auditoria com nome do usuário, data e horário exatos.
- **SC-002**: Usuários conseguem adicionar um novo comentário e visualizá-lo na linha do tempo da tarefa em menos de 2 segundos.
- **SC-003**: 100% dos comentários e registros de auditoria permanecem íntegros e acessíveis após recarregar a aplicação ou alternar entre quadros em modo Local-First.
- **SC-004**: O histórico completo de uma tarefa com até 100 eventos e comentários renderiza suavemente sem degradação na performance de rolagem ou arrasto no Kanban.

---

## Assumptions

- O usuário ativo para atribuição de autoria é obtido a partir do contexto do usuário logado/selecionado na aplicação (ex.: `currentUser.name`).
- A formatação de data/horário utiliza a localização padrão em português do Brasil (`pt-BR`).
- A inclusão de novos comentários e o registro de auditoria utilizam o ecossistema existente de componentes e estilos do Metrik Design System.
