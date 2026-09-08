# Capítulo 16: Independência

## Core Idea
Uma boa arquitetura deve sustentar a independência dos **Casos de Uso**, da **Operação**, do **Desenvolvimento** e da **Implantação**. Ela realiza isso desacoplando camadas horizontais e casos de uso verticais.

## Frameworks Introduced
- **Desacoplamento Horizontal (Camadas)**:
  Separar a interface do usuário (UI), as regras de aplicação (Casos de Uso), as regras corporativas (Entidades) e o armazenamento de dados.
- **Desacoplamento Vertical (Fatiamento por Casos de Uso)**:
  O caso de uso `AdicionarItemAoCarrinho` muda por razões totalmente diferentes do caso de uso `EmitirNotaFiscal`. Fatiar o sistema verticalmente por casos de uso garante isolamento e autonomia.
- **Os Três Modos de Desacoplamento**:
  1. *Nível de Código-Fonte*: Dependências controladas em nível de linguagem (compilam juntos no mesmo processo).
  2. *Nível de Implantação*: Componentes empacotados separadamente (JARs, DLLs) carregados dinamicamente em tempo de execução.
  3. *Nível de Serviço*: Componentes que se comunicam via rede (microsserviços/SOA).
  *Conselho de Uncle Bob*: Comece no nível de código-fonte mantendo os limites limpos; evolua para nível de serviço apenas quando a escala operacional exigir.

## Key Concepts
- **Fatiamento Vertical vs Horizontal**: A arquitetura limpa cruza as camadas horizontais com fatias verticais de casos de uso.
- **Duplicação Real vs Acidental**: Não una códigos parecidos que mudam por razões diferentes (duplicação falsa/acidental); mantenha-os desacoplados.

## Mental Models
- **A Torta em Camadas**: Cortar uma fatia triangular da torta dá a você um pedaço de todas as camadas (UI, Caso de Uso, Dados) para uma funcionalidade específica.

## Anti-patterns
- **Microserviços Prematuros**: Adotar microserviços de rede no primeiro dia de projeto sem limites conceituais claros, trocando chamadas de função locais por falhas de rede e serialização lenta.
