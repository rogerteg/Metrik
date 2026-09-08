# Capítulo 34: O Capítulo Perdido (Simon Brown)

## Core Idea
Escrito por Simon Brown (autor do modelo C4): a melhor arquitetura do mundo falhará se a organização dos pacotes em código-fonte permitir que desenvolvedores burlem os limites arquiteturais. O capítulo compara 4 estratégias de empacotamento: **Por Camada**, **Por Recurso**, **Portas e Adaptadores** e a recomendação definitiva: **Pacote por Componente**.

## Frameworks Introduced
- **As 4 Estratégias de Empacotamento**:
  1. **Pacote por Camada (Package by Layer)**:
     - Estrutura horizontal tradicional: `controllers/`, `services/`, `repositories/`.
     - *Falha fatal*: Não grita o negócio; obriga todas as classes a serem públicas (`public`), permitindo que qualquer controller chame qualquer repositório diretamente sem passar pelas regras de negócio.
  2. **Pacote por Recurso (Package by Feature)**:
     - Fatiamento vertical por funcionalidade: `pedidos/` contendo controller, service e repositório juntos.
     - *Melhoria*: Grita o negócio, mas ainda tende a manter classes públicas e não protege limites internos estritos.
  3. **Portas e Adaptadores (Hexagonal Tradicional)**:
     - Separa em `dominio/`, `portas/` e `adaptadores/`.
     - Pode sofrer com proliferação excessiva de pacotes e interfaces burocráticas se não for disciplinada.
  4. **Pacote por Componente (Package by Component - Recomendação de Simon Brown)**:
     - Reúne tudo relacionado a um conceito de negócio em um único componente com uma **única interface pública** de entrada e todas as outras classes de implementação mantidas com visibilidade **de pacote (package-private / internal)**.
     - *A Grande Vitória*: O próprio compilador impede que outros componentes do sistema acessem detalhes internos, repositórios ou dados sem passar pela interface pública autorizada do componente!

## Key Concepts
- **O Diabo está nos Detalhes de Implementação**: Não adianta desenhar caixas lindas no quadro branco se o modificador de acesso `public` permitir atalhos destrutivos no código real.
- **Encapsulamento de Pacote**: Usar os modificadores de acesso da linguagem (package-private em Java, módulos e exports em TS/Python) como guardiões da arquitetura.

## Mental Models
- **A Caixa Preta Selada**: O componente é uma caixa preta com um único botão público na frente; ninguém consegue enfiar a mão por trás para mexer nas engrenagens internas porque a carcaça é blindada pelo compilador.

## Anti-patterns
- **Tornar Tudo Público por Preguiça (`public class`)**: Colocar `public` em todas as classes e interfaces do sistema, destruindo completamente qualquer garantia de encapsulamento arquitetural.
