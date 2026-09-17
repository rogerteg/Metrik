# Quickstart: Validação da Distribuição e Categorização dos Gráficos Analíticos

**Feature Branch**: `030-categorized-flow-analytics`  
**Date**: 2026-09-17  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Cenários de Validação Rápida

### Cenário 1: Navegação Fluida Entre as 8 Categorias
1. Inicie a aplicação localmente (`npm run dev`) ou execute o ambiente de testes.
2. Acesse a visão analítica clicando no botão **"Analytics"** na barra superior do Metrik.
3. Clique sequencialmente em cada uma das 8 abas de categoria:
   - **Dashboard**: Confirme a presença dos cartões de síntese executiva (*SLE*, *WIP*, *Vazão*, *Bloqueios*) e gráficos integrados.
   - **Cycle Time**: Confirme a exibição do gráfico de dispersão com percentis e teste a troca para Histograma via menu suspenso.
   - **Throughput**: Confirme a exibição da taxa de entrega e histograma de vazão.
   - **WIP**: Confirme a exibição do gráfico de envelhecimento (*WIP Aging*).
   - **Flow**: Confirme a renderização do Diagrama de Fluxo Cumulativo (*CFD*).
   - **Blockers**: Confirme a alternância entre *Blocker Clustering* e *Blocker Dynamics*.
   - **SLEs**: Confirme o monitoramento de conformidade do nível de serviço.
   - **Forecasting**: Confirme a simulação probabilística de Monte Carlo.

---

### Cenário 2: Validação dos Cartões de Síntese Executiva do Dashboard
1. Com tarefas cadastradas e concluídas no quadro, acesse a aba **Dashboard**.
2. Verifique o card **Cycle Time / SLE**:
   - Deve exibir o tempo no percentil 85% (ex.: *"X dias ou menos para concluir 85% dos itens"*).
3. Verifique o card **WIP Ativo**:
   - Deve contabilizar o total exato de itens em colunas com categoria `in_progress`.
4. Clique no card de SLE para confirmar navegação direta para a aba detalhada correspondente.

---

### Cenário 3: Configuração do Conjunto de Dados (Dataset Configuration)
1. Na barra superior do módulo analítico, clique no botão lateral **"Configuração do Conjunto de Dados"** (ícone de filtro/engrenagem).
2. Verifique a abertura suave da gaveta retrátil (*Slide-over*).
3. Altere o período de amostragem de "Últimos 30 dias" para "Últimos 14 dias":
   - Confirme que os dados de todas as abas são recalculados para refletir a nova janela amostral.
4. Feche a gaveta e confirme a indicação visual de que há filtros ativos.

---

## 2. Comandos de Verificação Automatizada

Execute a suíte de testes unitários e de build:

```bash
# Executar todos os testes unitários (Vitest)
npm run test

# Validar tipagem estrita do TypeScript e compilação do bundle de produção (Vite)
npm run build
```
