# Glossário Técnico de Engenharia de Prompt (Ibrahim John)

Terminologia técnica e conceitos fundamentais de Prompt Engineering em formato bilíngue (Português - Inglês).

| Termo em Português | Termo em Inglês | Definição e Aplicação Técnica |
|---|---|---|
| **Engenharia de Prompt** | *Prompt Engineering* | Prática estruturada de projetar, refinar e otimizar entradas de texto para direcionar modelos generativos (LLMs) a gerarem saídas desejadas com alta precisão e previsibilidade. |
| **Tarefa** | *Task* | O objetivo central e imperativo que o modelo deve cumprir (ex: classificar, resumir, gerar, traduzir). |
| **Instrução** | *Instruction* | Conjunto de regras, restrições, critérios de qualidade e diretrizes que regulam como a tarefa deve ser executada. |
| **Papel / Função** | *Role / Persona* | A perspectiva, tom, especialidade e vocabulário adotados pelo modelo durante a geração ("Atue como...", "Como advogado..."). |
| **Fórmula de Prompt** | *Prompt Formula* | Estrutura sintática padronizada que organiza os componentes essenciais (Tarefa, Instrução, Papel, Contexto) de forma modular. |
| **Zero-Shot** | *Zero-Shot Prompting* | Execução de uma tarefa sem nenhum exemplo prévio de demonstração no contexto. |
| **One-Shot** | *One-Shot Prompting* | Fornecimento de exatamente um exemplo de entrada-saída para ilustrar o formato e a lógica esperada. |
| **Few-Shot** | *Few-Shot Prompting* | Inclusão de um pequeno conjunto de demonstrações selecionadas (geralmente 2 a 5) para guiar o aprendizado em contexto (*in-context learning*). |
| **Cadeia de Raciocínio (CoT)** | *Chain-of-Thought (CoT)* | Técnica que induz o modelo a verbalizar etapas intermediárias de raciocínio ("Vamos pensar passo a passo") antes da resposta final. |
| **Autoconsistência** | *Self-Consistency* | Geração de múltiplos caminhos de inferência independentes para selecionar a resposta consensual mais sólida por votação majoritária. |
| **Palavra-Semente** | *Seed Word* | Palavra-chave estratégica inserida no prompt para ancorar o campo semântico e estilístico da resposta. |
| **Geração de Conhecimento** | *Knowledge Generation* | Etapa preliminar que força o modelo a gerar fatos e princípios teóricos antes de resolver a tarefa principal. |
| **Integração de Conhecimento** | *Knowledge Integration* | Incorporação de documentos ou dados externos com precedência mandatória sobre o conhecimento pré-treinado do modelo. |
| **Geração Controlada** | *Controlled Generation* | Imposição de restrições duras de formato (JSON/Tabela), extensão (número exato de palavras) e vocabulário proibido. |
| **Prompt Suave Interpretável** | *Interpretable Soft Prompt* | Ajuste semântico sutil através de linguagem natural flexível e completude guiada em vez de regras rígidas binárias. |
| **Reconhecimento de Entidade Nomeada (NER)** | *Named Entity Recognition (NER)* | Identificação e extração de elementos categorizados (Pessoas, Empresas, Locais, Datas, Valores) a partir de texto livre. |
| **Classificação de Texto** | *Text Classification* | Categorização de documentos em classes temáticas pré-fixadas (ex: spam, urgente, suporte). |
| **Análise de Sentimento** | *Sentiment Analysis* | Medição da polaridade emocional (positivo, negativo, neutro) e nuances afetivas expressas em um texto. |
| **Aprendizagem Curricular** | *Curriculum Learning* | Sequenciamento didático de prompts partindo do conceito mais simples até a resolução de problemas complexos. |
| **Prompt Adversarial** | *Adversarial Prompting* | Criação de entradas desafiadoras ou com sutilezas extremas para auditar a robustez e detectar pontos cegos do modelo. |
| **Janela de Contexto** | *Context Window* | Capacidade total de tokens (entrada + saída) que o modelo consegue processar simultaneamente em uma sessão. |
| **Alucinação** | *Hallucination* | Geração de afirmações factualmente falsas ou dados inventados apresentados com alto grau de convicção aparente. |
