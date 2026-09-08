# Capítulo 3: Panorama dos Paradigmas

## Core Idea
Os três grandes paradigmas de programação (Estruturada, Orientada a Objetos e Funcional) não foram criados para nos dar novas capacidades, mas sim para **nos tirar poderes**: cada paradigma remove uma liberdade perigosa que os programadores costumavam ter.

## Frameworks Introduced
- **A Tríade de Restrições dos Paradigmas**:
  1. **Programação Estruturada (1968)**: Remove o desvio incondicional (`goto`), impondo disciplina sobre o *controle de fluxo*.
  2. **Programação Orientada a Objetos (1966)**: Remove os ponteiros de função indiretos manuais, impondo disciplina sobre a *atribuição de dependência e controle polimórfico*.
  3. **Programação Funcional (1936 / Lisp 1958)**: Remove a *atribuição de variáveis mutáveis*, impondo disciplina sobre o *estado e a mutabilidade*.
- **O Limite dos Paradigmas**:
  Não surgiram novos paradigmas fundamentais desde os anos 1970; qualquer arquitetura moderna é a combinação rigorosa de polimorfismo nas fronteiras, fluxo estruturado nos algoritmos e imutabilidade no núcleo dos dados.

## Key Concepts
- **Restrição como Segurança**: Quanto mais restrições arquiteturais bem calibradas um sistema impõe, mais previsível e auditável ele se torna.

## Mental Models
- **A Corrente de Proteção**: Em vez de dar ao desenvolvedor uma motosserra sem trava, os paradigmas colocam travas de segurança que impedem o corte acidental dos próprios pés.

## Anti-patterns
- **Achar que Paradigmas se Anulam**: Tratar OO e Programação Funcional como inimigas, quando na verdade OO fornece limites arquiteturais limpos e a Programação Funcional garante segurança de concorrência interna.
