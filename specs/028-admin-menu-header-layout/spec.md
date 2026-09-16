# Feature Specification: Desobstrução e Reorganização do Menu de Administrador e Barra de Métricas

**Feature Branch**: `028-admin-menu-header-layout`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Correção: Quando clico em Administrador, nao consigo ver o que tem na tela, porque a linha onde tem as metricas troughput, leadtime medio... esta tampando. O ideal é reorganizar isso, e melhorar. faça."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abertura limpa e desobstruída do menu de Administrador/Perfil (Priority: P1) 🎯 MVP

Como usuário ou administrador do Metrik, quero clicar no botão de perfil no cabeçalho ("Administrador" ou operador ativo) e visualizar todo o menu suspenso de operadores e squads com total clareza, sem que a barra de métricas (Throughput, Lead Time, Cycle Time, etc.) ou qualquer outro elemento passe por cima ou tampe o conteúdo, para que eu possa alternar de perfil, cadastrar usuários e gerenciar squads com facilidade.

**Why this priority**: É o defeito exato relatado pelo usuário. O menu de perfis e administração fica ilegível e inacessível porque a barra de métricas é renderizada visualmente sobreposta ao menu aberto devido a conflito de empilhamento de camadas (*stacking context* / *z-index*) e proximidade física no topo da tela.

**Independent Test**: Clicar no botão do perfil no cabeçalho superior e verificar se o menu suspenso abre completamente nítido e à frente de todos os elementos subjacentes, permitindo ler as opções e interagir com "Cadastrar Novo Usuário" e "Gerenciar Squads / Times" sem nenhuma oclusão visual.

**Acceptance Scenarios**:

1. **Given** a aplicação Metrik aberta na visão de quadro, **When** o usuário clica no botão do perfil "Administrador" no cabeçalho, **Then** o menu suspenso de perfis abre posicionado acima de qualquer camada subjacente, ficando 100% visível sobre a barra de métricas de fluxo.
2. **Given** o menu de perfis aberto, **When** o usuário observa a região onde passa a barra de métricas, **Then** nenhum texto, badge ou fundo translúcido da barra de métricas corta, sobrepõe ou ofusca o dropdown de usuários.
3. **Given** o menu de perfis aberto, **When** o usuário clica em "Cadastrar Novo Usuário", **Then** o mini-formulário interno abre visível e operável, sem cortes de visualização ou botões escondidos pela barra de métricas.
4. **Given** o menu de perfis aberto, **When** o usuário clica em "Gerenciar Squads / Times", **Then** o menu fecha e o modal de times abre centralizado e desimpedido.
5. **Given** o menu de perfis aberto, **When** o usuário clica fora do menu ou pressiona Escape, **Then** o menu fecha suavemente.

---

### User Story 2 - Reorganização harmoniosa e espaçamento do cabeçalho e controles (Priority: P2)

Como usuário, quero que o cabeçalho superior e os controles da aplicação estejam organizados de forma equilibrada e espaçada, para que os botões de ação e perfil não fiquem excessivamente amontoados e a transição visual para a barra de métricas seja limpa e agradável.

**Why this priority**: O usuário solicitou explicitamente: "O ideal é reorganizar isso, e melhorar". O cabeçalho atual acumula seletor de quadro, visão de analytics, seletor de tema, perfil de usuário, importar, exportar, restaurar demo e limpar quadro em uma única linha densa, disputando espaço com o dropdown.

**Independent Test**: Redimensionar a janela entre resoluções padrão (1280px a 1920px) e observar a distribuição dos botões, garantindo que o agrupamento de ações da sessão (perfil, tema) e ações do quadro (importar/exportar/demo) apresente hierarquia clara, sem quebra desordenada de linhas.

**Acceptance Scenarios**:

1. **Given** o cabeçalho do Metrik, **When** renderizado em telas de desktop (1280px ou superior), **Then** há separação visual clara e espaçamento refinado entre as ações de contexto (visão, temas, usuário) e ações utilitárias do quadro.
2. **Given** a barra de métricas logo abaixo do cabeçalho, **When** o cabeçalho é renderizado, **Then** há um respiro visual vertical adequado (margem/gap) impedindo sensação de sufocamento dos elementos.
3. **Given** telas com largura reduzida (notebooks ou janelas menores), **When** os botões precisam quebrar ou se reorganizar, **Then** o botão do perfil mantém ancoragem e alinhamento estáveis, sem empurrar a barra de métricas para posições anômalas.

---

### User Story 3 - Integridade de empilhamento em todos os temas e visões (Priority: P3)

Como usuário que utiliza diferentes temas visuais (Dark, Light, Slate) e alterna entre Quadro e Analytics, quero que a hierarquia de camadas permaneça consistente em todos os estados da aplicação.

**Why this priority**: O Metrik possui múltiplos temas com regras de `backdrop-filter` e `box-shadow` que afetam o contexto de empilhamento do navegador. A correção não pode regredir em nenhum tema ou visão.

**Independent Test**: Alternar entre os temas do Metrik e entre as visões Quadro e Analytics, acionando o menu do perfil em cada um para garantir que a elevação e contraste se mantenham perfeitos.

**Acceptance Scenarios**:

1. **Given** o tema Claro (Light) ativado, **When** o menu de perfil é aberto, **Then** a sombra e contraste garantem legibilidade total sobre a barra de métricas clara.
2. **Given** o tema Escuro (Dark/Slate) ativado, **When** o menu de perfil é aberto, **Then** o contraste e elevação são preservados sobre a barra de métricas escura.
3. **Given** a visão Analytics ativada, **When** o usuário aciona o perfil no cabeçalho, **Then** o menu também sobrepõe os gráficos e cartões analíticos sem qualquer oclusão.

---

### Edge Cases

- **Dropdown com muitos usuários cadastrados**: O menu possui lista com rolagem interna (`max-height: 240px; overflow-y: auto`) para que nunca ultrapasse a borda inferior da tela.
- **Janela com altura reduzida (ex: 600px)**: O menu se adapta ou rola internamente, permanecendo com os botões de ação acessíveis.
- **Clique rápido durante animação**: A abertura e o fechamento mantêm resposta determinística sem travar o estado de foco.
- **Rolagem do quadro Kanban com menu aberto**: Clicar em qualquer ponto fora do menu fecha o menu imediatamente, restaurando o foco no quadro.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu suspenso de perfil do usuário (`UserProfileMenu`) MUST renderizar com elevação e contexto de empilhamento (`z-index`) superiores a qualquer elemento da barra de métricas (`MetricsBar`) e do quadro.
- **FR-002**: O cabeçalho superior (`app-header`) MUST estabelecer um contexto de posicionamento e empilhamento seguro que impeça que componentes inferiores (como barras com `backdrop-filter`) criem camadas concorrentes sobrepostas aos seus menus suspensos.
- **FR-003**: Todas as opções contidas no menu de perfil (título, lista de usuários, botão de cadastrar novo usuário, botão de gerenciar squads) MUST ser integralmente visíveis e clicáveis quando abertas.
- **FR-004**: A reorganização visual do cabeçalho MUST criar um agrupamento coerente e estético entre controles de sessão/navegação (Quadro/Analytics, Tema, Perfil) e ações operacionais do quadro (Importar, Exportar, Restaurar, Limpar).
- **FR-005**: O botão acionador do perfil MUST apresentar estado ativo claro quando o menu estiver aberto (`aria-expanded="true"` e feedback visual correspondente).
- **FR-006**: O fechamento do menu MUST ocorrer ao clicar fora do componente ou ao pressionar a tecla `Escape`.
- **FR-007**: A barra de métricas (`MetricsBar`) MUST manter sua legibilidade e layout intactos quando o menu estiver fechado, sem perda de alinhamento dos indicadores (Throughput, Lead Time, Cycle Time, Eficiência, Bloqueios).
- **FR-008**: Em nenhuma circunstância o ajuste no cabeçalho MUST causar deslocamento indesejado ou corte na primeira coluna do quadro Kanban.
- **FR-009**: O mini-formulário de cadastro de usuário dentro do dropdown MUST manter inputs e botões perfeitamente operáveis e visíveis acima de qualquer barra inferior.
- **FR-010**: A reorganização MUST manter conformidade estrita com acessibilidade WCAG 2.1 AA (navegação por teclado, rótulos e contraste).

### Requisitos Não-Funcionais

- **NFR-001 [Estética & Usabilidade]**: O visual reorganizado MUST proporcionar aspecto moderno, limpo e premium, eliminando poluição visual no topo da aplicação.
- **NFR-002 [Desempenho]**: A abertura do menu e reorganização MUST operar a 60 fps, sem recálculos pesados de layout durante a interação.
- **NFR-003 [Compatibilidade de Navegadores]**: A paridade de empilhamento e visual MUST ser mantida em Microsoft Edge, Google Chrome, Mozilla Firefox e Safari, respeitando a Feature 026.
- **NFR-004 [Zero Novas Dependências]**: Nenhuma biblioteca externa de menu ou popover deve ser instalada; a solução deve usar CSS nativo e React já existentes.
- **NFR-005 [Independência de Marca]**: Terminologia neutra e institucional em conformidade com as regras do Metrik.

### Key Entities

- **Cabeçalho Principal (`app-header`)**: Contêiner mestre de navegação e controles globais.
- **Menu de Perfil de Usuário (`UserProfileMenu`)**: Dropdown disparado pelo botão do operador ativo ("Administrador" / nome do usuário) com gestão de perfis e squads.
- **Barra de Métricas (`MetricsBar`)**: Faixa com os indicadores de fluxo Kanban posicionada logo abaixo do cabeçalho na visão de quadro.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de visibilidade desobstruída do menu de perfil quando aberto em qualquer resolução acima de 1024px de largura.
- **SC-002**: Zero sobreposições visuais indesejadas da barra de métricas sobre o dropdown de administração.
- **SC-003**: Tempo de interação para alternar de perfil ou acessar o gerenciamento de squads menor que 3 segundos.
- **SC-004**: 100% dos testes unitários e de componentes existentes aprovados sem regressão.
- **SC-005**: Validação visual confirmada no navegador sem artefatos ou recortes indesejados.

---

## Assumptions

- O botão "Administrador" corresponde ao componente `UserProfileMenu` que exibe o nome do perfil ativo (cujo usuário inicial padrão é "Administrador").
- A "linha onde tem as metricas troughput, leadtime medio..." corresponde ao componente `MetricsBar`.
- A causa raiz é o conflito de contexto de empilhamento CSS (*stacking context*) gerado por propriedades como `backdrop-filter` combinadas à ausência de `position: relative` e `z-index` no cabeçalho, somada à proximidade dos elementos.
- A reorganização do cabeçalho deve harmonizar a barra de ferramentas sem remover nenhuma funcionalidade existente (Importar, Exportar, Restaurar Demo, Limpar, etc.).

---

## Fora de Escopo

- Redesenho completo do quadro Kanban ou dos cartões de tarefas.
- Criação de novas métricas de fluxo.
- Alteração no sistema de autenticação ou banco de dados externo (o Metrik continua local-first).
- Transformação do dropdown de perfil em uma página de administração separada.

---

## Dependências

- Feature 023 — perfis de usuário e controle de times (base do `UserProfileMenu`).
- Feature 002 — métricas de fluxo (base da `MetricsBar`).
- Feature 022 — temas visuais (suporte a Dark, Light, Slate).
- Feature 026 — paridade entre navegadores (manter paridade de layout).
