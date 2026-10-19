# Quickstart & Verification Guide: Qualidade de Código & Arquitetura (Ciclo 3)

**Feature**: `046-code-quality-architecture`  
**Date**: 2026-10-15  
**Status**: Ready for Verification  

---

## 1. Roteiro de Verificação Automatizada

### Passo 1: Executar o Linter em Modo Estrito
Verificar que a base inteira atinge **zero erros e zero warnings**:

```bash
npm run lint
```
**Resultado Esperado**:
```text
✔ 0 problems (0 errors, 0 warnings)
```

---

### Passo 2: Validar o Tamanho do Asset de Logotipo
Inspecionar o arquivo em disco:

```powershell
(Get-Item src/assets/metrik-logo.png).Length
```
**Resultado Esperado**: Valor inferior a `122880` bytes (menos de 120 KB), representando redução superior a 80%.

---

### Passo 3: Executar a Suíte de Testes Automatizados
Garantir que nenhum teste sofreu regressão após a remoção de `any` e ajuste de dependências de hooks:

```bash
npm test
```
**Resultado Esperado**: 113/113 arquivos e 701/701 testes passando (100% verde).

---

### Passo 4: Executar a Compilação de Produção
Certificar que a compilação estrita do TypeScript (`tsc`) e o empacotamento do Vite (`vite build`) passam com zero erros:

```bash
npm run build
```
**Resultado Esperado**:
- Compilação concluída sem erros em < 5 segundos.
- Asset `dist/assets/metrik-logo-*.png` gerado com tamanho inferior a 120 KB no bundle final.

---

## 2. Roteiro de Verificação Manual na Interface

1. Iniciar o servidor local com `npm run dev`.
2. Acessar `http://localhost:5173/`.
3. Verificar a renderização do logotipo na barra superior: imagem nítida, sem bordas esbranquiçadas e com transparência íntegra.
4. Acessar o modal de gerenciamento de equipes (`TeamManagementModal`) e criar/listar times.
5. Acessar a aba de Analytics e alternar intervalos de datas no CFD (`useCfdData`), garantindo atualização fluida sem alertas no console.
