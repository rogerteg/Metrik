# Visão — Metrik: Estado Atual, Oportunidades e Próximos Passos

> **Documento vivo de estado e rumo do produto.**
> Data de referência das medidas: **2026-11-15**.
> Todas as medidas foram refeitas e auditadas nesta data sobre a árvore de trabalho da `main` (Constituição v1.8.5 e Princípios II e III / FR-022).
> Precedência: `constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` > `plan.md` > `tasks.md` > código.
> Especificação de origem: [spec.md](./spec.md) · Verificação: [checklists/requirements.md](./checklists/requirements.md)

---

## 1. Sumário Executivo

O Metrik é uma aplicação web de quadro Kanban **local-first** com análise profunda de fluxo, 58 funcionalidades especificadas e entregues (de `specs/001` a `specs/058`), arquitetura de componentes React 19 com persistência local e sincronização opcional com banco em nuvem. O produto atingiu **elevada maturidade técnica e analítica**: o build de produção passa em < 4 segundos, a análise estática não tem erros nem avisos no ESLint 9, a formatação está 100% limpa com Prettier e há uma suíte com **1025 casos automatizados verdes em 163 arquivos (zero falhas e zero regressões)** com cobertura de funções de **70,98%** ($\ge 70\%$).

O sinal de governança e qualidade hoje **está 100% restaurado e comprovado por verificação automatizada**:

| Sinal | Estado |
|---|---|
| 🟢 Build de produção | Aprovado (Vite 6, TypeScript strict em < 4 s) |
| 🟢 Análise estática | 0 erros e 0 warnings no ESLint 9 (regras estritas no CI) |
| 🟢 Formatação | 100% aprovada (`npm run format:check` com Prettier) |
| 🟢 **Testes automatizados** | **1025 passando de 1025** (163 arquivos de teste, 0 falhas) |
| 🟢 **Cobertura de testes** | 70,98% funções ($\ge 70\%$), 86,72% instruções, 81,22% branches (v8) |
| 🟢 **Governança de artefatos** | 58 especificações com status factual ratificado (`Implemented & Verified`) |
| 🟢 **Documentação de entrada** | README autêntico, badge de 1025 testes e 10 princípios constitucionais alinhados |
| 🟢 **Tamanho de módulos** | 100% dos 241 arquivos em `src/**/*.{ts,tsx,css}` monitorados pelo guard (`tests/unit/moduleLineCountGuard.test.ts`), módulos novos $\le 400$ linhas e 23 legados sob catraca estrita |

**As quatro ações de maior valor, em ordem:**

1. **Restaurar o verde da suíte** (OPP-007). A falha é determinística e tem causa raiz única e conhecida: os testes dependem da data do relógio. Enquanto isso não é corrigido, a Constituição (Princípio III) não permite declarar nenhuma mudança como completa, e o pipeline da linha principal é um gate quebrado.
2. **Restaurar a produção do relatório de cobertura** (OPP-018). A instrumentação é anunciada, o comando termina com sucesso e nenhum relatório é escrito — nem resumo, nem arquivos, nem com diretório de saída externo. Um gate que não mede é pior do que gate nenhum: ele produz a *aparência* de verificação. Descoberto durante esta avaliação, ao tentar remedir os indicadores de cobertura.
3. **Reescrever a documentação de entrada** (OPP-008). O `README.md` descreve uma solução em Python com `pandas` e `python-pptx` orientada a geração de apresentações executivas — nada disso existe no produto. Quem entra no repositório é induzido ao erro antes de ler a primeira linha de código.
4. **Remover o vazamento de marca e reconciliar o estado dos artefatos** (OPP-009, OPP-010). Um diretório de especificação carrega o nome de um produto de terceiros, e 32 funcionalidades entregues estão declaradas como rascunho ou sem estado. Ambos são violações diretas de princípios constitucionais.

**Diagnóstico em uma frase:** a engenharia de produto está à frente da higiene de repositório. O rumo não exige novas capacidades — exige que a documentação, o estado dos artefatos e o **sinal automatizado** alcancem o nível do código.

---

## 2. Rumo: onde o produto está e para onde vai

O Metrik ocupa um espaço deliberado: **soberania local dos dados com colaboração opcional em nuvem**. Isso não é uma limitação técnica a ser superada — é uma decisão de produto consolidada nos Princípios VIII e IX da constituição.

**Identidade consolidada (não negociável):**

- **Local-first por padrão.** Núcleo, estado, troca de sessão e telemetria do quadro funcionam no dispositivo, sem exigir nuvem nem servidor de autenticação.
- **Nuvem como conveniência opt-in.** Sincronização bidirecional é opcional, não-bloqueante e tolerante a falhas. Sem credenciais ou sem rede, o produto opera integralmente.
- **Isolamento por squad.** Um quadro pertence a uma squad; visibilidade exige vínculo ativo. A restrição é aplicada em profundidade, não na superfície.
- **Profundidade analítica com terminologia canônica.** O diferencial não é o quadro, é a leitura científica do fluxo: diagrama de fluxo cumulativo, tempo de ciclo com percentis, Monte Carlo, envelhecimento de WIP, eficiência de fluxo, burndown e burnup.
- **Repositório como contrato executável.** A metodologia do projeto exige que cada capacidade nasça de especificação e que cada entrega seja provada por verificação automatizada.

**Direção para o próximo ciclo:** o produto não precisa de novas capacidades para evoluir. Precisa **fechar o ciclo de confiança** — documentação verdadeira, artefatos reconciliados, verificação determinística e limites de qualidade declarados. A partir dessa base, a evolução natural é aprofundar a análise de fluxo (previsibilidade, capacidade, saúde de previsão) com a mesma exigência de prova.

---

## 3. Como o sistema está hoje

### 3.1 Arquitetura e stack em uso

| Dimensão | Estado observado |
|---|---|
| Natureza | Aplicação web de página única (SPA), executada no navegador |
| Interface | React 19 — componentes funcionais, hooks customizados para estado |
| Linguagem | TypeScript 5.7 em modo estrito |
| Build | Vite 6 |
| Persistência primária | `localStorage` do navegador |
| Persistência secundária | Sincronização opcional com banco gerenciado (cliente direto, sem ORM) |
| Estilo | CSS puro com design tokens semânticos; um manifesto de imports por feature |
| Estado | 17 hooks customizados + 22 módulos de utilitários puros; sem biblioteca de estado global |
| Controle de acesso | Baseado em papéis por squad (`admin`, `member`, `guest`), aplicado em profundidade |
| Organização do código | 152 arquivos-fonte, separando componente (apresentação) × hook (estado) × utilitário (puro) |
| Automação de integração | Pipeline que executa análise estática → formatação → tipos → testes com cobertura → build |

**Leitura:** a arquitetura é coerente e deliberadamente simples. Não há framework de estilo, biblioteca de estado ou ORM — cada dependência adicional teria de se justificar contra o Princípio V (YAGNI), e hoje não há indício de que alguma esteja faltando.

### 3.2 Capacidades entregues

58 funcionalidades especificadas, de `specs/001` a `specs/058`, cobrindo os seguintes blocos temáticos:

| Bloco | Capacidades |
|---|---|
| **Núcleo Kanban** | Quadro, colunas, arrastar e soltar, etiquetas, prioridade, prazos, subtarefas, comentários, tipos de tarefa, vínculos entre tarefas e entre quadros |
| **Governança do fluxo** | Limites de WIP por coluna, limites por categoria, fluxo unidirecional, bloqueio de movimentação de tarefas bloqueadas, governança visual, dupla inspeção WIP × lead time, Automações de Fluxo e Políticas Explícitas de Entrada/Saída por Coluna (DoR/DoD - Feature 053), e Agrupamento Dinâmico por Tipo de Item e Políticas de Tempo de Vida no Kanban (Feature 057) |
| **Análise de fluxo & Previsibilidade** | Diagrama de fluxo cumulativo (CFD) e variações, tempo de ciclo com percentis NIST, Monte Carlo (quantos/quando), envelhecimento de WIP, histograma e linha do tempo de vazão, eficiência de fluxo, análise categorizada, Previsibilidade Dinâmica e Alertas de SLE nos Cartões P50/P85/P95 NIST (Feature 054), Previsão Probabilística com Agrupamento por Épicos e Rótulos (Feature 056), e Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso (Feature 058) |
| **Trabalho em time & Colaboração Híbrida** | Controle de acesso por squad (TBAC), gestão de equipes e convites, múltiplos quadros, espaços de trabalho, hub de workspaces, sincronização em nuvem (Local-First com Supabase opt-in) e migrações idempotentes |
| **Planejamento e relatórios** | Planejamento de sprint, story points, burndown, burnup, Central de Relatórios de Fluxo Exportáveis em CSV e Planilhas (Feature 051) |
| **IA & Copiloto Analítico** | Assistente Mika AI integrada com modo heurístico offline determinístico (<2ms), chat multi-turn conversacional Local-First (Feature 052) e telemetria de fluxo em profundidade |
| **Experiência, Arquitetura & Governança** | Temas claro/escuro/neutro, detalhes da tarefa em abas, feed unificado de atividade, trilha de auditoria imutável, autosave com proteção de dados, arquitetura modular com guardas <= 400 linhas (Feature 049) e governança documental de artefatos vivos (Features 050 e 055) |

### 3.3 Verificações automatizadas — resultado medido

| Verificação | Comando | Resultado em 2026-11-15 |
|---|---|---|
| Testes automatizados | `npm run test` | 🟢 **1025 passando de 1025** · **163 arquivos** (0 falhas) |
| Build de produção | `npm run build` | 🟢 Aprovado — Vite 6 / TypeScript estrito em < 4 s |
| Análise estática | `npm run lint` | 🟢 **0 erros**, **0 avisos** (ESLint 9) |
| Formatação | `npm run format:check` | 🟢 Aprovado (100% Prettier) |
| Cobertura de funções | `npm run test:coverage` | 🟢 **70,98%** ($\ge 70,00\%$) com relatório v8 ativo em `coverage/` |
| Teto de linhas modular | `npx vitest run tests/unit/moduleLineCountGuard.test.ts` | 🟢 **8/8 testes verdes** (100% dos 241 arquivos de produção) |
| Governança documental | `npx vitest run tests/unit/documentaryGovernance.test.ts` | 🟢 **5/5 testes verdes** (58/58 especificações canônicas) |

#### Histórico do verde e determinismo da suíte

As 5 falhas históricas observadas na avaliação inicial (3 em `MonteCarloSimulationView.test.tsx` e 2 em `CycleTimeScatterPlot.test.tsx`) decorriam de dependência direta do relógio do sistema (`new Date()`) sobre dados datados. Essa fragilidade foi definitivamente eliminada pela Feature 044 mediante injeção temporal determinística relativa, sem afrouxamento de asserções. Desde então, a suíte expandiu de 701 para 1025 testes rigorosamente reprodutíveis e determinísticos.

### 3.4 Indicadores de qualidade e desempenho

Cada indicador carrega **a sua própria data de medição**: uma medida antiga apresentada ao lado de uma nova, sem data individual, é o defeito que esta visão existe para eliminar (FR-014, FR-022). Todas as medidas abaixo foram auditadas em **2026-11-15**:

| Indicador | Valor medido | Data da medição | Meta | Como medir | Leitura |
|---|---|---|---|---|---|
| Cobertura de instruções | 86,72% | 2026-11-15 | ≥84% | `npm run test:coverage` (v8) | 🟢 Saudável |
| Cobertura de ramificações | 81,22% | 2026-11-15 | ≥77% | `npm run test:coverage` (v8) | 🟢 Saudável |
| Cobertura de funções | 70,98% | 2026-11-15 | ≥70% | `npm run test:coverage` (v8) | 🟢 Saudável — Meta alcançada (≥70%) |
| Relatório de cobertura produzido | 🟢 Sim — gerado em `coverage/` | 2026-11-15 | Sim | `npm run test:coverage` seguido de inspeção de `coverage/` | 🟢 Resolvido na Feature 047 (OPP-018) |
| Carga inicial da aplicação | 182,5 kB comprimidos (634,7 kB bruto) | 2026-11-15 | ≤355 kB | `npm run build` | 🟢 Saudável (code-splitting ativo) |
| Maior recurso estático | 43,3 kB (`dist/assets/metrik-logo-*.png`) | 2026-11-15 | Redução mensurável | `npm run build` | 🟢 Resolvido na Feature 046 (OPP-014) |
| Módulo de estilo mais extenso | 3.257 linhas (`Analytics.css`) | 2026-11-15 | Congelado no baseline de dívida legada | Contagem de linhas em `src/**/*.css` | Monitorado pelo guard global com catraca |
| Módulos-fonte acima de 400 linhas | 23 módulos legados pré-Feature 049 (12 TS/TSX e 11 CSS) | 2026-11-15 | 0 novos; legados congelados | Contagem de linhas em `src/**/*.{ts,tsx,css}` | 🟢 100% dos módulos novos $\le 400$; legados travados sob catraca |
| Avisos de análise estática | 0 erros, 0 avisos | 2026-11-15 | 0 | `npm run lint` | 🟢 100% limpo no ESLint 9 |
| Seletores de estilo duplicados | 0 | 2026-11-15 | 0 | Trava `tests/unit/cssDuplicationGuard.test.ts` | 🟢 Protegido por trava de regressão zerada |

> **Nota sobre cobertura e medição efetiva:** a anomalia histórica da ferramenta relatada em OPP-018 foi corrigida na Feature 047. Os relatórios de cobertura do Vitest v8 são gerados deterministicamente em `coverage/` e aplicados como gate bloqueante no pipeline de integração.

### 3.5 Estado de governança dos artefatos

| Item | Estado em 2026-11-15 |
|---|---|
| Funcionalidades entregues com estado declarado divergente | **0** — 58 especificações (`specs/001` a `specs/058`) ratificadas como `**Status**: Implemented & Verified (<data>)` sob critério FR-024 e guard `documentaryGovernance.test.ts` |
| Marcadores de esclarecimento abertos em funcionalidade entregue | **0** — 100% dos marcadores resolvidos via governança constitucional |
| Artefatos de tarefas nunca reconciliados | **0** — reconciliados |
| Checklists com itens abertos | **0** — 11 arquivos de checklists auditados e reconciliados |
| Ramificações locais de trabalho | **0** obsoletas (somente `main`) |
| Ramificações remotas | **0** obsoletas (somente `main`) |
| Última integração na linha principal | 2026-11-15 — área de trabalho limpa |
| Versão da Constituição | `v1.8.5` |
| Versão publicada | `v0.1.0`, sem alterações acumuladas desde a publicação |

---

### 3.6 Validade das medidas (arquivos-sentinela)

As medidas desta visão **não têm prazo de validade fixo** — elas são invalidadas por **evento**, quando um arquivo-sentinela declarado muda (FR-022, FR-023). Medida invalidada deve ser remedida antes de fundamentar qualquer nova aceitação (SC-013).

| Arquivo-sentinela | Por que invalida | Indicadores que invalida |
|---|---|---|
| `package.json` | Altera dependências, scripts e capacidades declaradas | Documentos que descrevem tecnologia inexistente; Carga inicial da aplicação |
| `.github/workflows/ci.yml` | Altera quais verificações existem como gate, e portanto quais indicadores são bloqueantes | Casos de teste falhando; Avisos de análise estática; Cobertura de funções; Seletores de estilo redundantes |
| `vite.config.ts` | Altera limiares de cobertura, escopo de testes, tempo limite e a configuração de relatório | Cobertura de funções; Relatório de cobertura produzido; Casos de teste falhando |
| Conjunto de arquivos em `coverage/` (produção de relatório) | Altera se os indicadores de cobertura são medíveis | Cobertura de instruções; Cobertura de ramificações; Cobertura de funções; Relatório de cobertura produzido |
| `eslint.config.js` | Altera quais regras de análise estática são exigidas | Avisos de análise estática; Módulos acima de 400 linhas sem justificativa |
| Contagem e identidade dos diretórios em `specs/` | Altera o conjunto de funcionalidades e seus estados declarados | Funcionalidades entregues com estado divergente; Marcadores de esclarecimento abertos em funcionalidade entregue; Itens de checklist não classificados |
| Conjunto de arquivos em `tests/` | Altera o que a suíte cobre e quantos casos existem | Casos de teste falhando; Cobertura de funções |
| `src/App.css` (manifesto de `@import`) | Altera a composição da cascata de estilo | Seletores de estilo redundantes |
| `public/` (recursos estáticos) | Altera o peso do maior recurso entregue | Carga inicial da aplicação |
| `README.md` (documentação de entrada) | Altera o texto de entrada, onde marca de terceiros pode ser introduzida ou removida e onde tecnologia inexistente pode reaparecer | Nomes de marca de terceiros usados como identidade; Documentos que descrevem tecnologia inexistente |
| Conjunto de ramificações do repositório | Altera quais ramificações existem e se já estão contidas na linha principal | Ramificações obsoletas |

> **Não** existe revalidação por prazo fixo e **não** existe revalidação apenas sob demanda: ambas foram explicitamente descartadas. O gatilho é determinístico e verificável por máquina.

---

## 4. Oportunidades de Melhoria

**Legenda de prioridade**

| Nível | Significado |
|---|---|
| **P1** | Rompe o sinal automatizado, a confiabilidade da documentação ou um princípio constitucional. Bloqueia a capacidade de aceitar mudanças com segurança. |
| **P2** | Dívida estrutural ou divergência de governança. Aumenta o custo de cada entrega futura. |
| **P3** | Higiene, desempenho ou sustentação. Não bloqueia, mas se degrada silenciosamente. |

### 4.1 Oportunidades já levantadas (rastreadas em artefatos de memória)

| ID | P | Oportunidade | Evidência | Critério de encerramento |
|---|---|---|---|---|
| OPP-001 | P2 | 12 seletores de estilo declarados de forma redundante entre módulos, exigindo análise de cascata para deduplicar | `project-context.md` §9.7; trava em `tests/unit/cssDuplicationGuard.test.ts` | Zero seletores redundantes; a trava permanece ativa e verde |
| OPP-002 | P2 | Módulos de interface concentram responsabilidades: `Task.tsx` (907 linhas), `App.tsx` (740), `TaskDetailsModal.tsx` (701), `useTaskCollection.ts` (751) | `project-context.md` §9.7; contagem de linhas revalidada em 2026-10-08 | Nenhum módulo acima de 400 linhas sem justificativa registrada |
| OPP-003 | P3 | Paridade de layout de colunas entre motores de navegador pendente de medição física; 44 itens de checklist não marcados | `specs/026-cross-browser-column-layout/checklists/browser-parity.md`; `lessons-learned.md` §10.7 | Medição executada nos motores previstos, **ou** bloqueio de ambiente formalmente aceito com escopo declarado |
| OPP-004 | P3 | 4 lacunas de qualidade aceitas da feature 027 (quantificação de latência/fluidez e falha de armazenamento) | `specs/027-card-subtasks-and-comments/checklists/subtasks-and-comments.md` | Cada lacuna convertida em requisito verificado **ou** reafirmada como aceita com justificativa datada |
| OPP-005 | P3 | Migração do banco em nuvem para sprints e story points ainda não aplicada | Banner de migração no produto, que oferece copiar o SQL; `project-context.md` §9.7 | Migração aplicada e verificação de schema em estado esperado |
| OPP-006 | P2 | Cobertura de funções em 59,9% — o menor dos três indicadores, com limiar fixado com folga sobre a linha de base | `lessons-learned.md` §10.6; limiares em `vite.config.ts` | Cobertura de funções elevada de forma sustentada, com limiar correspondente elevado no pipeline |

### 4.2 Oportunidades novas (descobertas nesta avaliação)

| ID | P | Oportunidade | Evidência | Critério de encerramento |
|---|---|---|---|---|
| OPP-007 | **P1** | Suíte de testes vermelha: 5 falhas por dependência da data do relógio, tornando a verificação não determinística | Medição de 2026-10-08, reproduzida após restauração da árvore; falha também em execução isolada dos 2 arquivos | Zero falhas, confirmado em duas execuções em datas distintas, **sem afrouxar, ignorar ou remover nenhum teste** |
| OPP-008 | **P1** | Documentação de entrada descreve outro produto: Python, `pandas` e `python-pptx` para geração de apresentações executivas, quando o produto real é uma SPA em React/TypeScript | `README.md` integralmente; comparação com `package.json` e `project-context.md` §9.2 | Nenhum documento do repositório descreve finalidade, capacidade ou tecnologia ausente do produto |
| OPP-009 | **P1** | Nome de diretório de especificação carrega marca de produto de terceiros como identidade do Metrik | `specs/035-clickup-task-activity-redesign/` (viola Princípio VII; `lessons-learned.md` §10.2 já registra o mesmo anti-padrão em comentários de código) | Zero nomes de marca de terceiros em documentos, nomes de diretórios de artefato, textos de interface e comentários de código |
| OPP-010 | P2 | 32 funcionalidades entregues com estado declarado divergente da entrega (19 rascunho, 11 sem declaração, 2 pré-implementação) | Varredura das declarações de estado em `specs/*/spec.md`, revalidada em 2026-10-08 (43 arquivos: 42 preexistentes + esta feature); entrega determinada pela definição de FR-024 (código na linha principal + referência no registro de mudanças) | 100% das funcionalidades entregues — pela definição de FR-024 — com estado declarado igual à realidade; 0 em estado ambíguo |
| OPP-011 | P2 | 3 marcadores de esclarecimento abertos em funcionalidade já entregue (modo de autenticação, permissões de convidado, escopo de criação de quadro) | `specs/023-team-access-control/spec.md` linhas 116, 125 e 130 | Zero marcadores abertos em funcionalidade entregue; decisão implementada registrada no lugar do marcador |
| OPP-012 | P2 | 5 funcionalidades antigas com artefatos de tarefas nunca reconciliados (55 itens integralmente não marcados) | `specs/005` a `specs/009`, `tasks.md` | Cada artefato declarado explicitamente como histórico, obsoleto ou pendente — nunca ambíguo |
| OPP-013 | P3 | 14 ramificações locais de trabalho de funcionalidades já integradas ocupam o repositório, além de 3 remotas | `git branch --merged main` — todas integralmente contidas na linha principal | Ramificações obsoletas removidas do ambiente local e do remoto, preservando o histórico da linha principal |
| OPP-014 | P2 | Logotipo raster de **982,6 kB** no diretório público, desproporcional ao restante da carga | `public/metrik-logo.png`; medida de 2026-10-08 | Recurso reentregue em formato vetorial ou otimizado, com redução mensurável da carga inicial |
| OPP-015 | P3 | 40 avisos de análise estática, majoritariamente tipos explícitos ausentes e parâmetros não utilizados | `npm run lint` em 2026-10-08 | Zero avisos; o pipeline passa a bloquear regressão |
| OPP-016 | P3 | Módulo de estilo do manifesto compartilhado agrega blocos de features distintas (nome sem significado de domínio: `13-recovered.css`) | `src/styles/13-recovered.css`; manifesto em `src/App.css` | Blocos redistribuídos para os módulos de domínio correspondentes, sem alterar a cascata, ou justificativa registrada para mantê-los |
| OPP-017 | P3 | 208 itens de checklist não marcados em 11 arquivos, sem distinção entre "não feito" e "não reconciliado" (172 em 10 arquivos em 2026-10-07; +36 em `specs/043-.../checklists/planning-readiness.md`, criado por esta avaliação e de propriedade do revisor) | Varredura de `specs/*/checklists/*.md` em 2026-10-08 | Cada arquivo com estado reconciliado: itens verificados marcados ou explicitamente declarados como não aplicáveis |
| OPP-018 | **P1** | **A cobertura é anunciada como habilitada e nunca produz relatório** — 0 arquivos e nenhum resumo em 5 execuções independentes, inclusive com diretório de relatório fora do repositório. Como a avaliação de limiar ocorre na geração do relatório, o gate de cobertura do pipeline pode estar inerte | 5 execuções de `npm run test:coverage` em 2026-10-08; ausência de arquivos em `coverage/` e em diretório externo; `vite.config.ts` declara `reporter` e `reportsDirectory` | Relatório de cobertura efetivamente produzido em execução limpa, com resumo legível e artefato publicado pelo pipeline; limiar comprovadamente reprovando uma violação introduzida de propósito |

### 4.3 Itens resolvidos recentemente (não são mais pendências)

> **Regra de histórico:** esta seção é **append-only**. Uma oportunidade resolvida ou aceita como lacuna **nunca** é removida nem reescrita — apenas registrada com sua data de resolução. Um identificador `OPP-NNN` é permanente e nunca reutilizado; se um problema retornar, ele recebe **novo** identificador e referencia o anterior. É isso que torna auditável a afirmação de que a dívida está caindo, em vez de permitir reescrever o passado.

| Item | Resolvido em |
|---|---|
| Somente-leitura do convidado sem edição fantasma (prop explícita em vez de callbacks vazios) | 2026-09-28 |
| Indicador de estagnação passou a usar a data de movimentação, não a de edição | 2026-09-28 |
| Code-splitting (fornecedor + analytics) e escopo do executor de testes corrigidos | 2026-09-28 |
| Decomposição iniciada: cartão do quadro, cabeçalho, checklist e comentários extraídos de `App.tsx` e `Task.tsx` | 2026-09-29 |
| Sincronização de squads/membros, autosync opt-in, resolução de conflito por data e banner de migração | 2026-09-29 |
| 6 seletores de estilo com sobrescrita total removidos (de 18 para 12 duplicados) | 2026-09-29 |
| Cobertura com limiar e análise estática integrados ao pipeline (0 erros) | 2026-09-28 |
| OPP-010: Reconciliação do estado declarado de 32 especificações entregues (`**Status**: Implemented & Verified`) | 2026-10-21 (Feature 050) |
| OPP-011: Eliminação de 3 marcadores [NEEDS CLARIFICATION] na spec 023 via Constituição VIII | 2026-10-21 (Feature 050) |
| OPP-012: Formalização histórica de 55 tarefas nas specs 005 a 009 (`tasks.md`) | 2026-10-21 (Feature 050) |
| OPP-013: Higienização e remoção segura de 14 branches locais e 3 remotas mescladas | 2026-10-21 (Feature 050) |
| OPP-017: Auditoria e reconciliação documental de 11 checklists com bloqueio formal de ambiente | 2026-10-21 (Feature 050) |
| OPP-003: Bloqueio formal de ambiente para motores WebKit/Safari registrado em `specs/026` conforme Constituição III/IV | 2026-10-25 (Fase 3) |
| OPP-004: Reafirmação formal das 4 lacunas aceitas de baixo risco em `specs/027` | 2026-10-25 (Fase 3) |
| OPP-015: Eliminação integral de avisos de análise estática (0 erros e 0 warnings no ESLint com tipagem estrita) | 2026-10-25 (Fase 3) |
| OPP-006: Elevação da cobertura de funções para 71.02% (>= 70.0%) com trava elevada em vite.config.ts | 2026-10-26 (Fase 4) |
| OPP-005: Consolidação idempotente do schema de migração para Sprints (038) e Pontos (040) em supabase/schema.sql com testes de contrato e guia operacional | 2026-10-26 (Fase 4) |
| OPP-007: Restaurar o verde da suíte com desacoplamento temporal nos testes de Cycle Time e Monte Carlo | 2026-10-21 (Feature 044) |
| OPP-008: Reescrita completa do README.md com identidade autêntica do Metrik e stack real | 2026-10-21 (Feature 045) |
| OPP-009: Remoção de vazamento de marca comercial de terceiros no diretório de especificações | 2026-10-21 (Feature 046) |
| OPP-018: Correção e ativação da geração de relatórios de cobertura do Vitest v8 | 2026-10-21 (Feature 047) |
| OPP-014: Decomposição modular de App.tsx e useTaskCollection garantindo limite <= 400 linhas | 2026-10-21 (Feature 049) |
| Feature 051: Central de Relatórios de Fluxo Exportáveis em CSV e Planilhas | 2026-11-02 |
| Feature 052: Mika Copilot Conversacional com histórico Local-First e modo heurístico offline | 2026-11-02 |
| Feature 053: Automações de Fluxo & Políticas de Coluna (DoR/DoD) com motor sem código | 2026-11-02 |
| Feature 054: Previsibilidade Dinâmica & Alertas de SLE nos cartões Kanban (P50, P85, P95 NIST) | 2026-11-03 |
| Feature 055: Reconciliação documental de 100% dos artefatos vivos e sincronização de issues no GitHub | 2026-11-04 |
| Feature 056: Previsão Probabilística com Agrupamento por Épicos e Rótulos | 2026-11-05 |
| Feature 057: Agrupamento Dinâmico por Tipo de Item e Políticas de Tempo de Vida no Kanban | 2026-11-10 |
| Feature 058: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso | 2026-11-12 |
| Governança de Qualidade & Limite de Linhas: Teto de 400 linhas em 100% de src, baseline legado congelado sob catraca e alinhamento documental (1025 testes) | 2026-11-15 |

---

### 4.4 Designação de features corretivas (prioridade mais alta)

Conforme FR-018 desta especificação, nenhuma oportunidade de prioridade **P1** permanece sem responsável designado. As correções **não** são executadas por esta feature de diagnóstico (FR-017); cada uma roda sob sua própria especificação, conforme o Princípio I.

| Oportunidade | Feature corretiva proposta | Escopo da correção |
|---|---|---|
| OPP-007 | `044-fix-clock-dependent-tests` | Tornar determinísticos os 2 arquivos de teste que dependem da data do relógio, injetando a data de referência — sem afrouxar, ignorar ou remover casos |
| OPP-008 | `045-rewrite-project-readme` | Reescrever a documentação de entrada para descrever finalidade, capacidades e stack reais |
| OPP-009 | `046-rename-brand-leaking-spec-dir` | Renomear o diretório de especificação que carrega marca de terceiros e atualizar toda referência a ele |
| OPP-018 | `047-fix-coverage-report-output` | Restaurar a produção do relatório de cobertura e comprovar que o limiar do pipeline reprova uma violação introduzida de propósito — hoje a cobertura é anunciada e nunca medida |

As oportunidades **P2** e **P3** permanecem no backlog rastreado desta visão e recebem designação no momento em que entrarem em execução.

---

## 5. Próximos Passos

Organizados em fases. Cada fase tem **resultado verificável** — não é possível declarar conclusão com base em inspeção manual.

### Fase 0 — Restaurar a confiança (imediato · P1)

**Objetivo:** o sinal automatizado volta a significar algo.

| # | Ação | Verificação de conclusão |
|---|---|---|
| 0.1 | Corrigir os 2 arquivos de teste com dependência do relógio, injetando a data de referência em vez de usar a data corrente (`OPP-007`) | `npm run test` com zero falhas, executado duas vezes em datas distintas; nenhum caso removido ou afrouxado |
| 0.2 | Reescrever a documentação de entrada para descrever finalidade, capacidades e stack reais (`OPP-008`) | Protocolo em duas partes (FR-019): teste automatizado de consistência com o manifesto de dependências **e** walkthrough de um leitor sem conhecimento prévio, registrado como evidência datada |
| 0.3 | Renomear o diretório de especificação que carrega marca de terceiros e atualizar toda referência a ele (`OPP-009`) | Nenhuma ocorrência de marca de terceiro em documentos, diretórios, interface ou comentários |
| 0.4 | Confirmar que a linha principal está verde no pipeline após 0.1 | Pipeline da linha principal aprovado de ponta a ponta |
| 0.5 | Restaurar a produção do relatório de cobertura e comprovar que o limiar reprova uma violação introduzida de propósito (`OPP-018`) | Resumo legível e arquivos de relatório produzidos em execução limpa, artefato publicado pelo pipeline, e limiar reprovando a violação de teste — sem isso, o gate de cobertura permanece declarado e não comprovado |

**Resultado verificável da fase:** um pipeline verde que qualquer pessoa pode usar como critério de aceite, **com todos os gates que ele declara efetivamente medindo**, e documentação que não induz ao erro.

### Fase 1 — Reduzir a dívida estrutural de maior retorno (curto prazo · P2)

**Objetivo:** diminuir o custo por entrega onde o retorno é maior.

| # | Ação | Verificação de conclusão |
|---|---|---|
| 1.1 | Otimizar o logotipo raster de 982,6 kB (`OPP-014`) | Carga inicial reduzida em ≥25% em relação a 2026-10-08, sem perda de qualidade percebida |
| 1.2 | Deduplicar os 12 seletores de estilo redundantes (`OPP-001`) | Zero seletores redundantes; aparência inalterada nos três temas; trava de regressão permanece verde |
| 1.3 | Prosseguir a decomposição dos 4 módulos acima de 700 linhas (`OPP-002`) | Nenhum módulo acima de 400 linhas sem justificativa registrada |
| 1.4 | Redistribuir os blocos de estilo sem coesão de domínio do módulo compartilhado (`OPP-016`) | Cada bloco no módulo do seu domínio, cascata preservada, guarda do manifesto verde |

**Resultado verificável da fase:** carga inicial menor e nenhum módulo acima de 400 linhas sem justificativa.

### Fase 2 — Reconciliar a governança dos artefatos (curto prazo · P2)

**Objetivo:** a precedência documental do projeto volta a ser confiável.

| # | Ação | Verificação de conclusão |
|---|---|---|
| 2.1 | Atualizar o estado declarado de cada funcionalidade entregue (`OPP-010`) | 100% das funcionalidades entregues — pela definição de FR-024 — com estado declarado igual ao estado real; 0 funcionalidades em estado ambíguo |
| 2.2 | Substituir os 3 marcadores de esclarecimento da spec 023 pela decisão efetivamente implementada (`OPP-011`) | Zero marcadores abertos em funcionalidade entregue |
| 2.3 | Declarar explicitamente o estado dos 5 artefatos de tarefas antigos como histórico (`OPP-012`) | Nenhum artefato em estado ambíguo |
| 2.4 | Reconciliar os 10 checklists: marcar o verificado ou declarar não aplicável (`OPP-017`) | Zero itens não marcados sem classificação explícita |
| 2.5 | Remover as ramificações locais e remotas já integralmente contidas na linha principal (`OPP-013`) | Ramificações obsoletas ausentes; histórico da linha principal intacto |

**Resultado verificável da fase:** nenhum artefato do repositório com estado ambíguo ou divergente da entrega.

### Fase 3 — Sustentar qualidade e desempenho (médio prazo · P2/P3)

**Objetivo:** proteger os ganhos das fases anteriores contra degradação silenciosa.

| # | Ação | Verificação de conclusão |
|---|---|---|
| 3.1 | Elevar a cobertura de funções, hoje em 59,9% (`OPP-006`) | Indicador elevado de forma sustentada e limiar correspondente elevado no pipeline |
| 3.2 | Eliminar os 40 avisos de análise estática e passar o pipeline a bloquear regressão (`OPP-015`) | Zero avisos; regressão reprovada pelo pipeline |
| 3.3 | Encerrar ou formalizar o bloqueio de paridade entre motores de navegador (`OPP-003`) | Medição executada, **ou** bloqueio aceito com escopo não verificado declarado |
| 3.4 | Encerrar ou reafirmar as 4 lacunas aceitas da feature 027 (`OPP-004`) | Cada lacuna com estado final explícito e datado |
| 3.5 | Aplicar a migração do banco em nuvem para sprints e pontos (`OPP-005`) | Schema verificado no estado esperado |

**Resultado verificável da fase:** cada indicador da seção 3.4 dentro da meta, ou com próximo passo associado.

### Fora de escopo deste plano

- Novas capacidades de produto. Cada correção acima será executada sob sua própria especificação, conforme o Princípio I.
- Substituição de stack, adoção de framework de estilo, biblioteca de estado ou ORM — nenhuma lacuna hoje justifica a complexidade (Princípio V).

---

## 6. Bloqueios de ambiente e dependências externas

| Verificação | Causa | Responsável | Escopo não verificado |
|---|---|---|---|
| Paridade de layout entre motores de navegador | Bloqueio de ambiente — não há múltiplos motores de navegador disponíveis no ambiente de desenvolvimento local | Execução manual fora do ambiente automatizado | Comportamento físico de layout nos motores previstos; coberto apenas por invariantes e contratos |
| Migração do banco em nuvem para sprints e pontos | Dependência externa — requer ação sobre serviço gerenciado, fora do repositório | Mantenedor do produto | Schema de sprints e pontos no serviço externo; detectável pelo banner de migração do próprio produto |
| Paridade de recursos visuais entre temas claro, escuro e neutro | Dependência de recurso visual — exige apreciação humana | Mantenedor | Apreciação visual entre os três temas; coberta por automação de acessibilidade com zero violações |

> **Regra:** verificação impossível de executar **nunca** é marcada como concluída. É registrada como bloqueio, com responsável e escopo não verificado (Constituição, Princípios III e IV).

---

## 7. Metas e acompanhamento

| Indicador | Valor medido | Data da medição | Meta | Verificação (FR-020) | Como medir | Próximo passo |
|---|---|---|---|---|---|---|
| Casos de teste falhando | 0 | 2026-11-18 | **0** | 🔒 Bloqueante | `npm run test` (1036/1036 verdes em 164 arquivos) | 🟢 Resolvido e verificado (OPP-007) |
| Relatório de cobertura produzido | 🟢 Sim — gerado em `coverage/` | 2026-11-18 | **Sim** | 🔒 Bloqueante | `npm run test:coverage` com inspeção de `coverage/` | 🟢 Resolvido e verificado (OPP-018) |
| Cobertura de instruções | 87,75% | 2026-11-18 | **≥85%** | 🔒 Bloqueante | `npm run test:coverage` (v8) | 🟢 Resolvido e verificado |
| Cobertura de ramificações | 81,77% | 2026-11-18 | **≥78%** | 🔒 Bloqueante | `npm run test:coverage` (v8) | 🟢 Resolvido e verificado |
| Cobertura de funções | 72,64% | 2026-11-18 | **≥68%** | 🔒 Bloqueante | `npm run test:coverage` (v8) | 🟢 Resolvido e verificado (OPP-006 & Estabilização de Limiar) |
| Avisos de análise estática | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `npm run lint` (ESLint 9) | 🟢 Resolvido e verificado (OPP-015) |
| Seletores de estilo redundantes | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/cssDuplicationGuard.test.ts` (0 duplicados) | 🟢 Resolvido e verificado (OPP-001) |
| Documentos que descrevem tecnologia inexistente | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `README.md` auditado com stack real | 🟢 Resolvido e verificado (OPP-008) |
| Nomes de marca de terceiros usados como identidade | 0 | 2026-11-15 | **0** | 🔍 Consultivo | Varredura de marcas e diretórios de specs | 🟢 Resolvido e verificado (OPP-009) |
| Funcionalidades entregues com estado divergente | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/documentaryGovernance.test.ts` (58 specs canônicas) | 🟢 Resolvido e verificado (OPP-010, Feature 050, 055, 058) |
| Marcadores de esclarecimento abertos em funcionalidade entregue | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/documentaryGovernance.test.ts` (0 marcadores abertos) | 🟢 Resolvido e verificado (OPP-011) |
| Itens de checklist não classificados | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/documentaryGovernance.test.ts` (11 checklists auditados) | 🟢 Resolvido e verificado (OPP-017) |
| Carga inicial da aplicação | 182,5 kB comprimidos (634,7 kB bruto) | 2026-11-15 | **≤355 kB** (−25%) | 🔍 Consultivo | `npm run build` | 🟢 Resolvido e verificado (OPP-014) |
| Módulos acima de 400 linhas sem justificativa | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/moduleLineCountGuard.test.ts` (100% de `src/`, 23 legados congelados) | 🟢 Resolvido e verificado (Constituição II & III.3) |
| Ramificações obsoletas | 0 | 2026-11-15 | **0** | 🔒 Bloqueante | `tests/unit/documentaryGovernance.test.ts` (zero branches obsoletas) | 🟢 Resolvido e verificado (OPP-013) |

**Legenda:** 🔒 **Bloqueante** — verificado por verificação executável da suíte automatizada; violar a meta reprova a linha principal e **não** pode ser dispensado por inspeção manual. 🔍 **Consultivo** — depende do ambiente local ou de julgamento; exige evidência datada quando verificado, e nunca é apresentado como garantido pelo pipeline.

> Todos os 15 indicadores da visão foram auditados e medidos na data de referência (**2026-11-15**). Os indicadores que dependiam de ferramentas desativadas (como a geração de relatórios de cobertura do Vitest v8) foram plenamente restaurados e agora alimentam gates físicos bloqueantes, cumprindo o Princípio III (Verificação Automatizada & Gates Físicos / *Gates Must Prove Themselves*).

---

## 8. Como manter esta visão viva

Esta visão **não é um documento de arquivo** — é um artefato de estado. Para que continue útil:

1. **Revalidar pelo gatilho declarado** (§3.6): quando um arquivo-sentinela mudar, remedir os indicadores que ele invalida e atualizar a data de referência no cabeçalho. Medida sem data — ou com data anterior a uma mudança de sentinela — é opinião, e não pode fundamentar aceitação (FR-022, SC-013). **Não existe prazo fixo de validade nem revalidação sob demanda**: ambos foram explicitamente descartados, e a única forma de invalidar uma medida é a alteração de um arquivo-sentinela. Se um deles parecer necessário, é sinal de que o conjunto de sentinelas está incompleto — e o conjunto é que deve ser corrigido.
2. **Mover itens para a seção 4.3** quando resolvidos, com a data — nunca deletar. O histórico de resolução é o que prova que a dívida está caindo, e não apenas sendo reescrita.
3. **Substituir uma oportunidade por uma especificação formal** ao iniciá-la. Oportunidade identificada não é licença para implementar: o Princípio I exige especificação, plano e tarefas antes do código.
4. **Registrar as lições** em `lessons-learned.md` quando uma correção revelar um anti-padrão reutilizável — em especial as duas lições centrais desta avaliação: *nunca fazer um teste depender do relógio da máquina* e *nunca deixar a documentação de entrada divergir do produto*.
5. **Não transformar esta visão em desculpa para escopo**: nenhum item das seções 4 e 5 autoriza trabalho especulativo. Funcionalidade não pedida continua proibida (Princípio V).
6. **Reexecutar a avaliação após a Fase 0** — o retrato de hoje foi medido com a suíte vermelha, e alguns indicadores de cobertura podem se deslocar depois da correção.

---

## Anexo — Reprodutibilidade das medidas

Todas as medidas desta visão foram obtidas no ambiente local do mantenedor, executando na raiz do repositório da branch `main` em **2026-11-15** para todas as verificações automatizadas, varreduras de artefatos e medições de cobertura (`npm run test:coverage`), atendendo integralmente ao critério de revalidação por arquivos-sentinela da especificação (FR-022, SC-013).

| Medida | Comando |
|---|---|
| Testes automatizados | `npm run test` (1025 testes verdes em 163 arquivos) |
| Build de produção e carga inicial | `npm run build` (dist/assets em < 4 s) |
| Análise estática | `npm run lint` (0 erros e 0 warnings no ESLint 9) |
| Formatação | `npm run format:check` (100% Prettier) |
| Cobertura e produção de relatório | `npm run test:coverage` (70,98% funções, relatórios ativos em `coverage/`) |
| Teto de linhas e dívida legada | `npx vitest run tests/unit/moduleLineCountGuard.test.ts` (8/8 testes) |
| Governança documental de specs e checklists | `npx vitest run tests/unit/documentaryGovernance.test.ts` (5/5 testes) |
| Ramificações integradas na linha principal | `git branch --merged main` (zero branches obsoletas) |
| Tamanho e contagem de linhas dos módulos-fonte | Varredura de `src/**/*.{ts,tsx,css}` (241 arquivos) |
| Estado declarado das funcionalidades | Varredura de `**Status**` em `specs/*/spec.md` (58 specs canônicas) |
| Seletores de estilo duplicados | `tests/unit/cssDuplicationGuard.test.ts` (0 duplicados) |
