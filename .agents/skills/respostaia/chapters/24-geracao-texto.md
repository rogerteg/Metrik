# Capítulo 24: Prompts de Geração de Texto (Text Generation Prompts)

## Core Idea
Prompts de geração de texto aproveitam a capacidade generativa ampla dos modelos para criar narrativas, expandir roteiros incompletos, gerar redações ricas e realizar traduções idiomáticas preservando ritmo, estilo e voz.

## Frameworks Introduced
- **Fórmula de Geração Narrativa Guiada**:
  ```text
  Gere uma narrativa/história com base no seguinte enredo inicial: [inserir premissa]
  Instruções:
  1. Personagens obrigatórios: [descrever 2 ou 3 personagens].
  2. Conflito central: [especificar o dilema central].
  3. Extensão: Pelo menos [X] palavras.
  4. Estrutura: Introdução envolvente, clímax tenso e desfecho reflexivo.
  ```
- **Fórmula de Tradução Idiomática**:
  ```text
  Traduza o seguinte texto para [idioma-alvo] assegurando que a tradução seja precisa, idiomática e culturalmente adaptada:
  Texto Original: [inserir texto]
  Instruções: Evite decalques literais; adapte expressões idiomáticas e provérbios para equivalentes naturais no idioma de destino.
  ```

## Key Concepts
- **Continuidade Estilística**: Manter o mesmo tom e cadência do parágrafo inicial até o final da narrativa.
- **Tradução Idiomática vs Literal**: Traduzir o sentido e o impacto cultural em vez de palavra por palavra.

## Mental Models
- **O Escritor Fantasma (Ghostwriter)**: O autor fornece o mapa do livro e o perfil dos personagens; o modelo preenche a prosa mantendo a voz autêntica do escritor.

## Anti-patterns
- **Geração Sem Restrição de Enredo**: Pedir "escreva uma história sobre inteligência artificial" resultando no clichê batido do robô que se apaixona por humanos.

## Worked Example
**Expansão de Roteiro Publicitário**:
```text
Complete o roteiro de comercial de rádio abaixo para uma cafeteria artesanal:
"Abertura: Som de chuva forte batendo na vidraça. O tilintar suave de uma xícara de porcelana."

Instruções:
- Desenvolva uma locução intimista de 30 segundos destacando o aroma dos grãos recém-torrados da Serra da Mantiqueira.
- Finalize com convite acolhedor para a loja do centro histórico.
```
