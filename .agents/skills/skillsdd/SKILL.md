---
name: skillsdd
description: Agentic Spec-Driven Development — A practical method for using AI agents to build complete, living, and verifiable specifications for software and products based on the book by Anatoly Volkhover (2025). Covers the Handler role, token efficiency, durable rules, project bootstrap, audit trails, file memory, disambiguation glossary, visual artifacts, polygraph verification, course correction, and dry-run execution.
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Anatoly Volkhover
  version: '1.0'
---

# Agentic Spec-Driven Development (skillsdd)

Base de conhecimento estruturada e guia operacional derivado do livro de **Anatoly Volkhover** (*Agentic Spec-Driven Development: A Practical Method for Using AI to Build Complete Specifications for Software, Products, and Beyond*, 2025).

O método ensina como deixar de ser um mero digitador de prompts superficiais (*prompt monkey*) e se tornar um **Handler de IA**: um arquiteto e condutor que utiliza agentes de IA autônomos para construir especificações completas, verificáveis e vivas antes de escrever uma única linha de código.

## How to Use This Skill

1. **Fundamentos do Handler e Agente (Capítulos 1 a 3)**:
   - `chapters/01-prerequisites.md`: Os 4 pré-requisitos essenciais: expertise de domínio, agente com acesso a ferramentas/arquivos, controle de versão e estrutura de projeto.
   - `chapters/02-token-efficiency.md`: Economia de tokens, escolha de formatos enxutos (Markdown lean) e prevenção de desperdício de contexto.
   - `chapters/03-the-ai-agent.md`: As duas metades do agente (Modelo LLM + Harness com ferramentas), autonomia em loop e a realidade de que modelos não têm memória persistente nativa.
2. **Engenharia de Prompt e Regras Duráveis (Capítulos 4 a 7)**:
   - `chapters/04-the-prompt.md`: Os 7 modos de interação (Command, Research, Suggest, Draft, Analyze, Explain, Critique), intenção sobre instrução e gatilhos.
   - `chapters/05-durable-rules.md`: Regras duráveis de engajamento, a armadilha do inchaço de regras (*The Rules Trap*) e a linguagem prescritiva.
   - `chapters/06-the-bootstrap.md`: O quarteto de inicialização do projeto: `CLAUDE.md`/`AGENTS.md`, `rule-analysis.md`, `rule-conflict-protocol.md` e `rule-conflict-log.md`.
   - `chapters/07-auditability.md`: Rastreabilidade, anatomia de uma regra durável e resolução formal de conflitos de regras.
3. **Memória de Arquivo e Ground Truths (Capítulos 8 a 10)**:
   - `chapters/08-sessions-and-memory.md`: Janela de contexto, degradação contextual (*Context Rot*), chamadas de ferramentas e memória persistente baseada em arquivos com triangulação.
   - `chapters/09-glossary.md`: O glossário do projeto como verdade de domínio (*Ground Truth*) e o protocolo de desambiguação de termos.
   - `chapters/10-artifacts.md`: A disciplina de artefatos: quando o texto puro não basta e como gerar artefatos visuais e interativos (HTML/diagramas).
4. **Verificação, Correção e Execução (Capítulos 11 a 16)**:
   - `chapters/11-trust-but-verify.md`: A postura crítica do Handler, revisão manual e o teste do polígrafo (*The Polygraph*).
   - `chapters/12-course-correction.md`: Validação e atualização de premissas consolidadas e auditorias completas.
   - `chapters/13-dry-run.md`: Execução simulada contra a especificação (*Total Recall*) antes da implementação.
   - `chapters/14-interactive-wiki.md`: Navegação e engajamento de stakeholders via wikis autônomas e interativas.
   - `chapters/15-closing-pass.md`: Passada de fechamento (Sweep, Triage e Quality Gates finais).
   - `chapters/16-spec-driven-development.md`: O ciclo completo de ponta a ponta do Agentic SDD.
5. **Consultas Rápidas e Templates Prontos**:
   - `cheatsheet.md`: Guia de bolso com os 7 modos de prompt, o quarteto de bootstrap e checklist de verificação do polígrafo.
   - `patterns.md`: Padrões operacionais: The Bootstrap Protocol, The Disambiguation Protocol, The Polygraph Test e The Dry Run.
   - `glossary.md`: Glossário técnico bilíngue de termos do Agentic SDD.

---

## Core Frameworks & Mental Models

- **O Papel do Handler (AI Handler vs Prompt Monkey)**:
  O Handler não pede para o modelo "fazer um código rápido". O Handler define a governança, as regras de engajamento, mantém a memória em arquivos versionados, audita conflitos e conduz o agente através de etapas estruturadas de especificação.
- **As Duas Metades do Agente de IA**:
  O agente é composto pelo **Cérebro (LLM)** (estatístico, generativo, amnésico entre sessões) e o **Arnês (Harness)** (ferramentas de leitura/escrita de arquivos, execução de comandos e automação). O sucesso reside na disciplina do arnês.
- **Degradação de Contexto (Context Rot)**:
  À medida que uma sessão se prolonga, o excesso de tokens, logs de ferramentas e bate-papo degrada a capacidade de atenção do modelo. A cura: **manter o estado em arquivos e reiniciar sessões com frequência (*session resets*)**.
- **O Quarteto de Bootstrap**:
  1. `AGENTS.md` / `CLAUDE.md`: Ponto de entrada de regras e comandos.
  2. `rule-analysis.md`: Metodologia de auditoria contínua de regras.
  3. `rule-conflict-protocol.md`: Procedimento formal quando duas regras colidem.
  4. `rule-conflict-log.md`: Registro histórico de decisões de arbitragem de regras.
- **A Disciplina de Artefatos**:
  Especificações em texto Markdown são a **Única Fonte da Verdade (Source of Truth)**; diagramas Mermaid, telas HTML e protótipos são **artefatos derivados**, gerados deterministicamente a partir da especificação e nunca editados manualmente.
- **O Teste do Polígrafo (The Polygraph)**:
  Submeter a especificação gerada a perguntas cruzadas em uma sessão limpa para checar se o agente inventa dados, assume premissas não declaradas ou se apoia em omissões.
- **Modelos de Raciocínio Analítico Pré-Tarefas**:
  Antes de decompor qualquer especificação em tarefas executáveis (`tasks.md` ou backlog), o Handler obriga a execução prévia dos modelos de raciocínio analítico: Primeiros Princípios, Inversão/Pré-Mortem de modos de falha, cobertura MECE, árvore de decisão com poda, e critério de falsificabilidade/TDD. Nenhuma tarefa é autorizada sem esse rigor analítico preliminar.

---

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Prerequisites | `chapters/01-prerequisites.md` |
| 2 | Token Efficiency | `chapters/02-token-efficiency.md` |
| 3 | The AI Agent | `chapters/03-the-ai-agent.md` |
| 4 | The Prompt | `chapters/04-the-prompt.md` |
| 5 | Durable Rules | `chapters/05-durable-rules.md` |
| 6 | The Bootstrap | `chapters/06-the-bootstrap.md` |
| 7 | Auditability | `chapters/07-auditability.md` |
| 8 | Sessions and Memory | `chapters/08-sessions-and-memory.md` |
| 9 | Glossary | `chapters/09-glossary.md` |
| 10 | Artifacts | `chapters/10-artifacts.md` |
| 11 | Trust, but Verify | `chapters/11-trust-but-verify.md` |
| 12 | Course Correction | `chapters/12-course-correction.md` |
| 13 | Dry Run | `chapters/13-dry-run.md` |
| 14 | Interactive Wiki | `chapters/14-interactive-wiki.md` |
| 15 | Closing Pass | `chapters/15-closing-pass.md` |
| 16 | Spec-Driven Development | `chapters/16-spec-driven-development.md` |
