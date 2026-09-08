# Capítulo 8: OCP - O Princípio Aberto/Fechado

## Core Idea
Enunciado por Bertrand Meyer em 1988: **Um artefato de software deve estar aberto para extensão, mas fechado para modificação**. O objetivo é tornar o sistema extensível sem que a adição de novos comportamentos exija a alteração do código existente já testado e em produção.

## Frameworks Introduced
- **Controle Direcional de Dependências**:
  Para proteger um componente A de mudanças em um componente B, A não pode saber da existência de B. Logo, B deve depender de abstrações criadas e pertencentes a A.
- **Hierarquia de Níveis de Proteção**:
  - *Mais protegido*: As Regras de Negócio Interactor / Casos de Uso (não conhecem ninguém).
  - *Nível intermediário*: Presenters e Controllers.
  - *Menos protegido / Mais volátil*: Telas, Relatórios PDF, APIs Web e Bancos de Dados.
- **Ocultando Informações via Interfaces**:
  O uso de interfaces de exclusão de visão impede que clientes de alto nível saibam detalhes transitórios de baixo nível.

## Key Concepts
- **Extensão sem Modificação**: Adicionar um novo relatório gerando uma nova classe, sem alterar nenhuma linha do motor de cálculo central.
- **Inversão de Dependência a Serviço do OCP**: Interfaces posicionadas na fronteira de quem precisa ser protegido.

## Mental Models
- **A Entrada USB**: Quando você conecta um novo microfone USB no computador, não precisa abrir a placa-mãe e ressoldar circuitos; o microfone implementa a especificação USB existente.

## Anti-patterns
- **Switches de Tipo em Cascata**: Ter um `switch (tipo_pagamento)` espalhado por 15 arquivos diferentes do sistema, exigindo editar todos eles toda vez que um novo método de pagamento (ex: Pix) for lançado.

## Worked Example
```python
# OCP aplicado a relatórios financeiros
from abc import ABC, abstractmethod

class ExportadorRelatorio(ABC):
    @abstractmethod
    def exportar(self, dados: dict) -> bytes: pass

# Novos formatos são adicionados sem alterar o gerador central
class ExportadorPdf(ExportadorRelatorio):
    def exportar(self, dados: dict) -> bytes:
        return b"%PDF-1.4..."

class ExportadorJson(ExportadorRelatorio):
    def exportar(self, dados: dict) -> bytes:
        import json
        return json.dumps(dados).encode()

class ServicoGeracaoRelatorio:
    def __init__(self, exportador: ExportadorRelatorio):
        self.exportador = exportador

    def executar(self, dados: dict) -> bytes:
        # Regra de negócio de validação e processamento...
        return self.exportador.exportar(dados)
```
