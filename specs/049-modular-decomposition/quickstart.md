# Quickstart: Validação da Decomposição de Módulos (OPP-002)

**Feature**: `049-modular-decomposition`  
**Purpose**: Guia executável passo a passo para validar a refatoração modular, limites de linhas (≤ 400) e não-regressão sistêmica.

---

## 1. Pré-Requisitos & Ambiente

- Node.js 18+ instalado
- Repositório sincronizado na branch principal ou feature branch `049-modular-decomposition`
- Dependências instaladas (`npm install`)

---

## 2. Cenários de Validação Automatizada

### Cenário 1: Medição Estática de Linhas dos Módulos Decompostos (OPP-002)

Executar o comando de inspeção estática de linhas para os módulos originais e os novos subcomponentes criados:

```bash
pwsh -Command @"
@('src/components/Task.tsx', 'src/App.tsx', 'src/components/TaskDetailsModal.tsx', 'src/hooks/useTaskCollection.ts') + (Get-ChildItem src/components/Task, src/components/TaskDetailsModal, src/components/App, src/hooks/taskCollection -Filter *.tsx,*.ts -Recurse | Select-Object -ExpandProperty FullName) | ForEach-Object {
    [PSCustomObject]@{
        Arquivo = [System.IO.Path]::GetFileName(`$_);
        Linhas = (Get-Content `$_ | Measure-Object -Line).Lines;
        Status = if ((Get-Content `$_ | Measure-Object -Line).Lines -le 400) { 'PASS (<= 400)' } else { 'FAIL (> 400)' }
    }
} | Format-Table -AutoSize
"@
```

**Resultado Esperado**:
- Todos os arquivos avaliados exibem `Status: PASS (<= 400)`.
- Zero módulos com mais de 400 linhas.

---

### Cenário 2: Validação Automatizada via Teste de Guarda

Executar a nova suíte de guarda de tamanho de módulos:

```bash
npx vitest run tests/unit/moduleLineCountGuard.test.ts
```

**Resultado Esperado**:
- Teste aprovado com status verde (100% de conformidade com o limite de 400 linhas).

---

### Cenário 3: Validação da Suíte Completa de Testes (Não-Regressão)

Executar todos os testes automatizados do Metrik:

```bash
npm test
```

**Resultado Esperado**:
- 100% dos testes passam sem falhas (744+ testes aprovados em 125+ arquivos).
- Nenhuma falha de regressão em `tests/unit/Task*.test.tsx`, `useTaskCollection.test.ts` ou `AnalyticsDashboard.test.tsx`.

---

### Cenário 4: Validação de Qualidade de Código & Tipos TypeScript

Executar o linter e o verificador de tipos:

```bash
npm run lint
npx tsc --noEmit
```

**Resultado Esperado**:
- 0 erros e 0 avisos no ESLint (regra estrita `no-explicit-any`).
- Compilação TypeScript limpa com código de saída 0.

---

### Cenário 5: Compilação de Produção e Bundle Size

Executar a compilação de produção com Vite:

```bash
npm run build
```

**Resultado Esperado**:
- Build concluído em tempo inferior a 5 segundos.
- Saída limpa no diretório `dist/`.

---

## 3. Cenários de Validação Visual & Interativa (Smoke Test)

1. **Quadro Kanban**:
   - Iniciar o servidor com `npm run dev` e acessar `http://localhost:5173/`.
   - Arrastar um cartão entre colunas: o arrasto deve ser fluido, sem piscar e respeitando os limites de WIP.
   - Verificar chips de bloqueio, badges de SLE e barra de progresso de checklist.
2. **Modal de Detalhes da Tarefa**:
   - Clicar duas vezes em um cartão para abrir `TaskDetailsModal`.
   - Modificar a descrição sem salvar e pressionar `Escape`: o diálogo de confirmação de descarte de rascunho sujo deve aparecer impedindo o fechamento acidental.
   - Salvar a alteração e fechar o modal.
3. **Casca da Aplicação**:
   - Alternar entre abas do topo (Quadro, Analytics, Configurações).
   - Acionar a gaveta da Mika AI e modais de criação.
