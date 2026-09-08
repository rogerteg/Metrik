# Capítulo 9: Testes de Unidade

## Core Idea
O código de teste é tão importante quanto o código de produção: ele não é um cidadão de segunda classe. Testes sujos, lentos e difíceis de manter são piores do que não ter testes, pois amarram a evolução do código de produção até que a equipe seja forçada a desativar a suíte inteira. Testes limpos mantêm o código de produção flexível, sustentável e seguro contra regressões.

## Frameworks Introduced
- **As Três Leis do TDD (Desenvolvimento Guiado por Testes)**:
  1. *Primeira Lei*: Você não tem permissão para escrever nenhum código de produção até que tenha escrito um teste de unidade que falhe.
  2. *Segunda Lei*: Você não tem permissão para escrever mais de um teste de unidade do que o suficiente para falhar (não compilar é falhar).
  3. *Terceira Lei*: Você não tem permissão para escrever mais código de produção do que o suficiente para fazer o teste que está falhando passar.
- **Mantendo os Testes Limpos (A Regra da Clareza)**:
  - O que torna um teste limpo? **Legibilidade, legibilidade e legibilidade**.
  - Evite detalhes de implementação irrelevantes nos testes; use uma Linguagem Específica de Domínio (DSL) de teste para expressar claramente a intenção.
- **O Padrão AAA (Arrange, Act, Assert / Dado, Quando, Então)**:
  Cada teste deve ser dividido em três partes visuais distintas:
  1. *Arrange (Dado)*: Construa os dados e o estado inicial do teste.
  2. *Act (Quando)*: Execute a operação de negócio a ser testada.
  3. *Assert (Então)*: Verifique se o resultado atende à expectativa.
- **Um Conceito por Teste**:
  Em vez da regra ingênua de "um único assert por teste", a regra de ouro é: **um único conceito por método de teste**. Teste um único comportamento de negócio sem encadear múltiplos cenários em um teste gigante.
- **As 5 Regras F.I.R.S.T.**:
  - **F (Fast - Rápido)**: Testes devem rodar em milissegundos; testes lentos não são executados com frequência.
  - **I (Independent - Independente)**: Nenhum teste deve depender da execução ou do estado deixado por outro teste.
  - **R (Repeatable - Repetível)**: Devem passar em qualquer ambiente (na máquina local, no servidor de CI, no trem sem internet).
  - **S (Self-Validating - Autovalidável)**: O teste retorna um booleano simples (Passou ou Falhou); o desenvolvedor não deve ter que inspecionar logs para saber o resultado.
  - **T (Timely - Oportuno)**: Testes de unidade devem ser escritos imediatamente antes do código de produção que os faz passar.

## Key Concepts
- **Red-Green-Refactor**: O ciclo contínuo de TDD.
- **Testes como Documentação Executável**: A melhor documentação de como usar uma classe são seus testes unitários limpos.

## Mental Models
- **A Rede de Trapézio do Circo**: Os testes são a rede de segurança; com uma rede firme embaixo, o trapezista (desenvolvedor) tem coragem de dar saltos triplos mortais (grandes refatorações) sem medo de se espatifar no chão.

## Anti-patterns
- **Testes Mentirosos e Frágeis**: Testes que dependem de ordem de execução alfabética ou que quebram quando o relógio do sistema muda de fuso.

## Worked Example
```python
# Teste Limpo com AAA e Alta Expressividade
def test_deve_aplicar_desconto_de_dez_porcento_para_compras_acima_de_quinhentos_reais():
    # Arrange (Dado)
    carrinho = CarrinhoDeCompras()
    carrinho.adicionar(item="Notebook", preco=600.0)

    # Act (Quando)
    total_com_desconto = carrinho.calcular_total()

    # Assert (Então)
    assert total_com_desconto == 540.0
```
