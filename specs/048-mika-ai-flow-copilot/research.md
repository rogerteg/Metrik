# Research & Architecture Decisions: Mika — AI Flow Copilot (Ciclo 5)

**Feature**: `048-mika-ai-flow-copilot`  
**Input Spec**: [spec.md](./spec.md)  
**Status**: Completed

---

## 1. Integração com Provedor de IA: Google Gemini API (BYOK)

### Decisão
Utilizar a **Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)** diretamente via `fetch` HTTP nativo do navegador, sem instalar SDKs pesados de terceiros no `package.json`.

### Racional
- **Constituição V (Simplicidade & YAGNI):** Evita adicionar pacotes como `@google/generative-ai` ou `openai` que inflariam o bundle do Vite desnecessariamente. A API REST v1beta do Gemini é direta, padronizada e extremamente simples de invocar via JSON payload.
- **Performance e Cota:** O modelo `gemini-1.5-flash` oferece latência típica < 800ms, cota gratuita generosa de 15 RPM (requisições por minuto) e janela de contexto ampla, ideal para envio da telemetria de tarefas.
- **Soberania do Usuário:** O modelo adotado é BYOK (*Bring Your Own Key*). O usuário insere sua chave no Metrik, que faz chamadas diretas do navegador para a API do Google, sem passar por intermediários.

### Alternativas Consideradas
- *SDK Oficial (`@google/generative-ai`)*: Rejeitado por adicionar 180+ kB ao bundle quando chamadas `fetch` nativas de 40 linhas resolvem 100% da necessidade.
- *OpenAI GPT-4o-mini*: Descartado como provedor padrão por exigir cartão de crédito obrigatório sem cota gratuita inicial, criando atrito de entrada para novos usuários.

---

## 2. Motor Analítico Heurístico Local (Offline First)

### Decisão
Implementar o `MikaHeuristicEngine` puro em TypeScript como motor de fallback e modo offline padrão.

### Racional
- **Constituição I (Model Integrity & Soberania Local):** O Metrik é uma aplicação Local-First. Se o usuário estiver offline, em rede corporativa restrita ou sem chave de API, a Mika deve funcionar com precisão matemática completa.
- **Regras Heurísticas Baseadas em Métricas:**
  - *Gargalo de Coluna*: Quando a taxa de WIP/capacidade de uma coluna excede o limite estipulado ou o tempo médio de permanência da coluna for 2x superior à média das demais.
  - *Risco de SLE (Cycle Time)*: Tarefas cujo tempo de permanência já ultrapassou o percentil 50 e estão caminhando para o percentil 85.
  - *Previsibilidade de Monte Carlo*: Tradução algorítmica direta do percentil 85: *"Existe 85% de probabilidade estatística de entregar o escopo atual em até X dias (data estimada: DD/MM)"*.

---

## 3. Estratégia de Segurança e Persistência de Chaves

### Decisão
Persistir a chave no `localStorage` com ofuscação (Base64 com seed rotativo local), nunca logar a chave no console, exibi-la sempre mascarada na interface (`AIzaSy...****`) e disponibilizar botão de desconexão e purga imediata.

### Racional
- **Constituição III (Qualidade e Segurança):** Previne que pessoas visualizando a tela do usuário ou ferramentas de inspeção casual capturem a chave em texto plano.
- **Conformidade com a Clarificação Q5**: Cumpre exatamente a diretriz aceita pelo usuário.

---

## 4. Cache Reativo e Invalidação Inteligente

### Decisão
Implementar cache de diagnósticos baseado na tupla `(boardId, tasksChecksum, filterSignature)` no `localStorage` ou memória (`MikaCacheManager`).

### Racional
- **Economia de Tokens e Latência Zero na Navegação:** Quando o usuário navega entre os dashboards de CFD, Dispersão de Cycle Time e Kanban, a Mika exibe o diagnóstico em < 5ms a partir do cache local se o quadro não sofreu alterações.
- **Invalidação Reativa:** Sempre que uma tarefa for criada, editada, movida de coluna ou os filtros de data forem alterados, o checksum do quadro muda e a Mika invalida o cache, oferecendo a opção de recálculo.

---

## 5. Arquitetura da Interface da Mika (Design System)

### Decisão
Criar o módulo de estilos `src/styles/14-mika.css` (ou integrá-lo de forma canônica aos módulos existentes) e os componentes React:
- `MikaTriggerButton`: Botão elegante no cabeçalho superior (`AppHeader`) com ícone estilizado e pulso sutil quando houver alertas críticos.
- `MikaDrawer`: Gaveta lateral retrátil de 380px com glassmorphism, suporte completo aos temas Dark, Light e High Contrast.
- `MikaInsightCard`: Card de diagnóstico executivo compacto posicionado no topo dos dashboards de Analytics.
- `MikaTaskRefineButton`: Botão contextual na toolbar do modal de tarefas (`TaskDetailsModal`).
