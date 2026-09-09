# Quickstart: Roteiro de Testes Manuais de Drag-and-Drop

**Feature**: `003-drag-and-drop-interaction`  
**Date**: 2026-09-08  
**Status**: Ready  

---

## 🎯 Objetivo dos Testes
Validar visual e interativamente no navegador a movimentação fluida de cartões via arrastar e soltar (HTML5 Drag & Drop), com feedback de destaque visual, reordenação e preservação dos botões direcionais.

---

## 📋 Cenários de Validação

### Cenário 1: Arrastar entre Colunas Adjacentes (`Todo` ➔ `In Progress`)
1. Localize um cartão na coluna `A Fazer` (`Todo`).
2. Clique no corpo do cartão e mantenha pressionado o botão do mouse.
3. Arraste-o sobre a coluna `Em Progresso` (`In Progress`).
   - *Verificação intermediária*: O cartão original deve adquirir opacidade reduzida (`.task-card-dragging`) e a coluna destino deve exibir borda de destaque com brilho sutil (`.kanban-column-drop-target`).
4. Solte o botão do mouse sobre a coluna.
   - *Resultado esperado*: O cartão passa para `Em Progresso`, o contador da coluna é atualizado e o timestamp `startedAt` é registrado.

### Cenário 2: Arrastar para `Completed` e Verificar Métricas
1. Arraste um cartão de `Em Progresso` e solte na coluna `Concluído` (`Completed`).
   - *Resultado esperado*: O cartão passa para `Concluído`, ganha os badges de `Lead: ...` e `Cycle: ...`, e a `MetricsBar` no topo atualiza o Throughput e as médias de tempo imediatamente.

### Cenário 3: Reabertura de Tarefa (`Completed` ➔ `In Progress`)
1. Arraste o cartão de `Concluído` de volta para `Em Progresso`.
   - *Resultado esperado*: O cartão perde os badges de tempo concluído, o throughput na `MetricsBar` decrementa em tempo real e o timestamp `completedAt` volta a ser nulo.

### Cenário 4: Reordenação Vertical na Mesma Coluna
1. Na coluna `A Fazer`, observe a ordem de 2 ou mais cartões (ex: Tarefa 1, Tarefa 2, Tarefa 3).
2. Arraste a Tarefa 3 e solte antes da Tarefa 1.
   - *Resultado esperado*: A Tarefa 3 passa a ser a primeira do topo da coluna. Recarregue a página (`F5`) e confirme que a nova ordem permanece salva no `localStorage`.

### Cenário 5: Respeito à Política de Soft WIP Limit
1. Na coluna `Em Progresso` com limite 2, se houver 2 cartões, arraste um terceiro cartão para ela.
   - *Resultado esperado*: O cartão é solto com sucesso, e a coluna e o badge exibem imediatamente o alerta âmbar (`3/2 ⚠️`).

### Cenário 6: Arrastar para Coluna Vazia
1. Esvazie uma coluna movendo seus itens para outras colunas.
2. Arraste um cartão qualquer para a coluna vazia.
   - *Resultado esperado*: A coluna vazia oferece área receptora visível e aceita o drop, posicionando o cartão nela.

### Cenário 7: Não Interferência na Edição de Texto (`AutoResizeTextarea`)
1. Clique no título de qualquer cartão para editar seu texto.
2. Selecione uma palavra com o mouse ou arraste para selecionar um trecho de texto.
   - *Resultado esperado*: A seleção de texto funciona perfeitamente sem iniciar o arraste acidental do cartão.

### Cenário 8: Botões Direcionais Preservados (Acessibilidade)
1. Clique no botão `→` no rodapé de um cartão.
   - *Resultado esperado*: O cartão se move para a coluna adjacente à direita normalmente, garantindo acessibilidade e operação sem mouse.
