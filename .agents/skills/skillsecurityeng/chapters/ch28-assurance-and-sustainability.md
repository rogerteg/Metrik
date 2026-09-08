# Capítulo 28 — Assurance and Sustainability

**Livro**: Security Engineering (Anderson) · `chapters/ch28-assurance-and-sustainability.md`

## Core Idea
**Garantia (assurance)** é a evidência de que um sistema faz o que promete — e é o que separa engenharia de esperança. Anderson revisa os **regimes de avaliação** (Orange Book, FIPS 140, Common Criteria), os **modelos de confiabilidade**, e a crescente **convergência entre safety e security** e a **sustentabilidade** (software que precisa durar e ser mantido). O capítulo pergunta: como confiar que algo é seguro — e como manter essa confiança ao longo de décadas?

## Frameworks Introduced
- **Regimes de avaliação de segurança**: Orange Book (TCSEC), FIPS 140, **Common Criteria (CC)**, e regimes de safety (aviação, dispositivos médicos).
- **Métricas e dinâmica da confiabilidade**: reliability growth models, revisão hostil, **open source**, garantia de processo.
- **Entrelaçamento de safety e security** (carros, regulação moderna — Cybersecurity Act).
- **Sustentabilidade**: diretivas de bens de consumo e novas direções de pesquisa.

## Key Concepts
- **Avaliação (evaluation)**:
  - *Alarms e locks*: como regimes de avaliação começaram (UL, certificação de fechaduras/alarmes).
  - *Regimes de safety*: aviação e dispositivos médicos como modelos de avaliação maduros.
  - *Medical device safety*: regulação que exige evidência.
  - *Aviation safety*: décadas de garantia por processo e análise.
  - *Orange Book (TCSEC)*: o primeiro grande esquema (classes A–D de confiança de OS) — e seus problemas práticos.
  - *FIPS 140 (HSMs)*: padrão de módulos cripto.
  - *Common Criteria*: o regime internacional (EALs, Protection Profiles). **Críticas**: caro, lento, e os *targets* nem sempre correspondem à segurança real no mundo.
  - **O "Princípio da Complacência Máxima"**: a tendência dos avaliadores/fornecedores a aceitar o mínimo e seguir em frente — a falha cultural dos regimes de avaliação.
  - *Próximos passos*: como melhorar (avaliação contínua, focar no que importa).
- **Métricas e dinâmica**:
  - **Reliability growth models**: modelos que estimam bugs restantes conforme são encontrados (úteis, mas com limites).
  - **Hostile review**: a revisão por adversários (red team, concorrentes) é a forma mais eficaz de achar bugs.
  - **Free and open-source software (FOSS)**: o modelo de garantia por transparência e revisão coletiva — e seus limites (quem revisa?).
  - **Process assurance**: confiar no processo (certificações, gates) vs. confiar no produto.
- **Entrelaçamento de safety e security**:
  - *Carros*: segurança eletrônica (safety — airbags, freios) e cibersegurança convergem (um hack pode causar acidente físico).
  - *Modernizar a regulação*: integrar safety e security nas regras.
  - *Cybersecurity Act (2019, UE)*: certificação e requisitos para produtos conectados.
- **Sustentabilidade**:
  - *Sales of Goods Directive*: direito a atualizações por período razoável — software inseguro/sem manutenção vira produto defeituoso.
  - *Novas direções de pesquisa*: como tornar sistemas seguros *e* sustentáveis (atualizáveis, auditáveis, com incentivos corretos).

## Mental Models
- **Garantia é uma cadeia de evidência, não um selo**: um certificado (CC, FIPS) é *um* input, não a resposta final.
- **"Princípio da Complacência Máxima"**: assuma que avaliadores e fornecedores farão o mínimo — desenhe para verificação real, não para o certificado.
- **Hostile review > autoavaliação**: bugs são encontrados por quem *tenta* quebrar, não por quem construiu.
- **Open source troca garantia por processo**: transparência só ajuda se houver revisão real e sustentação.
- **Safety e security são o mesmo problema quando há risco físico**: um carro hackeado é um problema de safety.
- **Sustentabilidade é um requisito de segurança**: software que não pode ser atualizado é uma vulnerabilidade permanente.

## Anti-patterns
- Confiar **cegamente em certificações** sem entender o escopo real avaliado.
- Autoavaliação **sem revisão hostil/independente**.
- Regimes de avaliação que viram **checklist burocrático** (complacency máxima).
- Tratar **safety e security** como silos separados em sistemas com risco físico.
- Software **sem plano de manutenção/atualização** (insustentável → inseguro com o tempo).

## Worked Example
**Certificação de um módulo cripto**: o fornecedor obtém FIPS 140/Common Criteria. O comprador *não* deve parar no certificado — deve perguntar: o que exatamente foi avaliado (qual versão, qual escopo)? Quem avaliou e com que independência? O que mudou desde a avaliação? Há revisão hostil contínua e plano de atualização? A combinação (certificação + revisão contínua + sustentabilidade) é o que gera garantia real.

## Key Takeaways
1. **Garantia = evidência contínua**, não um selo único.
2. Cuidado com a **complacência máxima** em qualquer regime de avaliação.
3. **Revisão hostil** e transparência (FOSS quando há revisão real) são os métodos mais eficazes.
4. **Safety+security convergem**; e **sustentabilidade** (atualizabilidade) é parte da segurança.

## Connects To
- Cap. 27 (desenvolvimento seguro) — o processo que a garantia avalia.
- Cap. 13/16/18 (locks, printing, tamper) — regimes de avaliação física.
- Cap. 25 (carros) — safety+security na prática.
