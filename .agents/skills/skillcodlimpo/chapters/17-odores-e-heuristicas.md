# Capítulo 17: Odores e Heurísticas (Smells and Heuristics)

## Core Idea
O compêndio definitivo de Uncle Bob reunindo mais de 60 "odores" de código (code smells) e heurísticas práticas acumuladas ao longo de décadas de consultoria e refatoração. Quando o código "cheira mal", uma dessas heurísticas aponta a causa e a cura.

## Frameworks Introduced
- **1. Comentários (C)**:
  - `C1`: Informação Inapropriada (dados de controle de versão ou autores no comentário).
  - `C2`: Comentário Obsoleto (comentário que não acompanhou a mudança do código).
  - `C3`: Redundância (descrever o que o código já mostra).
  - `C4`: Comentário Mal Escrito (palavras mal escolhidas, confusas).
  - `C5`: Código Comentado (apague-o imediatamente!).
- **2. Ambiente (E)**:
  - `E1`: O Build Exige Múltiplos Passos (o build deve ser executado com um único comando).
  - `E2`: Os Testes Exigem Múltiplos Passos (todos os testes de unidade devem rodar com um comando).
- **3. Funções (F)**:
  - `F1`: Excesso de Argumentos (prefira poucos argumentos, idealmente zero a dois).
  - `F2`: Argumentos de Saída (evite; se algo é transformado, retorne o valor).
  - `F3`: Argumentos Sinalizadores (Flags booleanos que dividem a função em duas).
  - `F4`: Função Morta (função que nunca é chamada; apague-a).
- **4. Gerais (G - Seleção dos Mais Críticos)**:
  - `G1`: Múltiplos Idiomas em um Arquivo (misturar HTML, JS, CSS e SQL no mesmo arquivo).
  - `G5`: Duplicação (A regra suprema DRY: Don't Repeat Yourself).
  - `G6`: Código no Nível Incorreto de Abstração (misturar conceitos de alto nível com detalhes de baixo nível).
  - `G7`: Classes Base Dependendo de Derivadas (violação do DIP).
  - `G9`: Código Morto (código inalcançável; apague-o).
  - `G14`: Inveja de Recursos (Feature Envy: método de uma classe que manipula os dados de outra classe; mova o método!).
  - `G18`: Métodos Estáticos Inapropriados (não use estático se houver chance de polimorfismo).
  - `G23`: Prefira Polimorfismo a `switch/case` ou `if/else` em cascata.
  - `G25`: Substitua Números Mágicos por Constantes Nomeadas.
  - `G28`: Encapsule Condicionais (`if (timer.hasExpired() && !timer.isRecurrent())` -> `if (shouldBeDeleted(timer))`).
  - `G29`: Evite Condicionais Negativas (`if (buffer.isEmpty())` é muito melhor que `if (!buffer.hasNoContent())`).
  - `G30`: Funções Devem Fazer Apenas Uma Coisa.
  - `G36`: Evite Navegação Transitiva (Lei de Deméter: evite `a.getB().getC().getD()`).
- **5. Nomes (N)**:
  - `N1`: Escolha Nomes Descritivos.
  - `N2`: Escolha Nomes no Nível Correto de Abstração.
  - `N4`: Nomes Não Ambíguos.
  - `N5`: Use Nomes Longos para Escopos Longos e Nomes Curtos para Escopos Curtos.
  - `N7`: Nomes Devem Descrever Efeitos Colaterais (se a função cria algo e seta um ponteiro, o nome deve refletir isso).
- **6. Testes (T)**:
  - `T1`: Testes Insuficientes (teste todos os caminhos e cenários de borda).
  - `T2`: Use Ferramentas de Cobertura de Testes.
  - `T3`: Não Pule Testes Triviais.
  - `T5`: Teste Condições de Limite (fronteiras, valores negativos, nulos, vazios).
  - `T9`: Testes Devem Ser Rápidos.

## Key Concepts
- **O Olfato do Artesão de Software**: Habilidade desenvolvida com a prática para sentir quando uma classe ou método está começando a feder (code smell) antes que cause um incidente em produção.

## Mental Models
- **A Tabela Periódica dos Maus Hábitos**: Um mapa completo de diagnóstico rápido que permite a qualquer desenvolvedor apontar com precisão cirúrgica a deficiência de uma linha de código.
