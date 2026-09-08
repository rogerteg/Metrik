# Glossário Técnico do Agentic SDD (Anatoly Volkhover)

Terminologia técnica e conceitos fundamentais de Agentic Spec-Driven Development em formato bilíngue (Português - Inglês).

| Termo em Português | Termo em Inglês | Definição e Aplicação Técnica |
|---|---|---|
| **Handler de IA** | *AI Handler* | O operador humano disciplinado que governa, orienta, audita e conduz o agente de IA autônomo através de regras e especificações. |
| **Regras Duráveis** | *Durable Rules* | Diretrizes comportamentais e técnicas salvas no repositório (`CLAUDE.md`/`AGENTS.md`) que sobrevivem a resets de sessão. |
| **Degradação de Contexto** | *Context Rot* | Degradação da coerência, foco e raciocínio do modelo de IA à medida que o histórico de mensagens se prolonga e acumula ruído. |
| **Arnês do Agente** | *Agentic Harness* | A infraestrutura de software que envolve o modelo LLM, fornecendo ferramentas de arquivo, terminal e loops autônomos. |
| **Triangulação de Memória** | *Memory Triangulation* | Reconstrução do contexto completo da sessão utilizando apenas 3 arquivos leves: Glossário, Ground Truths e Spec Ativa. |
| **Teste do Polígrafo** | *The Polygraph Test* | Protocolo de auditoria adversarial em sessão limpa para forçar o agente a confessar premissas implícitas e vulnerabilidades da spec. |
| **Execução Simulada** | *Dry Run* | Teste da especificação como um programa executável com dados reais para identificar estados e fluxos não documentados. |
| **Verdades Fundamentais** | *Ground Truths* | Premissas arquiteturais, de negócio e regulatórias consolidadas e imutáveis em arquivos centrais (`project-context.md`). |
| **Armadilha das Regras** | *The Rules Trap* | Fenômeno em que o excesso de micro-regras gera inchaço (*bloat*), contradições internas e paralisia do modelo. |
| **Passada de Fechamento** | *Closing Pass* | Varredura final de pré-implementação (Sweep e Triage) para garantir zero TODOs e 100% de consistência formal. |
| **Pronto para Implementação** | *Ready for Implementation (RFI)* | Estado formal de uma especificação que foi auditada, simulada no Dry Run e aprovada sem lacunas abertas. |
| **Única Fonte da Verdade** | *Source of Truth (SoT)* | A especificação em texto Markdown puro; todos os diagramas e telas HTML são meros artefatos derivados dela. |
| **Artefato Derivado** | *Derived Artifact* | Arquivo visual, protótipo HTML ou esquema gerado deterministicamente a partir da especificação canônica. |
| **Intenção sobre Instrução** | *Intent Over Instruction* | Filosofia de prompt que declara o resultado desejado e as restrições em vez de tentar micromanusear cada passo procedural. |
