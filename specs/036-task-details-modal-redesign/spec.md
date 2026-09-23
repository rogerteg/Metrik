# Feature Specification: Task Details Modal & Activity System Complete UI/UX Redesign

**Feature Branch**: `036-task-details-modal-redesign`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Melhoria: O design ficou muito ruim, a parte interna do card... Historico, comentarios, logs. Peço que analise como Design todo o sistema, e melhore isso. Toda configuração foi perdida, a formatação é ruim, pesima. Melhore isso."

## Clarifications

### Session 2026-09-22

- Q: Como as preferências visuais da linha do tempo (densidade e filtro ativo) devem ser escopadas no localStorage? → A: Global por navegador (`metrik-timeline-prefs`): as preferências de densidade e aba ativa aplicam-se uniformemente a todas as tarefas e quadros acessados no mesmo navegador.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redesign Visual Premium do Modal de Detalhes da Tarefa (Priority: P1) 🎯 MVP

Como membro da equipe visualizando e editando uma tarefa, quero um modal de detalhes com arquitetura de informação clara em duas colunas, hierarquia tipográfica impecável, suporte a vidro/glassmorphism e metadados organizados, para que a experiência de leitura e edição do card seja fluida, elegante e de nível enterprise.

**Why this priority**: É o MVP crítico. Corrige a degradação visual reportada na estrutura interna da tarefa, restaurando a sofisticação estética e o rigor ergonômico do Metrik Design System.

**Independent Test**: Abrir o modal de detalhes de qualquer tarefa e verificar a nova disposição em 2 colunas: painel principal com editor de descrição, subtarefas e feed cronológico; painel lateral com metadados estilizados (prioridade, responsável, datas, squad, bloqueio) sem estouros ou alinhamentos desajustados.

**Acceptance Scenarios**:

1. **Given** que o usuário clica em um cartão no Kanban, **When** o modal de detalhes é exibido, **Then** o layout apresenta uma divisão em duas colunas harmoniosas (coluna principal 65%-70% de largura; coluna lateral 30%-35%), com efeito glassmorphism sutil (`bg-slate-900/90 backdrop-blur-md`), bordas refinadas (`border-slate-800`) e tipografia moderna.
2. **Given** a coluna lateral de metadados, **When** o usuário visualiza Prioridade, Tags, Squad e Impedimento, **Then** cada item possui um pill/badge padronizado com contraste WCAG AA, ícones nativos vetorizados (14px-16px) e espaçamento uniforme.

---

### User Story 2 - Reformulação de Elite da Seção de Histórico, Comentários e Logs (Priority: P2)

Como usuário acompanhando a evolução da tarefa, quero que o feed de atividades, comentários e logs de movimentação possua uma formatação visual impecável, cartões de comentário expansíveis, avatares em alta definição, pílulas diff semânticas e visualização estruturada de citações e blocos de código, para que o contexto de discussão seja cristalino.

**Why this priority**: Restaura a qualidade de leitura das interações diárias, eliminando a sensação de formatação quebrada ou pesada.

**Independent Test**: Inserir um comentário com blocos de texto, listas, citações (`> `) e código (` ` ` `), verificar o encaixe visual nos cartões com bordas suaves, visualização de horário em tooltip e destaque dourado para "Decisão de Projeto".

**Acceptance Scenarios**:

1. **Given** o feed de histórico e comentários renderizado, **When** o usuário lê as entradas, **Then** comentários e logs de sistema utilizam cartões diferenciados por gradiente e borda: comentários em cartões `bg-slate-900/80` com avatar de autor; logs em linhas discretas `bg-slate-950/60` com pílulas diff `[De ➔ Para]` perfeitamente alinhadas.
2. **Given** comentários com formatação rica (negrito, itálico, listas, blocos de código, citação), **When** exibidos, **Then** a tipografia mantém espaçamento de linhas relaxado (`leading-relaxed`), cores harmonizadas (`text-slate-300`, código em `text-cyan-300 bg-slate-950`), sem estourar as margens do cartão.

---

### User Story 3 - Preservação Invariante de Configurações do Usuário e Rascunhos (Priority: P3)

Como usuário frequente do sistema, quero que minhas preferências visuais (modo de densidade compacto/detalhado, filtros ativos de timeline e rascunhos de comentários) sejam 100% preservadas e persistidas no `localStorage` sem perdas ao alternar entre tarefas ou recarregar a aplicação.

**Why this priority**: Resolve diretamente a reclamação de que "toda configuração foi perdida", garantindo persistência determinística de preferências e guarda contra descarte involuntário.

**Independent Test**: Selecionar o filtro "Apenas Decisões" e o modo de densidade "Compacto", fechar o modal, abrir outra tarefa e recarregar a página. Confirmar que o modal reabre mantendo o estado exato das configurações do usuário.

**Acceptance Scenarios**:

1. **Given** que o usuário altera a densidade do feed (Compacto vs Detalhado) ou o filtro ativo (Todas, Decisões, Comentários, Auditoria), **When** a ação é executada, **Then** a preferência é gravada imediatamente em `localStorage` sob a chave `metrik-timeline-prefs` e aplicada automaticamente em todas as tarefas subsequentes.
2. **Given** um comentário sendo digitado no formulário, **When** o usuário tenta fechar o modal sem enviar, **Then** o rascunho é mantido em memória temporária ou protegido pelo guard de dirty state.

---

### Edge Cases

- **O que acontece quando o modal de detalhes é aberto em telas de menor resolução (laptops 13" ou tablets)?**
  - O layout responsivo transiciona automaticamente de 2 colunas para 1 coluna vertical com scroll suave, colapsando o painel lateral abaixo da descrição principal.
- **O que acontece se uma tarefa possuir 50+ logs de movimentação muito próximos?**
  - O modo compacto agrupa movimentações consecutivas do mesmo usuário em blocos condensados de 1 linha por evento com busca em tempo real (<16ms).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE implementar uma nova arquitetura visual para o Modal de Detalhes da Tarefa, estruturada em layout de duas colunas (Principal e Lateral) com hierarquia de cores e tipografia do Metrik Design System.
- **FR-002**: O sistema DEVE garantir dimensionamento estrito e padronizado (14px-18px, `flex-shrink: 0`) para 100% dos ícones SVGs internos do modal (relógio, anexos, tags, prioridades, badges).
- **FR-003**: O feed de Histórico e Comentários DEVE utilizar cartões visuais com contraste elevado, separação clara entre comentários de usuários (`bg-slate-900/80`) e logs de auditoria (`bg-slate-950/60`), e avatares autorais com borda temática.
- **FR-004**: O parser e renderizador de Markdown DEVE aplicar estilos CSS refinados para títulos, parágrafos (`leading-relaxed`), código inline (`bg-slate-950 text-cyan-300`), listas e blocos de citação (`border-l-2 border-amber-500 bg-amber-500/5`), sem sobreposição ou estouro de texto.
- **FR-005**: As pílulas visuais de diff `[De ➔ Para]` em logs de movimentação DEVEM utilizar badges semânticos compactos com bordas arredondadas e texto truncado elegante.
- **FR-006**: O sistema DEVE persistir e restaurar automaticamente todas as preferências do usuário referentes à timeline (densidade visual, abas de filtro ativas, estado de recolhimento) no `localStorage` sob a chave `metrik-timeline-prefs` com escopo global no navegador, aplicando-as uniformemente a todas as tarefas e quadros.
- **FR-007**: O sistema DEVE disponibilizar uma barra de controle estatístico e busca com latência <16ms (60 FPS) integrada ao topo da timeline.
- **FR-008**: As decisões de projeto (`isDecision`) DEVEM continuar com destaque dourado de alto impacto (`border-amber-500/60 bg-amber-950/30`), badge luminoso e inclusão no painel "Spotlight de Decisões".
- **FR-009**: O formulário de entrada de comentários DEVE oferecer barra de ferramentas com botões de atalho Markdown com feedback tátil e atalho de submissão `Ctrl+Enter`.
- **FR-010**: O sistema DEVE manter 100% de retrocompatibilidade com o modelo de dados `TaskComment` e `TaskActivityLog` e integridade com a sincronização cloud Supabase e persistência Local-First.

### Key Entities

- **TaskDetailsModalState**: Estado de apresentação do modal (tarefa ativa, coluna ativa, aba ativa, rascunhos).
- **UserTimelinePreferences**: Estrutura persistida em `localStorage` contendo `densityMode: 'compact' | 'detailed'`, `activeFilter: 'all' | 'decisions' | 'comments' | 'activity'`, `searchQuery: string`.
- **TaskComment**: Modelo de comentário enriquecido com `isDecision`, `pinned`, `createdAt`.
- **TaskActivityLog**: Evento de auditoria com `fromValue`, `toValue`, `eventType`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos elementos visuais do modal de detalhes da tarefa obedecem às diretrizes de espaçamento, tipografia e sizing de ícones (<=18px) do Metrik Design System.
- **SC-002**: As configurações visuais do usuário (densidade e filtro ativo) permanecem 100% preservadas ao reabrir tarefas ou atualizar a página.
- **SC-003**: 100% das suítes de teste de unidade/integração (`npm test -- --run`) e compilação TypeScript/Vite (`npm run build`) passam com zero erros e zero regressões.

## Assumptions

- O redesign é focado na experiência de uso do modal interno da tarefa (Card Interno: Histórico, Comentários, Logs, Metadados e Editor).
- Todas as operações visuais utilizam Vanilla CSS e Tailwind CSS utilitário com suporte a CSS Variables do tema.
- Nenhuma dependência externa de biblioteca de UI é introduzida, mantendo o Princípio VII (Brand Independence) e Princípio V (Simplicity).
