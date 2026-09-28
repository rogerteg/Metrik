# Lessons Learned — Metrik

> Memória de aprendizado do projeto (skill `sdd-spec-driven`, Seção 10).
> Regra: mais recente no topo; nunca remover lições; marcar `[SUPERADA por #N]` quando aplicável.
> Antes de implementar, leia a categoria relevante; antes de criar um novo padrão, verifique se já existe lição.

---

## 10.1 ✅ Padrões que Funcionam

- **2026-09-25 | Redesenho do "Detalhes da Tarefa"** | Preservar contratos de teste (`data-testid`, `aria-label`, textos visíveis, placeholders) ao reestruturar a UI em abas permitiu evoluir layout e componentização sem regressão de comportamento. | A suíte de 1.127 testes permaneceu verde mesmo trocando a arquitetura visual.
- **2026-09-25 | CSS** | Centralizar o feed de atividade em um único arquivo com prefixo próprio (`mrf-*`) e tokens semânticos (`var(--text-primary)`, `var(--color-progress)`, …) garantiu funcionamento em dark/light/neutral. | Evita cores fixas que quebram em tema claro.
- **2026-09-25 | Verificação sem navegador** | Gerar preview estático renderizando os componentes em jsdom, serializando o HTML e injetando o CSS de produção (`dist/assets/*.css`) permitiu validar visualmente sem browser conectado. | Fluxo aplicado em `scratch/preview/*.preview.test.tsx`.
- **2026-09-25 | Transparência por dados existentes** | Derivar métricas de fluxo apenas de campos já persistidos (`createdAt`, `startedAt`, `completedAt`, `totalBlockedMs`, `subtasks`, `comments`, `activityLog`, `links`) entregou valor sem alterar o modelo de dados. | Respeita o Princípio V (YAGNI).
- **2026-09-28 | Canal de notificação não-obstrutivo** | Injetar `onNotify` opcional em `useTaskCollection` e plugá-lo no `ToastNotification` do `App` removeu `window.alert` dos guards de bloqueio sem acoplar o hook à UI; testes passam a injetar um espião e a provar que nenhum alerta é disparado. | Mantém o domínio testável e sem trava de thread (research Decisão 5 / Constituição III).
- **2026-09-28 | Comentários reutilizáveis (027 delta)** | Extrair a UI de comentários para `CommentThread` e as regras para helpers puros em `cardComments.ts` permitiu entregar cartão pai **e** subtarefa com um único componente e permissões testáveis, sem reescrever o modal. | Um componente + um módulo puro cobrem várias superfícies com risco baixo.
- **2026-09-28 | Somente-leitura explícito (P1)** | Trocar callbacks no-op do guest (`isGuest ? () => {} : fn`) por uma prop `isReadOnly` no cartão eliminou a "edição fantasma" e deixou a UI honesta (campos desabilitados, ações ocultas) mantendo handlers reais. | Componentes com `readOnly`/`disabled` nativos (`AutoResizeTextarea`, `TagList`, `PriorityBadge`) tornaram a mudança barata.

## 10.2 ❌ Anti-Padrões — Não Repetir

- **2026-09-28 | Escopo** | Ao trocar `window.alert` por notificação não-obstrutiva, substituir também os avisos de movimento retrógrado (feature 014) extrapola o escopo de 025 e quebra testes que dependem do alerta. | A convergência deve tocar só os guards nomeados na tarefa; o canal de UI é reutilizável depois, em mudança própria com testes atualizados.
- **2026-09-25 | Estilo** | Usar classes utilitárias de um framework CSS que **não está instalado nem configurado** no projeto (sem dependência em `package.json`, sem plugin no `vite`, sem CDN no `index.html`). Resultado: a área de atividade/comentários do modal ficou sem estilo (ex.: `bg-slate-900/50`, `rounded-xl`, `text-cyan-400` inertes). | Classes são texto morto; o defeito só aparece em runtime. | **Alternativa:** CSS vanilla com tokens do Metrik; se um framework for desejado, instalá-lo e provar no CSS de produção antes de usar.
- **2026-09-25 | Arquitetura de UI** | Manter **dois** sistemas de atividade/comentário no mesmo modal (feed na coluna principal + painel na lateral), cada um com seu compositor. | Duplicação de fonte de verdade e confusão de UX. | **Alternativa:** uma única trilha unificada.
- **2026-09-25 | Governança** | Referenciar nomes de marcas de produtos de inspiração/frameworks em comentários de código-fonte (vedado pelo Princípio VII). | Vazamento de marca. | **Alternativa:** termos neutros e canônicos do Metrik Design System.

## 10.3 🔄 Decisões Revertidas

- **2026-09-25 | Detalhe inline no cartão** | Versão inicial exibia apenas um toggle "Critérios / Testes" sem conteúdo no estado recolhido. | Não dava contexto; edição apertada em card de ~220–290px. | Recolhido agora mostra chips de presença (checklist/descrição/critérios/testes); expandido virou gaveta com descrição, checklist interativo e atalho para o detalhe completo.
- **2026-09-25 | Modal** | Layout anterior exibia a atividade na lateral **e** o histórico na coluna principal. | Duplicação. | Unificada em aba "Atividade".

## 10.4 ⚡ Armadilhas de Performance

- **2026-09-25 | Build** | Bundle único de ~780 KB (aviso do Vite). | Sem code-splitting; charts/analytics no chunk inicial. | ✅ **Resolvido:** `manualChunks`/`import()` dinâmico em analytics (commits `perf(build)`).
- **2026-09-25 | Suíte de testes** | Vitest varre `.kilo/worktrees/**` e roda a suíte em duplicidade (~193 arquivos em vez de ~96). | `vite.config.ts` sem `test.exclude`. | ✅ **Resolvido:** escopo de testes limitado ao projeto (commit `chore(test)`); suíte atual = 94 arquivos.

## 10.5 🔒 Lições de Segurança

- **2026-09-25 | Dados sensíveis** | Credenciais Supabase ficam em `.env` (ignorado) e o app opera em modo local-first quando ausentes. | — | Manter segredos fora do código (Constituição, Security & Technical Standards).
- **2026-09-25 | Isolamento por squad** | Restrição de acesso é aplicada em `useBoards`, `useTeamAccess`, `BoardSwitcher` e `RestrictedBoardFallback`. | — | Verificar os 4 pontos ao alterar fluxos de acesso (Princípio VIII).

## 10.6 🧪 Lições de Testes

- **2026-09-28 | Estabilidade** | Com 97 arquivos rodando em paralelo, testes pesados de App/Board estouravam o `testTimeout` padrão de 5s e geravam vermelho falso (passavam isolados em ~1s). | **Solução:** `testTimeout: 15000` no `vite.config.ts`.

- **2026-09-25 | Contratos de UI** | Testes que travam posição/estrutura de badges (`task-indicator-badge`, `getAllByRole('checkbox')[0]`) quebram com redesign inofensivo. | Ordem de checkboxes era sensível à presença do compositor no DOM. | **Alternativa:** consultar por `data-testid`/`aria-label` estáveis e, ao mudar a intenção visual, atualizar o teste de design (sem afrouxar o comportamento).
- **2026-09-25 | Markdown** | `ActivityFeedRedesign.test.tsx` exige a classe `font-mono` no elemento `<code>` (herança de utilitário). | — | Mantida a classe e definido `.font-mono` no CSS vanilla para não depender de framework.
- **2026-09-25 | Autosave** | Testes de autosave/guarda de fechamento consultam placeholders exatos (ex.: "Adicione uma descrição detalhada..."). | — | Ao reescrever o modal, manter esses ganchos ou atualizar spec e testes de forma explícita.

## 10.7 🤝 Lições de Integração

- **2026-09-28 | Verificação de paridade cross-browser** | Este ambiente **não** tem navegador desktop conectado nem múltiplos motores instalados; a matriz Edge/Chrome/Firefox/Safari (T023/T024 da feature 026) não pode ser executada aqui. | Paridade fica coberta por invariantes/contratos; a medição física permanece pendente. | Registrar como bloqueio de ambiente e nunca marcar verde sem a medição real exigida pela spec.
- **2026-09-25 | Supabase** | Sincronização é opcional, não-bloqueante e tolerante a falhas; ausência de credenciais não pode quebrar a inicialização. | — | Preservar comportamento offline autônomo (Princípio VIII).
- **2026-09-25 | Fontes** | Tipografia vem de Google Fonts via `<link>` em `index.html`. | Dependência de rede na primeira carga. | Considerar fallback local se o ambiente exigir offline.

---

*Atualizado em: 2026-09-28.*
