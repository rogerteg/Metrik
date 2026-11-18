# 📊 Metrik

> **Gestão Kanban Enterprise, Análise Científica de Fluxo Ágil e Previsibilidade Probabilística (Local-First)**

[![React Version](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript Version](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite Version](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Test Suite](https://img.shields.io/badge/Tests-1033%20passing-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Test Coverage](https://img.shields.io/badge/Coverage-88%25-success)](https://vitest.dev/)
[![Architecture: Local-First](https://img.shields.io/badge/Architecture-Local--First-blueviolet)](https://localfirstweb.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Visão Geral

O **Metrik** é uma aplicação web moderna de alta performance projetada para elevar a gestão de trabalho e a análise de processos ágeis ao padrão científico da indústria. Desenvolvido sob a arquitetura **Local-First** com suporte a **sincronização híbrida em nuvem**, o Metrik combina um quadro Kanban enterprise completo com um ecossistema avançado de **Métricas de Fluxo (*Flow Metrics*)**, **Análise Probabilística** e **Simulação de Monte Carlo**.

Projetado para engenheiros de software, agilistas, gerentes de produto e líderes de engenharia, o Metrik substitui suposições empíricas por dados estatísticos rigorosos baseados na Lei de Little, interpolação linear NIST e métodos de previsão estocástica, proporcionando máxima previsibilidade de entregas sem atritos de configuração.

---

## ✨ Principais Capacidades

### 📋 1. Quadro Kanban Visual Enterprise
- **Governança de Limites de WIP (*Work in Progress*):** Configuração de capacidades mínimas e máximas por coluna com alertas visuais inteligentes contra sobrecarga.
- **Fluxo Unidirecional e Políticas Explícitas:** Prevenção de movimentações inválidas e proteção da coluna inicial.
- **Gestão de Bloqueios e Impedimentos:** Sinalização formal de itens bloqueados com registro obrigatório de motivo, categoria de impacto e rastreamento de tempo de bloqueio.
- **Detecção de Tarefas Estagnadas (*Stale Tasks*):** Identificação automática de itens sem movimentação além dos limites estabelecidos pela equipe.
- **Engenharia de Qualidade no Card:** Gestão integrada de subtasks, critérios de aceitação, cenários de teste e auditoria completa de eventos e comentários.
- **Layout Minimalista de Alta Densidade:** Interface escura refinada, alto contraste, controles compactos e micro-interações fluidas de arrastar e soltar (*drag-and-drop*).

### 📈 2. Análise Científica de Fluxo & Previsibilidade
- **Cumulative Flow Diagram (CFD):** Visualização dinâmica de acúmulo de trabalho por etapas com suporte a agrupamento temporal diário, semanal, quinzenal e mensal, facilitando a identificação imediata de gargalos e desequilíbrios na taxa de chegada versus taxa de saída.
- **Cycle Time Scatter Plot:** Gráfico de dispersão ponto a ponto de cada item entregue, calculando percentis probabilísticos reais (**50%**, **70%**, **85%** e **95%**) via método de interpolação linear padrão **NIST** (R-6), com zoom temporal dinâmico e definição de expectativas de nível de serviço (*SLE - Service Level Expectations*).
- **Simulação de Monte Carlo:** Motor de previsão probabilística com 10.000 iterações estocásticas baseadas na vazão histórica real do time, respondendo com precisão matemática a:
  - *"Quantos itens serão entregues até uma data limite?"*
  - *"Quando uma quantidade específica de itens será concluída?"*
- **WIP Aging Chart:** Monitoramento em tempo real do envelhecimento dos itens atualmente em progresso em relação aos percentis históricos de tempo de ciclo da equipe, permitindo ações proativas antes da quebra de acordos de entrega.
- **Throughput Run Chart & Histograma:** Rastreamento diário/semanal da taxa de vazão e histograma de distribuição estatística para validação de estabilidade do sistema.
- **Gestão de Sprints, Burndown & Burnup:** Gestão iterativa com rastreamento de escopo planejado versus realizado, projeções de conclusão e suporte tanto a fluxos contínuos quanto a cadências fixas.

---

## 🏛️ Arquitetura & Modelo de Dados

### ⚡ Filosofia Local-First
O Metrik adota uma abordagem **Local-First**, garantindo que:
- O armazenamento local do navegador (`localStorage`) funcione como fonte de dados primária e autoritativa imediata.
- A aplicação funcione com **zero latência**, operando perfeitamente sem conexão com a internet.
- A privacidade seja preservada por padrão: os dados do projeto residem sob controle total do usuário.

### ☁️ Sincronização em Nuvem Híbrida (Supabase)
Quando as credenciais de sincronização estão configuradas, o Metrik ativa um pipeline assíncrono de persistência com o **Supabase** (PostgreSQL):
- **Sincronização Bidirecional Não-Bloqueante:** O trabalho do usuário nunca é pausado aguardando respostas de rede.
- **Isolamento de Dados por Squads (TBAC):** Arquitetura multi-equipes com *Team-Based Access Control* nativo, permitindo alternância fluida entre diferentes squads e quadros com isolamento estrito de dados.
- **Segurança e RLS (*Row Level Security*):** Políticas declarativas no banco de dados asseguram que apenas membros autorizados acessem os dados da equipe.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Interface / Core** | [React 19](https://react.dev/) | Renderização reativa de alto desempenho e componentes funcionais modernos |
| **Linguagem** | [TypeScript 5.7](https://www.typescriptlang.org/) | Tipagem estática rigorosa para todo o modelo de dados e regras de negócio |
| **Bundler & Dev Server** | [Vite 6](https://vitejs.dev/) | Build ultrarrápido com Hot Module Replacement (HMR) instantâneo |
| **Backend Híbrido** | [Supabase](https://supabase.com/) | PostgreSQL gerenciado, autenticação e sincronização assíncrona |
| **Estilização** | CSS Vanilla Puro | Design system com CSS Variables, sem dependências externas de UI ou frameworks pesados |
| **Testes Unitários & Integração** | [Vitest 3](https://vitest.dev/) | Suíte de testes com 1025 testes automatizados em 163 arquivos (100% verde) |
| **Testing Utilities** | [Testing Library](https://testing-library.com/) | Testes de componentes orientados ao comportamento real do usuário |
| **Acessibilidade** | [jest-axe](https://github.com/nickcolley/jest-axe) | Validação automatizada de acessibilidade e conformidade com WCAG |
| **Padronização & Linting** | [ESLint 9](https://eslint.org/) & [Prettier](https://prettier.io/) | Governança estrita de estilo e qualidade de código |

---

## 🚀 Como Começar

### Pré-requisitos
- **Node.js**: Versão 20.x ou superior recomendada.
- **npm**: Versão 10.x ou superior (incluído no Node.js).

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/rogerteg/Metrik.git
   cd Metrik
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:5173/`.

### Configuração de Nuvem (Opcional)

Para habilitar a sincronização em nuvem híbrida via Supabase, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

> **Nota:** Sem as variáveis do Supabase, o Metrik opera de forma 100% autônoma no modo Local-First através do armazenamento local.

---

## 🧪 Scripts Disponíveis

Todos os comandos de automação, testes e build do projeto podem ser executados via `npm`:

```bash
# Iniciar o ambiente de desenvolvimento local
npm run dev

# Executar a suíte de testes unitários e de integração (Vitest)
npm test

# Executar os testes e gerar relatório de cobertura (v8 coverage)
npm run test:coverage

# Compilar a aplicação para produção (TypeScript verificação estrita + Vite build)
npm run build

# Visualizar localmente a build de produção
npm run preview

# Executar a análise estática com ESLint
npm run lint

# Corrigir automaticamente problemas de linting
npm run lint:fix

# Formatar o código-fonte e testes com Prettier
npm run format

# Verificar a conformidade de formatação com Prettier
npm run format:check

# Verificar estado de migrações remotas no Supabase
npm run supabase:check

# Aplicar migrações estruturais no Supabase
npm run supabase:migrate
```

---

## 📜 Governança e Metodologia SDD (Spec-Driven Development)

O Metrik adota como princípio basilar o **Spec-Driven Development (SDD)**, suportado pela ferramenta [SpecKit](https://github.com/rogerteg/Metrik/tree/main/.specify) e integrado ao ecossistema de agentes de IA:

1. **Evolução Orientada a Especificações:** Nenhuma linha de código de produção é alterada sem que haja previamente uma especificação funcional (`spec.md`), plano técnico de arquitetura (`plan.md`) e lista atômica de tarefas (`tasks.md`) sob o diretório `specs/`.
2. **Constituição do Projeto (`.specify/memory/constitution.md`):** Conjunto imutável de 10 princípios fundamentais que regem o ciclo de vida do software:
   - **Princípio I (Desenvolvimento Orientado por Especificação / SDD - Inegociável):** Toda feature, alteração arquitetural ou mudança não-trivial inicia obrigatoriamente com especificação (`spec.md`), plano técnico (`plan.md`) e lista atômica de tarefas (`tasks.md`) sob o diretório `specs/` antes da escrita de qualquer código de produção.
   - **Princípio II (Qualidade de Código & Modularidade):** Módulos autocontidos, de responsabilidade única e baixo acoplamento. Teto mandatório de $\le 400$ linhas por arquivo de produção (`src/**/*.{ts,tsx,css}`), ativamente verificado por `tests/unit/moduleLineCountGuard.test.ts`, com baseline de dívida legada congelada sob catraca (*ratchet*).
   - **Princípio III (Verificação Automatizada & Testes):** Zero tolerância a testes quebrados ou erros de compilação/tipagem (`npm test`, `npm run build`, `npx tsc --noEmit`). Proibição estrita de enfraquecer, pular ou deletar asserções; os gates de verificação devem provar factualmente o que anunciam (*Gates Must Prove Themselves*).
   - **Princípio IV (Observabilidade & Logging Estruturado):** Falha rápida e explícita (*fail fast*), logging estruturado com prefixos estáveis e rastreáveis (`[Metrik]`, `[Metrik Guard]`) e proibição de engolir exceções silenciosamente.
   - **Princípio V (Simplicidade & YAGNI):** Implementação da menor solução completa que satisfaça os requisitos especificados. Proibição de abstrações prematuras, especulações e complexidade desnecessária.
   - **Princípio VI (Modelos de Raciocínio Analítico Pré-Tarefas - Inegociável):** Decomposição analítica obrigatória prévia à criação de tarefas cobrindo: Primeiros Princípios, Análise Pré-Mortem/Inversão, Validação MECE, Árvore de Decisão com Poda de Alternativas, Falsificabilidade/TDD (*Red-Bar First*) e Triangulação Constitucional Adversarial.
   - **Princípio VII (Independência de Marca & Identidade Limpa - Inegociável):** O Metrik é um produto autônomo com design e terminologia canônica própria; proibição absoluta de vazamento de marcas de produtos concorrentes ou ferramentas externas em código, atributos DOM, comentários ou documentação pública.
   - **Princípio VIII (Soberania Local-First, Sincronização Híbrida & Isolamento de Squads - Inegociável):** Operação cliente-side autônoma e completa em `localStorage` com zero latência; sincronização assíncrona opcional e não-bloqueante com Supabase; isolamento estrito de dados por squads via Team-Based Access Control (TBAC).
   - **Princípio IX (Integridade de Dados, Persistência Intencional & Proteção de Rascunhos - Inegociável):** Zero perda silenciosa de dados do usuário; guardas de saída para alterações pendentes (*dirty state guard*), atalhos ergonômicos (`Ctrl+S`/`Esc`) e respeito rigoroso ao modo de persistência (manual vs automático).
   - **Princípio X (Governança de IA Conversacional & Segurança do Copilot Consultivo - Inegociável):** O assistente analítico (Mika AI) opera 100% offline via heurísticas locais determinísticas com fallback transparente; caráter estritamente consultivo e somente-leitura (sem mutação autônoma de dados); histórico limitado a 30 mensagens FIFO por quadro no cliente.

### Fluxo Operacional SpecKit
```text
/speckit-specify   ➔ Elaboração da especificação de requisitos
/speckit-clarify   ➔ Eliminação de ambiguidades e validação de decisões
/speckit-plan      ➔ Definição arquitetural e estratégias de teste
/speckit-tasks     ➔ Decomposição atômica após Modelos Analíticos
/speckit-implement ➔ Execução rigorosa guiada pelas tarefas
/speckit-converge  ➔ Verificação final e fechamento de ciclo
```

---

## 📄 Licença

Este projeto é distribuído sob os termos da licença [MIT](LICENSE).
