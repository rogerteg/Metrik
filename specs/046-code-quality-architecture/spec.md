# Feature Specification: Qualidade de Código & Arquitetura (Ciclo 3)

**Feature Branch**: `046-code-quality-architecture`

**Created**: 2026-10-15

**Status**: Implemented & Verified (2026-10-21)

**Input**: User description: "/speckit-specify Ciclo 3: Qualidade de Código & Arquitetura (P2)"

---

## Contexto e Escopo

Esta especificação formaliza o **Ciclo 3 de Evolução do Metrik**, focado na eliminação sistemática da dívida técnica de código, estabilidade de renderização em React 19, erradicação de warnings de linting, tipagem estrita de dados e otimização do peso de distribuição da aplicação, em estrito alinhamento com a [Constituição do Metrik](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/.specify/memory/constitution.md) (**Princípio I: Model Integrity**, **Princípio II: Clean Architecture**, **Princípio III: Automated Quality Gates** e **Princípio V: Simplicity & Performance**).

Após a estabilização completa do pipeline de testes (Ciclo 1 / Feature 044) e da higiene documental e de marcas (Ciclo 2 / Feature 045), o Ciclo 3 ataca a dívida estrutural mensurável do repositório:
1. **40 warnings ativos no ESLint** (`@typescript-eslint/no-explicit-any`, `react-hooks/exhaustive-deps`, `@typescript-eslint/no-unused-vars`).
2. **Otimização de Assets**: O logo principal da aplicação (`src/assets/metrik-logo.png`) possui atualmente 982.63 KB, respondendo pela maior parcela do payload inicial no build de produção.
3. **Resiliência de Hooks React**: Dependências de `useEffect` e `useMemo` ausentes ou instáveis que podem provocar re-renderizações desnecessárias em componentes centrais de gerenciamento de equipes e dados de fluxo.

---

## Clarifications

### Session 2026-10-15
- **Q1: Como devemos configurar o rigor do ESLint para tipos any após eliminar os 40 warnings atuais?**
  - **A1**: **Elevar a regra `@typescript-eslint/no-explicit-any` para "error" no ESLint** após sanar todos os 40 warnings atuais, blindando o repositório contra regressões e assegurando tipagem estrita contínua (Princípio I e III).
- **Q2: Qual formato de imagem e estratégia de arquivo devemos adotar para a otimização do logotipo?**
  - **A2**: **Manter como PNG otimizado (<120 KB) preservando o nome `src/assets/metrik-logo.png`**, garantindo compatibilidade imediata com todos os imports existentes em componentes e testes sem alterações em caminhos.
- **Q3: Como devemos estruturar a resolução das dependências do hook em useTeamAccess.ts?**
  - **A3**: **Usar referências estáveis com `useCallback` e memoização granular de dependências**, garantindo que o `useEffect` declare todas as dependências exigidas pelo ESLint sem disparar loops infinitos de re-renderização.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Código Estritamente Tipado e Zero Warnings no Pipeline (Priority: P1) 🎯 MVP

Como desenvolvedor ou mantenedor do Metrik,  
quero executar o linter estático e obter zero warnings e zero erros em toda a base de código,  
para que o pipeline de qualidade seja confiável e nenhum defeito de tipagem passe desapercebido.

**Why this priority**: A presença de 40 warnings recorrentes no linter polui a saída de verificação e oculta novos erros reais. A substituição de tipos `any` por tipos semânticos previne regressões silenciosas de acesso a propriedades inexistentes.

**Independent Test**: Executar `npm run lint` na raiz do projeto e verificar saída limpa com zero problemas reportados (0 errors, 0 warnings).

**Acceptance Scenarios**:

1. **Given** a base de código do projeto, **When** o comando `npm run lint` é executado, **Then** o resultado deve ser 0 problemas encontrados (0 errors, 0 warnings).
2. **Given** arquivos com uso de `any` explícito (`TeamManagementModal.tsx`, `BoardManagementModal.tsx`, `syncService.ts`, etc.), **When** inspecionados quanto aos tipos, **Then** todos devem utilizar tipos estritos, interfaces de domínio ou generics bem tipados.
3. **Given** variáveis e parâmetros não utilizados no serviço de sincronização (`syncService.ts`), **When** analisados pelo linter, **Then** devem ser removidos ou prefixados com `_` quando requeridos por assinatura de desestruturação.

---

### User Story 2 - Otimização de Assets e Desempenho de Carregamento (Priority: P1)

Como usuário acessando a aplicação em qualquer conexão,  
quero que a interface e seus assets carreguem instantaneamente sem consumir largura de banda excessiva,  
para que a experiência Local-First seja ágil desde o primeiro byte transferido.

**Why this priority**: O asset de logotipo principal atualmente pesa quase 1 MB no bundle de produção (`dist/assets/metrik-logo-BSutLTPJ.png`: 982.63 kB), sobrecarregando desnecessariamente o download do usuário.

**Independent Test**: Executar `npm run build` e inspecionar o tamanho do asset de logo em `dist/assets/`, verificando que seu peso foi reduzido para menos de 150 KB sem degradação visual.

**Acceptance Scenarios**:

1. **Given** o arquivo de imagem do logo do Metrik, **When** compilado pelo Vite para distribuição, **Then** o tamanho do asset em disco deve ser inferior a 150 KB.
2. **Given** a aplicação renderizada no navegador, **When** o cabeçalho e modais exibem o logotipo, **Then** a nitidez visual, proporção de aspecto e transparência devem permanecer idênticas à identidade visual original.

---

### User Story 3 - Estabilidade e Previsibilidade dos Hooks Reativos (Priority: P2)

Como engenheiro mantendo o estado de fluxo e gestão de acessos,  
quero que os hooks `useMemo` e `useEffect` declarem formalmente todas as suas dependências reativas,  
para que o cálculo de métricas de fluxo e a verificação de permissões de equipe não sofram divergências de renderização.

**Why this priority**: Dependências omitidas em hooks reativos (`useCfdData.ts`, `useTeamAccess.ts`, `BoardManagementModal.tsx`) provocam stale closures ou execuções desnecessárias que degradam o desempenho e a previsibilidade do estado.

**Independent Test**: Navegar entre filtros de datas do CFD e alternar seleções de equipes, verificando que os dados respondem instantaneamente sem re-renderizações duplicadas nem loops infinitos.

**Acceptance Scenarios**:

1. **Given** o hook `useCfdData`, **When** o usuário altera o intervalo customizado de datas (`customDateRange`), **Then** o cálculo acumulado de fluxo reage com as dependências completas registradas no `useMemo`.
2. **Given** o hook `useTeamAccess`, **When** dados de usuários, convites ou membros são atualizados, **Then** o efeito de sincronização reflete as mudanças com estabilidade e sem dependências ocultas.
3. **Given** o componente `BoardManagementModal`, **When** renderizado repetidamente com equipes ativas, **Then** a inicialização da lista de equipes utiliza memoização adequada sem instabilidade de dependências.

---

## Edge Cases

- **Compatibilidade com Supabase Sync**: Ao tipar parâmetros de `syncService.ts`, assegurar que as tabelas de `workspaces`, `boards`, `tasks`, `teams` e `team_members` continuem mapeando corretamente campos remotos do PostgreSQL sem lançar exceções de runtime.
- **Transparência do Asset de Logo**: A compressão do arquivo PNG/WebP não deve introduzir artefatos visuais ou bordas esbranquiçadas contra o tema escuro do Metrik (`#0b0f19`).
- **Fake Timers e Testes Existentes**: Nenhuma das correções de tipagem ou hooks deve quebrar ou alterar o comportamento determinístico dos 701 testes unitários existentes.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O pipeline de linting MUST executar com conformidade total (0 errors, 0 warnings) em `npm run lint`.
- **FR-002**: Todas as ocorrências de `@typescript-eslint/no-explicit-any` reportadas pelo ESLint MUST ser substituídas por tipos seguros de TypeScript, e a regra `@typescript-eslint/no-explicit-any` MUST ser configurada como `"error"` nas regras de linting para blindar o projeto contra novos débitos de tipagem.
- **FR-003**: As dependências dos hooks `useMemo` e `useEffect` em `BoardManagementModal.tsx`, `useCfdData.ts` e `useTeamAccess.ts` MUST ser exaustivas ou memoizadas adequadamente.
- **FR-004**: O asset de imagem `src/assets/metrik-logo.png` MUST ser otimizado para um tamanho inferior a 150 KB, preservando canal alpha transparente e resolução nítida.
- **FR-005**: A suíte automatizada de testes MUST permanecer 100% verde (701/701 testes passando) com zero enfraquecimento de asserções.
- **FR-006**: A compilação estrita de produção (`npm run build`) MUST concluir com sucesso e gerar bundle otimizado.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run lint` reporta **0 problems (0 errors, 0 warnings)** (redução de 40 warnings para 0).
- **SC-002**: Tamanho do asset de logo de produção reduzido em pelo menos **80%** (de 982 KB para < 150 KB).
- **SC-003**: 100% dos 701 testes unitários passam de forma limpa e determinística (`npm test`).
- **SC-004**: O build de produção (`npm run build`) compila com zero erros em menos de 5 segundos.

---

## Assumptions

- O formato do logo continuará sendo compatível com tags `<img>` e imports padrão do Vite (`import logo from './assets/metrik-logo.png'`).
- Os tipos estritos a serem introduzidos reutilizarão as definições já existentes em `src/types/index.ts` e `src/types/teams.ts`.
- A resolução de warnings de `react-hooks/exhaustive-deps` não alterará os gatilhos esperados de efeitos de negócio.
