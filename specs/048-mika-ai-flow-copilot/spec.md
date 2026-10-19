# Feature Specification: Mika — AI Flow Copilot (Ciclo 5)

**Feature Branch**: `048-mika-ai-flow-copilot`

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Integrar o Metrik a uma IA especializada em dinâmica de trabalho e métricas de fluxo, cujo agente se chama Mika"

---

## Contexto e Escopo

O **Metrik** possui uma infraestrutura estatística madura e determinística (Cumulative Flow Diagram, Cycle Time Scatter Plot com percentis, Throughput diário/semanal, WIP Aging e Simulação de Monte Carlo). No entanto, a interpretação dessas métricas hoje depende da maturidade analítica individual do usuário.

A **Mika** é o copiloto nativo de inteligência artificial do Metrik. Ela traduz distribuições probabilísticas, alertas de gargalos e desvios de SLE (*Service Level Expectation*) em recomendações em linguagem natural, acionáveis e transparentes, mantendo a soberania de dados do usuário (Local-First).

---

## Clarifications

### Session 2026-10-16
- Q: Como a Mika deve ser disponibilizada na interface visual para interação global do usuário? → A: Gaveta lateral retrátil (Drawer) acessível globalmente via botão de cabeçalho/flutuante, complementada por cards de diagnóstico contextuais embutidos nas páginas analíticas.
- Q: Como as subtarefas sugeridas pela Mika devem ser incorporadas à tarefa quando aprovadas pelo usuário no modal? → A: Inseridas diretamente como itens no checklist interno da própria tarefa atual (`task.checklist`), preservando a limpeza e densidade visual do quadro Kanban.
- Q: Qual deve ser a política de cache e atualização dos diagnósticos analíticos da Mika para otimizar tempo de resposta e consumo de tokens? → A: Cache reativo inteligente (em memória / `localStorage`), invalidado apenas por mutações reais no quadro (tarefas criadas, movidas ou alteradas) ou por solicitação manual explícita de recálculo pelo usuário.
- Q: Qual deve ser o tom e o idioma padrão da comunicação da Mika nas recomendações aos usuários? → A: Português do Brasil (pt-BR) como padrão nativo, com tom consultivo, técnico, objetivo e encorajador (focado em fluxo, previsibilidade e agilidade).
- Q: Como a chave de API do usuário (BYOK - Google Gemini) deve ser armazenada e protegida no navegador? → A: Armazenada com ofuscação no `localStorage` do navegador, exibida com máscara visual na interface (`AIzaSy...****`) e com ação de desconexão e limpeza em 1 clique.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diagnóstico Narrativo de Métricas e Alertas Preditivos (Priority: P1) 🎯 MVP

Como gestor técnico, tech lead ou membro de squad navegando pelas abas de Analytics,
quero que a Mika analise os dados de telemetria do quadro ativo e forneça diagnósticos textuais contextualizados e alertas de gargalos em tempo real,
para que a equipe entenda a previsibilidade de entrega e mitigue riscos antes que tarefas estourem o prazo aceitável.

**Why this priority**: É a essência do copiloto: transformar gráficos densos em conclusões executivas imediatas sem exigir configuração complexa.

**Independent Test**: Pode ser testado acessando o painel de Analytics com tarefas no histórico; um card de resumo executivo da Mika deve sintetizar a saúde do fluxo, explicar o percentil de 85% e traduzir as probabilidades de Monte Carlo em datas recomendadas.

**Acceptance Scenarios**:
1. **Given** um quadro com histórico de tarefas concluídas e em andamento, **When** o usuário acessa o Dashboard de Analytics, **Then** a Mika exibe um card de diagnóstico sintetizando o Cycle Time do 85º percentil e apontando eventuais acúmulos na coluna com maior tempo de permanência.
2. **Given** uma simulação de Monte Carlo gerada com 10.000 iterações, **When** os percentis de 50%, 85% e 95% são calculados, **Then** a Mika fornece uma recomendação textual direta (ex.: *"Para um nível de confiança de 85%, a meta de entrega estimada é o dia DD/MM"*).
3. **Given** uma coluna com limite de WIP ultrapassado ou com tarefas estagnadas acima do SLE, **When** a Mika examina o quadro, **Then** um alerta preventivo com tom consultivo é exibido destacando as tarefas em risco.

---

### User Story 2 - Decomposição Inteligente e Critérios de Aceite na Tarefa (Priority: P2)

Como desenvolvedor ou product owner refinando uma tarefa no modal de detalhes,
quero solicitar o apoio da Mika para quebrar um item complexo em subtarefas técnicas e estruturar critérios de aceitação objetivos,
para que o escopo fique claro e reduza a variabilidade de execução durante o fluxo de desenvolvimento.

**Why this priority**: Acelera a fase de preparação (Discovery/Refinement) e previne itens desproporcionalmente grandes que travam as colunas do Kanban.

**Independent Test**: Abrir o `TaskDetailsModal` de uma tarefa com descrição, clicar no assistente da Mika e verificar a sugestão de checklist com subtarefas atômicas e critérios de aceite no formato BDD.

**Acceptance Scenarios**:
1. **Given** uma tarefa com título e descrição no modal, **When** o usuário aciona o botão *"Sugerir Subtarefas com Mika"*, **Then** a Mika propõe de 3 a 6 itens atômicos para o checklist, permitindo aceitar todos ou selecionar itens individualmente.
2. **Given** uma tarefa sem critérios de aceitação definidos, **When** o usuário clica em *"Gerar Critérios de Aceite"*, **Then** a Mika formata os cenários no padrão *Dado / Quando / Então* no corpo da descrição ou como notas da tarefa.

---

### User Story 3 - Painel de Preferências da Mika e Soberania de Dados (Priority: P3)

Como usuário preocupado com privacidade ou operando em ambientes corporativos restritos,
quero configurar qual provedor de IA a Mika deve utilizar (ou ativar o modo autônomo offline baseado em heurísticas),
para garantir que dados sensíveis não sejam compartilhados sem autorização explícita.

**Why this priority**: Garante conformidade com o Princípio I da Constituição do Metrik (Local-First e Soberania).

**Independent Test**: Acessar o menu de Configurações, localizar a aba da Mika, alternar o provedor de inteligência ou chave de API e validar que o sistema persiste com segurança e oferece modo fallback determinístico offline.

**Acceptance Scenarios**:
1. **Given** a aba de configurações da Mika, **When** o usuário opta por *"Modo Heurístico / Offline"*, **Then** a Mika opera gerando diagnósticos analíticos puramente matemáticos sem realizar nenhuma chamada externa.
2. **Given** a configuração com chave pessoal de API (BYOK com Google Gemini API como provedor padrão nativo), **When** a chave é validada, **Then** a Mika passa a gerar respostas com capacidades de síntese avançada via modelos Gemini de alta velocidade.

---

### Edge Cases

- **Quadro Novo / Sem Dados Suficientes**: Quando um quadro tiver menos de 5 tarefas concluídas, a Mika deve informar de forma cordial que os dados amostrais ainda são preliminares, sugerindo cadastrar ou simular mais tarefas para diagnósticos confiáveis.
- **Falha de Rede ou Chave Inválida**: Se uma chamada de IA falhar por timeout ou credencial expirada, o sistema deve fazer fallback imediato para o motor analítico heurístico local, sem exibir erros bloqueantes de tela.
- **Tarefa Vazia ou Título Curto**: Se o usuário solicitar decomposição em uma tarefa com menos de 10 caracteres sem descrição, a Mika deve orientar brevemente quais informações adicionais são necessárias para uma boa quebra de escopo.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um componente global de gaveta retrátil (`MikaDrawer`) acionado por botão de cabeçalho (`MikaTriggerButton`), além de cards de diagnóstico contextual (`MikaInsightCard`) integrados às visualizações de Analytics do Metrik.
- **FR-002**: A Mika DEVE calcular e expressar textualmente em linguagem clara a data recomendada para 85% de certeza com base nos resultados das simulações de Monte Carlo.
- **FR-003**: A Mika DEVE sinalizar colunas com estrangulamento de fluxo (violação da Lei de Little ou tempo de permanência anômalo em comparação com o histórico).
- **FR-004**: O sistema DEVE disponibilizar ação de refinamento da Mika no modal de detalhes da tarefa (`TaskDetailsModal`) para geração assistida de subtarefas.
- **FR-005**: O usuário DEVE poder aprovar, editar ou descartar individualmente cada subtarefa sugerida pela Mika antes de sua inserção no checklist da tarefa.
- **FR-006**: O sistema DEVE suportar modo de funcionamento puramente local/heurístico onde nenhum dado trafega para provedores externos de LLM.
- **FR-007**: As configurações e credenciais da Mika DEVEM ser persistidas exclusivamente no armazenamento local do navegador (`localStorage`) com ofuscação de chave, máscara visual de proteção na interface e ação imediata de limpeza/desconexão com um único clique.
- **FR-008**: A interface da Mika DEVE seguir rigorosamente a paleta e os tokens visuais dos temas Dark, Light e High Contrast do Design System do Metrik.
- **FR-009**: A Mika DEVE implementar cache reativo local para os diagnósticos analíticos, invalidando os resultados apenas quando ocorrerem mutações no estado do quadro (tarefas criadas, movidas, arquivadas ou editadas) ou mediante solicitação explícita de recálculo manual pelo usuário.
- **FR-010**: A Mika DEVE se comunicar por padrão em Português do Brasil (pt-BR) adotando tom consultivo, técnico, objetivo e empático, utilizando terminologia precisa de métricas de fluxo e métodos ágeis (WIP, SLE, vazão, dispersão de tempo de ciclo e bloqueios).

---

### Key Entities

- **MikaInsight**: Estrutura contendo diagnóstico textual, nível de confiança estatística (ex.: 85%), tipo de métrica analisada (Cycle Time, Monte Carlo, WIP) e nível de severidade (Informativo, Atenção, Crítico).
- **MikaDecomposition**: Conjunto de sugestões de subtarefas e critérios de aceite gerados a partir do contexto de uma tarefa específica.
- **MikaPreferences**: Configuração de ativação, modo de operação (Heurístico Local vs. LLM Conectado), provedor selecionado e preferências de tom de comunicação.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O card de diagnóstico da Mika deve renderizar suas recomendações em menos de 300ms no modo local/heurístico.
- **SC-002**: 100% dos diagnósticos de Monte Carlo devem expressar fielmente o percentil de 85% sem discrepância matemática com os cálculos do motor estatístico.
- **SC-003**: A decomposição de tarefas deve permitir inserção das subtarefas com apenas 1 clique após a revisão do usuário.
- **SC-004**: A suíte de testes de unidade deve cobrir a geração de diagnósticos e fallbacks com zero regressão nos 701 testes existentes.
- **SC-005**: Zero vazamento de dados de tarefas para a rede quando o usuário estiver operando em modo local.

---

## Assumptions

- O usuário já utiliza o Metrik no navegador com suporte a JavaScript moderno e APIs de armazenamento local.
- O modo heurístico inicial é suficiente para entregar alto valor de inteligência analítica mesmo para usuários sem chaves de API pagas.
- A Mika respeita a autonomia humana: ela nunca move tarefas ou altera status sem a confirmação explícita do usuário (*Human-in-the-Loop*).
