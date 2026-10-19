# Research: Confiabilidade do Pipeline e Verificação Automatizada (Ciclo 1)

**Feature**: `044-pipeline-reliability`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Pesquisa 1: Eliminação do Acoplamento Temporal nos Testes do Vitest

### Contexto do Problema
Dois arquivos de teste (`tests/unit/CycleTimeScatterPlot.test.tsx` e `tests/unit/MonteCarloSimulationView.test.tsx`) falham quando a data do relógio do sistema avança além de 30 dias após as datas fixas mockadas (agosto e setembro de 2026). Os componentes `CycleTimeScatterPlot` e `MonteCarloSimulationView` aplicam um filtro por janela móvel (14, 30, 60, 90 dias) relativo a `new Date()`. Como consequência, os componentes renderizam o estado vazio de orientação ("Histórico de Throughput Insuficiente"), fazendo com que asserções que buscam seletores visuais e inputs falhem com `TestingLibraryElementError: Unable to find an element`.

### Decisão Técnica
Utilizar as APIs nativas de controle de tempo do Vitest:
```typescript
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Racional da Decisão
- **Imutabilidade das Fixtures**: Não requer recalcular ou alterar as dezenas de tarefas mockadas existentes.
- **Isolamento Estrito**: O uso de `afterEach(() => vi.useRealTimers())` garante que outros testes da suíte que dependem de temporizadores reais ou timers assíncronos não sofram interferência cruzada.
- **Determinismo**: Fixar a data de referência em `2026-09-15` garante que as tarefas mockadas com datas entre `2026-09-01` e `2026-09-10` sempre caiam dentro das janelas de 14 e 30 dias em qualquer execução futura (mesmo daqui a 10 anos).

### Alternativas Rejeitadas
1. **Calcular datas relativas dinamicamente via helpers (`Date.now() - 3 dias`)**: Rejeitada porque exige alterar centenas de linhas de fixtures e introduz complexidade em asserções que validam textos e rótulos de datas exatas formatadas na UI.
2. **Afrouxar os componentes para aceitarem uma prop opcional `currentDate?: Date`**: Rejeitada contra o Princípio Constitucional V (YAGNI) e III.3 — poluiria a API dos componentes de produção apenas para atender testes.

---

## 2. Pesquisa 2: Diagnóstico e Persistência de Relatórios do Vitest Coverage (V8)

### Contexto do Problema
O script `npm run test:coverage` (que executa `vitest run --coverage`) anunciava a execução do provedor V8, mas conforme registrado no documento de visão da Feature 043 (OPP-018), os arquivos físicos de relatório (em especial `coverage/index.html` e `coverage/lcov.info`) não estavam sendo encontrados ou persistidos de forma confiável após a execução.

### Investigação e Descobertas
Ao analisar [vite.config.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/vite.config.ts#L26-L41):
```typescript
coverage: {
  provider: 'v8',
  all: true,
  reporter: ['text-summary', 'html', 'lcov'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
  thresholds: {
    statements: 84,
    lines: 84,
    branches: 77,
    functions: 58,
  },
}
```
A configuração está correta, porém quando executado com falhas em testes na suíte, o Vitest pode abortar o flush de relatórios antes de finalizar a escrita em disco ou ser interrompido por códigos de saída prematuros. Com a suíte 100% verde (701 testes passando), o Vitest conclui o ciclo e grava os arquivos no diretório `coverage/`.

### Decisão Técnica
1. Validar e certificar que a suíte execute 100% verde para destravar o ciclo completo do reporter do Vitest.
2. Manter explicitamente no `vite.config.ts` o array de reporters: `['text-summary', 'html', 'lcov']` e `reportsDirectory: './coverage'`.
3. Adicionar no `.gitignore` a pasta `coverage/` caso necessário, mas garantindo que o CI armazene os artefatos via `actions/upload-artifact`.

---

## 3. Pesquisa 3: Ratchet de Análise Estática (ESLint 9 Flat Config)

### Contexto do Problema
O comando `npm run lint` reporta atualmente **40 avisos** (zero erros). A Constituição III.2 estipula que esses avisos representam dívida técnica limitada que **não pode aumentar** (ratchet não-crescente).

### Decisão Técnica
1. No Ciclo 1, garantir que nenhuma modificação em testes ou configuração introduza novos warnings.
2. Manter a contagem de referência fixada em no máximo 40 avisos.
3. Assegurar que os testes ajustados não usem `any` nem variáveis não utilizadas.
