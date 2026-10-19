# Contrato — Evidência de Validação

**Feature**: `043-system-health-and-roadmap` | **Versão**: 1.0.0 | **Data**: 2026-10-07
**Consumidores**: auditoria de FR-019b, revisores de PR das features corretivas, revalidação da visão.
**Produtores**: as features corretivas que executam verificação não automatizável — hoje prevista como `045-rewrite-project-readme`.
**Requisito de origem**: FR-019(b), com o Princípio III da constituição (inspeção manual não constitui verificação).

---

## 1. Propósito

Padronizar o registro que comprova uma verificação que **não pode ser automatizada**. Existir um formato comum é o que permite comparar evidências entre execuções e auditar a afirmação "a documentação descreve o produto real" (SC-006) sem depender do julgamento de quem a escreveu.

**Fronteira explícita**: este contrato define a **forma**, não os testes. Conforme FR-019, a verificação é sempre **dupla** — uma parte automatizada e uma parte registrada. A parte automatizada é uma verificação executável da suíte; apenas a parte não automatizável usa este contrato.

## 2. Localização

- **Forma**: definida aqui.
- **Instância**: gravada no diretório da feature que executa a verificação — `specs/<feature-corretiva>/evidence/<slug>.md`.
- **Esta feature não grava instância alguma** (FR-017 restringe seu conjunto de artefatos; decisão R3).

## 3. Forma canônica

```markdown
## Evidência de Validação — <verificação>

- **Verificação associada**: <requisito ou critério de sucesso>
- **Data**: <AAAA-MM-DD>
- **Método**: <como foi avaliado>
- **Executor**: <identificação>
- **Qualificação do executor**: <declaração de ausência de conhecimento prévio do projeto>
- **Resultado observado**: <o que foi encontrado, conforme observado>

### Entendimento registrado

<O que o executor escreveu, com as próprias palavras, ao descrever o produto lendo
apenas os documentos. Deve ser transcrito, não resumido pelo autor da correção.>

### Divergências encontradas

<Cada divergência, com o documento e o comportamento real que a contradiz.
Lista vazia explícita ("nenhuma") quando não houver.>
```

## 4. Invariantes verificáveis

| # | Invariante | Como verificar |
|---|---|---|
| C1 | Os sete campos obrigatórios estão presentes e não vazios | Presença de cada rótulo em negrito |
| C2 | `Data` está em formato ISO e é **anterior ou igual** à data de encerramento da feature corretiva | Comparação de datas |
| C3 | `Qualificação do executor` declara explicitamente a ausência de conhecimento prévio, ou declara que houve conhecimento prévio e por que a evidência ainda é válida | Leitura do campo; campo vazio reprova |
| C4 | O entendimento registrado é uma **transcrição** do executor, não um resumo do autor | O texto não repete a redação dos documentos nem usa a terminologia interna do projeto |
| C5 | A seção de divergências existe, com lista explícita ou a palavra "nenhuma" | Presença da seção |
| C6 | O resultado é o que foi **observado**, não a conclusão pretendida | Ausência de afirmações de sucesso não sustentadas pelas seções anteriores |

**C3 e C4 são os invariantes que importam.** Sem C3, quem escreveu a documentação pode se auto-validar — que é exatamente o modo de falha que produziu o README atual. Sem C4, o registro degenera em um resumo da própria documentação, provando nada.

## 5. Relação com a parte automatizada

| Parte | Natureza | Onde é comprovada |
|---|---|---|
| (a) Consistência de tecnologia | Verificação executável — reprova quando a documentação cita tecnologia ausente das dependências reais, ou omite tecnologia presente nelas | Na suíte automatizada, criada pela feature corretiva |
| (b) Finalidade e capacidades | Não automatizável — julgamento humano | **Este contrato** |

A parte (a) **não** é registrada aqui: uma verificação executável cuja evidência é um texto deixa de ser executável. Se a parte (a) falhar, o gate é a suíte, não este registro.

## 6. O que este contrato NÃO define

- **Não** define quem deve ser o executor nomeado, além de exigir que sua qualificação seja declarada.
- **Não** define limiar de aprovação — o critério é o de SC-006, e a decisão de aceitar pertence ao revisor da feature corretiva.
- **Não** substitui o julgamento do revisor: uma evidência conforme ao formato pode ainda assim ser rejeitada se o entendimento registrado revelar divergência não tratada.
