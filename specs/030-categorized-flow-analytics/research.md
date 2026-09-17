# Research & Technical Decisions: Distribuição e Categorização dos Gráficos Analíticos de Fluxo

**Feature Branch**: `030-categorized-flow-analytics`  
**Date**: 2026-09-17  
**Spec**: [spec.md](spec.md)

---

## 1. Contexto & Objetivos

Esta pesquisa estabelece a arquitetura técnica para redistribuir e categorizar todos os gráficos analíticos de fluxo do Metrik em 8 categorias navegáveis (*Dashboard*, *Cycle Time*, *Throughput*, *WIP*, *Flow*, *Blockers*, *SLEs*, *Forecasting*), incorporando cartões de síntese executiva (*Metric Summary Cards*) e uma gaveta retrátil de configuração do conjunto de dados (*Dataset Configuration*).

---

## 2. Decisões Técnicas

### Decisão 1: Arquitetura de Navegação & Distribuição de Categorias
- **Opções Avaliadas**:
  - *Opção A*: Instalação de biblioteca de roteamento externa (ex.: React Router / TanStack Router).
  - *Opção B*: Gerenciador de estado reativo unificado no `AnalyticsDashboard` com componente desacoplado `AnalyticsNavHeader`, submenus suspensos e sincronização com parâmetros de visualização.
  - *Opção C*: Renderização de todos os gráficos em página única com navegação por scroll (âncoras).
- **Decisão**: **Opção B (Gerenciador de Estado Reativo + `AnalyticsNavHeader` com Submenus Suspensos)**.
- **Justificativa**: Em estrita conformidade com o Princípio V da Constituição (Simplicidade & YAGNI), o Metrik já possui um ecossistema reativo baseado em hooks puros. Adicionar roteadores externos aumentaria o bundle e complexidade desnecessariamente. A abordagem modular permite transições visuais instantâneas (< 50ms) e isolamento dos gráficos pesados (evita renderizações concorrentes desnecessárias).

---

### Decisão 2: Motor de Cálculo de SLEs (Service Level Expectations) e Indicadores de Síntese
- **Opções Avaliadas**:
  - *Opção A*: Valor fixo arbitrário codificado em constante.
  - *Opção B*: Cálculo 100% estatístico instantâneo sobre a distribuição de tarefas concluídas (P85 por padrão via interpolação NIST).
  - *Opção C*: Abordagem Híbrida: Cálculo estatístico automático sobre o histórico com capacidade de sobrescrita e definição de meta de SLE nas políticas do quadro.
- **Decisão**: **Opção C (Abordagem Híbrida: Cálculo Estatístico P85 NIST + Meta de SLE Configurável)**.
- **Justificativa**: Permite que o Metrik apresente imediatamente no *Dashboard* e na aba *SLEs* cartões como *"15 dias ou menos para concluir 85% dos itens"* no modo Local-First sem exigir qualquer configuração prévia, ao mesmo tempo em que capacita times que possuem metas contratuais formais a cadastrar seu SLE alvo e acompanhar a conformidade real.

---

### Decisão 3: Arquitetura da Categoria de Bloqueios (Blocker Clustering & Dynamics)
- **Opções Avaliadas**:
  - *Opção A*: Exibir apenas a lista simples de tarefas bloqueadas.
  - *Opção B*: Módulo analítico dedicado com alternância entre *Blocker Clustering* (frequência e distribuição por causa-raiz/tags de impedimento) e *Blocker Dynamics* (duração acumulada em milissegundos `totalBlockedMs` e impacto no Lead Time).
- **Decisão**: **Opção B (Módulo Analítico Especializado de Bloqueios)**.
- **Justificativa**: Atende diretamente à demanda de diagnóstico de impedimentos da gestão ágil moderna, transformando os campos já existentes no modelo (`blocked`, `blockedReason`, `blockedAt`, `totalBlockedMs`) em inteligência visual e acionável.

---

### Decisão 4: Painel de Configuração do Conjunto de Dados (`Dataset Configuration Drawer`)
- **Opções Avaliadas**:
  - *Opção A*: Barra fixa ocupando espaço horizontal contínuo no topo da página.
  - *Opção B*: Gaveta lateral retrátil (*Slide-over Drawer*) com botão de controle colapsável.
  - *Opção C*: Modal invasivo que bloqueia a visualização dos gráficos.
- **Decisão**: **Opção B (Gaveta Lateral Retrátil com Preservação de Contexto)**.
- **Justificativa**: Maximiza o espaço útil da tela para os gráficos de alta densidade (CFD, Dispersão, Monte Carlo), permitindo que o usuário abra as configurações do conjunto de dados apenas quando for filtrar intervalos de amostragem (14d, 30d, 90d ou customizado).

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco Técnico | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Lentidão em quadros com grande histórico** | Recálculo de percentis e simulação Monte Carlo em cada troca de aba | Memoização via `useMemo` com chaves de dependência bem delimitadas (`tasks`, `datasetFilterConfig`). |
| **Divisão por zero em quadros sem tarefas concluídas** | Cálculo de SLE em quadros recém-criados | Fallback defensivo com estados vazios instrutivos e explicativos. |
| **Violação de Marca de Terceiros (Constitution VII)** | Nomes de produtos ou referências externas vazadas no código | Revisão estrita de nomenclatura técnica: termos padronizados (*Service Level Expectations*, *Cumulative Flow Diagram*, *Blocker Clustering*). |
| **Vazamento de dados entre squads no filtro de dataset** | Filtro de dataset tentar acessar cartões de outros times | Isolamento estrito TBAC garantido pelo hook `useTeamAccess`. |
