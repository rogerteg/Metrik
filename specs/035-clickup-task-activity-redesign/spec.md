# Feature Specification: ClickUp-Inspired Task Activity & Comments Redesign

**Feature Branch**: `035-clickup-task-activity-redesign`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Analise a imagem, essa imagem aparece no corpo da tarefa. Melhor isso. Essa funcao de log historio e comentario da tarefa essa ruim. Corrija. O log Historico e comentario da tarefa do Clickup é muito bom. Use como inspiração."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Correção Estrita de Sizing de Ícones e Layout ClickUp Limpo (Priority: P1) 🎯 MVP

Como usuário do Metrik abrindo o modal de detalhes de uma tarefa, quero que a seção de Histórico e Comentários possua ícones com dimensões estritas (sem SVGs desproporcionais ou gigantes na tela) e uma apresentação visual limpa inspirada no ClickUp, para que o conteúdo seja legível, organizado e elegante.

**Why this priority**: É o MVP crítico. Corrige diretamente o bug visual relatado na imagem (SVG gigante ocupando a tela) e estabelece a estrutura de layout moderna inspirada no ClickUp.

**Independent Test**: Abrir os detalhes de qualquer tarefa com históricos/comentários e verificar que nenhum ícone SVG ultrapassa 16px-20px de altura e que a linha do tempo exibe um layout compacto e legível.

**Acceptance Scenarios**:

1. **Given** que o usuário abre o modal de detalhes de uma tarefa, **When** a seção de Histórico e Comentários é renderizada, **Then** todos os ícones SVGs (incluindo o ícone de relógio do header e ícones de atividade) possuem largura e altura estritamente limitadas (`16px`/`20px`) via atributos explícitos e CSS scoped, eliminando qualquer SVG gigante na tela.
2. **Given** a linha do tempo aberta, **When** o usuário visualiza as atividades, **Then** o layout segue o padrão visual do ClickUp: cabeçalho compacto, divisão clara entre comentários e eventos de sistema, e avatares alinhados com tipografia refinada.

---

### User Story 2 - Editor de Comentários e Decisões no Padrão ClickUp (Priority: P2)

Como membro de equipe trabalhando em uma tarefa, quero um editor de comentários moderno no padrão ClickUp com barra de ferramentas rica, marcação de "Decisão de Projeto", suporte a atalhos e suporte a Markdown, para que as discussões e decisões de projeto fiquem registradas de forma destacada.

**Why this priority**: Permite comunicação fluida e profissional na tarefa, permitindo destacar decisões cruciais para que não se percam nas discussões diárias.

**Independent Test**: Escrever um comentário com formatação rica (negrito, código, listas), marcar o toggle de "Decisão de Projeto" e enviar via `Ctrl+Enter`. Verificar que o comentário aparece com o card dourado de decisão e formatação Markdown impecável.

**Acceptance Scenarios**:

1. **Given** o editor de comentários aberto, **When** o usuário interage com a barra de ferramentas (negrito, itálico, código, listas), **Then** os marcadores Markdown apropriados são inseridos no campo de texto.
2. **Given** que o usuário marca "Decisão de Projeto", **When** o comentário é enviado, **Then** ele recebe uma borda e badge dourados de destaque e é indexado imediatamente no filtro de Decisões.
3. **Given** o envio com `Ctrl+Enter`, **When** o atalho é pressionado, **Then** o comentário é submetido sem recarregar a página e o campo de texto é limpo.

---

### User Story 3 - Stream Unificado de Atividades com Pílulas Diff e Spotlight de Decisões (Priority: P3)

Como gestor de squad ou desenvolvedor, quero visualizar uma linha do tempo unificada com pílulas visuais de mudança `[De ➔ Para]`, filtros rápidos por tipo (Todas, Comentários, Movimentações, Decisões) e um painel de destaque para Decisões Fixadas, para que eu possa acompanhar o histórico da tarefa em segundos.

**Why this priority**: Fornece rastreabilidade enterprise e busca rápida para equipes que gerenciam tarefas de alta complexidade.

**Independent Test**: Filtrar a timeline selecionando a aba "Decisões" ou "Movimentações" e verificar a filtragem em tempo real, assim como a exibição de pílulas `[A Fazer ➔ Em Progresso]`.

**Acceptance Scenarios**:

1. **Given** eventos de movimentação de coluna, mudança de prioridade ou impedimento, **When** exibidos no feed do ClickUp, **Then** aparecem como pílulas compactas e elegantes mostrando o estado anterior e o novo estado `[De ➔ Para]`.
2. **Given** a barra de filtros no topo da timeline, **When** o usuário altera entre as abas ("Todas", "Comentários", "Movimentações", "Decisões"), **Then** a lista de atividades é filtrada instantaneamente sem perder a ordem cronológica.
3. **Given** a presença de comentários marcados como "Decisão de Projeto", **When** visualizada a timeline, **Then** um painel "Spotlight de Decisões" no topo sintetiza as principais decisões da tarefa.

---

### Edge Cases

- **O que acontece quando um SVG não possui classes de largura/altura no CSS global?**
  - O componente de ícone DEVE definir explicitamente `width={16}` e `height={16}` e `style={{ width: 16, height: 16, flexShrink: 0 }}` inline ou em CSS scoped para prevenir overflow independentemente da presença de bibliotecas externas de utilitários.
- **O que acontece quando o histórico da tarefa contém 100+ eventos antigos?**
  - O feed exibe um botão "Carregar mais atividades anteriores" ou paginação virtual com agrupamento por baldes de tempo ("Hoje", "Ontem", "Esta Semana", "Anteriores").
- **Como o sistema se comporta para usuários no perfil Guest?**
  - O formulário de envio e exclusão de comentários permanece desativado, enquanto a visualização do feed, filtros e busca funcionam normalmente em modo read-only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE aplicar dimensionamento estrito a todos os ícones SVGs na linha do tempo da tarefa (`width: 16px-20px`, `height: 16px-20px`, `flex-shrink: 0`), garantindo zero distorções visuais ou SVGs desproporcionais.
- **FR-002**: O sistema DEVE fornecer um layout visual inspirado no ClickUp para o feed da tarefa, incluindo cabeçalho com estatísticas de atividade (total de comentários, decisões, movimentações e tempo bloqueado).
- **FR-003**: O editor de comentários DEVE incluir barra de ferramentas rápida com botões para Negrito (`**`), Itálico (`*`), Código (` ` ` `), Listas (`- `) e Bloco de Citação (`> `).
- **FR-004**: O editor de comentários DEVE possuir um seletor visual de "Decisão de Projeto" (`isDecision`) com selo dourado e destaque no feed de atividades.
- **FR-005**: O sistema DEVE suportar envio por atalho de teclado `Ctrl+Enter` e `Cmd+Enter`.
- **FR-006**: Os logs de alteração de estado (movimentações de coluna, prioridade, bloqueios, tags) DEVEM ser exibidos como pílulas visuais diff `[Valor Anterior ➔ Valor Novo]`.
- **FR-007**: A linha do tempo DEVE oferecer abas de filtro rápido ("Todas as Atividades", "Apenas Comentários", "Apenas Movimentações", "Decisões do Projeto") e busca textual em tempo real.
- **FR-008**: O sistema DEVE disponibilizar um painel "Spotlight de Decisões" no topo do feed sempre que houver comentários marcados como decisão de projeto.
- **FR-009**: O parser de Markdown DEVE ser imune a ataques XSS, utilizando mapeamento nativo por AST/Regex para componentes React sem utilizar `dangerouslySetInnerHTML`.
- **FR-010**: O sistema DEVE preservar rascunhos de comentários em caso de fechamento acidental de janela (`autoSaveComments` guard).

### Key Entities

- **TaskComment**: Representa um comentário no feed, contendo `id`, `taskId`, `userId`, `userName`, `text`, `createdAt`, `isDecision?: boolean`, e `pinned?: boolean`.
- **TaskActivityLog**: Representa um evento de auditoria no feed, contendo `id`, `taskId`, `userId`, `userName`, `eventType`, `description`, `fromValue?`, `toValue?`, `timestamp`.
- **TimelineFilter**: Filtros disponíveis (`'all'`, `'comments'`, `'activities'`, `'decisions'`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos ícones SVGs renderizados no modal de detalhes da tarefa possuem tamanho exato de `16px-20px`, eliminando totalmente SVGs desproporcionais.
- **SC-002**: O tempo de filtragem e busca no feed da linha do tempo é inferior a 16ms (60 FPS) para tarefas com até 200 itens de histórico.
- **SC-003**: 100% dos testes unitários e de integração (`npm test -- --run`) e a compilação de produção (`npm run build`) passam sem erros.

## Assumptions

- O design do feed é inspirado na ergonomia do ClickUp, adaptado ao tema dark moderno do Metrik.
- O parser de Markdown continua sendo puro e nativo (AST/Regex) para garantir máxima segurança contra XSS e leveza do bundle.
- A persistência local em `localStorage` e a sincronização cloud opt-in com Supabase continuam operando de forma transparente.
