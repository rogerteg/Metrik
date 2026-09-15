# Feature Specification: Hub de Espaços de Trabalho, Quadros Favoritos e Módulo Separado de Configurações

**Feature Branch**: `029-workspace-hub-and-settings`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Faça uma analise do prototipo em anexo, e crie a funcionalidade configurações de forma separada. aplique otmos conceitos de Design."

---

## Clarifications

### Session 2026-09-15

- Q: Como o usuário deve transitar entre o Hub de Espaços de Trabalho e a visualização operacional do Quadro Kanban? → A: Seletor de visualização de alto nível no cabeçalho ("Espaços", "Quadro", "Analytics"), permitindo alternar de contexto a qualquer momento com 1 clique.
- Q: Qual formato visual o Módulo Separado de Configurações deve adotar para oferecer a melhor experiência e estética? → A: Visão dedicada em tela cheia (Full View) com navegação lateral por abas à esquerda e painéis de configuração à direita, com botão claro de "← Voltar ao Hub/Quadro".
- Q: Como os quadros já existentes no Metrik devem ser organizados inicialmente nos novos Espaços de Trabalho? → A: Migração automática transparente: agrupar os quadros existentes em um Espaço de Trabalho inicial ("Geral" / "Principal") com marcador cromático, permitindo criar novos espaços e mover quadros livremente.

---

## 1. Análise do Protótipo de Referência

O protótipo fornecido estabelece uma interface de governança e visão panorâmica de alto nível para múltiplos espaços de trabalho e quadros (Workspace & Board Hub). Mapeamento dos 5 elementos em destaque:

1. **[Elemento 1] Navegação de Espaços de Trabalho (Sidebar Superior)**:
   - Botão de visão geral: *"Todos os espaços de trabalho"* com ícone representativo (Home).
   - Lista vertical de Espaços de Trabalho / Departamentos de negócio (*Gestão, Produção, Projetos Estratégicos, P&D, Contabilidade, Vendas*).
   - Cada espaço possui um marcador visual colorido (bullet/avatar) e um menu de ações rápidas (3 pontinhos), com indicação clara do espaço ativo (*Produção* com destaque cromático).

2. **[Elemento 2] Botão de Ação "+ Novo painel" (Sidebar Inferior)**:
   - Ponto de entrada ergonômico na base da barra lateral para criação de novos espaços ou quadros de trabalho.

3. **[Elemento 3] Seção "Quadros favoritos" (Área Principal Superior)**:
   - Contêiner destacado com ícone de coração, agrupando os cartões de quadros favoritados pelo operador (*ex.: "Projetos do 4º trimestre", "Objetivos estratégicos"*).
   - Cada card apresenta título, menu contextual de 3 pontos, indicador de relógio/tempo (deadlines ou tarefas ativas) e o ícone de coração ativado.

4. **[Elemento 4] Barra de Ações "Meus espaços de trabalho"**:
   - Título de seção com botões circulares em relevo suave (*Floating Action Buttons*): botão de adição rápida (`+`) e botão de gerenciamento/arquivo com badge numérico de contagem.

5. **[Elemento 5] Barra de Filtro em Pílula (Pill Filter)**:
   - Controle de filtro elegante com ícone de funil (*Filtro*) e badge indicador da quantidade de filtros ativos.

- **Área Inferior do Protótipo (Grid do Espaço Ativo)**:
  - Cabeçalho do espaço ativo com ícone de time (*P&D*), botão `+` e menu de opções.
  - Grade de cards representando os quadros pertencentes ao espaço (*IU, Desenvolvimento, QA*), cada um com menu de opções próprio.

- **Requisito Específico do Usuário**:
  - *"Crie a funcionalidade configurações de forma separada. Aplique ótimos conceitos de Design."*
  - O gerenciamento e ajustes da aplicação/quadros não devem ser espremidos em pequenos menus flutuantes ou embutidos de forma confusa. O Metrik deve oferecer um **Painel de Configurações Dedicado em Tela Cheia (Full View)**, com excelente arquitetura da informação em duas colunas, estética premium e categorização clara.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hub Visual de Espaços de Trabalho e Quadros Favoritos (Priority: P1) 🎯 MVP

Como gestor ou membro de equipe que atua em múltiplos projetos e fluxos no Metrik, quero alternar pelo cabeçalho para a visão "Espaços", visualizando a lista dos meus espaços de trabalho na lateral, uma vitrine superior com meus quadros favoritos e a grade de quadros do espaço ativo, para que eu possa alternar de contexto e acessar qualquer fluxo de trabalho com agilidade e visão executiva.

**Why this priority**: É o núcleo estrutural do protótipo analisado. Conecta os espaços de trabalho e os quadros em uma experiência de navegação coesa, eliminando a sensação de confinamento em um único quadro estático.

**Independent Test**: Clicar no botão "Espaços" no alternador de visão do cabeçalho, navegar entre os espaços listados na barra lateral (*Gestão, Produção, P&D, etc.*), verificar a atualização instantânea da grade de quadros do espaço correspondente, e clicar no ícone de coração de qualquer quadro para adicioná-lo ou removê-lo da vitrine superior de "Quadros Favoritos".

**Acceptance Scenarios**:

1. **Given** o cabeçalho superior do Metrik, **When** o usuário clica em "Espaços" no alternador de visualização, **Then** a aplicação renderiza o Hub de Espaços de Trabalho e oculta o quadro Kanban.
2. **Given** a barra lateral do Hub, **When** o usuário observa a lista, **Then** todos os espaços de trabalho cadastrados são exibidos com suas cores de identificação, e o espaço atualmente selecionado apresenta estado ativo com contraste claro.
3. **Given** a seção "Quadros favoritos" no topo do Hub, **When** um ou mais quadros estão marcados como favoritos, **Then** eles são renderizados em cards destacados com ícone de coração ativo, título, menu de opções e atalho de clique para abrir o quadro Kanban correspondente.
4. **Given** um card de quadro no grid principal, **When** o usuário clica no ícone de coração desmarcado, **Then** o quadro é adicionado instantaneamente aos "Quadros favoritos" e seu estado é persistido em `localStorage`.
5. **Given** o espaço de trabalho selecionado na lateral (ex.: *P&D*), **When** a tela é atualizada, **Then** o grid principal exibe os quadros desse espaço (*IU, Desenvolvimento, QA*) com título, menu de 3 pontinhos e atalho de acesso.
6. **Given** o botão "Todos os espaços de trabalho" na lateral, **When** clicado, **Then** a área principal exibe uma visão consolidada de todos os quadros de todos os espaços autorizados para o usuário.

---

### User Story 2 - Módulo Separado e Dedicado de Configurações com Design Premium (Priority: P2)

Como administrador ou operador do Metrik, quero acessar uma visão de Configurações dedicada em tela cheia (Full View), separada do fluxo de tarefas, com layout em duas colunas (menu de abas à esquerda e painel de ajustes à direita) e visual refinado, para que eu possa ajustar parâmetros da aplicação sem poluição visual ou risco de alterações acidentais durante a operação diária.

**Why this priority**: Atende diretamente ao requisito mandatório do usuário: *"crie a funcionalidade configurações de forma separada. aplique otmos conceitos de Design"*. Separa as configurações administrativas operacionais da visão de monitoramento e fluxo de cartões.

**Independent Test**: Clicar no botão "Configurações" no cabeçalho ou na base da barra lateral, verificar a abertura da tela dedicada de Configurações, navegar pelas 4 abas (*Geral & Aparência*, *Espaços & Squads*, *Políticas de Quadros*, *Dados & Portabilidade*), alterar preferências (ex.: tema visual, cor de espaço, limites padrão) e validar que o botão "← Voltar aos Quadros" restaura o contexto operacional com as novas configurações ativas.

**Acceptance Scenarios**:

1. **Given** a aplicação Metrik em qualquer tela, **When** o usuário aciona o botão "Configurações", **Then** a interface navega para a visão dedicada em tela cheia de configurações com layout em duas colunas.
2. **Given** a visão de Configurações aberta, **When** o usuário visualiza a barra lateral de categorias de ajuste, **Then** estão disponíveis 4 seções temáticas claras:
   - **Geral & Aparência**: Seletor de temas (*Dark Enterprise, Light Modern, Slate Minimal*), escala de densidade e preferências visuais.
   - **Espaços de Trabalho & Squads**: Criação, edição de nomes, paleta de cores dos identificadores e permissões de membros (Admin, Member, Guest).
   - **Políticas de Fluxo & Quadros**: Limites WIP sugeridos, tipos de itens de trabalho padrão e bloqueios.
   - **Dados & Portabilidade**: Exportação de backup em JSON, importação de dados, restauração de demonstração e limpeza assistida com confirmação dupla.
3. **Given** a aba de Espaços de Trabalho dentro de Configurações, **When** o usuário altera a cor de identificação de um espaço (ex.: de azul para laranja) e salva, **Then** a cor é atualizada em toda a interface do Hub e indicadores.
4. **Given** a tela de configurações, **When** o usuário clica no botão "← Voltar aos Quadros" ou no logotipo Metrik, **Then** retorna exatamente para o espaço ou quadro em que estava trabalhando.

---

### User Story 3 - Criação, Migração e Filtro de Espaços e Quadros (Priority: P3)

Como usuário do Metrik, quero que meus quadros existentes sejam migrados automaticamente para a estrutura de espaços de trabalho no primeiro acesso, e quero utilizar a barra de filtros em pílula para localizar quadros rapidamente e o botão "+ Novo painel" para criar novos espaços com facilidade.

**Why this priority**: Garante retrocompatibilidade transparente (zero perda de dados pré-existentes) e complementa a usabilidade executiva do protótipo (Elementos 2, 4 e 5).

**Independent Test**: Abrir a aplicação com quadros já salvos em `localStorage`, verificar que foram agrupados sob o espaço de trabalho inicial padrão sem perda de dados; digitar um termo na barra de filtro em pílula e verificar o isolamento em tempo real dos quadros correspondentes; clicar em "+ Novo painel" e registrar um novo espaço com nome e cor definida.

**Acceptance Scenarios**:

1. **Given** uma base existente de quadros locais, **When** o Metrik é carregado pela primeira vez na versão do Hub, **Then** todos os quadros preexistentes são associados a um espaço padrão inicial ("Geral" ou squad ativa), preservando tarefas, colunas e métricas.
2. **Given** a barra de filtros no Hub, **When** o usuário digita um nome de quadro ou seleciona uma tag de filtro, **Then** tanto a vitrine de favoritos quanto o grid de quadros exibem apenas os cartões correspondentes.
3. **Given** o botão "+ Novo painel" na barra lateral inferior, **When** clicado, **Then** um modal limpo permite criar um novo espaço de trabalho (informando nome, descrição e cor temática) ou criar um novo quadro vinculado a um espaço existente.
4. **Given** qualquer card de quadro no grid, **When** o usuário clica no menu de 3 pontinhos, **Then** são exibidas ações operacionais: *Abrir Quadro, Adicionar/Remover dos Favoritos, Renomear, Duplicar Quadro e Arquivar*.

---

### Edge Cases

- **Nenhum quadro favoritado**: A seção "Quadros favoritos" exibe um estado vazio (*empty state*) acolhedor com ilustração sutil e a mensagem *"Você ainda não possui quadros favoritos. Clique no ícone de coração em qualquer quadro para fixá-lo aqui."*
- **Espaço de trabalho recém-criado sem quadros**: O grid exibe um card de ação pontilhada com botão *"Criar primeiro quadro neste espaço"*.
- **Telas estreitas ou notebooks (1024px a 1280px)**: A barra lateral de espaços pode ser recolhida (*colapsável*) em uma coluna compacta de ícones coloridos, liberando espaço integral para o grid de quadros.
- **Muitos espaços cadastrados (ex.: mais de 15)**: A lista da barra lateral possui rolagem vertical suave com `scrollbar` estilizada para não sobrepor o botão fixo "+ Novo painel".
- **Usuário com papel Convidado (Guest)**: As opções de criação, edição e exclusão de espaços no painel de configurações são desabilitadas com indicação de que apenas administradores possuem permissão de mutação (Constitution VIII).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Metrik MUST disponibilizar um seletor de visualização no cabeçalho com opções de topo (`Espaços`, `Quadro`, `Analytics`), permitindo alternar instantaneamente com 1 clique para a visão panorâmica "Hub de Espaços de Trabalho".
- **FR-002**: A barra lateral MUST listar todos os Espaços de Trabalho ativos aos quais o usuário tem acesso, com seus respectivos indicadores visuais cromáticos (cores personalizadas) e contagem de quadros.
- **FR-003**: A barra lateral MUST conter a opção de topo "Todos os espaços de trabalho" para consolidação geral.
- **FR-004**: A seção superior do Hub MUST exibir a área "Quadros favoritos" com cards elevados dos quadros marcados com o ícone de coração.
- **FR-005**: O operador MUST poder marcar ou desmarcar qualquer quadro como favorito com um único clique no ícone de coração, com persistência imediata no `localStorage`.
- **FR-006**: A área intermediária do Hub MUST conter a barra de ações com título "Meus espaços de trabalho", botões de ação rápida e barra de pesquisa/filtro em formato de pílula (*pill filter*).
- **FR-007**: A área principal MUST renderizar os quadros pertencentes ao espaço de trabalho atualmente selecionado, incluindo título, status, contagem de tarefas e menu contextual de opções (3 pontinhos).
- **FR-008**: A funcionalidade de **Configurações MUST ser implementada como uma visão dedicada em tela cheia (Full View)**, com navegação lateral por abas temáticas à esquerda, painel de controles e cartões à direita e botão claro "← Voltar aos Quadros", nunca sobrecarregando o cabeçalho nem misturando ações de configuração no meio do fluxo diário de tarefas.
- **FR-009**: O Módulo Separado de Configurações MUST ser estruturado nas 4 abas semânticas: (1) Geral & Aparência, (2) Espaços de Trabalho & Squads, (3) Políticas de Quadros e (4) Dados, Backup & Portabilidade.
- **FR-010**: O botão "+ Novo painel" na base da barra lateral e os botões contextuais `+` MUST permitir o cadastro simplificado de novos espaços e quadros com validação de campos obrigatórios.
- **FR-011**: O sistema MUST manter total conformidade com as diretrizes de acessibilidade WCAG 2.1 AA (navegação por teclado, rótulos ARIA explícitos, suporte a leitores de tela e contraste cromático verificado em todos os temas).
- **FR-012**: Todas as preferências de espaços de trabalho, favoritos, ordenação e configurações globais MUST operar sob o modelo soberano Local-First (Constituição VIII), persistindo em `localStorage` sem depender de servidores remotos.
- **FR-013**: O sistema MUST realizar a migração automática transparente dos quadros preexistentes no `localStorage`, agrupando-os no primeiro carregamento em um Espaço de Trabalho inicial padrão ("Geral" ou squad ativa) com identificador cromático dedicado, permitindo criar novos espaços e reatribuir quadros sem nenhuma perda de dados.

### Non-Functional Requirements

- **NFR-001 [Aesthetics & Design System]**: A interface MUST seguir os mais altos padrões de design moderno: paleta HSL balanceada, modo escuro e claro consistentes, bordas sutis (`border-subtle`), elevação em camadas (*shadow-sm*, *shadow-md*), glassmorphism refinado e transições fluidas a 60 fps.
- **NFR-002 [Brand Independence - Constituição VII]**: O Metrik é um produto autônomo e proprietário. Zero menções a ferramentas ou marcas externas no código, DOM, comentários ou textos de interface.
- **NFR-003 [Simplicity & YAGNI - Constituição V]**: Implementar sem bibliotecas externas pesadas adicionais; utilizar React 19, TypeScript e CSS nativo existente.
- **NFR-004 [Cross-Browser Parity - Constituição II / Feature 026]**: Layout e interações MUST apresentar comportamento idêntico e consistente em Microsoft Edge, Google Chrome, Mozilla Firefox e Safari.
- **NFR-005 [Desempenho de Troca de Contexto]**: A troca entre espaços de trabalho no Hub e a transição para o módulo de Configurações MUST ocorrer em tempo inferior a 100ms.

---

### Key Entities

- **Espaço de Trabalho (`Workspace`)**:
  - `id`: Identificador único (string).
  - `name`: Nome do espaço (ex.: "Gestão", "Produção", "P&D").
  - `color`: Cor identificadora hex/hsl do marcador visual.
  - `icon`: Ícone associado (ou avatar).
  - `boardIds`: Lista de IDs de quadros pertencentes a este espaço.
  - `teamId`: Identificador da equipe/squad proprietária (vinculado à Feature 023).
  - `createdAt`: Timestamp ISO de criação.

- **Quadro Favorito (`FavoriteBoard`)**:
  - `boardId`: Identificador do quadro favoritado.
  - `userId`: Identificador do usuário que favoritou (para suporte multi-usuário local).
  - `favoritedAt`: Timestamp de inclusão nos favoritos.

- **Módulo de Configurações (`AppSettings`)**:
  - `activeTab`: Aba ativa (`general`, `workspaces`, `boards`, `data`).
  - `theme`: Tema visual selecionado (`dark`, `light`, `slate`).
  - `density`: Densidade de visualização dos cards (`compact`, `comfortable`).
  - `defaultWipLimit`: Limite WIP padrão sugerido para novas colunas.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tempo de alternância entre diferentes espaços de trabalho no Hub inferior a 100 milissegundos.
- **SC-002**: 100% dos quadros marcados como favoritos aparecem na vitrine "Quadros favoritos" de forma síncrona e permanecem salvos após recarregar a página.
- **SC-003**: Acesso ao Painel de Configurações separado e retorno ao Hub/Quadro realizável em 1 clique claro a partir do menu principal ou cabeçalho.
- **SC-004**: 100% dos testes unitários da aplicação aprovados com zero regressões em relação à suíte existente.
- **SC-005**: Conformidade visual rigorosa com o protótipo fornecido, alcançando índice de satisfação visual elevado e estética enterprise limpa.

---

## Assumptions

- Os espaços de trabalho agrupam os quadros existentes no Metrik (estendendo e organizando o modelo de múltiplos quadros da Feature 010 e o controle de equipes da Feature 023).
- O módulo de Configurações absorve com elegância as ações utilitárias (Importar dados, Exportar dados, Restaurar demo, Gerenciar equipes e Selecionar temas), permitindo que o cabeçalho do quadro principal permaneça limpo e focado no fluxo de trabalho diário.
- A persistência é realizada no cliente via `localStorage` com tratamento resiliente de erros e isolamento de dados por usuário ativo.

---

## Fora de Escopo

- Autenticação por servidor em nuvem ou banco de dados externo (o Metrik continua 100% Local-First).
- Redesenho da lógica de cálculo dos gráficos de fluxo (CFD, Scatter Plot, Monte Carlo permanecem íntegros).
- Sincronização multi-dispositivo via WebSockets (fora do escopo desta feature).

---

## Dependências

- Feature 010 — Suporte a múltiplos quadros (`Multi-Board`).
- Feature 023 — Controle de acesso e equipes (`Team Access Control`).
- Feature 022 — Configuração de temas (`Theme Configuration`).
- Feature 028 — Desobstrução do cabeçalho e clusters de navegação.
