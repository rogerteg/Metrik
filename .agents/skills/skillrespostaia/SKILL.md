---
name: skillrespostaia
description: A Arte de Pedir Respostas de Alta Qualidade ao ChatGPT — técnicas completas de engenharia de prompt, fórmulas estruturadas, controle de estilo, papéis, raciocínio passo a passo (CoT), few-shot, autoconsistência e geração controlada com base no livro de Ibrahim John (2023). Use para criar prompts de alto impacto, extrair respostas precisas e desenhar agentes e fluxos conversacionais avançados.
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Ibrahim John (Nzunda Technologies)
  version: '1.0'
---

# A Arte de Pedir Respostas de Alta Qualidade ao ChatGPT (skillrespostaia)

Base de conhecimento estruturada e guia prático derivado do livro de **Ibrahim John** (*A arte de pedir respostas de alta qualidade ao ChatGPT: Um guia completo para técnicas de engenharia de prompt*, Nzunda Technologies, 2023).

O objetivo central é dominar as **fórmulas de prompt** e os **mecanismos de controle** que transformam saídas genéricas em respostas de altíssima relevância, precisão técnica e adaptabilidade contextual.

## How to Use This Skill

1. **Fundamentos do Prompting**:
   - `chapters/01-introducao-engenharia-prompt.md`: A tríade essencial (Tarefa, Instruções, Papel) e a anatomia da fórmula de prompt.
   - `chapters/02-tecnica-prompt-instrucoes.md`: Como definir restrições, conformidade e regras de negócio inegociáveis.
   - `chapters/03-solicitacao-funcao-papel.md`: Role Prompting — definir personas ("Atue como...", "Como representante de...") para modular tom, vocabulário e perspectiva.
   - `chapters/04-prompts-padrao.md`: Linha de base para iteração e refinamento incremental.
2. **Técnicas de Raciocínio e Consistência**:
   - `chapters/05-zero-one-poucos-disparos.md`: Zero-Shot, One-Shot e Few-Shot — calibração por exemplos.
   - `chapters/06-vamos-pensar-sobre-isso-cot.md`: Chain-of-Thought ("Vamos pensar passo a passo") para problemas lógicos e decisões complexas.
   - `chapters/07-prompt-autoconsistencia.md`: Self-Consistency — validação cruzada de múltiplos caminhos de raciocínio.
   - `chapters/08-prompt-palavra-semente.md`: Seed-Word Prompting — ancoragem semântica e estilística.
3. **Gestão e Integração de Conhecimento**:
   - `chapters/09-geracao-conhecimento.md`: Geração preliminar de fatos e premissas antes da conclusão.
   - `chapters/10-integracao-conhecimento.md`: Fusão de dados externos com raciocínio interno.
   - `chapters/11-solicitacoes-multipla-escolha.md`: Decisões guiadas e formatos fechados.
   - `chapters/12-prompts-suaves-interpretaveis.md`: Modulação suave e completude guiada.
   - `chapters/13-geracao-controlada.md`: Restrições estritas de tamanho, vocabulário e formato.
4. **Tarefas Especializadas de Linguagem**:
   - `chapters/14-resposta-a-perguntas.md`: QA factual, definições e recuperação de dados.
   - `chapters/15-solicitacoes-resumo.md`: Sumarização executiva (reuniões, notícias, livros e relatórios).
   - `chapters/16-prompts-dialogo.md`: Simulação de conversas, bots de suporte e entrevistas.
   - `chapters/17-prompts-adversariais.md`: Testes de robustez, estresse semântico e mitigação de vulnerabilidades.
   - `chapters/18-prompts-cluster-agrupamento.md`: Agrupamento semântico não-supervisionado.
5. **Aprendizado Iterativo e Modelagem Semântica**:
   - `chapters/19-aprendizado-por-reforco.md`: Ciclos iterativos com feedback e recompensa/penalidade.
   - `chapters/20-aprendizagem-curricular.md`: Progressão didática do simples ao complexo.
   - `chapters/21-analise-sentimento.md`: Polaridade emocional e detecção de tom em avaliações/posts.
   - `chapters/22-reconhecimento-entidade-nomeada-ner.md`: Extração de entidades (NER) em contratos e relatórios.
   - `chapters/23-classificacao-texto.md`: Triagem de e-mails, tickets e categorização de artigos.
   - `chapters/24-geracao-texto.md`: Extensão de histórias, completude de texto e tradução contextual.
   - `chapters/25-previsao-palavras-conclusao.md`: Previsão de contexto, combinações holísticas e síntese final.
6. **Consultas Rápidas e Templates Prontos**:
   - `cheatsheet.md`: Guia de bolso com todas as fórmulas de prompt prontas para copiar e colar.
   - `patterns.md`: Padrões compostos (Role + Instruction + Seed, CoT + Self-Consistency, Knowledge Gen + Integration).
   - `glossary.md`: Glossário técnico bilíngue de engenharia de prompt.

---

## Core Frameworks & Mental Models

- **A Tríade Fundamental da Engenharia de Prompt**:
  Todo prompt de alta precisão é construído a partir de 3 pilares:
  1. **Tarefa (Task)**: O que o modelo deve realizar objetivamente (verbo de ação explícito).
  2. **Instruções (Instructions)**: Regras, critérios de qualidade, tom, restrições e conformidade regulatória.
  3. **Papel/Função (Role)**: A perspectiva ou persona a partir da qual o modelo deve raciocinar e redigir.
- **Fórmula de Prompt Estruturada**:
  Em vez de linguagem livre ambígua, usar estruturas modulares:
  > *"Como [Papel], gere [Tarefa] seguindo estas instruções: [Instruções]. Utilize a palavra-semente: '[Palavra-semente]'."*
- **Engenharia de Prompt como Calibração Probabilística**:
  O modelo de linguagem (Transformer) prevê os próximos tokens mais prováveis; instruções detalhadas estreitam o espaço de busca probabilístico, eliminando respostas genéricas e aumentando a fidelidade da resposta.
- **Composição de Técnicas**:
  Nenhuma técnica atua isolada no mundo real. As respostas de mais alta qualidade combinam **Role + Instruction + Few-Shot + Chain-of-Thought**, culminando em validação de **Self-Consistency**.

---

## Chapter Index

| # | Capítulo | Arquivo | Foco Principal |
|---|----------|---------|----------------|
| 1 | Introdução à Engenharia de Prompt | `chapters/01-introducao-engenharia-prompt.md` | Tríade Tarefa-Instrução-Papel e anatomia da fórmula |
| 2 | Técnica de Prompt de Instruções | `chapters/02-tecnica-prompt-instrucoes.md` | Diretrizes claras, regras de negócio e conformidade |
| 3 | Solicitação de Função / Papel | `chapters/03-solicitacao-funcao-papel.md` | Personas, perspectivas e modulação de voz |
| 4 | Prompts Padrão | `chapters/04-prompts-padrao.md` | Linha de base e iteração inicial |
| 5 | Zero, Um e Poucos Disparos | `chapters/05-zero-one-poucos-disparos.md` | Few-shot prompting e calibração por exemplos |
| 6 | Prompt "Vamos Pensar Sobre Isso" | `chapters/06-vamos-pensar-sobre-isso-cot.md` | Raciocínio passo a passo (Chain-of-Thought) |
| 7 | Prompt de Autoconsistência | `chapters/07-prompt-autoconsistencia.md` | Consenso e múltiplos caminhos de dedução |
| 8 | Prompt de Palavra-Semente | `chapters/08-prompt-palavra-semente.md` | Ancoragem temática e estilística pontual |
| 9 | Geração de Conhecimento | `chapters/09-geracao-conhecimento.md` | Extração prévia de fatos e premissas |
| 10 | Integração de Conhecimento | `chapters/10-integracao-conhecimento.md` | Fusão de novos dados com raciocínio contextual |
| 11 | Solicitações de Múltipla Escolha | `chapters/11-solicitacoes-multipla-escolha.md` | Tomada de decisão em espaço delimitado |
| 12 | Prompts Suaves Interpretáveis | `chapters/12-prompts-suaves-interpretaveis.md` | Modulação de estilo e restrições suaves |
| 13 | Prompts de Geração Controlada | `chapters/13-geracao-controlada.md` | Restrições formais de tamanho, formato e regras |
| 14 | Resposta a Perguntas (QA) | `chapters/14-resposta-a-perguntas.md` | Fatos, definições e extração de fontes |
| 15 | Solicitações de Resumo | `chapters/15-solicitacoes-resumo.md` | Sumarização executiva e síntese de documentos |
| 16 | Prompts de Diálogo | `chapters/16-prompts-dialogo.md` | Conversação contextual, chatbots e personagens |
| 17 | Prompts Adversariais | `chapters/17-prompts-adversariais.md` | Testes de estresse, robustez e mitigação de bypass |
| 18 | Prompts de Cluster / Agrupamento | `chapters/18-prompts-cluster-agrupamento.md` | Clusterização semântica de feedbacks e artigos |
| 19 | Aprendizado por Reforço | `chapters/19-aprendizado-por-reforco.md` | Iteração com feedback, recompensa e punição |
| 20 | Aprendizagem Curricular | `chapters/20-aprendizagem-curricular.md` | Progressão pedagógica do simples ao avançado |
| 21 | Análise de Sentimento | `chapters/21-analise-sentimento.md` | Detecção de polaridade emocional e tom subjetivo |
| 22 | Reconhecimento de Entidade Nomeada | `chapters/22-reconhecimento-entidade-nomeada-ner.md` | Extração estruturada de entidades (NER) |
| 23 | Classificação de Texto | `chapters/23-classificacao-texto.md` | Triagem e etiquetagem categórica |
| 24 | Prompts de Geração de Texto | `chapters/24-geracao-texto.md` | Conclusão, extensão e tradução idiomática |
| 25 | Previsão de Palavras e Conclusão | `chapters/25-previsao-palavras-conclusao.md` | Previsão contextual, síntese das 25 técnicas e visão final |
