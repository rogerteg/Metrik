# Capítulo 18: Prompts de Agrupamento / Cluster (Clustering Prompts)

## Core Idea
A técnica de clusterização por prompt capacita o modelo a processar grandes volumes de dados textuais não-estruturados, descobrindo afinidades semânticas latentes e agrupando os itens em categorias coerentes com justificativas explícitas.

## Frameworks Introduced
- **Fórmula de Agrupamento Semântico**:
  ```text
  Conjunto de Dados Textuais:
  """
  [inserir lista de itens: feedbacks, notícias, tickets ou títulos]
  """

  Tarefa: Agrupe os itens acima em [N] clusters temáticos distintos.
  Instruções:
  1. Crie um nome descritivo e uma definição clara para cada cluster.
  2. Distribua todos os itens listados em seus respectivos grupos.
  3. Indique os critérios de similaridade que justificam o agrupamento.
  ```
- **Aplicações de Clusterização**:
  - *Feedback de Clientes*: Agrupar críticas por Usabilidade, Preço, Suporte ou Recursos Ausentes.
  - *Artigos Científicos*: Agrupar papers por metodologia, subcampo ou aplicação prática.
  - *Notícias*: Agrupamento de manchetes diárias por narrativa central.

## Key Concepts
- **Taxonomia Emergente**: Descoberta orgânica de categorias sem necessidade de etiquetas pré-definidas.
- **Homogeneidade Interna e Separação Externa**: Cada cluster deve conter itens muito similares entre si e bem distintos dos outros grupos.

## Mental Models
- **Organização de uma Biblioteca Bagunçada**: Olhar para uma pilha de 100 livros no chão e criar 4 estantes temáticas lógicas para organizá-los com etiquetas visíveis.

## Anti-patterns
- **Cluster 'Miscelânea' Gigante**: Criar um grupo "Outros" onde 80% dos dados são jogados por preguiça analítica do modelo.

## Worked Example
**Clusterização de Feedback de Usuários de App**:
```text
Analise os seguintes 10 comentários de usuários sobre um aplicativo de entregas e organize-os em clusters:
[inserir lista de 10 comentários sobre atrasos, bugs no pagamento, elogio a entregadores e taxa de entrega]

Instruções:
1. Agrupe os comentários em exatamente 3 temas principais.
2. Dê um nome profissional a cada cluster.
3. Aponte a porcentagem estimada de representatividade de cada tema no lote analisado.
```
