# Cheatsheet de Bolso: Arquitetura Limpa (Robert C. Martin - Uncle Bob)

Guia rápido de referência com fórmulas, métricas, princípios e checklists da Arquitetura Limpa.

---

## 1. Princípios de Design de Classes (SOLID)

| Princípio | Enunciado Arquitetural | Sintoma de Violação |
|---|---|---|
| **SRP** (Responsabilidade Única) | Um módulo deve ter uma, e apenas uma, razão para mudar (responder a um único ator). | Duplicação acidental de funções comuns; conflitos frequentes de merge no Git. |
| **OCP** (Aberto/Fechado) | Aberto para extensão, fechado para modificação via controle direcional de dependências. | Adicionar uma nova funcionalidade exige editar dezenas de arquivos existentes. |
| **LSP** (Substituição de Liskov) | Subtipos devem ser intercambiáveis pelos tipos base sem quebrar contratos. | `instanceof` espalhado no código; métodos lançando `NotImplementedException`. |
| **ISP** (Segregação de Interfaces) | Não force clientes a dependerem de métodos de que não precisam. | Interfaces com dezenas de métodos onde clientes implementam métodos vazios. |
| **DIP** (Inversão de Dependência) | Alto nível não depende de baixo nível; ambos dependem de abstrações estáveis. | `new Concreto()` dentro das regras de negócio; importação de ORMs no domínio. |

---

## 2. Princípios de Coesão de Componentes

- **REP (Release/Reuse Equivalency)**: A unidade de reúso é a unidade de release (versionados juntos).
- **CCP (Common Closure)**: Reúna classes que mudam juntas pelas mesmas razões (o SRP dos componentes).
- **CRP (Common Reuse)**: Não force dependência de classes que você não utiliza (o ISP dos componentes).

---

## 3. Princípios e Métricas de Acoplamento de Componentes

- **ADP (Acyclic Dependencies)**: O grafo de dependências entre componentes não pode ter ciclos.
- **Métrica de Instabilidade ($I$)**:
  $$I = \frac{Ce}{Ca + Ce}$$
  - $Ca$ = Acoplamento Aferente (classes externas que dependem deste componente).
  - $Ce$ = Acoplamento Eferente (classes deste componente que dependem do exterior).
  - $I = 0$: Máxima estabilidade (difícil de mudar, muitos dependentes).
  - $I = 1$: Máxima instabilidade (fácil de mudar, ninguém depende dele).
- **SDP (Stable Dependencies)**: Dependa sempre na direção da estabilidade (módulos instáveis dependem de estáveis).
- **Métrica de Abstração ($A$)**:
  $$A = \frac{Na}{Nc}$$
  - $Na$ = número de classes/interfaces abstratas; $Nc$ = total de classes.
- **SAP (Stable Abstractions)**: Um componente deve ser tão abstrato quanto é estável.
- **A Sequência Principal e a Distância ($D$)**:
  $$D = |A + I - 1|$$
  - Deve estar próxima de zero. Evite a **Zona de Dor** ($A=0, I=0$) e a **Zona de Inutilidade** ($A=1, I=1$).

---

## 4. Os 4 Círculos Concêntricos & A Regra de Dependência

```text
[Frameworks & Drivers (Web, DB, Devices, UI)]
      │
      ▼
[Interface Adapters (Controllers, Presenters, Gateways)]
      │
      ▼
[Application Business Rules (Casos de Uso / Interactors)]
      │
      ▼
[Enterprise Business Rules (Entidades Críticas)]
```
*A Regra Inegociável*: Dependências de código-fonte **só podem apontar para dentro**. O círculo interno não sabe nada sobre o círculo externo.

---

## 5. Checklist de Auditoria de Arquitetura Limpa

- [ ] As Entidades e Casos de Uso possuem zero imports de frameworks web (Flask, Spring, Express)?
- [ ] O banco de dados é acessado exclusivamente através de interfaces de Gateways/Repositories definidas pelo núcleo?
- [ ] Os testes unitários de casos de uso executam sem subir servidor HTTP e sem banco de dados ativo?
- [ ] As telas são "Humble Objects" alimentadas por ViewModels burros gerados por Presenters testáveis?
- [ ] A estrutura de pastas grita o domínio e as intenções de negócio em vez do framework utilizado?
