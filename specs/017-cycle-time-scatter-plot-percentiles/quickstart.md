# Quickstart & Verification Guide: Feature 017 - Cycle Time Scatter Plot & Analytics Navigation

**Feature**: `017-cycle-time-scatter-plot-percentiles` | **Status**: Planned

---

## 1. Comandos de Verificação e Build

```bash
# Executar a suíte de testes unitários
npm test

# Executar compilação estrita de produção
npm run build

# Iniciar servidor local
npm run dev
```

---

## 2. Roteiro de Verificação Visual e Manual

### Teste 1: Navegação por Abas Analíticas
1. Acesse o Metrik e clique no botão **Analytics** no cabeçalho.
2. Observe a nova barra de navegação no topo do módulo analítico:
   - Abas disponíveis: `Dashboard`, `Cycle Time`, `Throughput`, `CFD / Fluxo`, `Bloqueios`.
   - Clique em **Cycle Time**: a visão deve alternar para o Scatter Plot em tela cheia com painel lateral.
   - Clique em **Dashboard**: a visualização deve retornar à visão geral consolidada com todos os gráficos.

### Teste 2: Projeção de Percentis no Scatter Plot
1. Na aba **Cycle Time**, observe o gráfico de dispersão:
   - Os pontos azuis representam tarefas concluídas no eixo X (data) e Y (dias de ciclo).
   - Três linhas pontilhadas horizontais cruzam o gráfico com seus respectivos rótulos:
     - Linha verde/azul: **50%** (Mediana)
     - Linha âmbar/amarela: **85%** (Compromisso SLE)
     - Linha coral/vermelha: **95%** (Limite de variabilidade)
   - Verifique que os valores calculados correspondem à distribuição real das tarefas concluídas do quadro.

### Teste 3: Painel Lateral de Controles (*Controls for this Chart*)
1. Abra o painel de controles clicando no botão retrátil à direita do gráfico:
   - Desmarque a opção **95%**: a linha de 95% deve desaparecer suavemente do gráfico.
   - Desmarque a opção **85%**: a linha de 85% deve sumir, restando apenas a de 50%.
   - Reative os checkboxes e veja as linhas reaparecerem instantaneamente.

### Teste 4: Destaque de Tarefas Bloqueadas
1. No painel de controles, ative o switch/checkbox **Destacar Itens Bloqueados**.
2. Observe os pontos no gráfico:
   - Tarefas que sofreram bloqueios durante o ciclo adquirem cor vermelha ou anel vermelho de alerta para rápida identificação de gargalos.

### Teste 5: Tooltip Interativo Rico
1. Pouse o mouse sobre qualquer ponto no gráfico:
   - O card flutuante/tooltip deve exibir:
     - Título da tarefa
     - Cycle Time exato em dias/horas
     - Data de início e de conclusão
     - Tempo total bloqueado (se houver).
