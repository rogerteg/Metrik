# Quickstart: 054 — Previsibilidade Dinâmica & Alertas de SLE

**Feature**: `054-dynamic-sle-predictive-alerts`  
**Date**: 2026-11-03  
**Status**: Ready for Verification  

---

## 1. Visão Geral

Este guia descreve os passos para verificar manualmente ou via testes automatizados os alertas preditivos de SLE diretamente nos cartões do quadro Kanban.

---

## 2. Cenários de Verificação

### Cenário 1: Badge Preditivo P50 (Atenção)
1. Certifique-se de que o quadro possui pelo menos 5 tarefas concluídas, com mediana histórica de ciclo (P50) = 2 dias e P85 = 4 dias.
2. Crie ou mova uma tarefa para "Em Progresso" com data de início simulada de 2.5 dias atrás.
3. Observe o cartão no quadro:
   - **Resultado Esperado**: O cartão exibe badge sutil na cor amarela `⏳ Atenção (P50)`, indicando que atingiu a mediana histórica.

### Cenário 2: Badge Preditivo P85 (Risco de SLE)
1. Crie ou mova uma tarefa para "Em Progresso" com data de início de 4.2 dias atrás.
2. Observe o cartão no quadro:
   - **Resultado Esperado**: O cartão exibe badge destacado na cor laranja `⚠️ Risco SLE (P85)`, alertando que a expectativa de nível de serviço foi rompida.

### Cenário 3: Tooltip / Popover Analítico
1. Posicione o cursor do mouse sobre o badge `⚠️ Risco SLE (P85)`.
2. **Resultado Esperado**: Um popover elegante se abre exibindo:
   - Tempo decorrido (ex: 4,2 dias).
   - Régua com P50 (2d), P85 (4d) e P95 (7d).
   - Indicação de estouro: `+0,2 dias além do SLE (P85)`.

### Cenário 4: Filtro de Foco Rápido
1. Na barra de filtros, selecione a opção `Risco de SLE`.
2. **Resultado Esperado**: Apenas os cartões que estão com alertas P50, P85 ou P95 permanecem visíveis. Cartões saudáveis (< P50) são temporariamente filtrados.

### Cenário 5: Conclusão do Cartão
1. Arraste o cartão em risco para a coluna `Concluído` (`done`).
2. **Resultado Esperado**: O badge preditivo desaparece instantaneamente, pois o item não está mais em andamento.

