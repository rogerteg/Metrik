# Capítulo 17: Prompts Adversariais (Adversarial Prompting)

## Core Idea
Prompts adversariais criam intencionalmente condições de teste de estresse extremo para identificar fragilidades, vieses, brechas de segurança (jailbreaks) e pontos de falha em classificadores e fluxos automatizados.

## Frameworks Introduced
- **Fórmula de Teste Adversarial**:
  ```text
  Tarefa: Gerar texto desafiador para avaliar a robustez de [sistema/classificador].
  Instruções:
  1. Crie um caso de teste que utilize linguagem ambígua, sarcasmo ou construções sintáticas raras.
  2. O texto deve parecer superficialmente pertencente à Categoria A, mas conter evidências semânticas sutis da Categoria B.
  3. Documente por que esse caso é difícil para um classificador convencional.
  ```
- **Casos de Uso Principais**:
  - *Robustez de Classificação*: E-mails difíceis de categorizar como spam ou legítimos.
  - *Análise de Sentimento com Ironia*: Avaliações que usam palavras positivas para transmitir críticas ferozes.
  - *Tradução com Expressões Idiomáticas Complexas*: Provérbios regionais sem tradução literal direta.

## Key Concepts
- **Red-Teaming de Prompts**: Prática de tentar intencionalmente burlar ou confundir o modelo para reforçar suas defesas.
- **Robustez Semântica**: Capacidade de um pipeline de IA de manter a precisão mesmo diante de ruído, ironia ou ataques propositais.

## Mental Models
- **O Teste de Colisão (Crash Test)**: Ninguém descobre a segurança de um carro dirigindo suavemente numa estrada plana; é preciso simular o impacto severo para avaliar a integridade da estrutura.

## Anti-patterns
- **Achar que o Sistema é Imbatível**: Não realizar testes adversariais e descobrir falhas bizarras diretamente em produção com clientes reais.

## Worked Example
**Teste de Sentimento com Ironia Fina**:
```text
Gere 3 avaliações de restaurante que sejam extremamente difíceis para um algoritmo ingênuo de análise de sentimento:
- Cada avaliação deve usar termos como "fantástico", "maravilhoso" e "parabéns", mas transmitir insatisfação profunda e sarcasmo indiscutível pelo contexto.
- Em seguida, explique qual elemento textual denuncia a verdadeira polaridade negativa de cada uma.
```
