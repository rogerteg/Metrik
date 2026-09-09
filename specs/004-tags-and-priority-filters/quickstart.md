# Quickstart: Roteiro de Testes Manuais de Tags e Filtros

**Feature**: `004-tags-and-priority-filters`  
**Date**: 2026-09-09  
**Status**: Ready  

---

## 🎯 Objetivo dos Testes
Validar visual e interativamente no navegador a atribuição de prioridades, adição/remoção de etiquetas (tags), busca textual instantânea e filtros rápidos, assegurando a integridade do fluxo Kanban.

---

## 📋 Cenários de Validação

### Cenário 1: Definir e Alterar Nível de Prioridade no Cartão
1. No quadro, localize um cartão na coluna `A Fazer` (`Todo`).
2. Clique no seletor de prioridade do cartão e escolha `Alta` (`High`).
   - *Resultado esperado*: O cartão exibe um badge laranja elegante "Alta" e borda sutil.
3. Altere para `Urgente` (`Urgent`).
   - *Resultado esperado*: O badge muda para vermelho vibrante "Urgente".
4. Recarregue a página (`F5`) e confirme que a prioridade persiste no cartão.

### Cenário 2: Adicionar Etiquetas (Tags Coloridas)
1. No mesmo cartão, clique na área de tags ou no botão "+ Tag".
2. Digite "Bug" e pressione Enter.
   - *Resultado esperado*: Um chip colorido "Bug" com botão de fechar `×` é adicionado ao cartão.
3. Adicione uma segunda tag: "Frontend".
   - *Resultado esperado*: Um segundo chip com cor temática distinta é adicionado ao lado.

### Cenário 3: Remover uma Etiqueta
1. No cartão com as tags "Bug" e "Frontend", clique no botão `×` da tag "Bug".
   - *Resultado esperado*: A tag "Bug" é removida imediatamente do cartão, mantendo "Frontend".

### Cenário 4: Busca Textual em Tempo Real
1. Na barra de filtros localizada no topo do quadro, digite uma palavra presente no título de apenas um cartão (ex: "Arquitetura").
   - *Resultado esperado*: Em menos de 50ms, apenas os cartões que contêm a palavra permanecem visíveis.
   - O contador exibe "Exibindo 1 de X tarefas".
   - As colunas sem tarefas correspondentes exibem mensagem de filtro vazio.

### Cenário 5: Filtro por Nível de Prioridade
1. Na barra de filtros, selecione o filtro de prioridade `Alta`.
   - *Resultado esperado*: Apenas tarefas com prioridade "Alta" são exibidas.
2. Mude para `Urgente` e confirme a filtragem imediata.

### Cenário 6: Filtro por Tag
1. Na barra de filtros, clique no chip de tag "Frontend".
   - *Resultado esperado*: Apenas cartões contendo a tag "Frontend" são exibidos.

### Cenário 7: Limpar Todos os Filtros
1. Com filtros ativos (busca ou tag), clique no botão "Limpar Filtros".
   - *Resultado esperado*: O campo de busca é esvaziado, os seletores voltam para "Todas", e todos os cartões retornam à exibição normal.

### Cenário 8: Arrastar Cartão sob Filtro Ativo
1. Com um filtro ativo exibindo apenas 2 cartões, arraste um deles de `Todo` para `In Progress`.
   - *Resultado esperado*: O movimento e a reordenação ocorrem com perfeição, sem quebrar o estado nem desordenar tarefas ocultas.
