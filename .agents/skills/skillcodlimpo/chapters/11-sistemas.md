# Capítulo 11: Sistemas

## Core Idea
A complexidade de um sistema deve ser gerenciada com a mesma disciplina que aplicamos a uma cidade: uma cidade funciona porque possui equipes separadas cuidando de esgoto, energia elétrica, trânsito e segurança. Sistemas limpos separam rigidamente a **fase de construção** (inicialização do grafo de objetos) da **fase de uso** (execução das regras de negócio).

## Frameworks Introduced
- **Separando a Construção do Uso**:
  - O código de negócio nunca deve se preocupar em como as dependências foram criadas.
  - *Lazy Initialization ingênua*: O padrão `if (service == null) service = new RealService()` é um anti-padrão de acoplamento que mistura construção com uso e dificulta os testes de unidade.
- **Injeção de Dependência (Dependency Injection - DI)**:
  - O mecanismo supremo de separação entre construção e uso. A responsabilidade de instanciar e conectar objetos é delegada a um orquestrador dedicado (Composition Root / Container de DI).
- **Escalabilidade e POJOs**:
  - Não cometa o erro de tentar projetar a arquitetura inteira de antemão (Big Design Up Front - BDUF).
  - Mantenha o sistema em POJOs (Plain Old Java Objects / objetos puros na linguagem) e use Programação Orientada a Aspectos (AOP), Decorators ou Interceptors para adicionar preocupações transversais (persistência, transações, segurança) conforme a escala exigir.
- **Decisões Posteradas**:
  - Sistemas limpos permitem adiar decisões técnicas até o último momento responsável, quando a equipe tem dados do mundo real em vez de suposições teóricas.

## Key Concepts
- **Separação de Fase**: Inicialização do sistema vs Ciclo de vida operacional.
- **Inversão de Controle (IoC)**: Delegar o fluxo de dependências a um terceiro.

## Mental Models
- **A Fábrica de Automóveis vs A Condução do Carro**: Você não constrói o chassi e solda as portas enquanto dirige a 120 km/h na estrada; a fabricação acontece no galpão industrial (construção) e o motorista apenas conduz o carro pronto (uso).

## Anti-patterns
- **Acoplamento EJB Clássico**: Forçar objetos de negócio a herdarem de classes de infraestrutura pesada do framework para conseguir transações e persistência.
