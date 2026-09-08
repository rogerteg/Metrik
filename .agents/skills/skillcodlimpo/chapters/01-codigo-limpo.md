# Capítulo 1: Código Limpo

## Core Idea
O código limpo é elegante, direto, fácil de ler e fácil de alterar. Ele nunca esconde a intenção do desenvolvedor sob uma névoa de abstrações desnecessárias ou atalhos descuidados. O custo de manter código ruim cresce exponencialmente até paralisar a capacidade de inovação de uma organização.

## Frameworks Introduced
- **A Lei de LeBlanc**:
  *Mais tarde é igual a nunca (Later equals never).* O código temporário ou atalho feio feito na pressa se tornará a armadilha permanente do sistema se não for refatorado imediatamente.
- **A Regra do Escoteiro (The Boy Scout Rule)**:
  *Deixe a área de acampamento mais limpa do que como você a encontrou.* Se todos os desenvolvedores fizerem um pequeno ajuste de limpeza a cada commit, o código não apodrece.
- **Definições dos Mestres sobre Código Limpo**:
  - *Bjarne Stroustrup (criador do C++)*: Elegante e eficiente. A lógica deve ser direta para dificultar o esconderijo de bugs; dependências mínimas; tratamento completo de erros conforme uma estratégia articulada.
  - *Grady Booch (autor de Object Oriented Analysis and Design)*: Simples e direto. Parece uma prosa bem escrita; nunca obscurece a intenção do designer.
  - *"Big" Dave Thomas (fundador da OTI)*: Pode ser lido e melhorado por qualquer desenvolvedor. Possui testes de unidade e aceitação; tem nomes significativos.
  - *Michael Feathers (autor de Working Effectively with Legacy Code)*: Sempre parece que foi escrito por alguém que se importava. Não há nada óbvio que você possa fazer para melhorá-lo.
  - *Ward Cunningham (inventor do Wiki e Extreme Programming)*: Quando cada rotina que você lê acaba sendo exatamente aquilo que você esperava.

## Key Concepts
- **A Proporção Leitura vs Escrita**: Desenvolvedores gastam 10 vezes mais tempo lendo código antigo para entender o contexto do que digitando linhas novas. Tornar a leitura fácil acelera a escrita.
- **A Podridão do Software**: O acúmulo gradual de pequenas concessões que destrói a produtividade da equipe.

## Mental Models
- **A Janela Quebrada (Broken Windows Theory)**: Um prédio com uma janela quebrada abandonada logo terá todas as outras janelas quebradas; uma linha de código relaxada autoriza a proliferação da desordem.

## Anti-patterns
- **Engenharia de Desculpas**: Culpar o cliente ou o gerente de produto pela baixa qualidade do código; zelar pela qualidade é responsabilidade estrita dos desenvolvedores profissionais.
