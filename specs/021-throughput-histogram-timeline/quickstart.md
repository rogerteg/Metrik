# Quickstart & Verification: Feature 021 - Gráfico de Vazão Avançado com Histograma e Linha do Tempo (Throughput Analytics)

## 1. Visão Geral
A Feature 021 evoluiu o módulo de Throughput do Metrik para uma experiência visual inspirada no benchmark de **Throughput Histogram & Daily Run Chart**, combinando:
1. **Throughput Histogram (Topo)**:
   - Barras em SVG nativo indicando a frequência em número de dias para cada volume de entregas diárias (0, 1, 2, 3...).
   - Linhas verticais pontilhadas de percentis NIST: **50% (Mediana)**, **70%**, **85% (SLE de Capacidade)** e **95% (Alta Certeza)**.
   - Tooltips flutuantes com percentual e quantidade exata de dias.
2. **Daily Throughput Run Chart (Inferior)**:
   - Linha temporal contínua conectando cada dia no calendário com marcadores circulares (*dots*).
   - Tooltips interativos de data e contagem diária.
3. **Resumo Estatístico & Controles**:
   - Seletor de período (14D, 30D, 60D, 90D, Tudo).
   - 7 Cartões de resumo executivo: Total Concluído, Média Diária, P50, P70, P85, P95 e Moda Diária.

---

## 2. Como Verificar Localmente

### Testes Automatizados
Execute a suíte de testes do Vitest:
```bash
npx vitest run tests/unit/throughputMetrics.test.ts
npx vitest run tests/unit/ThroughputAnalyticsView.test.tsx
npm test
```

### Build de Produção
```bash
npm run build
```

### Verificação Visual na Interface
1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Abra o Metrik no navegador.
3. Clique na aba de **Analytics** no topo.
4. Selecione a aba **Throughput** no cabeçalho analítico.
5. Inspecione o Histograma superior com as barras azuis e as linhas de percentil pontilhadas.
6. Inspecione o Run Chart inferior com os pontos conectados ao longo do tempo.
7. Alterne entre os botões de período (`14D`, `30D`, `60D`, `90D`, `Tudo`) e verifique a atualização fluida instantânea dos números e dos gráficos SVG.
