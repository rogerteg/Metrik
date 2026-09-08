# Capítulo 26: O Componente Main

## Core Idea
Em todo sistema existe um componente que é **o plugin mais sujo de todos**: o componente **Main**. O Main é o ponto de entrada do sistema, o detalhe final que configura, instancia as dependências, conecta os adaptadores às abstrações e entrega o controle para os Casos de Uso de alto nível.

## Frameworks Introduced
- **A Natureza do Main (Composition Root)**:
  - O Main é o componente de menor nível possível: ele conhece todos os detalhes concretos, todas as bibliotecas, o banco de dados específico, a porta HTTP e as configurações de ambiente.
  - O Main instancia as fábricas, cria as conexões de banco e as injeta nos casos de uso via interfaces abstratas.
  - Uma vez concluída a injeção, o Main dá partida no motor e sai do caminho.
- **Main como um Plugin Trocável**:
  - Você pode ter múltiplos componentes Main para o mesmo sistema:
    - `MainDev`: Instancia repositórios in-memory para testes locais instantâneos.
    - `MainProd`: Instancia pools de conexão Postgres e clientes AWS.
    - `MainTest`: Configura mocks e dublês para suíte end-to-end.

## Key Concepts
- **Composition Root**: O local único no início da execução da aplicação onde o grafo de dependências é construído.
- **O Plugin mais Sujo**: O Main tem permissão para ser acoplado a tudo, pois nada no sistema depende dele.

## Mental Models
- **A Chave de Ignição e o Motor de Arranque**: O motorista gira a chave (Main); o motor de arranque injeta o combustível e dá a faísca inicial; assim que o motor começa a rodar sozinho, o arranque desengata.

## Anti-patterns
- **Espalhar o `main()` pelo Código**: Ter chamadas de leitura de variáveis de ambiente (`os.getenv()`) e instanciadores de banco espalhados dentro dos Casos de Uso ou Entidades.

## Worked Example
```python
# main.py - O Composition Root (Plugin mais externo)
import os
from infra.postgres_gateway import PostgresUserGateway
from infra.fastapi_app import create_app
from core.use_cases.registrar_usuario import RegistrarUsuarioUseCase

def main():
    # 1. Carrega configurações concretas
    db_url = os.environ.get("DATABASE_URL", "sqlite:///:memory:")
    
    # 2. Instancia infraestrutura de baixo nível
    gateway = PostgresUserGateway(db_url)
    
    # 3. Injeta no Caso de Uso de alto nível
    use_case = RegistrarUsuarioUseCase(user_gateway=gateway)
    
    # 4. Injeta caso de uso no controller HTTP
    app = create_app(registrar_use_case=use_case)
    return app
```
