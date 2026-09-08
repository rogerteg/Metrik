# Chapter 4: Sonic Innovations: Crafting Audio Prompts with AudioLM

## Core Idea
O prompt acústico exige traduzir percepções temporais e espaciais em linguagem textual, decompondo a intenção sonora em ambiente físico, textura tímbrica, instrumentação e progressão dinâmica.

## Frameworks Introduced
- **Tríade do Design Sonoro (Espaço - Timbre - Dinâmica)**:
  - Quando usar: Ao compor prompts para modelos generativos de áudio, música e efeitos sonoros (AudioLM, MusicLM, Suno, Stable Audio).
  - Como estruturar:
    1. **Ambiente Acústico (Reverb / Espaço)**: Sala anecóica, catedral de pedra reverberante, ar livre sob chuva, cabine de gravação seca.
    2. **Timbre e Instrumentação**: Instrumentos acústicos orgânicos (violoncelo com arco de crina, piano de feltro vertical) vs sintetizadores analógicos modulares (ondas dente de serra quentes).
    3. **Dinâmica e Movimento Temporal**: Crescendo lento, ritmo sincopado em 90 BPM, pausas dramáticas, polirritmia suave.

## Key Concepts
- **Acoustic Tokens**: Representações discretas de compressão de áudio (ex: codecs neurais como SoundStream ou EnCodec) que preservam fidelidade acústica e semântica.
- **Soundscape (Paisagem Sonora)**: A combinação holística de som principal (foreground), ambiência (background) e detalhes acústicos ocasionais (foley).
- **Tempo & Metragem (BPM, Compassos)**: Qualificadores de velocidade e cadência essenciais para consistência rítmica.
- **Foley & Diegetic Sound**: Sons que pertencem organicamente ao ambiente da cena vs trilha extradiegética.

## Mental Models
- **Construa o Palco antes dos Músicos**: Primeiro defina a acústica do local onde o som ocorre; depois traga os instrumentos e a execução.
- **Descreva Sensações Físicas do Som**: Palavras como 'ressonante, aveludado, áspero, estridente, pulsante' ativam camadas semânticas ricas no modelo.

## Anti-patterns
- **Prompts Apenas de Gênero Genérico**: Escrever apenas 'música calma' ou 'rock' sem especificar instrumentação, ritmo e tom.
- **Ignorar o Espaço Físico**: Deixar o ambiente em branco, gerando áudios secos ou com reverberações incompatíveis com o contexto.

## Worked Example
`	ext
Prompt de Paisagem Sonora / Trilha:
Peça instrumental contemplativa em piano de feltro vertical e violoncelo solo, tempo moderado em 72 BPM. Gravado em estúdio de madeira intimista com reverberação curta e quente. Som sutil de feltro dos martelos atingindo as cordas e respiração suave do músico. Atmosfera nostálgica, progressão harmônica melancólica que evolui para uma resolução serena.
`

## Key Takeaways
1. A descrição do ambiente acústico confere realismo e presença tridimensional ao áudio.
2. Especifique detalhes tímbricos e mecânicos dos instrumentos para evitar sonoridades sintéticas genéricas.
3. Ritmo e dinâmica emocional são os pilares que sustentam a atenção auditiva ao longo do tempo.
