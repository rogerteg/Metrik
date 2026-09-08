# Quickstart: Limites de WIP e Métricas de Fluxo (Fase 2)

## Visão Geral
Este guia descreve como validar e testar localmente as novas capacidades de Limites de WIP e Métricas de Fluxo (Lead Time e Cycle Time) no Metrik.

---

## 1. Execução Local

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Executar a suíte de testes unitários
npm test
```

---

## 2. Roteiro de Testes Manuais

### Teste 1: Limite de WIP e Destaque de Sobrecarga (US1)
1. Acesse `http://localhost:5173/`.
2. Observe o cabeçalho da coluna `In Progress`: deve exibir o contador com limite (ex: `1/3`).
3. Mova mais 3 tarefas para `In Progress` (totalizando 4 tarefas).
4. **Resultado esperado**:
   - O contador passa a exibir `4/3 ⚠️`.
   - A coluna adquire borda e badge em tom âmbar indicando sobrecarga de WIP.
5. Clique no número do limite (`3`) no cabeçalho: um input inline deve se abrir.
6. Altere o valor para `5` e pressione `Enter`: a sobrecarga desaparece imediatamente e o contador passa a `4/5`.

---

### Teste 2: Métricas de Lead Time e Cycle Time no Cartão (US2)
1. Na coluna `Todo`, adicione uma nova tarefa: `"Análise de Gargalo"`.
2. Imediatamente, clique na seta `→` para movê-la para `In Progress`.
3. Aguarde alguns segundos e clique na seta `→` até a coluna `Completed`.
4. **Resultado esperado**:
   - O cartão na coluna `Completed` passa a exibir badges com o Lead Time (ex: `< 1m`) e Cycle Time (ex: `< 1m`).

---

### Teste 3: Barra de Métricas do Quadro (US3)
1. Observe a barra superior de métricas (Metrics Bar) abaixo do cabeçalho.
2. **Resultado esperado**:
   - Indicador de `Throughput` exibe a contagem total de itens concluídos.
   - Indicador de `Lead Time Médio` exibe o tempo médio formatado.
   - Indicador de `Cycle Time Médio` exibe o tempo médio de ciclo.
3. Se todas as tarefas forem limpas via "Limpar Quadro", a barra exibe `-` graciosamente sem erros.
