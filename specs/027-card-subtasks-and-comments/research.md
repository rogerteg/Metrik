# Technical Research: Subtarefas e Comentários nos Cartões (027)

**Date**: 2026-09-14
**Feature**: `027-card-subtasks-and-comments`
**Status**: Completed
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Estado Atual Verificado no Código

| Constatação | Evidência | Consequência para o design |
|---|---|---|
| Subtarefas já existem como lista simples aninhada no cartão | `SubtaskModel { id, title, completed }` em `src/types/kanban.ts`; `TaskModel.subtasks?: SubtaskModel[]` | A feature **estende** o modelo existente; não há entidade nova de subtarefa |
| A gestão de subtarefas hoje ocorre **apenas** no modal | `src/components/TaskDetailsModal.tsx` (adicionar, alternar conclusão, remover) | O trabalho novo é de **superfície no cartão** e de comentários |
| No cartão existe apenas o indicador de progresso | `src/components/Task.tsx` (`completedSubtasks/subtasks.length`) | A criação a partir do cartão é requisito novo (FR-001) |
| **Não existe nenhuma capacidade de comentário** | Busca por `comment`/`coment` em `src/` não retorna ocorrências de domínio | Todo o comportamento de comentário é novo |
| A identidade da sessão está disponível | `useTeamAccess` expõe `activeUser`, `activeUserId`, `getUserRoleInTeam(teamId, userId)` | Autoria e permissão derivam de dados já existentes (FR-008, FR-016) |
| A exportação serializa o quadro inteiro | `useDataPortability.exportData` faz `JSON.stringify(board)` | Estruturas aninhadas no cartão viajam no arquivo sem mudança de esquema |
| A importação valida apenas a estrutura superficial | `isValidBoardState` verifica `columns` (array) e `tasks` (objeto) | Campos novos aninhados **não** são descartados no ciclo exportar → importar |
| O estado do quadro é persistido por quadro | `useTaskCollection` → `metrik-tasks-<boardId>` no `localStorage` | Comentários persistem junto ao cartão, sem nova chave de armazenamento |

---

## 2. Decisões Arquiteturais

### D1: Comentários aninhados na entidade dona

**Decision**: `CommentModel[]` é aninhado em `TaskModel.comments` (comentários do cartão pai) e em `SubtaskModel.comments` (comentários do cartão filho).

**Rationale**:
- **Cascata gratuita**: remover a subtarefa remove os comentários dela; remover o cartão remove tudo — exatamente FR-013 e FR-014, sem código de limpeza.
- **Portabilidade sem mudança de esquema**: a exportação serializa o quadro inteiro e a validação de importação é superficial (verificado em `seedData.ts` e `useDataPortability.ts`), logo o ciclo exportar → importar preserva comentários e subtarefas sem alteração no formato do arquivo.
- **Precedente interno**: o próprio `subtasks` já é aninhado no cartão; seguir o mesmo padrão mantém o modelo uniforme.
- **Uma dona por comentário**: o vínculo (cartão **ou** subtarefa) é estrutural, não um campo discriminante que possa ficar inconsistente.

**Alternatives considered**:
- *Coleção plana no quadro (`comments[]` com `targetId`/`targetType`)* — rejeitada: exige integridade referencial, coleta de órfãos ao remover subtarefas/cartões e ajuste no validador de importação; mais superfície para o mesmo resultado (viola Simplicidade/YAGNI).
- *Comentário como texto único por subtarefa* — rejeitada: FR-008 exige autor e momento **por comentário**.
- *Comentários apenas em memória* — rejeitada: viola FR-012 (persistência local).

### D2: Módulo de domínio puro para os filhos do cartão

**Decision**: criar `src/utils/cardChildren.ts` com funções puras para subtarefas e comentários (criação, alternância, remoção, edição, contagens e regras de permissão), recebendo identificadores e autor como parâmetros.

**Rationale**: mantém a lógica testável sem DOM nem armazenamento (Red-Bar First), isola as regras de permissão de FR-010/FR-016 num único ponto verificável e impede que os componentes voltem a duplicar validações. Mesmo padrão já adotado em `taskReorder.ts` (025) e `columnGeometry.ts` (026).

**Alternatives considered**:
- *Lógica dentro dos componentes* — rejeitada: foi exatamente o que gerou duplicação de geometria na 026 e o que deixaria FR-010/FR-011 sem verificação determinística.
- *Biblioteca de estado dedicada* — rejeitada: dependência nova desnecessária (NFR-007).

### D3: Permissões de comentário (decisão **provisória**, pendente de ratificação)

**Decision**: o autor edita e exclui os próprios comentários; o `admin` do time pode **excluir** comentários de qualquer autor; `member` só os próprios; `guest` não executa nenhuma escrita (herda o confinamento somente leitura já existente).

**Rationale**: preserva a integridade da autoria e reaproveita o papel `admin` que o produto já possui para moderação, sem introduzir conceito novo. O efeito da decisão é local a um predicado de permissão — baixo custo de reversão caso seja rejeitada.

**Alternatives considered**: qualquer membro edita qualquer comentário (rejeitada: permite alterar a fala de terceiros sem rastro); autor apenas, sem moderação (rejeitada: deixa o time sem meio de remover conteúdo inadequado); comentário imutável (rejeitada: contraria FR-010, que exige edição).

> **Pendência de ratificação**: esta decisão responde ao item `CHK037` do checklist e à pergunta do `/speckit-clarify` que ficou sem resposta. Enquanto não ratificada via `/speckit-clarify`, o requisito FR-010 permanece genérico e a implementação adota este padrão.

### D4: Superfície dos filhos no cartão — área recolhível com rolagem própria

**Decision**: o cartão ganha uma área **recolhível** ("Subtarefas e comentários") que, aberta, mostra a lista de subtarefas (alternar conclusão, remover), o campo de adição de subtarefa, a contagem de comentários e, por subtarefa, uma linha expansível com o campo e a lista de comentários daquele filho.

**Rationale**: atende ao pedido de criar subtarefa e comentar "dentro do card" sem inflar a altura dos cartões — FR-020 exige listas contidas com rolagem própria, e a feature 026 acabou de estabelecer paridade de renderização e contenção. Recolhida por padrão quando o cartão não tem filhos, a área não altera a densidade atual do quadro.

**Alternatives considered**: lista sempre expandida (rejeitada: cartões altos, perda de densidade e risco de regressão da paridade de layout); criação apenas no modal (rejeitada: contraria o pedido explícito e US1).

### D5: Nenhum efeito automático no cartão pai

**Decision**: concluir todas as subtarefas **não** altera o cartão pai — não o move, não o marca como concluído, não altera timestamps de fluxo e não exibe estado de conclusão diferente.

**Rationale**: FR-018 exige que subtarefas e comentários não alterem métricas de fluxo; FR-017 proíbe movimentação e liberação de cartão bloqueado. Automatizar conclusão entraria em conflito direto com a trava estrita da 025 e com a integridade de Cycle Time/Lead Time.

**Alternatives considered**: marcar o cartão como concluído automaticamente (rejeitada: moveria o cartão de coluna e corromperia métricas); apenas mostrar um aviso "todas concluídas" (rejeitada nesta rodada: é indicador novo não pedido na spec).

### D6: Renomear subtarefa fica fora do escopo desta feature

**Decision**: a feature implementa criar, concluir, reabrir e remover subtarefas. Editar o título de uma subtarefa existente **não** será implementado agora.

**Rationale**: a especificação não contém requisito de renomeação (lacuna registrada em `CHK020` do checklist). Adicionar capacidade não especificada violaria a disciplina de escopo; se for desejado, deve entrar por emenda à spec via `/speckit-clarify`.

**Alternatives considered**: incluir a renomeação por ser "natural" (rejeitada: escopo inventado, sem cenário de aceite).

### D7: Paridade de capacidade com o modal

**Decision**: o modal de detalhes passa a exibir e gerenciar comentários (do cartão e das subtarefas) além das subtarefas que já gerencia; nenhuma capacidade existente é removida dele.

**Rationale**: FR-001 exige criar no cartão sem tornar o modal obrigatório, mas o modal continua sendo o canal de inspeção detalhada (suposição registrada na spec). Duas superfícies com a mesma capacidade, uma implementação de domínio única (D2).

**Alternatives considered**: manter comentários exclusivamente no cartão (rejeitada: quem inspeciona o cartão pelo modal perderia o contexto).

### D8: Persistência e limites — sem migração de esquema

**Decision**: nenhuma chave de armazenamento nova e nenhuma migração: os campos `comments` são opcionais e os quadros existentes continuam válidos. Os limites de volume (50 subtarefas, 200 comentários) são atendidos por contenção de rolagem, sem paginação ou carregamento sob demanda.

**Rationale**: campos opcionais preservam compatibilidade retroativa; `isValidBoardState` já aceita quadros sem os campos novos. Paginação seria complexidade não exigida (YAGNI) para o volume declarado.

**Alternatives considered**: carregar comentários sob demanda com paginação (rejeitada: complexidade desproporcional ao limite de 200 itens por cartão).

### D9: A lição de verificação da feature 026 se aplica aqui

**Decision**: a verificação automatizada cobre invariantes de domínio (D2), permissões e persistência; a rolagem contida, a altura das listas e a paridade visual são verificadas por medição em navegador real, conforme o roteiro do `quickstart.md`.

**Rationale**: o jsdom **não** calcula layout — a mesma limitação documentada em `research.md` da 026. Sem essa distinção, a feature declararia sucesso com base em testes que não medem o que FR-019/FR-020 exigem.

**Alternatives considered**: considerar a suíte automatizada suficiente para FR-019/FR-020 (rejeitada: falso verde já comprovado na 026).

---

## 3. Decisões Pendentes de Ratificação (não bloqueiam o plano)

| Item do checklist | Ambiguidade | Decisão provisória adotada | Impacto se revertida |
|---|---|---|---|
| `CHK037` | Quem edita/exclui comentário publicado | D3 (autor + moderação do admin) | Local a um predicado de permissão |
| `CHK038` | Comentários sempre visíveis ou recolhidos no cartão | D4 (área recolhível) | Ajuste de layout e de testes de componente |
| `CHK039` | Comentário do filho acessível pelo cartão pai | D4 (acessível dentro da linha da subtarefa) | Ajuste da superfície; o modelo de dados não muda |
| `CHK040` | Efeito de concluir todas as subtarefas | D5 (nenhum efeito automático) | Ajuste de comportamento e de testes |
| `CHK020` | Renomear subtarefa | D6 (fora de escopo) | Requer emenda à spec antes de implementar |

---

## 4. Conformidade Constitucional

- **I. SDD**: spec, checklists e contrato produzidos antes do código.
- **II. Modularidade**: domínio puro em `cardChildren.ts`, sem dependência circular; componentes apenas apresentam.
- **III. Verificação Automatizada**: suítes de domínio, de hook e de componente; suíte completa e build devem permanecer verdes.
- **IV. Observabilidade**: falhas de leitura/gravação de comentários reportadas com prefixo `[Metrik Guard]`, sem silenciar erro em caminho de mutação.
- **V. YAGNI**: sem dependências novas, sem paginação, sem coleção paralela, sem indicador automático no cartão pai.
- **VI. Raciocínio Analítico**: obrigatório antes de `tasks.md`.
- **VII. Independência de Marca**: terminologia neutra (*Subtarefa*, *Comentário*).
- **VIII. Local-First**: tudo permanece no `localStorage`, sem chamadas de rede.
