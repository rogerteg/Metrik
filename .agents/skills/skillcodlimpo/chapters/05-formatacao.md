# Capítulo 5: Formatação

## Core Idea
A formatação do código é comunicação. A funcionalidade implementada hoje pode ser alterada na próxima versão, mas a legibilidade e a organização que você estabelece hoje definem o padrão para todas as manutenções futuras. O código deve ter uma estética limpa, harmoniosa e visualmente agradável.

## Frameworks Introduced
- **A Metáfora do Artigo de Jornal**:
  - O topo do arquivo deve ser como a manchete: conta a ideia geral em alto nível.
  - Os primeiros parágrafos contêm o resumo dos fatos principais.
  - À medida que se desce no arquivo, os detalhes microscópicos e funções auxiliares são apresentados.
- **Formatação Vertical**:
  - *Abertura Vertical*: Linhas em branco separam pensamentos conceituais distintos (importações, classes, métodos).
  - *Densidade Vertical*: Linhas fortemente associadas devem ficar juntas, sem espaços em branco artificiais.
  - *Distância Vertical*: Conceitos estritamente relacionados devem ficar fisicamente próximos no arquivo. Variáveis devem ser declaradas próximas ao seu primeiro uso; funções chamadas devem ficar imediatamente abaixo da função chamadora.
- **Formatação Horizontal**:
  - Limite de largura de linha: Entre 100 e 120 caracteres. Nunca force o leitor a rolar a tela horizontalmente para ler uma instrução.
  - Espaçamento horizontal: Usar espaços para enfatizar associações lógicas e operadores de atribuição (`total = subtotal + taxa;`).
  - Indentação: Hierarquia visual inegociável que reflete o escopo léxico do código.
- **Regras da Equipe**:
  Um grupo de desenvolvedores deve concordar com um estilo de formatação único e todos devem segui-lo cegamente. O software deve parecer ter sido escrito por um único autor consistente.

## Key Concepts
- **Ordenação Descendente**: O leitor nunca precisa caçar para cima onde uma função privada foi declarada.
- **Formatador Automático (Linters/Formatters)**: Delegar a formatação para ferramentas automáticas (Black, Prettier, Spotless) em hooks pré-commit.

## Mental Models
- **A Tipografia de um Livro**: Margens bem ajustadas, espaçamento entre parágrafos e capítulos hierarquizados transformam a leitura em um prazer sem atrito.

## Anti-patterns
- **Guerra de Estilos no Pull Request**: Desenvolvedores alterando indentação de tabs para spaces em commits de funcionalidade, gerando diffs gigantes e poluídos no Git.
