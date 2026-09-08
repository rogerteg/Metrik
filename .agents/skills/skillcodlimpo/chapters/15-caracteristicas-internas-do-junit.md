# Capítulo 15: Características Internas do JUnit

## Core Idea
Através da dissecação e refatoração da classe `ComparisonCompactor` do framework JUnit (escrita originalmente por Kent Beck e Erich Gamma), Uncle Bob ensina como analisar criticamente código profissional de alto calibre, aplicando a Regra do Escoteiro para deixá-lo ainda mais claro, enxuto e expressivo.

## Frameworks Introduced
- **Etapas de Lapidação de uma Classe Real**:
  1. *Eliminação de Prefixos Desnecessários*: Remover `f` de membros (`fExpected` vira `expected`).
  2. *Encapsulamento de Condicionais*: Trocar checagens arcaicas de ponteiro nulo por predicados expressivos (`shouldNotCompact()`).
  3. *Inversão de Condicionais Negativas*: Trocar `if (!canCompact())` por `if (canCompact())` para facilitar a leitura cognitiva.
  4. *Extração de Métodos com Nomes Intencionais*: Separar o cálculo de prefixos e sufixos comuns em métodos distintos que contam a história da compactação de strings.
  5. *Separação de Preocupações de Formatação*: Não misturar o algoritmo de busca de diferenças com a geração das strings formatadas com colchetes `[...]`.

## Key Concepts
- **Respeito pelo Código Existente**: Entender a intenção dos autores originais antes de propor alterações.
- **Polimento Estético Contínuo**: A busca incessante por nomes que tornem o algoritmo autoevidente.

## Mental Models
- **A Restauração de uma Pintura Clássica**: O restaurador remove com cuidado o verniz amarelado e a poeira acumulada para revelar as cores vivas e a intenção pura do mestre pintor.

## Anti-patterns
- **Refatoração sem Cobertura de Teste**: Tentar alterar a lógica interna de uma classe crítica sem ter uma suíte de testes com 100% de cobertura dos casos de borda.
