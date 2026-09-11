# Quickstart & Verification Guide: Feature 018 - CFD Avançado com Análise de Fluxo e Gargalos

**Feature**: `018-cfd-advanced-flow-analytics` | **Status**: Implemented & Verified

---

## 1. Comandos de Verificação e Build

```bash
# Executar a suíte de testes unitários
npm test

# Executar compilação estrita TypeScript e bundle Vite
npm run build

# Iniciar servidor local
npm run dev
```

---

## 2. Roteiro de Verificação Visual e Manual

### Teste 1: Inspeção Dual Interativa de Fluxo (WIP vs Lead Time)
1. Abra a aplicação no navegador (`http://localhost:5173/`).
2. Acesse a aba **Analytics** e selecione a sub-aba **CFD / Fluxo** (ou observe o card do CFD no Dashboard geral).
3. Pouse o cursor do mouse sobre o gráfico:
   - Uma linha pontilhada vertical acompanha a coordenada X do cursor.
   - Uma linha contínua sólida azul mede a distância vertical da etapa ativa (**WIP**) com badge indicativo (ex: `X items`).
   - Uma seta horizontal bidirecional conecta a curva de entrada e de saída no mesmo patamar cumulativo (**Lead Time**) com badge indicativo (ex: `Y days`).
   - Se a taxa de crescimento da fila for desproporcional, a tag de gargalo (*A queue column expanding*) é projetada acima da medição.

### Teste 2: Painel Retrátil de Filtros (`CfdFilterDrawer`)
1. No canto superior esquerdo do CFD, clique no botão **Filtros** (`⚙ Filtros`).
2. Verifique a abertura suave da gaveta retrátil lateral sem quebrar a proporção do canvas.
3. Altere o campo `Requested after` (Data inicial) ou `Finished before` (Data final).
4. Desmarque uma das colunas do quadro para omiti-la da visualização de fluxo.
5. Clique no botão **LOAD / Aplicar Filtros**:
   - O gráfico de CFD recalcula instantaneamente as bandas empilhadas e os eixos no período definido.

### Teste 3: Mini-Timeline Scrubber (Zoom Temporal)
1. Com um dataset contendo 4 ou mais dias registrados, localize a miniatura inferior do gráfico.
2. Arraste as alças de seleção lateral do scrubber:
   - O gráfico principal projeta com zoom e fidelidade apenas o trecho selecionado na linha do tempo.
   - O botão de restaurar filtros redefine a janela para o período integral do projeto.
