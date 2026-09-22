# Feature Specification: Redesign do Histórico, Auditoria e Comentários da Tarefa (Enterprise Task Timeline)

**Feature Branch**: `034-enhanced-task-timeline`  
**Created**: 2026-09-21  
**Status**: Draft  
**Input**: User description: "Melhoria: O Log, historico e comentario da Tarefa, esta muito ruim. Voce é um profissional especialista, e precisa dar o seu melhor. Melhor e muito esse ponto."

---

## Clarifications

### Session 2026-09-21
- Q: Quais melhorias visuais e funcionais devem ser priorizadas para transformar a experiência de histórico e comentários? → A: Redesign completo da linha do tempo com agrupamento temporal (Hoje, Ontem, Esta Semana), cards visuais de diff para alterações (`[De ➔ Para]`), suporte a formatação Markdown limpa com pré-visualização, marcação de comentários como "Decisão de Projeto", filtros avançados por tipo/autor/busca textual, e modo de visualização compacto/expandido.
- Q: Como os comentários marcados como "Decisão de Projeto" devem ser destacados e filtrados na barra de filtros da linha do tempo? → A: Adicionar botão de filtro exclusivo "Decisões" na TimelineFilterBar com badge contador e destaque visual.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Timeline Visual Redesenhada e Diff Cards de Auditoria (Priority: P1) 🎯 MVP

Como membro ou gestor de equipe, quero visualizar o histórico da tarefa em um painel cronológico elegante com cartões visuais de alteração (diffs com valores anterior e novo) e agrupamento temporal, para compreender instantaneamente a evolução e as movimentações do cartão no Kanban.

**Why this priority**: Substitui a lista de texto plano por uma interface moderna nível enterprise (estilo Businessmap/Jira), destacando movimentações de coluna, bloqueios e alterações de prioridade com clareza visual.

**Independent Test**: Abrir os detalhes de qualquer tarefa com histórico, verificar o agrupamento por períodos de tempo ("Hoje", "Ontem", "Anteriores"), os badges coloridos por tipo de evento e os cartões de diff legíveis (`De "A Fazer" ➔ Para "Em Progresso"`).

**Acceptance Scenarios**:

1. **Given** o modal de detalhes de uma tarefa com eventos gravados, **When** o usuário abre a aba/seção de Histórico, **Then** o sistema exibe a linha do tempo organizada em seções temporais agrupadas ("Hoje", "Ontem", "Nesta Semana", "Anteriores"), com ordenação decrescente (mais recente primeiro).
2. **Given** um evento de movimentação, bloqueio ou alteração de atributo, **When** ele é renderizado na linha do tempo, **Then** o sistema exibe um cartão estruturado com ícone temático, badge de categoria (Azul para Movimentação, Âmbar/Vermelho para Bloqueio, Roxo para Tags, Verde para Conclusão) e visualização em formato diff (`[Valor Anterior] ➔ [Valor Novo]`).
3. **Given** qualquer item da linha do tempo, **When** o usuário passa o cursor sobre a data relativa (ex.: "há 10 min"), **Then** um tooltip nativo exibe o timestamp ISO completo formatado no padrão brasileiro (`21/09/2026 às 14:40`).

---

### User Story 2 - Comentários Estruturados com Markdown, Destaques e Reações (Priority: P2)

Como colaborador, quero registrar comentários com suporte a formatação rica simples (negrito, itálico, listas, código), sinalização de "Decisão de Projeto" e suporte a atalhos de teclado, para tornar a comunicação do time mais expressiva e documentar decisões críticas de forma destacada.

**Why this priority**: Aumenta dramaticamente a utilidade dos comentários em equipes ágeis, permitindo destacar decisões arquiteturais e formatações claras de atualização.

**Independent Test**: Escrever um comentário com negrito/listas, marcar a opção "Destacar como Decisão" e enviar. Verificar a renderização do badge dourado "Decisão de Projeto" e a formatação rica na linha do tempo.

**Acceptance Scenarios**:

1. **Given** a caixa de criação de comentário, **When** o usuário digita texto com formatação Markdown básica (`**negrito**`, `*itálico*`, `- lista`, ``código``), **Then** o comentário é renderizado com formatação visual rica preservando quebras de linha e estrutura.
2. **Given** um comentário contendo um alinhamento arquitetural ou de negócio crítico, **When** o autor marca a opção "Destacar como Decisão", **Then** o comentário recebe um contorno dourado distintivo e um badge "Decisão de Projeto", sobressaindo-se visualmente na linha do tempo.
3. **Given** a digitação de um comentário, **When** o usuário pressiona `Ctrl+Enter` (ou `Cmd+Enter`), **Then** o comentário é enviado instantaneamente, disparando salvamento atômico sem necessidade de clicar no botão.

---

### User Story 3 - Busca Textual, Filtros Multi-critério e Header Estatístico (Priority: P3)

Como gestor auditando o histórico de tarefas extensas, quero filtrar os eventos por palavra-chave, autor ou categoria e alternar entre visualização compacta e expandida, para encontrar rapidamente informações específicas em cartões com dezenas de movimentações.

**Why this priority**: Garante alta eficiência de consulta e ergonomia em projetos de longa duração com centenas de eventos registrados.

**Independent Test**: Digitar uma busca na caixa de pesquisa da linha do tempo, selecionar um autor ou clicar na aba "Decisões"; verificar que unicamente os eventos correspondentes são exibidos e que o contador no cabeçalho estatístico é atualizado reativamente.

**Acceptance Scenarios**:

1. **Given** a linha do tempo da tarefa, **When** o usuário digita um termo na caixa de busca (ex.: "API" ou "bloqueado") ou clica no filtro exclusivo "Decisões", **Then** a lista refiltra em tempo real exibindo apenas comentários e auditorias que contêm a palavra pesquisada ou a marcação de decisão.
2. **Given** o cabeçalho da linha do tempo, **When** visualizado pelo usuário, **Then** o sistema exibe estatísticas resumidas com contadores de comentários, decisões destacadas, movimentações e bloqueios.
3. **Given** o seletor de densidade da linha do tempo, **When** o usuário alterna para "Modo Compacto", **Then** o sistema reduz os espaçamentos verticais e oculta detalhes secundários para maximizar a quantidade de itens visíveis na tela.

---

### Edge Cases

- **Histórico sem eventos**: Quando a tarefa for recém-criada e não possuir comentários nem movimentações além da criação, o sistema MUST exibir um estado vazio ilustrado e instrutivo ("Início da jornada da tarefa").
- **Comentários muito extensos**: Comentários com mais de 500 caracteres MUST exibir um botão "Ver mais / Ver menos" para evitar que uma única mensagem ocupe toda a altura do modal.
- **Usuário Convidado (Guest)**: O perfil `guest` MUST visualizar a linha do tempo completa, filtros e busca, porém os controles de envio, destaque de decisão e exclusão permanecem desativados (Princípio VIII).
- **Offline / Local-First Integrity**: Toda a estrutura de formatação, marcadores de decisão e agrupamentos MUST ser serializada no `localStorage` sem alterar a compatibilidade retroativa com arrays de comentários anteriores.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST redesenhar o componente de linha do tempo (`TaskTimeline`) adotando visual moderno dark enterprise, com cartões de evento estruturados, agrupamento por data (Hoje, Ontem, Esta Semana, Anteriores) e badges de categoria codificados por cores.
- **FR-002**: O sistema MUST renderizar eventos de movimentação e alteração de atributos em formato diff legível (`[Valor Anterior] ➔ [Valor Novo]`), identificando colunas, prioridades, tags e motivos de impedimento.
- **FR-003**: O sistema MUST permitir a inclusão de formatação Markdown limpa nos comentários (negrito, itálico, listas, blocos de código inline), sanitizando a saída contra XSS sem necessidade de bibliotecas pesadas de terceiros.
- **FR-004**: O sistema MUST disponibilizar a opção de marcar um comentário como "Decisão de Projeto" (`isDecision: true`), exibindo destaque dourado e badge temático no item.
- **FR-005**: O sistema MUST integrar uma barra de pesquisa textual em tempo real na linha do tempo para filtrar itens por palavra-chave no texto ou na descrição do evento.
- **FR-006**: O sistema MUST fornecer filtros por autor/membro e seletores de categoria de evento ("Todos", "Decisões", "Comentários", "Movimentações", "Bloqueios"), disponibilizando o botão "Decisões" como filtro de primeira classe na `TimelineFilterBar` com badge contador.
- **FR-007**: O sistema MUST incluir um cabeçalho resumido com métricas estatísticas da tarefa (total de comentários, total de decisões, quantidade de movimentações e tempo total bloqueado).
- **FR-008**: O sistema MUST permitir a alternância de densidade visual entre "Modo Detalhado" e "Modo Compacto".
- **FR-009**: O sistema MUST implementar mecanismo "Ver mais / Ver menos" para comentários com textos extensos (mais de 4 linhas ou 400 caracteres).
- **FR-010**: O sistema MUST manter 100% de compatibilidade Local-First e Supabase Sync com a estrutura `TaskComment` e `TaskActivityLog`, estendendo os campos de forma opcional e segura.
- **FR-011**: Usuários com perfil `guest` MUST ter acesso de leitura total a todos os filtros, busca e estatísticas, com a caixa de comentário e botões de ação desativados.
- **FR-012**: O sistema MUST suportar o atalho de teclado `Ctrl+Enter` / `Cmd+Enter` para submissão ágil de comentários.

### Key Entities

- **TaskComment (Estendido)**:
  - `id`: string (UUID v4)
  - `taskId`: string
  - `userId`: string
  - `userName`: string
  - `text`: string (Markdown limpo com quebras de linha)
  - `isDecision`: optional boolean (marcação de decisão de projeto)
  - `createdAt`: string (timestamp ISO)
- **TaskActivityLog (Estendido)**:
  - `id`: string (UUID v4)
  - `taskId`: string
  - `userId`: string
  - `userName`: string
  - `eventType`: TaskActivityEventType
  - `description`: string
  - `fromValue`: optional string
  - `toValue`: optional string
  - `timestamp`: string (timestamp ISO)
- **TimelineGroup**:
  - `groupKey`: 'today' | 'yesterday' | 'this_week' | 'older'
  - `label`: string ("Hoje", "Ontem", "Esta Semana", "Anteriores")
  - `items`: TimelineItem[]

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo necessário para um usuário localizar uma decisão ou movimentação específica em uma tarefa com 50+ eventos é reduzido em mais de 60% com os novos filtros e busca.
- **SC-002**: 100% das alterações de atributos são exibidas em formato diff visual claro (`De ➔ Para`), eliminando ambiguidades sobre valores anteriores.
- **SC-003**: A renderização da linha do tempo agrupada com até 100 eventos e comentários conclui em menos de 30ms, mantendo rolagem fluida a 60 FPS.
- **SC-004**: 100% dos comentários com marcação de decisão mantêm seu destaque visual e estado de persistência no `localStorage` e na sincronização em nuvem.

---

## Assumptions

- A biblioteca de ícones utiliza SVG nativo inline, mantendo conformidade estrita com a eliminação de dependências não instaladas e zero vazamento de marcas (Princípio VII).
- O parseamento de Markdown simples utiliza um formatador leve regex/AST interno seguro sem `dangerouslySetInnerHTML`.
- A localização padrão de datas e agrupamentos utiliza o idioma Português do Brasil (`pt-BR`).
