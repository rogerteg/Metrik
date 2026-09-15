# Contract: Subtask & Comment (Card Children Contract)

**Feature**: `027-card-subtasks-and-comments`
**Date**: 2026-09-14
**Type**: UI contract (comportamento observável e permissões) — o produto é local-first, sem API externa
**Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md)

---

## 1. Objetivo

Declarar as obrigações observáveis de subtarefas e comentários, de modo que a verificação possa ser feita por comportamento observável e não por inspeção de código.

## 2. Termos canônicos

| Termo | Significado |
|---|---|
| **Cartão pai** | Cartão do quadro que contém subtarefas e comentários próprios |
| **Subtarefa (cartão filho)** | Passo do trabalho vinculado a um cartão, com estado de conclusão e comentários próprios |
| **Comentário** | Anotação textual com autor e momento, vinculada a um cartão **ou** a uma subtarefa |
| **Autor** | Perfil ativo no momento do registro |
| **Somente leitura** | Condição de acesso em que nenhuma escrita é oferecida (perfil convidado) |

## 3. Matriz de Permissões

`✅` permitido · `❌` indisponível · `✅ próprio` permitido apenas sobre o próprio conteúdo

| Ação | Autor do conteúdo | Member (não autor) | Admin do time | Guest (somente leitura) |
|---|---|---|---|---|
| Criar subtarefa | ✅ | ✅ | ✅ | ❌ |
| Alternar conclusão de subtarefa | ✅ | ✅ | ✅ | ❌ |
| Remover subtarefa | ✅ | ✅ | ✅ | ❌ |
| Criar comentário (cartão ou subtarefa) | ✅ | ✅ | ✅ | ❌ |
| Editar comentário | ✅ próprio | ❌ | ❌ | ❌ |
| Excluir comentário | ✅ próprio | ❌ | ✅ qualquer | ❌ |

**Decisão provisória**: esta matriz implementa a decisão **D3** de `research.md` e responde ao item `CHK037`. Requer ratificação via `/speckit-clarify`; o ponto de mudança é um único predicado de permissão.

## 4. Contrato de Comportamento Observável

| ID | Obrigação | Requisito |
|---|---|---|
| CC-01 | O cartão oferece criação de subtarefa sem exigir a abertura do modal | FR-001 |
| CC-02 | Cada subtarefa exibe identificação visível (título) e estado de conclusão no contexto do cartão | FR-002 |
| CC-03 | O indicador de progresso do cartão reflete concluídas/total e é atualizado imediatamente | FR-003 |
| CC-04 | Alternar conclusão é possível a partir do cartão, nos dois sentidos | FR-004, FR-024 |
| CC-05 | Remover subtarefa exige confirmação prévia | FR-005 |
| CC-06 | O cartão oferece campo de comentário próprio | FR-006 |
| CC-07 | Cada subtarefa oferece campo de comentário próprio, distinto do cartão | FR-007 |
| CC-08 | Todo comentário exibe autor e momento do registro | FR-008 |
| CC-09 | Comentários são exibidos em ordem cronológica de criação | FR-009 |
| CC-10 | Comentário pode ser editado e excluído conforme a matriz de `§3`, com confirmação na exclusão | FR-010 |
| CC-11 | Texto vazio ou só com espaços não cria subtarefa nem comentário | FR-011 |
| CC-12 | Subtarefas e comentários permanecem após recarregar a aplicação e após trocar de quadro | FR-012 |
| CC-13 | A contagem de comentários do cartão é exibida no próprio cartão | FR-015 |
| CC-14 | Textos longos quebram ou truncam dentro do cartão, e as listas mantêm rolagem própria | FR-019, FR-020 |

## 5. Contrato de Integridade com as Demais Features

| ID | Obrigação | Requisito |
|---|---|---|
| CI-01 | Criar subtarefa ou comentário não altera a coluna do cartão e não libera cartão bloqueado | FR-017 (feature 025) |
| CI-02 | Nenhuma operação de filho altera `startedAt`, `completedAt`, `blocked`, `blockedAt` ou `totalBlockedMs` | FR-018 (features 002/013) |
| CI-03 | Concluir todas as subtarefas não altera automaticamente o cartão pai | FR-018 (decisão D5) |
| CI-04 | Em quadro somente leitura, nenhuma escrita é oferecida | FR-016 (feature 023) |
| CI-05 | Comentários da subtarefa não são exibidos como comentários do cartão pai, e vice-versa | FR-007 (invariante 2) |
| CI-06 | O ciclo exportar → importar de quadro preserva subtarefas e comentários | FR-012 (feature 006) |
| CI-07 | As novas superfícies mantêm paridade de renderização entre navegadores | NFR-006 (feature 026) |

## 6. Contrato de Diagnóstico

Falhas de leitura ou de gravação no caminho de mutação (armazenamento indisponível, conteúdo corrompido) são reportadas com o prefixo estável `[Metrik Guard]`, informando a operação e a entidade afetada, sem interromper a interface. Nenhum dado sensível, nenhuma telemetria remota.

## 7. Itens Fora deste Contrato

- Aparência visual (cores, tipografia) — coberta pelas features de tema.
- Histórico de edições de um comentário (auditoria) — fora de escopo.
- Notificações, menções e anexos — fora de escopo.
- Renomear o título de uma subtarefa existente — fora de escopo nesta feature (lacuna `CHK020` registrada para emenda futura da spec).
