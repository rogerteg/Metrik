# Capítulo 2: Um Conto de Dois Valores

## Core Idea
Todo software provê dois valores para os stakeholders: **Comportamento** (fazer o sistema funcionar e atender aos requisitos de hoje) e **Estrutura/Arquitetura** (manter o software flexível e fácil de mudar para atender aos requisitos de amanhã). A arquitetura é o valor mais importante dos dois.

## Frameworks Introduced
- **A Matriz de Eisenhower no Desenvolvimento de Software**:
  1. *Importante e Urgente*: Recursos funcionais imediatos com prazo rígido.
  2. *Importante e Não Urgente*: Arquitetura e refatoração de design limpo.
  3. *Não Importante e Urgente*: Desvios operacionais imediatistas de baixo impacto.
  4. *Não Importante e Não Urgente*: Otimizações prematuras insignificantes.
  *Regra de Ouro*: Quase todas as tarefas arquiteturais caem no Quadrante 2 (Importante, mas Não Urgente). Se os desenvolvedores não lutarem ativamente pelo Quadrante 2, o Quadrante 3 consumirá 100% do tempo.
- **O Dilema da Modificabilidade**:
  - Um programa que funciona perfeitamente, mas é impossível de modificar, torna-se inútil assim que o ambiente de negócios muda.
  - Um programa que não funciona direito hoje, mas é simples de modificar, pode ser consertado e adaptado rapidamente para sempre.

## Key Concepts
- **Soft-ware**: A palavra *soft* significa flexível, maleável. A razão de ser do software é a facilidade de mudança; torná-lo rígido é trair sua própria essência.
- **Dever Ético do Engenheiro de Software**: O time de negócios defenderá o valor comportamental (urgente); cabe aos desenvolvedores defenderem o valor estrutural (importante).

## Mental Models
- **O Edifício vs A Barraca**: Uma barraca é montada em 10 minutos mas não resiste ao vento; um edifício planejado tem fundações firmes que suportam andares adicionais sem ruir.

## Anti-patterns
- **Capitulação Passiva**: Engenheiros que aceitam qualquer prazo insano sem alertar a liderança sobre a destruição da arquitetura, gerando sistemas descartáveis em curto prazo.

## Worked Example
Ao receber a demanda de "implementar uma gambiarra urgente para fechar a venda hoje", o arquiteto negocia: "Entregaremos a funcionalidade hoje usando um limite isolado (feature flag / adaptador temporário), com débito técnico registrado para refatoração programada na próxima sprint".
