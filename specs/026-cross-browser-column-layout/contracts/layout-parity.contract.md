# Contract: Layout Parity (Metrik Column Geometry Contract)

**Feature**: `026-cross-browser-column-layout`
**Date**: 2026-09-14
**Type**: UI contract (observable geometry) — não há API ou serviço externo nesta feature
**Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md)

---

## 1. Objetivo

Declarar as obrigações **observáveis** de geometria do quadro, de forma que a paridade entre navegadores possa ser verificada por medição numérica e não por inspeção visual. Este contrato é a referência das suítes automatizadas (que verificam os invariantes) e da matriz manual do `quickstart.md` (que verifica a paridade medida).

## 2. Termos canônicos

| Termo | Significado |
|---|---|
| **Largura resolvida** | Largura efetiva em pixels CSS de uma coluna, sempre finita e dentro da faixa |
| **Preferência** | Valor de largura persistido localmente para uma coluna de um quadro |
| **Padrão** | Largura usada na ausência de preferência utilizável |
| **Faixa permitida** | Intervalo fechado entre a largura mínima e a máxima |
| **Amostra de paridade** | Medição de largura renderizada com navegador, janela, ampliação e densidade registrados |

## 3. Contrato de Geometria

| ID | Obrigação | Verificação | Requisito |
|---|---|---|---|
| GC-01 | Toda coluna renderiza com largura explícita, nunca indefinida | Asserção de estilo/medição por coluna | FR-001, FR-002 |
| GC-02 | Sem preferência utilizável, a largura é o valor padrão | Suíte unitária + medição | FR-010 |
| GC-03 | Largura resolvida pertence à faixa permitida | Suíte unitária com valores de fronteira | FR-009 |
| GC-04 | Preferência válida prevalece sobre qualquer estilo declarativo | Suíte de componente | FR-009 |
| GC-05 | Restaurar remove a preferência e retorna ao padrão, de forma idempotente | Suíte de componente (duas execuções) | FR-010 |
| GC-06 | O arraste inicia na largura renderizada; o primeiro movimento não produz salto | Suíte de componente medindo antes/depois | FR-011 |
| GC-07 | O padrão, o mínimo e o máximo são idênticos entre o módulo TypeScript e o CSS | Guarda anti-drift lendo `src/App.css` | FR-001, NFR-001 |
| GC-08 | Nenhum literal numérico de largura de coluna permanece em componente | Guarda anti-drift | NFR-001 |
| GC-09 | Preferências inválidas ou corrompidas são descartadas sem quebrar o layout | Suíte unitária com entradas inválidas | FR-009 |
| GC-10 | A rolagem horizontal permanece contida na área do quadro quando a soma excede a janela | Verificação visual guiada no `quickstart.md` | FR-003 |
| GC-11 | Nenhuma coluna é sobreposta ou colapsada em 2, 6 e 12 colunas | Matriz do `quickstart.md` | FR-002, SC-002 |
| GC-12 | Divergência de geometria é reportada com prefixo `[Metrik Guard]` e os valores medidos | Inspeção do diagnóstico | FR-014 |

## 4. Contrato de Paridade entre Navegadores

**Referência de aceite**: a renderização atual no Microsoft Edge (registrada em `spec.md` §Assumptions).

| ID | Obrigação | Tolerância |
|---|---|---|
| GP-01 | Mesma quantidade e mesma ordem de colunas em todos os navegadores suportados | exata |
| GP-02 | Diferença de largura renderizada da mesma coluna entre navegadores | ≤ 1 px |
| GP-03 | Diferença de posição horizontal (deslocamento acumulado) entre navegadores | ≤ 1 px |
| GP-04 | Nenhuma coluna cortada, sobreposta, colapsada ou fora da área visível | exata |
| GP-05 | Paridade mantida em ampliação de 50%, 100%, 150% e 200% | ≤ 1 px |
| GP-06 | Paridade mantida em densidade de tela de 1,00, 1,50 e 2,00 | ≤ 1 px |
| GP-07 | Paridade mantida com barras de rolagem de largura diferente | ≤ 1 px na largura útil da coluna |
| GP-08 | Nenhuma decisão de layout baseada em identificação de navegador | exata (inspeção) |
| GP-09 | Paridade mantida nos temas claro, escuro e neutro | exata (apenas cores variam) |
| GP-10 | Paridade mantida na visão de Analytics e em painéis modais | exata |

## 5. Matriz de Verificação

Executar a matriz completa em cada navegador suportado (roteiro detalhado em `quickstart.md`):

| Dimensão | Valores |
|---|---|
| Navegador | Edge, Chrome, Firefox, Safari |
| Janela | 1280×720, 1920×1080, 2560×1440 |
| Ampliação | 50%, 100%, 150%, 200% |
| Densidade de tela | 1,00, 1,50, 2,00 |
| Quantidade de colunas | 2 (mínimo), 6 (típico), 12 (máximo) |
| Estado de preferências | sem preferências, preferências válidas, preferências corrompidas |
| Tema | claro, escuro, neutro |

**Combinação mínima obrigatória** para aceite: os quatro navegadores × ampliação 100% × janelas de 1280 e 1920 × quadro de 6 colunas, mais as variações de ampliação e densidade no navegador de referência (Edge) e no navegador do relato (Chrome).

## 6. Contrato de Diagnóstico

Quando a largura resolvida divergir do valor esperado, a aplicação emite um registro com prefixo estável contendo, no mínimo:

| Campo | Descrição |
|---|---|
| `columnId` | Identificador da coluna afetada |
| `expected` | Largura esperada |
| `resolved` | Largura efetivamente resolvida |
| `preference` | Preferência lida do armazenamento local, quando houver |
| `reason` | Motivo do descarte (ausente, não numérica, infinita, fora da faixa) |

Nenhum dado sensível, nenhum identificador de usuário e nenhuma telemetria remota (Constitution IV e VIII).

## 7. Itens Fora deste Contrato

- Aparência visual (cores, tipografia, sombras) — coberta pelas features de tema.
- Regras de negócio de fluxo, bloqueios e métricas — inalteradas por esta correção.
- Distribuição de espaço horizontal excedente (colunas esticando) — decisão D7 de `research.md`: permanece como está.
