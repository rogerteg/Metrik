# Capítulo 3: Solicitação de Função / Papel (Role Prompting)

## Core Idea
A atribuição explícita de um papel (role/persona) direciona o modelo a adotar o vocabulário técnico, a mentalidade analítica, o nível de profundidade e a voz característicos de um profissional especializado.

## Frameworks Introduced
- **Fórmula de Solicitação de Função**:
  `Como [função/papel], gere [tarefa] seguindo estas instruções: [instruções]`
- **Matriz de Especialização de Personas**:
  - **Jurídica**: Advogado especialista em contratos mercantis.
  - **Marketing/Comercial**: Copywriter de conversão com foco em produtos de consumo.
  - **Tecnologia**: Arquiteto de software em nuvem de nível sênior.
  - **Educação**: Professor universitário didático que usa analogias do cotidiano.
- **Composição Tríplice (Role + Instruction + Seed-word)**:
  Unir a perspectiva profissional com diretrizes estritas e uma palavra-âncora para máxima ressonância.

## Key Concepts
- **Persona Contextual**: Definição da postura ética, bagagem técnica e objetivo comunicativo do agente.
- **Voz e Perspectiva**: Redação em primeira pessoa ("Nós na equipe de engenharia...") ou terceira pessoa institucional.

## Mental Models
- **A Máscara do Especialista**: Pedir para o modelo "agir como X" ativa os padrões linguísticos e cognitivos mais prováveis associados a essa profissão na base de dados de treinamento.

## Anti-patterns
- **Atribuição Genérica**: Dizer apenas "aja como um profissional" em vez de especificar "como um engenheiro de dados especialista em pipelines distribuídos".
- **Esquecer de Delimitar o Púbico**: Definir o papel sem esclarecer para quem o especialista está falando.

## Worked Example
**Prompt de Lançamento de Smartphone**:
```text
Como representante de marketing sênior de uma marca global de tecnologia, gere uma descrição de produto altamente persuasiva e informativa para o lançamento do novo smartphone Nexus-X, seguindo estas instruções:
1. Destaque os recursos inovadores: display OLED de 144Hz, câmera periscópica de 200MP e bateria de grafeno com recarga em 12 minutos.
2. O público-alvo são criadores de conteúdo e profissionais multitarefa.
3. Utilize a palavra-semente: "revolucionário".
4. Adicione uma chamada para ação (CTA) convidando para a pré-venda exclusiva.
```
