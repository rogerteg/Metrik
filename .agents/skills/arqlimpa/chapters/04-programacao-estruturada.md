# Capítulo 4: Programação Estruturada

## Core Idea
Edsger Dijkstra demonstrou que o desvio irrestrito (`goto`) impedia a decomposição formal de programas em estruturas lógicas verificáveis. A programação estruturada substitui o caos por blocos de construção elementares (Sequência, Seleção e Iteração), permitindo que programas sejam decompostos hierarquicamente e testados empiricamente.

## Frameworks Introduced
- **Estruturas de Controle Universais de Böhm e Jacopini**:
  Qualquer algoritmo computável pode ser expresso através de três mecanismos exclusivos:
  1. *Sequência* (`declaração 1; declaração 2;`)
  2. *Seleção* (`if / else`)
  3. *Iteração* (`while / for`)
- **Decomposição Funcional Top-Down**:
  A divisão de um problema de grande escala em funções de nível inferior até que cada procedimento se torne atômico e transparente.
- **A Falseabilidade Popperiana do Teste**:
  Testes automatizados **nunca provam que o código está livre de bugs**; eles apenas provam que os cenários testados ainda não falharam. A programação estruturada garante que o código seja decomponível em unidades falseáveis.

## Key Concepts
- **Modularidade Algorítmica**: Cada bloco de código deve possuir um único ponto de entrada e um único ponto de saída.
- **Testabilidade por Prova Empírica**: A eliminação do `goto` tornou os testes unitários modernos matematicamente viáveis.

## Mental Models
- **A Ponte Científica**: A física não prova que uma lei é absoluta; ela tenta derrubar a hipótese e se falha, a teoria se sustenta. Da mesma forma, um teste unitário tenta quebrar o software; se falha em quebrar, confiamos no módulo.

## Anti-patterns
- **Spaghetti Code Moderno**: Longas sequências de métodos com centenas de linhas, saídas prematuras desordenadas e variáveis globais compartilhadas imitando o comportamento caótico do `goto`.

## Worked Example
Refatoração de um método procedural de 400 linhas com múltiplos `breaks`, `returns` e condicionais aninhadas em três funções puras e coesas: `validar_elegibilidade()`, `calcular_taxa()` e `emitir_recibo()`.
