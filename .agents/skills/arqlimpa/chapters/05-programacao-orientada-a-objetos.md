# Capítulo 5: Programação Orientada a Objetos

## Core Idea
A verdadeira essência e valor arquitetural da Programação Orientada a Objetos (OO) não residem no encapsulamento de dados (já possível em C puro com structs e headers) nem na herança (mero açúcar sintático para ponteiros compostos), mas no **Polimorfismo Seguro**: a capacidade de **inverter dependências em tempo de código-fonte**.

## Frameworks Introduced
- **Inversão de Dependência via Polimorfismo**:
  - *No mundo estruturado tradicional*: O fluxo de controle dita a dependência de código-fonte (se A chama B, o módulo de A precisa importar B).
  - *No mundo OO*: A introdução de uma interface polimórfica permite que o fluxo de controle aponte em uma direção (A chama B via Interface), enquanto a dependência de código-fonte aponta na direção oposta (B implementa a Interface e depende dela).
- **Arquitetura de Plug-ins**:
  Com a inversão de dependência, o arquiteto pode fazer com que qualquer detalhe (Banco de Dados, GUI, Web) torne-se um mero plugin que depende das regras de negócio, e nunca o contrário.

## Key Concepts
- **Encapsulamento**: Ocultação de detalhes internos através de modificadores de acesso (private, protected).
- **Herança**: Compartilhamento estrutural e comportamental hierárquico.
- **Polimorfismo**: Capacidade de objetos de diferentes classes responderem à mesma mensagem com comportamentos específicos.
- **Controle Direcional de Dependências**: O arquiteto escolhe exatamente qual módulo depende de quem, independentemente de quem invoca quem em tempo de execução.

## Mental Models
- **A Tomada de Parede**: A rede elétrica (política central de energia) não sabe o que será plugado nela; o secador ou a TV (detalhes/plugins) implementam o padrão da tomada e dependem dele.

## Anti-patterns
- **Herança Profunda como Reúso**: Criar árvores taxonômicas gigantes de 7 níveis de herança, gerando o problema da *classe base frágil*.

## Worked Example
```python
# Interface definida no domínio central (Alto Nível)
from abc import ABC, abstractmethod

class Notificador(ABC):
    @abstractmethod
    def enviar(self, mensagem: str) -> None:
        pass

# Regra de negócio só conhece a abstração (independe de SMTP, Twilio ou AWS SES)
class ProcessadorPedido:
    def __init__(self, notificador: Notificador):
        self.notificador = notificador

    def finalizar(self):
        # ... lógica de negócio
        self.notificador.enviar("Pedido confirmado!")

# Detalhe concreto implementa a interface no círculo externo (Baixo Nível)
class EmailSmtpNotificador(Notificador):
    def enviar(self, mensagem: str) -> None:
        # Envio via socket SMTP concreto
        pass
```
