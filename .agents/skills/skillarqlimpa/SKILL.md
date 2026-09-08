---
name: skillarqlimpa
description: Arquitetura Limpa (Clean Architecture) — O guia do artesão para estrutura e design de software com base na obra seminal de Robert C. Martin (Uncle Bob). Abrange os fundamentos do design, paradigmas de programação, princípios SOLID completos, coesão e acoplamento de componentes (REP, CCP, CRP, ADP, SDP, SAP, Métricas I/A/D), a Regra de Dependência, Entidades, Casos de Uso, Adaptadores de Interface, Humble Objects, e o isolamento de Frameworks, Web e Bancos de Dados como meros detalhes.
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Robert C. Martin (Uncle Bob)
  version: '1.0'
---

# Arquitetura Limpa (skillarqlimpa)

Base de conhecimento estruturada e guia arquitetural completo extraído da obra de **Robert C. Martin (Uncle Bob)** (*Arquitetura Limpa: O Guia do Artesão para Estrutura e Design de Software*, Alta Books).

O objetivo supremo da arquitetura de software é **minimizar o custo humano de construir e manter o sistema**, mantendo as opções de negócio em aberto e protegendo as regras de negócio centrais das volatilidades de frameworks, bancos de dados, interfaces e mecanismos de entrega.

## How to Use This Skill

1. **Fundamentos e Paradigmas (Partes I e II)**:
   - `chapters/01-o-que-sao-design-e-arquitetura.md`: A igualdade entre design e arquitetura; o custo do código rápido e sujo.
   - `chapters/02-um-conto-de-dois-valores.md`: A Matriz de Eisenhower aplicada ao software — Comportamento (Urgente) vs Arquitetura (Importante).
   - `chapters/03-panorama-dos-paradigmas.md`: O que os paradigmas removem de nós.
   - `chapters/04-programacao-estruturada.md`: Disciplina sobre o controle de fluxo; falseabilidade de testes.
   - `chapters/05-programacao-orientada-a-objetos.md`: Encapsulamento, herança e o verdadeiro superpoder da OO: Polimorfismo e Inversão de Dependência.
   - `chapters/06-programacao-funcional.md`: Imutabilidade, segregação de mutabilidade e Event Sourcing.
2. **Princípios de Design de Classes — SOLID (Parte III)**:
   - `chapters/07-srp-responsabilidade-unica.md`: Um módulo deve responder a um, e apenas um, ator.
   - `chapters/08-ocp-aberto-fechado.md`: Aberto para extensão, fechado para modificação através de controle direcional.
   - `chapters/09-lsp-substituicao-de-liskov.md`: Subtipos devem ser intercambiáveis com seus tipos base.
   - `chapters/10-isp-segregacao-de-interface.md`: Não dependa de interfaces das quais você não precisa.
   - `chapters/11-dip-inversao-de-dependencia.md`: Módulos de alto nível não devem depender de módulos de baixo nível; ambos devem depender de abstrações.
3. **Princípios de Componentes (Parte IV)**:
   - `chapters/12-componentes.md`: A natureza das unidades implantáveis.
   - `chapters/13-coesao-de-componentes.md`: REP (Reúso/Release), CCP (Fechamento Comum / SRP de pacotes) e CRP (Reúso Comum / ISP de pacotes) e o Triângulo de Tensão.
   - `chapters/14-acoplamento-de-componentes.md`: ADP (Grafo Acíclico), SDP (Dependências Estáveis / Métrica I), SAP (Abstrações Estáveis / Métrica A) e a Métrica de Distância D (Zona de Dor vs Zona de Inutilidade).
4. **O Núcleo da Arquitetura Limpa (Parte V)**:
   - `chapters/15-o-que-e-arquitetura.md` a `chapters/19-politica-e-nivel.md`: Independência, limites, anatomia de fronteiras e políticas de alto nível.
   - `chapters/20-regras-de-negocio.md`: Entidades (Enterprise Business Rules) vs Casos de Uso (Application Business Rules).
   - `chapters/21-arquitetura-gritante.md`: A arquitetura deve gritar os casos de uso de negócio, não o framework web.
   - `chapters/22-a-arquitetura-limpa.md`: Os Círculos Concêntricos e a inegociável **Regra de Dependência** (dependências só apontam para dentro).
   - `chapters/23-apresentadores-e-objetos-humble.md`: O padrão Humble Object separando lógica testável de coisas difíceis de testar (Views, Gateways).
   - `chapters/24-limites-parciais.md` a `chapters/29-arquitetura-embarcada-limpa.md`: Estratégias pragmáticas de limites, o componente Main, microserviços e limites de teste.
5. **Detalhes e Estudos de Caso (Parte VI)**:
   - `chapters/30-a-base-de-dados-e-um-detalhe.md`: O banco de dados é um mero mecanismo de persistência transitório.
   - `chapters/31-a-web-e-um-detalhe.md`: A web é apenas uma interface gráfica de entrada/saída.
   - `chapters/32-frameworks-sao-detalhes.md`: Evitando o casamento assimétrico com bibliotecas de terceiros.
   - `chapters/33-estudo-de-caso-vendas-de-video.md`: Modelagem passo a passo completa do início ao fim.
   - `chapters/34-o-capitulo-perdido.md`: Simon Brown: Pacote por Camada vs por Recurso vs Portas e Adaptadores vs Pacote por Componente.
6. **Consultas Rápidas e Templates Prontos**:
   - `cheatsheet.md`: Fórmulas matemáticas de métricas arquiteturais (I, A, D), checklist de limites e resumo dos 11 princípios (SOLID + Componentes).
   - `patterns.md`: Blueprints arquiteturais: Clean Boundary, Humble Object, Package by Component e Test API.
   - `glossary.md`: Glossário técnico bilíngue de termos da Arquitetura Limpa.

---

## Core Frameworks & Mental Models

- **A Regra de Dependência (The Dependency Rule)**:
  *Código-fonte só pode depender para dentro, em direção às políticas de mais alto nível.* Coisas dos círculos externos (Frameworks, Web, DBs, UI) não devem ser conhecidas pelos círculos internos (Casos de Uso, Entidades).
- **Os 4 Círculos Concêntricos**:
  1. **Entidades**: Regras de Negócio Críticas da Empresa (imutáveis diante de mudanças em apps).
  2. **Casos de Uso**: Regras de Negócio da Aplicação (orquestram o fluxo entre entidades e I/O).
  3. **Adaptadores de Interface**: Convertem dados dos casos de uso para o formato exigido pela Web/DB/UI (Controllers, Presenters, Gateways).
  4. **Frameworks & Drivers**: Ferramentas, bancos, bibliotecas e UI (onde o código mais instável vive).
- **Comportamento vs Arquitetura (A Matriz de Eisenhower)**:
  - Fazer o sistema funcionar é urgente, mas de valor secundário.
  - Manter o sistema flexível e fácil de mudar é não-urgente, mas de valor primordial.
  - Desenvolvedores têm o dever ético de lutar pela arquitetura contra a pressão imediatista.
- **O Padrão Humble Object**:
  Dividir comportamentos difíceis de testar em duas partes: um componente "humilde" e sem cérebro (a View ou driver) e um componente com cérebro e desacoplado, facilmente testável via testes unitários (Presenter ou Interactor).
- **A Métrica da Sequência Principal**:
  Balanço ideal entre Instabilidade ($I = Ce / (Ca + Ce)$) e Abstração ($A = Na / Nc$). A distância $|A + I - 1|$ deve ser mínima para evitar a *Zona de Dor* (muito estável e concreto) e a *Zona de Inutilidade* (muito abstrato e ninguém usa).

---

## Chapter Index

| # | Capítulo | Arquivo | Parte |
|---|----------|---------|-------|
| 1 | O que são Design e Arquitetura? | `chapters/01-o-que-sao-design-e-arquitetura.md` | I. Introdução |
| 2 | Um Conto de Dois Valores | `chapters/02-um-conto-de-dois-valores.md` | I. Introdução |
| 3 | Panorama dos Paradigmas | `chapters/03-panorama-dos-paradigmas.md` | II. Paradigmas |
| 4 | Programação Estruturada | `chapters/04-programacao-estruturada.md` | II. Paradigmas |
| 5 | Programação Orientada a Objetos | `chapters/05-programacao-orientada-a-objetos.md` | II. Paradigmas |
| 6 | Programação Funcional | `chapters/06-programacao-funcional.md` | II. Paradigmas |
| 7 | SRP: Responsabilidade Única | `chapters/07-srp-responsabilidade-unica.md` | III. SOLID |
| 8 | OCP: Aberto/Fechado | `chapters/08-ocp-aberto-fechado.md` | III. SOLID |
| 9 | LSP: Substituição de Liskov | `chapters/09-lsp-substituicao-de-liskov.md` | III. SOLID |
| 10 | ISP: Segregação de Interface | `chapters/10-isp-segregacao-de-interface.md` | III. SOLID |
| 11 | DIP: Inversão de Dependência | `chapters/11-dip-inversao-de-dependencia.md` | III. SOLID |
| 12 | Componentes | `chapters/12-componentes.md` | IV. Componentes |
| 13 | Coesão de Componentes (REP, CCP, CRP) | `chapters/13-coesao-de-componentes.md` | IV. Componentes |
| 14 | Acoplamento de Componentes (ADP, SDP, SAP) | `chapters/14-acoplamento-de-componentes.md` | IV. Componentes |
| 15 | O que é Arquitetura? | `chapters/15-o-que-e-arquitetura.md` | V. Arquitetura |
| 16 | Independência | `chapters/16-independencia.md` | V. Arquitetura |
| 17 | Fronteiras: Estabelecendo Limites | `chapters/17-fronteiras-estabelecendo-limites.md` | V. Arquitetura |
| 18 | Anatomia do Limite | `chapters/18-anatomia-do-limite.md` | V. Arquitetura |
| 19 | Política e Nível | `chapters/19-politica-e-nivel.md` | V. Arquitetura |
| 20 | Regras de Negócio | `chapters/20-regras-de-negocio.md` | V. Arquitetura |
| 21 | Arquitetura Gritante | `chapters/21-arquitetura-gritante.md` | V. Arquitetura |
| 22 | A Arquitetura Limpa | `chapters/22-a-arquitetura-limpa.md` | V. Arquitetura |
| 23 | Apresentadores e Objetos Humble | `chapters/23-apresentadores-e-objetos-humble.md` | V. Arquitetura |
| 24 | Limites Parciais | `chapters/24-limites-parciais.md` | V. Arquitetura |
| 25 | Camadas e Limites | `chapters/25-camadas-e-limites.md` | V. Arquitetura |
| 26 | O Componente Main | `chapters/26-o-componente-main.md` | V. Arquitetura |
| 27 | Serviços: Grandes e Pequenos | `chapters/27-servicos-grandes-e-pequenos.md` | V. Arquitetura |
| 28 | O Limite Teste | `chapters/28-o-limite-teste.md` | V. Arquitetura |
| 29 | Arquitetura Embarcada Limpa | `chapters/29-arquitetura-embarcada-limpa.md` | V. Arquitetura |
| 30 | A Base de Dados é um Detalhe | `chapters/30-a-base-de-dados-e-um-detalhe.md` | VI. Detalhes |
| 31 | A Web é um Detalhe | `chapters/31-a-web-e-um-detalhe.md` | VI. Detalhes |
| 32 | Frameworks são Detalhes | `chapters/32-frameworks-sao-detalhes.md` | VI. Detalhes |
| 33 | Estudo de Caso: Vendas de Vídeo | `chapters/33-estudo-de-caso-vendas-de-video.md` | VI. Detalhes |
| 34 | O Capítulo Perdido | `chapters/34-o-capitulo-perdido.md` | VI. Detalhes |
