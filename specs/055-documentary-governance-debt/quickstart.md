# Quickstart & Verification Guide: 055 — Governança Documental & Eliminação de Dívida Técnica

Este guia detalha como executar e validar os passos de reconciliação documental, sincronização de tarefas no GitHub e testes sentinela de governança.

---

## 1. Executar a Verificação Automatizada de Governança

Para auditar o status de todas as especificações do repositório:

```bash
# Executar a suíte de testes de governança documental
npx vitest run tests/unit/documentaryGovernance.test.ts
```

**Resultado esperado:**
- Todas as asserções passam com 100% de sucesso.
- Nenhuma das especificações de `specs/001` a `specs/054` apresenta status `Draft` ou formato divergente.
- Apenas a especificação ativa da Feature 055 permanece com `Status: Draft`.

---

## 2. Verificar a Sincronização de Tarefas no GitHub Issues

Para inspecionar as issues criadas para a Feature 053 no repositório GitHub:

```bash
# Listar as issues da Feature 053 criadas e fechadas
gh issue list --repo rogerteg/Metrik --search "Feature 053" --state all
```

**Resultado esperado:**
- 34 issues exibidas (de T001 a T034).
- Todas com status `CLOSED`.
- Títulos no padrão `[Feature 053] T###: <descrição>`.

---

## 3. Inspecionar o Documento de Visão e Saúde do Sistema

Abra o arquivo [`specs/043-system-health-and-roadmap/vision.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/043-system-health-and-roadmap/vision.md) e confirme:
- Tabela do Sumário Executivo reportando:
  - 926 testes automatizados verdes em 150 arquivos (0 falhas).
  - 54 funcionalidades entregues no catálogo.
  - Build em < 5s e zero erros de linter.
  - Oportunidades históricas OPP-007, OPP-008, OPP-009, OPP-010 e OPP-014 formalmente assinaladas como resolvidas.

---

## 4. Validar Arquivos de Memória Viva

Verifique as atualizações nos seguintes arquivos:
- [`.specify/memory/lessons-learned.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/.specify/memory/lessons-learned.md): Seções com aprendizados sobre SLE (percentis NIST e blindagem temporal) e regras de fluxo (Depth = 1).
- [`.specify/memory/project-context.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/.specify/memory/project-context.md): Catálogo atualizado para 54 funcionalidades e inclusão dos novos modelos de dados.

