# Research & Architectural Decisions: Mika Conversational AI Chat Copilot (Feature 052)

**Feature Branch**: `052-mika-ai-chat`  
**Date**: 2026-10-29  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Executive Summary

A **Feature 052** transforma a Mika AI de uma gaveta de diagnósticos estáticos em um **copiloto conversacional interativo em linguagem natural (Chat)** integrado ao [`MikaDrawer`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaDrawer.tsx). O chat permite consultas em tempo real sobre gargalos de fluxo, envelhecimento de WIP, tarefas bloqueadas, conformidade com SLE de 85% e projeções de entrega, operando com redundância dupla:
1. **Google Gemini API (BYOK)**: Síntese inteligente e contextual com envio de histórico multi-turn das últimas 6 mensagens e telemetria do quadro em tempo real.
2. **Motor Determinístico Local-First (Offline)**: Classificador de intenções por palavras-chave com templates dinâmicos acoplado ao [`mikaHeuristicEngine`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaHeuristicEngine.ts), respondendo em <10ms sem internet e sem custos de tokens.

---

## 2. Technical Decisions & Trade-off Analysis

### Decisão 1: Arquitetura de Navegação da Gaveta (Tabs vs Interface Unificada)
- **Decisão Escolhida**: Implementar **navegação por abas** no topo do [`MikaDrawer`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaDrawer.tsx) — aba **"💬 Chat"** (ativa por padrão) e aba **"📊 Diagnósticos"** (cards consolidados da Feature 048).
- **Racional Técnico**:
  - A janela de chat necessita de rolagem vertical própria e campo de digitação fixo no rodapé. Misturar cards estáticos no mesmo fluxo de rolagem causaria atrito cognitivo e disputa de espaço visual.
  - As abas isolam o ciclo de vida e a renderização do chat sem quebrar o componente [`MikaInsightCard`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaInsightCard.tsx) já testado e aprovado.
- **Alternativas Rejeitadas**:
  - *Layout em acordeão vertical*: Rejeitado por reduzir a área visível do chat para menos de 300px em monitores padrão.
  - *Substituição total dos cards*: Rejeitado para preservar a visualização sintética e imediata dos diagnósticos sem exigir que o usuário digite perguntas.

---

### Decisão 2: Política de Retenção Local e Janela Deslizante de Contexto Multi-Turn
- **Decisão Escolhida**:
  - **Armazenamento no Navegador (`localStorage`)**: Janela deslizante de **30 mensagens** por quadro em regime FIFO (*First-In, First-Out*), sob a chave `metrik_mika_chat_${boardId}`.
  - **Janela de Contexto para a API LLM**: Envio das **últimas 6 mensagens** (3 turnos pergunta/resposta do usuário e da Mika), precedidas pelo *system prompt* dinâmico com a telemetria do quadro.
- **Racional Técnico**:
  - 30 mensagens de texto formatado consom ~25KB, representando menos de 0,5% da cota típica de 5MB do `localStorage`, respeitando a soberania Local-First (Princípio VIII).
  - 6 mensagens anteriores garantem coerência para perguntas encadeadas ("e na coluna de homologação?", "quantos dias ela tem de média?") mantendo a latência baixa e consumo econômico de tokens na API Gemini.
- **Alternativas Rejeitadas**:
  - *Histórico ilimitado no `localStorage`*: Rejeitado por risco de estouro de quota em sessões prolongadas.
  - *Apenas 1 pergunta sem contexto anterior (Single-Turn)*: Rejeitado por impedir perguntas naturais de acompanhamento (*follow-up*).

---

### Decisão 3: Motor Heurístico Offline Local-First (Sem LLM no Navegador)
- **Decisão Escolhida**: Desenvolver um **Classificador Determinístico de Intenções por Palavras-Chave e Raízes Semânticas com Injeção de Telemetria** ([`mikaChatHeuristicEngine.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaChatHeuristicEngine.ts)).
- **Mapeamento de Intenções**:
  - `bottleneck`: palavras-chave `gargalo`, `estrangulamento`, `acumulo`, `travado`, `onde esta`.
  - `blocked`: palavras-chave `bloquead*`, `impedid*`, `impedimento`, `travad*`.
  - `sle`: palavras-chave `sle`, `percentil`, `85%`, `tempo de ciclo`, `cycle time`, `estabilidade`.
  - `forecast`: palavras-chave `previs*`, `quando`, `prazo`, `entrega`, `monte carlo`, `vazao`, `throughput`.
  - `wip`: palavras-chave `wip`, `limite`, `capacidade`, `sobrecarga`.
  - `general_help`: saudações, ajuda geral ou comandos não mapeados.
- **Racional Técnico**:
  - Execução ultra-rápida (< 5 milissegundos), determinística, auditável e 100% testável via Vitest.
  - Adiciona **zero dependências externas e zero megabytes** ao bundle (aderente ao Princípio V - Simplicidade & YAGNI).
- **Alternativas Rejeitadas**:
  - *Modelos LLM quantizados via WebAssembly (Transformers.js / WebLLM)*: Rejeitados por exigirem download de 50MB a 500MB no primeiro carregamento, consumirem até 1GB de RAM do usuário e violarem a performance enxuta do Metrik.

---

### Decisão 4: Interatividade de Tarefas Citadas nas Mensagens (Links Clicáveis)
- **Decisão Escolhida**: Criação de um analisador de texto leve ([`MikaMessageContent.tsx`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaMessageContent.tsx)) que detecta menções a IDs de tarefas (padrões como `#123`, `tarefa #123`, `card #123`) e títulos conhecidos de tarefas do quadro, renderizando-os como chips clicáveis que disparam o callback `onOpenTask(taskId)`.
- **Racional Técnico**:
  - Transforma o diagnóstico passivo em ação imediata de destravamento de fluxo, conectando o chat diretamente ao [`TaskDetailsModal`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TaskDetailsModal.tsx).
  - Se a tarefa não for encontrada no quadro ativo, o ID permanece como texto simples sem quebra de execução.
- **Alternativas Rejeitadas**:
  - *Texto puro sem links*: Rejeitado pela decisão do usuário no ciclo de Clarify (Opção A).
  - *Modificação automática de cartões pelo chat*: Estritamente proibida pelo Princípio IX (Segurança de Dados) e FR-009 (Mika é estritamente consultiva).

---

### Decisão 5: Injeção de Telemetria Dinâmica do Quadro (Context Builder)
- **Decisão Escolhida**: Implementar [`mikaContextBuilder.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaContextBuilder.ts) que sintetiza em tempo real:
  - Título do quadro e lista de colunas com limites de WIP e quantidade atual de tarefas.
  - Coluna com maior tempo médio de permanência e coluna com maior acúmulo de WIP.
  - Lista de tarefas bloqueadas com seus IDs, títulos, tempo no bloqueio e justificativas.
  - Percentil de 85% do tempo de ciclo (SLE) dos últimos 30 dias.
  - Throughput médio semanal e taxa de bloqueio percentual.
  - Instruções de sistema de tom: técnico, cordial, conciso, focado em fluxo contínuo e sem menção a produtos concorrentes (Princípio VII).
- **Racional Técnico**:
  - Garante respostas precisas e matematicamente grounded (ancoradas na realidade do quadro), eliminando alucinações.

---

### Decisão 6: Cópia Rápida de Resposta com Acessibilidade
- **Decisão Escolhida**: Cada balão de resposta da Mika terá um botão `Copiar resposta` posicionado no rodapé da mensagem. Ao clicar, utiliza `navigator.clipboard.writeText`, exibindo badge `Copiado!` por 2 segundos e anunciando `aria-live="polite"` para leitores de tela.
