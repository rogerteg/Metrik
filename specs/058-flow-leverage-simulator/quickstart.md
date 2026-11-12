# Quickstart & Guia de Validação: Feature 058

**Feature**: `058-flow-leverage-simulator` — Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso  
**Date**: 2026-11-12  

Este guia descreve os cenários de ponta a ponta para validar a implementação da Feature 058 tanto de forma manual no navegador quanto por testes automatizados.

---

## 🛠️ Cenário 1: Diagnóstico de Impacto em Cascata de Bloqueios

### Objetivo
Validar que um item bloqueado que possui dependências a jusante tem seu impacto quantificado em dias de atraso no horizonte P85 e gera uma alavanca de fluxo recomendada.

### Passos de Teste
1. No quadro Kanban, crie uma tarefa `#101` com título *"Aprovação de Infraestrutura"* na coluna de desenvolvimento e marque-a como bloqueada (`blocked: true`).
2. Crie duas tarefas `#102` (*"Deploy Backend"*) e `#103` (*"Integração Gateway"*), e adicione vínculos indicando que `#101` bloqueia `#102` e `#102` bloqueia `#103`.
3. Navegue até a aba **Analytics** e acione a visualização de **Alavancas de Fluxo & Custo do Atraso**.
4. **Resultado Esperado**:
   - A tarefa `#101` aparece no topo do ranking de impedimentos como alavanca `cascade_unblock`.
   - O diagnóstico exibe que 2 tarefas estão retidas em cadeia com profundidade 2.
   - O impacto é quantificado em dias extras projetados no P85 (ex.: `+5 dias no P85`).
   - Clicar no chip `#101` abre os detalhes da tarefa sem alterar dados do quadro.

---

## ⚙️ Cenário 2: Simulação "What-If" de Políticas (WIP & Swarming)

### Objetivo
Validar que o simulador permite ajustar limites de WIP e ativar Swarming no modo Sandbox, demonstrando a redução comparativa do tempo de ciclo (Lei de Little) e permitindo aplicação sob confirmação explícita.

### Passos de Teste
1. Abra a aba de **Previsão de Backlog** no Analytics e mude para a visualização **Simulador de Políticas de Fluxo**.
2. Observe o painel comparativo **Cenário Atual vs. Cenário Simulado**.
3. Na coluna *"Em Desenvolvimento"* (onde há 8 itens ativos e limite configurado de 10), reduza o limite simulado para 4.
4. Ative a caixa de seleção *"Foco em Itens de Alto Aging (Swarming)"*.
5. **Resultado Esperado**:
   - O sistema calcula instantaneamente (sub-50ms) o tempo de ciclo P50 e P85 simulado.
   - O delta exibe a redução estimada no tempo de ciclo (ex.: `-3 dias no P85`).
   - Nenhum dado do quadro é alterado automaticamente.
   - Um botão *"Aplicar limite na coluna"* fica visível para administradores/membros. Ao clicar nele e confirmar, o limite de WIP da coluna no quadro é atualizado de forma persistente.

---

## 🤖 Cenário 3: Consulta de Alavancas do Dia na Mika AI & Navegação Contínua

### Objetivo
Validar a resposta determinística offline da assistente Mika sobre as Top 3 Alavancas do Dia e a continuidade de navegação que fecha o drawer e abre o painel já pré-selecionado.

### Passos de Teste
1. Abra a gaveta da **Mika AI** no canto superior direito do Metrik (mesmo offline ou sem chave externa).
2. Clique na pílula rápida *"🎯 Alavancas de Hoje"* ou digite *"Mika, quais as alavancas de hoje?"*.
3. **Resultado Esperado**:
   - Em menos de 10 milissegundos, a Mika responde com uma lista formatada contendo as 3 melhores alavancas do quadro, seus chips clicáveis `#ID` e a estimativa de dias ganhos.
   - A resposta renderiza o botão de ação consultiva CTA *"📊 Ver Simulação Completa no Painel"*.
   - Ao clicar no botão, a gaveta do chat fecha, a tela navega para o Analytics na aba de Previsão com o escopo contextual da consulta (Iniciativa/Sprint) **já pré-selecionado** e os selos de risco de SLE visíveis nos cartões.

---

## 🧪 Comandos de Validação Automatizada

```bash
# 1. Executar testes unitários do motor de alavancas e cascata
npm test -- tests/unit/flowLeverageEngine.test.ts

# 2. Executar testes de integração da Mika com intenções de alavancas
npm test -- tests/unit/mikaChat.test.tsx

# 3. Validar teto modular estrito de <= 400 linhas
npm test -- tests/unit/moduleLineCountGuard.test.ts

# 4. Checagem estática rigorosa de tipos TypeScript e linting
npx tsc --noEmit
npm run lint

# 5. Validação de estilo de formatação Prettier
npm run format:check
```

