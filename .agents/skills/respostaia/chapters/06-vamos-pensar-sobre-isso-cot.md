# Capítulo 6: Prompt "Vamos Pensar Sobre Isso" (Chain-of-Thought)

## Core Idea
Instruir o modelo a explicitar seu raciocínio passo a passo antes de emitir a resposta final (Chain-of-Thought / "Vamos pensar sobre isso") ativa uma cadeia de computação sequencial que previne erros lógicos, aritméticos e dedutivos graves.

## Frameworks Introduced
- **Gatilho de Cadeia de Raciocínio (Zero-Shot CoT)**:
  Inserir a diretriz: `"Vamos pensar sobre isso passo a passo"` ou `"Descreva detalhadamente o raciocínio etapa por etapa antes de concluir"`.
- **Fórmula de CoT Estruturado**:
  ```text
  Diante do seguinte problema: [inserir problema]
  Execute as seguintes etapas:
  1. Identifique as premissas e variáveis fundamentais.
  2. Demonstre os cálculos ou deduções intermediárias passo a passo.
  3. Verifique possíveis inconsistências ou casos de borda.
  4. Apresente a conclusão final fundamentada.
  ```

## Key Concepts
- **Cadeia de Raciocínio (Chain-of-Thought - CoT)**: Técnica que obriga o modelo a externalizar estados latentes intermediários em tokens antes da resposta definitiva.
- **Prevenção de Saltos Ilógicos**: Evita que o modelo aposte no primeiro token intuitivo mas matematicamente ou logicamente incorreto.

## Mental Models
- **O Rascunho da Prova de Matemática**: Ninguém resolve uma equação complexa de cabeça em um segundo; colocar os passos intermediários no papel é essencial para garantir o resultado.

## Anti-patterns
- **Exigir Resposta Imediata em Problemas Complexos**: Pedir "diga apenas SIM ou NÃO" em um caso de conformidade jurídica multifacetado sem dar espaço de raciocínio.

## Worked Example
**Análise de Viabilidade Logística**:
```text
Um caminhão precisa transportar 45 caixas de 80 kg e 30 paletes de 120 kg. A capacidade máxima do caminhão é de 7 toneladas. O custo por km rodado é de R$ 4,50 em trajetos de até 300 km e R$ 4,00 para a quilometragem excedente.

Vamos pensar sobre isso passo a passo:
1. Calcule o peso total da carga (caixas + paletes) em quilogramas e converta para toneladas.
2. Compare com a capacidade do caminhão e determine se a carga é permitida.
3. Se a viagem tiver 420 km, calcule o custo total detalhado do transporte.
4. Conclua com parecer de viabilidade física e financeira.
```
