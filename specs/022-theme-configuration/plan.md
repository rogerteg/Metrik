# Implementation Plan: Configuração de Temas — Claro, Escuro e Neutro (Theme Configuration)

**Branch**: `022-theme-configuration` | **Date**: 2026-09-12 | **Spec**: [specs/022-theme-configuration/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Implementação de um sistema completo de temas corporativos para o Metrik, oferecendo três modos selecionáveis: **Claro (Light)**, **Escuro (Dark)** e **Neutro (Neutral)**. O sistema utiliza variáveis CSS nativas aplicadas globalmente através do atributo `data-theme` no elemento raiz (`document.documentElement`), com persistência no `localStorage` via chave `metrik_theme_mode` e controle intuitivo no cabeçalho através do componente `ThemeSelector.tsx` impulsionado pelo hook `useTheme.ts`.

## 2. Contexto Técnico

- **Linguagem / Versão**: TypeScript 5.6+, React 18+ (Vite)
- **Dependências Principais**: React, CSS Custom Properties (Zero bibliotecas externas de CSS-in-JS ou temas)
- **Armazenamento**: `localStorage` do navegador (`metrik_theme_mode`)
- **Testes**: Vitest, React Testing Library
- **Plataforma Alvo**: Navegadores Web Modernos (Chrome, Firefox, Safari, Edge)
- **Tipo de Projeto**: Web Application / Enterprise Kanban & Flow Analytics
- **Metas de Performance**: Troca de tema instantânea ($< 16\text{ ms}$, 60fps) via mutação de atributo no DOM
- **Restrições**: Conformidade WCAG AA ($\ge 4.5:1$ texto normal, $\ge 3:1$ elementos gráficos), 100% CSS nativo

## 3. Constitution Check (Gates Constitucionais Metrik v1.2.0)

- [x] **Gate I (Specification-Driven Development)**: `spec.md`, `research.md`, `data-model.md`, `quickstart.md` e `plan.md` formalizados na branch isolada `022-theme-configuration`.
- [x] **Gate II (Qualidade de Código & Modularidade)**: Módulo desacoplado `useTheme.ts`, componente atômico `ThemeSelector.tsx` e tokens globais em `App.css`.
- [x] **Gate III (Verificação Automatizada)**: Testes unitários para persistência, recuperação e eventos de UI, mantendo 100% de sucesso nos 255 testes legados.
- [x] **Gate IV (Observabilidade & Logs Estruturados)**: Tratamento defensivo em `try/catch` para `localStorage` restrito com fallbacks transparentes.
- [x] **Gate V (Simplicidade & YAGNI)**: 100% CSS nativo puro sem frameworks ou dependências pesadas adicionais.
- [x] **Gate VI (Modelos de Raciocínio Analítico Pré-Tarefas)**: Mandatório antes de criar `tasks.md`.
- [x] **Gate VII (Independência Estrita de Marca)**: Nomenclatura proprietária e neutra (*Metrik Theme System*).

---

## 4. User Review Required

> [!IMPORTANT]
> - **100% CSS Nativo sem Bibliotecas Externas**: Em estrita conformidade com o Princípio V da Constituição (Simplicidade & YAGNI), todo o gerenciamento estético é feito com seletores `[data-theme="..."]` e propriedades customizadas CSS (`:root`), mantendo o bundle minúsculo e as trocas de tema instantâneas ($< 16\text{ ms}$).
> - **Zero Flicker / FOUC**: A inicialização do tema é feita na montagem do app a partir do `localStorage`, garantindo carregamento sem piscar o tema escuro antes de carregar o tema configurado.
> - **Independência Estrita de Marca**: Conforme o Princípio VII da Constituição, nenhum nome de terceiros ou bibliotecas de tema comerciais é introduzido.

---

## 5. Estrutura do Projeto

```text
specs/022-theme-configuration/
├── spec.md              # Especificação formal da feature
├── plan.md              # Este plano de implementação
├── research.md          # Decisões técnicas e fundamentação ergonômica
├── data-model.md        # Tipos ThemeMode, ThemeOption e UseThemeReturn
├── quickstart.md        # Guia de validação e testes
├── checklists/          # Checklists de qualidade de requisitos
└── tasks.md             # Tarefas de implementação (Phase 2 - /speckit-tasks)

src/
├── types/
│   └── theme.ts         # [NEW] Tipos ThemeMode e interfaces
├── hooks/
│   └── useTheme.ts      # [NEW] Hook de gerenciamento e persistência
├── components/
│   ├── ThemeSelector.tsx # [NEW] Componente segmentado de seleção de tema
│   ├── Analytics.css    # [MODIFY] Adaptação de cores de gráficos e tooltips
│   ├── Modal.css        # [MODIFY] Adaptação de modais ao tema ativo
│   └── TaskDetailsModal.css # [MODIFY] Adaptação do modal de detalhes
├── App.tsx              # [MODIFY] Integração de useTheme e ThemeSelector
└── App.css              # [MODIFY] Tokens de design :root, [data-theme="..."]

tests/unit/
├── useTheme.test.ts     # [NEW] Testes unitários do hook useTheme
└── ThemeSelector.test.tsx # [NEW] Testes unitários do componente ThemeSelector
```

---

## 6. Proposed Changes

### 1. Camada de Tipagem e Hook de Tema

#### [NEW] [src/types/theme.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/types/theme.ts)
- `ThemeMode = 'light' | 'dark' | 'neutral'`.
- `UseThemeReturn`: `{ theme: ThemeMode; setTheme: (theme: ThemeMode) => void }`.
- Constante `THEME_STORAGE_KEY = 'metrik_theme_mode'`.

#### [NEW] [src/hooks/useTheme.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useTheme.ts)
- Hook com estado tipado para gerenciar tema.
- Leitura segura de `localStorage` com fallback para `'dark'`.
- Efeito colateral síncrono aplicando `document.documentElement.setAttribute('data-theme', theme)`.
- Escuta de eventos `storage` para sincronizar abas simultâneas.

#### [NEW] [tests/unit/useTheme.test.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/useTheme.test.ts)
- Testes unitários para:
  - Inicialização padrão `'dark'` na ausência de dados salvos.
  - Recuperação da preferência salva no `localStorage` (`'light'` ou `'neutral'`).
  - Atualização do atributo `data-theme` no `document.documentElement`.
  - Tratamento resiliente de falhas de `localStorage`.

---

### 2. Componente de UI e Integração com Cabeçalho

#### [NEW] [src/components/ThemeSelector.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/ThemeSelector.tsx)
- Controle segmentado com 3 botões acessíveis:
  - ☀️ **Claro** (`light`)
  - 🌙 **Escuro** (`dark`)
  - ⚖️ **Neutro** (`neutral`)
- Suporte a `aria-pressed`, `aria-label`, foco de teclado e indicação visual nítida do tema ativo.

#### [NEW] [tests/unit/ThemeSelector.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/ThemeSelector.test.tsx)
- Testes unitários para renderização dos 3 botões, chamada de `setTheme` no clique e acessibilidade.

#### [MODIFY] [src/App.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.tsx)
- Integrar `useTheme` e renderizar `ThemeSelector` no cabeçalho (`.header-actions` ao lado do toggle de visualização).

---

### 3. Tokens de Design e Estilos nos 3 Temas

#### [MODIFY] [src/App.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.css)
- Adicionar tokens de design específicos para `[data-theme="light"]`, `[data-theme="dark"]` e `[data-theme="neutral"]`.
- Redefinir variáveis de background, colunas, cartões, textos, bordas, botões secundários, inputs e sombras.
- Ajustar estilizações do logotipo/título, botões e controles para manter contraste perfeito em todos os temas.
- Adicionar estilos para o componente `.theme-selector`.

#### [MODIFY] [src/components/Analytics.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Analytics.css)
- Ajustar cards de gráficos, botões de expansão, tooltips e fundos de modais para sincronizar com as variáveis do tema ativo.

#### [MODIFY] [src/components/Modal.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Modal.css) e [TaskDetailsModal.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TaskDetailsModal.css)
- Sincronizar gradientes e fundos de modais com as variáveis `--bg-card` e `--bg-secondary`.

---

## 7. Verification Plan

### Automated Tests
- Testes unitários dedicados de tema:
  ```bash
  npx vitest run tests/unit/useTheme.test.ts
  npx vitest run tests/unit/ThemeSelector.test.tsx
  ```
- Suíte completa de regressão:
  ```bash
  npm test
  ```
- Verificação de compilação TypeScript e bundle:
  ```bash
  npm run build
  ```

### Manual Verification
- Alternar entre Claro, Escuro e Neutro no cabeçalho e verificar:
  - Contraste do Quadro Kanban e cartões.
  - Modais de criação de coluna, gestão de quadros e detalhes de tarefas.
  - Aba Analytics com todos os gráficos SVG.
  - Recarregamento de página persistindo a escolha.
