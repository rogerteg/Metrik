# Feature Specification: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Feature Branch**: `043-system-health-and-roadmap`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "traga como esta hoje o sistema, e as oportunidades de melhorias levantadas, e os proximos passos. E Crie uma visão markdown."

---

## Contexto e Escopo

Esta feature **não introduz comportamento novo no produto**. Ela consolida, em artefatos verificáveis, três perguntas de governança que hoje só existem dispersas em `project-context.md`, `lessons-learned.md`, checklists de features e inspeção manual do repositório:

1. **Como está o sistema hoje** — estado factual e mensurável do produto e do repositório.
2. **Quais oportunidades de melhoria estão levantadas** — tanto as já registradas quanto as descobertas nesta avaliação.
3. **Quais são os próximos passos** — sequência priorizada, com critério objetivo de conclusão por item.

O entregável narrativo desta feature é a **visão** — o Documento de Visão e Rumo, arquivo `vision.md` — acompanhada do `checklists/requirements.md` desta especificação. As histórias abaixo descrevem o valor entregue a quem lê essa visão.

**Fronteira de execução:** esta feature **produz e mantém diagnóstico e rumo, e nada além disso**. Ela não corrige o produto. Nenhum arquivo de código-fonte, teste, documentação de entrada ou diretório de artefato existente é alterado por esta feature; as correções que ela levanta são atribuídas a features corretivas próprias, conforme o Princípio I.

---

## Clarifications

### Session 2026-10-07

- Q: Esta feature deve apenas produzir a visão e o diagnóstico, ou também executar as correções P1 que ela levanta? → A: Somente diagnóstico — a visão é o entregável; cada correção roda sob sua própria feature, e FR-009 a FR-013 passam a ser obrigações de declarar e atribuir, não de corrigir.
- Q: Como provar objetivamente que a documentação descreve o produto real (SC-006), já que parte da afirmação não é automatizável? → A: Ambos — verificação automatizada de consistência entre tecnologia citada e dependência real, mais walkthrough registrado como evidência datada para finalidade e capacidades.
- Q: As metas da visão devem bloquear o pipeline quando violadas, ou ser apenas acompanhamento declarado? → A: Gate apenas para o que roda na suíte automatizada — incluindo os novos testes de consistência que as features corretivas criarem; indicadores dependentes do ambiente local ou de julgamento permanecem consultivos, com evidência datada.
- Q: O que deve tornar as medidas da visão obsoletas? → A: Gatilho por evento determinístico — alterar qualquer arquivo-sentinela declarado invalida os indicadores correspondentes e exige remedição antes de fundamentar nova aceitação; revalidação por prazo fixo e sob demanda foram descartadas.
- Q: Qual critério objetivo define que uma funcionalidade está entregue? → A: Código correspondente presente na linha principal **e** referência no registro de mudanças do repositório; presença de código isolada e verificação verde isolada foram descartadas como definição.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confiar no sinal automatizado de saúde do repositório (Priority: P1)

Como responsável pelo produto, quero que o conjunto de verificação automatizada do repositório esteja integralmente verde, para que eu possa aceitar ou rejeitar mudanças com base no pipeline e não na inspeção manual.

**Why this priority**: A Constituição (Princípio III) exige que nenhuma mudança seja considerada completa sem as suítes de verificação em zero falhas. Hoje esse sinal está rompido, então *todo* o restante do trabalho herda incerteza. É o item de maior valor e menor custo da lista.

**Delivered by**: feature corretiva designada na visão para a oportunidade da suíte não conforme. Esta feature entrega a **visão que declara a ruptura e designa a responsável**; a restauração do verde é verificada na feature designada.

**Independent Test**: Confirmar que a visão declara o estado observado das verificações automatizadas e nomeia a feature corretiva responsável e o critério de encerramento. A restauração do verde é aceita na feature designada, executando a suíte e o build em duas datas distintas.

**Acceptance Scenarios**:

1. **Given** o estado atual do repositório, **When** a suíte de testes automatizados é executada, **Then** o resultado é zero testes falhando e zero arquivos de teste falhando.
2. **Given** a suíte corrigida, **When** ela é executada novamente em uma data diferente da original, **Then** o resultado permanece verde — nenhum resultado depende da data do relógio da máquina.
3. **Given** a suíte verde, **When** o build de produção e as verificações de estilo do projeto são executados, **Then** ambos terminam sem erros.

---

### User Story 2 - Reconhecer o produto real a partir da documentação (Priority: P1)

Como pessoa que entra no repositório pela primeira vez, quero que a documentação de entrada descreva o produto que realmente existe, para que eu não seja induzido a uma arquitetura, linguagem ou capacidades que o sistema não possui.

**Why this priority**: A documentação de entrada é hoje a principal fonte de erro de entendimento: ela descreve uma solução em outra linguagem, com outras capacidades e outra finalidade, enquanto o produto real é uma aplicação web de quadro Kanban com análise de fluxo. Isso invalida decisões de quem lê antes de escrever qualquer linha e viola a expectativa de documentação viva do Princípio II.

**Independent Test**: Pedir a uma pessoa que não conhece o projeto que descreva, apenas lendo os documentos do repositório, o que o produto faz e com que tecnologia ele é construído — e comparar com o comportamento observável do produto em execução.

**Acceptance Scenarios**:

1. **Given** os documentos de entrada do repositório, **When** alguém os lê sem acesso ao código, **Then** a capacidades, a finalidade e a stack descritas correspondem ao que o produto executa.
2. **Given** os documentos de entrada, **When** eles mencionam tecnologias, **Then** nenhuma tecnologia ausente do produto é apresentada como utilizada.
3. **Given** os documentos de entrada, **When** eles identificam o produto, **Then** nenhum nome de marca de terceiros é usado como referência de identidade do Metrik (Constituição, Princípio VII).

---

### User Story 3 - Enxergar a dívida estrutural e o custo de entrega (Priority: P2)

Como mantenedor, quero que a visão consolide as oportunidades de melhoria estruturais já levantadas e as recém-medidas, para priorizar refatorações com base em evidência e não em impressão.

**Why this priority**: Existem lacunas conhecidas e rastreadas (duplicação de estilos, módulos grandes, peso de assets, cobertura de funções) hoje distribuídas em vários lugares. Sem consolidação, cada sessão redescobre o mesmo inventário. É P2 porque afeta o custo futuro, não a correção imediata.

**Independent Test**: Percorrer a lista de oportunidades da visão e confirmar que cada item cita evidência verificável (arquivo, medida ou artefato de origem) e um critério objetivo de encerramento.

**Acceptance Scenarios**:

1. **Given** a visão, **When** um item é lido, **Then** ele apresenta evidência verificável e um critério de conclusão verificável.
2. **Given** a visão, **When** ela classifica cada oportunidade, **Then** as oportunidades já registradas previamente e as novas estão distinguidas e atribuídas à sua origem.
3. **Given** a visão, **When** um item já foi resolvido, **Then** ele aparece marcado como resolvido, com a data, e não como pendência.

---

### User Story 4 - Reconciliação de governança dos artefatos (Priority: P2)

Como responsável pela governança do projeto, quero que o estado declarado dos artefatos de especificação corresponda ao estado real do código, para que a precedência documental do projeto continue confiável.

**Why this priority**: Especificações que permanecem marcadas como rascunho depois de entregues, marcadores de esclarecimento abertos em funcionalidades já em produção e quadros de tarefas nunca reconciliados corroem a confiança no processo de especificação — que é a base da metodologia adotada e do Princípio I.

**Independent Test**: Comparar, para cada funcionalidade entregue, o estado declarado em seu artefato de especificação com a presença das capacidades correspondentes no produto.

**Acceptance Scenarios**:

1. **Given** uma funcionalidade entregue, **When** seu artefato de especificação é lido, **Then** o estado declarado reflete a realidade da entrega.
2. **Given** um artefato com marcadores de esclarecimento abertos, **When** a decisão já foi tomada na implementação, **Then** o marcador é substituído pela decisão efetiva e registrado como tal.
3. **Given** artefatos de tarefas de funcionalidades antigas nunca reconciliados, **When** a visão é lida, **Then** o estado de cada um está explicitamente declarado como histórico, obsoleto ou pendente — nunca ambíguo.

---

### User Story 5 - Sustentar qualidade e desempenho ao longo do tempo (Priority: P3)

Como time de produto, quero que os limites de qualidade e desempenho sejam declarados e monitorados, para que a melhoria não se degrade silenciosamente.

**Why this priority**: É o item de menor urgência e maior horizonte: protege o resultado dos itens anteriores, mas não desbloqueia nada por si só.

**Independent Test**: Medir os indicadores declarados na visão (peso de carga inicial, avisos de análise estática, cobertura de funções) e confirmar que cada um está dentro do limite declarado.

**Acceptance Scenarios**:

1. **Given** a visão, **When** os indicadores de qualidade são lidos, **Then** cada um possui valor atual, meta e critério de medição.
2. **Given** um indicador fora da meta, **When** a visão é lida, **Then** existe um próximo passo associado a ele.

---

### Edge Cases

- **Divergência entre histórico local e remoto**: o repositório local possui ramificações de trabalho de funcionalidades já integradas. A visão MUST declarar se a remoção dessas ramificações é segura, e o próximo passo correspondente MUST exigir confirmação de que o trabalho já está contido na linha principal antes de qualquer remoção.
- **Funcionalidades antigas com artefatos incompletos**: para as funcionalidades cujas listas de tarefas nunca foram marcadas, o sistema de documentação MUST preferir declarar o estado como histórico ou obsoleto em vez de preencher retroativamente marcações que nunca refletiram execução real.
- **Verificação impossível no ambiente atual**: quando uma verificação exigida pela especificação depende de recursos ausentes no ambiente (por exemplo, múltiplos motores de navegador), a visão MUST registrar explicitamente o bloqueio, quem o resolve e o que permanece não verificado — nunca marcá-la como concluída.
- **Evidência que envelhece**: qualquer medida numérica registrada na visão MUST vir acompanhada da data de medição, para que sua validade seja julgável.
- **Ação que depende de terceiros**: itens cuja execução depende de ação fora do repositório (por exemplo, aplicar migração em serviço externo) MUST ser descritos como ação de responsabilidade identificada, não como tarefa de código.
- **Correção que poderia mascarar o defeito**: ao restaurar o sinal verde da suíte, um teste MUST NOT ser afrouxado, ignorado ou removido para obter aprovação; a correção MUST preservar a intenção original do teste.
- **Citação necessária de marca em artefato existente**: quando a única forma de tornar acionável a correção de um vazamento de marca for citar o caminho do artefato que a contém, a citação MUST ser tratada como exceção explícita, limitada a uma ocorrência por artefato, acompanhada do critério de encerramento que a eliminará — e MUST ser contabilizada em separado na medição, nunca confundida com uso de marca como identidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O repositório MUST conter uma **visão** — o Documento de Visão e Rumo, arquivo `vision.md` — de artefato único, legível sem acesso ao código, que responda às três perguntas: estado atual do sistema, oportunidades de melhoria e próximos passos.
- **FR-002**: A visão MUST declarar, com data de medição, o estado factual do produto — capacidades entregues, arquitetura em uso, modelo de dados central e modelo de persistência.
- **FR-003**: A visão MUST declarar, com data de medição, o resultado observado de cada verificação automatizada do repositório.
- **FR-004**: A visão MUST distinguir oportunidades **já registradas anteriormente** (rastreadas em artefatos de memória do projeto) de oportunidades **novas** descobertas na avaliação, atribuindo a origem de cada uma.
- **FR-005**: Cada oportunidade de melhoria MUST apresentar evidência verificável (caminho de arquivo, medida ou artefato de origem) e um critério objetivo de encerramento.
- **FR-006**: Cada oportunidade MUST receber uma prioridade, e a prioridade MUST refletir o impacto sobre a correção do sinal automatizado, a confiabilidade da documentação e a conformidade com a constituição do projeto.
- **FR-007**: A visão MUST conter uma lista de próximos passos ordenada por prioridade, agrupada em fases com resultado verificável ao final de cada fase.
- **FR-008**: Todo item de próximo passo MUST declarar a evidência que comprova sua conclusão, de forma que possa ser verificado por terceiros sem inspeção manual do código-fonte.
- **FR-009**: A visão MUST declarar, como oportunidade de prioridade mais alta, toda verificação automatizada que não esteja em estado conforme, identificando a causa raiz observada quando ela for determinística. Esta feature MUST NOT alterar testes, código de produto ou configuração para obter conformidade.
- **FR-010**: A visão MUST declarar como oportunidade toda divergência entre a documentação de entrada do repositório e a finalidade, as capacidades ou a stack efetivamente entregues. Esta feature MUST NOT reescrever a documentação de entrada; a correção pertence à feature corretiva designada.
- **FR-011**: A visão MUST declarar como oportunidade toda ocorrência de nome de marca de terceiros identificada em documentos, nomes de diretórios de artefato, textos de interface ou comentários de código. Esta feature MUST NOT renomear diretórios de artefato existentes.
- **FR-012**: A visão MUST declarar como oportunidade toda divergência entre o estado declarado em um artefato de especificação e o estado real de entrega da funcionalidade correspondente.
- **FR-013**: A visão MUST declarar como oportunidade todo marcador de esclarecimento aberto em funcionalidade já entregue, nomeando a decisão que precisa ser registrada.
- **FR-014**: A visão MUST declarar os indicadores de qualidade e desempenho com valor atual, meta e critério de medição.
- **FR-015**: Verificações cuja execução é impossível no ambiente disponível MUST ser registradas como bloqueios explícitos, com o responsável pela execução e o escopo não verificado.
- **FR-016**: A visão MUST registrar as ações cuja conclusão depende de responsável externo ao repositório, identificando esse responsável.
- **FR-017**: Esta feature MUST NOT alterar código de produto, arquivos de teste, documentação de entrada do repositório nem renomear diretórios de artefato existentes. Seu conjunto de artefatos é restrito ao diretório da própria feature — `specs/043-system-health-and-roadmap/**` — incluindo os artefatos exigidos pela metodologia de especificação (especificação, plano, pesquisa, modelo de dados, contratos, guia de validação e checklists); nenhum artefato fora desse diretório MUST ser criado ou alterado, e nenhum script de automação MUST ser adicionado.
- **FR-018**: Cada oportunidade classificada como prioridade mais alta MUST ter uma feature corretiva designada por identificador, registrada na visão.
- **FR-019**: Para toda oportunidade que exija correção de documentação, a visão MUST declarar um protocolo de verificação com duas partes: (a) verificação automatizada de consistência que falhe quando a documentação citar tecnologia ausente das dependências reais, ou omitir tecnologia presente nelas; e (b) walkthrough registrado como evidência datada, executado por leitor sem conhecimento prévio, cobrindo finalidade e capacidades — que não são verificáveis por máquina.
- **FR-020**: A visão MUST classificar cada indicador de qualidade declarado como **bloqueante** — verificado por verificação executável integrante da suíte automatizada, portanto obrigatório e não dispensável — ou **consultivo** — dependente do ambiente local ou de julgamento humano, exigindo evidência datada quando verificado. Nenhum indicador consultivo MUST ser apresentado como garantido pelo pipeline.
- **FR-021**: A visão MUST registrar, para cada indicador, o mecanismo de verificação declarado em FR-020, de forma que um indicador bloqueante jamais seja satisfeito por inspeção manual.
- **FR-022**: A visão MUST declarar explicitamente a lista de **arquivos-sentinela** cuja alteração invalida as medidas registradas, e MUST indicar quais sentinelas invalidam cada indicador. Uma medida invalidada MUST ser remedida antes de fundamentar qualquer nova aceitação.
- **FR-023**: A visão MUST NOT conter critério de validade temporal por prazo fixo nem revalidação exclusivamente sob demanda; a invalidação é determinada apenas por alteração de arquivo-sentinela declarado.
- **FR-024**: Para efeito de FR-012 e SC-004, uma funcionalidade MUST ser considerada **entregue** somente quando **ambas** as condições forem satisfeitas: (a) o código que implementa suas capacidades está presente na linha principal; e (b) a funcionalidade está referenciada no registro de mudanças do repositório. Funcionalidade que satisfaça apenas uma das condições MUST ser declarada com estado divergente e marcada como ambígua — nunca contada como entregue nem como não entregue.

### Key Entities *(include if feature involves data)*

- **Oportunidade de Melhoria**: item de trabalho potencial. Atributos: identificador, título, origem (já registrada ou nova), evidência, impacto, prioridade, custo relativo, critério de encerramento, estado (aberta, resolvida, aceita como lacuna) e data de referência.
- **Fase de Próximos Passos**: agrupamento ordenado de itens de trabalho. Atributos: ordem, objetivo, itens que a compõem, resultado verificável ao final.
- **Indicador de Qualidade**: medida de saúde do repositório ou do produto. Atributos: nome, valor medido, data da medição, meta, mecanismo de verificação (bloqueante ou consultivo, conforme FR-020) e próximo passo associado quando fora da meta.
- **Bloqueio de Ambiente**: verificação exigida e não executável no ambiente atual. Atributos: verificação, causa, responsável pela execução, escopo não verificado.
- **Evidência de Validação**: registro que comprova uma verificação que não pode ser automatizada. Atributos: verificação associada, método, executor (leitor sem conhecimento prévio), data e resultado observado.
- **Arquivo-sentinela**: arquivo cuja alteração invalida medidas registradas. Atributos: caminho relativo à raiz (com separador `/`, sempre entre crases), razão pela qual invalida, e indicadores que invalida. Todo indicador declarado MUST ser invalidado por ao menos um arquivo-sentinela.

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Escopo dos critérios:** os critérios SC-001 a SC-005 e SC-008 a SC-010 medem o resultado do **rumo** que esta visão documenta e são verificados quando as features corretivas designadas forem concluídas. A aceitação **desta** feature é medida por SC-006, SC-007, SC-011, SC-012 e SC-013.

- **SC-001**: 100% dos testes automatizados do repositório passam, com zero falhas, em duas execuções realizadas em datas distintas.
- **SC-002**: Zero documentos do repositório descrevem tecnologia, finalidade ou capacidade que o produto não possui.
- **SC-003**: Zero nomes de marca de terceiros usados como identidade, inspiração declarada ou termo de domínio em documentação de entrada, nomes de diretórios de artefato, textos de interface e comentários de código. A citação de um caminho de artefato existente, estritamente necessária para tornar uma violação acionável, é permitida como exceção declarada, limitada a uma ocorrência por artefato (ver Edge Cases).
- **SC-004**: 100% das funcionalidades entregues possuem estado declarado em seu artefato de especificação igual ao estado real de entrega.
- **SC-005**: Zero marcadores de esclarecimento abertos em artefatos de funcionalidades entregues.
- **SC-006**: Uma pessoa sem conhecimento prévio do projeto descreve corretamente finalidade, capacidades e stack do produto usando apenas os documentos do repositório, em uma única leitura. Verificado em duas partes: (a) verificação automatizada de consistência, que reprova quando a documentação cita tecnologia ausente das dependências reais ou omite tecnologia presente nelas; e (b) walkthrough registrado como evidência datada, executado por leitor sem conhecimento prévio, cujo resultado é anexado ao artefato da feature corretiva.
- **SC-007**: Cada uma das oportunidades listadas possui evidência e critério de encerramento verificáveis — 0 itens sem evidência.
- **SC-008**: O volume transferido no primeiro carregamento do produto é reduzido em pelo menos 25% em relação ao valor medido em 2026-10-07, sem remoção de capacidade percebida pelo usuário.
- **SC-009**: Nenhum seletor de estilo é declarado de forma redundante mais de uma vez no produto.
- **SC-010**: 100% dos indicadores de qualidade declarados na visão estão dentro da meta declarada, ou possuem próximo passo associado — indicadores **bloqueantes** comprovados por verificação executável na suíte automatizada, indicadores **consultivos** acompanhados de evidência datada.
- **SC-011**: 100% das oportunidades de prioridade mais alta possuem feature corretiva designada por identificador — 0 oportunidades nessa prioridade sem designação.
- **SC-012**: Zero arquivos fora do diretório da feature são alterados por esta feature — verificado comparando o conjunto de arquivos modificados com a fronteira declarada em FR-017.
- **SC-013**: Zero indicadores publicados com medida invalidada por alteração de arquivo-sentinela não remedida — cada medida exibida é posterior à última alteração das sentinelas que a invalidam.

## Assumptions

- O produto é uma aplicação de página única executada no navegador, com persistência primária local no dispositivo; a sincronização com serviço externo de banco de dados é opcional e já implementada, portanto não é escopo desta feature.
- O escopo desta feature é diagnóstico e de governança: ela não implementa as correções. Cada correção identificada será executada sob sua própria especificação, conforme o Princípio I.
- As prioridades mapeiam impacto em: (P1) correção do sinal automatizado e confiabilidade da documentação; (P2) dívida estrutural e reconciliação de governança; (P3) sustentação de qualidade e desempenho.
- Os artefatos de tarefas de funcionalidades antigas nunca reconciliados são tratados como registro histórico e serão declarados como tal, sem preenchimento retroativo de marcações.
- A verificação de paridade entre motores de navegador permanece limitada pelo ambiente disponível e será registrada como bloqueio, não como pendência de código.
- As medidas registradas na visão têm validade na data de medição declarada e devem ser reexecutadas quando o repositório mudar de forma relevante.
- O repositório remoto é a fonte de verdade para decisões de descarte de ramificações de trabalho; nenhuma ramificação é removida sem confirmar que seu conteúdo já está na linha principal.

## Anexo A — Retrato do Sistema em 2026-10-07

Retrato factual medido nesta data no ambiente local do mantenedor. As medidas são o insumo do diagnóstico detalhado em [vision.md](./vision.md).

### A.1 Produto e arquitetura em uso

| Dimensão | Estado observado |
|---|---|
| Natureza | Aplicação web de página única (SPA) para quadro Kanban local-first com análise de fluxo (Lean/Agile) |
| Interface | React 19 com componentes funcionais e hooks customizados; estilos em CSS puro com design tokens |
| Linguagem e build | TypeScript 5.7 (modo estrito) e Vite 6 |
| Persistência | Primária local no navegador; sincronização opcional com serviço externo de banco de dados |
| Organização | 152 arquivos-fonte; componentes, hooks de estado, utilitários puros, tipos de domínio e módulos de estilo por feature |
| Verificação | 114 arquivos de teste, 701 casos declarados em execução, análise estática e formatação automatizada |
| Automação de integração | Pipeline que executa análise estática, checagem de formatação, checagem de tipos, testes com cobertura e build de produção |

### A.2 Capacidades entregues

42 funcionalidades especificadas (`specs/001` a `specs/042`), cobrindo: núcleo Kanban; limites de WIP e métricas de fluxo; interação de arrastar e soltar; etiquetas e filtros de prioridade; gestão de colunas; portabilidade de dados; detalhes da tarefa; painel analítico; prazos; múltiplos quadros; diagrama de fluxo cumulativo e suas variações; tarefas bloqueadas e impedimentos; eficiência de fluxo; limites de coluna e fluxo unidirecional; governança visual; ciclo de vida e percentis de tempo de ciclo; simulação de Monte Carlo; envelhecimento de WIP; histograma e linha do tempo de vazão; temas claro/escuro/neutro; controle de acesso por squad; tipos de tarefa e vínculos; bloqueio de movimentação; layout de colunas entre navegadores; subtarefas e comentários no cartão; cabeçalho e menu administrativo; hub de espaços de trabalho; análise categorizada de fluxo; gestão de quadros; autosave e trilha de auditoria de comentários; linha do tempo enriquecida; redesenho da atividade da tarefa; planejamento de sprint; burndown; story points; relatórios em formato de planilha; burnup de sprint.

### A.3 Resultado das verificações automatizadas

| Verificação | Comando | Resultado em 2026-10-07 |
|---|---|---|
| Testes automatizados | `npm run test` | ❌ **5 falhando** — 696 passando, de 701 |
| Build de produção | `npm run build` | ✅ Aprovado (227 módulos; carga inicial de 473 kB, 133 kB comprimidos) |
| Análise estática | `npm run lint` | ⚠️ 0 erros, **40 avisos** |
| Formatação | `npm run format:check` | ✅ Aprovado |

**Causa raiz das 5 falhas** (determinística, não intermitente — reproduz também em execução isolada): dois arquivos de teste (`tests/unit/MonteCarloSimulationView.test.tsx` e `tests/unit/CycleTimeScatterPlot.test.tsx`) cadastram datas absolutas entre 2026-08-10 e 2026-09-10, enquanto os componentes correspondentes filtram os dados por uma janela móvel de 30 dias contada a partir da data corrente. Em 2026-10-07 essas datas caíram fora da janela, o estado vazio passou a ser renderizado e as asserções sobre controles inexistentes falharam. O defeito não está no produto: está na dependência do relógio da máquina dentro dos testes.

### A.4 Indicadores de qualidade e desempenho

| Indicador | Valor medido em 2026-10-07 | Observação |
|---|---|---|
| Cobertura de instruções | 85,7% | Linha de base registrada em 2026-09-28 |
| Cobertura de ramificações | 79,5% | Linha de base registrada em 2026-09-28 |
| Cobertura de funções | 59,9% | Menor indicador; limiar fixado com folga sobre a linha de base |
| Carga inicial da aplicação | 473 kB (133 kB comprimidos) | Após code-splitting de analytics e fornecedor externo |
| Maior recurso estático | 960 kB (logotipo em formato de imagem raster) | Recurso não otimizado no diretório público |
| Módulo de estilo mais extenso | 62 kB / 2.795 linhas | Concentra estilos do painel analítico |
| Módulos-fonte acima de 400 linhas | 21 | Dos quais 10 acima de 700 linhas |
| Avisos de análise estática | 40 | Predominantemente tipos explícitos ausentes e parâmetros não utilizados |
| Seletores de estilo duplicados | 12 | Protegidos por trava de regressão automática |

### A.5 Estado do repositório

| Item | Estado |
|---|---|
| Linha principal | Última integração em 2026-09-30; área de trabalho limpa |
| Versão publicada | `v0.1.0`, sem alterações acumuladas desde a publicação |
| Ramificações locais de trabalho | 14, todas integralmente contidas na linha principal (remoção segura) |
| Ramificações remotas | 3, além da linha principal |
| Funcionalidades com estado declarado divergente da entrega | 32 — 19 marcadas como rascunho, 11 sem declaração de estado e 2 em estado pré-implementação, todas já entregues |
| Marcadores de esclarecimento abertos em funcionalidade entregue | 3 |
| Artefatos de tarefas nunca reconciliados | 5 funcionalidades antigas com listas integralmente não marcadas (55 itens) |
| Checklists com itens abertos | 10 arquivos, totalizando 172 itens não marcados |
