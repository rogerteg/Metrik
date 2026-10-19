# Quickstart & Verification Guide: Feature 047

**Feature**: `047-static-quality-governance` | **Cycle**: 4 (P2)  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md)

Este documento descreve os procedimentos automatizados para validar a integridade de estilos, ausência de seletores duplicados, remoção segura de módulos heterogêneos e conformidade estrita de cobertura e linter.

---

## 1. Pré-Requisitos de Ambiente

- Node.js instalado (v18+)
- Dependências instaladas (`npm install` ou `npm ci`)
- Shell: PowerShell 7+ ou Bash

---

## 2. Cenários de Validação Automatizada

### Cenário 1: Verificação da Trava de Duplicação de CSS (SC-001)

Executa a trava de regressão que inspeciona todos os seletores de topo nos módulos CSS:

```bash
npx vitest run tests/unit/cssDuplicationGuard.test.ts
```

- **Critério de Aprovação (Green-Bar)**: Teste aprovado com código 0 e **0 seletores duplicados** encontrados.
- **Critério de Reprovação (Red-Bar)**: Qualquer seletor duplicado detectado causa reprovação imediata do teste.

---

### Cenário 2: Verificação da Estrutura Modular do Manifesto `App.css` (FR-003, FR-004)

Valida que o manifesto de estilos possui exatamente os 12 módulos temáticos ordenados e que o módulo `13-recovered.css` foi completamente descontinuado:

```bash
npx vitest run tests/unit/appCssStructure.test.ts
```

- **Critério de Aprovação (Green-Bar)**: Todos os 4 casos de teste de integridade estrutural passam sem erros.
- **Critério de Reprovação (Red-Bar)**: Se `App.css` contiver regras inline ou se a lista de `@import` divergir da ordem esperada.

---

### Cenário 3: Validação dos Limiares de Cobertura e Emissão de Relatórios (SC-002, FR-005, FR-006)

Executa a suíte de testes com instrumentação de cobertura via motor V8:

```bash
npm run test:coverage
```

- **Critério de Aprovação (Green-Bar)**:
  - Statements ≥ 85%
  - Lines ≥ 85%
  - Branches ≥ 78%
  - Functions ≥ 60%
  - Diretório `coverage/` gerado contendo `index.html` e `lcov.info`.

---

### Cenário 4: Integridade do Linter e Regra Estrita de Tipagem (SC-005)

Garante que nenhuma regra de código foi violada e nenhum `any` foi reintroduzido:

```bash
npm run lint
```

- **Critério de Aprovação (Green-Bar)**: `eslint .` completa com código 0 (**0 erros, 0 avisos**).

---

### Cenário 5: Compilação de Produção e Performance de Build (SC-004)

Verifica se a compilação completa do TypeScript e o empacotamento com o Vite executam em menos de 5 segundos:

```bash
npm run build
```

- **Critério de Aprovação (Green-Bar)**: Código de saída 0, tempo de execução < 5 segundos e zero mensagens de erro.
