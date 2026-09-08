# Feature Specification: Core Kanban Board (MVP Fase 1)

**Feature Branch**: `001-core-kanban-board`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "MVP Metrik Fase 1: Quadro Kanban multi-coluna (Todo, In Progress, Blocked, Completed) com tarefas editáveis e persistência local"

## Clarifications

### Session 2026-09-08
- Q: Como o sistema deve tratar um novo cartão criado se o usuário perder o foco (blur) sem digitar nenhum título? → A: Opção A — Exclusão Automática: se o usuário não digitar nada e clicar fora, o cartão vazio é descartado imediatamente para evitar acúmulo de dados vazios.
- Q: Como o usuário deve disparar a mudança de coluna de uma tarefa nesta Fase 1 (MVP inicial)? → A: Opção A — Botões Direcionais Rápidos: botões discretos no cartão (← e →) permitindo transição imediata para a coluna adjacente no fluxo.
- Q: A exclusão individual de uma tarefa deve exigir confirmação prévia ou ser instantânea com um clique? → A: Opção A — Exclusão Imediata: um clique na lixeira remove a tarefa imediatamente sem diálogo modal, reservando confirmação exclusivamente para o botão global "Clear Tasks".

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização do Quadro Multi-Coluna (Priority: P1)

Como usuário do Metrik, quero visualizar um quadro organizado em 4 colunas essenciais (`Todo`, `In Progress`, `Blocked`, `Completed`) com identidade visual e badges claras, para que eu possa ter visibilidade imediata de todo o fluxo de trabalho e gargalos.

**Why this priority**: É a espinha dorsal visual e funcional da metodologia Kanban. Sem a estrutura de colunas e diferenciação de estados, nenhuma outra funcionalidade pode operar.

**Independent Test**: Carregar a aplicação no navegador e verificar se as 4 colunas estão renderizadas, com seus respectivos títulos, contadores e esquemas de cores (cinza, azul, vermelho e verde).

**Acceptance Scenarios**:
1. **Given** que o usuário acessa o Metrik pela primeira vez, **When** a página carrega, **Then** as 4 colunas (`Todo`, `In Progress`, `Blocked`, `Completed`) são exibidas lado a lado em telas médias/largas e de forma empilhada responsiva em telas móveis.
2. **Given** o quadro renderizado, **When** o usuário observa a coluna `Blocked`, **Then** ela possui destaque visual diferenciado (badge/borda vermelha) para alertar sobre itens impedidos.

---

### User Story 2 - Criação e Edição Atômica de Tarefas (Priority: P1)

Como usuário, quero adicionar rapidamente uma nova tarefa com um único clique e editar seu conteúdo diretamente no próprio cartão com auto-redimensionamento, além de poder excluí-la, para que a gestão das minhas atividades seja instantânea e sem atrito.

**Why this priority**: É o cerne da entrada de dados do usuário. Se adicionar e editar cartões for lento ou exigir modais pesados, a adesão ao quadro é comprometida.

**Independent Test**: Clicar no botão `+` de qualquer coluna, digitar o título de uma tarefa na textarea com redimensionamento automático e verificar se o texto permanece sem necessidade de botão "Salvar". Em seguida, clicar no ícone de lixeira e confirmar que a tarefa é removida.

**Acceptance Scenarios**:
1. **Given** uma coluna qualquer no quadro, **When** o usuário clica no botão de adicionar tarefa (`+`), **Then** um novo cartão é inserido imediatamente no topo da coluna com foco de digitação aberto.
2. **Given** um cartão de tarefa existente, **When** o usuário clica e digita um novo texto com várias linhas, **Then** a área de texto se ajusta dinamicamente à altura do conteúdo sem barras de rolagem internas incômodas.
3. **Given** um cartão de tarefa, **When** o usuário clica no botão de exclusão (ícone de lixeira), **Then** o cartão é removido imediatamente da respectiva coluna.

---

### User Story 3 - Persistência Local Reativa (LocalStorage) (Priority: P1)

Como usuário, quero que todas as tarefas criadas, editadas ou excluídas sejam salvas automaticamente no armazenamento local (`localStorage`), para que meu trabalho nunca seja perdido ao recarregar ou fechar o navegador.

**Why this priority**: Permite entregar um MVP funcional e completo instantaneamente (Zero-Config Backend), possibilitando uso real no dia a dia sem depender de infraestrutura externa.

**Independent Test**: Criar tarefas personalizadas nas colunas, fechar a aba ou recarregar a página (`F5`), e comprovar que todas as tarefas retornam exatamente no mesmo estado e coluna.

**Acceptance Scenarios**:
1. **Given** que o usuário alterou o título de uma tarefa na coluna `In Progress`, **When** a página é recarregada imediatamente, **Then** a tarefa reaparece com o título atualizado na mesma coluna.
2. **Given** um primeiro acesso onde o `localStorage` está limpo, **When** a aplicação inicializa, **Then** tarefas de demonstração amigáveis (*seed data*) são carregadas para guiar o usuário.

---

### User Story 4 - Transição de Estado entre Colunas (Priority: P2)

Como usuário, quero mover tarefas entre as colunas (`Todo` → `In Progress` → `Blocked` → `Completed`), para que o fluxo de entrega do trabalho reflita fielmente o progresso real.

**Why this priority**: Fecha o ciclo clássico de vida do Kanban. Mesmo antes do motor completo de Drag-and-Drop, o usuário precisa ter a capacidade de transicionar o status de um item.

**Independent Test**: Selecionar uma tarefa em `Todo` e acionar a transição para `In Progress` e posteriormente para `Completed`, validando a mudança de coluna e contador.

**Acceptance Scenarios**:
1. **Given** uma tarefa na coluna `Todo`, **When** o usuário aciona o movimento para a próxima coluna, **Then** a tarefa é transferida para `In Progress` e os contadores de ambas as colunas são atualizados.
2. **Given** uma tarefa em `In Progress` que encontrou um impedimento, **When** ela é movida para `Blocked`, **Then** a tarefa adquire o status e cor de alerta de bloqueio.

---

### User Story 5 - Ações Globais e Limpeza Segura (Priority: P3)

Como usuário, quero poder reiniciar ou limpar todas as tarefas do quadro com confirmação de segurança, para poder recomeçar um novo ciclo de planejamento do zero.

**Why this priority**: Evita que o usuário precise apagar dezenas de cartões manualmente um a um quando quiser um quadro limpo.

**Independent Test**: Clicar no botão "Clear Tasks", confirmar o prompt de diálogo e verificar que o quadro é esvaziado.

**Acceptance Scenarios**:
1. **Given** um quadro preenchido com tarefas, **When** o usuário clica em "Clear Tasks" e confirma a caixa de diálogo, **Then** todos os cartões de todas as colunas são limpos do estado e do `localStorage`.
2. **Given** a caixa de diálogo de confirmação aberta, **When** o usuário cancela a ação, **Then** nenhum cartão é removido.

---

### Edge Cases

- **Títulos Excessivamente Longos**: Cartões com mais de 500 caracteres devem quebrar linha apropriadamente (`word-break: break-word`) sem vazar os limites da coluna nem distorcer o grid.
- **Armazenamento Local Corrompido ou Indisponível**: Se o JSON no `localStorage` estiver inválido ou se o usuário estiver em modo anônimo restritivo, o sistema deve capturar a exceção com segurança (`try/catch`), restabelecer o estado inicial limpo e alertar o usuário sem travar a interface.
- **Ações Rápidas Concorrentes**: Criação ou exclusão rápida de múltiplos cartões não deve causar race condition de estado nem duplicar identificadores (IDs gerados via UUID v4).
- **Conteúdo em Branco / Espaços**: Se o usuário criar um cartão e deixar o título inteiramente em branco, o cartão permanece editável com um placeholder visível ("Nova tarefa...") ou pode ser removido ao perder o foco se vazio.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir 4 colunas nomeadas exatamente: `Todo`, `In Progress`, `Blocked`, e `Completed`.
- **FR-002**: Cada coluna DEVE possuir um badge com esquema de cores padronizado:
  - `Todo`: Cinza / Neutro
  - `In Progress`: Azul / Primário
  - `Blocked`: Vermelho / Alerta
  - `Completed`: Verde / Sucesso
- **FR-003**: Cada coluna DEVE exibir a contagem total de cartões atualmente contidos nela.
- **FR-004**: O usuário DEVE poder criar uma nova tarefa na coluna através de um botão `+` dedicado.
- **FR-005**: Cada tarefa DEVE possuir um identificador único imutável (`id` tipo UUID v4).
- **FR-006**: A edição do título da tarefa DEVE ser inline, sem necessidade de abertura de modal secundário.
- **FR-007**: A área de texto de cada tarefa DEVE auto-redimensionar sua altura com base no conteúdo digitado.
- **FR-008**: O usuário DEVE poder excluir uma tarefa individualmente através de botão de remoção no cartão.
- **FR-009**: O estado completo do quadro DEVE ser serializado e sincronizado reativamente no `localStorage` sob a chave `metrik_kanban_tasks`.
- **FR-010**: O sistema DEVE inicializar com um conjunto demonstrativo de tarefas caso o `localStorage` esteja vazio.
- **FR-011**: O sistema DEVE permitir a transição de tarefas entre as colunas sem perda do conteúdo.
- **FR-012**: O sistema DEVE fornecer um botão de controle global para limpeza de tarefas com diálogo de confirmação.
- **FR-013**: Ao perder o foco (evento blur), se o título de uma tarefa recém-criada estiver vazio ou contiver apenas espaços em branco, o sistema DEVE descartar e remover o cartão imediatamente para evitar poluição de dados no armazenamento.
- **FR-014**: Cada cartão de tarefa DEVE disponibilizar botões direcionais rápidos (`←` e `→`) para transição direta entre colunas adjacentes (`Todo` ↔ `In Progress` ↔ `Blocked` ↔ `Completed`).

---

### Key Entities

- **TaskModel**:
  - `id` (string, UUID v4): Identificador único do cartão.
  - `title` (string): Conteúdo textual do cartão.
  - `column` (ColumnType enum: `TO_DO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`): Coluna/status atual da tarefa.
  - `color` (string opcional): Cor temática ou tag visual associada.
  - `createdAt` (timestamp ISO 8601): Data de criação da tarefa.
- **ColumnModel**:
  - `type` (ColumnType): Tipo/status da coluna.
  - `title` (string): Nome legível da coluna.
  - `tasks` (array de TaskModel): Lista ordenada de tarefas pertencentes à coluna.
- **BoardState**:
  - Coleção indexada ou agrupada de tarefas persistidas no `localStorage`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Velocidade de Entrada)**: O usuário consegue criar e nomear uma nova tarefa em menos de 3 segundos com zero recarga de tela.
- **SC-002 (Persistência 100% Determinística)**: 100% das alterações realizadas no quadro são restauradas com precisão após recarga de página (`F5`).
- **SC-003 (Visibilidade Imediata de Gargalos)**: Tarefas na coluna `Blocked` são identificáveis visualmente em menos de 1 segundo de inspeção do quadro devido ao esquema de cores de alerta.
- **SC-004 (Responsividade da Interface)**: O layout adapta-se fluidamente de 4 colunas em telas de desktop (>=1024px) para visualização confortável em telas menores (mobile/tablet).

---

## Assumptions

- **Persistência Inicial**: O MVP da Fase 1 utiliza `localStorage` do navegador para persistência de dados do usuário local; a integração com backend/banco de dados em nuvem fará parte de fases posteriores.
- **Dispositivos Alvo**: O quadro é projetado primariamente para navegadores modernos (Chrome, Edge, Firefox, Safari) com suporte a CSS Grid/Flexbox e Web Storage API.
- **Tecnologia de UI**: Implementado em conformidade com as diretrizes do projeto (HTML semântico, TypeScript/React, Vanilla CSS / Chakra UI tokens e princípios de código limpo).
