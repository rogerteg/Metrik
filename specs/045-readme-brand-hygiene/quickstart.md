# Quickstart: Validação da Documentação e Higiene de Marcas

**Feature**: `045-readme-brand-hygiene`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Cenário de Validação da Documentação de Entrada

Após a atualização do [README.md](../../README.md), execute a leitura e confirme que:
1. Nenhuma menção a "Python", "pandas" ou "python-pptx" existe como dependência do produto.
2. Os comandos listados no README correspondem aos scripts do `package.json`:
   ```powershell
   npm run dev
   npm run test
   npm run test:coverage
   npm run build
   npm run lint
   ```
3. A descrição das métricas de fluxo contempla CFD, Dispersão com percentis NIST, Monte Carlo, WIP Aging e Sprints.

---

## 2. Cenário de Validação de Conformidade de Marcas

Valida que o diretório foi renomeado e nenhuma referência residual existe:
```powershell
Test-Path specs/016-clean-board-layout-minimalist
Test-Path specs/016-clean-board-layout-businessmap
```
- O primeiro comando deve retornar `True`.
- O segundo comando deve retornar `False`.
