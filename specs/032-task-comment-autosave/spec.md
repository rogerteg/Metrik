# Feature Specification: Salvamento Manual e Automático de Comentários e Campos da Tarefa

**Feature Branch**: `032-task-comment-autosave`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Melhoria: Na tarefa, quando fizer algum log, algum comentario no campo descrição, ou algum outro campo que possibilite algum comentario, Crie um botao salva no cartao. E crie uma opção dentro de configurações de qualquer comentario em qualquer campo permitido do board, salvar automaticamente. Crie um atalho para essa função. Melhore colaborativamente, empiricamente de acordo com seu know-how."

---

## Clarifications

### Session 2026-09-18

- Q: Como deve ser a visibilidade dos botões "Salvar" e "Descartar" nos campos editáveis diretamente no cartão do quadro Kanban? → A: Exibição contextual: botões e indicador surgem apenas quando o campo estiver em foco ou com alterações pendentes (`isDirty`), recolhendo após salvar.
- Q: Como o atalho universal `Ctrl+S` / `Cmd+S` deve se comportar quando existirem alterações em mais de um campo no modal de detalhes? → A: No campo focado salva o campo ativo; se pressionado no escopo do modal salva todas as alterações pendentes de todos os campos.
- Q: Como deve ser configurado o tempo de debounce (espera após digitação) para o salvamento automático? → A: Fixo em 800ms como padrão ergonômico (suporte interno no modelo `AppSettings`, sem slider na UI inicial para manter simplicidade YAGNI).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Botão Salvar e Descartar no Cartão e no Modal com Atalho de Teclado (Priority: P1) 🎯 MVP

Como membro da equipe e operador do quadro Kanban, ao redigir ou alterar descrições, notas, critérios de aceitação, cenários de teste, motivos de bloqueio ou anotações na tarefa, quero visualizar um botão explícito de "Salvar" (acompanhado da opção "Descartar") e poder usar o atalho de teclado universal `Ctrl+S` / `Cmd+S`, para ter controle total, segurança psicológica e certeza imediata de que minhas edições foram persistidas sem risco de perda acidental.

**Why this priority**: É o núcleo da solicitação do usuário. Atualmente, a edição em campos de tarefas dispara salvamento implícito apenas no evento de perda de foco (`onBlur`), o que causa insegurança ao redigir textos longos ou quando o usuário deseja confirmar ativamente o registro antes de mudar de janela. Ter um botão dedicado e um atalho ágil de salvamento resolve o principal ponto de atrito.

**Independent Test**: Abrir um cartão no quadro ou o modal de detalhes, editar qualquer campo textual (ex.: descrição ou critérios de aceitação), verificar a exibição imediata do botão "Salvar", do botão "Descartar" e do indicador de alteração pendente. Clicar em "Salvar" ou pressionar `Ctrl+S` / `Cmd+S` e constatar que os dados persistem no armazenamento local e permanecem íntegros após recarregar a página.

**Acceptance Scenarios**:

1. **Given** um campo de texto de tarefa em foco no cartão ou no modal de detalhes, **When** o usuário digita ou altera qualquer caractere, **Then** o sistema exibe de forma clara e acessível os botões "Salvar" e "Descartar", acompanhados de um indicador visual de alterações pendentes ("Alterações não salvas").
2. **Given** alterações pendentes em um campo textual da tarefa, **When** o usuário clica no botão "Salvar" ou pressiona a combinação de teclas `Ctrl+S` (Windows/Linux) ou `Cmd+S` (macOS), **Then** as alterações são gravadas imediatamente no estado da tarefa, o atalho nativo do navegador é interceptado e prevenido, e o sistema exibe feedback de sucesso ("✓ Salvo").
3. **Given** alterações pendentes em um campo textual da tarefa, **When** o usuário clica no botão "Descartar" ou pressiona a tecla `Escape`, **Then** o campo reverte seu conteúdo para o valor original existente antes do início da edição atual e o estado pendente é cancelado.
4. **Given** um campo de texto cujo conteúdo não foi modificado, **When** o usuário foca ou navega pelo campo, **Then** o botão "Salvar" permanece desabilitado ou recolhido e nenhuma gravação redundante é executada.
5. **Given** o modal de detalhes aberto com alterações textuais pendentes não salvas no modo manual, **When** o usuário clica no botão fechar (×), clica fora do modal ou pressiona `Escape` fora do campo, **Then** o sistema exibe uma confirmação de salvamento pendente, permitindo salvar as alterações, descartá-las ou continuar editando antes de fechar.

---

### User Story 2 - Configuração Global de Salvamento Automático (Autosave) (Priority: P2)

Como usuário ou administrador do sistema, quero ter uma opção na tela de Configurações para definir se os comentários, notas e campos de texto do quadro devem ser salvos automaticamente ou se devem exigir confirmação manual via botão/atalho, para adaptar a experiência de edição à preferência ergonômica de cada equipe.

**Why this priority**: Complementa o modo manual, oferecendo flexibilidade total: equipes que preferem a conveniência de não clicar em botões mantêm o fluxo contínuo e sem atrito do salvamento automático com feedback visual; equipes que exigem validação intencional utilizam o modo manual com botão "Salvar".

**Independent Test**: Acessar a tela de Configurações do sistema, alternar a opção "Salvar automaticamente comentários e campos de texto" para ativado/desativado, retornar ao quadro e comprovar que a persistência dos campos de texto passa a obedecer imediatamente ao comportamento selecionado.

**Acceptance Scenarios**:

1. **Given** a tela de Configurações do sistema (`SettingsView`), **When** o usuário acessa as opções gerais de comportamento e preferências de tarefas, **Then** é exibido um interruptor (switch/toggle) rotulado como "Salvar automaticamente comentários e campos de texto", com texto explicativo sobre o comportamento no quadro.
2. **Given** a opção de salvamento automático ATIVADA (`autoSaveComments = true`), **When** o usuário digita em qualquer campo de texto da tarefa no cartão ou modal, **Then** o sistema agenda o salvamento automático com intervalo inteligente de debounce (800ms após a última digitação) e ao perder o foco (`onBlur`), exibindo um indicador transitório de sincronização ("Salvando..." seguido de "✓ Salvo").
3. **Given** a opção de salvamento automático DESATIVADA (`autoSaveComments = false`), **When** o usuário edita qualquer campo de texto da tarefa, **Then** a persistência automática fica completamente suspensa e as alterações só são gravadas quando o usuário clica no botão "Salvar" ou aciona o atalho `Ctrl+S` / `Cmd+S`.
4. **Given** a alteração da configuração de salvamento automático, **When** a aplicação é reiniciada ou a página é recarregada, **Then** a preferência definida pelo usuário é recuperada e mantida ativa sem perda de configuração.

---

### User Story 3 - Feedback Visual Empírico de Status de Persistência e Interações Ágeis (Priority: P3)

Como membro da equipe, quero receber feedback visual discreto e em tempo real sobre o estado de persistência de cada campo ("Alterações pendentes", "Salvando...", "✓ Salvo") com transições suaves e atalho de teclado global, para ter certeza instantânea da integridade dos meus registros sem poluição visual no quadro.

**Why this priority**: Garante excelência estética, clareza operacional e atende às boas práticas de design ergonômico moderno, evitando que badges ou botões permaneçam ocupando espaço visual desnecessário após a conclusão da gravação.

**Independent Test**: Editar um campo de texto no cartão ou modal, acionar o salvamento, acompanhar a mudança dos estados visuais (rascunho -> salvando -> salvo) e comprovar que o aviso de sucesso se desvanece suavemente após 2 segundos, mantendo a interface limpa.

**Acceptance Scenarios**:

1. **Given** um campo de texto com alterações sendo digitadas, **When** o estado de edição é modificado, **Then** um micro-indicador de status exibe o estado correspondente com acessibilidade para leitores de tela (`aria-live="polite"`).
2. **Given** a gravação bem-sucedida de um campo de texto (manual ou automática), **When** o indicador atinge o estado "✓ Salvo", **Then** após 2 segundos ele realiza um fade-out suave, retornando ao estado de repouso silencioso.
3. **Given** o usuário editando um campo mesmo no modo de salvamento automático, **When** ele aciona o atalho `Ctrl+S` ou `Cmd+S`, **Then** o salvamento imediato é forçado imediatamente, interrompendo o temporizador de debounce e exibindo a confirmação visual no mesmo instante.
4. **Given** o quadro Kanban exibido na tela, **When** o usuário pressiona a combinação de atalho de exibição de ajuda ou consulta de atalhos, **Then** o atalho `Ctrl+S / Cmd+S (Salvar alterações na tarefa)` e `Esc (Descartar alterações)` constam devidamente documentados.

---

### Edge Cases

- **Fechamento Acidental da Janela do Navegador**: Se o usuário tiver alterações não salvas no modo manual e tentar fechar a aba ou janela do navegador, o evento de alerta do navegador (`beforeunload`) deve ser registrado para prevenir a perda involuntária do texto.
- **Caracteres Especiais, Emojis e Quebras de Linha Múltiplas**: Textos colados contendo caracteres Unicode, quebras de linha ou símbolos devem ser persistidos e exibidos de forma fidedigna sem corromper o layout nem estourar as dimensões do cartão.
- **Edição Concorrente entre Múltiplos Campos na Mesma Tarefa**: Se o usuário editar a descrição e, em seguida, alternar para o campo de critérios de aceitação antes de salvar a descrição, cada campo deve reter seu próprio estado de edição sem sobrescrever os dados pendentes do outro.
- **Quadro em Modo Somente Leitura (Perfil Convidado / Read-Only)**: Em quadros restritos, todos os botões de ação ("Salvar", "Descartar"), inputs e atalhos de edição devem permanecer estritamente inativos e desabilitados.
- **Tarefa com Etiqueta de Bloqueio Ativa**: A adição ou edição de comentários, descrição e anotações é permitida normalmente para justificar o impedimento, enquanto a movimentação do cartão entre colunas permanece bloqueada.
- **Campos Salvos com Conteúdo Vazio ou Apenas Espaços**: Se o usuário limpar intencionalmente o campo de descrição ou critérios de aceitação e clicar em "Salvar", o sistema deve salvar o campo como vazio/indefinido de forma limpa, sem disparar erros.
- **Ação de Descartar (Escape ou Botão Descartar)**: Ao descartar, o valor retornado deve ser exatamente a cópia fiel do valor que estava gravado no início da sessão de edição do campo.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar um botão explícito "Salvar" e um botão "Descartar" (ou ícones equivalentes com rótulo acessível) em todos os campos de texto editáveis da tarefa:
  - Nos campos editáveis diretamente no cartão do quadro (`Task.tsx`): Título, Critérios de Aceitação e Cenários de Testes. No cartão, a barra com os botões e indicador de status MUST ser exibida contextualmente apenas quando o campo estiver em foco ou contiver alterações não salvas (`isDirty`), recolhendo-se suavemente após a persistência para preservar a densidade e elegância visual do quadro.
  - Nos campos editáveis no modal de detalhes da tarefa (`TaskDetailsModal.tsx`): Título, Descrição, Critérios de Aceitação, Cenários de Testes e Motivo de Bloqueio.
- **FR-002**: O sistema MUST exibir indicadores de status visual do campo durante a edição:
  - *"Alterações não salvas"* (badge/indicador de rascunho ativo quando o conteúdo difere do estado persistido).
  - *"Salvando..."* (indicador transitório durante a gravação).
  - *"✓ Salvo"* (indicador de sucesso com auto-ocultação após 2 segundos).
- **FR-003**: O botão "Salvar" MUST persistir as alterações imediatamente no armazenamento local da aplicação (`localStorage`), atualizando o carimbo de data e hora de modificação (`updatedAt`).
- **FR-004**: O botão "Descartar" (e a tecla `Escape`) MUST reverter o texto do campo para o valor original gravado antes do início da edição atual e desativar o estado de alterações pendentes.
- **FR-005**: O sistema MUST interceptar as combinações de teclado `Ctrl+S` (Windows/Linux) e `Cmd+S` (macOS):
  - Quando disparado dentro de um campo de texto focado, o atalho MUST salvar imediatamente o campo ativo.
  - Quando disparado no escopo do modal de detalhes, o atalho MUST salvar todas as alterações pendentes (`isDirty`) em todos os campos editáveis da tarefa.
  - Em ambos os casos, o sistema MUST prevenir (`event.preventDefault()`) a abertura do diálogo nativo de salvamento de página web do navegador.
- **FR-006**: O sistema MUST incluir na tela de Configurações (`SettingsView` -> aba Geral ou aba Políticas/Preferências de Tarefas) uma opção configurável para ativar ou desativar o salvamento automático:
  - Rótulo: *"Salvar automaticamente comentários e campos de texto"*.
  - Descrição: *"Salva automaticamente alterações em descrições, notas e critérios de aceitação ao digitar e ao mudar de campo."*.
- **FR-007**: A preferência de salvamento automático MUST ser armazenada no modelo de dados `AppSettings` sob a chave `autoSaveComments: boolean` (com valor padrão inicial `true`). O intervalo de debounce é padronizado em 800ms (`autoSaveDebounceMs: 800`), sem adição de slider complexo na interface inicial para aderência ao princípio YAGNI (Constituição V).
- **FR-008**: Quando `autoSaveComments` for `true` (modo automático):
  - O sistema MUST efetuar o salvamento automático com temporizador de debounce (800ms de inatividade após a digitação).
  - O evento de perda de foco (`onBlur`) MUST forçar o salvamento imediato do campo caso ainda haja edições pendentes no temporizador de debounce.
  - O botão "Salvar" e o atalho `Ctrl+S` / `Cmd+S` MUST continuar funcionando como gatilhos manuais imediatos.
- **FR-009**: Quando `autoSaveComments` for `false` (modo manual):
  - O sistema NÃO DEVE persistir alterações automaticamente nem no debounce nem na perda de foco (`onBlur`).
  - O sistema MUST persistir as alterações exclusivamente quando o usuário clicar no botão "Salvar" ou acionar o atalho `Ctrl+S` / `Cmd+S`.
  - Se o usuário tentar fechar o modal de detalhes de tarefa com alterações pendentes não salvas, o sistema MUST exibir diálogo de confirmação prevenindo a perda acidental de dados.
- **FR-010**: O sistema MUST garantir que o salvamento de comentários e campos de texto não altere a coluna da tarefa, não mova o cartão, não libere tarefas bloqueadas e não distorça as métricas de fluxo do quadro (Lead Time, Cycle Time e Throughput).
- **FR-011**: Em quadros com acesso em modo somente leitura (perfil convidado), todos os botões de salvar, inputs de texto e atalhos de modificação MUST ser desabilitados.
- **FR-012**: Todos os elementos interativos, botões e indicadores MUST atender às diretrizes de acessibilidade WCAG 2.1 AA, possuindo foco visível, contraste adequado e suporte a leitores de tela com regiões `aria-live`.
- **FR-013**: A disposição dos botões e indicadores MUST manter a responsividade e o layout estético do Metrik, sem provocar quebras indesejadas na grade do Kanban nem sobreposição de elementos em resoluções compactas.

### Requisitos Não-Funcionais

- **NFR-001 [Latência de Persistência]**: A persistência no armazenamento local e a atualização do indicador visual para "Salvo" MUST ocorrer em menos de 100ms após o clique ou atalho.
- **NFR-002 [Soberania Local-First]**: Todo o gerenciamento de estados, rascunhos e preferências MUST operar autonomamente no navegador do cliente sem dependência obrigatória de serviços externos.
- **NFR-003 [Independência de Marca]**: A terminologia utilizada em interface, código e documentação técnica MUST ser estritamente neutra e canônica, sem referências a softwares de terceiros.
- **NFR-004 [Otimização de Renderização]**: A digitação contínua em campos de texto com debounce MUST evitar re-renderizações desnecessárias de colunas inteiras ou do quadro Kanban.

---

### Key Entities *(include if feature involves data)*

- **TaskModel**: Entidade de tarefa do quadro Kanban. Campos de texto diretamente impactados:
  - `title`: Título do cartão.
  - `description`: Descrição detalhada da tarefa.
  - `acceptanceCriteria`: Critérios de aceitação para validação de entrega.
  - `testScenarios`: Cenários de testes (BDD / especificações).
  - `blockedReason`: Justificativa do motivo de bloqueio quando a tarefa está impedida.
  - `updatedAt`: Carimbo de data/hora atualizado a cada salvamento confirmado.
- **AppSettings**: Modelo de preferências globais do aplicativo armazenado em `localStorage`:
  - `autoSaveComments: boolean`: Determina se os campos de texto salvam automaticamente (`true`) ou se exigem confirmação manual pelo botão/atalho (`false`). Padrão: `true`.
  - `autoSaveDebounceMs?: number`: Intervalo de debounce configurável (padrão: 800ms).
- **FieldEditState**: Estado efêmero de controle de interface associado a cada campo de texto:
  - `originalValue`: Valor com o qual a edição foi iniciada.
  - `currentValue`: Valor atual digitado pelo usuário.
  - `isDirty`: Booleano que indica se há diferenças entre o valor atual e o valor original.
  - `status`: Estado de ciclo de vida (`'idle'` | `'dirty'` | `'saving'` | `'saved'`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos campos de texto da tarefa (no cartão do quadro e no modal de detalhes) oferecem botão de salvamento dedicado e suporte ao atalho universal `Ctrl+S` / `Cmd+S`.
- **SC-002**: A gravação de alterações e a exibição do feedback visual de confirmação ocorrem em tempo inferior a 100 milissegundos após o acionamento pelo usuário.
- **SC-003**: No modo de salvamento manual, a taxa de perda não intencional de edições por fechamento acidental de janela ou modal é reduzida a 0% devido ao guarda de estado pendente (*dirty state guard*).
- **SC-004**: No modo de salvamento automático, o agrupamento de gravações via debounce inteligente reduz as operações de escrita no armazenamento local em mais de 70% durante sessões de digitação contínua.
- **SC-005**: 100% dos testes automatizados (`npm run test` e `npm run build`) são executados com aprovação estrita de zero falhas e zero erros de tipo TypeScript.

---

## Assumptions

- O valor padrão para `autoSaveComments` é `true`, respeitando a ergonomia moderna e intuitiva da aplicação, permitindo que usuários que necessitam de controle manual explícito alternem a configuração a qualquer momento.
- O atalho de teclado `Ctrl+S` (Windows/Linux) e `Cmd+S` (macOS) é o padrão da indústria e a melhor convenção para a operação de salvar em editores de texto e aplicações modernas.
- A tecla `Escape` é o padrão natural para descartar/cancelar alterações pendentes em campos de formulário e inputs de texto.
- As configurações de aplicação são armazenadas sob a chave já existente `metrik_app_settings` no `localStorage`, garantindo total compatibilidade Local-First e offline.
