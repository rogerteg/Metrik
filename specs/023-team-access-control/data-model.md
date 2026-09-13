# Data Model: Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad (Team Access Control)

**Feature**: `023-team-access-control` | **Date**: 2026-09-12 | **Branch**: `023-team-access-control`

---

## 1. Diagrama Conceitual Entidade-Relacionamento

```text
┌─────────────────┐       1:N       ┌─────────────────────┐
│      User       ├─────────────────┤     TeamMember      │
│  (id, name,     │                 │(id, teamId, userId, │
│   email, etc.)  │                 │ role: admin|member| │
└────────┬────────┘                 │        guest)       │
         │                          └──────────┬──────────┘
         │ 1:N (inviter)                       │ N:1
         ▼                                     ▼
┌─────────────────┐       N:1       ┌─────────────────────┐       1:N       ┌─────────────────┐
│ TeamInvitation  ├─────────────────┤        Team         ├─────────────────┤      Board      │
│(id, code, email,│                 │ (id, name, desc,    │                 │ (id, name,      │
│ role, status)   │                 │  createdById, etc.) │                 │  teamId, etc.)  │
└─────────────────┘                 └─────────────────────┘                 └─────────────────┘
```

---

## 2. Tipos e Interfaces TypeScript

### 2.1. Usuário (`User`)
Representa um operador autenticado na sessão do Metrik.

```typescript
export interface User {
  id: string; // UUID v4
  name: string; // Min 2 caracteres
  email: string; // Único, formato válido de e-mail
  avatarUrl?: string; // Opcional ou gerado a partir de iniciais
  createdAt: string; // ISO-8601
}
```

### 2.2. Time / Squad (`Team`)
Representa uma equipe autônoma com seus próprios quadros e membros.

```typescript
export interface Team {
  id: string; // UUID v4
  name: string; // Min 2 caracteres (ex: "Squad Checkout", "Time de Dados")
  description?: string; // Descrição opcional dos objetivos da squad
  createdById: string; // User.id do criador
  createdAt: string; // ISO-8601
}
```

### 2.3. Membro do Time (`TeamMember` e `TeamRole`)
Associação relacional entre um usuário e um time, com definição de privilégios.

```typescript
export type TeamRole = 'admin' | 'member' | 'guest';

export interface TeamMember {
  id: string; // UUID v4
  teamId: string; // Team.id
  userId: string; // User.id
  role: TeamRole; // 'admin' | 'member' | 'guest'
  joinedAt: string; // ISO-8601
}
```

### 2.4. Convite de Time (`TeamInvitation` e `InvitationStatus`)
Mecanismo de integração e onboarding de novos membros ou convidados para uma squad específica.

```typescript
export type InvitationStatus = 'pending' | 'accepted' | 'revoked';

export interface TeamInvitation {
  id: string; // UUID v4
  teamId: string; // Team.id da squad de destino
  email: string; // E-mail do convidado
  role: TeamRole; // Papel que assumirá ao aceitar ('admin' | 'member' | 'guest')
  invitedById: string; // User.id de quem enviou o convite
  code: string; // Código alfanumérico único (ex: "METRIK-ENG-4K9P")
  status: InvitationStatus; // 'pending' | 'accepted' | 'revoked'
  createdAt: string; // ISO-8601
  acceptedAt?: string; // ISO-8601 quando status === 'accepted'
}
```

### 2.5. Evolução do Quadro (`Board`)
Extensão da interface `Board` existente em `src/types/index.ts` adicionando a obrigatoriedade do vínculo com o time.

```typescript
export interface Board {
  id: string;
  name: string;
  teamId: string; // [EVOLUTION - Feature 023] ID do time proprietário do quadro
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Matriz de Permissões por Papel (RBAC Matrix)

| Ação no Sistema | Administrador (`admin`) | Membro (`member`) | Convidado (`guest`) | Não Membro |
|:---|:---:|:---:|:---:|:---:|
| **Visualizar Quadros e Tarefas do Time** | ✅ | ✅ | ✅ | ❌ Bloqueado |
| **Visualizar Métricas de Fluxo (Analytics)** | ✅ | ✅ | ✅ | ❌ Bloqueado |
| **Criar / Editar / Mover Tarefas** | ✅ | ✅ | ❌ Somente Leitura | ❌ Bloqueado |
| **Criar Novos Quadros para o Time** | ✅ | ❌ | ❌ | ❌ Bloqueado |
| **Configurar Colunas e Limites WIP** | ✅ | ❌ | ❌ | ❌ Bloqueado |
| **Enviar Convites para o Time** | ✅ | ❌ | ❌ | ❌ Bloqueado |
| **Remover Membros do Time** | ✅ (Exceto último admin) | ❌ | ❌ | ❌ Bloqueado |
| **Editar Nome / Descrição do Time** | ✅ | ❌ | ❌ | ❌ Bloqueado |

---

## 4. Chaves de Armazenamento Local (`localStorage`)

Para garantir persistência local-first sem dependência de APIs externas:

| Constante | Chave no `localStorage` | Descrição |
|:---|:---|:---|
| `USERS_STORAGE_KEY` | `metrik_users` | Lista de usuários registrados (`User[]`) |
| `ACTIVE_USER_STORAGE_KEY` | `metrik_active_user_id` | ID do usuário autenticado no momento (`string`) |
| `TEAMS_STORAGE_KEY` | `metrik_teams` | Lista de squads e times (`Team[]`) |
| `TEAM_MEMBERS_STORAGE_KEY` | `metrik_team_members` | Associação de membros e papéis (`TeamMember[]`) |
| `TEAM_INVITATIONS_STORAGE_KEY` | `metrik_team_invitations` | Registro de convites gerados (`TeamInvitation[]`) |

---

## 5. Máquina de Estados e Ciclo de Vida do Convite

```text
              [Admin cria convite]
                       │
                       ▼
                 ┌───────────┐
                 │  pending  │
                 └─────┬─────┘
                       │
           ┌───────────┴───────────┐
           │                       │
 [Convidado aceita]       [Admin revoga]
           │                       │
           ▼                       ▼
    ┌─────────────┐         ┌─────────────┐
    │  accepted   │         │   revoked   │
    └──────┬──────┘         └─────────────┘
           │
  (Gera registro em
     TeamMember)
```

---

## 6. Regras de Integridade e Validação

1. **Unicidade de E-mail**: Não é permitido cadastrar dois usuários com o mesmo e-mail (case-insensitive).
2. **Guarda do Último Administrador**: Um time deve obrigatoriamente possuir pelo menos 1 membro com papel `admin`. Se um time tiver apenas 1 admin, a tentativa de rebaixá-lo a `member` ou removê-lo do time é rejeitada com erro explícito.
3. **Não Duplicação de Associação**: Um usuário não pode ser adicionado duas vezes ao mesmo time.
4. **Resolução de Convite Conflitante**: Se um convite pendente for direcionado a um e-mail que já se tornou membro daquele time, o convite é considerado obsoleto.
5. **Migração Padrão (Default Squad)**: Se `localStorage` contiver boards existentes sem `teamId`, a função de carga inicial inicializa o time padrão `"default-team-main"` e associa todos os boards a ele, vinculando o primeiro usuário como admin desse time.
