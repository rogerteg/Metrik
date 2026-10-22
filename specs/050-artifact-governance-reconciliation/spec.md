# Feature Specification: Reconciliação Documental de Artefatos e Governança (Fase 2 do Roadmap)

**Feature Branch**: `050-artifact-governance-reconciliation`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Opção 3: Fase 2 do Roadmap — Reconciliação Documental de Artefatos (OPP-010 a OPP-017)"

---

## Clarifications

### Session 2026-10-21

- Q: Qual padrão textual canônico deve ser adotado no campo Status de todas as especificações de funcionalidades entregues? (FR-001) → A: `**Status**: Implemented & Verified (<data-ratificação>)` (ex: `**Status**: Implemented & Verified (2026-10-21)`).
- Q: Como deve ser conduzida a remoção das 3 ramificações remotas já integradas na linha principal (origin/024, origin/029, origin/031)? (FR-008) → A: Tentativa automática de deleção remota (`git push origin --delete`) com fallback gracioso com script de poda e `git fetch --prune` caso as credenciais locais não possuam permissão de escrita remota.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconciliação do Estado Declarado das Especificações Entregues (Priority: P1)

Como engenheiro de software, auditor de conformidade ou stakeholder do projeto Metrik,
quero consultar qualquer diretório de especificação funcional em `specs/*/spec.md` e encontrar o estado declarado (`Status`) condizente com a realidade física de entrega da funcionalidade,
para que a precedência documental do projeto seja confiável e não existam falsos rascunhos de capacidades já ativas e consolidadas em produção.

**Why this priority**:
O Princípio I da Constituição estabelece o Spec-Driven Development como inegociável, e o Documento de Visão (`specs/043-system-health-and-roadmap/vision.md`) identificou 32 funcionalidades entregues marcadas erroneamente como rascunho (`Draft`) ou sem declaração de status (OPP-010). Essa divergência induz desenvolvedores e agentes ao erro, simulando incompletude onde há maturidade.

**Independent Test**:
Pode ser totalmente verificado por um script de varredura estática que confronta o status de cada `specs/*/spec.md` contra o critério constitucional de entrega FR-024 (código presente na linha principal `main` e referenciado no `CHANGELOG.md`), assegurando 100% de coerência e 0 especificações entregues em estado ambíguo ou de rascunho.

**Acceptance Scenarios**:
1. **Given** uma funcionalidade de `specs/001` a `specs/042` cujo código esteja ativo na linha principal e referenciado no `CHANGELOG.md`, **When** inspecionado o cabeçalho de seu respectivo `spec.md`, **Then** o campo `Status` DEVE declarar expressamente o status de entrega no padrão canônico `**Status**: Implemented & Verified (<data-ratificação>)` (ex: `**Status**: Implemented & Verified (2026-10-21)`).
2. **Given** uma especificação que anteriormente não possuía linha de `**Status**:` (ex: `specs/005` a `specs/015`), **When** realizada a reconciliação documental, **Then** a especificação DEVE passar a conter o cabeçalho padronizado com o status factual comprovado.
3. **Given** uma funcionalidade cujo desenvolvimento esteja genuinamente em andamento ou em proposta futura e não entregue na linha principal, **When** inspecionado seu respectivo `spec.md`, **Then** seu status DEVE permanecer como `Draft`, sem sofrer alteração indevida.

---

### User Story 2 - Resolução de Marcadores de Esclarecimento em Funcionalidades Entregues (Priority: P1)

Como desenvolvedor ou agente integrador,
quero consultar a especificação de controle de acesso e squads (`specs/023-team-access-control/spec.md`) e encontrar os requisitos clarificados com as decisões arquiteturais vigentes,
para que não restem dúvidas ontológicas nem marcadores `[NEEDS CLARIFICATION]` em funcionalidades que já estão em operação em conformidade com a Constituição.

**Why this priority**:
A existência de marcadores de esclarecimento abertos em funcionalidades já integradas na linha principal (OPP-011) contradiz o princípio de especificação viva como contrato executável. No caso da spec 023, as dúvidas registradas já foram consolidadas de forma irrevogável no Artigo VIII da Constituição (Soberania Local-First, Isolamento de Squads e Controle de Acesso por Papéis).

**Independent Test**:
Pode ser testado de forma independente via varredura regex no arquivo `specs/023-team-access-control/spec.md`, comprovando que o número de ocorrências do padrão `\[NEEDS CLARIFICATION.*\]` é exatamente zero, e que os requisitos FR-003, FR-008 e FR-011 expressam explicitamente as decisões ratificadas.

**Acceptance Scenarios**:
1. **Given** o requisito FR-003 da especificação 023 (sessão e multi-usuário), **When** atualizado o texto do requisito, **Then** o marcador de esclarecimento DEVE ser substituído pela regra canônica de que o sistema opera sessão local-first com multi-perfis em `localStorage`, sem backend mandatório e com sincronização em nuvem opcional (Constituição VIII.1 e VIII.5).
2. **Given** o requisito FR-008 da especificação 023 (permissões de convidado / guest), **When** atualizado o texto do requisito, **Then** o marcador de esclarecimento DEVE ser substituído pela definição mandatória de que o papel `guest` possui acesso estritamente somente-leitura aos quadros da squad, com mutações e movimentações bloqueadas (Constituição VIII.4).
3. **Given** o requisito FR-011 da especificação 023 (escopo de quadros e squads), **When** atualizado o texto do requisito, **Then** o marcador de esclarecimento DEVE ser substituído pela diretriz de que todo quadro pertence estritamente a um time/squad específico, sem suporte a quadros órfãos, com auto-atribuição no workspace ativo (Constituição VIII.2 e CHANGELOG v0.2.0).

---

### User Story 3 - Formalização Histórica de Artefatos de Tarefas Legados (Priority: P2)

Como mantenedor do repositório,
quero que os arquivos de tarefas legados (`specs/005` a `specs/009`, `tasks.md`) declarem explicitamente todas as suas tarefas históricas como concluídas e referenciadas,
para que ferramentas de auditoria e agentes de automação não contabilizem 55 itens desmarcados (`- [ ]`) como trabalho pendente em funcionalidades entregues no lançamento v0.1.0.

**Why this priority**:
Os arquivos de tarefas das especificações 005 a 009 contêm avisos textuais de que a capacidade foi entregue, mas mantêm 55 checkboxes desmarcados (OPP-012). Isso gera ruído sistemático em scripts de contagem de pendências e viola o princípio de artefatos não ambíguos.

**Independent Test**:
Pode ser testado executando uma contagem de checkboxes não marcados (`^\s*-\s*\[\s*\]`) nos arquivos `specs/00[5-9]-*/tasks.md`, validando que o resultado é exatamente 0 itens pendentes e que o cabeçalho de cada arquivo atesta a entrega histórica com rastreabilidade ao CHANGELOG.

**Acceptance Scenarios**:
1. **Given** os arquivos `tasks.md` nos diretórios `specs/005-column-management/`, `specs/006-data-portability/`, `specs/007-task-details-modal/`, `specs/008-analytics-dashboard/` e `specs/009-due-dates/`, **When** executada a reconciliação documental, **Then** cada item de tarefa DEVE estar assinalado como concluído (`- [x]`) acompanhado da indicação de entrega histórica na versão `v0.1.0`.
2. **Given** qualquer script de auditoria que busque itens pendentes (`- [ ]`), **When** executado sobre o conjunto `specs/005` a `specs/009`, **Then** o retorno DEVE ser zero tarefas pendentes.

---

### User Story 4 - Auditoria e Reconciliação de Checklists de Domínio e Qualidade (Priority: P2)

Como revisor de qualidade e líder técnico,
quero que os checklists em `specs/*/checklists/*.md` reflitam o estado real das verificações realizadas no produto,
para que nenhum item permaneça desmarcado sem uma classificação explícita entre "atendido e verificado", "bloqueio de ambiente formal" ou "não aplicável com justificativa".

**Why this priority**:
O Documento de Visão identificou mais de 170 itens de checklist não marcados em 10 especificações preexistentes (OPP-017), criando uma zona cinzenta onde não se sabe se um critério de aceitação foi esquecido ou se já é coberto pela suíte automatizada de 744 testes.

**Independent Test**:
Pode ser testado inspecionando todos os arquivos `*.md` dentro dos subdiretórios `specs/*/checklists/`, verificando que 100% dos itens avaliados possuem resolução explícita (`[x]` comprovado por teste/inspeção, ou registro de bloqueio formal de ambiente conforme Constituição III/IV).

**Acceptance Scenarios**:
1. **Given** itens de checklist correspondentes a comportamentos já cobertos por testes automatizados vigentes (ex: travas de movimentação, acessibilidade em modais, isolamento de squad, tema claro/escuro), **When** auditados contra a suíte de testes, **Then** os itens DEVEM ser marcados como verificados (`- [x]`).
2. **Given** itens cuja verificação física é comprovadamente impossível no ambiente local automatizado (ex: testes manuais em múltiplos motores de renderização não instalados no host, OPP-003), **When** auditados, **Then** o checklist DEVE registrar formalmente a cláusula de bloqueio de ambiente, apontando o responsável e o escopo coberto por invariantes de código, sem deixar o item em aberto sem justificativa.
3. **Given** checklists de especificações antigas cujos escopos sofreram alterações consolidadas por deltas de Modo 2 posteriores, **When** reconciliados, **Then** os itens DEVEM referenciar a especificação sucessora ou o fechamento de ciclo no registro de mudanças.

---

### User Story 5 - Limpeza e Higienização Segura de Ramificações Obsoletas (Priority: P3)

Como engenheiro do repositório,
quero que as ramificações de trabalho locais e remotas que já foram integralmente incorporadas à linha principal `main` sejam removidas com segurança,
para que o repositório mantenha alta higiene operacional e os desenvolvedores não se confundam com ramificações antigas de ciclos anteriores.

**Why this priority**:
Há 14 ramificações locais e 3 remotas no repositório que já estão 100% mescladas na linha principal `main` (OPP-013). Sua permanência é desnecessária, consome referências no git e viola o princípio de limpeza do ambiente de trabalho.

**Independent Test**:
Pode ser testado executando `git branch --merged main` e `git branch -r --merged main`, comprovando que as ramificações históricas foram eliminadas com sucesso sem perda de nenhum commit na linha principal.

**Acceptance Scenarios**:
1. **Given** as 14 ramificações locais integradas (`019`, `020`, `021`, `022`, `023`, `024`, `025`, `026`, `027`, `028`, `029`, `031`, `032`, `035`), **When** executada a higienização segura, **Then** o comando `git branch -d` DEVE remover as ramificações locais, mantendo apenas a ramificação `main` ativa.
2. **Given** as 3 ramificações remotas integradas (`origin/024`, `origin/029`, `origin/031`), **When** executada a higienização com permissões de repositório, **Then** o sistema DEVE tentar a deleção remota direta (`git push origin --delete`), executando fallback gracioso para geração de script de comando com `git fetch --prune` caso a autenticação remota não permita push direto.
3. **Given** qualquer ramificação que contenha commits não integrados em `main`, **When** avaliada para exclusão, **Then** o sistema DEVE preservar a ramificação intacta e emitir alerta, impedindo exclusão forçada.

---

### Edge Cases

- **Como tratar especificações que possuem código na linha principal, mas o nome do diretório divergiu ligeiramente do registro de mudanças?**  
  A rastreabilidade é estabelecida através do número do prefixo (ex: `specs/035-...` mapeado ao item da Feature 035 no CHANGELOG.md), validando tanto os testes automatizados associados quanto o histórico do git.
- **O que acontece se uma funcionalidade tiver código mesclado, mas ausência no CHANGELOG.md?**  
  Pelo critério estrito de FR-024 da spec 043, se uma funcionalidade cumprir apenas uma das condições, ela é considerada ambígua e deve ser investigada antes da homologação de status.
- **O que fazer se um checklist possuir itens cuja medição automatizada é impossível no host (ex: motores WebKit no Windows)?**  
  Aplica-se estritamente a regra do Artigo III/IV da Constituição: nunca marcar como concluído sem evidência; registrar como Bloqueio de Ambiente formal, com identificação do responsável e declaração do escopo coberto por contratos.
- **O que acontece se a exclusão de ramificações remotas falhar por falta de token de push temporário?**  
  A higienização local (`git branch -d`) é executada e confirmada; a instrução exata para o mantenedor podar os ramos remotos é gerada e registrada no relatório de fechamento sem interromper a reconciliação dos artefatos do repositório.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE atualizar o cabeçalho de todas as especificações funcionais em `specs/*/spec.md` relativas a funcionalidades entregues (atendendo ao critério FR-024: código em `main` e referência no `CHANGELOG.md`), definindo o campo `**Status**:` de forma consistente no padrão canônico obrigatório `**Status**: Implemented & Verified (<data-ratificação>)` (ex: `**Status**: Implemented & Verified (2026-10-21)`).
- **FR-002**: O sistema DEVE introduzir o campo `**Status**:` padronizado em todas as especificações históricas que não o possuíam (`specs/005` a `specs/015`), acompanhado de data de referência da reconciliação.
- **FR-003**: O sistema DEVE manter inalterado o status `Draft` para quaisquer especificações de funcionalidades que ainda estejam em fase de planejamento, arquitetura ou implementação ativa não concluída.
- **FR-004**: O sistema DEVE eliminar integralmente os três marcadores de esclarecimento `[NEEDS CLARIFICATION]` existentes no arquivo `specs/023-team-access-control/spec.md`:
  - **FR-004.1**: Em FR-003, substituir a dúvida sobre auth-mode pela definição mandatória de autenticação e sessão local-first com chaveamento de perfis multi-usuário no `localStorage`, sem backend mandatório e com cloud sync opt-in (Constituição VIII.1 e VIII.5).
  - **FR-004.2**: Em FR-008, substituir a dúvida sobre permissões de convidado pela regra constitucional de que o papel `guest` possui acesso estritamente somente-leitura aos quadros da squad, com mutações e movimentações desabilitadas (Constituição VIII.4).
  - **FR-004.3**: Em FR-011, substituir a dúvida sobre escopo de quadros pela regra de que cada quadro pertence obrigatoriamente a uma squad específica, sem quadros órfãos, com auto-associação na criação (Constituição VIII.2 e CHANGELOG v0.2.0).
- **FR-005**: O sistema DEVE reconciliar os arquivos de tarefas `specs/005/tasks.md` a `specs/009/tasks.md`, marcando todas as 55 tarefas históricas de forma explícita como concluídas (`- [x]`) sob cabeçalho declaratório de capacidade entregue na versão `v0.1.0`.
- **FR-006**: O sistema DEVE auditar os checklists de requisitos e domínio existentes em `specs/*/checklists/*.md`, classificando cada item não marcado com uma resolução fundamentada:
  - Marcado como verificado (`- [x]`) quando comprovado por teste automatizado ou implementação verificável existente no código.
  - Marcado com cláusula de bloqueio de ambiente explícita quando a verificação exigir dependências ou motores externos indisponíveis no ambiente automatizado local (ex: múltiplos motores de browser físicos).
  - Marcado como não aplicável (`[N/A]`) com justificativa datada quando superado por deltas de Modo 2 subsequentes.
- **FR-007**: O sistema DEVE executar a remoção segura (`git branch -d`) das 14 ramificações locais de trabalho comprovadamente já integradas à linha principal `main` (`019`, `020`, `021`, `022`, `023`, `024`, `025`, `026`, `027`, `028`, `029`, `031`, `032`, `035`).
- **FR-008**: O sistema DEVE tentar remover automaticamente as 3 ramificações remotas já integradas (`origin/024`, `origin/029`, `origin/031`) via `git push origin --delete`, provendo fallback gracioso com instruções de comando para poda manual e sincronização local via `git fetch --prune` caso as credenciais locais não possuam permissão de escrita remota.
- **FR-009**: O sistema DEVE fornecer um teste ou script de validação automatizada (`tests/unit/documentaryGovernance.test.ts` ou script de auditoria equivalente) capaz de verificar:
  - Zero ocorrências de especificações entregues em estado `Draft` ou sem `Status`.
  - Zero ocorrências de marcadores `[NEEDS CLARIFICATION]` em especificações entregues.
  - Zero tarefas em aberto (`- [ ]`) nos artefatos históricos `specs/005` a `specs/009`.
  - Zero ramificações locais mescladas residuais no repositório.
- **FR-010**: O sistema NÃO DEVE alterar o comportamento funcional do código de produto nem violar a suíte de testes de 744 casos automatizados, mantendo 100% de estabilidade (Constituição III).
- **FR-011**: O sistema NÃO DEVE adicionar nenhuma nova dependência de biblioteca de terceiros no `package.json` (Constituição V - Simplicidade & YAGNI).
- **FR-012**: O sistema DEVE registrar as atualizações reconciliadas no Documento de Visão e Rumo (`specs/043-system-health-and-roadmap/vision.md`), promovendo as oportunidades OPP-010, OPP-011, OPP-012, OPP-013 e OPP-017 para a seção de oportunidades resolvidas (§4.3) com data de encerramento.

---

### Key Entities *(include if feature involves data)*

- **Especificação Funcional (Spec Document)**:
  - `path`: Caminho relativo em `specs/<NNN-feature>/spec.md`
  - `status`: Declaração formal de ciclo de vida (`Draft`, `Ready for Planning`, `In Progress`, `Implemented & Verified`)
  - `deliveryCriterionSatisfied`: Booleano determinando se atende a FR-024 (código em `main` + changelog)
  - `clarificationMarkersCount`: Quantidade de tags `[NEEDS CLARIFICATION]` no documento

- **Artefato de Tarefas Históricas (Historical Tasks Artifact)**:
  - `path`: Caminho relativo em `specs/<NNN-feature>/tasks.md`
  - `historicalStatus`: Identificador de entrega histórica vinculada à versão de lançamento
  - `pendingCheckboxesCount`: Contagem de marcadores `- [ ]` restantes no documento

- **Checklist de Domínio e Qualidade (Review Checklist)**:
  - `path`: Caminho relativo em `specs/<NNN-feature>/checklists/*.md`
  - `category`: Requisitos funcionais, arquitetura, domínio, acessibilidade ou segurança
  - `totalItems`: Contagem total de itens no checklist
  - `resolvedItems`: Quantidade de itens com resolução explícita (`[x]` ou justificativa)
  - `environmentBlocks`: Itens vinculados a restrições comprovadas do host

- **Ramificação de Trabalho (Work Branch)**:
  - `name`: Nome da ramificação (ex: `019-monte-carlo-simulation`)
  - `scope`: Local ou Remoto (`origin`)
  - `isMergedIntoMain`: Booleano comprovando se `git branch --merged main` contém a branch

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das especificações funcionais correspondentes a capacidades entregues possuem status declarado idêntico à realidade de entrega (`Implemented & Verified` ou `Implemented`), resultando em exatamente 0 funcionalidades entregues com status ambíguo, ausente ou em rascunho indevido.
- **SC-002**: Exatamente zero (0) marcadores de esclarecimento `[NEEDS CLARIFICATION]` permanecem abertos no arquivo `specs/023-team-access-control/spec.md`, estando todas as três decisões arquiteturais formalizadas e compatíveis com a Constituição VIII.
- **SC-003**: 100% dos 55 itens de tarefas anteriormente não marcados nos 5 arquivos de tarefas legados (`specs/005` a `specs/009`) são formalmente declarados e marcados como entregas históricas, reduzindo a 0 a contagem de tarefas pendentes nesses arquivos.
- **SC-004**: 100% dos checklists em `specs/*/checklists/*.md` têm seus itens auditados e categorizados, eliminando a ambiguidade documental apontada na oportunidade OPP-017.
- **SC-005**: 100% das 14 ramificações locais obsoletas e já integradas à linha principal são removidas, resultando em apenas `main` (e ramificações ativas em andamento) listadas em `git branch`.
- **SC-006**: A suíte de testes automatizados permanece 100% verde (744+ testes passando em 125+ arquivos), com zero regressões no pipeline de CI/CD.
- **SC-007**: As 5 oportunidades da Fase 2 do Roadmap (OPP-010, OPP-011, OPP-012, OPP-013, OPP-017) são formalmente registradas como resolvidas no Documento de Visão (`specs/043-system-health-and-roadmap/vision.md`), com data de encerramento auditável.

---

## Assumptions

- **Critério Canônico de Entrega (FR-024)**: Uma funcionalidade é considerada canonicamente entregue se, e somente se, seu código estiver integrado na linha principal `main` e suas capacidades estiverem documentadas no `CHANGELOG.md` do repositório.
- **Soberania Constitucional sobre Decisões de Arquitetura**: As decisões para os esclarecimentos da spec 023 são derivadas diretamente dos Artigos VII, VIII e IX da Constituição do Metrik (versão 1.7.0), não necessitando de deliberação externa por já representarem a lei máxima do produto.
- **Preservação de Histórico de Commits**: A exclusão de branches com `git branch -d` só ocorre para branches cuja totalidade de commits já está mesclada em `main`, garantindo que nenhum histórico de trabalho seja perdido.
- **Imutabilidade de Código de Produção**: Esta feature tem escopo puramente de governança, higienização de repositório e reconciliação documental; não há alteração de regras de negócio em componentes React, utilitários de fluxo ou hooks de dados.
- **Execução em Ambiente Windows com PowerShell**: Todos os comandos e scripts de validação de contagem documental devem ser compatíveis com PowerShell 7+ e plataformas Windows.
