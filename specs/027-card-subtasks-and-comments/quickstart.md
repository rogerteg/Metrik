# Quickstart: Verificação de Subtarefas e Comentários nos Cartões (027)

**Feature**: `027-card-subtasks-and-comments`
**Date**: 2026-09-14
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Contrato**: [contracts/subtask-comment.contract.md](contracts/subtask-comment.contract.md)

---

## 1. Pré-requisitos

- Dependências instaladas (`npm install`)
- Pelo menos um navegador moderno para a verificação de layout
- Um quadro com ao menos um cartão visível

## 2. Subir a aplicação

```bash
npm run dev          # desenvolvimento — http://localhost:5173/
npm run build        # produção — tsc + vite build
npm run preview      # servir o build — http://localhost:4173/
```

## 3. Verificação automatizada

```bash
npm run test         # suíte completa (Vitest)
npm run build        # zero erros de tipagem e bundling
```

Resultado esperado:

| Verificação | Resultado esperado |
|---|---|
| `cardChildren.test.ts` | Criação, normalização, alternância, remoção, contagens e permissões aprovadas — incluindo texto vazio e autor ausente |
| `CardChildrenSection.test.tsx` | Criação de subtarefa no cartão, alternância, remoção com confirmação, comentário do cartão e da subtarefa sem mistura |
| `useTaskCollection.test.ts` | Persistência dos filhos e ausência de alteração em coluna, bloqueio e timestamps de fluxo |
| `TaskDetailsModal.test.tsx` / `Task.test.tsx` | Paridade de capacidade entre modal e cartão; contagem de comentários exibida |
| Suíte completa | Sem regressão sobre os testes existentes |
| `npm run build` | Conclui sem erros |

O jsdom **não** calcula layout: as suítes verificam comportamento e invariantes de domínio. Altura de listas, rolagem contida e paridade visual são verificadas na seção 5.

## 4. Cenários de aceite (comportamento)

| # | Cenário | Passos | Resultado esperado |
|---|---|---|---|
| 1 | Criar subtarefa no cartão | Abrir o cartão no quadro e usar o campo de nova subtarefa | Subtarefa criada e visível no cartão; progresso recalculado (CC-01, CC-02, CC-03) |
| 2 | Concluir e reabrir | Alternar a conclusão duas vezes | Estado alterna nos dois sentidos e o progresso acompanha (CC-04) |
| 3 | Remover subtarefa | Remover e confirmar | Subtarefa desaparece; progresso recalculado (CC-05) |
| 4 | Comentário no cartão pai | Escrever e enviar no cartão | Comentário aparece com autor e momento (CC-06, CC-08) |
| 5 | Comentário na subtarefa | Expandir uma subtarefa e comentar | Comentário aparece **dentro da subtarefa** e não no cartão pai (CC-07, CI-05) |
| 6 | Ordem cronológica | Criar três comentários | Exibidos em ordem de criação (CC-09) |
| 7 | Editar e excluir | Editar um comentário próprio; excluir outro | Texto atualizado; exclusão pede confirmação (CC-10) |
| 8 | Texto vazio | Tentar criar subtarefa e comentário só com espaços | Nada é criado (CC-11) |
| 9 | Persistência | Recarregar a aplicação e trocar de quadro e voltar | Subtarefas e comentários permanecem no cartão correto (CC-12) |
| 10 | Contagem no cartão | Criar comentários no cartão | A contagem exibida no cartão corresponde (CC-13) |
| 11 | Textos longos | Inserir título e comentário longos | Quebram/truncam sem estourar a largura; listas mantêm rolagem própria (CC-14) |

## 5. Verificação em navegador real (layout e acessibilidade)

1. Abrir `npm run preview` em pelo menos dois motores distintos.
2. Medir, com o DevTools, a altura da área de filhos com um cartão de 50 subtarefas e 200 comentários: a lista deve manter rolagem própria, sem esticar o cartão além do limite definido (FR-020).
3. Inserir título de subtarefa e comentário muito longos e conferir que nada estoura a largura da coluna (FR-019).
4. Conferir paridade visual das novas superfícies entre navegadores, na mesma janela e ampliação (CI-07).
5. Percorrer todo o fluxo apenas pelo teclado: foco visível em campo de subtarefa, alternância de conclusão, campo de comentário e ações de editar/excluir (NFR-002).
6. Anotar os resultados neste arquivo.

## 6. Matriz de permissões (verificação manual)

Com um perfil convidado, repetir os cenários 1, 3, 4 e 7 e confirmar que **nenhuma** ação de escrita é oferecida (CI-04).

| Ação | Autor | Member (não autor) | Admin do time | Guest |
|---|---|---|---|---|
| Criar subtarefa | ☐ | ☐ | ☐ | indisponível |
| Comentar | ☐ | ☐ | ☐ | indisponível |
| Editar comentário | ☐ próprio | indisponível | indisponível | indisponível |
| Excluir comentário | ☐ próprio | indisponível | ☐ qualquer | indisponível |

## 7. Integridade com as demais features

| # | Verificação | Resultado esperado |
|---|---|---|
| A | Cartão bloqueado (feature 025) com subtarefa e comentário novos | Continua travado na coluna; nenhuma movimentação ocorre (CI-01) |
| B | Métricas de fluxo antes e depois de criar subtarefa/comentário | Valores inalterados (CI-02) |
| C | Concluir **todas** as subtarefas | O cartão não muda de coluna, não é marcado como concluído e as métricas não mudam (CI-03) |
| D | Exportar o quadro, limpar o quadro e importar o arquivo | Subtarefas e comentários retornam íntegros (CI-06) |

## 8. Encerramento

- [ ] `npm run test` e `npm run build` limpos
- [ ] Cenários de `§4` aprovados
- [ ] Verificação em navegador real de `§5` registrada
- [ ] Matriz de permissões de `§6` preenchida
- [ ] Integridade de `§7` confirmada
- [ ] Checklists `checklists/requirements.md` e `checklists/subtasks-and-comments.md` revisados pelo responsável
