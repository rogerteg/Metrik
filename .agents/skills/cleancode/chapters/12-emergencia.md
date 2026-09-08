# Capítulo 12: Emergência

## Core Idea
Como saber se um design é bom? Kent Beck formulou as **Quatro Regras de Design Simples**, que garantem que um design de software de alta qualidade emerja naturalmente da aplicação disciplinada de boas práticas.

## Frameworks Introduced
- **As 4 Regras de Design Simples de Kent Beck (Em Ordem de Prioridade)**:
  1. **Executa todos os testes**:
     - Um sistema que não pode ser testado não é verificável; um sistema não verificável nunca deve ser implantado.
     - A própria busca por testabilidade força o sistema a ter classes pequenas e acoplamento fraco (DIP).
  2. **Não contém duplicação (No Duplication / DRY)**:
     - Duplicação é a arqui-inimiga de um sistema flexível. Duplicação de código gera manutenção duplicada e bugs de omissão.
     - Aplique Template Method ou Strategy para eliminar duplicações sutis em algoritmos semelhantes.
  3. **Expressa a intenção do desenvolvedor**:
     - O código deve ser cristalino. Escolha bons nomes, mantenha funções curtas e use padrões de projeto bem conhecidos (como State, Factory, Visitor) para comunicar intenção imediatamente.
  4. **Minimiza o número de classes e métodos**:
     - O contrapeso pragmático contra o excesso de dogmatismo: não crie 50 interfaces e microrotinas sem necessidade real só para seguir uma regra cega.
- **O Papel da Refatoração Contínua**:
  - Assim que os testes estiverem passando (Regra 1), você tem a licença para refatorar: eliminar duplicação (Regra 2), melhorar a expressividade (Regra 3) e podar classes redundantes (Regra 4) sem medo de quebrar o sistema.

## Key Concepts
- **Design Emergente**: O design não precisa ser perfeito no dia 1; ele melhora a cada ciclo de refatoração sustentado por testes automatizados.

## Mental Models
- **A Lapidação do Diamante**: Primeiro encontra-se a pedra bruta que resiste ao corte (testes passando); depois lapida-se faceta por faceta (eliminar duplicações e expressar intenção) até que o brilho do design emerja.

## Anti-patterns
- **Engenharia Excessiva (Overengineering)**: Criar 4 camadas de abstração, fábricas abstratas de fábricas e decorators para um formulário que grava 2 campos em um arquivo de texto.
