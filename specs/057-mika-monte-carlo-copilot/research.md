# Research & Architecture Decisions: Mika AI Copilot Preditivo de Monte Carlo

**Feature**: `057-mika-monte-carlo-copilot`  
**Date**: 2026-11-05  
**Spec Reference**: [`specs/057-mika-monte-carlo-copilot/spec.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/057-mika-monte-carlo-copilot/spec.md)  

---

## 1. Decisões Técnicas e Arquitetura

### Decisão 1: Decomposição Modular da Telemetria e Heurísticas de Monte Carlo
- **Contexto**: A Constituição (Princípio II) impõe o teto estrito de $\le 400$ linhas por arquivo de código. Atualmente, [`mikaContextBuilder.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaContextBuilder.ts) possui 166 linhas e [`mikaChatHeuristicEngine.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaChatHeuristicEngine.ts) possui 196 linhas. Adicionar toda a lógica de compilação estocástica e geradores de templates conversacionais nesses arquivos poderia aproximá-los perigosamente do limite.
- **Decisão**: Criar módulos especializados e isolados:
  - `src/services/ai/mikaMonteCarloContext.ts` (~120 linhas): Responsável por extrair o histórico de vazão do quadro, validar a amostra NIST ($N \ge 10$), resolver escopos de iniciativas e sprints via [`src/utils/monteCarloForecast.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/monteCarloForecast.ts) e compilar o snapshot `MikaMonteCarloTelemetry`.
  - `src/services/ai/mikaMonteCarloHeuristics.ts` (~160 linhas): Responsável por classificar intenções estocásticas em linguagem natural e sintetizar templates determinísticos para sub-10ms offline local.
- **Trade-off & Rationale**: Mantém todos os arquivos abaixo de 250 linhas, elimina acoplamento excessivo e permite testes unitários cirúrgicos e focados.
- **Alternativas Rejeitadas**:
  - *Inserir tudo dentro de `mikaChatHeuristicEngine.ts`*: Rejeitado por violar o Princípio II a médio prazo e concentrar responsabilidades distintas.

---

### Decisão 2: Reutilização Total das Funções Puras da Feature 056
- **Contexto**: A Feature 056 entregou funções puras de Monte Carlo em [`src/utils/monteCarloForecast.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/monteCarloForecast.ts): `resolveBacklogScope`, `validateThroughputSample`, `calculateTargetDateProbability` e `runBacklogMonteCarloForecast`.
- **Decisão**: O copilot da Mika importará e executará diretamente essas funções puras, garantindo paridade matemática exata ($\pm 0\%$) entre os percentis reportados pela Mika no chat e os dados visualizados no painel gráfico.
- **Rationale**: Evita divergência de cálculos (*split-brain* estatístico) e respeita o Princípio V (YAGNI & Simplicidade).

---

### Decisão 3: Caráter Consultivo e Mecanismo de CTA (Call-to-Action)
- **Contexto**: A Constituição (Princípio X.2) estabelece que o assistente é estritamente consultivo e não pode realizar mutações de estado autônomas. Além disso, a Clarificação 3 estabeleceu que o clique na ação consultiva fecha o drawer lateral e navega o usuário diretamente para a aba de Previsão de Backlog no Analytics com o escopo pré-selecionado.
- **Decisão**: A estrutura de mensagens da Mika suportará um payload opcional de ação consultiva `action?: MikaForecastActionPayload`:
  ```typescript
  export interface MikaForecastActionPayload {
    type: 'NAVIGATE_TO_FORECAST';
    label: string;
    scopeType: 'initiative' | 'sprint' | 'all' | 'tag';
    scopeId?: string;
  }
  ```
  O componente `MikaMessageContent.tsx` renderizará um botão de atalho visual caso esse payload esteja presente. Ao ser clicado, ele dispara o callback `onNavigateToForecast(scopeType, scopeId)` fornecido pelo `App.tsx`, fechando o drawer lateral e atualizando a rota/aba ativa.
- **Rationale**: Respeita 100% o Princípio X (interação mediada pelo usuário, sem auto-execução) e proporciona uma experiência fluida entre o diagnóstico conversacional e a exploração visual detalhada.

---

### Decisão 4: Suporte Híbrido — Heurística Local Offline vs. LLM Gemini
- **Contexto**: A Constituição (Princípio VIII e X.1) exige funcionamento 100% offline em sub-10ms via heurística determinística, com integração com LLM externo (Gemini) como aprimoramento opcional quando configurado.
- **Decisão**:
  1. *Local / Offline*: `mikaMonteCarloHeuristics.ts` analisa termos-chave normalizados (ex: *"previsao"*, *"quando"*, *"entrega"*, *"iniciativa"*, *"prazo"*, *"capacidade"*, *"cabem"*, *"sprint"*) e responde formatando os dados de `MikaMonteCarloTelemetry` em Markdown limpo com ícones e percentis.
  2. *Cloud / Gemini*: O resumo textual gerado em `buildBoardTelemetryContext` é injetado nas instruções de sistema do Gemini (`mikaContextBuilder.ts`), permitindo que a IA generativa contextualize as respostas mantendo a precisão estatística.

---

## 2. Padrões de Design e Melhores Práticas Adotados
1. **Single Source of Truth**: Métricas estocásticas calculadas a partir das mesmas estruturas de dados de tarefas e colunas do Kanban.
2. **Deterministic String Normalization**: Uso de `normalizeQuery` (remoção de diacríticos e lowercase) para casamentos robustos no motor heurístico offline.
3. **Resguardo Amostral NIST**: Alerta automático em todas as respostas preditivas quando $N < 10$ dias com entregas registradas.
4. **Interactive Read-Only Chips**: Menções de tarefas como `#ID` continuam acionando `onOpenTaskDetails` sem efeitos colaterais.

