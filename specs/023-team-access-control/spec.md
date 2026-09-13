# Feature Specification: Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad (Team Access Control)

**Feature Branch**: `023-team-access-control`  
**Created**: 2026-09-12  
**Status**: Implemented & Verified  
**GitHub Issues**: [#37](https://github.com/rogerteg/Metrik/issues/37), [#38](https://github.com/rogerteg/Metrik/issues/38), [#39](https://github.com/rogerteg/Metrik/issues/39), [#40](https://github.com/rogerteg/Metrik/issues/40), [#41](https://github.com/rogerteg/Metrik/issues/41), [#42](https://github.com/rogerteg/Metrik/issues/42), [#43](https://github.com/rogerteg/Metrik/issues/43)  
**Input**: Solicitação do usuário: *"Criar função cadastro de usuario, cadastro de times, convidados para acessar o sistema, convite especifico daquela squad/time especifico. Os membros nao acessam os boards, de outros times, a menos que sejam convidados."*

---

## 1. Visão Geral & Contexto

Atualmente, o Metrik opera com suporte a múltiplos quadros (Feature 010), porém todos os quadros são globais e visíveis para qualquer usuário da sessão local. À medida que o Metrik é adotado por organizações com múltiplas squads e diferentes níveis de privacidade, torna-se essencial estabelecer fronteiras de governança e controle de acesso baseado em equipes (*Team-Based Access Control*).

Esta funcionalidade introduz o ecossistema completo de:
1. **Cadastro e Perfil de Usuários**: Identificação de quem está operando o sistema (nome, e-mail, avatar/iniciais, perfil ativo).
2. **Cadastro e Estrutura de Times / Squads**: Criação e administração de equipes autônomas (ex: "Squad Engenharia", "Squad Produto", "Squad Growth").
3. **Isolamento Estrito de Quadros (Board Isolation)**: Cada quadro Kanban pertence a um time específico. Membros de um time **NÃO** visualizam nem acessam quadros de outras equipes, a menos que tenham sido convidados.
4. **Sistema de Convites Específicos por Time**: Envio e aceitação de convites com papéis definidos (`admin`, `member`, `guest`), permitindo que convidados externos ou membros de outros squads participem exclusivamente das equipes para as quais foram autorizados.

---

## 2. User Scenarios & Casos de Teste *(mandatory)*

### User Story 1 - Cadastro de Usuários e Gestão de Perfil Ativo (Priority: P1)

Como usuário do Metrik, quero me cadastrar na plataforma com meu nome, e-mail e avatar, e alternar facilmente entre perfis de usuário cadastrados, para que o sistema identifique quem está criando tarefas, operando quadros e recebendo convites.

**Why this priority**: É a entidade fundamental do sistema; todas as permissões, autoria de cartões, participação em times e convites dependem da identidade do usuário ativo.

**Independent Test**:
- O usuário abre o diálogo de perfil/usuários, cadastra um novo usuário informando nome e e-mail.
- O sistema valida dados obrigatórios e adiciona o usuário à lista de usuários ativos.
- O usuário ativo atual é exibido claramente no cabeçalho com seu avatar/iniciais.
- Ao alternar o usuário ativo, a interface atualiza o contexto da sessão imediatamente.

**Acceptance Scenarios**:
1. **Given** que o usuário está na tela inicial, **When** clica em "Cadastrar Usuário" e fornece nome válido e e-mail único, **Then** o usuário é criado com sucesso e fica disponível na lista de perfis.
2. **Given** um formulário de cadastro, **When** o usuário tenta cadastrar com e-mail inválido ou nome em branco, **Then** o sistema exibe mensagens de validação claras e bloqueia o salvamento.
3. **Given** múltiplos usuários cadastrados, **When** o operador seleciona outro perfil ativo, **Then** a sessão corrente é chaveada e apenas os times/quadros autorizados para aquele perfil são exibidos.

---

### User Story 2 - Cadastro e Administração de Times / Squads (Priority: P1)

Como líder ou membro de equipe, quero criar um novo time/squad (com nome e descrição) e gerenciar seus integrantes, para que nossa equipe tenha seu próprio espaço de trabalho independente.

**Why this priority**: O time é a fronteira primária de isolamento e agrupamento de quadros Kanban no Metrik.

**Independent Test**:
- O usuário clica em "Novo Time / Squad" no menu de times, informa nome ("Squad Checkout") e descrição.
- O time é criado, tendo o criador automaticamente atribuído como Administrador (`admin`) do time.
- O novo time aparece na lista de squads do usuário e passa a ser selecionável como contexto de trabalho.

**Acceptance Scenarios**:
1. **Given** um usuário ativo autenticado, **When** ele cria um novo time informando nome e descrição, **Then** o time é registrado e o usuário atual se torna o primeiro membro com papel `admin`.
2. **Given** a listagem de times, **When** o usuário acessa os detalhes de um time do qual faz parte, **Then** visualiza a lista de membros atuais e seus respectivos papéis.

---

### User Story 3 - Isolamento Estrito de Quadros por Time (Priority: P1)

Como membro de um time/squad, quero que os quadros Kanban do meu time sejam estritamente confidenciais e inacessíveis para membros de outros times, garantindo que ninguém de fora veja nossos cartões, fluxos e métricas sem permissão.

**Why this priority**: É o requisito não negociável central solicitado pelo usuário: *"Os membros nao acessam os boards, de outros times, a menos que sejam convidados."*

**Independent Test**:
- Usuário A cria o "Time Alfa" e o quadro "Quadro Alfa".
- Usuário B cria o "Time Beta" e o quadro "Quadro Beta".
- Usuário B autenticado tenta selecionar o "Quadro Alfa" no seletor de boards ou via navegação.
- O sistema omite "Quadro Alfa" do seletor de B e, caso haja tentativa de acesso forçado, bloqueia a renderização exibindo tela de "Acesso Restrito: Requer Convite para o Time Alfa".

**Acceptance Scenarios**:
1. **Given** um usuário pertencente apenas ao Time A, **When** ele abre o seletor de quadros (`BoardSwitcher`), **Then** apenas os quadros pertencentes ao Time A (ou times em que ele participa) são listados.
2. **Given** um usuário tentando acessar um identificador de quadro pertencente ao Time B, **When** o usuário não possui vínculo nem convite aceito para o Time B, **Then** o sistema nega o acesso, impedindo leitura de tarefas, métricas de fluxo e histórico.
3. **Given** um quadro compartilhado, **When** um novo quadro é criado, **Then** o formulário exige a vinculação com um dos times dos quais o usuário é membro.

---

### User Story 4 - Convite Específico de Membros e Convidados para a Squad (Priority: P2)

Como administrador ou membro de um time, quero convidar outros usuários ou convidados externos especificamente para a minha squad, definindo seu papel (`member` ou `guest`), para que eles ganhem acesso exclusivamente aos quadros daquela squad específica.

**Why this priority**: Permite colaboração cruzada e inclusão de stakeholders/convidados sem quebrar o princípio de isolamento dos demais times da empresa.

**Independent Test**:
- O admin do "Time Alfa" envia um convite para o e-mail de um convidado (Usuário C) com papel `guest`.
- O convite é listado como pendente com token/código exclusivo de acesso.
- O Usuário C visualiza e aceita o convite.
- Ao aceitar, o Usuário C passa a ter acesso aos quadros do "Time Alfa", continuando sem visibilidade sobre os quadros de quaisquer outros times.

**Acceptance Scenarios**:
1. **Given** um administrador de time, **When** ele convida um usuário informando e-mail e selecionando o papel (`member` ou `guest`), **Then** um registro de convite é gerado para aquela squad específica.
2. **Given** um usuário que recebeu um convite para o Time A, **When** ele aceita o convite, **Then** seu perfil é adicionado aos membros do Time A com o papel atribuído e os quadros do Time A tornam-se imediatamente visíveis em seu seletor.
3. **Given** um usuário convidado para o Time A, **When** ele navega no Metrik, **Then** ele NÃO tem visibilidade nem acesso aos quadros do Time B ou Time C.
4. **Given** um administrador de time, **When** ele revoga um convite pendente ou remove um membro do time, **Then** o acesso daquele usuário aos quadros daquele time é revogado imediatamente.

---

## 3. Edge Cases

- **Tentativa de acesso direto por URL/ID de Board de outro time**: O sistema deve interceptar a carga do board no hook de dados e exibir um estado amigável de autorização negada, redirecionando para o primeiro board válido do usuário.
- **Usuário sem nenhum time cadastrado**: Usuário recém-criado deve ser direcionado para uma tela de acolhimento ("Onboarding") para criar sua primeira squad ou aguardar/inserir um código de convite.
- **Exclusão ou saída do último administrador do time**: O sistema deve impedir que o último administrador de um squad saia do time ou seja excluído sem antes promover outro membro a administrador.
- **Convite duplicado para o mesmo usuário no mesmo time**: O sistema deve alertar que o usuário já é membro ou já possui convite pendente ativo.
- **Quadros legados existentes no Metrik**: Na inicialização com dados existentes, os quadros pré-existentes devem ser migrados/associados automaticamente a um time padrão ("Time Padrão / Default Squad") pertencente ao primeiro usuário ativo.
- **Convite para usuário que ainda não possui cadastro no sistema**: O convite deve permanecer pendente pelo e-mail; quando o convidado criar sua conta com aquele e-mail (ou aceitar o link/código do convite), a vinculação é realizada automaticamente.

---

## 4. Requisitos Funcionais *(mandatory)*

### Cadastro de Usuários e Sessão
- **FR-001**: O sistema DEVE permitir o cadastro de novos usuários com nome, e-mail único e avatar/iniciais.
- **FR-002**: O sistema DEVE manter o registro de usuários persistido e permitir a alternância do usuário ativo na sessão atual.
- **FR-003**: O sistema DEVE implementar gerenciamento de sessão local-first com chaveamento de perfis multi-usuário no `localStorage` [NEEDS CLARIFICATION: auth-mode - Como o Metrik opera como SPA client-side sem backend obrigatório, a autenticação e troca de perfil devem operar via sessão local-first com simulação multi-usuário ou requer integração externa com backend OAuth2/Firebase?].

### Cadastro e Gestão de Times (Squads)
- **FR-004**: O sistema DEVE permitir a criação de times/squads com nome obrigatório, descrição opcional e identificador único.
- **FR-005**: Ao criar um time, o criador DEVE ser associado automaticamente como membro com papel de Administrador (`admin`).
- **FR-006**: O sistema DEVE permitir a listagem de todos os times aos quais o usuário ativo pertence.
- **FR-007**: O sistema DEVE permitir a administradores do time editar dados da equipe e remover membros (desde que não remova o último administrador).

### Convites e Papéis
- **FR-008**: O sistema DEVE permitir o envio de convites específicos para um time/squad, atribuindo papéis de `admin`, `member` ou `guest` [NEEDS CLARIFICATION: guest-permissions - Usuários com papel 'Convidado' (Guest) devem possuir acesso estritamente somente-leitura aos boards da squad ou podem também criar e mover cartões nas colunas?].
- **FR-009**: Cada convite DEVE possuir um código/token identificador, data de geração, e-mail do convidado, time vinculado e status (`pending`, `accepted`, `revoked`).
- **FR-010**: O usuário convidado DEVE ser capaz de aceitar o convite, passando a integrar a equipe imediatamente com o papel atribuído.

### Controle de Acesso e Isolamento de Quadros
- **FR-011**: Cada quadro Kanban DEVE estar associado a um time/squad específico [NEEDS CLARIFICATION: board-creation-scope - Todo novo quadro deve obrigatoriamente pertencer a um time, ou devem ser suportados quadros pessoais individuais não vinculados a squads?].
- **FR-012**: O seletor de quadros (`BoardSwitcher`) DEVE exibir estritamente os quadros pertencentes aos times em que o usuário ativo é membro ou convidado aceito.
- **FR-013**: O sistema DEVE bloquear qualquer leitura, consulta de métricas ou escrita em quadros cujo time não possua o usuário ativo em sua lista de membros/convidados válidos.
- **FR-014**: Na primeira execução com dados legados existentes, os quadros pré-existentes DEVEM ser associados de forma transparente a um time padrão inicial para evitar perda de dados.

---

## 5. Entidades Principais (Key Entities)

- **User**:
  - `id`: string (UUID)
  - `name`: string
  - `email`: string
  - `avatarUrl` / `initials`: string
  - `createdAt`: string (ISO-8601)

- **Team (Squad)**:
  - `id`: string (UUID)
  - `name`: string
  - `description`: string
  - `createdById`: string (User ID)
  - `createdAt`: string (ISO-8601)

- **TeamMember**:
  - `id`: string (UUID)
  - `teamId`: string (Team ID)
  - `userId`: string (User ID)
  - `role`: `'admin' | 'member' | 'guest'`
  - `joinedAt`: string (ISO-8601)

- **TeamInvitation**:
  - `id`: string (UUID)
  - `teamId`: string (Team ID)
  - `email`: string
  - `role`: `'admin' | 'member' | 'guest'`
  - `invitedById`: string (User ID)
  - `code`: string (token alfanumérico ou link)
  - `status`: `'pending' | 'accepted' | 'revoked'`
  - `createdAt`: string (ISO-8601)

- **Board (Evolução)**:
  - Extensão do modelo existente de `Board` adicionando o atributo obrigatório `teamId: string`.

---

## 6. Critérios de Sucesso Mensuráveis *(mandatory)*

- **SC-001 (Isolamento Estrito)**: 100% dos quadros pertencentes a times dos quais o usuário ativo não é membro ficam ocultos no seletor de quadros e inacessíveis por rotas diretas.
- **SC-002 (Ciclo de Convite)**: Um usuário convidado consegue aceitar um convite de time em menos de 3 cliques (ou colando o código/clicando no convite pendente) e visualizar instantaneamente os quadros do time convidado.
- **SC-003 (Preservação de Dados Legados)**: 100% dos quadros e tarefas legados continuam operacionais e são atribuídos a um time inicial sem perda de dados na migração de schema.
- **SC-004 (Qualidade e Regressão Zero)**: Mínimo de 15 novos testes unitários cobrindo isolamento de time, cadastro de usuários, aceite de convites e integridade de permissões, mantendo 100% de sucesso nos 266 testes existentes do Metrik.

---

## 7. Premissas e Suposições (Assumptions)

- **Persistência Inicial Local-First**: Como o Metrik é uma aplicação web autônoma client-side, o sistema utilizará armazenamento estruturado no `localStorage` com repositórios tipados, possibilitando demonstrar e alternar entre múltiplos perfis de usuários na mesma máquina.
- **Independência de Marca (Princípio VII da Constituição)**: Todas as nomenclaturas serão proprietárias e neutras (*Metrik Team Access Control*, *Squad Governance*), sem menção a produtos de terceiros.
- **Compatibilidade com Design System e Temas (Feature 022)**: Todos os novos componentes de interface (diálogos de usuário, modais de time e convite, banners de permissão) devem suportar perfeitamente os temas Claro, Escuro e Neutro recém-implementados.
