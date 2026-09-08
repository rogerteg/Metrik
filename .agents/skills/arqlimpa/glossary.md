# Glossário Técnico da Arquitetura Limpa (Uncle Bob)

Terminologia técnica e conceitos fundamentais de Clean Architecture em formato bilíngue (Português - Inglês).

| Termo em Português | Termo em Inglês | Definição e Aplicação Técnica |
|---|---|---|
| **Regra de Dependência** | *The Dependency Rule* | Lei fundamental: dependências de código-fonte só podem apontar para dentro, em direção às políticas de mais alto nível. |
| **Entidade** | *Entity* | Objeto que encapsula Regras de Negócio Críticas corporativas (existiriam mesmo sem automação computacional). |
| **Caso de Uso / Interactor** | *Use Case / Interactor* | Objeto que orquestra as Regras de Negócio da Aplicação, direcionando dados entre Entidades e Adaptadores. |
| **Adaptador de Interface** | *Interface Adapter* | Camada intermediária que converte dados do formato de casos de uso para o formato exigido por Web, DB ou GUI. |
| **Objeto Humilde** | *Humble Object* | Padrão que isola elementos difíceis de testar (Views, Gateways) em componentes sem cérebro, preservando a lógica em apresentadores testáveis. |
| **Arquitetura Gritante** | *Screaming Architecture* | Princípio de que a organização do código deve gritar os casos de uso de negócio do sistema, e não o framework web utilizado. |
| **Nível de Política** | *Policy Level* | Medida de distância de um módulo em relação aos dispositivos físicos de Entrada/Saída (E/S). Quanto mais longe da E/S, mais alto é o nível. |
| **Mapeador de Dados** | *Data Mapper* | Componente que traduz registros de persistência (tabelas de banco) em Entidades puras de domínio e vice-versa. |
| **Modelo de Requisição / Resposta** | *Request / Response Model (DTO)* | Estruturas de dados planas e simples que cruzam as fronteiras sem expor referências internas às Entidades. |
| **Limite / Fronteira** | *Boundary* | Linha divisória arquitetural que separa componentes de diferentes níveis e estabilidades através de interfaces polimórficas. |
| **Componente Main** | *Main Component / Composition Root* | O ponto de entrada de menor nível onde todos os adaptadores concretos são instanciados e injetados nas regras de negócio. |
| **Instabilidade ($I$)** | *Instability Metric ($I$)* | Razão $Ce / (Ca + Ce)$ que mede a propensão de um componente à mudança com base em suas dependências. |
| **Abstração ($A$)** | *Abstractness Metric ($A$)* | Proporção $Na / Nc$ de classes e interfaces abstratas em relação ao total de classes de um componente. |
| **Distância ($D$)** | *Distance from the Main Sequence ($D$)* | Métrica $|A + I - 1|$ que quantifica o afastamento de um componente da linha ideal de equilíbrio entre estabilidade e abstração. |
| **Zona de Dor** | *Zone of Pain* | Região próxima a $(0, 0)$ na Sequência Principal: componentes concretos e altamente estáveis, extremamente difíceis de modificar. |
| **Zona de Inutilidade** | *Zone of Uselessness* | Região próxima a $(1, 1)$ na Sequência Principal: abstrações órfãs e instáveis sem implementação concreta ou dependentes reais. |
| **Desacoplamento Acidental** | *Accidental Duplication* | Código superficialmente similar que muda por razões e momentos diferentes e que, portanto, NÃO deve ser unificado. |
| **Inversão de Dependência (DIP)** | *Dependency Inversion Principle (DIP)* | Estratégia de fazer o detalhe de baixo nível implementar uma interface definida e pertencente à política de alto nível. |
