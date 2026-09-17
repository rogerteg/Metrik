# Feature Specification: Gerenciamento Premium de Quadros e Espaços (Aba Gerenciar)

**Feature Branch**: `031-premium-board-management`  
**Created**: 2026-09-17  
**Status**: Ready for Planning  
**Input**: User description: "Melhore a aba Gerenciar. Faça algo com uma melhor visualização. Ajuste na tela, faça algo mais premium."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização em Grade Premium e Métricas de Quadros (Priority: P1) 🎯 MVP

Como usuário ou líder de squad do Metrik, quero acessar a área de Gerenciamento de Quadros através de uma aba dedicada no cabeçalho superior ou pelo botão do seletor, visualizando todos os meus quadros em uma tela ampla, organizada e elegante com cartões interativos e métricas de fluxo (número de tarefas, colunas, status ativo e squad responsável), para que eu tenha visibilidade imediata da minha operação sem a sobrecarga de caixas de diálogo apertadas.

**Why this priority**: A experiência anterior utilizava uma caixa de diálogo modal legada de 540px que restringia a visualização, carecia de telemetria e não transmitia a sofisticação do Metrik Design System. Transformar a visualização em uma aba dedicada ampla e responsiva é a essência direta da solicitação do usuário.

**Independent Test**: Clicar na nova aba "Gerenciar" no cabeçalho superior em resolução de 1920x1080 e 1366x768, verificar a exibição de cartões de quadros com tags de squad, contador de colunas e tarefas, e alternar para o quadro desejado com 1 clique.

**Acceptance Scenarios**:
1. **Given** múltiplos quadros cadastrados no sistema, **When** o usuário clica na aba "Gerenciar" no cabeçalho superior ou no botão "Gerenciar" junto ao seletor de quadros, **Then** a aplicação renderiza a visualização em tela cheia com cartões contendo: nome, indicador de quadro ativo, badge de squad/time com cor temática, contador de colunas e contagem de itens de trabalho ativos.
2. **Given** a grade de quadros renderizada, **When** o usuário clica no botão "Abrir Quadro" ou diretamente no cartão, **Then** o sistema define o quadro como ativo e navega diretamente para a visualização do Kanban (`view = 'board'`).
3. **Given** o quadro atualmente selecionado no sistema, **When** visualizado no Gerenciador, **Then** ele exibe um badge visual distintivo de "Quadro Ativo" com destaque temático luminoso (glow) e borda acentuada.

---

### User Story 2 - Criação, Edição Rápida e Exclusão Segura de Quadros (Priority: P2)

Como administrador ou membro de equipe com permissão, quero criar novos quadros com formulário moderno e presets, renomear quadros inline com feedback instantâneo e excluir quadros não utilizados através de um diálogo modal seguro e elegante, para que a governança de quadros seja ágil e livre de erros acidentais.

**Why this priority**: A manutenção do ciclo de vida dos quadros (criar, editar nome, reatribuir squad, deletar) precisa ser fluida, segura e substituir alertas nativos do navegador (`window.confirm`) por diálogos integrados e consistentes.

**Independent Test**: Criar um novo quadro associado a uma squad através da barra de criação rápida, editar o nome de um quadro existente via campo interativo, e disparar a exclusão de um quadro conferindo o modal de confirmação com aviso de impacto.

**Acceptance Scenarios**:
1. **Given** a barra de ações de criação no gerenciador, **When** o usuário digita o nome do quadro, seleciona a squad de destino e confirma, **Then** o novo quadro é criado imediatamente com colunas padrão de fluxo, persistido no armazenamento local e adicionado à grade com destaque visual de novidade.
2. **Given** um cartão de quadro na grade, **When** o usuário clica na ação de editar/renomear, **Then** o título se transforma em um campo de entrada focado, permitindo salvar com Enter ou descartar com Escape.
3. **Given** a tentativa de excluir um quadro contendo tarefas, **When** o usuário clica em "Excluir", **Then** a aplicação exibe um diálogo modal de confirmação seguro estilizado (sem `window.confirm`), detalhando o total de tarefas que serão removidas e impedindo a exclusão caso reste apenas 1 quadro no sistema.

---

### User Story 3 - Busca em Tempo Real, Filtragem por Squad e Alternância Dual de Visualização (Priority: P3)

Como gestor de múltiplas squads ou portfólios, quero pesquisar quadros por nome em tempo real, filtrar por squad ou espaço de trabalho e alternar entre visualização em Grade de Cartões e Tabela Compacta de alta densidade, para que eu possa localizar e gerenciar rapidamente dezenas de quadros em organizações de grande porte.

**Why this priority**: À medida que times e projetos escalam, listas não filtradas tornam-se ineficientes; filtros rápidos e visualização densa em tabela garantem flexibilidade tanto para inspeção visual quanto para governança corporativa.

**Independent Test**: Digitar um termo no campo de busca e constatar a filtragem instantânea (< 50ms) da grade; selecionar um filtro de squad e conferir apenas os quadros pertencentes àquela equipe; alternar para o modo tabela e verificar alinhamento e ordenação de colunas.

**Acceptance Scenarios**:
1. **Given** uma lista com diversos quadros de diferentes squads, **When** o usuário digita no campo de busca, **Then** a visualização filtra instantaneamente os cartões ou linhas correspondentes sem recarregar a tela.
2. **Given** o seletor de filtro por Squad/Time, **When** uma squad específica é selecionada, **Then** somente os quadros vinculados àquela squad permanecem visíveis, com contador de itens filtrados atualizado.
3. **Given** o alternador de visualização (Grade de Cartões vs Tabela Compacta), **When** o usuário clica no modo Tabela, **Then** os quadros são dispostos em linhas elegantes com colunas de Nome, Squad, Tarefas, Colunas e Ações Rápidas.

---

### Edge Cases

- **Nenhum quadro existente / primeiro acesso**: Exibir estado vazio (*empty state*) acolhedor com ilustração vetorial elegante, mensagem explicativa e botão de ação primária em destaque para criar o primeiro quadro.
- **Usuário Convidado (*Guest Role*)**: Desabilitar e ocultar controles de criação, renomeação e exclusão de quadros de acordo com a Constituição VIII (Role-Based Confinement), mantendo apenas a capacidade de inspecionar e alternar entre quadros autorizados.
- **Nomes de quadros muito longos**: Truncar suavemente com reticências (`ellipsis`) em títulos que excedam a largura do cartão, exibindo tooltip flutuante nativo com o nome completo ao passar o mouse.
- **Quadro único no sistema**: Desativar visualmente o botão de exclusão com tooltip explicativo informando que o Metrik exige ao menos um quadro ativo.
- **Resoluções móveis ou janelas compactas (< 768px)**: A grade de cartões deve colapsar de 3/4 colunas para 1 coluna fluida com rolagem vertical suave e barra de busca redimensionável.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST fornecer uma interface de Gerenciamento de Quadros com layout de tela cheia/canvas responsivo, eliminando a restrição de largura fixa de 540px da janela modal legada.
- **FR-002**: O sistema MUST disponibilizar ponto de entrada como uma aba de navegação dedicada no cabeçalho superior (`Espaços | Quadro | Analytics | Gerenciar | Configurações`), mantendo o botão "Gerenciar" do seletor de quadros sincronizado para alternar diretamente para esta aba.
- **FR-003**: Cada cartão de quadro na grade MUST exibir o nome do quadro, indicador visual se é o quadro atualmente em exibição (*Active Board*), tag de Squad/Time correspondente e resumo quantitativo de tarefas e colunas.
- **FR-004**: O sistema MUST permitir a seleção imediata de qualquer quadro com 1 clique, atualizando o estado do quadro ativo e navegando automaticamente para o Kanban correspondente.
- **FR-005**: O sistema MUST disponibilizar barra de criação de novos quadros com suporte à vinculação opcional a uma squad ativa do usuário.
- **FR-006**: O sistema MUST fornecer edição rápida (*inline edit*) do nome do quadro com validação de campo obrigatório e cancelamento por tecla Escape.
- **FR-007**: O sistema MUST substituir qualquer chamada a `window.confirm` ou `alert` nativos por um diálogo modal de confirmação estilizado segundo o Metrik Design System para operações destrutivas de exclusão.
- **FR-008**: O sistema MUST impedir a exclusão do último quadro remanescente na aplicação.
- **FR-009**: O sistema MUST fornecer campo de pesquisa textual em tempo real para filtragem instantânea de quadros por nome.
- **FR-010**: O sistema MUST fornecer filtro seletor por Squad/Time para exibir apenas quadros pertencentes à equipe selecionada ou a todas as equipes.
- **FR-011**: O sistema MUST fornecer um alternador de modo de exibição entre Grade de Cartões Premium (com telemetria de fluxo, métricas e cores de squads) e Tabela Compacta de alta densidade com colunas estruturadas.
- **FR-012**: Todas as cores, tipografia, espaçamentos, elevações e sombras MUST utilizar estritamente as variáveis do Metrik Design System (`--bg-primary`, `--bg-elevated`, `--text-primary`, `--accent-color`, etc.), garantindo suporte impecável aos temas claro e escuro.
- **FR-013**: A interface MUST cumprir o Princípio VII da Constituição (Brand Independence), utilizando apenas nomenclatura científica e proprietária do Metrik sem menções a ferramentas comerciais de terceiros.

---

### Key Entities

- **BoardModel**: Entidade representativa do quadro Kanban, contendo identificador único (`id`), nome (`name`), colunas de fluxo (`columns`), tarefas agrupadas por coluna (`tasks`), identificador de equipe associada (`teamId`) e carimbos de data/hora.
- **Team**: Entidade que define a Squad/Equipe proprietária do quadro, com identificador (`id`), nome da squad (`name`) e lista de membros com papéis de acesso (`members`).
- **BoardSummaryMetrics**: Projeção computada para cada quadro contendo o total de colunas, contagem total de tarefas, quantidade de tarefas em andamento (WIP) e indicador booleano de atividade (`isActive`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo necessário para um usuário localizar e alternar para qualquer quadro em um ambiente com 15+ quadros diminui em pelo menos 50% através da busca em tempo real e layout em grade/tabela.
- **SC-002**: A interface de gerenciamento adapta-se fluidamente em 100% das resoluções testadas (de 375px a 2560px de largura) sem cortes de texto, sobreposição de elementos ou barras de rolagem horizontais indesejadas.
- **SC-003**: 100% dos diálogos de exclusão e mensagens de validação utilizam componentes de interface consistentes do Metrik Design System, com zero chamadas a `window.alert()` ou `window.confirm()`.
- **SC-004**: O contraste visual de todos os textos, cartões e badges atinge conformidade total com as diretrizes WCAG 2.1 AA em ambos os temas (Light e Dark).
- **SC-005**: 100% dos testes automatizados unitários e de integração para os novos componentes de gerenciamento passam com sucesso no Vitest.

---

## Assumptions

- O usuário já possui os dados de quadros e squads persistidos localmente no `localStorage` sob o modelo Local-First (Constituição VIII).
- O sistema de controle de acesso (TBAC) estabelecido na Feature 023 é mantido: usuários só gerenciam e visualizam quadros das squads das quais participam (exceto perfil Administrador com acesso global).
- A criação de quadros continuará inicializando o quadro com as colunas padrão de fluxo (`todo`, `in_progress`, `done`) sem necessidade de configurar colunas na etapa de criação inicial.
