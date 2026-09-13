# Quickstart & Verification: Feature 022 - Configuração de Temas (Theme Configuration)

## 1. Visão Geral
A Feature 022 introduz suporte completo aos temas **Claro (Light)**, **Escuro (Dark)** e **Neutro (Neutral)** no Metrik:
1. **Seletor de Tema no Cabeçalho**:
   - Controle segmentado com 3 opções: ☀️ Claro, 🌙 Escuro e ⚖️ Neutro.
   - Acessibilidade completa por teclado e leitores de tela com `aria-pressed`, `aria-label` e estados de foco.
2. **Persistência Sem FOUC**:
   - Preferência do usuário salva no `localStorage` sob a chave `metrik_theme_mode`.
   - Aplicação imediata no `document.documentElement` (`data-theme`), prevenindo qualquer piscar de tela.
3. **Harmonia em Todo o Sistema**:
   - Quadro Kanban, cartões de tarefas, badges de prioridade, tags, modais de detalhes e de gestão de quadros.
   - Aba Analytics com todos os gráficos de fluxo (CFD, Cycle Time Scatter Plot, WIP Aging, Throughput Histogram & Run Chart, Monte Carlo).

---

## 2. Como Verificar Localmente

### Testes Automatizados
Execute os testes unitários dedicados do tema e a suíte completa:
```bash
npx vitest run tests/unit/useTheme.test.ts
npx vitest run tests/unit/ThemeSelector.test.tsx
npm test
```

### Build de Produção
Valide que a tipagem estrita e o empacotamento estão 100% corretos:
```bash
npm run build
```

### Verificação Visual na Interface
1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Abra o Metrik no navegador.
3. No cabeçalho (`app-header`), localize o seletor de tema.
4. Clique em **Claro**:
   - Observe a transição imediata para fundo claro, colunas contrastantes, cartões brancos e textos escuros legíveis.
5. Clique em **Neutro**:
   - Observe a transição para a paleta suave de ardósia, com contraste balanceado e redução de brilho.
6. Clique em **Escuro**:
   - Observe o retorno perfeito ao tema escuro original.
7. Recarregue a página (`F5`) enquanto estiver em modo Claro ou Neutro e confirme que a preferência persiste sem nenhum piscar no tema escuro.
8. Navegue para o **Analytics** em cada um dos 3 temas e confirme que eixos, linhas de grade e tooltips estão legíveis.
