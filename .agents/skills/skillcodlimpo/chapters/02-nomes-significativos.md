# Capítulo 2: Nomes Significativos

## Core Idea
Nomes estão em toda parte no software: variáveis, funções, argumentos, classes e pacotes. Escolher bons nomes exige cuidado e empatia com o próximo leitor; um bom nome economiza horas de exploração mental e revela a intenção sem necessidade de comentários explicativos.

## Frameworks Introduced
- **As Regras de Ouro da Nomenclatura**:
  1. **Use Nomes que Revelem a Intenção**: Se um nome exige um comentário para explicar o que armazena, ele falhou. (Ex: `d` vs `dias_desde_a_modificacao`).
  2. **Evite Desinformação**: Não use `accountList` se o objeto não for uma `List` (use `accountGroup` ou `accounts`); evite nomes com diferenças sutis como `XYZControllerForEfficientHandlingOfStrings` vs `XYZControllerForEfficientStorageOfStrings`.
  3. **Faça Distinções Significativas**: Evite palavras-ruído como `data`, `info`, `the`, `variable` (qual a diferença entre `ProductData`, `ProductInfo` e `Product`?).
  4. **Use Nomes Pronunciáveis e Localizáveis**: Nomes devem poder ser falados em conversas de equipe (`genymdhms` é horrível; `generation_timestamp` é claro).
  5. **Evite Mapeamentos Mentais e Notação Húngara**: O leitor não deve precisar traduzir mentalmente `r` para `registro` ou `m_` para membro de classe; com IDEs modernas, prefixos de tipo são desnecessários.
  6. **Nomes de Classes vs Métodos**:
     - *Classes e Objetos*: Substantivos ou frases nominais (`Customer`, `WikiPage`, `Account`). Evite termos vagos como `Manager`, `Processor`, `Data`.
     - *Métodos*: Verbos ou frases verbais (`postPayment`, `deletePage`, `save`). Getters, setters e predicates prefixados com `get`, `set` e `is`.
  7. **Uma Palavra por Conceito Abstrato**: Escolha uma palavra consistente para a mesma ação: não misture `fetch`, `retrieve` e `get` em classes diferentes para a mesma operação.

## Key Concepts
- **Revelação de Intenção**: O nome responde: por que existe, o que faz e como é usado.
- **Domínio da Solução vs Domínio do Problema**: Use termos de ciência da computação (algoritmos, padrões) para quem programa (`JobQueue`, `AccountFactory`) e termos de negócio para o domínio (`TaxPayer`, `ClaimLedger`).

## Mental Models
- **A Placa de Trânsito**: Ninguém quer parar o carro na estrada para decifrar uma placa com siglas misteriosas; ela deve ser legível a 100 km/h.

## Anti-patterns
- **Nomes Engraçadinhos**: Usar piadas internas como `holyHandGrenade()` para uma função que deleta itens.
- **Variáveis de Uma Letra Fora de Loops Minúsculos**: Usar `x`, `temp`, `res` em funções de mais de 5 linhas.

## Worked Example
```python
# Código Ruim (Sem intenção revelada)
def get_them(the_list):
    list1 = []
    for x in the_list:
        if x[0] == 4:
            list1.append(x)
    return list1

# Código Limpo (Com nomes reveladores de intenção e domínio)
STATUS_FLAG_INDEX = 0
FLAGGED = 4

def get_flagged_cells(game_board: list[list[int]]) -> list[list[int]]:
    flagged_cells = []
    for cell in game_board:
        if cell[STATUS_FLAG_INDEX] == FLAGGED:
            flagged_cells.append(cell)
    return flagged_cells
```
