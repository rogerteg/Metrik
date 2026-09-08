# Capítulo 4: Comentários

## Core Idea
**Não comente código ruim — reescreva-o** (Kernighan e Plauger). O uso adequado de comentários visa compensar nosso fracasso em nos expressar através do código. Comentários mentem: não porque os programadores sejam desonestos, mas porque o código evolui e é refatorado, enquanto os comentários raramente são atualizados, tornando-se guias obsoletos e enganosos.

## Frameworks Introduced
- **Bons Comentários (Raros e Legítimos)**:
  1. *Comentários Legais*: Direitos autorais e licenças exigidas por compliance corporativo.
  2. *Comentários Informativos*: Explicar o formato de uma expressão regular ou valor de retorno de API externa opaca.
  3. *Explicação de Intenção*: Explicar *por que* uma decisão incomum foi tomada (ex: escolha de algoritmo contra uma restrição de memória conhecida).
  4. *Alerta de Consequências*: Avisar outros desenvolvedores sobre custos severos (ex: `// Não execute este teste em ambiente sem VPN`).
  5. *Comentários TODO*: Lembretes de trabalho pendente com identificador de quem fez e data/ticket.
  6. *Amplificação*: Destacar a importância crítica de uma linha que parece insignificante.
- **Maus Comentários (A Maioria Esmagadora)**:
  - *Murmúrios e Monólogos*: Comentários que só o autor entende na hora da escrita.
  - *Comentários Redundantes*: Descrever exatamente o que o código já mostra:
    ```java
    // Retorna o nome do cliente
    public String getCustomerName() { return this.customerName; }
    ```
  - *Comentários Enganosos*: Dizer que a função faz A quando na verdade faz A e B.
  - *Comentários Mandatórios (JavaDoc burocrático)*: Exigir comentário em todo getter/setter de projeto.
  - *Registros de Histórico/Changelog*: Listas de modificações e autores no topo do arquivo (isso é dever do Git!).
  - *Código Comentado*: **Nunca comente código morto**. Apague-o sem medo; o histórico do controle de versão preservará o código para sempre se você precisar dele.

## Key Concepts
- **Autoexpressividade**: O esforço gasto escrevendo um comentário longo deve ser redirecionado para criar uma função ou variável bem nomeada que torne o comentário redundante.

## Mental Models
- **A Placa de Perigo na Estrada**: Se você precisa de uma placa avisando "Cuidado: curva cega com buraco escondido", o correto é consertar a estrada; a placa é apenas um paliativo temporário.

## Anti-patterns
- **Código Zombie Comentado**: Blocos de 80 linhas comentadas no meio do código com a justificativa "vai que a gente precisa um dia". Ninguém tem coragem de apagar e a base de código apodrece.
