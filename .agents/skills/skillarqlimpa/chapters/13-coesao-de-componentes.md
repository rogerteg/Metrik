# Capítulo 13: Coesão de Componentes

## Core Idea
Quais classes devem pertencer a quais componentes? A coesão de componentes é regida por três princípios essenciais que vivem em uma tensão constante entre si: **REP**, **CCP** e **CRP**.

## Frameworks Introduced
- **Os Três Princípios de Coesão de Componentes**:
  1. **REP (Release/Reuse Equivalency Principle - Princípio da Equivalência do Reúso/Release)**:
     - *A unidade de reúso é a unidade de release.*
     - Classes e módulos que são reutilizados juntos devem ser versionados, rastreados e lançados juntos sob um número de versão compartilhado.
  2. **CCP (Common Closure Principle - Princípio do Fechamento Comum)**:
     - *O SRP dos componentes*: Reúna em um mesmo componente as classes que mudam pelas mesmas razões e no mesmo momento. Separe classes que mudam por razões diferentes.
     - Minimiza o número de componentes afetados por uma mudança de requisito.
  3. **CRP (Common Reuse Principle - Princípio do Reúso Comum)**:
     - *O ISP dos componentes*: Não force os usuários de um componente a depender de coisas de que não precisam.
     - Se um cliente depende de um componente, ele provavelmente usará todas as classes daquele componente. Se não usa, separe-as.
- **O Diagrama de Tensão de Coesão de Componentes (Triângulo de Tensão)**:
  - O lado REP e CCP favorece a inclusão de classes (componentes maiores, mais fáceis de desenvolver).
  - O lado CRP favorece a divisão de classes (componentes menores, mais fáceis de reutilizar sem dependências desnecessárias).
  - *Equilíbrio Dinâmico*: No início de um projeto, a equipe prioriza o CCP (facilidade de desenvolvimento e fechamento comum); à medida que o sistema amadurece, a ênfase migra para REP e CRP (reutilização e estabilidade de releases).

## Key Concepts
- **Triângulo de Tensão**: Equilíbrio arquitetural entre facilidade de manutenção (CCP) e facilidade de reúso (REP/CRP).
- **Sobrecarga de Release**: Custo operacional de gerar releases de dezenas de microcomponentes super-fracionados.

## Mental Models
- **A Mala de Viagem**: Se você colocar tudo dentro de uma única mala gigante (CCP excessivo), ela fica pesada demais para carregar; se levar 10 pequenas nécessaires separadas (CRP excessivo), você perde tempo gerenciando cada uma.

## Anti-patterns
- **Pacotes Baseados em Tipos Técnicos**: Agrupar todas as entidades em `entities/`, todos os repositórios em `repositories/` e todos os controllers em `controllers/`, forçando qualquer mudança de funcionalidade a editar todos os pacotes do sistema (violação direta do CCP).
