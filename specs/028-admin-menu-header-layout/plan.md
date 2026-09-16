# Implementation Plan: Desobstrução e Reorganização do Menu de Administrador e Barra de Métricas

**Branch**: `028-admin-menu-header-layout` | **Date**: 2026-09-15 | **Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

**Input**: Feature specification from `/specs/028-admin-menu-header-layout/spec.md`

## Summary

Ao clicar no perfil "Administrador" (ou usuário ativo) no cabeçalho, o menu suspenso (`UserProfileMenu`) fica obstruído ou ilegível porque a barra de métricas (`MetricsBar`) possui `backdrop-filter`, o que cria um novo *Stacking Context* que sobrepõe elementos filhos do cabeçalho quando este não possui posicionamento relativo e `z-index` superior. Além disso, o cabeçalho aglomera 7 controles em linha reta, exigindo uma reorganização visual ergonômica e refinada.

**Abordagem técnica**:
1. **Garantia de Stacking Context**: Definir `.app-header` com `position: relative; z-index: 50;` e `.metrics-bar` com `position: relative; z-index: 10;`, assegurando que o menu `.user-profile-dropdown` (`z-index: 1000`) sempre sobreponha a barra de métricas em 100% dos navegadores.
2. **Reorganização Estrutural do Cabeçalho**: Reestruturar `.header-actions` em clusters visuais semânticos:
   - `header-controls-group`: Visão (Quadro/Analytics) e Tema.
   - `header-user-group`: `UserProfileMenu` ("Administrador") com destaque e espaçamento próprio.
   - `header-board-ops-group`: Ações utilitárias do quadro (Importar, Exportar, Restaurar Demo, Limpar) com divisória sutil.
3. **Ergonomia e Acessibilidade**: Adicionar fechamento por tecla `Escape` em `UserProfileMenu`, animação suave, contraste elevado em todos os temas e rolagem interna na lista de usuários.

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Vite 6

**Primary Dependencies**: React 19 + CSS nativo (zero dependências adicionais, NFR-004)

**Storage**: N/A (alteração puramente de apresentação visual, ergonomia e layout)

**Testing**: Vitest 3 (jsdom) + React Testing Library; verificação visual no browser; `npm test` e `npm run build`

**Target Platform**: Microsoft Edge, Google Chrome, Mozilla Firefox e Safari modernos; desktop e telas a partir de 1024px

**Project Type**: Web application (SPA local-first, projeto único)

**Performance Goals**: 60 fps constante em aberturas e transições; zero recálculo forçado de layout

**Constraints**:
- Não alterar as fórmulas ou valores das métricas de fluxo (FR-007)
- Não alterar o estado ou persistência de usuários/squads (Feature 023 mantida)
- Preservar a integridade da paridade de colunas (Feature 026)
- Conformidade estrita com WCAG 2.1 AA

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Specification-Driven Development** — `spec.md`, `checklists/requirements.md` e `research.md` formalizados.
- [x] **II. Qualidade & Modularidade** — estilização desacoplada, CSS limpo com variáveis semânticas de tema, componentes React puros.
- [x] **III. Verificação Automatizada** — testes unitários e de componente para `UserProfileMenu` e `MetricsBar` verdes; regressão total limpa.
- [x] **IV. Observabilidade** — estados visuais explícitos (`aria-expanded`, foco visível, contraste).
- [x] **V. Simplicidade & YAGNI** — resolvido com CSS padrão de camadas e reorganização de flexbox sem bibliotecas externas.
- [x] **VI. Raciocínio Analítico Pré-Tarefas** — obrigatório antes da criação de `tasks.md`.
- [x] **VII. Independência de Marca** — terminologia neutra e consistente.
- [x] **VIII. Soberania Local-First** — mantido 100% local.

## Project Structure

### Documentation (this feature)

```text
specs/028-admin-menu-header-layout/
├── plan.md              # Este plano
├── research.md          # Análise de Stacking Context e decisões
├── data-model.md        # Modelo de layout e camadas visuais
├── quickstart.md        # Guia de validação e verificação rápida
├── contracts/
│   └── header-layout.contract.md # Contrato visual e de camadas
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
└── tasks.md             # Decomposição com os 6 modelos analíticos
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── UserProfileMenu.tsx     # Reforço de Escape, aria e estrutura do menu
│   ├── MetricsBar.tsx          # Camada e isolamento visual
│   └── ...
├── App.tsx                     # Reorganização semântica do cabeçalho em clusters
└── App.css                     # Stacking context (.app-header, .metrics-bar, .user-profile-dropdown)
```

## Proposed Changes

### Componentes & CSS

#### [MODIFY] [App.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.css)
- Adicionar `position: relative; z-index: 50;` em `.app-header`.
- Adicionar `position: relative; z-index: 10;` em `.metrics-bar`.
- Ajustar `.user-profile-dropdown` com `z-index: 1000; top: calc(100% + 10px);`.
- Criar classes de cluster `.header-nav-cluster`, `.header-session-cluster` e `.header-board-ops-cluster` com divisórias elegantes.

#### [MODIFY] [App.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.tsx)
- Reorganizar a marcação de `.header-actions` agrupando navegação, sessão de usuário e utilitários do quadro.

#### [MODIFY] [UserProfileMenu.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/UserProfileMenu.tsx)
- Adicionar listener de teclado para tecla `Escape` fechar o menu.
- Aprimorar feedback visual de abertura.

## Verification Plan

### Automated Tests
- `npm test tests/unit/UserProfileMenu.test.tsx`
- `npm test tests/unit/MetricsBar.test.tsx`
- `npm test` (suite completa com 393 testes)
- `npm run build` (`tsc && vite build`)

### Manual / Browser Verification
- Abrir a aplicação via browser subagent em `http://localhost:5173/`.
- Clicar no botão "Administrador".
- Capturar screenshot comprovando que o menu sobrepõe com 100% de nitidez a barra de métricas.
- Testar alternância de temas e visão Analytics.
