# Metrik — Diretrizes do Agente & Configuração de Skills

Este repositório utiliza o ecossistema **Google Antigravity (AGY)** integrado ao **SpecKit** e com suporte ao padrão **Agent Skills**.

---

## 🛠️ Skills do Projeto (`.agents/skills/`)

### 1. Conversão de Livros e Referências
- **`book-to-skill`** (`/book-to-skill` ou `/book`):
  - **Função**: Converte livros técnicos, manuais e PDFs em skills estruturadas de consulta sob demanda.
  - **Diretório de fontes sugerido**: `books/` (ou qualquer caminho no disco).
  - **Destino padrão das skills geradas**: `.agents/skills/<slug-do-livro>/`.
  - **Comandos**:
    ```text
    /book books/exemplo.pdf
    /book-to-skill books/exemplo.pdf [slug-opcional]
    ```

- **`skilltdd`** (`/skilltdd` ou `/tdd`):
  - **Função**: Metodologia TDD completa de Kent Beck (*Test-Driven Development: By Example*).
  - **Conteúdo**: 32 capítulos cobrindo ciclo Red-Green-Refactor, exemplos práticos (Money e xUnit), padrões de design e refatorações testáveis.
  - **Comandos**:
    ```text
    /skilltdd [dúvida/conceito]
    /tdd [dúvida/conceito]
    ```

- **`skillsecuritychaos`** (`/skillsecuritychaos` ou `/secchaoseng`):
  - **Função**: Engenharia de Caos em Segurança e Resiliência em Sistemas (*Kelly Shortridge & Aaron Rinehart - O'Reilly*).
  - **Conteúdo**: 9 capítulos cobrindo avaliação E&E, design de sistemas resilientes, métricas DORA/SLOs de segurança, hierarquia Ice Cream Cone de soluções, e experimentação contínua via loop EMPAK.
  - **Comandos**:
    ```text
    /skillsecuritychaos [dúvida/cenário]
    /secchaoseng [dúvida/cenário]
    ```

- **`skillsecurityeng`** (`/skillsecurityeng` ou `/seceng`):
  - **Função**: Engenharia de Segurança em Sistemas Distribuídos (*Ross Anderson - Wiley*).
  - **Conteúdo**: 29 capítulos cobrindo modelagem de adversários, criptografia prática, protocolos de autenticação e pagamento, controle de acesso (MLS, Clark-Wilson), economia da segurança e desenvolvimento de software seguro.
  - **Comandos**:
    ```text
    /skillsecurityeng [dúvida/ameaça/protocolo]
    /seceng [dúvida/ameaça/protocolo]
    ```

- **`skillpromptengmultimodal`** (`/skillpromptengmultimodal`):
  - **Função**: Engenharia de Prompts para IA Multimodal (Texto, Visão e Áudio) (*Yash Jain - 2025*).
  - **Conteúdo**: 8 capítulos cobrindo fundamentos de fusão multimodal, prompts visuais pentapartite com CLIP/difusão, prompts acústicos com AudioLM/Suno, harmonização transmídia, encadeamento iterativo de prompts (MIPC), style tokens e considerações éticas.
  - **Comandos**:
    ```text
    /skillpromptengmultimodal [dúvida/prompt/modalidade]
    ```

- **`skillengprompt`** (`/skillengprompt` ou `/engprompt`):
  - **Função**: Engenharia de Prompt para Desenvolvedores de Software (*Ricardo Pupo Larguesa - Casa do Código*).
  - **Conteúdo**: 12 capítulos cobrindo modelos de linguagem, os 4 pilares do prompt técnico, elaboração estruturada (Few-shot, CoT, delimitadores), testes de prompts, modelagem com BDD/Mermaid, codificação limpa (SOLID), testes unitários de borda, code review e documentação viva.
  - **Comandos**:
    ```text
    /skillengprompt [dúvida/tarefa-dev]
    /engprompt [dúvida/tarefa-dev]
    ```

- **`skillrespostaia`** (`/skillrespostaia` ou `/respostaia`):
  - **Função**: A Arte de Pedir Respostas de Alta Qualidade ao ChatGPT (*Ibrahim John - Nzunda Technologies, 2023*).
  - **Conteúdo**: 25 capítulos cobrindo a tríade fundamental (Tarefa, Instruções, Papel), fórmulas de prompt modulares, Chain-of-Thought ("Vamos pensar sobre isso"), poucos disparos (Few-Shot), autoconsistência, palavras-semente, geração e integração de conhecimento, geração controlada, NER, análise de sentimento, clustering, diálogo, testes adversariais e aprendizagem curricular.
  - **Comandos**:
    ```text
    /skillrespostaia [dúvida/técnica/fórmula]
    /respostaia [dúvida/técnica/fórmula]
    ```

- **`skillarqlimpa`** (`/skillarqlimpa` ou `/arqlimpa`):
  - **Função**: Arquitetura Limpa — O Guia do Artesão para Estrutura e Design de Software (*Robert C. Martin / Uncle Bob*).
  - **Conteúdo**: 34 capítulos em 6 partes cobrindo os fundamentos do design, paradigmas de programação, princípios SOLID completos, coesão e acoplamento de componentes (REP, CCP, CRP, ADP, SDP, SAP, Métricas I/A/D), Regra de Dependência, Entidades, Casos de Uso, Adaptadores de Interface, Humble Objects, e o isolamento de Frameworks, Web e Bancos de Dados como meros detalhes.
  - **Comandos**:
    ```text
    /skillarqlimpa [dúvida/conceito/arquitetura]
    /arqlimpa [dúvida/conceito/arquitetura]
    ```

- **`skillcodlimpo`** (`/skillcodlimpo`, `/codlimpo` ou `/cleancode`):
  - **Função**: Código Limpo — Habilidades Práticas do Agile Software (*Robert C. Martin / Uncle Bob*).
  - **Conteúdo**: 17 capítulos cobrindo a Regra do Escoteiro, Lei de LeBlanc, nomes significativos, funções pequenas e a Regra Decrescente (Stepdown Rule), comentários honestos, formatação, Lei de Deméter (acidentes de trem), tratamento de erros sem nulos, testes de unidade limpos com F.I.R.S.T., design emergente de Kent Beck, concorrência segura, refatoração cirúrgica e o catálogo completo dos 66 odores e heurísticas (smells).
  - **Comandos**:
    ```text
    /skillcodlimpo [dúvida/odor/refatoração]
    /codlimpo [dúvida/odor/refatoração]
    /cleancode [dúvida/odor/refatoração]
    ```

### 2. Metodologia SDD — Spec Driven Development
- **`sdd`** (`/sdd` ou `/sdd-skill`):
  - **Função**: Metodologia formal de desenvolvimento orientado a especificações vivas (filosofia OpenSpec).
  - **Ciclos e Modos**:
    - `Modo 1`: Feature nova a partir de PRD (`spec.md` → `plan.md` → `tasks.md` → código).
    - `Modo 2`: Alteração em módulo brownfield existente (`proposal.md` com delta de requisitos).
    - `Modo 3`: Início de projeto greenfield (`constitution.md` → `project-context.md` → primeira spec).
    - `Retomada`: Checkpoint e continuação de sessões anteriores sem perda de contexto.
  - **Precedência inquebrável**: `constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` > `plan.md` > `tasks.md` > código.

- **`sdd-prompt-master`** (`/sdd-prompt-master` ou `/sdd-master`):
  - **Função**: Templates operacionais de início de sessão (Master Prompts) para os 3 Modos do SDD e bloco de retomada de sessão com rastreamento de tarefas concluídas.

- **`skillsdd`** (`/skillsdd` ou `/agenticsdd`):
  - **Função**: Metodologia completa de *Agentic Spec-Driven Development* baseada na obra de Anatoly Volkhover (2025).
  - **Conteúdo**: 16 capítulos estruturados cobrindo o papel do Handler (orquestrador de agentes), pré-requisitos, economia de tokens, regras duráveis (`.cursorrules`, `.windsurfrules`, `CLAUDE.md`, `AGENTS.md`), protocolo de resolução de conflitos de regras, bootstrap de novos projetos, auditabilidade, memória e sessões, glossário ontológico, governança de artefatos, verificação e teste do polígrafo (The Polygraph Test), correção de curso, simulação por Dry Run, wiki interativo e especificação como contrato vivo executável.
  - **Comandos**:
    ```text
    /skillsdd [dúvida/conceito/fase]
    /agenticsdd [dúvida/conceito/fase]
    ```

### 3. Ciclo de Desenvolvimento Guiado por Especificações (SpecKit)
- `/speckit-specify`: Cria ou atualiza especificações funcionais (`spec.md`).
- `/speckit-clarify`: Identifica e resolve ambiguidades na especificação.
- `/speckit-plan`: Constrói o plano de arquitetura técnica (`plan.md`).
- `/speckit-tasks`: Quebra o plano em tarefas atômicas executáveis (`tasks.md`).
- `/speckit-implement`: Executa a implementação incremental com base nas tarefas.
- `/speckit-analyze`: Valida a consistência cruzada entre especificação, plano e tarefas.

---

## 🧠 Protocolo Mandatório: Modelos de Raciocínio Analítico Pré-Criação de Tarefas

> **REGRA FUNDAMENTAL E INEGOCIÁVEL (Constitution VI):**  
> Toda vez que for criada, decomposta ou refinada uma lista de tarefas (`tasks.md`, issues no GitHub, subtarefas de agentes ou planos de execução), **NENHUMA TAREFA PODE SER LISTADA** sem que, imediatamente antes, o agente/desenvolvedor forneça e documente explicitamente os **Modelos de Raciocínio Analítico**.

### Os 6 Modelos de Raciocínio Analítico Obrigatórios

Antes de redigir qualquer item na lista de tarefas, o agente DEVE produzir a seção analítica contendo:

1. **Decomposição por Primeiros Princípios (*First-Principles Thinking*)**:
   - Reduzir o requisito às verdades fundamentais e invariantes de negócio/computação.
   - Eliminar premissas acidentais, dependências desnecessárias ou vícios herdados de implementações anteriores.
   - *Pergunta-chave:* "Qual é a menor verdade irredutível necessária para que esta capacidade exista?"

2. **Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)**:
   - Assumir hipoteticamente que a execução desta feature/tarefa falhou gravemente em produção.
   - Mapear antecipadamente: condições de corrida, quebra de contratos de API, inconsistência de estado, falhas de autorização, vazamento de memória ou edge cases não tratados.
   - *Pergunta-chave:* "De quais maneiras sutis esta implementação pode falhar silenciosamente?"

3. **Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)**:
   - **Mutuamente Exclusivas:** Nenhuma tarefa deve se sobrepor ou duplicar trabalho de outra; limites de arquivo e responsabilidade devem ser estritos.
   - **Coletivamente Exaustivas:** A soma de todas as tarefas deve cobrir 100% dos critérios de aceitação da `spec.md` e decisões do `plan.md`, sem lacunas.
   - *Pergunta-chave:* "Há sobreposição de escopo entre tarefas? Ficou algum requisito ou critério sem tarefa correspondente?"

4. **Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)**:
   - Mapear caminhos de implementação alternativos (ex.: padrão A vs padrão B, síncrono vs assíncrono).
   - Justificar explicitamente o critério de poda que descartou as opções inferiores em favor do caminho escolhido.
   - *Pergunta-chave:* "Quais alternativas foram descartadas e por qual trade-off técnico específico?"

5. **Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)**:
   - Cada tarefa ou grupo de histórias deve ter um teste objetivo (unitário, integração ou contrato) que possa falhar antes da implementação e passar de forma determinística após.
   - *Pergunta-chave:* "Como podemos provar objetivamente, sem inspeção manual, que esta tarefa foi concluída com sucesso?"

6. **Triangulação Adversarial & Verificação da Constituição (*Polygraph Verification*)**:
   - Confrontar as tarefas contra a `constitution.md`, `project-context.md` e decisões duráveis.
   - Garantir que nenhuma tarefa viola simplicidade (YAGNI), modularidade ou segurança.
   - *Pergunta-chave:* "Essa tarefa adiciona complexidade desnecessária ou viola algum princípio constitucional?"

---

## ⚙️ Ambiente & Extratores Locais
- **Python**: 3.14 (detectado em `python`)
- **Parsers ativos**: `pypdf`, `pdfminer.six`, `pdf-inspector`, `python-docx`, `beautifulsoup4`, `trafilatura`, `striprtf`, Calibre (`ebook-convert`).
- **Scripts de execução**: Localizados em `.agents/skills/book-to-skill/scripts/extract.py`.

