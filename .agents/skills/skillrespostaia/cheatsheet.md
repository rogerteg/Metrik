# Cheatsheet de Bolso: Fórmulas de Prompt de Alta Qualidade (Ibrahim John)

Guia rápido de referência com todas as fórmulas práticas para copiar, colar e parametrizar.

---

## 1. Tríade Fundamental & Instruções
- **Fórmula Básica**:
  > `Gere [tarefa] seguindo estas instruções: [instruções]`
- **Com Papel e Persona (Role Prompting)**:
  > `Como [função/papel], gere [tarefa] seguindo estas instruções: [instruções]`
- **Com Papel + Instrução + Palavra-Semente**:
  > `Como [função], gere [tarefa] seguindo estas instruções: [instruções]. Utilize a palavra-semente: "[palavra-semente]"`

---

## 2. Exemplos e Calibração (Few-Shot)
- **Zero-Shot**:
  > `Gere [tarefa] sem exemplos prévios, fundamentando-se nas regras gerais de [domínio].`
- **Few-Shot**:
  > `Execute a tarefa [tarefa] seguindo o padrão demonstrado nestes exemplos:`
  > `Exemplo 1 -> Entrada: [...] | Saída: [...]`
  > `Exemplo 2 -> Entrada: [...] | Saída: [...]`
  > `Entrada Atual: [...] | Saída:`

---

## 3. Raciocínio Complexo e Validação
- **Chain-of-Thought (Vamos Pensar Sobre Isso)**:
  > `Vamos pensar sobre isso passo a passo:`
  > `1. Identifique as variáveis e premissas centrais.`
  > `2. Apresente as deduções ou cálculos intermediários.`
  > `3. Conclua com a solução final justificada.`
- **Autoconsistência (Self-Consistency)**:
  > `Desenvolva 3 caminhos de raciocínio independentes sob diferentes perspectivas para [problema]. Compare as conclusões e sintetize o resultado de maior consenso e solidez lógica.`

---

## 4. Gestão de Conhecimento e Fatos
- **Geração de Conhecimento**:
  > `Etapa 1: Gere 5 fatos e princípios teóricos fundamentais sobre [tópico].`
  > `Etapa 2: Com base unicamente no conhecimento gerado na Etapa 1, resolva [problema].`
- **Integração de Conhecimento**:
  > `Considere os seguintes novos fatos: """[inserir fatos]""". Analise [problema] integrando essas novas informações e dando-lhes precedência sobre seu conhecimento anterior.`
- **Resposta com Delimitação de Fonte (Anti-Alucinação)**:
  > `Responda à pergunta [pergunta] com base exclusiva no texto: """[texto]""". Se a resposta não estiver explícita no texto, responda apenas: "Não consta no material fornecido".`

---

## 5. Controle, Formatação e Restrições
- **Geração Controlada**:
  > `Gere [tarefa] em estrita conformidade: Formato [JSON puro/Tabela], tamanho [X palavras], proibido utilizar as palavras [lista].`
- **Múltipla Escolha**:
  > `Diante de [situação], selecione a opção correta entre [A, B, C, D] e justifique a escolha em 2 frases com evidências do texto.`
- **Resumo Executivo (3 Camadas)**:
  > `Gere um resumo de [texto]: 1. Tese central (1 frase); 2. Decisões tomadas (tópicos); 3. Pendências e responsáveis (tabela).`

---

## 6. Processamento de Linguagem Natural
- **Análise de Sentimento**:
  > `Analise o texto [texto]: classifique polaridade [Positivo/Negativo/Neutro/Misto], intensidade emocional de 1 a 5 e a frase determinante.`
- **Extração de Entidades (NER)**:
  > `Extraia do texto [documento] as entidades nomeadas nas categorias: PESSOA, ORGANIZACAO, LOCAL, DATA, VALOR e LEGISLAÇÃO.`
- **Classificação e Roteamento**:
  > `Classifique a mensagem [mensagem] em [SPAM / SUPORTE / FINANCEIRO / COMERCIAL / URGENTE], indicando o departamento responsável.`
