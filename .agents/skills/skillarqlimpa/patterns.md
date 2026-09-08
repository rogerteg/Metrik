# Padrões Arquiteturais da Arquitetura Limpa (Uncle Bob)

Blueprints e receitas práticas para implementar fronteiras limpas em software de produção.

---

## Padrão 1: A Fronteira Limpa Canônica (The Clean Boundary)
- **Objetivo**: Conectar a entrega externa (Web) ao caso de uso sem vazar dependências.
- **Estrutura**:
  ```text
  [Web Controller]
         │ (chama via Interface)
         ▼
  <<InputBoundary>> (Interface pertencente ao Use Case)
         ▲
         │ (implementa)
  [UseCase Interactor]
         │ (dispara)
         ▼
  <<OutputBoundary>> (Interface pertencente ao Use Case)
         ▲
         │ (implementa)
  [Web Presenter]
         │ (atualiza)
         ▼
  [ViewModel] ──> [View / HTTP Response]
  ```

---

## Padrão 2: O Padrão Humble Object para Gateways de Persistência
- **Objetivo**: Isolar queries SQL e ORMs em classes burras, permitindo testes ultrarrápidos do caso de uso com dublês de teste in-memory.
- **Implementação**:
  ```python
  # 1. Interface no Círculo de Casos de Uso (Pura)
  class PedidoGateway(ABC):
      @abstractmethod
      def buscar_por_id(self, id_pedido: str) -> Optional[Pedido]: pass
      @abstractmethod
      def salvar(self, pedido: Pedido) -> None: pass

  # 2. Humble Object no Círculo de Infraestrutura (Adapters)
  class PostgresPedidoGateway(PedidoGateway):
      def __init__(self, db_session):
          self.session = db_session

      def buscar_por_id(self, id_pedido: str) -> Optional[Pedido]:
          record = self.session.query(PedidoModel).filter_by(id=id_pedido).first()
          if not record: return None
          # Converte registro ORM em Entidade pura
          return PedidoMapper.to_entity(record)
  ```

---

## Padrão 3: Pacote por Componente (Simon Brown / Cap 34)
- **Objetivo**: Fazer com que o compilador e os modificadores de acesso protejam a arquitetura contra atalhos de desenvolvedores indisciplinados.
- **Estrutura**:
  ```text
  faturamento/
    ├── FaturamentoComponent.java      (public interface - único ponto de contato)
    ├── FaturamentoComponentImpl.java  (package-private - implementa a interface)
    ├── FaturamentoUseCase.java        (package-private)
    ├── NotaFiscalEntity.java          (package-private)
    └── FaturamentoRepository.java     (package-private - Ninguém de fora consegue acessar!)
  ```

---

## Padrão 4: A API de Teste (Test API)
- **Objetivo**: Testar casos de uso de ponta a ponta sem acoplar a suíte de testes a botões de tela, rotas HTTP ou seletores CSS voláteis.
- **Estrutura**:
  ```python
  class TestSystemAPI:
      def __init__(self, use_case_factory):
          self.factory = use_case_factory

      def cadastrar_cliente(self, nome: str, email: str) -> str:
          req = CriarClienteRequest(nome=nome, email=email)
          res = self.factory.criar_cliente_use_case().executar(req)
          return res.cliente_id

      def obter_saldo(self, cliente_id: str) -> float:
          return self.factory.consultar_saldo_use_case().executar(cliente_id).saldo
  ```
