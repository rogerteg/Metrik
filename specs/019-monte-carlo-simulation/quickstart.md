# Quickstart & Verification Guide: Feature 019 - Simulações de Monte Carlo no Gerenciamento de Projetos

**Feature**: `019-monte-carlo-simulation` | **Status**: Implemented & Converged

---

## 1. Comandos de Verificação e Build

```bash
# Executar a suíte de testes unitários (234 testes passando)
npm test

# Executar compilação estrita TypeScript e bundle de produção Vite
npm run build

# Iniciar servidor de desenvolvimento local
npm run dev
```

---

## 2. Roteiro de Verificação Visual e Manual

### Teste 1: Previsão de Capacidade "How Many" (Quantos Itens?)
1. Abra a aplicação no navegador (`http://localhost:5173/`).
2. Acesse a visão de **Analytics** e clique na aba **🎲 Monte Carlo**.
3. Confirme que o modo padrão selecionado é **🎯 Quantos Itens? (How Many)**.
4. Ajuste o prazo alvo para `30 dias` (ou utilize o preset rápido `1 mês`):
   - A simulação de 10.000 ensaios executa instantaneamente (< 30ms).
   - O card de **50% de Certeza** exibe o volume de tarefas esperado na mediana dos cenários.
   - O card destacado em âmbar **85% de Certeza (SLE Recomendado)** exibe a meta recomendada para alinhamentos com stakeholders.
   - O card de **95% de Certeza** exibe a cota de alta previsibilidade ($P_{95} \le P_{85} \le P_{50}$).
5. No gráfico em SVG:
   - Observe as barras com gradiente azul demonstrando a distribuição de frequências.
   - As linhas verticais demarcam claramente P50 (verde), P85 (âmbar) e P95 (vermelho).
   - Ao pousar o cursor sobre as barras, o tooltip exibe a probabilidade de entregar pelo menos aquele volume de tarefas.

### Teste 2: Previsão de Prazo "When" (Quando Entregaremos?)
1. Na tela de Monte Carlo, clique no botão alternador **📅 Quando Entregaremos? (When)**.
2. Observe a mudança do formulário para o campo de quantidade de itens.
3. Se houver tarefas ativas no board, clique no botão rápido **"Usar backlog ativo (N itens em aberto)"**:
   - A quantidade é preenchida automaticamente.
   - Os cards de percentil projetam tanto a quantidade de dias necessários quanto a **data estimada no calendário** (ex: `📅 2026-10-08`).
4. No gráfico de histograma:
   - A distribuição de dias reflete a relação temporal ($P_{50} \le P_{85} \le P_{95}$ dias).
   - O tooltip exibe a probabilidade cumulativa de conclusão até aquela data.

### Teste 3: Configurações de Amostragem & Estado Vazio (Guidance State)
1. Altere o seletor **Janela Histórica de Amostragem** de `30 dias` para `60 dias` ou `Todo o Histórico` e verifique a reatividade do recálculo.
2. Em um board novo ou sem cartões concluídos, verifique a renderização do card informativo didático instruindo o usuário sobre a necessidade de movimentar cartões para registrar o ritmo diário real.
