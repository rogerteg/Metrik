# Capítulo 7 — Platform Resilience Engineering

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch07-platform-resilience-engineering.md`

## Core Idea
Para que times de engenharia construam com segurança *por padrão*, a segurança precisa virar **plataforma** — um produto interno que resolve problemas reais de usuários internos. Este capítulo ensina o processo de **platform resilience engineering** (visão → problema do usuário → solução → implementação) e apresenta a **Ice Cream Cone Hierarchy of Security Solutions** para escolher o tipo certo de controle, equilibrando **control strategy e resilience strategy**.

## Frameworks Introduced
- **Production pressures** e como influenciam o comportamento do sistema.
- **O que é platform engineering** (segurança como produto).
- Processo: **definir visão → definir problema do usuário → desenhar solução → implementar**.
- **Ice Cream Cone Hierarchy of Security Solutions**.
- **Control strategy vs. resilience strategy**.
- **Experimentação e feedback loops no design de solução**.

## Key Concepts
- **Production pressures**: prazos, metas de feature, incidentes — moldam como os devs realmente se comportam (atalhos, workarounds). Soluções de segurança que ignoram essas pressões falham.
- **Platform engineering**: em vez de um time de segurança "empurrando" regras, construir uma **plataforma interna** (produto) que os times consomem — com UX, docs e suporte. Segurança vira **produto para engenheiros**.
- **Processo de design (product thinking)**:
  1. **Definir uma visão**: o que a plataforma de segurança quer alcançar (ex.: "todo serviço novo nasce com logging de acesso auditável").
  2. **Definir um problema do usuário**: quem é o usuário interno (dev, SRE)? que dor ele tem? **Local context é crítico** — a solução certa depende do contexto da organização.
  3. **Personas, stories e journeys**: entender como os devs realmente trabalham (não como a segurança acha que trabalham).
  4. **Entender trade-offs sob pressão**: humanos sob pressão escolhem o caminho fácil — desenhe para que o caminho fácil seja o seguro.
  5. **Desenhar a solução** (usando a hierarquia abaixo).
  6. **Implementar**: consenso, migração planejada, métricas de sucesso.
- **Ice Cream Cone Hierarchy of Security Solutions** (do topo — mais eficaz — para a base):
  1. **Eliminate hazards**: desenhe o perigo para fora (não crie o componente/estado perigoso).
  2. **Substitute less hazardous methods/materials**: troque por alternativa menos perigosa.
  3. **Safety devices and guards**: contenha por design (sandbox, least privilege, limites técnicos, validação).
  4. **Warning and awareness systems**: avisos, sinais, alertas.
  5. **Administrative controls, guidelines and training**: políticas e treino — o controle mais fraco e o mais usado pela segurança tradicional.
  - Metáfora: a "casquinha" (topo) rende mais por caloria; a base (treino/política) é o sorvete que derrete — depende de humanos seguirem regras.
- **Duas estratégias**: 
  - **Control strategy**: reduzir a *probabilidade* de falha/ataque (prevenir, limitar).
  - **Resilience strategy**: reduzir o *impacto* quando falha (absorver, adaptar, recuperar).
  - Nem tudo é controlável; para o que não é, invista em resiliência. Muitas vezes a resiliência é a aposta mais realista.
- **Experimentation e feedback loops**: teste a solução com usuários e meça; itere (e use experimentos de caos para validar que os guardrails funcionam).

## Mental Models
- **"Segurança é um produto, não uma polícia"**: times adotam o que resolve o problema deles; o resto eles contornam.
- **Suba na casquinha**: eliminar/substituir (design) vale mais que avisar/treinar (comportamento). Se você está dependendo principalmente de treino e política, sua solução é a mais frágil.
- **Desenhe para o humano sob pressão**: o dev sob prazo fará o mais fácil — faça o mais fácil ser o seguro (defaults seguros, golden paths, guardrails).
- **Guarda-corpos, não portões**: guardrails guiam e permitem velocidade; gates bloqueiam e criam atrito (e atalhos).
- **Controle + resiliência**: use controle onde dá para prevenir de forma barata; use resiliência onde a falha é inevitável.

## Anti-patterns
- **Depender de treino/política como controle principal** (base da casquinha) — mais fraco e não escala.
- Time de segurança como **"não" ambulante** (gates/portões) em vez de plataforma com caminhos seguros.
- Soluções desenhadas **sem falar com o usuário interno** (ignorando personas e pressões reais).
- Ignorar o **contexto local** (copiar solução de outra empresa sem adaptar).
- Só **control strategy** (tentar prevenir tudo) sem resiliência para o inevitável.
- Lançar plataforma **sem métricas de sucesso** nem migração planejada.

## Worked Example
**Plataforma de "secure defaults" para novos serviços**: visão — "todo serviço novo nasce seguro por padrão". Problema do usuário — devs não sabem configurar auth/segredos e atrasam. Solução na hierarquia: (a) **eliminar/substituir** — template oficial já usa framework de auth testado (não "rola o próprio"); (b) **guards** — o template aplica least privilege e logging de acesso automaticamente; (c) **avisos** — o CI avisa se segredo for commitado; (d) o **treino** fica só para exceções. Implementação: golden path documentado, migração dos times existentes, e métrica de sucesso (ex.: % de novos serviços com auth auditável). Um experimento de caos (ch. 8) valida: derruba o serviço de auth e vê se os serviços novos degradam com segurança — os guardrails funcionam?

## Key Takeaways
1. Segurança deve ser **plataforma/produto** para engenheiros, desenhada pelo **problema real do usuário** no contexto local.
2. Use a **Ice Cream Cone Hierarchy**: eliminar perigo > substituir > guardas > avisos > treino.
3. Equilibre **control e resilience strategy**; desenhe para o humano sob pressão (caminho fácil = seguro).
4. **Guarda-corpos (guardrails)** em vez de portões; meça com métricas de sucesso e itere com feedback.

## Connects To
- **Ch 2/3**: attacker math e design alimentam quais hazards eliminar.
- **Ch 4**: a plataforma viabiliza o build seguro no CI/CD.
- **Ch 8**: experimentos validam que os guardrails da plataforma funcionam.
- **Conceitos**: platform engineering, threat modeling como serviço, hierarquia de controles de risco (safety).
