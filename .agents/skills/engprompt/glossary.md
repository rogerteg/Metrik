# Glossário: Engenharia de Prompt para Devs

- **Chain-of-Thought (CoT)**: Técnica de forçar o modelo a verbalizar raciocínio analítico passo a passo antes de emitir a resposta ou código final.
- **Code LLM**: Modelo de linguagem otimizado especificamente para código-fonte, sintaxes de programação e resolução de problemas lógicos.
- **Delimitadores**: Caracteres especiais ou tags estruturadas (como `<codigo>`, `"""`, `---`) que isolam instruções do contexto ou de dados de entrada.
- **Few-Shot Prompting**: Fornecimento de 1 a 3 exemplos de entrada e saída esperada no próprio prompt para calibrar formato e padrão de código.
- **Fill-in-the-Middle (FIM)**: Capacidade de modelos de código modernos de analisar o que vem antes (prefixo) e o que vem depois (sufixo) para completar o código central.
- **HumanEval**: Benchmark criado pela OpenAI para medir a capacidade de modelos de IA de gerar código Python funcionalmente correto a partir de docstrings.
- **In-Context Learning**: Assimilação instantânea de padrões, regras e sintaxes pelo modelo através das informações fornecidas diretamente na janela de contexto.
- **Janela de Contexto (Context Window)**: Limite de tokens simultâneos que um modelo pode processar entre entrada e saída durante uma sessão.
- **Prompt Drift**: Alteração ou descalibração do comportamento de prompts consolidados após mudanças ou re-treinamento do modelo de fundação.
- **Prompt Injection**: Ataque adversarial onde instruções maliciosas são injetadas nos dados para assumir o controle do comportamento do modelo de IA.
- **Restrição Negativa**: Instrução explícita no prompt detalhando o que a IA está terminantemente proibida de fazer.
- **Role / Persona**: Definição da especialidade, nível de senioridade e papel do modelo (ex: 'Engenheiro de Confiabilidade de Sistemas sênior').
- **Temperatura**: Parâmetro matemático de inferência que varia de 0.0 (determinístico, ideal para código) a 1.0+ (criativo, aleatório).
- **Token**: Pedaço de palavra ou caractere processado pelo modelo; em média, 1 token equivale a aproximadamente 4 caracteres em inglês.
- **Zero-Shot Prompting**: Envio de uma solicitação direta ao modelo sem fornecer exemplos prévios de resposta.
