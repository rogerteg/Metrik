# Capítulo 3: Funções

## Core Idea
A primeira regra para funções: **elas devem ser pequenas**. A segunda regra: **elas devem ser ainda menores que isso**. Funções devem fazer apenas uma coisa, devem fazê-la bem e devem fazer apenas ela.

## Frameworks Introduced
- **A Regra Decrescente (The Stepdown Rule)**:
  O código deve ser lido de cima para baixo como um conjunto de parágrafos TO (PARA):
  - *Para incluir o relatório, nós verificamos a autorização e depois calculamos os totais.*
  - *Para verificar a autorização, nós checamos o token de sessão.*
  - *Para calcular os totais, nós somamos os itens da fatura.*
  Cada função leva o leitor para o próximo degrau de abstração logo abaixo dela.
- **Quantidade de Argumentos de Função**:
  - *0 argumentos (Míade / Niládica)*: O ideal supremo. Fácil de entender e testar.
  - *1 argumento (Mônade)*: Muito bom para consultas (`fileExists("f")`) ou transformações (`fileOpen("f")`).
  - *2 argumentos (Díade)*: Aceitável para coordenadas naturais (`Point(x, y)`), mas confuso para parâmetros sem ordenação natural.
  - *3 argumentos (Tríade)*: Exige esforço mental dobrado; evite se possível.
  - *4+ argumentos (Poliádica)*: Sinal vermelho; agrupe os argumentos em um objeto de configuração/parâmetros.
- **Argumentos de Sinalizador (Flag Arguments)**:
  Passar um booleano como argumento (`render(is_suite: bool)`) é uma violação do princípio de fazer uma coisa só: a função faz uma coisa se for `true` e outra se for `false`. Divida em duas funções: `render_suite()` e `render_single_page()`.
- **Separação Comando-Consulta (Command Query Separation - CQS)**:
  Funções devem mudar o estado de um objeto OU retornar informações sobre ele, mas nunca ambos. Ex: `if (set("username", "unclebob"))` é horrível; separe em `if (attribute_exists("username")) set_attribute("username", "unclebob")`.
- **Prefira Exceções a Códigos de Erro**:
  Retornar códigos de erro força o chamador a aninhar condicionais profundas de checagem. Use exceções e isole o bloco `try-catch` em uma função dedicada.
- **DRY (Don't Repeat Yourself)**:
  A duplicação de algoritmos é a raiz de todos os males do software; elimine-a com herança, composição ou funções utilitárias.

## Key Concepts
- **Funções de Responsabilidade Única**: Uma função faz apenas uma coisa se você não conseguir extrair significativamente outra função dela sem simplesmente reescrever a implementação.
- **Efeitos Colaterais (Side Effects)**: Funções que prometem fazer uma coisa, mas fazem alterações ocultas em variáveis globais ou de sessão.

## Mental Models
- **A Linha de Montagem Automatizada**: Cada operário na esteira parafusa apenas uma porca; se ele tentar parafusar, pintar a porta e polir o vidro ao mesmo tempo, a fábrica engargala.

## Anti-patterns
- **Argumentos de Saída**: Passar um objeto para a função modificar seu estado como forma de retorno (`transform(input, output)`). Se a função transforma algo, ela deve retornar o resultado transformado (`output = transform(input)`).
