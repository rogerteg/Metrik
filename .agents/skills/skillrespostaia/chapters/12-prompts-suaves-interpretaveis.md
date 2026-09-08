# Capítulo 12: Prompts Suaves Interpretáveis (Interpretable Soft Prompts)

## Core Idea
Prompts suaves interpretáveis utilizam restrições semânticas graduais, completude contextual guiada e estímulos flexíveis para modular o estilo, o tom e a direção do texto sem engessar a inventividade e a fluidez do modelo.

## Frameworks Introduced
- **Fórmula de Completude Guiada**:
  `Complete a seguinte declaração/ideia [inserir início] assegurando que o desenvolvimento mantenha o tom [especificar tom suave] e explore os temas de [especificar temas].`
- **Diretrizes de Modulação Suave**:
  - Em vez de regras rígidas ("use exatamente 10 adjetivos"), prefira orientações direcionais ("prefira construções ativas e evite passividade excessiva").
  - Use analogias conceituais ("escreva com a clareza de Carl Sagan explicando astrofísica para adolescentes").

## Key Concepts
- **Soft Prompting em Linguagem Natural**: Estímulos sutis que afetam o vetor de atenção do modelo sem criar bloqueios rígidos de geração.
- **Equilíbrio entre Controle e Criatividade**: Preservar a capacidade do modelo de formular conexões ricas mantendo a consistência do estilo desejado.

## Mental Models
- **O Leve Toque no Volante**: Em vez de frear ou puxar o freio de mão bruscamente, o prompt suave apenas inclina a trajetória do modelo na direção desejada.

## Anti-patterns
- **Hiper-Restrição Asfixiante**: Criar tantas regras microscópicas que o texto final resultante pareça robótico e sem ritmo natural.

## Worked Example
**Completude de Abertura de Palestra**:
```text
Complete a abertura de palestra abaixo mantendo um tom inspirador, reflexivo e acessível:

"Durante décadas, acreditamos que a inteligência era uma prerrogativa exclusiva da biologia humana. No entanto, quando olhamos para a velocidade com que os modelos de linguagem aprendem a decifrar a nossa própria história..."

Diretriz suave: Desenvolva o raciocínio conectando tecnologia, empatia e o futuro do trabalho em mais 2 parágrafos envolventes.
```
