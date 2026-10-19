# Implementation Plan: Higiene Documental do README e Conformidade de Marcas (Ciclo 2)

**Branch**: `045-readme-brand-hygiene` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-readme-brand-hygiene/spec.md`

---

## Summary

O objetivo deste plano é reescrever integralmente o documento de entrada do projeto ([README.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/README.md)) para refletir com exatidão a natureza e as capacidades da aplicação web moderna (React 19, TypeScript, Vite, Supabase, Vitest e Local-First), e sanar o vazamento de marca proprietária de terceiro renomeando o diretório de especificação `specs/016-clean-board-layout-businessmap` para `specs/016-clean-board-layout-minimalist`, atendendo diretamente aos Princípios II e VII da Constituição.

A abordagem técnica consiste em:
1. Redigir um `README.md` moderno e profissional com identidade visual própria, catálogo detalhado de métricas de fluxo, guia de execução rápida e seção de governança SDD.
2. Renomear o diretório da feature 016 e atualizar todas as referências cruzadas internas nos arquivos markdown correspondentes.
3. Validar a integridade de links internos e a ausência de termos proprietários de concorrentes nos diretórios do projeto.

---

## Technical Context

**Language/Version**: Markdown (GFM), TypeScript 5.7.2, Node.js 20+  
**Primary Dependencies**: React 19, Vite 6, Supabase, Vitest  
**Storage**: N/A (Camada de documentação e governança de artefatos)  
**Testing**: Vitest (`npm run test`), Prettier (`npm run format:check`), ESLint (`npm run lint`)  
**Target Platform**: GitHub / Web Repository & Navegadores modernos  
**Project Type**: Documentação de Produto & Governança de Especificações  
**Performance Goals**: Tempo de carregamento e clareza de leitura instantâneos  
**Constraints**: Zero vazamento de marcas de terceiros (Constituição VII.1); 100% de paridade com `package.json`  
**Scale/Scope**: 1 arquivo raiz (`README.md`), 1 diretório renomeado (`specs/016`), 6 arquivos markdown atualizados  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Avaliação de Conformidade |
|---|---|---|
| **I. Specification-Driven Development** | ✅ Aprovado | Especificação formal (`spec.md`) e checklist elaborados antes da execução. |
| **II. Code Quality & Modularity (Living Docs)** | ✅ Aprovado | O `README.md` passa a refletir fielmente a verdade factual do produto em execução. |
| **III. Automated Verification & Testing** | ✅ Aprovado | Nenhum código de produção ou teste é degradado; a suíte verde permanece intocada. |
| **IV. Observability & Structured Logging** | ✅ Aprovado | Comandos de observabilidade e logs do produto são documentados no README. |
| **V. Simplicity & YAGNI** | ✅ Aprovado | Solução simples e direta de documentação limpa sem ferramentas extras. |
| **VI. Analytical Reasoning Pre-Task Creation** | ⏳ Pendente | Os 6 modelos analíticos serão preenchidos antes da geração de tarefas. |
| **VII. Brand Independence & Clean Identity** | ✅ Aprovado | Esta feature atende expressamente a este princípio, eliminando vazamentos de marcas proprietárias. |
| **VIII. Local-First Sovereignty & TBAC** | ✅ Aprovado | As garantias de soberania local e TBAC são documentadas no README. |
| **IX. User Data Integrity & Autosave** | ✅ Aprovado | As políticas de salvamento e proteção contra perda de dados são descritas. |

---

## Project Structure

### Documentation (this feature)

```text
specs/045-readme-brand-hygiene/
├── spec.md                  # Especificação funcional refinada
├── checklists/
│   └── requirements.md      # Validação de qualidade da especificação (16/16 aprovados)
├── research.md              # Estrutura do README e estratégia de renomeio (Phase 0)
├── data-model.md            # Modelo conceitual de domínio documentado (Phase 1)
├── quickstart.md            # Guia de validação da documentação e marcas (Phase 1)
├── plan.md                  # Este documento de planejamento técnico
└── tasks.md                 # Decomposição em tarefas (Phase 2 - via /speckit-tasks)
```

### Files Touched

```text
README.md                                               # Reescrita completa do documento
specs/016-clean-board-layout-minimalist/                # Diretório renomeado de specs/016-...-businessmap
specs/016-clean-board-layout-minimalist/spec.md         # Atualização de referências
specs/016-clean-board-layout-minimalist/plan.md         # Atualização de referências
specs/016-clean-board-layout-minimalist/research.md     # Atualização de referências
specs/016-clean-board-layout-minimalist/quickstart.md   # Atualização de referências
specs/016-clean-board-layout-minimalist/checklists/requirements.md # Atualização de referências
```

---

## Complexity Tracking

> **Nenhuma complexidade adicional introduzida.**
