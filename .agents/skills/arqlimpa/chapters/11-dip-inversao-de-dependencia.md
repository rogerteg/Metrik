# Capítulo 11: DIP - O Princípio da Inversão de Dependência

## Core Idea
O princípio mais importante para a arquitetura limpa: **Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes. Detalhes devem depender de abstrações**.

## Frameworks Introduced
- **Regras para Abstrações Estáveis**:
  1. *Não se refira a classes concretas voláteis*: Use interfaces abstratas em vez disso.
  2. *Não herde de classes concretas voláteis*: Herança é o acoplamento mais forte que existe; herde apenas de abstrações puras.
  3. *Não sobrescreva métodos concretos*: Isso cria dependência implícita com a implementação da superclasse.
  4. *Nunca mencione o nome de nada concreto e volátil*: Encapsule a criação com Fábricas Abstratas (Abstract Factories).
- **A Fronteira Arquitetural Estabelecida pelo DIP**:
  O DIP traça uma linha divisória inquebrável onde o fluxo de execução cruza a fronteira, mas as dependências de código-fonte apontam na direção oposta, em direção à política de mais alto nível.

## Key Concepts
- **Módulo de Alto Nível**: Módulo que contém as regras essenciais de negócio (políticas corporativas).
- **Módulo de Baixo Nível**: Mecanismos de entrega e I/O (SQL, HTTP, Serialização, Drivers).
- **Inversão de Controle (IoC)**: Transferir a responsabilidade de acoplamento do código de negócio para um orquestrador externo (Composition Root).

## Mental Models
- **A Lâmpada e o Interruptor**: O interruptor (conceito de alto nível: comandar energia) não deve depender da fiação específica ou da marca da lâmpada conectada no bocal; ambos dependem do soquete padronizado.

## Anti-patterns
- **Instanciação Direta (`new Concreto()`) no Núcleo de Domínio**: Colocar `new SqlUserRepository()` ou `boto3.client('s3')` dentro de um Caso de Uso ou Entidade.

## Worked Example
```python
# Domínio Central (Alto Nível) - Puro, sem dependência externa
from abc import ABC, abstractmethod

class PagamentoGateway(ABC):
    @abstractmethod
    def autorizar(self, valor_centavos: int) -> bool: pass

class FinalizarCompraUseCase:
    def __init__(self, gateway: PagamentoGateway): # Injeção de dependência
        self.gateway = gateway

    def executar(self, valor: int):
        if not self.gateway.autorizar(valor):
            raise ValueError("Pagamento recusado!")

# Adaptador de Infraestrutura (Baixo Nível) - Círculo Externo
import requests

class StripePagamentoGateway(PagamentoGateway):
    def autorizar(self, valor_centavos: int) -> bool:
        resp = requests.post("https://api.stripe.com/v1/charges", data={"amount": valor_centavos})
        return resp.status_code == 200
```
