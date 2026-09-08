# Chapter 2: The Art of Prompt Engineering for Text with GPT-4

## Core Idea
O domínio de prompts textuais em modelos de fronteira baseia-se em modularidade, ancoragem de contexto profundo, especificidade léxica e controle explícito da estrutura de resposta.

## Frameworks Introduced
- **Ancoragem de Contexto e Persona (Role-Constraint-Context)**:
  - Quando usar: Para calibrar tom, estilo, vocabulário e profundidade técnica da saída textual.
  - Como: 1) Definir Persona/Especialidade; 2) Fornecer Contexto e Background; 3) Especificar Restrições Negativas; 4) Definir Formato de Entrega.
- **Chain-of-Thought Guiado para Criatividade**:
  - Quando usar: Em tarefas que exigem raciocínio complexo prévio à geração da narrativa ou roteiro multimodal.
  - Como: Instruir o modelo a decompor a análise de tom e ambientação antes de emitir o texto final.

## Key Concepts
- **Context Window**: A janela de atenção do modelo que dita quanto histórico e detalhes podem ser mantidos simultaneamente.
- **System Prompt**: Instrução de controle primordial que estabelece as regras e a persona do modelo.
- **Few-Shot Prompting**: Fornecimento de exemplos representativos de entrada e saída para guiar o formato e a nuance.
- **Temperature & Top_P**: Parâmetros de amostragem que controlam a aleatoriedade vs determinismo do texto.

## Mental Models
- **O Agente como um Ator de Método**: Se você der a ele apenas a fala, a atuação será genérica. Se você der o histórico de vida, as motivações e o cenário, a fala será memorável.
- **Restrição Positiva por Eliminação**: É mais eficiente descrever o que é permitido e a estrutura exata do que listar infinitas coisas proibidas.

## Anti-patterns
- **Prompts Vagos e Genéricos**: 'Escreva uma história sobre o espaço' em vez de especificar protagonista, conflito, tom e estética.
- **Ambiguidade de Formato**: Não deixar claro se a resposta deve ser prosa, roteiro técnico, tabela ou markdown estruturado.

## Worked Example
`	ext
Atue como um diretor de criação multimídia especializado em ficção científica introspectiva.
Contexto: Estamos criando o roteiro de abertura para uma animação curta sobre o último faroleiro espacial.
Restrições: Tom melancólico, mas esperançoso; sem clichês de batalhas espaciais; foco nas tarefas mecânicas diárias.
Formato:
[Cena / Ação Visual]
[Paisagem Sonora / Áudio]
[Narração / Texto]
`

## Key Takeaways
1. A clareza da instrução textual determina a qualidade de todas as modalidades dependentes.
2. Forneça restrições de estilo antes da solicitação da tarefa.
3. Use a separação explícita entre visual, sonoro e verbal para arquitetar experiências ricas.
