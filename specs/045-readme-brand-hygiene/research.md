# Research: Higiene Documental do README e Conformidade de Marcas (Ciclo 2)

**Feature**: `045-readme-brand-hygiene`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Pesquisa 1: Estrutura e Conteúdo do Novo README.md

### Contexto
O arquivo `README.md` original descrevia uma ferramenta legada em Python 3.8/Pandas/PPTX. A aplicação real é uma SPA Web moderna construída com React 19, TypeScript 5.7, Vite 6, Supabase e Vitest.

### Decisão Técnica
O novo `README.md` deve ser estruturado em 7 seções fundamentais:
1. **Cabeçalho & Badges Atualizados**: Versão React 19, TypeScript 5.7, Vite 6, Vitest 100% verde, Licença MIT.
2. **Visão Geral do Produto**: Definição como plataforma de Kanban e Análise Científica de Fluxo de Trabalho com arquitetura Local-First.
3. **Capacidades Analíticas de Fluxo**:
   - *Cumulative Flow Diagram (CFD)* dinâmico;
   - *Cycle Time Scatter Plot* com percentis probabilísticos NIST (50%, 85%, 95%);
   - *Monte Carlo Simulation* (previsões probabilísticas "Quantos itens?" e "Quando entregaremos?");
   - *WIP Aging Chart* para inspeção de estagnação de itens em andamento;
   - *Throughput Run Chart & Histogram*;
   - *Planejamento e Execução de Sprints* com *Burndown* e *Burnup*.
4. **Arquitetura & Filosofia de Dados**:
   - Soberania Local-First (`localStorage`);
   - Sincronização Híbrida e Opcional na Nuvem com Supabase;
   - Isolamento estrito por Squad e Team-Based Access Control (TBAC).
5. **Stack Tecnológica Real**:
   - Frontend: React 19, TypeScript, Vanilla CSS estruturado;
   - Ferramental: Vite 6, Vitest 3, Prettier, ESLint 9;
   - Nuvem (Opt-in): Supabase (PostgreSQL).
6. **Guia de Instalação e Execução Rápida (Quickstart)**:
   - `npm install`
   - `npm run dev` (porta 5173)
   - `npm run test` (701 testes verdes)
   - `npm run test:coverage` (relatórios em `coverage/`)
   - `npm run build`
7. **Governança & Metodologia SDD (Spec-Driven Development)**:
   - Explicar o ciclo OpenSpec/SpecKit e a precedência da Constituição (`constitution.md`).

---

## 2. Pesquisa 2: Renomeio de `specs/016-clean-board-layout-businessmap`

### Contexto
O nome do diretório viola o Princípio VII.1 ("Zero Third-Party Brand Leaks").

### Decisão Técnica
1. Renomear o diretório para `specs/016-clean-board-layout-minimalist`.
2. Atualizar as referências internas nos arquivos markdown da pasta (`spec.md`, `plan.md`, `research.md`, `quickstart.md`, `checklists/requirements.md`) substituindo a menção da marca por `minimalist`.
3. Validar que nenhum arquivo de código-fonte referencie o caminho antigo.
