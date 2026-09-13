# Research & Technical Decisions: Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad (Team Access Control)

**Feature**: `023-team-access-control` | **Date**: 2026-09-12 | **Branch**: `023-team-access-control`

---

## 1. Contexto & Fundamentação Teórica de Controle de Acesso por Equipe

O Metrik foi originalmente concebido com foco em gestão visual Kanban e métricas de fluxo, operando com boards globais. Com o crescimento organizacional, diferentes equipes (*squads*) necessitam de privacidade, autonomia e governança sobre seus próprios quadros de trabalho e métricas analíticas.

O modelo **Team-Based Access Control (TBAC)** associado a **Role-Based Access Control (RBAC)** básico resolve esse desafio através de três postulados:
1. **Fronteira de Squad (Boundary Isolation)**: O time é o contêiner de propriedade primário. Quadros pertencem a um time.
2. **Isolamento Não Negociável**: Um usuário só tem visibilidade e autorização de acesso aos quadros pertencentes aos times em que possui associação ativa de membro (`TeamMember`).
3. **Mecanismo de Convite Desacoplado**: A expansão de acesso a membros externos ou outros squads ocorre via convite explícito para aquela squad específica, com papéis diferenciados (`admin`, `member`, `guest`).

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Modelo de Sessão e Autenticação (Local-First Multi-User Switcher)
- **Opções Avaliadas**:
  - *Opção A*: Backend dedicado com OAuth2 / JWT / Firebase Authentication.
  - *Opção B*: Sessão Local-First estruturada com múltiplos perfis de usuário persistidos no `localStorage` (`metrik_users`, `metrik_active_user_id`) e seletor/cadastro no cabeçalho.
  - *Opção C*: Usuário fixo único sem suporte a múltiplos operadores.
- **Decisão**: **Opção B (Local-First Multi-User Switcher)**.
- **Justificativa**: Conforme o **Princípio V da Constituição (Simplicidade & YAGNI)**, o Metrik é uma aplicação client-side/local-first autônoma. O gerenciador de usuários local permite criar, simular e alternar instantaneamente entre diferentes usuários (ex: "Alice - Líder Squad Alfa", "Bob - Desenvolvedor Squad Alfa", "Carlos - Líder Squad Beta", "Diana - Convidada") na mesma máquina e navegador, sem exigir conexão com servidores ou dependências externas pesadas.

### Decisão 2: Modelo de Dados de Time, Associação com Boards e Chave Estrangeira
- **Opções Avaliadas**:
  - *Opção A*: Cada Board possui um atributo opcional `teamId?: string`.
  - *Opção B*: Cada Board possui um atributo obrigatório `teamId: string`, e as entidades `User`, `Team`, `TeamMember` e `TeamInvitation` são modeladas com integridade relacional.
  - *Opção C*: Time contém uma lista de IDs de boards (`team.boardIds: string[]`).
- **Decisão**: **Opção B (`Board.teamId: string` com entidades normalizadas)**.
- **Justificativa**: Garante que nenhum quadro exista órfão no sistema. A integridade relacional normalizada evita anomalias de sincronização em caso de exclusão ou renomeação de quadros, simplificando consultas de pertencimento em tempo constante $O(1)$.

### Decisão 3: Mecanismo de Isolamento Estrito de Quadros (Defense-in-Depth)
- **Opções Avaliadas**:
  - *Opção A*: Apenas ocultar quadros não autorizados no dropdown do `BoardSwitcher`.
  - *Opção B*: Defesa em três camadas:
    1. **Camada de Seleção**: `BoardSwitcher` só lista quadros dos times em que o usuário ativo é membro/convidado aceito.
    2. **Camada de Estado (Hook Guard)**: O hook `useBoards` intercepta a seleção e rejeita ativação de quadros não autorizados.
    3. **Camada Visual**: Se um quadro restrito for solicitado diretamente, renderiza uma tela segura de "Acesso Restrito: Requer Convite da Squad", redirecionando para o primeiro quadro válido do usuário.
- **Decisão**: **Opção B (Defesa em três camadas)**.
- **Justificativa**: Atende rigorosamente ao requisito do usuário: *"Os membros nao acessam os boards, de outros times, a menos que sejam convidados."*

### Decisão 4: Papéis de Acesso por Time (RBAC: Admin, Member, Guest)
- **Opções Avaliadas**:
  - *Opção A*: Papel binário (Membro / Não-membro).
  - *Opção B*: Três papéis explícitos:
    - `admin`: Gerenciar o time (editar nome/descrição, convidar, remover membros) e criar/gerenciar boards.
    - `member`: Colaboração plena no board (criar, mover, editar tarefas, ver métricas).
    - `guest` (Convidado): Acesso estritamente somente-leitura aos quadros e gráficos da squad (sem permissão de mover/criar cartões ou alterar colunas/limites WIP).
- **Decisão**: **Opção B (`admin` | `member` | `guest`)**.
- **Justificativa**: Atende explicitamente à demanda por convidados para acessar o sistema/squad sem risco de modificação acidental nas estruturas de fluxo.

### Decisão 5: Ciclo de Vida de Convites e Token Alfanumérico
- **Opções Avaliadas**:
  - *Opção A*: Apenas adicionar membro diretamente sem etapa de convite.
  - *Opção B*: Fluxo de convite com código alfanumérico único (`code`: ex: `METRIK-ALFA-7X9K`) e matching automático por e-mail:
    - Admin da squad convida informando o e-mail e papel.
    - Se o usuário já existe, o convite aparece em sua central de notificações/convites pendentes.
    - Qualquer usuário com o código de convite pode inseri-lo na tela de "Entrar em um Time com Código".
    - Ao aceitar, o convite passa de `pending` para `accepted` e cria o registro `TeamMember`.
- **Decisão**: **Opção B (Convites rastreáveis com código e status)**.
- **Justificativa**: Permite demonstrar fluxos de convite tanto de forma automatizada por e-mail simulado quanto manual via código de compartilhamento entre squads.

### Decisão 6: Migração Transparente de Dados Legados (Backward Compatibility)
- **Opções Avaliadas**:
  - *Opção A*: Apagar boards legados sem time.
  - *Opção B*: Criar automaticamente um time padrão inicial ("Time Padrão / Default Squad") e um usuário padrão ("Administrador Metrik") caso a base legado não possua usuários/times registrados, vinculando todos os boards existentes a esse time padrão.
- **Decisão**: **Opção B (Migração automática e preservação 100% dos dados)**.
- **Justificativa**: Em conformidade com o Critério de Sucesso `SC-003`, nenhum dado ou histórico existente de quadros, tarefas e métricas de fluxo do Metrik é perdido.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|:---|:---|:---|
| **Vazamento de Quadros em Multi-Abas** | Mudança de usuário em uma aba enquanto outra exibe o board anterior | Hook `useAuthSession` escuta evento de `storage` para sincronizar o usuário ativo e forçar re-validação imediata das permissões de board. |
| **Exclusão Acidental do Último Admin** | Admin único tenta sair da squad ou se rebaixar a membro | Regra de integridade: a interface desabilita a saída e o hook bloqueia a remoção com aviso estruturado `[Metrik] O time requer ao menos um administrador`. |
| **Conflito de Convites Duplicados** | Enviar novo convite para usuário que já é membro | Verificação prévia no `useTeamInvitations`: se o e-mail já pertencer a um `TeamMember` ativo ou possuir convite pendente, emite alerta informativo. |
| **Regressão nos 266 Testes Legados** | Adição do campo `teamId` no tipo `Board` quebrando testes existentes | O helper de criação de boards e fixtures legado terá `teamId` padrão retrocompatível (ex: `'default-team-id'`), garantindo 100% de sucesso contínuo. |
