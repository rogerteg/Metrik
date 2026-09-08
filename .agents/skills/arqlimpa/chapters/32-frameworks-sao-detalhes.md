# Capítulo 32: Frameworks São Detalhes

## Core Idea
Frameworks são ferramentas poderosas escritas por autores brilhantes, mas eles têm uma intenção que colide frontalmente com a sua: **o autor do framework quer que você se case com ele para sempre, enquanto o arquiteto deve preservar a liberdade de manter opções abertas**.

## Frameworks Introduced
- **O Casamento Assimétrico com Frameworks**:
  - Você assume um compromisso gigantesco com o framework (herda suas classes, usa suas anotações, molda seus modelos ao padrão dele).
  - O autor do framework não assume compromisso nenhum com você (ele pode mudar a API no V2, descontinuar recursos ou reescrever a arquitetura).
- **A Estratégia de Isolamento de Framework**:
  - Trate o framework como um detalhe de borda nos círculos externos da Arquitetura Limpa.
  - Nunca herde classes de framework dentro das suas Entidades ou Casos de Uso.
  - Integre o framework ao sistema através de adaptadores e injeção de dependência na camada mais externa.
- **A Solução: Namoro com Separação de Bens**:
  - Use o framework pelo que ele tem de melhor (roteamento HTTP, injeção de dependência, manipulação de conexões), mas mantenha suas regras de negócio solteiras e independentes.

## Key Concepts
- **Casamento Assimétrico**: O risco de longo prazo de acoplar o núcleo de negócio à biblioteca de um terceiro.
- **Proteção por Adaptadores**: Camada de isolamento que traduz mensagens do framework para os Casos de Uso.

## Mental Models
- **O Carro Alugado**: Use o carro alugado para viajar, mas não instale um motor proprietário nele nem faça a planta da sua casa depender do tamanho daquele porta-malas específico.

## Anti-patterns
- **Subclassing Promíscuo**: Fazer suas entidades centrais herdarem de `models.Model` do Django ou `@Entity` do Spring Data, impossibilitando testá-las sem carregar o ecossistema inteiro do framework.
