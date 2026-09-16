# Feature Specification: Subtarefas e Comentários nos Cartões

**Feature Branch**: `027-card-subtasks-and-comments`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Ajustar o sistema, melhorar de forma que dentro do card, possibilite criar uma subtarefa. E ter um campo que possibilite fazer comentario dentro do Card pai, e dentro do card, da subtarefa, ou seja, o Card filho."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e acompanhar subtarefas direto no cartão (Priority: P1) 🎯 MVP

Como membro da squad, quero criar uma subtarefa e marcá-la como concluída **diretamente no cartão**, sem precisar abrir o modal de detalhes, para registrar o passo a passo do trabalho enquanto ele acontece — sem interromper o fluxo de quem está olhando o quadro.

**Why this priority**: É a primeira metade do pedido. Hoje a criação de subtarefas só existe dentro do modal de detalhes; no cartão há apenas um indicador de progresso. Trazer a criação para o cartão é o que torna a subtarefa útil durante a operação do quadro.

**Independent Test**: Abrir um quadro, criar uma subtarefa a partir do próprio cartão, marcá-la como concluída e removê-la — tudo sem abrir o modal — e conferir que o indicador de progresso acompanha imediatamente.

**Acceptance Scenarios**:

1. **Given** um cartão aberto no quadro, **When** o usuário aciona a criação de subtarefa no próprio cartão e informa um título, **Then** a subtarefa aparece vinculada àquele cartão e o indicador de progresso do cartão passa a contabilizá-la.
2. **Given** um cartão com duas subtarefas, uma concluída, **When** o cartão é exibido, **Then** o indicador mostra "1/2" (ou equivalente) representando concluídas sobre o total.
3. **Given** uma subtarefa pendente no cartão, **When** o usuário a marca como concluída, **Then** o estado é atualizado no cartão e o progresso é recalculado imediatamente.
4. **Given** uma subtarefa existente, **When** o usuário a remove e confirma, **Then** ela deixa de aparecer no cartão e o progresso é recalculado.
5. **Given** um título de subtarefa vazio ou composto apenas de espaços, **When** o usuário confirma, **Then** nada é criado e nenhuma subtarefa vazia permanece no cartão.

---

### User Story 2 - Comentar no cartão pai (Priority: P1)

Como membro da squad, quero escrever comentários no **cartão pai**, para registrar decisões, dúvidas e contexto que hoje se perdem fora do sistema.

**Why this priority**: É a segunda metade do pedido e independente da primeira: o cartão pai precisa de um canal de anotação próprio, com autoria e momento do registro.

**Independent Test**: Escrever um comentário em um cartão, recarregar a aplicação e confirmar que o comentário permanece, exibido com autor e data/hora, na ordem em que foi criado.

**Acceptance Scenarios**:

1. **Given** um cartão sem comentários, **When** o usuário escreve um comentário e o envia, **Then** o comentário aparece vinculado ao cartão, com autor da sessão ativa e data/hora do registro.
2. **Given** um cartão com comentários, **When** o usuário adiciona um novo, **Then** a ordem cronológica é preservada e o mais recente é localizável sem recarregar.
3. **Given** um comentário existente, **When** o usuário o edita, **Then** o texto atualizado é exibido e o registro de edição (momento) é atualizado.
4. **Given** um comentário existente, **When** o usuário o exclui e confirma, **Then** ele deixa de ser exibido e não reaparece após recarregar.
5. **Given** um comentário vazio ou apenas com espaços, **When** o usuário tenta enviar, **Then** nada é criado e nenhum comentário vazio permanece no cartão.

---

### User Story 3 - Comentar na subtarefa (cartão filho) (Priority: P2)

Como membro da squad, quero comentar **dentro da subtarefa**, para que o detalhe da execução fique junto do passo a que se refere, em vez de poluir o histórico do cartão pai.

**Why this priority**: Depende do modelo de subtarefa (US1) e da mecânica de comentário (US2). Sem isso, a subtarefa continua sendo apenas um item de checklist sem espaço para contexto.

**Independent Test**: Criar uma subtarefa, adicionar um comentário a ela e verificar que o comentário pertence à subtarefa (e não ao cartão pai); em seguida, conferir que o comentário do pai e o do filho não se misturam.

**Acceptance Scenarios**:

1. **Given** uma subtarefa existente em um cartão, **When** o usuário adiciona um comentário na subtarefa, **Then** o comentário é exibido dentro daquela subtarefa, com autor e data/hora.
2. **Given** um comentário registrado na subtarefa, **When** o cartão pai é exibido, **Then** o comentário **não** aparece como se pertencesse ao cartão pai.
3. **Given** uma subtarefa com comentários, **When** o usuário a remove e confirma, **Then** o sistema informa que os comentários daquela subtarefa serão removidos junto com ela, e a remoção prossegue apenas após a confirmação.
4. **Given** duas subtarefas no mesmo cartão, cada uma com comentários, **When** o usuário abre cada uma, **Then** cada subtarefa exibe somente os seus próprios comentários.

---

### Edge Cases

- Subtarefa com título muito longo: o texto quebra ou trunca dentro da subtarefa, sem aumentar a largura do cartão.
- Comentário com texto muito longo ou com quebras de linha: é exibido integralmente sem estourar a largura do cartão.
- Texto colado com caracteres especiais, emojis e acentos: é preservado sem corromper o registro.
- Comentário sem texto: não é criado.
- Cartão com muitas subtarefas (por exemplo, 50) e muitos comentários (por exemplo, 200): o cartão continua abrindo e rolando com fluidez, com as listas contidas na altura do cartão.
- Remoção do cartão pai: as subtarefas e os comentários vinculados deixam de existir junto com ele.
- Troca de quadro: o cartão do outro quadro apresenta apenas as suas próprias subtarefas e comentários.
- Quadro em modo somente leitura (perfil convidado): criação, edição e exclusão de subtarefas e comentários ficam indisponíveis.
- Cartão bloqueado (etiqueta de bloqueio ativa): continua sem poder mudar de coluna; comentar e criar subtarefa **não** destravam nem movem o cartão.
- Duas abas abertas na mesma máquina: a última gravação prevalece por item, sem duplicar subtarefas nem comentários.
- Recarregamento durante a digitação de um comentário não enviado: o rascunho pode ser perdido, mas nenhum registro parcial ou vazio é criado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O cartão MUST permitir criar uma subtarefa diretamente na sua própria superfície, sem exigir a abertura do modal de detalhes.
- **FR-002**: Cada subtarefa MUST ter identificação própria, título visível e estado de conclusão, exibidos no contexto do cartão a que pertence.
- **FR-003**: O cartão MUST exibir o progresso agregado das suas subtarefas (concluídas sobre o total) e atualizá-lo imediatamente após qualquer criação, conclusão, reabertura ou remoção.
- **FR-004**: O usuário MUST poder alternar o estado de conclusão de uma subtarefa a partir do cartão.
- **FR-005**: O usuário MUST poder remover uma subtarefa, com confirmação explícita antes da remoção.
- **FR-006**: O cartão pai MUST oferecer um campo para o usuário registrar comentários vinculados a ele.
- **FR-007**: Cada subtarefa (cartão filho) MUST oferecer um campo próprio para registrar comentários vinculados a ela, distintos dos comentários do cartão pai.
- **FR-008**: Todo comentário MUST registrar e exibir o autor da sessão ativa e o momento do registro, em data/hora legível.
- **FR-009**: Os comentários de um cartão ou de uma subtarefa MUST ser exibidos em ordem cronológica de criação.
- **FR-010**: O usuário MUST poder editar e excluir um comentário existente, com confirmação na exclusão, e o resultado MUST refletir imediatamente na interface.
- **FR-011**: Comentários vazios ou compostos apenas de espaços MUST NOT ser registrados; subtarefas com título vazio MUST NOT ser criadas.
- **FR-012**: Subtarefas e comentários MUST ser persistidos localmente junto ao quadro ativo e MUST permanecer após recarregar a aplicação ou trocar de sessão.
- **FR-013**: A remoção de uma subtarefa MUST remover também os comentários vinculados a ela, mediante confirmação que informe explicitamente essa consequência.
- **FR-014**: A remoção do cartão pai MUST remover as subtarefas e os comentários a ele vinculados.
- **FR-015**: O cartão MUST exibir a quantidade de comentários vinculados (do cartão pai), permitindo identificar rapidamente onde há contexto registrado.
- **FR-016**: Em quadro com permissão somente leitura, as ações de criar, editar, concluir e excluir subtarefas e comentários MUST ficar indisponíveis.
- **FR-017**: Criar subtarefa ou comentário MUST NOT alterar a coluna do cartão, MUST NOT mover o cartão e MUST NOT liberar um cartão bloqueado.
- **FR-018**: Criar uma subtarefa, concluir uma subtarefa ou registrar um comentário MUST NOT alterar as métricas de fluxo do quadro (Lead Time, Cycle Time, Eficiência de Fluxo e diagramas).
- **FR-019**: Textos de subtarefa e de comentário MUST quebrar ou truncar dentro do cartão, sem estourar a largura da coluna nem sobrepor outros elementos.
- **FR-020**: As listas de subtarefas e de comentários MUST permanecer contidas na altura do cartão, com rolagem própria quando excederem o espaço disponível.

### Requisitos Não-Funcionais

- **NFR-001 [Latência]**: Criar subtarefa e registrar comentário MUST produzir efeito visual imediato (percepção de instantaneidade), sem recarregar a página.
- **NFR-002 [Acessibilidade]**: Campos de subtarefa e de comentário MUST ter rótulos acessíveis, foco visível e operação completa por teclado, em conformidade com WCAG 2.1 AA.
- **NFR-003 [Soberania Local-First]**: Subtarefas e comentários MUST permanecer no armazenamento local do navegador, sem exigir servidor, conta externa ou conexão.
- **NFR-004 [Desempenho]**: Cartões com até 50 subtarefas e 200 comentários MUST permanecer fluídos na rolagem e na interação.
- **NFR-005 [Independência de Marca]**: A terminologia MUST ser canônica e neutra (*Subtarefa*, *Comentário*), sem nomes de produtos de terceiros em interface, código ou comentários.
- **NFR-006 [Paridade de Renderização]**: As novas superfícies MUST manter paridade de layout entre os navegadores suportados, na mesma tolerância já adotada pelo produto.
- **NFR-007 [Simplicidade]**: A funcionalidade MUST ser obtida sem novas dependências externas de editor de texto rico, anexos ou colaboração em tempo real.

### Key Entities *(include if feature involves data)*

- **Cartão (Card)**: item de trabalho exibido em uma coluna; passa a agregar subtarefas e comentários próprios.
- **Subtarefa (Subtask)**: passo do trabalho contido em um cartão; possui identificação, título, estado de conclusão e comentários próprios. Representa o "cartão filho" do pedido.
- **Comentário (Comment)**: anotação textual com autor e momento do registro; vinculada **ou** a um cartão **ou** a uma subtarefa, nunca a ambos.
- **Autor da Sessão**: perfil ativo no momento do registro do comentário; reaproveita a identidade já existente no produto.
- **Quadro (Board)**: unidade de persistência local que contém cartões, subtarefas e comentários.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário cria uma subtarefa em, no máximo, 2 interações a partir do cartão visível no quadro.
- **SC-002**: 100% dos comentários e subtarefas criados permanecem disponíveis após recarregar a aplicação.
- **SC-003**: 100% dos comentários registrados aparecem no destino correto — comentário de cartão no cartão, comentário de subtarefa na subtarefa — em todos os cenários verificados.
- **SC-004**: O indicador de progresso do cartão reflete o estado real das subtarefas em 100% das verificações após criar, concluir, reabrir e remover.
- **SC-005**: Zero ações de escrita de subtarefa ou comentário disponíveis em quadro com permissão somente leitura.
- **SC-006**: Cartões com 50 subtarefas e 200 comentários abrem e rolam sem degradação perceptível de fluidez.
- **SC-007**: Nenhuma regressão nas suítes de verificação automatizadas existentes após a entrega.

## Assumptions

- O produto já possui o conceito de subtarefa como lista simples vinculada ao cartão; esta feature **estende** esse conceito (comentários no filho e criação a partir do cartão) em vez de substituí-lo.
- O modal de detalhes continua funcionando como canal alternativo para gerenciar subtarefas e comentários; nada é removido de lá.
- A autoria dos comentários usa o perfil da sessão ativa já existente no produto; não há cadastro de autor externo.
- A persistência é local por navegador, como no restante do produto: dois navegadores diferentes não compartilham comentários.
- Comentários são ordenados por momento de criação; não há reagrupamento por thread nem resposta a comentário específico.
- Excluir a subtarefa remove os comentários dela; essa consequência é informada na confirmação e é a interpretação adotada por padrão.
- Não há limite rígido de caracteres para o comentário, mas a exibição ocorre dentro da largura do cartão.
- O produto não tem, hoje, nenhuma capacidade de comentário — todo o comportamento de comentário descrito aqui é novo.

## Fora de Escopo

- Notificações, alertas, menções a usuários e e-mails.
- Anexos de arquivo, imagens ou áudio em subtarefas e comentários.
- Histórico de versões de um comentário (auditoria de edições anteriores).
- Comentários em nível de coluna, de quadro ou de métrica.
- Colaboração em tempo real, sincronização com nuvem ou compartilhamento entre navegadores.
- Editor de texto rico (formatação, listas, tabelas) nos comentários.
- Alteração de métricas de fluxo, de regras de WIP ou de regras de movimentação de cartões.
- Transformação de uma subtarefa em cartão independente do quadro.

## Dependências

- Feature 007 — modal de detalhes da tarefa (canal alternativo já existente para subtarefas).
- Feature 023 — perfis de sessão, times e confinamento de convidado (autoria e permissão somente leitura).
- Feature 025 — trava estrita de movimentação de cartões bloqueados (as novas ações não podem mover nem destravar cartões).
- Feature 026 — paridade de renderização entre navegadores (as novas superfícies internas do cartão seguem a mesma tolerância).
- Features 002 e 013 — métricas de fluxo e eficiência (não devem ser afetadas por subtarefas ou comentários).
