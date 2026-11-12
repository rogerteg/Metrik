# Guia de Validação Rápida: Mika AI Copilot Preditivo de Monte Carlo

**Feature**: `057-mika-monte-carlo-copilot`  
**Date**: 2026-11-05  

---

## 1. Cenários de Validação Rápida

### Cenário 1: Diagnóstico de Iniciativa Específica
1. No quadro Kanban, selecione uma iniciativa com tarefas vinculadas e data meta definida (ex: *"Iniciativa Portal Web"*).
2. Abra o drawer da Mika clicando no botão flutuante *"✨ Mika AI"*.
3. Envie a pergunta: *"Mika, quando entregamos a Iniciativa Portal Web?"*.
4. **Resultado Esperado**:
   - A Mika responde em sub-10ms (modo local) ou via Gemini (se configurado).
   - Apresenta os percentis P50, P85 (recomendado) e P95 com datas estimadas.
   - Apresenta a probabilidade exata de entrega na data meta e o selo de risco correspondente.
   - Exibe o botão de ação consultiva *"📊 Ver Simulação Completa no Painel"*.

---

### Cenário 2: Panorama Geral de Portfólio de Iniciativas
1. Em um quadro com 2 ou mais iniciativas ativas, abra o chat da Mika.
2. Envie uma pergunta ampla: *"Como estão os prazos das iniciativas?"* ou *"Quando entregamos os projetos?"*.
3. **Resultado Esperado**:
   - A Mika responde listando todas as iniciativas ativas em tópicos (Opção A da Clarificação 1).
   - Cada tópico detalha o título, quantidade de itens pendentes, percentil P85 e classificação de risco (Baixo, Moderado, Alto ou Crítico).

---

### Cenário 3: Consulta de Capacidade Estocástica de Sprint
1. No chat da Mika, envie a pergunta: *"Quantos itens cabem na próxima sprint?"*.
2. **Resultado Esperado**:
   - A Mika declara a premissa de 14 dias corridos (Opção A da Clarificação 2).
   - Informa as estimativas de itens para 50%, 85% (recomendado) e 95% de certeza com base na vazão histórica.
   - Envie uma réplica de refinamento: *"E para 7 dias?"*.
   - A Mika recalcula dinamicamente para o período de 7 dias.

---

### Cenário 4: Resguardo Amostral NIST ($N < 10$)
1. Crie um quadro novo ou filtre um subconjunto com menos de 10 dias de entregas concluídas.
2. Pergunte à Mika sobre qualquer previsão de entrega.
3. **Resultado Esperado**:
   - A resposta inclui explicitamente a ressalva estatística NIST orientando que a amostra é insuficiente para compromissos determinísticos firmes.

---

### Cenário 5: Navegação Consultiva via Botão de Ação (*CTA*)
1. Após a Mika gerar uma resposta contendo o botão *"📊 Ver Simulação Completa no Painel"*, clique no botão.
2. **Resultado Esperado**:
   - O drawer lateral da Mika fecha suavemente (Opção A da Clarificação 3).
   - A aplicação navega para a tela de Analytics na aba *"📦 Previsão de Backlog & Épicos"*.
   - O escopo da iniciativa ou sprint consultada já aparece selecionado no painel.

---

## 2. Comandos de Verificação Automatizada

```bash
# 1. Executar os novos testes unitários da Mika com Monte Carlo
npm test -- tests/unit/mikaMonteCarlo*.test.ts

# 2. Executar suíte completa de testes (155+ arquivos, >967 testes)
npm test -- --run

# 3. Validar guarda constitucional de limite de linhas (<= 400 linhas)
npx vitest run tests/unit/moduleLineCountGuard.test.ts

# 4. Validar checagem estática de tipos
npx tsc --noEmit

# 5. Validar linters e formatação Prettier
npm run lint
npm run format:check
```

