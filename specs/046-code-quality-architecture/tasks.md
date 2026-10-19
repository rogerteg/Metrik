# Tasks: Feature 046 - Qualidade de Código & Arquitetura (Ciclo 3)

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI - Mandatório)

### 1. Decomposição por Primeiros Princípios (First-Principles Thinking)
- **Verdade Fundamental de Tipagem Estática:** O compilador TypeScript só pode prevenir defeitos de runtime e garantir contratos de modelo de dados (Constituição I) se a fuga de tipos via `any` for sistematicamente eliminada. Cada `any` em um componente ou serviço de sincronização representa um ponto cego onde erros de propriedade e coerções silenciosas podem emergir em produção.
- **Invariante de Renderização React:** O hook `useEffect` deve reagir a dependências factuais e declaradas. Quando variáveis externas são omitidas da lista de dependências (`exhaustive-deps`), o hook opera com *stale closures* (valores defasados de renderizações anteriores). Para declarar todas as dependências sem provocar loops infinitos, referências de objetos e funções devem ser estabilizadas com `useCallback` e `useMemo`.
- **Invariante de Carga de Assets:** A distribuição estática web não deve transferir bytes redundantes. O logotipo exibido em dimensões máximas de 48px na UI não necessita de um arquivo original não-comprimido de 1024x1024 com quase 1 MB; um arquivo de 256x256 pixels com compressão PNG otimizada e Lanczos oferece densidade Retina impecável consumindo menos de 50 KB (economia de 95%).

### 2. Análise Pré-Mortem & Pensamento Invertido (Inversion & Premortem Analysis)
- **Modo de Falha 1 (Loop Infinito no `useEffect` de `useTeamAccess`):** Ao adicionar `activeUserId`, `invitations`, `teamMembers`, `teams`, `users` ao array de dependências, se esses arrays forem recriados a cada ciclo de render pelo componente pai, o `useEffect` disparará em loop contínuo, congelando o navegador.
  - *Mitigação:* Usar chaves de identificação estáveis ou memoização com `useCallback` para as funções sincronizadoras e dependências derivadas.
- **Modo de Falha 2 (Distorção ou Perda de Transparência do Logotipo):** A compressão ou quantização agressiva do PNG poderia gerar bordas brancas (halos) sobre o fundo escuro do Metrik (`#0b0f19`) ou perda do canal alpha.
  - *Mitigação:* Utilizar `LANCZOS` para reamostragem, manter o modo RGBA nativo com `optimize=True` e validar visualmente sobre fundo escuro.
- **Modo de Falha 3 (Regressão de Deserialização no Supabase):** Ao tipar os retornos do Supabase em `syncService.ts`, tipagens excessivamente restritivas podem lançar erros se a API retornar campos `null` ou colunas ausentes.
  - *Mitigação:* Usar campos opcionais (`field?: type | null`) e `unknown` com asserções de guard para dados JSON dinâmicos (`subtasks`, `comments`).

### 3. Validação MECE (Mutually Exclusive, Collectively Exhaustive)
- **Mutuamente Exclusivas:**
  - `Phase 1`: Diagnóstico e baseline.
  - `Phase 2`: Governança e regras do linter em `eslint.config.js`.
  - `Phase 3`: Tipagem estrita de componentes e serviços (US1).
  - `Phase 4`: Otimização do asset de logo (US2).
  - `Phase 5`: Estabilização de dependências de hooks (US3).
  - `Phase 6`: Validação cruzada e verificação de não-regressão.
- **Coletivamente Exaustivas:** A soma de todas as tarefas cobre 100% dos 40 warnings do ESLint, a redução de payload do logo para < 120 KB, a estabilização de todos os hooks apontados e a não-regressão de 701 testes.

### 4. Árvore de Decisão & Poda de Alternativas (Tree of Thoughts)
- **Alternativa Descartada (Desativar regras do ESLint com `eslint-disable`):** Descartada por violar o Princípio II e III da Constituição, mascarando problemas em vez de resolvê-los.
- **Alternativa Descartada (Converter logo para WebP):** Descartada na clarificação Q2 para evitar quebrar imports e compatibilidade em testes.
- **Alternativa Descartada (Manter `@typescript-eslint/no-explicit-any` como `"warn"`):** Descartada na clarificação Q1 em favor da elevação para `"error"` para blindar o projeto contra novos débitos técnicos.

### 5. Critério de Falsificabilidade & Testabilidade (TDD / Red-Bar First)
- **Red Bar Inicial:** `npm run lint` reporta 40 warnings ativos; `(Get-Item src/assets/metrik-logo.png).Length` reporta 982.628 bytes.
- **Green Bar Final:** `npm run lint` reporta exatamente `0 problems (0 errors, 0 warnings)` com a regra `no-explicit-any` configurada como `"error"`; o logo em disco tem < 120 KB; e `npm test` passa com 701/701 testes verdes.

### 6. Triangulação Adversarial & Verificação Constitucional
- **Constituição I (Model Integrity):** Fortalecida pela erradicação de `any`.
- **Constituição II (Clean Architecture):** Separação clara de tipos de domínio em `src/types/`.
- **Constituição III (Automated Verification):** 701 testes unitários mantidos 100% verdes com zero enfraquecimento de asserções.
- **Constituição V (Simplicity & YAGNI):** Soluções nativas de tipagem sem inclusão de novas bibliotecas em `package.json`.

---

## Phase 1: Setup & Diagnóstico de Linha de Base

**Purpose**: Registrar o inventário de baseline dos warnings do linter

- [x] T001 Mapear inventário e linha de base dos 40 warnings executando npm run lint

---

## Phase 2: Foundational (Configuração do Linter)

**Purpose**: Preparar a infraestrutura de governança estrita de código

- [x] T002 Configurar regra @typescript-eslint/no-explicit-any para "error" em eslint.config.js

---

## Phase 3: User Story 1 - Código Estritamente Tipado e Zero Warnings no Pipeline (Priority: P1) 🎯 MVP

**Goal**: Substituir todos os tipos any soltos por interfaces e tipos seguros de domínio em componentes e serviços.

**Independent Test**: Executar `npm run lint` e certificar que todos os warnings de `no-explicit-any` e `no-unused-vars` foram eliminados.

- [x] T003 [P] [US1] Substituir tipos any por tipos de domínio (Team, TeamMember, User, Invitation, React.FormEvent) em src/components/TeamManagementModal.tsx
- [x] T004 [P] [US1] Substituir tipos any por tipos de formulário e seleção de times em src/components/BoardManagementModal.tsx
- [x] T005 [P] [US1] Tipar parâmetros e estados de times em src/components/BoardSwitcher.tsx, src/components/TaskMetadataSidebar.tsx e src/components/UserProfileMenu.tsx
- [x] T006 [P] [US1] Tipar resposta de workspaces em src/hooks/useWorkspaces.ts
- [x] T007 [US1] Substituir tipos any por RemoteWorkspaceRow, RemoteBoardRow, RemoteTaskRow e prefixar variáveis não utilizadas com _ em src/services/supabase/syncService.ts
- [x] T008 [US1] Validar que os warnings de tipagem e variáveis não utilizadas foram erradicados via npm run lint

**Checkpoint**: User Story 1 concluída — base de código 100% livre de any solto.

---

## Phase 4: User Story 2 - Otimização de Assets e Desempenho de Carregamento (Priority: P1)

**Goal**: Otimizar o arquivo de logotipo principal para menos de 120 KB preservando nitidez e transparência.

**Independent Test**: Inspecionar o tamanho do arquivo `src/assets/metrik-logo.png` em disco e no bundle gerado por `npm run build`.

- [x] T009 [US2] Redimensionar e comprimir src/assets/metrik-logo.png para 256x256 pixels com filtro Lanczos e alpha preservado via Pillow
- [x] T010 [US2] Validar tamanho do asset de logo em disco (< 120 KB) e compilar produção checando dist/assets/ via npm run build

**Checkpoint**: Logotipo otimizado com redução > 80% do payload.

---

## Phase 5: User Story 3 - Estabilidade e Previsibilidade dos Hooks Reativos (Priority: P2)

**Goal**: Resolver dependências ausentes em `useMemo` e `useEffect`, prevenindo stale closures e loops reativos.

**Independent Test**: Executar `npm run lint` e atestar zero avisos de `react-hooks/exhaustive-deps`.

- [x] T011 [P] [US3] Incluir customDateRange no array de dependências do useMemo em src/hooks/useCfdData.ts
- [x] T012 [P] [US3] Envolver inicialização de myTeams em useMemo com dependências estáveis em src/components/BoardManagementModal.tsx
- [x] T013 [US3] Estabilizar sincronização com useCallback e memoização de dependências em src/hooks/useTeamAccess.ts

**Checkpoint**: Hooks reativos operando com dependências exaustivas e zero avisos.

---

## Phase 6: Polish & Validação Integrada

**Purpose**: Verificações finais de formatação, suíte completa de testes e build de produção

- [x] T014 [P] Executar npm run format para assegurar conformidade Prettier em todos os arquivos modificados
- [x] T015 Executar suíte de testes automatizados com npm test atestando 701/701 testes verdes
- [x] T016 Executar compilação de produção com npm run build atestando tempo < 5s e zero erros
- [x] T017 Executar o roteiro de verificação documentado em specs/046-code-quality-architecture/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Inicia imediatamente.
- **Phase 2 (Foundational)**: Configura a regra estrita em `eslint.config.js`.
- **Phase 3 (User Story 1 - MVP)**: Executa a tipagem estrita de componentes e serviços.
- **Phase 4 (User Story 2)**: Executa em paralelo ou sequencialmente com Phase 3.
- **Phase 5 (User Story 3)**: Estabiliza dependências de hooks.
- **Phase 6 (Polish)**: Depende de todas as alterações concluídas.

### Parallel Opportunities
- `T003`, `T004`, `T005`, `T006` podem ser desenvolvidos em paralelo por atuarem em arquivos distintos.
- `T009` (Asset) pode ser executado em paralelo com as tarefas de tipagem.
- `T011` e `T012` podem ser executados em paralelo.

---

## Implementation Strategy: MVP First
1. Sanar tipagens `any` e warnings em componentes e serviços (`T003` a `T007`).
2. Estabilizar dependências de hooks (`T011` a `T013`).
3. Otimizar imagem do logo (`T009`).
4. Elevar regra do ESLint para `"error"` (`T002`).
5. Validar linter, testes e build (`T008`, `T010`, `T014`, `T015`, `T016`, `T017`).
