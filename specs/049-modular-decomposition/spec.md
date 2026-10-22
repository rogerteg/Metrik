# Feature Specification: Decomposição de Módulos Extensos (OPP-002)

**Feature Branch**: `049-modular-decomposition`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Opção 2: Fase 1 do Roadmap — Decomposição de Módulos Extensos (OPP-002)"

---

## Contexto e Escopo

No diagnóstico de saúde sistêmica do Metrik (Feature 043 / `specs/043-system-health-and-roadmap`), o item **OPP-002** identificou quatro módulos centrais de interface e gerenciamento de estado com acúmulo excessivo de responsabilidades e tamanho físico superior a 700 linhas:
1. `src/components/Task.tsx` (907 linhas) — renderização do cartão Kanban, badges de SLE, cycle time, bloqueios, dependências, indicadores visuais e menus de contexto.
2. `src/App.tsx` (762 linhas) — orquestração raiz, cabeçalho, roteamento de visões analíticas, modais globais e conexões de gavetas.
3. `src/components/TaskDetailsModal.tsx` (728 linhas) — edição de detalhes da tarefa, guarda de rascunhos sujos, abas de atividade, comentários, checklists e assistência de IA.
4. `src/hooks/useTaskCollection.ts` (751 linhas) — orquestração de coleções de tarefas, movimentações de coluna, reordenações relativas, persistência local e sincronização.

A meta mandatória estabelecida no roadmap é decompor esses quatro módulos em componentes e submódulos coesos, auto-contidos e testáveis, garantindo que **nenhum módulo exceda 400 linhas de código**, preservando 100% dos comportamentos funcionais, a densidade visual e a integridade de todos os testes existentes sem nenhuma regressão.

---

## Clarifications

### Session 2026-10-21
- Q: Como os subcomponentes extraídos de `Task.tsx` e `TaskDetailsModal.tsx` devem ser organizados na estrutura de diretórios do projeto? → A: Pastas modulares dedicadas (`src/components/Task/` e `src/components/TaskDetailsModal/`) contendo os subcomponentes atômicos e mantendo o ponto de entrada raiz reexportando ou orquestrando como fachada retrocompatível.
- Q: Como as operações de mutação e regras de negócio do hook `useTaskCollection.ts` devem ser segregadas para reduzir o arquivo abaixo de 400 linhas? → A: Padrão Fachada (*Facade Pattern*), compondo sub-hooks ou utilitários especialistas internamente e preservando 100% da assinatura pública para todos os componentes consumidores.
- Q: Qual estratégia de segregação deve ser adotada para reduzir o componente raiz `App.tsx` abaixo de 400 linhas? → A: Extração de submódulos de casca: segregar diálogos e gavetas globais em `AppDialogsContainer.tsx` e a navegação/ações em `AppHeaderBar.tsx`, mantendo `App.tsx` como orquestrador puro de layout (< 300 linhas).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decomposição Modular do Cartão Kanban `Task.tsx` (Priority: P1)

Como desenvolvedor ou mantenedor do Metrik trabalhando no quadro Kanban,
quero que o componente `Task.tsx` seja decomposto em subcomponentes atômicos e especializados (cabeçalho/ações, chips de bloqueio/dependência, badges de fluxo/SLE e indicadores de checklist),
para que o cartão seja fácil de manter, compreender e evoluir, sem ultrapassar o limite de 400 linhas e sem alterar a renderização ou a interação de arrastar e soltar (drag-and-drop).

**Why this priority**: O cartão Kanban é o elemento de maior densidade de uso no Metrik. Sendo atualmente o maior arquivo do frontend (907 linhas), sua refatoração é o núcleo de maior ganho arquitetural imediato.

**Independent Test**: Pode ser testado visualmente e por testes automatizados no quadro Kanban: todas as informações do cartão (título, tag, prioridade, bloqueio, SLE, cycle time, checklist e comentários) continuam renderizando com fidelidade de pixels, menus de ação operacionais e arrasto fluido entre colunas.

**Acceptance Scenarios**:
1. **Given** um quadro com tarefas em múltiplos estados (bloqueadas, com SLE violado, com subtarefas e comentários), **When** o quadro é renderizado, **Then** o componente `Task.tsx` delega a renderização para subcomponentes especializados com menos de 400 linhas cada, mantendo a aparência e o comportamento idênticos.
2. **Given** uma tarefa sendo arrastada entre colunas, **When** o usuário interage via drag-and-drop, **Then** o ciclo de eventos e as referências de elemento necessárias para a biblioteca de arrasto funcionam sem flickering, travamentos ou perda de foco.
3. **Given** uma tarefa com bloqueio ativo ou pendência de dependência, **When** o usuário inspeciona o cartão, **Then** os chips de status e modal de bloqueio disparam seus eventos preservando a assinatura de callbacks existente.

---

### User Story 2 - Decomposição Modular do Modal de Detalhes `TaskDetailsModal.tsx` (Priority: P2)

Como usuário refinando informações de uma tarefa,
quero que o modal de detalhes opere com seções modulares isoladas (cabeçalho de título/tags, formulário de descrição com barra Markdown, seções de datas/estimativas e painel lateral de atividades/comentários),
para que o arquivo principal `TaskDetailsModal.tsx` tenha menos de 400 linhas e mantenha intacto o guard de fechamento acidental de rascunhos sujos.

**Why this priority**: É a segunda maior superfície de interação do usuário (728 linhas) e governa regras críticas de integridade de dados (Princípio IX da Constituição).

**Independent Test**: Abrir o modal de detalhes de qualquer tarefa, editar descrição e campos, alternar abas de histórico/comentários, testar o alerta de descarte de rascunhos não salvos e salvar as alterações.

**Acceptance Scenarios**:
1. **Given** o modal de detalhes aberto, **When** o usuário inspeciona sua interface, **Then** o arquivo container `TaskDetailsModal.tsx` orquestra subseções coesas mantendo sua extensão individual estritamente abaixo de 400 linhas.
2. **Given** uma edição em andamento no texto da tarefa sem confirmação de salvamento, **When** o usuário tenta fechar o modal ou teclar `Escape`, **Then** o diálogo de proteção de rascunho sujo (`showDirtyConfirmDialog`) bloqueia o fechamento até decisão explícita do usuário.
3. **Given** o acionamento de assistentes contextuais (como a Mika AI ou gerenciador de links), **When** disparados do modal, **Then** a integração responde aos eventos sem afetar o estado local dos outros campos.

---

### User Story 3 - Desacoplamento e Composição do Gerenciador `useTaskCollection.ts` (Priority: P3)

Como desenvolvedor mantendo a camada de estado e lógica de negócio do Kanban,
quero que o hook `useTaskCollection.ts` seja refatorado usando composição modular (sub-hooks ou módulos auxiliares especialistas em movimentação/reordenação, ciclo de vida de tarefas e gestão de checklists/comentários),
para que o hook principal funcione como uma fachada unificada com menos de 400 linhas, mantendo sua assinatura pública 100% retrocompatível.

**Why this priority**: Centraliza toda a manipulação do quadro (751 linhas). Isolar mutações de regras de ordenação e transição garante alta testabilidade e menor risco de efeitos colaterais.

**Independent Test**: Executar a suíte de testes de hooks (`useTaskCollection.test.ts`, `taskReorder.test.ts`, `taskTransitions.test.ts`) e verificar que todas as mutações de estado ocorrem com exatidão determinística e sem quebras de contrato.

**Acceptance Scenarios**:
1. **Given** componentes dependentes de `useTaskCollection`, **When** invocam operações como `moveTask`, `reorderTaskRelative`, `addTaskComment` ou `updateTask`, **Then** a interface de retorno do hook permanece inalterada sem exigir refatoração nos componentes consumidores.
2. **Given** a estrutura interna de `useTaskCollection.ts`, **When** inspecionada, **Then** o arquivo central atua como fachada integradora de módulos especialistas, com tamanho inferior a 400 linhas.
3. **Given** a persistência no `localStorage`, **When** tarefas são modificadas concorrentemente ou em lote, **Then** a consistência de timestamps e integridade de dados é rigorosamente mantida.

---

### User Story 4 - Decomposição Estrutural da Casca `App.tsx` (Priority: P4)

Como usuário e desenvolvedor do Metrik,
quero que o arquivo raiz `App.tsx` seja simplificado através da extração de submódulos de casca (como gerenciador de navegação/visões, orquestrador de modais globais e barra de ferramentas superior),
para que o arquivo orquestrador raiz tenha menos de 400 linhas, com responsabilidade clara de composição de layout e provedores.

**Why this priority**: Embora seja o componente raiz (762 linhas), ele orquestra múltiplos modais e gavetas que podem ser encapsulados em agrupadores lógicos sem alterar o fluxo da SPA.

**Independent Test**: Navegar entre as visões do Metrik (Quadro Kanban, Analytics, Configurações, Workspace Hub), abrir modais globais (novo quadro, nova squad, exportação CSV, Mika Drawer) e validar estabilidade total.

**Acceptance Scenarios**:
1. **Given** a aplicação Metrik em execução, **When** o usuário transita entre o Quadro, Analytics e Configurações, **Then** a casca raiz `App.tsx` delega a renderização para submódulos de layout mantendo tamanho estritamente abaixo de 400 linhas.
2. **Given** atalhos de teclado globais e gatilhos de modais (Settings, Workspace, Mika), **When** acionados, **Then** os diálogos abrem e fecham de forma determinística sem renderizações fantasmas.

---

### Edge Cases

- **Compatibilidade Estrita de Tipos e Assinaturas**: Nenhuma propriedade de props pública de `Task.tsx` ou `TaskDetailsModal.tsx` pode ser removida ou alterada, prevenindo quebras em cascata no código consumidor.
- **Risco de Re-renderizações Desnecessárias**: A extração de subcomponentes não pode degradar a performance de renderização do Kanban com centenas de tarefas; técnicas de memoização (`React.memo`, callbacks estáveis) devem ser preservadas.
- **Isolamento de Estilos CSS**: Nenhuma classe CSS canônica definida nos arquivos `src/styles/01-design-system-core.css` a `13-mika.css` pode ser renomeada ou removida durante a modularização.
- **Preservação de Foco e Acessibilidade**: O desmembramento do modal e dos cards deve manter atributos de acessibilidade (`aria-*`, `role`, foco do teclado) intactos.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `Task.tsx` DEVE ser decomposto em subcomponentes coesos dentro do diretório modular dedicado `src/components/Task/`, mantendo `src/components/Task.tsx` como ponto de entrada retrocompatível, com arquivos individuais contendo menos de 400 linhas de código.
- **FR-002**: O componente `TaskDetailsModal.tsx` DEVE ser decomposto em subcomponentes estruturados dentro de `src/components/TaskDetailsModal/`, mantendo `src/components/TaskDetailsModal.tsx` como ponto de entrada retrocompatível, assegurando que o modal container e seus painéis internos possuam cada um menos de 400 linhas de código.
- **FR-003**: O hook `useTaskCollection.ts` DEVE adotar o padrão Fachada (*Facade Pattern*), compondo sub-hooks ou módulos de utilidade funcional especializados, reduzindo o arquivo principal para menos de 400 linhas de código e mantendo integralmente sua API pública para todos os consumidores.
- **FR-004**: O componente `App.tsx` DEVE segregar seus modais globais e gavetas em `AppDialogsContainer.tsx` e a navegação/ações em `AppHeaderBar.tsx`, garantindo que o orquestrador raiz possua tamanho final inferior a 400 linhas de código.
- **FR-005**: O sistema DEVE preservar exatamente o mesmo comportamento visual, tempos de transição, estilos CSS e responsividade em todos os componentes após a refatoração.
- **FR-006**: O sistema DEVE preservar a proteção de rascunhos sujos (`showDirtyConfirmDialog`) e a prevenção de descarte de dados não salvos no modal de detalhes.
- **FR-007**: A refatoração NÃO DEVE introduzir nenhuma nova dependência externa no `package.json` (Constituição V - Simplicidade & YAGNI).
- **FR-008**: Todas as exportações públicas existentes nos 4 módulos DEVEM ser mantidas ou re-exportadas como fachadas compatíveis para garantir zero quebra em testes existentes ou pontos de importação legados.

---

### Key Entities

- **TaskCardStructure**: Composição do cartão Kanban abrangendo cabeçalho, corpo, chips de dependência/bloqueio, rodapé de métricas e badges de fluxo.
- **TaskModalStructure**: Composição do modal de detalhes abrangendo dados primários da tarefa, barra de formatação, abas de atividade/comentários e painel de ações de IA.
- **TaskCollectionFacade**: Conjunto coeso de hooks e utilitários que orquestram a coleção de tarefas do quadro ativo com persistência reativa no `localStorage`.
- **AppShell**: Estrutura container raiz que combina provedores de estado, cabeçalho de navegação, roteamento de visões analíticas e camadas de diálogo modal.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os 4 módulos identificados no OPP-002 (`Task.tsx`, `App.tsx`, `TaskDetailsModal.tsx`, `useTaskCollection.ts`) e todos os seus submódulos extraídos devem possuir estritamente **menos de 400 linhas de código**.
- **SC-002**: **100% dos testes existentes (744 testes em 125 arquivos)** devem passar com sucesso sem nenhuma alteração nos testes existentes motivada por quebra de contrato.
- **SC-003**: A compilação de produção (`npm run build`) e a verificação de tipos TypeScript (`tsc --noEmit`) devem passar com **zero erros e zero avisos**, completando a compilação em menos de 5 segundos.
- **SC-004**: O linter estrito (`npm run lint`) deve manter **0 erros e 0 avisos** com a regra de `no-explicit-any`.
- **SC-005**: A cobertura de código automatizada (`npm run test:coverage`) deve permanecer rigorosamente acima de todos os 4 limiares constitucionais (Functions ≥ 60%, Statements ≥ 85%, Lines ≥ 85%, Branches ≥ 78%).

---

## Assumptions

- A arquitetura interna de componentes do Metrik continua baseada em React funcional com TypeScript moderno.
- A decomposição é estritamente uma refatoração estrutural arquitetural de código limpo (sem introdução de novas regras de negócio do ponto de vista do usuário final).
- Os seletores CSS existentes nas folhas de estilo continuam válidos e aplicáveis às mesmas classes e elementos nos subcomponentes extraídos.
