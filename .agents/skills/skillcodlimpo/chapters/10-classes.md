# Capítulo 10: Classes

## Core Idea
Assim como as funções, a primeira regra das classes é que **elas devem ser pequenas**, e a segunda regra é que **elas devem ser menores ainda**. Enquanto funções são medidas por linhas de código, classes são medidas por **responsabilidades**. Uma classe deve ter alta coesão e apenas uma razão para mudar (SRP).

## Frameworks Introduced
- **Organização Padrão de Classes**:
  1. Constantes públicas estáticas.
  2. Variáveis estáticas privadas.
  3. Variáveis de instância privadas.
  4. Métodos públicos.
  5. Métodos utilitários privados imediatamente abaixo do método público que os chamou.
  *(Quase nunca deve haver variáveis públicas).*
- **O Princípio da Responsabilidade Única (SRP em Classes)**:
  - O nome da classe deve descrever o que ela faz. Se você não conseguir atribuir um nome preciso em menos de 25 caracteres sem usar termos vagos como `Manager`, `Processor` ou `Super`, a classe provavelmente tem responsabilidades demais.
  - Teste da Descrição: Se a descrição da classe contiver as palavras "se", "e", "ou" ou "mas", ela viola o SRP.
- **Coesão de Classes**:
  - Uma classe possui alta coesão quando um grande número de seus métodos manipula a maioria de suas variáveis de instância.
  - Quando você percebe que um subconjunto de métodos só manipula um subconjunto de variáveis, uma nova classe está pedindo para nascer: extraia essas variáveis e métodos para uma classe separada.
- **Organizando para Mudanças (OCP & DIP)**:
  - Estruture a classe para que novos requisitos sejam atendidos adicionando novas subclasses polimórficas, e não editando o código testado da classe existente.

## Key Concepts
- **Coesão Máxima**: O grau de afinidade entre os métodos e os dados da classe.
- **Separação de Preocupações**: Isolar regras que mudam em momentos e por motivos diferentes.

## Mental Models
- **A Caixa de Ferramentas Organizada**: Em vez de uma gaveta funda e pesada onde chaves de fenda, martelos e pregos ficam misturados (God Class), gavetas pequenas e etiquetadas guardam apenas o conjunto específico de soquetes de 10mm.

## Anti-patterns
- **The God Class (A Classe Todo-Poderosa)**: Uma classe com 3.000 linhas e 50 métodos que controla todo o fluxo do sistema.
