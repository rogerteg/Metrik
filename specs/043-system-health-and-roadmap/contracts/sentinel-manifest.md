# Contrato — Manifesto de Sentinela

**Feature**: `043-system-health-and-roadmap` | **Versão**: 1.0.0 | **Data**: 2026-10-07
**Consumidores**: verificação executável de consistência da feature `045` (FR-019a), revisores humanos, revalidação da visão (FR-022).
**Produtor**: [vision.md](../vision.md) §3.6.

---

## 1. Propósito

Definir a forma estável do manifesto que declara **quais arquivos invalidam quais medidas** quando alterados. Este contrato existe para que a verificação executável prevista em FR-019a possa ser escrita depois **sem renegociar o formato** — o modo de falha mais provável identificado na pré-mortem (R2).

## 2. Localização e forma

- **Local**: `specs/043-system-health-and-roadmap/vision.md`, seção `### 3.6 Validade das medidas (arquivos-sentinela)`.
- **Forma**: uma única tabela Markdown, com **exatamente três colunas**, nesta ordem.

```markdown
| Arquivo-sentinela | Por que invalida | Indicadores que invalida |
|---|---|---|
| `package.json` | Altera dependências, scripts e capacidades declaradas | Documentos × tecnologia inexistente; carga inicial |
```

## 3. Regras de cada coluna

| Coluna | Regra |
|---|---|
| `Arquivo-sentinela` | Caminho **relativo à raiz do repositório**, usando `/` como separador, **sempre entre crases**. Aceita caminho de arquivo (`vite.config.ts`), diretório (`public/`) ou conjunto descrito (contagem de diretórios em `specs/`) |
| `Por que invalida` | Explicação em uma frase de **por que** a alteração move medidas. Proibido repetir o nome do arquivo sem explicação |
| `Indicadores que invalida` | Lista de nomes de indicador **separados por ponto e vírgula (`;`)**, usando exatamente o `nome` declarado na tabela de indicadores |

## 4. Invariantes verificáveis

| # | Invariante | Como verificar |
|---|---|---|
| C1 | A tabela tem exatamente 3 colunas, com o cabeçalho nos termos acima | Contagem de separadores do cabeçalho |
| C2 | Todo caminho está entre crases e é relativo (não começa com `/`, não contém `\`, não contém `:`) | Verificação de padrão sobre a 1ª coluna |
| C3 | Todo indicador citado na 3ª coluna **existe** na tabela de indicadores da visão §7 | Comparação de conjuntos entre as duas tabelas |
| C4 | Todo indicador da visão §7 é invalidado por **ao menos uma** sentinela | Diferença de conjuntos; conjunto vazio exigido |
| C5 | Nenhum caminho aparece duas vezes | Unicidade da 1ª coluna |

> **C4 é o invariante que importa.** Um indicador que nenhuma sentinela invalida está, na prática, declarado imune ao tempo. Se essa for a intenção, ela deve estar escrita explicitamente — não pode resultar de omissão.

## 5. Extensão

- **Adicionar sentinela**: acrescentar uma linha, preservando a ordem lógica existente.
- **Adicionar indicador**: acrescentá-lo à visão §7 **e** a pelo menos uma linha deste manifesto, na mesma alteração. Um indicador sem sentinela viola C4.
- **Remover sentinela**: só é válido se C4 continuar satisfeito após a remoção.

## 6. O que este contrato NÃO define

- **Não** define o comando que executa a verificação — essa é a implementação da feature `045`.
- **Não** define política de armazenamento nem de notificação.
- **Não** substitui [data-model.md](../data-model.md) §6.2, que define a semântica dos campos; este contrato define apenas a **forma serializada** que o consumidor deve parsear.
