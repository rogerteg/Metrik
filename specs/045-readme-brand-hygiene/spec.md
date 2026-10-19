# Feature Specification: Higiene Documental do README e Conformidade de Marcas (Ciclo 2)

**Feature Branch**: `045-readme-brand-hygiene`

**Created**: 2026-10-15

**Status**: Implemented

**Input**: User description: "/speckit-specify Ciclo 2: Higiene Documental do README e Conformidade de Marcas (P1)"

---

## Contexto e Escopo

Esta especificação formaliza o **Ciclo 2 de Evolução do Metrik**, focado na restauração da verdade factual da documentação de entrada do repositório ([README.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/README.md)) e na conformidade rigorosa com a governança de identidade e marcas, atendendo ao **Princípio II (Code Quality & Modularity - Living Documentation)** e ao **Princípio VII (Brand Independence & Clean Identity)** da Constituição.

Atualmente, o arquivo `README.md` encontra-se completamente desfasado da realidade do produto: descreve uma ferramenta legada em Python 3.8 com `pandas` e `python-pptx` para geração de apresentações em slides, omitindo por completo a aplicação web real construída em **React 19, TypeScript, Vite e Supabase**. Essa divergência induz a erros imediatos de interpretação por qualquer pessoa ou agente que inspecione o repositório.

Além disso, identificou-se na árvore de artefatos um diretório de especificação (`specs/016-clean-board-layout-businessmap`) que contém no nome o termo de um produto/marca de terceiro, violando expressamente o Princípio VII.1 ("Zero Third-Party Brand Leaks").

O objetivo desta entrega é alinhar 100% da documentação de entrada às capacidades e tecnologias reais do Metrik e purificar o repositório de qualquer vazamento de marcas proprietárias externas.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compreender o Produto Real e sua Arquitetura a partir do README (Priority: P1)

Como desenvolvedor, mantenedor ou stakeholder que acessa o repositório Metrik,  
quero ler uma documentação inicial que descreva com exatidão o propósito, as capacidades de Kanban, a análise científica de fluxo e a stack tecnológica real,  
para que eu compreenda imediatamente o valor do software e como executá-lo sem ser induzido a premissas falsas.

**Why this priority**: O `README.md` é a porta de entrada de qualquer projeto de software. Um documento que descreve outra linguagem e outro propósito invalida o entendimento antes da leitura de qualquer código-fonte e rompe a confiabilidade do repositório.

**Independent Test**: Solicitar a um leitor humano ou automatizado que descreva o projeto lendo unicamente o `README.md`. A descrição deve coincidir em 100% com a aplicação web React 19/TS/Vite em execução, suas métricas de fluxo e comandos de desenvolvimento.

**Acceptance Scenarios**:

1. **Given** o arquivo `README.md`, **When** inspecionado por um leitor, **Then** deve descrever com clareza o Metrik como uma plataforma web Local-First para gestão Kanban e análise avançada de fluxo de trabalho (CFD, Tempo de Ciclo com percentis NIST, Monte Carlo, WIP Aging, Throughput e Sprints).
2. **Given** as tecnologias citadas no `README.md`, **When** confrontadas com o `package.json`, **Then** devem refletir com precisão a stack real (React 19, TypeScript, Vite, Supabase e Vitest), sem referências a tecnologias inexistentes no produto (como Python, Pandas ou PPTX).
3. **Given** as instruções de execução rápida (Quickstart) do `README.md`, **When** executadas em um terminal limpo, **Then** devem inicializar o ambiente de desenvolvimento, executar os testes e gerar o build sem erros.

---

### User Story 2 - Conformidade Estrita de Identidade e Marcas Externas (Priority: P1)

Como auditor de governança e detentor do produto Metrik,  
quero que a estrutura do repositório, caminhos de diretórios e textos públicos mantenham estrita independência de marcas de terceiros,  
para que a identidade do produto permaneça autônoma, proprietária e em total conformidade com o Princípio VII da Constituição.

**Why this priority**: O Princípio VII.1 estabelece que nomes de produtos de terceiros ou referências de inspiração são puramente conversacionais e NUNCA devem vazar para nomes de arquivos, diretórios, atributos do DOM ou textos públicos.

**Independent Test**: Realizar uma busca textual no repositório por termos de produtos de mercado concorrentes/inspirações em caminhos de arquivos e validar a ausência de diretórios com nomes proprietários externos.

**Acceptance Scenarios**:

1. **Given** o diretório `specs/016-clean-board-layout-businessmap`, **When** auditado pelo pipeline de governança, **Then** deve ser renomeado para uma nomenclatura canônica e agnóstica (como `specs/016-clean-board-layout-minimalist`).
2. **Given** os documentos públicos do repositório, **When** inspecionados quanto à terminologia, **Then** todos os conceitos de fluxo devem utilizar vocabulário científico e padrão (ex: *Cumulative Flow Diagram*, *Cycle Time Scatter Plot*, *Little's Law*, *NIST Percentiles*).

---

### User Story 3 - Guia de Governança e Contribuição SDD (Priority: P2)

Como engenheiro contribuinte,  
quero encontrar no `README.md` orientações claras sobre como o ciclo de vida de especificações vivas (Spec-Driven Development) funciona no Metrik,  
para que novas funcionalidades e manutenções sigam o fluxo formal de governança antes da escrita de código.

**Why this priority**: Assegura que novos colaboradores compreendam a precedência dos artefatos vivos e a obrigatoriedade dos comandos do SpecKit (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`).

**Independent Test**: Verificar se o `README.md` contém uma seção dedicada ao modelo de desenvolvimento guiado por especificações, citando o fluxo de trabalho e a Constituição do projeto.

**Acceptance Scenarios**:

1. **Given** o leitor buscando contribuir no repositório, **When** consultar o `README.md`, **Then** deve encontrar o fluxo passo a passo de especificação, planejamento, raciocínio analítico pré-tarefas e implementação.

---

## Edge Cases

- **Links Quebrados em Documentações Antigas**: Ao renomear a pasta de especificação da feature 016, certificar-se de que referências cruzadas em relatórios históricos (se houver) sejam atualizadas para evitar links quebrados em markdown.
- **Renderização de Badges**: Assegurar que os badges do topo do `README.md` apontem para status reais (React, TypeScript, Vitest, Licença) e não para versões descontinuadas do Python.
- **Compatibilidade Multiplataforma dos Comandos**: Assegurar que os comandos descritos no README funcionem identicamente em ambientes Windows PowerShell, Linux e macOS.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O arquivo `README.md` MUST ser reescrito integralmente para refletir o produto real: uma aplicação web SPA Local-First com gestão Kanban e análise científica de fluxo de trabalho.
- **FR-002**: O `README.md` MUST apresentar o catálogo consolidado das principais capacidades analíticas (CFD, Dispersão de Tempo de Ciclo com percentis NIST, Simulação de Monte Carlo, Envelhecimento de WIP, Histograma de Vazão, Gestão de Sprints e Relatórios).
- **FR-003**: A documentação MUST listar com precisão a stack tecnológica em uso (React 19, TypeScript 5.7, Vite 6, Supabase, Vitest e Prettier) e os pré-requisitos reais (Node.js 20+ e npm).
- **FR-004**: O `README.md` MUST incluir comandos executáveis para: inicialização em desenvolvimento (`npm run dev`), execução de testes unitários (`npm run test`), gate de cobertura (`npm run test:coverage`), checagem de tipos/build (`npm run build`) e linting (`npm run lint`).
- **FR-005**: O diretório `specs/016-clean-board-layout-businessmap` MUST ser renomeado para `specs/016-clean-board-layout-minimalist`, eliminando qualquer vazamento de marca proprietária de terceiro conforme o Princípio Constitucional VII.
- **FR-006**: O `README.md` MUST conter uma seção explicativa sobre a Governança e o Ciclo de Desenvolvimento Guiado por Especificações (Spec-Driven Development — SDD).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tecnologias citadas no `README.md` coincidem com as dependências e scripts declarados no `package.json`.
- **SC-002**: Zero ocorrências de nomes de produtos de terceiros em nomes de diretórios sob a árvore `specs/`.
- **SC-003**: Um desenvolvedor consegue clonar o repositório, executar os comandos de Quickstart do `README.md` e atingir um ambiente funcional e testes 100% verdes em menos de 3 minutos.
- **SC-004**: Todos os links de navegação interna do `README.md` e das especificações renomeadas resolvem com sucesso sem links órfãos.

---

## Assumptions

- O repositório Metrik é uma aplicação autônoma e independente que não possui dependência de execução com interpretadores Python no fluxo principal do usuário (scripts legados foram incorporados pelo ecossistema React/TypeScript).
- O renomeio do diretório da feature 016 não afeta o runtime do produto, pois as especificações funcionam como artefatos de documentação e rastreamento histórico.
- Os badges e ícones utilizados no novo `README.md` respeitam a identidade visual e minimalista do Metrik.
