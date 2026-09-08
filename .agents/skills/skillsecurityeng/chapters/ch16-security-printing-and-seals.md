# Capítulo 16 — Security Printing and Seals

**Livro**: Security Engineering (Anderson) · `chapters/ch16-security-printing-and-seals.md`

## Core Idea
Papel-moeda, passaportes, diplomas, lacres e PIN mailers são exemplos de **security printing**: tornar um objeto físico difícil de falsificar *e* fácil de verificar. Anderson mostra que a segurança desses sistemas depende menos de uma "tinta mágica" e mais de **economia (custo de falsificação vs. valor), controle de materiais, inspeção e do modelo de ameaça** — incluindo o adversário interno ("gundecking" = fraudar a inspeção).

## Frameworks Introduced
- **Threat model de documentos/embalagens**: quem falsifica, com que recursos, para enganar quem.
- Técnicas de **security printing**: tintas especiais (OVI), hologramas, microtexto, papel com marca d'água, guilloché, numeração serial.
- **Seals/embalagens**: lacres de segurança e o papel do **substrato e da cola**.
- **Anti-gundecking**: defesas contra a fraude na *inspeção* (o inspetor que assina sem verificar).
- **Evaluation methodology** para materiais de segurança.

## Key Concepts
- **Threat model peculiar**: o atacante quer criar um objeto *que passe por autêntico na verificação do público/vítima* — não necessariamente idêntico ao original. O verificador (caixa, guarda, consumidor) é o alvo real da enganação.
- **Técnicas de impressão de segurança**: cada uma aumenta o custo/habilidade necessária para falsificar: tintas que mudam de cor (OVI), hologramas, microtexto (difícil de copiar em scanner), marcas d'água, padrões guilloché, séries e numeração.
- **A regra de ouro**: o custo de falsificar deve exceder em muito o valor do que o documento permite obter.
- **Embalagens e lacres**:
  - **Substrate properties**: a embalagem/etiqueta original tem propriedades que a cópia não tem.
  - **Problemas da cola**: o lacre precisa falhar de forma visível e não-transferível (a cola certa é um segredo de design).
  - **PIN mailers**: como entregar um segredo (PIN) por correio de forma que adulteração seja detectável — e como isso falha.
- **Vulnerabilidades sistêmicas**:
  - **Anti-gundecking**: quando a verificação é feita por humanos que podem "assinar sem olhar" (por pressa ou suborno), todo o esquema colapsa.
  - **Efeito da falha aleatória**: se muitos produtos autênticos "falham" na inspeção, o verificador aprende a ignorar o alarme (cry wolf).
  - **Controle de materiais**: se o falsificador obtém o substrato/tinta original (roubo interno), as técnicas não ajudam.
  - **Não proteger as coisas certas**: gastar em holograma caro enquanto o valor está no número serial verificável em banco de dados.
- **Custo e natureza da inspeção**: inspeção eficaz é cara e entediante — e é o elo humano fraco.
- **Evaluation methodology**: avaliar esquemas de impressão de segurança (testar contra falsificadores, não só inspecionar).

## Mental Models
- **"Um selo é tão bom quanto o homem da maleta que o carrega"**: a verificação humana é parte do sistema.
- **Falsificação é um problema econômico**: aumente o custo relativo da falsificação (técnica + material + habilidade).
- **Proteja o *verificador*, não só o objeto**: o documento precisa ser fácil de autenticar pelo público-alvo com treinamento mínimo.
- **Se materiais vazam, nada mais importa** (controle de supply chain).
- **Inspeção humana tende a falhar** (tédio, suborno, pressa) — desenhe para reduzir a dependência dela.

## Anti-patterns
- Confiar em **um único recurso** (ex.: só holograma) facilmente copiável ou obtível.
- Verificação que exige **especialista e equipamento** onde o verificador é um caixa.
- **Gundecking**: inspetores sem incentivo/ferramentas para verificar de verdade.
- Ignorar **vazamento de materiais/insiders** na gráfica.
- Lacres com cola que permite **remoção e reposição** limpa.

## Worked Example
**Cartão de identificação**: em vez de depender só do holograma (que vaza/copia), o cartão combina: (a) **substrato** com propriedade difícil (marca d'água/UV), (b) **microtexto** e guilloché (falham em scanner), (c) **numeração serial** vinculada a um banco de dados que o verificador consulta, (d) **treinamento** do verificador com exemplos reais e falsos, e (e) **auditoria** (amostras verificadas por segundo nível para coibir gundecking). A segurança está no *sistema* (material + dados + inspeção + auditoria), não na peça.

## Key Takeaways
1. Ameaça real: falsificar **o suficiente para enganar o verificador humano**.
2. Custo de falsificação > valor do benefício; use múltiplas técnicas.
3. **Controle de materiais** e **anti-gundecking** são tão importantes quanto a impressão.
4. Projete para o **verificador real** e audite a inspeção.

## Connects To
- Cap. 2 (adversários/insider) — vazamento de materiais.
- Cap. 13 (locks) — a mesma lógica de camadas/dissuasão no físico.
- Cap. 28 (assurance/evaluation) — como avaliar esquemas de segurança.
