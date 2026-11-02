# Feature Specification: Mika — Conversational AI Chat Copilot (Feature 052)

**Feature Branch**: `052-mika-ai-chat`

**Created**: 2026-10-29

**Status**: Implemented & Verified (2026-11-02)

**Input**: User description: "criar interface de chat interativo de IA com a Mika AI no painel lateral, permitindo que o usuario converse em linguagem natural sobre gargalos, metricas de fluxo, cartoes bloqueados e previsibilidade, com suporte a Gemini BYOK e fallback offline Local-First."

---

## Contexto e Escopo

O **Metrik** conta com a **Mika AI** como copiloto analítico nativo (introduzida na Feature 048). Inicialmente, a interação da Mika no painel lateral (`MikaDrawer`) foi implementada através de *cards estáticos de diagnóstico* recalculados sob demanda ou em mudanças de tarefas.

A **Feature 052** expande a Mika para uma **experiência conversacional completa e interativa em linguagem natural (Chat)**. O usuário pode conversar diretamente com a copiloto na gaveta lateral, tirando dúvidas sobre gargalos, estabilidade de WIP, cartões bloqueados, Service Level Expectations (SLE 85%) e previsões de entrega (Monte Carlo), tudo ancorado estritamente na telemetria real do quadro ativo, com suporte a Gemini BYOK (Bring Your Own Key) e fallback determinístico offline (Local-First), sem vazamento de dados nem dependências obrigatórias de nuvem.

---

## Clarifications

### Session 2026-10-29
- Q: Como a nova interface de chat deve conviver com os cards de diagnósticos analíticos existentes dentro da gaveta lateral (`MikaDrawer`)? → A: Abas de navegação no topo da gaveta ("💬 Chat" e "📊 Diagnósticos"), permitindo alternar de forma limpa entre o diálogo interativo e os cards de métricas consolidadas.
- Q: Qual deve ser a política de retenção do histórico no armazenamento local (`localStorage`) e a quantidade de turnos enviada como contexto para a API de IA? → A: Janela deslizante balanceada (até 30 mensagens retidas localmente por quadro e envio das últimas 6 mensagens como contexto multi-turn para a API do Gemini junto à telemetria fresca do quadro).
- Q: As menções a tarefas nas respostas da Mika devem conter identificadores clicáveis que abrem diretamente o modal de detalhes da tarefa (`TaskDetailsModal`)? → A: Sim, identificadores de tarefas citados nas respostas (ex.: `#ID`) devem ser renderizados como chips/links clicáveis que disparam a abertura do `TaskDetailsModal` correspondente para ação imediata.
- Q: Como o usuário deve poder copiar ou reutilizar as recomendações e diagnósticos fornecidos pela Mika no chat? → A: Botão de 1 clique "Copiar" por mensagem: cada resposta da Mika exibe um botão para copiar o texto formatado para a área de transferência com confirmação visual temporária ("Copiado!").
- Q: Como o motor analítico heurístico local (modo Local-First / Offline) deve interpretar e responder às perguntas em linguagem natural do usuário sem uma LLM externa? → A: Classificador de intenção por palavras-chave + templates dinâmicos: identifica termos essenciais (gargalos, bloqueios, SLE, previsão, aging, throughput) e gera respostas determinísticas em linguagem natural preenchidas com as métricas reais do quadro ativo.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulta Conversacional de Métricas de Fluxo no Painel Lateral (Priority: P1) 🎯 MVP

Como líder de squad, desenvolvedor ou agilista visualizando o quadro Kanban ou abas de Analytics,
quero abrir a gaveta da Mika e digitar perguntas em linguagem natural sobre o fluxo de trabalho (ex.: gargalos, acúmulos de WIP, tarefas bloqueadas e SLE),
para obter diagnósticos e recomendações textuais imediatas e contextualizadas sem precisar decifrar manualmente múltiplos gráficos estatísticos.

**Why this priority**: É o cerne da evolução conversacional da Mika AI: transformar a gaveta lateral de uma lista estática em um assistente de diálogo inteligente e proativo.

**Independent Test**: Pode ser testado abrindo o `MikaDrawer`, digitando *"Onde está o principal gargalo do quadro agora?"* e verificando se a Mika sintetiza os dados da coluna com maior tempo de permanência ou violação de WIP, apresentando orientações claras e acionáveis.

**Acceptance Scenarios**:
1. **Given** um quadro com tarefas em andamento e uma coluna acumulando WIP próximo ou acima do limite, **When** o usuário pergunta *"Onde está o gargalo?"*, **Then** a Mika responde citando o nome da coluna, a quantidade de itens em WIP e o tempo médio de permanência.
2. **Given** tarefas marcadas como bloqueadas com justificativas registradas no quadro, **When** o usuário pergunta *"Quais tarefas estão bloqueadas?"*, **Then** a Mika lista os cartões impedidos, seus títulos, motivos de bloqueio e há quanto tempo estão travados.
3. **Given** um quadro com histórico de itens concluídos, **When** o usuário pergunta *"Qual é o nosso SLE de 85%?"*, **Then** a Mika informa o tempo de ciclo no 85º percentil e avalia se o ritmo atual da equipe está estável.
4. **Given** uma resposta da Mika citando uma tarefa específica (ex.: `#42`), **When** o usuário clica no identificador interativo no corpo da mensagem, **Then** o sistema abre o modal de detalhes da tarefa correspondente (`TaskDetailsModal`) permitindo inspecionar ou alterar o cartão.

---

### User Story 2 - Chips de Perguntas Rápidas e Indicador Visual de Digitação (Priority: P2)

Como usuário que deseja rapidez sem precisar formular prompts extensos,
quero visualizar chips de sugestões de perguntas frequentes na interface do chat (ex.: *"Gargalos no fluxo"*, *"Cartões bloqueados"*, *"Previsão de entrega"*, *"Saúde do WIP"*),
para que com um único clique eu inicie consultas analíticas fundamentais e visualize um indicador claro de processamento (*typing indicator*) enquanto a resposta é formulada.

**Why this priority**: Reduz atrito cognitivo, educa o usuário sobre o que a Mika é capaz de analisar e fornece feedback visual imediato de carregamento.

**Independent Test**: Abrir a gaveta da Mika, clicar no chip *"Cartões bloqueados"* e constatar o envio automático da mensagem, a exibição do indicador de digitação durante o processamento e o retorno da resposta formatada.

**Acceptance Scenarios**:
1. **Given** a tela inicial do chat da Mika, **When** o usuário clica em um chip de pergunta rápida, **Then** a mensagem é inserida no histórico e enviada imediatamente para geração de resposta.
2. **Given** uma requisição em processamento (via API externa ou motor heurístico local), **When** a resposta ainda não retornou, **Then** a interface exibe um indicador de digitação animado (*typing indicator*) e bloqueia novos envios concorrentes.

---

### User Story 3 - Histórico da Conversa em Múltiplos Turnos e Persistência Local-First (Priority: P3)

Como usuário conduzindo uma investigação analítica detalhada com perguntas complementares,
quero que a conversa suporte diálogo encadeado (multi-turn) e que o histórico seja persistido no navegador (Local-First) por quadro, com opção de limpar a conversa a qualquer instante,
para que eu não perca o contexto de recomendações anteriores ao alternar entre abas ou fechar a gaveta temporariamente.

**Why this priority**: Viabiliza raciocínio contextual contínuo e garante estrita conformidade com o Princípio VIII da Constituição do Metrik (Soberania Local-First).

**Independent Test**: Enviar duas perguntas sucessivas em contexto, fechar a gaveta, reabrir a gaveta e constatar que o histórico completo permanece renderizado, podendo ser apagado via botão *"Limpar Conversa"* com confirmação.

**Acceptance Scenarios**:
1. **Given** uma conversa ativa com perguntas e respostas anteriores, **When** o usuário fecha e reabre o `MikaDrawer`, **Then** todas as mensagens anteriores, papéis de emissor (*user* / *mika*) e horários são preservados e renderizados.
2. **Given** um histórico de mensagens acumulado, **When** o usuário clica no botão *"Limpar Histórico"* e confirma a ação, **Then** as mensagens são removidas do armazenamento local e a interface exibe a mensagem de boas-vindas com chips de perguntas rápidas.
3. **Given** uma resposta analítica fornecida pela Mika no chat, **When** o usuário clica no botão de ação *"Copiar"*, **Then** o texto da resposta é copiado para a área de transferência e o botão exibe o feedback *"Copiado!"* por 2 segundos.

---

### User Story 4 - Resiliência com Fallback Local-First Heurístico e Segurança Consultiva (Priority: P4)

Como equipe operando sem conexão com a internet, sem chave de API externa configurada ou em rede corporativa restrita,
quero que o chat da Mika continue respondendo perguntas essenciais utilizando o motor heurístico determinístico local do Metrik,
para garantir autonomia operacional completa sem falhas silenciosas, travamentos de tela ou exposição indevida de dados corporativos.

**Why this priority**: Satisfaz os Princípios IV (Observabilidade), VII (Independência de Marca) e VIII (Local-First Sovereignty).

**Independent Test**: Desconectar a chave de API nas configurações ou desconectar a rede, enviar uma pergunta no chat e verificar que a Mika responde através das regras analíticas locais com badge identificador claro (*Local-First*).

**Acceptance Scenarios**:
1. **Given** um ambiente sem chave Gemini configurada (modo Local-First padrão), **When** o usuário envia uma mensagem sobre gargalos ou SLE, **Then** o sistema processa a resposta via `mikaHeuristicEngine` sem emitir erros no console nem falhas de rede.
2. **Given** uma tentativa de requisição de IA externa que sofre erro de rede ou chave inválida, **When** a falha ocorre, **Then** o sistema realiza fallback transparente para o motor heurístico local informando cordialmente ao usuário o status da resposta.
3. **Given** qualquer recomendação de movimentação de cartão ou ajuste de limite feita pela Mika, **When** exibida no chat, **Then** a resposta tem caráter estritamente consultivo e NÃO altera os cartões ou colunas do quadro sem comando explícito do usuário.

---

### Edge Cases

- **Quadro Vazio ou sem Métricas Históricas**: Quando o quadro ativo não possui tarefas ou possui menos de 3 tarefas, a Mika informa gentilmente que ainda não há volume de fluxo suficiente para diagnósticos estatísticos e sugere cadastrar ou movimentar tarefas.
- **Pergunta Fora de Escopo**: Se o usuário fizer perguntas que não têm relação com o quadro, gestão de fluxo, Kanban ou desenvolvimento, a Mika esclarece amigavelmente seu foco como copiloto de fluxo de trabalho do Metrik.
- **Mensagem em Branco ou com Espaços Vazios**: O botão de envio permanece desabilitado para entradas em branco ou puramente de espaços, e a digitação de `Enter` sem texto não dispara requisições.
- **Atalhos de Teclado**: Pressionar `Enter` envia a mensagem; pressionar `Shift + Enter` quebra a linha no campo de texto; pressionar `Escape` fecha a gaveta retrátil sem perder o rascunho em digitação.
- **Poda Automática do Histórico (Janela Deslizante)**: Quando o histórico atingir 30 mensagens em um mesmo quadro, o envio de uma nova mensagem descarta automaticamente a mensagem mais antiga em regime FIFO, preservando a leveza do `localStorage` e a performance do navegador.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer navegação por abas no topo da gaveta retrátil `MikaDrawer` permitindo alternar entre "💬 Chat" e "📊 Diagnósticos", sendo o chat uma interface interativa contendo lista de mensagens com rolagem automática, área de entrada de texto e botão de envio com foco e altura integral.
- **FR-002**: O sistema DEVE renderizar chips de perguntas rápidas contextuais na interface inicial do chat para acesso imediato aos principais temas de fluxo (*Gargalos*, *SLE 85%*, *Cartões Bloqueados*, *Previsão de Entrega*).
- **FR-003**: O sistema DEVE injetar em tempo real a telemetria do quadro ativo (colunas, limites de WIP, tempo de permanência, cartões bloqueados com justificativas, percentil 85% de cycle time e throughput recente) como contexto estruturado para geração da resposta.
- **FR-004**: O sistema DEVE suportar diálogo em múltiplos turnos (*multi-turn conversation*), enviando até 6 mensagens anteriores (3 pares de pergunta/resposta) como histórico contextual para a API do modelo, mantendo a coerência das trocas de mensagens na sessão atual.
- **FR-005**: As conversas do chat DEVEM ser persistidas no armazenamento local do navegador (`localStorage`) associadas ao quadro/squad ativo com janela deslizante de no máximo 30 mensagens por quadro (removendo automaticamente as mais antigas ao exceder em regime FIFO), garantindo soberania, desempenho e proteção contra estouro de cota (Princípio VIII).
- **FR-006**: O sistema DEVE oferecer ação explícita de limpeza do histórico do chat com confirmação, evitando exclusões acidentais e restaurando o estado inicial de boas-vindas.
- **FR-007**: A interface DEVE exibir indicador animado de digitação (*typing indicator*) enquanto uma resposta estiver sendo formulada, acompanhado de acessibilidade via `aria-live="polite"`.
- **FR-008**: O chat DEVE operar com redundância garantida: se a chave de API Gemini estiver ausente ou a rede falhar, o sistema DEVE responder autonomamente via motor analítico heurístico local (`mikaHeuristicEngine`) através de um classificador determinístico de intenções por palavras-chave conectado a templates dinâmicos que injetam a telemetria real do quadro em respostas naturais, sem travar a interface.
- **FR-009**: O chat da Mika DEVE operar em modo estritamente consultivo (*read-only*), proibindo qualquer mutação ou exclusão automática de dados do quadro sem a ação manual direta do usuário.
- **FR-010**: A interface do chat, os prompts do sistema e as respostas DEVEM observar estrita independência de marca (Princípio VII), utilizando apenas terminologia padronizada de fluxo e agilidade sem menção a produtos de terceiros.
- **FR-011**: O campo de digitação do chat DEVE permitir envio com a tecla `Enter` e inserção de nova linha com `Shift + Enter`.
- **FR-012**: O cabeçalho do chat DEVE indicar claramente a modalidade ativa de inteligência (ex.: *"Google Gemini 1.5 Flash"* ou *"Local-First (Offline)"*).
- **FR-013**: Referências a tarefas existentes citadas nas respostas da Mika (no formato `#ID` ou título de cartão mapeado) DEVEM ser renderizadas como chips ou links interativos que, ao serem clicados pelo usuário, disparam a abertura do `TaskDetailsModal` da tarefa correspondente.
- **FR-014**: Cada resposta da Mika no chat DEVE disponibilizar um botão de ação rápida "Copiar resposta" que transfere o texto integral formatado para a área de transferência do usuário com confirmação visual temporária ("Copiado!").

---

### Key Entities

- **MikaChatMessage**: Representa uma mensagem do diálogo.
  - `id`: Identificador único da mensagem (UUID/timestamp).
  - `role`: Papel do emissor (`'user' | 'assistant' | 'system'`).
  - `content`: Texto da mensagem formatado em markdown/texto puro.
  - `timestamp`: Data/hora de envio da mensagem.
  - `provider`: Provedor utilizado na resposta (`'gemini' | 'heuristic'`).
- **MikaChatSession**: Representa o histórico de conversa vinculado ao quadro ativo.
  - `boardId`: Identificador do quadro/squad correspondente.
  - `messages`: Vetor ordenado de `MikaChatMessage` (máximo 30 mensagens mantidas em janela deslizante).
  - `updatedAt`: Timestamp da última interação.
- **MikaQuickPrompt**: Representa uma sugestão de pergunta com disparo em 1 clique.
  - `id`: Identificador do prompt rápido.
  - `label`: Rótulo legível exibido no chip.
  - `query`: Pergunta completa enviada para a Mika.
  - `category`: Categoria de fluxo (`'bottleneck' | 'sle' | 'blocked' | 'throughput'`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue abrir o painel lateral e disparar uma consulta conversacional em menos de 3 segundos.
- **SC-002**: Consultas respondidas pelo motor heurístico local respondem em tempo inferior a 300 milissegundos.
- **SC-003**: 100% das perguntas sobre gargalos, cartões bloqueados e SLE de 85% refletem com precisão os valores numéricos e estados reais do quadro ativo.
- **SC-004**: 100% das operações em modo offline ou sem chave externa de API são atendidas com sucesso, com zero erros não tratados no console.
- **SC-005**: Zero menções a marcas ou produtos concorrentes de terceiros na interface, tooltips e respostas geradas (100% de conformidade com o Princípio VII).
- **SC-006**: O histórico da conversa é 100% restaurado após fechamento e reabertura do painel lateral ou recarregamento da página.

---

## Assumptions

- O usuário já tem acesso à gaveta global da Mika através do botão no cabeçalho (`MikaTriggerButton`) implementado na Feature 048.
- A configuração da chave BYOK do Gemini continua sendo gerenciada na aba existente de configurações (`MikaSettingsTab`).
- A gaveta lateral continuará permitindo alternância ou convivência harmoniosa entre os cards estáticos de insight e a nova área de chat conversacional.
- Não há necessidade de conexão com servidores backend externos para persistência do chat; a soberania Local-First via `localStorage` é a arquitetura canônica do Metrik.
