# Capítulo 16: Prompts de Diálogo (Dialogue Prompts)

## Core Idea
Prompts de diálogo projetam interações conversacionais dinâmicas entre múltiplos agentes ou personas (chatbots de suporte, dramatizações, entrevistas e roteiros), mantendo a consistência de cada personagem ao longo do tempo.

## Frameworks Introduced
- **Fórmula de Prompt de Diálogo Estruturado**:
  ```text
  Gere um diálogo profissional e verossímil entre [Personagem A] e [Personagem B] sobre o assunto [tópico], seguindo estas instruções:
  1. Perfil de A: [definir personalidade, conhecimento e objetivo na conversa].
  2. Perfil de B: [definir postura, objeções e nível de cooperação].
  3. O diálogo deve evoluir de uma divergência inicial para um consenso negociado.
  4. Cada fala deve ser concisa, natural e refletir o papel de cada participante.
  ```
- **Aplicações de Diálogo**:
  - *Chatbot de Atendimento ao Cliente*: Roteiro de triagem e resolução de atrito.
  - *Entrevistas Simuladas*: Treinamento para contratação ou sabatina técnica.
  - *Roleplay Educativo*: Professor socrático debatendo com estudante curioso.

## Key Concepts
- **Consistência de Persona**: Manter o estilo, vocabulário e limitações de cada personagem do início ao fim sem mistura de vozes.
- **Tensão Conversacional e Resolução**: Estruturar falas que progridam em direção a um objetivo de negócio ou narrativo.

## Mental Models
- **O Roteiro Teatral**: O modelo assume o papel de dramaturgo que rege réplicas e tréplicas sem deixar os atores saírem do personagem.

## Anti-patterns
- **Personagens que Falam Todos Iguais**: Fazer o cliente irritado e o bot corporativo usarem exatamente o mesmo vocabulário polido e formal.

## Worked Example
**Simulação de Suporte de Nível 2**:
```text
Gere um diálogo entre um Engenheiro de Suporte N2 (empático, metódico e técnico) e um Diretor de TI de um cliente corporativo (estressado com a queda do ERP em horário de pico).

Instruções:
- O Diretor exige restabelecimento imediato e expressa descontentamento severo.
- O Engenheiro deve acalmar o cliente com profissionalismo, explicar o plano de contingência em execução e solicitar logs específicos de erro.
- A conversa deve durar 4 rodadas de diálogo e terminar com um alinhamento claro de próximos passos.
```
