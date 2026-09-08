# Padrões de Prompts Multimodais (Patterns & Templates)

Este catálogo contém padrões e templates prontos para aplicação direta em modelos de texto, imagem, áudio e fluxos combinados.

---

## 1. Padrão Visual Pentapartite (Imagens: Midjourney, Flux, DALL-E)

```text
[SUJEITO]: Retrato expressivo de um mestre artesão de cerâmica com as mãos cobertas de argila molhada
[AMBIENTE]: Oficina ensolarada no interior do Japão, ferramentas de madeira nas paredes, plantas suspensas
[ILUMINAÇÃO]: Luz matinal dourada e suave entrando pela janela lateral, sombras suaves, poeira suspensa iluminada
[ESTILO/LENTE]: Fotografia editorial 35mm em filme analógico, lente prime 50mm f/1.8, profundidade de campo rasa
[COR/TEXTURA]: Tons terrosos quentes contrastando com o verde das plantas, textura nítida de argila e linho
--ar 16:9 --v 6.1 --style raw
```

---

## 2. Padrão Tríade Acústica (Áudio & Música: AudioLM, Suno, Stable Audio)

```text
[AMBIENTE/ESPAÇO]: Sala de concerto de câmara em madeira nobre com reverberação natural quente e profunda
[INSTRUMENTAÇÃO]: Quarteto de cordas acústico com destaque para violoncelo melancólico e violino expressivo
[RITMO/DINÂMICA]: Andamento lento em 60 BPM, crescendo dramático sutil no compasso final, pausas contemplativas
[HUMOR/ESTILO]: Neoclássico contemporâneo, evocando esperança e nostalgia introspectiva
```

---

## 3. Padrão de Encadeamento Multimodal (Prompt Chaining para Roteiro + Cena)

```markdown
Você é um Diretor de Produção Multimodal.
Com base no tema "[TEMA]", gere:

1. Roteiro Narrativo (1 parágrafo denso e cinematográfico)
2. Prompt de Imagem Primária (Estrutura Pentapartite em inglês para difusor)
3. Prompt Negativo de Imagem
4. Especificação de Trilha e Ambiência Sonora (BPM, instrumentos, reverberação)
5. Critérios de Avaliação de Harmonia entre as 3 saídas
```

---

## 4. Padrão de Consistência de Estilo (Style Anchor Injection)

```text
Adicione este bloco no final de todo prompt visual para garantir identidade de marca:
", editorial cinematographic look, 35mm film grain, muted warm earth tones with subtle teal accents, natural window lighting, shot by Roger Deakins style, no digital plastic look"
```
