# Technical Research: Desobstrução e Reorganização do Menu de Administrador e Cabeçalho (028)

**Date**: 2026-09-15
**Feature**: `028-admin-menu-header-layout`
**Status**: Completed
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Diagnóstico da Causa Raiz

### 1.1 Conflito de Stacking Context (Empilhamento CSS)
- **Constatação**: O elemento `.metrics-bar` possui `backdrop-filter: var(--backdrop-blur)`. De acordo com a especificação CSS (*W3C Compositing and Blending Level 1* e *CSS Filter Effects Level 1*), qualquer elemento com `backdrop-filter` ou `filter` diferente de `none` **estabelece um novo Stacking Context** (contexto de empilhamento).
- **Problema no DOM**: No JSX de `src/App.tsx`, `.metrics-bar` é renderizado imediatamente após `<header className="app-header">`. Como `.app-header` estava com posicionamento estático (`position: static`) e sem `z-index` explícito, o contexto de empilhamento criado pela barra de métricas (sendo posterior no fluxo do documento) se sobrepõe a qualquer elemento flutuante filho do cabeçalho que não pertença a um contexto de nível superior.
- **Resultado visual**: O menu suspenso `.user-profile-dropdown` (aberto ao clicar em "Administrador") é "cortado" ou coberto visualmente pela faixa das métricas.

### 1.2 Congestionamento e Agrupamento no Cabeçalho
- **Constatação**: O contêiner `.header-actions` agrupa 7 elementos/botões de naturezas díspares de forma plana:
  1. Alternador de visualização (`view-toggle`: Quadro / Analytics)
  2. Seletor de temas (`ThemeSelector`)
  3. Menu de perfil (`UserProfileMenu`: "Administrador")
  4. Botão Importar
  5. Botão Exportar
  6. Botão Restaurar Demo
  7. Botão Limpar Quadro
- **Problema de UX**: Mistura ações de sessão/identidade (usuário, tema) com ações de navegação (visão) e ações destrutivas/administrativas do quadro (importar/exportar/limpar), gerando poluição visual e ocupando a largura total do topo da tela.

---

## 2. Decisões Arquiteturais e de Design

### D1: Hierarquia Estrita de Camadas (Stacking Context Seguro)
- **Decisão**: 
  - `.app-header`: `position: relative; z-index: 50;`
  - `.user-profile-dropdown`: `z-index: 1000; position: absolute;`
  - `.metrics-bar`: `position: relative; z-index: 10;`
  - Modais globais (`modal-overlay`): `z-index: 2000;`
- **Justificativa**: Garante matematicamente e em todos os navegadores (Chromium, WebKit, Gecko) que o cabeçalho e todos os seus menus suspensos (perfis, seletores de tema e quadros) flutuem permanentemente acima da barra de métricas e do quadro, eliminando 100% de oclusão.

### D2: Reorganização Semântica do Cabeçalho
- **Decisão**: Dividir `.header-actions` em dois clusters visuais harmoniosos:
  1. `header-nav-cluster`: Agrupa alternador de visualização (Quadro/Analytics) e seletor de tema.
  2. `header-session-cluster`: Destaca o `UserProfileMenu` com visual de pill arredondado, avatar e chevron, servindo como âncora de identidade do operador.
  3. `header-board-ops-cluster`: Agrupa as ações do quadro (Importar, Exportar, Demo, Limpar) com estilo secundário sutil e divisória visual, evitando que disputem atenção com a sessão.
- **Justificativa**: Atende diretamente à solicitação do usuário ("O ideal é reorganizar isso, e melhorar"), criando respiração, clareza hierárquica e elegância moderna.

### D3: Preservação e Acessibilidade do Dropdown
- **Decisão**: Adicionar suporte nativo a fechamento por tecla `Escape`, reforçar `aria-expanded`, e garantir contraste e rolagem interna (`max-height: 280px; overflow-y: auto`) na lista de usuários.
- **Justificativa**: Em conformidade com WCAG 2.1 AA e garantindo que o menu nunca ultrapasse a parte inferior da janela útil.

### D4: Zero Dependências Externas
- **Decisão**: Implementar a reorganização 100% via CSS nativo e estrutura JSX existente, sem adicionar bibliotecas externas.
- **Justificativa**: Conformidade total com a Constituição V (Simplicidade & YAGNI).
