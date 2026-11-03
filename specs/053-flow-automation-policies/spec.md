# Feature Specification: Automações de Fluxo & Políticas de Cartão (Flow Rules)

**Feature Branch**: `053-flow-automation-policies`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Automações de Fluxo & Políticas de Cartão (Flow Rules sem código): Criar motor visual e declarativo de regras de fluxo (Gatilho -> Condição -> Ação) para cartões e colunas do Kanban, permitindo governança ágil contínua, alertas de aging automáticos, aplicação de tags/prioridades e explicitação de políticas de entrada/saída por coluna de forma 100% local-first."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Construtor Visual de Regras de Fluxo Sem Código (Priority: P1)

Como líder técnico ou gestor ágil, desejo configurar regras automatizadas no quadro Kanban através de uma interface visual amigável (sem necessidade de programação), para que o fluxo de trabalho siga os acordos do time e execute ações repetitivas de forma confiável.

**Why this priority**: É o núcleo da governança de fluxo autônoma. Sem o construtor declarativo de regras, nenhuma automação pode ser criada ou inspecionada pelos membros da equipe.

**Independent Test**: Pode ser testado de ponta a ponta criando uma regra simples ("Quando cartão for movido para a coluna Revisão, adicionar a tag 'needs-qa'"), movendo um cartão para a coluna de destino e verificando imediatamente a aplicação da tag e o registro da auditoria.

**Acceptance Scenarios**:

1. **Given** que o usuário está visualizando um quadro Kanban com permissão de edição, **When** abre o painel de "Regras de Fluxo", **Then** visualiza a lista de regras ativas e um botão para criar nova regra.
2. **Given** a tela de criação de regra aberta, **When** o usuário seleciona o gatilho "Cartão movido para coluna", escolhe a coluna destino, e define a ação "Adicionar Tag", **Then** a regra é salva com status ativo e aparece na lista do quadro.
3. **Given** uma regra ativa configurada para adicionar a tag "needs-qa" ao mover para "Revisão", **When** qualquer cartão é arrastado para a coluna "Revisão", **Then** a tag "needs-qa" é automaticamente adicionada ao cartão e uma notificação de sucesso é exibida.
4. **Given** uma regra existente na lista, **When** o usuário clica no interruptor de ativação (toggle), **Then** a regra muda seu estado entre ativa/inativa sem ser excluída.

---

### User Story 2 - Alertas e Ações Automatizadas por Envelhecimento (Aging) e Prazos (Priority: P2)

Como membro ou gestor do squad, desejo que o sistema monitore continuamente itens parados ou com prazos críticos, aplicando sinalizações visuais, alterando prioridades ou marcando tags de atenção de forma autônoma.

**Why this priority**: O envelhecimento invisível de itens em progresso (WIP Aging) é o principal ofensor da previsibilidade e do tempo de ciclo em Kanban. Alertar e agir automaticamente evita gargalos silenciosos.

**Independent Test**: Pode ser testado configurando uma regra de envelhecimento ("Se cartão ficar em progresso por mais de 3 dias, definir prioridade como Urgente e adicionar tag 'aging-alert'"), simulando o limiar de tempo e verificando a reação automática no cartão.

**Acceptance Scenarios**:

1. **Given** uma regra baseada em tempo ("Cartão em coluna de progresso por mais de X dias"), **When** o tempo de permanência do cartão ultrapassa o limiar estipulado, **Then** o sistema executa a ação programada (ex: elevar prioridade e anexar tag de atenção).
2. **Given** um cartão que teve a prioridade alterada por uma automação de envelhecimento, **When** o usuário abre os detalhes do cartão, **Then** o histórico de atividades registra claramente a ação com o nome da regra que disparou a mudança.
3. **Given** um cartão cuja data limite (Due Date) está a menos de 24 horas do vencimento, **When** a regra de prazo crítico é avaliada, **Then** um marcador visual de alerta de prazo é adicionado ao cartão.

---

### User Story 3 - Políticas Explícitas de Entrada e Saída nas Colunas (Priority: P3)

Como membro da equipe, desejo visualizar e editar com facilidade as políticas explícitas de cada coluna (Definition of Ready / Definition of Done) diretamente no cabeçalho do quadro, garantindo alinhamento mútuo antes de movimentar cartões.

**Why this priority**: Políticas explícitas são um dos pilares centrais do método Kanban para manter a qualidade e evitar cartões movimentados prematuramente entre etapas.

**Independent Test**: Pode ser testado acessando o cabeçalho de uma coluna, preenchendo as políticas de entrada e saída, e verificando a exibição do ícone de informação de política com popover de consulta rápida no topo da coluna.

**Acceptance Scenarios**:

1. **Given** uma coluna qualquer no quadro Kanban, **When** o usuário clica no menu da coluna e seleciona "Políticas da Coluna", **Then** um modal/painel permite redigir as diretrizes de entrada (Critérios de Início) e saída (Critérios de Conclusão).
2. **Given** que uma coluna possui políticas preenchidas, **When** qualquer usuário passa o cursor ou toca no indicador de política no cabeçalho da coluna, **Then** um painel flutuante exibe as diretrizes acordadas de forma clara e legível.
3. **Given** uma coluna com política de saída configurada, **When** o usuário visualiza um cartão nessa coluna, **Then** os critérios acordados podem ser consultados rapidamente para conferência.

---

### User Story 4 - Biblioteca de Modelos Pré-Configurados (Rule Templates) (Priority: P4)

Como facilitador ágil, desejo escolher regras a partir de modelos prontos pré-definidos (templates de melhores práticas de fluxo), para ativar boas práticas no quadro com apenas um clique.

**Why this priority**: Facilita a adoção acelerada por equipes que estão iniciando na disciplina de fluxo, evitando que precisem criar lógicas do zero.

**Independent Test**: Pode ser testado abrindo o catálogo de templates, escolhendo "Alerta de Bloqueio Prolongado", confirmando os parâmetros sugeridos e verificando a regra pronta na listagem.

**Acceptance Scenarios**:

1. **Given** o painel de criação de regras aberto, **When** o usuário escolhe a aba "Modelos Sugeridos", **Then** visualiza opções pré-configuradas (ex: "Sinalizar WIP Aging Crítico", "Adicionar tag ao concluir", "Notificar item bloqueado").
2. **Given** um modelo selecionado, **When** o usuário clica em "Usar este Modelo", **Then** os campos de gatilho, condições e ações são pré-preenchidos, permitindo ajuste fino antes de salvar.

---

### Edge Cases

- **Prevenção de loops infinitos (Cascata recursiva)**: O que acontece se a Ação de uma Regra A (ex: adicionar tag 'urgente') satisfizer o Gatilho de uma Regra B, que por sua vez altera algo que re-dispara a Regra A? O motor de execução deve limitar a profundidade de execução em camada única (sem disparo cascateado secundário automático), prevenindo travamentos ou loops de automação.
- **Conflito de ações concorrentes**: O que acontece se duas regras distintas forem disparadas pelo mesmo evento e tentarem atribuir valores opostos (ex: Regra 1 define prioridade 'alta', Regra 2 define prioridade 'baixa')? O sistema deve executar as regras em ordem determinística (ordem de criação/prioridade na lista) e registrar ambas as mutações sequencialmente no log de atividades.
- **Cartão arquivado ou excluído**: O que acontece se uma verificação de envelhecimento temporizado encontrar um cartão arquivado ou pertencente a uma coluna finalizada ('done')? Regras de envelhecimento só devem avaliar cartões em colunas ativas (categoria 'in_progress' ou 'todo'), ignorando sumariamente colunas concluídas.
- **Ausência de dados obrigatórios na ação**: O que acontece se uma ação exigir um valor que não existe mais (ex: mover para coluna que foi excluída)? A regra deve entrar em estado de alerta ("Configuração inválida"), ignorar a ação com segurança, notificar o usuário com mensagem amigável e registrar o erro de forma não-bloqueante.
- **Uso estritamente local (sem conexão)**: O que acontece se o usuário estiver completamente desconectado da internet? Toda a execução de regras, temporizadores e persistência opera 100% no cliente de forma local e imediata.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um gerenciador visual de regras de fluxo acessível diretamente a partir do quadro Kanban.
- **FR-002**: O sistema DEVE permitir a criação de regras compostas pela tríade: Gatilho (Trigger), Condições opcionais (Conditions) e Ações (Actions).
- **FR-003**: O sistema DEVE suportar os seguintes Gatilhos de evento:
  - Movimentação de cartão para uma coluna específica ou qualquer coluna de uma categoria (`todo`, `in_progress`, `done`).
  - Alteração de status de bloqueio (marcado como impedido / desimpedido).
  - Criação de novo cartão no quadro.
  - Vencimento de prazo (faltando menos de X horas/dias para a data limite).
  - Envelhecimento em coluna (permanência em progresso por mais de X dias).
- **FR-004**: O sistema DEVE suportar as seguintes Condições de filtragem:
  - Prioridade do cartão (igual a / diferente de).
  - Tags do cartão (contém / não contém).
  - Tipo de item (card, subtask, initiative).
  - Responsável (atribuído / não atribuído).
- **FR-005**: O sistema DEVE suportar as seguintes Ações automatizadas:
  - Adicionar ou remover uma ou mais tags do cartão.
  - Alterar a prioridade do cartão (`low`, `medium`, `high`, `urgent`).
  - Marcar ou desmarcar cartão como bloqueado (com motivo padrão predefinido).
  - Exibir notificação em tela (toast informativo) para alertar os operadores.
  - Aplicar destaque visual / badge no cartão indicando violação de política de fluxo.
- **FR-006**: O sistema DEVE registrar toda execução de regra no histórico de auditoria do cartão, identificando o nome da regra e as alterações efetuadas.
- **FR-007**: O sistema DEVE permitir habilitar, desabilitar, duplicar, editar e excluir regras a qualquer momento.
- **FR-008**: O sistema DEVE fornecer um catálogo de pelo menos 4 modelos pré-configurados (templates) com as práticas mais comuns de gestão ágil.
- **FR-009**: O sistema DEVE permitir a definição de políticas explícitas de entrada e saída por coluna (textos descritivos com formatação simples).
- **FR-010**: O sistema DEVE exibir um indicador visual no cabeçalho das colunas que possuem políticas explícitas cadastradas, permitindo leitura rápida via popover/tooltip expansível.
- **FR-011**: O motor de automação DEVE conter trava de segurança contra recursão infinita, restringindo o encadeamento a profundidade 1 (ações de regras não disparam outras regras em cascata).
- **FR-012**: O sistema DEVE persistir todas as regras e políticas de forma 100% Local-First por quadro, garantindo funcionamento autônomo offline e sem requisições externas.
- **FR-013**: O sistema DEVE permitir a exportação e importação das regras de um quadro em formato estruturado (JSON), facilitando o compartilhamento entre diferentes quadros da organização.
- **FR-014**: O sistema DEVE garantir que a execução de regras temporizadas de envelhecimento seja executada de forma leve e assíncrona, sem causar engasgos ou atrasos na renderização do quadro.

---

### Key Entities *(include if feature involves data)*

- **FlowRule**: Entidade que representa uma regra de automação declarativa.
  - Atributos: `id`, `boardId`, `name`, `description`, `enabled`, `trigger`, `conditions`, `actions`, `createdAt`, `updatedAt`, `lastTriggeredAt`, `executionCount`.
- **FlowTrigger**: Especificação do evento que dispara a avaliação da regra.
  - Atributos: `type` (`card_moved`, `block_status_changed`, `aging_threshold_exceeded`, `due_date_approaching`, `card_created`), `config` (parâmetros específicos do gatilho, ex: `targetColumnId`, `thresholdDays`, `category`).
- **FlowCondition**: Critérios lógicos que precisam ser verdadeiros para que a ação seja executada.
  - Atributos: `field` (`priority`, `tags`, `type`, `assignee`), `operator` (`equals`, `not_equals`, `contains`, `not_contains`, `is_empty`, `is_not_empty`), `value`.
- **FlowAction**: Operação a ser executada no cartão quando o gatilho e as condições forem satisfeitos.
  - Atributos: `type` (`add_tag`, `remove_tag`, `set_priority`, `set_blocked`, `notify_toast`, `highlight_card`), `payload` (valores da ação, ex: nome da tag, nível de prioridade, motivo do bloqueio).
- **ColumnPolicy**: Diretrizes explícitas de processo associadas a uma coluna.
  - Atributos: `columnId`, `entryCriteria` (critérios para entrar na coluna), `exitCriteria` (critérios para sair da coluna), `updatedAt`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue configurar e ativar uma regra de fluxo completa (Gatilho + Condição + Ação) em menos de 45 segundos.
- **SC-002**: A execução de uma automação após a movimentação de um cartão ocorre em menos de 100 milissegundos, sem impacto perceptível na fluidez de arrastar e soltar (drag and drop).
- **SC-003**: 100% das execuções de regras geram entradas rastreáveis no histórico de atividades do cartão, contendo carimbo de data/hora e o nome da regra disparada.
- **SC-004**: Zero loops de execução infinita ou travamentos na interface, mesmo quando múltiplas regras monitoram a mesma coluna.
- **SC-005**: 100% das funcionalidades operam com confiabilidade em modo totalmente desconectado (offline).

---

## Assumptions

- As regras são associadas e escopadas por Quadro (Board), permitindo que cada time defina sua própria dinâmica de trabalho.
- O motor de avaliação de regras opera diretamente no cliente web local, reagindo aos eventos de mutação dos cartões e verificando periodicamente itens com gatilhos de tempo.
- O volume típico de regras ativas por quadro fica entre 3 e 15 regras; a interface suportará dezenas sem degradação.
- Nenhum serviço externo ou chave de API de terceiros é exigido para que as regras e políticas funcionem.
