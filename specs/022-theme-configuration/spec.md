# Feature Specification: Configuração de Temas — Claro, Escuro e Neutro (Theme Configuration)

**Feature Branch**: `022-theme-configuration`  
**Created**: 2026-09-12  
**Status**: Draft  
**Input**: Solicitação do usuário: *"acrescente uma configuração de tema, Claro, Escuro e Neutro."*

---

## 1. Visão Geral & Contexto

O Metrik foi inicialmente concebido com um visual escuro (*Enterprise Dark Mode*). Para atender a diferentes preferências de ergonomia visual, ambientes com alta luminosidade e padrões corporativos neutros, esta feature introduz um sistema completo de gerenciamento de temas com 3 opções:
1. **Escuro (Dark Mode)**: O tema escuro atual com fundo `#0b0f19`, cartões `#1e293b` e contrastes cibernéticos/sleek.
2. **Claro (Light Mode)**: Fundo claro e limpo (`#f8fafc` / `#f1f5f9`), cartões brancos (`#ffffff`), sombras suaves e tipografia em cinza grafite (`#0f172a` / `#334155`), garantindo alto contraste e leitura confortável em ambientes claros.
3. **Neutro (Neutral / Slate Mode)**: Paleta equilibrada baseada em tons de ardósia (*Slate / Warm Neutral*), com fundo em cinza intermediário suave (`#e2e8f0` ou tom de baixo brilho `#1e222b` / `#2d3748`), reduzindo a fadiga visual sem o brilho intenso do branco nem a profundidade do modo escuro.

O tema escolhido deve ser persistido no `localStorage` sob a chave `metrik_theme_mode` e sincronizado imediatamente com o atributo `data-theme` no elemento raiz (`<html>` ou `<div className="app-container">`), alternando as variáveis CSS `:root` de forma reativa e sem *flicker*.

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Seleção e Aplicação de Tema (Priority: P1)

Como usuário do Metrik, quero alternar facilmente entre os temas **Claro**, **Escuro** e **Neutro** através de um seletor visual no cabeçalho da aplicação, para adaptar o contraste e luminosidade da tela às minhas preferências de uso.

**Why this priority**: É a solicitação central do usuário; define a experiência visual global do produto em todas as telas (Quadro Kanban e Analytics).

**Independent Test**:
- No cabeçalho (`app-header`), há um controle seletor de tema acessível com opções: ☀️ Claro, 🌙 Escuro, ⚖️ Neutro (ou dropdown/segmented control).
- Ao clicar em "Claro", a aplicação inteira altera seu esquema de cores para tons claros (fundo, colunas, cartões, modais, cabeçalho e gráficos).
- Ao clicar em "Neutro", a aplicação altera para a paleta neutra equilibrada.
- Ao clicar em "Escuro", a aplicação restaura o tema escuro original.
- A transição visual é suave e sem quebras de layout.

---

### User Story 2 - Persistência da Preferência do Usuário (Priority: P1)

Como usuário, quero que o tema selecionado permaneça ativo mesmo após fechar ou recarregar a página, para não ter que reconfigurá-lo a cada sessão.

**Why this priority**: Essencial para a usabilidade e consistência do usuário no dia a dia.

**Independent Test**:
- Selecionar o tema "Claro".
- Recarregar a página (`F5` / reload).
- O Metrik carrega imediatamente com o tema "Claro" ativo, sem piscar no tema escuro antes de carregar (*no flash of unstyled theme*).
- O seletor de tema reflete o estado ativo "Claro".

---

### User Story 3 - Coerência Visual em Todos os Componentes e Gráficos (Priority: P2)

Como gestor ágil, quero que o Quadro Kanban, os modais de detalhes, a barra de filtros, os gráficos de fluxo (CFD, Scatter Plot, WIP Aging, Throughput, Monte Carlo) se adaptem harmoniosamente ao tema selecionado, mantendo a legibilidade dos textos e eixos.

**Why this priority**: Garante que gráficos SVG e elementos de métricas mantenham contraste adequado em qualquer um dos 3 temas.

**Independent Test**:
- Navegar para a aba "Analytics" e inspecionar os gráficos nos 3 temas.
- Eixos, linhas de grade, tooltips, textos e legendas permanecem nítidos e legíveis em Claro, Escuro e Neutro.
- No Quadro Kanban, as cores de prioridade, etiquetas de tags e colunas mantêm contraste legível (WCAG AA).

---

## 3. Requisitos Funcionais (FR)

- **FR-001**: O sistema deve suportar três temas explícitos: `'light'` (Claro), `'dark'` (Escuro) e `'neutral'` (Neutro).
- **FR-002**: O sistema deve persistir a seleção no `localStorage` sob a chave `metrik_theme_mode`.
- **FR-003**: Na primeira inicialização, se não houver preferência salva, o sistema deve adotar `'dark'` como padrão (ou respeitar a preferência de sistema `prefers-color-scheme`).
- **FR-004**: O seletor de tema deve estar posicionado no cabeçalho superior (`app-header`), com indicação clara do tema atualmente ativo e acessibilidade por teclado (`aria-label`, `title`).
- **FR-005**: As variáveis CSS de tema (`--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--border-subtle`, etc.) devem ser redefinidas para os seletores `[data-theme="light"]`, `[data-theme="dark"]` e `[data-theme="neutral"]`.
- **FR-006**: Os componentes analíticos e gráficos SVG devem utilizar variáveis semânticas para eixos, linhas de grade e tooltips, garantindo legibilidade perfeita nos três modos.

---

## 4. Requisitos Não Funcionais (NFR)

- **NFR-001 (Performance)**: A troca de tema deve ser instantânea ($< 16\text{ ms}$), operada puramente via alteração de atributo no DOM e variáveis CSS, sem necessidade de re-renderização de dados pesados.
- **NFR-002 (Conformidade Constitucional Metrik v1.2.0)**:
  - **Princípio II (TypeScript Estrito)**: Criação de hook dedicado `useTheme` com tipo `ThemeMode = 'light' | 'dark' | 'neutral'`.
  - **Princípio V (Simplicidade & YAGNI)**: Implementação 100% CSS nativo com tokens de design variáveis, sem bibliotecas externas de estilização.
  - **Princípio VII (Independência Estrita de Marca)**: Nomenclatura proprietária e neutra (*Metrik Theme System*).

---

## 5. Critérios de Sucesso Mensuráveis

1. **Cobertura de Testes**: Mínimo de 5 novos testes unitários para o hook `useTheme` e o componente de alternância de tema, validando persistência no `localStorage` e troca de atributos no DOM.
2. **Preservação Global**: Todos os 255 testes unitários existentes continuam passando com 100% de sucesso.
3. **Build e Tipagem**: `npm run build` executado sem erros de TypeScript ou bundle.
