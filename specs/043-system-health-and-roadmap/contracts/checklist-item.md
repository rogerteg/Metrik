# Contrato — Item de Checklist

**Feature**: `043-system-health-and-roadmap` | **Versão**: 1.0.0 | **Data**: 2026-10-07
**Consumidores**: revisor humano, `/speckit-implement` (que lê o estado das marcações como gate), `/speckit-checklist` (que gera itens).
**Instâncias**: [checklists/planning-readiness.md](../checklists/planning-readiness.md), [checklists/requirements.md](../checklists/requirements.md).

---

## 1. Propósito

Definir a forma de um item de checklist para que (a) o revisor marque sem ambiguidade, (b) `/speckit-implement` possa lê-lo como gate e (c) o item permaneça um **teste da qualidade do requisito**, sem degenerar em teste de implementação.

## 2. Semântica das marcações

| Marcação | Significado | O que **não** significa |
|---|---|---|
| `[ ]` | O critério ainda requer avaliação do revisor | Trabalho não iniciado |
| `[x]` | O revisor avaliou e o critério de **qualidade do requisito** está satisfeito | Trabalho de implementação concluído |

**Regra de propriedade**: o item pertence ao **revisor**. O gerador cria itens sempre desmarcados e **nunca** marca. `/speckit-implement` lê o estado e **não** modifica marcadores.

## 3. Forma canônica

```markdown
- [ ] CHK### <pergunta sobre a qualidade do requisito> [<dimensão>, <referência>]
```

| Elemento | Regra |
|---|---|
| `CHK###` | Três dígitos, **globalmente sequencial** dentro do arquivo, sem lacunas nem duplicatas |
| Pergunta | Interrogativa, terminando em `?`, sobre o que está **escrito** — não sobre comportamento do sistema |
| Dimensão | Uma de: `Completeness`, `Clarity`, `Consistency`, `Measurability`, `Coverage`, `Traceability`, `Ambiguity`, `Conflict`, `Assumption`, `Gap`, `Exception Flow` |
| Referência | Seção da spec (`Spec §FR-012`, `Spec §SC-012`), seção da visão (`vision §3.6`) ou marcador (`Gap`, `Ambiguity`, `Conflict`, `Assumption`) |

## 4. Invariantes verificáveis

| # | Invariante | Como verificar |
|---|---|---|
| C1 | Todo item começa com `- [ ]` ou `- [x]`, seguido de `CHK###` | Padrão de linha |
| C2 | Os identificadores são sequenciais a partir de `CHK001`, sem lacunas | Diferença entre sequência esperada e observada = vazio |
| C3 | Nenhum identificador se repete no arquivo | Unicidade |
| C4 | Ao menos 80% dos itens trazem referência entre colchetes | Contagem proporcional |
| C5 | Nenhum item começa por `Verify`, `Test`, `Confirm`, `Check`, `Ensure` ou `Validate` seguido de comportamento | Padrão de abertura |
| C6 | Todo item recém-gerado por `/speckit-checklist` está **desmarcado** | Contagem de `[x]` entre itens novos = 0 |
| C7 | Itens existentes **nunca** são removidos ou reescritos numa nova geração — apenas acrescentados | Comparação do conteúdo anterior com o posterior |

**C5 e C7 são os invariantes que importam.** C5 impede que o checklist degenere em plano de testes disfarçado; C7 preserva a revisão já realizada por outros revisores.

## 5. Ciclos de vida distintos

| Arquivo | Ciclo | Quem marca |
|---|---|---|
| `checklists/requirements.md` | Regido por `/speckit-specify` e `/speckit-clarify` | O comando, durante a revalidação da spec |
| `checklists/<domínio>.md` | Regido por `/speckit-checklist` | **O revisor humano** |

A distinção é explícita porque os dois arquivos convivem no mesmo diretório com regras de propriedade diferentes.

## 6. O que este contrato NÃO define

- **Não** define quais itens devem existir — isso é decisão de domínio em cada invocação de `/speckit-checklist`.
- **Não** define prazo nem responsável pela revisão.
- **Não** autoriza marcar `[x]` para "destravar" fases seguintes: marcar sem avaliar é precisamente a falsificação que este contrato torna detectável.
