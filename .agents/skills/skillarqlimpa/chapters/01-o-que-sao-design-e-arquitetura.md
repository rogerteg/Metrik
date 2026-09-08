# Capítulo 1: O Que São Design e Arquitetura?

## Core Idea
Não há diferença real entre design e arquitetura; 'arquitetura' costuma ser usada no contexto de decisões de alto nível, enquanto 'design' refere-se a decisões de nível inferior, mas ambas formam uma malha contínua. O objetivo supremo da arquitetura de software é **minimizar o esforço humano necessário para construir e manter o sistema**.

## Frameworks Introduced
- **A Medida da Qualidade do Design**:
  A qualidade de uma arquitetura é medida pelo custo de esforço por linha de código/funcionalidade ao longo do tempo. Se cada nova funcionalidade exige mais programadores e mais tempo, a arquitetura está falhando.
- **A Curva do Esforço e Produtividade**:
  Projetos sem arquitetura começam rápidos (alta produtividade inicial), mas logo atingem um platô onde 100% da energia da equipe é gasta apagando incêndios e gerenciando a bagunça em vez de entregar novos recursos.
- **A Mentira de Fazer Rápido Agora para Limpar Depois**:
  Fazer código rápido e sujo sob pretexto de velocidade de mercado é uma ilusão comprovada: a única maneira de andar rápido é fazer bem feito desde o início (*The only way to go fast, is to go well*).

## Key Concepts
- **Design vs Arquitetura**: Contínuo inseparável de decisões que conectam os detalhes de baixo nível com as estruturas de alto nível.
- **Custo de Mudança**: Métrica definitiva da saúde de um software corporativo.
- **Dívida Técnica Arquitetural**: O encarecimento exponencial de manutenções decorrente de atalhos e acoplamento descontrolado.

## Mental Models
- **A Lebre e a Tartaruga**: O desenvolvimento descuidado corre nos primeiros meses como a lebre, mas tropeça na própria complexidade; a disciplina arquitetural da tartaruga mantém velocidade de cruzeiro constante por anos.

## Anti-patterns
- **Engenharia de Esperança ('Limpamos no V2')**: Acreditar que a equipe terá tempo para reescrever o sistema mais tarde; na prática, o V1 dita o mercado e o refactoring nunca é priorizado.

## Worked Example
**Auditoria de Produtividade da Equipe**:
Se uma equipe de 8 desenvolvedores entregava 10 histórias de usuário por sprint no ano 1, e no ano 3 uma equipe de 24 desenvolvedores entrega apenas 4 histórias por sprint com dezenas de bugs de regressão, o sistema sofre de podridão arquitetural (colapso de produtividade).
