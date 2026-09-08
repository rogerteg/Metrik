# Capítulo 8: Prompt de Palavra-Semente (Seed-Word Prompting)

## Core Idea
A injeção estratégica de uma ou mais palavras-semente (seed words) atua como uma âncora semântica que magnetiza a geração de texto em torno de um conceito, tom ou atributo técnico específico.

## Frameworks Introduced
- **Fórmula de Prompt com Palavra-Semente**:
  `Como [função], gere [tarefa] incorporando e estruturando a resposta a partir da palavra-semente: "[palavra-semente]"`
- **Tipos de Palavras-Semente**:
  - *Estilísticas*: "minimalista", "vibrante", "austero", "épico".
  - *Técnicas*: "escalabilidade", "idempotência", "resiliência", "imparcialidade".
  - *Comerciais*: "disruptivo", "ergonômico", "exclusivo", "sustentável".

## Key Concepts
- **Ancoragem Semântica**: Mecanismo pelo qual uma palavra-chave de alto peso atrai clusters conceituais afins no espaço de embeddings do modelo.
- **Modulação Temática**: Uso de palavras-semente para evitar dispersão ou deriva temática durante textos longos.

## Mental Models
- **A Tonalidade Musical de uma Canção**: A palavra-semente define o tom (dó maior, lá menor); todas as frases geradas passam a harmonizar com essa vibração semântica fundamental.

## Anti-patterns
- **Palavras-Semente Antagônicas**: Injetar palavras incompatíveis sem contexto reconciliador (ex: "burocrático" e "ágil-extremo" no mesmo fôlego).

## Worked Example
**Criação Publicitária Guiada por Semente**:
```text
Como estrategista de branding para calçados esportivos de alta performance, gere uma campanha de apresentação para o tênis 'AeroFlow', seguindo estas diretrizes:
1. Formato: Título de impacto, manifesto de 3 parágrafos e slogan final.
2. Palavra-semente central: "leveza".
3. A palavra-semente deve nortear as metáforas, os adjetivos e o benefício funcional comunicado ao atleta.
```
