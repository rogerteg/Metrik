# Capítulo 1: Modelos de Linguagem

## Core Idea
Modelos de linguagem (LLMs) são redes neurais probabilísticas treinadas para prever os próximos tokens de uma sequência; entender sua natureza matemática e limitações é indispensável para evitar alucinações no desenvolvimento de software.

## Frameworks Introduced
- **Tokenização e Janela de Atenção**:
  - Quando usar: Ao dimensionar código-fonte e documentação que cabem em uma interação com o modelo.
  - Como: Lembrar que o modelo não lê palavras inteiras, mas pedaços subvocabulares (tokens ~ 4 caracteres em inglês, menos em português e código com indentação).
- **Parâmetros de Inferência para Código**:
  - Quando usar: Ao calibrar a precisão da resposta para programação.
  - Como: Definir temperatura próxima de 0.0–0.2 para tarefas determinísticas (geração de código, refatoração, testes) e 0.5–0.7 para ideação arquitetural.

## Key Concepts
- **Token**: Unidade mínima textual processada pelos modelos estatísticos.
- **Temperatura**: Parâmetro que calibra o grau de aleatoriedade na amostragem da probabilidade de saída.
- **Janela de Contexto**: Quantidade máxima de tokens (input + output) retida durante uma sessão.
- **Alucinação**: Geração confiante e articulada de informações, APIs ou bibliotecas que não existem na realidade.

## Mental Models
- **O Modelo como um Autocompletar Hiperavançado**: O modelo não 'sabe' programar no sentido humano; ele prevê continuações de código estatisticamente plausíveis com base no contexto fornecido.
- **Verificação Ativa de Imports e APIs**: Sempre desconfie de métodos ou bibliotecas sugeridos pelo modelo até validar se realmente existem na versão utilizada no projeto.

## Anti-patterns
- **Tratar o LLM como um Banco de Dados de Fatos**: Assumir que o modelo memorizou documentações obscuras de frameworks internos sem fornecer a documentação como contexto.
- **Temperatura Alta para Geração de Sintaxe**: Usar temperatura padrão (0.7-1.0) para gerar código estrito, aumentando drasticamente a taxa de bugs sintéticos.

## Worked Example
```text
Configuração ideal de inferência para geração de código SQL:
Temperatura: 0.1
Top_P: 0.95
Instrução: "Gere apenas a instrução SQL ANSI compatível com PostgreSQL 15, sem blocos de texto explicativo."
```

## Key Takeaways
1. LLMs trabalham com predição probabilística de tokens em um espaço de atenção delimitado.
2. Temperatura baixa é essencial para código reprodutível e livre de desvios aleatórios.
3. A responsabilidade da verificação de bibliotecas e APIs reais é sempre do desenvolvedor.
