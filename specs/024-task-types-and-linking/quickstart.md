# Quickstart & Guia de Validação: Tipos de Tarefas, Vinculação Hierárquica e Vínculos Cross-Squad

**Feature**: `024-task-types-and-linking` | **Date**: 2026-09-13 | **Branch**: `024-task-types-and-linking` | **Status**: Implemented & Converged

---

## 1. Visão Geral dos Cenários de Teste

Este guia orienta a validação prática dos fluxos de classificação de tipos de tarefas (`Iniciativa`, `Card`, `Subtarefa`), vinculação relacional local e anexo de dependências de outros times/squads (cross-squad) no Metrik.

---

## 2. Cenários Manuais Passo a Passo

### Cenário 1: Classificação Visual de Tipos nos Cartões
1. Abra a aplicação em [http://localhost:5173/](http://localhost:5173/).
2. No quadro Kanban ativo, clique em **"Nova Tarefa"**:
   - **Título**: "Plataforma de Pagamentos V2"
   - **Tipo**: Selecione `Iniciativa 🎯`
3. Crie uma segunda tarefa:
   - **Título**: "Implementar Webhook Stripe"
   - **Tipo**: Selecione `Card 📋` (Padrão)
4. Crie uma terceira tarefa:
   - **Título**: "Escrever testes de idempotência"
   - **Tipo**: Selecione `Subtarefa 🔹`
5. **Resultado esperado**:
   - Cada cartão exibe no seu cabeçalho um badge nítido com ícone e texto (`🎯 Iniciativa`, `📋 Card`, `🔹 Subtarefa`) com suas cores semânticas temáticas.
   - O layout se ajusta harmoniosamente em todos os modos de tema (`dark`, `light`, `neutral`).

---

### Cenário 2: Vinculação Relacional entre Tarefas Locais
1. Clique no cartão "Plataforma de Pagamentos V2" (Iniciativa) para abrir o `TaskDetailsModal`.
2. Localize a seção **"Vínculos & Dependências"**.
3. Clique em **"Adicionar Vínculo"**:
   - **Tipo de Relação**: `Sub-item (Filho / Decomposição)`
   - **Tarefa Alvo**: Selecione "Implementar Webhook Stripe"
4. Clique em **"Confirmar Vínculo"**.
5. Abra os detalhes de "Implementar Webhook Stripe":
   - **Resultado esperado**: O cartão lista automaticamente "Plataforma de Pagamentos V2" como `Pertence a (Pai / Superior)` de forma bidirecional.
   - Na frente do cartão Kanban, ambos exibem contador de vínculos (`🔗 1 vínculo`).

---

### Cenário 3: Anexar Tarefa de Outro Time / Squad (Cross-Squad)
1. Certifique-se de que existem pelo menos duas squads cadastradas (ex: "Squad Frontend" e "Squad Backend").
2. No quadro da "Squad Frontend", abra o modal da tarefa "Checkout SPA".
3. Na seção de vínculos, selecione a opção **"Vincular Tarefa de Outro Time / Squad"**:
   - **Squad Alvo**: Selecione `Squad Backend`
   - **Quadro Alvo**: Selecione `API Gateway`
   - **Tarefa Alvo**: Selecione `Endpoint de Autorização v2`
   - **Tipo de Relação**: Selecione `É bloqueado por 🔒`
4. Clique em **"Vincular Dependência Externa"**.
5. **Resultado esperado**:
   - O modal e o cartão da tarefa "Checkout SPA" exibem um chip destacado: `🏢 Squad Backend • Endpoint de Autorização v2 • [Em Progresso]`.
   - Se o usuário clicar no chip e fizer parte da Squad Backend, uma opção de navegação rápida para o quadro remoto é disponibilizada.

---

### Cenário 4: Alerta Preventivo de Dependência Pendente e Confirmação (Soft Block)
1. Com a tarefa "Checkout SPA" ainda bloqueada pela tarefa externa não concluída:
   - Verifique que o cartão exibe uma sinalização visual de dependência pendente (`🔒 Dependência Pendente`).
2. Tente arrastar ou mover o cartão "Checkout SPA" diretamente para a coluna **"Concluído" (`done`)**.
3. **Resultado esperado**:
   - O sistema intercepta a ação e exibe um diálogo de confirmação amigável: *"Atenção: Esta tarefa possui dependências pendentes ainda não concluídas na Squad Backend. Deseja concluir mesmo assim?"*
   - O operador pode optar por **"Cancelar"** (mantendo o cartão onde estava) ou **"Confirmar Conclusão"** (movendo para `done`).

---

### Cenário 5: Barra de Progresso Reativa de Iniciativas
1. Na Iniciativa "Plataforma de Pagamentos V2" com 2 tarefas filhas vinculadas:
2. Mova 1 das tarefas filhas para a coluna **"Concluído" (`done`)**.
3. **Resultado esperado**:
   - O cartão da Iniciativa exibe uma barra de progresso em `50%` com o texto `1/2 concluídas (50%)`.
4. Mova a 2ª tarefa filha para `done`.
   - O progresso atinge `100%`.

---

## 3. Comandos de Verificação Automatizada

```bash
# 1. Executar suíte dedicada de tipos e vínculos
npx vitest run tests/unit/taskTypesAndLinking.test.ts

# 2. Executar suíte completa de regressão do Metrik (287+ testes)
npm test

# 3. Executar type checking estrito e build de produção
npm run build
```
