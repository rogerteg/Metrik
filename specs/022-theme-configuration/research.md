# Research & Technical Decisions: Configuração de Temas — Claro, Escuro e Neutro (Theme Configuration)

**Feature**: `022-theme-configuration` | **Date**: 2026-09-12

---

## 1. Fundamentação Teórica & Ergonomia Visual

A introdução de múltiplos esquemas de cores no Metrik atende a três necessidades distintas de ergonomia visual, contexto de iluminação ambiental e acessibilidade cognitiva:

1. **Tema Escuro (Dark Mode - Padrão Original)**:
   - Fundo profundo `#0b0f19` com superfícies `#0f172a` e cartões `#1e293b`.
   - Otimizado para ambientes com pouca luz, redução de consumo energético em telas OLED e imersão analítica focada.
2. **Tema Claro (Light Mode)**:
   - Fundo limpo e arejado `#f8fafc` / `#f1f5f9`, colunas `#e2e8f0`, cartões brancos `#ffffff` e tipografia de alto contraste `#0f172a` / `#334155`.
   - Ideal para ambientes corporativos com iluminação natural ou fluorescente intensa, garantindo conformidade WCAG AA (taxa de contraste $\ge 4.5:1$ para texto regular e $\ge 3:1$ para elementos de interface).
3. **Tema Neutro (Neutral / Slate Mode)**:
   - Fundo cinza ardósia equilibrado (`#1e222b` ou `#232733`), colunas `#262c3a`, cartões `#2f3647` e superfícies suaves.
   - Elimina o brilho excessivo do fundo branco e reduz a disparidade de luminância do fundo ultra escuro, oferecendo conforto visual prolongado para operadores e gerentes de fluxo.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Atributo `data-theme` no Elemento Raiz (`document.documentElement`) e CSS Custom Properties
- **Opções Avaliadas**:
  - *Opção A*: Classes CSS no body (ex: `body.theme-light`).
  - *Opção B*: Atributo `data-theme="light" | "dark" | "neutral"` no `<html>` (`document.documentElement`) combinado com variáveis CSS nativas.
  - *Opção C*: Biblioteca de temas em CSS-in-JS (como styled-components ou Tailwind).
- **Decisão**: **Opção B (`data-theme` no `<html>` com variáveis CSS)**.
- **Justificativa**: Conforme o Princípio V da Constituição (Simplicidade & YAGNI), dispensa qualquer biblioteca externa. O atributo no `<html>` tem escopo global garantido, afetando inclusive elementos teleportados (como modais, overlays e tooltips de gráficos) e permitindo transições CSS imediatas ($< 16\text{ ms}$) sem recálculos pesados de renderização.

### Decisão 2: Hook Especializado `useTheme` com Tipagem Estrita
- **Opções Avaliadas**:
  - *Opção A*: Gerenciar tema via `useState` disperso no `App.tsx`.
  - *Opção B*: Criar hook dedicado `src/hooks/useTheme.ts` expondo `{ theme, setTheme }` com tipo estrito `ThemeMode = 'light' | 'dark' | 'neutral'`.
- **Decisão**: **Opção B (`useTheme`)**.
- **Justificativa**: Centraliza leitura/escrita no `localStorage`, escuta de mudanças entre abas (`storage event`), aplicação síncrona no DOM e tratamento seguro de exceções (quando o `localStorage` estiver desabilitado ou em modo anônimo restrito).

### Decisão 3: Componente Seletor Segmentado Acessível no Cabeçalho
- **Opções Avaliadas**:
  - *Opção A*: Um único botão de alternância cíclico (toggle).
  - *Opção B*: Seletor segmentado com 3 opções explícitas (☀️ Claro, 🌙 Escuro, ⚖️ Neutro) posicionado no `app-header`.
- **Decisão**: **Opção B (Seletor segmentado de 3 botões)**.
- **Justificativa**: Permite ao usuário ver claramente qual tema está ativo e selecionar diretamente o modo desejado em um clique, com atributos semânticos (`aria-pressed`, `aria-label`, `title`) para acessibilidade por teclado e leitores de tela.

### Decisão 4: Adaptação Semântica dos Gráficos SVG no Analytics
- **Opções Avaliadas**:
  - *Opção A*: Repassar props de tema para cada componente SVG individualmente.
  - *Opção B*: Usar variáveis CSS semânticas já consumidas pelos SVGs (`var(--color-border)`, `var(--color-text)`, `var(--color-text-secondary)`, `var(--color-surface-elevated)`), redefinidas de acordo com `data-theme`.
- **Decisão**: **Opção B (Variáveis CSS semânticas)**.
- **Justificativa**: Alta modularidade (Princípio II da Constituição), zero acoplamento desnecessário entre a lógica gráfica e o seletor de temas.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **FOUC (Flash of Unstyled Theme)** | Script de tema executando tarde no ciclo de vida | Hook inicializa sincronamente lendo `localStorage` antes de montar componentes e atualiza `document.documentElement` no primeiro render. |
| **Erros de Storage restrito** | Navegador com cookies/storage bloqueados ou modo privado | Bloco `try/catch` envolvendo `localStorage.getItem` e `setItem` com fallback seguro para `'dark'`. |
| **Baixo contraste de badges/tags** | Cores de prioridade desenhadas para fundo escuro | Ajuste refinado das cores e fundos semitransparentes nos seletores `[data-theme="light"]` para preservar legibilidade de tags e prioridades. |
| **Linhas de grade invisíveis em SVG** | Linhas usando cores brancas semitransparentes hardcoded | Uso consistente de `var(--border-subtle)` e `var(--color-border)` que adaptam sua opacidade e tonalidade conforme o tema ativo. |
