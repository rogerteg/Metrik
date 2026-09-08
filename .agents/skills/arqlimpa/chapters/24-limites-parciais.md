# Capítulo 24: Limites Parciais

## Core Idea
Construir fronteiras arquiteturais completas exige esforço: interfaces recíprocas de Boundary, DTOs de entrada/saída, injeção de dependência e componentes independentes. Em muitos estágios iniciais, o arquiteto pode optar pragmaticamente por **Limites Parciais** para preparar o terreno sem pagar todo o custo imediato de uma fronteira total.

## Frameworks Introduced
- **As Três Formas de Limites Parciais**:
  1. *Pule o Último Passo (Skip the Last Step)*:
     - Crie todos os componentes, interfaces de fronteira e DTOs, mas compile e implante tudo no mesmo artefato único.
     - Permite separar fisicamente mais tarde sem mexer no código.
  2. *Limites Unidimensionais (One-Dimensional Boundaries)*:
     - Manter a fronteira simples através de uma interface tradicional de Serviço (como o padrão Strategy), onde o cliente depende de uma interface e a implementação concreta é fornecida via DI, sem criar Boundaries de saída reversos complexos.
  3. *Fachadas (Facades)*:
     - Usar o padrão Facade do GoF para esconder um conjunto de serviços internos atrás de uma classe única e elegante.
     - *Alerta de Uncle Bob*: A Fachada não cria uma barreira de dependência estrutural rigorosa; programadores indisciplinados podem burlar a fachada e importar classes internas diretamente se não houver governança.

## Key Concepts
- **Fronteira Antecipatória**: Projetar o ponto de costura arquitetural antes de precisar dele fisicamente.
- **Risco de Degradação**: Limites parciais exigem vigilância constante da equipe para não serem corroídos por atalhos.

## Mental Models
- **A Linha Pontilhada no Papel**: O limite parcial é uma linha picotada; o corte físico ainda não foi feito com a tesoura, mas o local do corte já está perfeitamente marcado.

## Anti-patterns
- **YAGNI Levado ao Extremo Tóxico**: Deixar tudo completamente embolado em um único arquivo sob pretexto de "não precisamos de limites parciais agora".
