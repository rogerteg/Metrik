# Changelog

Todas as mudanças relevantes do Metrik. Formato: [Keep a Changelog]
(https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento semântico.

## [Unreleased]

_(sem alterações desde `v0.1.0`)_

## [0.1.0] - 2026-09-29

### Added

- conflict-aware push by updated_at and auto-sync timestamp
- opt-in automatic sync with debounce
- sync sprints and story points with migration fallback
- quick board menu to move between spaces + a11y polish
- add sprint burnup with burndown/burnup toggle
- add CSV reports for tasks and sprints
- add story points estimation and points velocity
- add sprint filter to the board (Mode 2 delta)
- add derived sprint burndown (ideal vs remaining)
- add local-first sprint planning
- implement Mode 2 delta for card subtask comments
- close cross-browser layout convergence gaps
- tabbed task details with unified activity feed, assignee and flow metrics
- redesign inline task detail with glance summary and quick-edit drawer
- create dedicated design system styles for system settings view
- redesign task details activity panel and objective fields layout
- task activity & comments redesign (Feature 035)
- implement task comments, automated audit log, timeline filters and unit tests for Feature 033
- implement manual and automatic persistence with toolbar, shortcuts and close guard (Feature 032)
- implement premium board management canvas, telemetry cards, and safe modal (feature 031)
- implement categorized flow analytics, SLE metrics, blocker dynamics, and cloud sync (feature 030)
- implement workspace hub, favorite boards and separate settings module (feature 029)
- enforce single-source column geometry and cross-browser parity
- enforce strict movement lock for blocked task cards
- implement work item types, hierarchical linking, cross-squad links, and soft block
- implement user management, teams, invitations, and squad board isolation
- implement theme configuration with light, dark, and neutral modes
- implement throughput histogram and daily run chart analytics
- add specification and requirements checklist for Throughput Histogram and Timeline (021)
- implement Aging WIP Chart with dual collapsible drawers and stage pace percentiles (Feature 020)
- add specification and requirements checklist for WIP Aging Chart (020)
- implement Monte Carlo simulations for project forecasting (feature 019)
- add specification and requirements checklist for monte carlo simulation (019)
- implement advanced CFD with dual inspection, filter drawer and timeline scrubber (Feature 018)
- implement cycle time scatter plot with percentiles and navigation (Feature 017)
- overhaul board and task cards layout to clean Metrik aesthetic
- add acceptance criteria and test scenarios fields to card and modal with organized layout
- block moving blocked tasks between columns until unblocked
- cores clean nos graficos de lead time e throughput e sincronizacao das cores do cfd com as colunas do board
- integrar logotipo oficial do Metrik no header e favicon
- adicionar campos de inicio e fim da tarefa e regra de card marrom para tarefas estagnadas sem movimentacao
- permitir alterar a cor da coluna e aplicar cor da coluna aos cards
- bloqueia retorno de card para tras da direita para esquerda mantendo-o na coluna vigente com alerta Cuidado
- analytics chart expansion modal and CFD full board stages support with real-time sync
- unlock last column reordering, keeping only the first column (To Do) fixed
- column reordering with strict first (To Do) and last (Completed) column lock
- single page kanban layout with horizontal row and resizable columns
- implement column limits, warning banner, and unidirectional flow guard (Feature 014)
- implement flow efficiency and blocked filter (Feature 013)
- implement blocked tasks and impediment tracking (Feature 012)
- implement cumulative flow diagram (CFD) in analytics dashboard (Feature 011)
- implement multi-board support and workspaces (Feature 010)
- implement due dates and overdue alerts (Feature 009)
- implement analytics dashboard with native charts (008)
- implement task details modal and subtasks (007)
- implement dynamic columns (005) and data portability (006)
- implement tags, priority levels, and instant filter toolbar (Feature 004)
- implement native HTML5 drag and drop interaction with visual drop zone and vertical reordering
- implement WIP limits and flow metrics with Lead Time and Cycle Time
- implement Metrik MVP Phase 1 core kanban board with reactive local persistence

### Changed

- trim safe CSS duplicates and add a duplication ratchet
- extract connected board task into BoardTask component
- extract subtask checklist into TaskChecklist component
- extract comment mutations into useTaskComments hook
- unify comment rendering on CommentItem
- split App.css into ordered feature CSS modules
- remove legacy activity panel and duplicate timestamp formatter
- clean up and streamline kanban card layout and QA section

### Fixed

- apply pulled data by reloading the app
- restore header cluster styles and graceful wrap
- recover the full workspace hub CSS (unstyled sidebar)
- restore workspace hub styles and enable board configuration
- accurate stagnation, explicit guest read-only, modal comment editing
- close blocked-move convergence gaps
- enable vertical scrolling and custom scrollbars in manage boards view
- enable smooth vertical scrolling in system settings container
- remove unused declaration of hasQualityContent
- specify explicit .tsx extensions in activity component test imports
- add standard background-clip property and refine TaskActivityLogList styling
- convert task details modal layout from uncompiled tailwind to metrik vanilla css design system
- adjust app-header and user-profile stacking context to float dropdown above metrics cards
- resolve stacking context collision on admin menu and reorganize header clusters

### Performance

- split vendor chunks and lazy-load the analytics dashboard

### Docs

- close requirements and quality checklists (T018)
- add Mode 2 change proposal for the remaining delta
- reconcile 027 spec vs code and archive delivered legacy specs
- install SDD spec-driven skill and project memory
- reconcile spec, plan, research, data model and tasks
- ratify v1.6.0 with Principle IX (User Data Integrity & Draft Protection)
- add specifications, architecture, and tasks with reasoning models for premium board management
- update tasks with execution order, dependencies, and implementation strategy
- add header layout and accessibility review checklist
- add research, plan, data model, contract, and tasks with reasoning models
- specify admin menu unblocking and header layout reorganization
- add specification, research, plan, data model, contract, and tasks with reasoning models
- add specification, research, plan, and tasks for cross-browser column layout
- update tasks.md with user-story phase mapping and constitution VI reasoning
- add tasks breakdown with analytical reasoning models
- add research, data-model, quickstart, and implementation plan
- add domain review checklist for blocked card movement lock
- ratify clarified decisions from /speckit-clarify
- specify strict movement lock for blocked cards
- link GitHub issues #44-#50 in spec.md
- update spec, plan, quickstart, and checklists status to Implemented & Converged
- add tasks breakdown with analytical reasoning models
- add research, data-model, quickstart, and implementation plan
- add requirements quality and domain review checklists
- clarify cross-squad discovery, soft block dependency, and card badge layout
- specify task types (cards, subtasks, initiatives) and cross-squad linking
- update spec status to Implemented & Verified
- add research, data-model, quickstart, plan, and tasks with analytical models
- specify theme configuration (light, dark, neutral)
- update spec status to Implemented & Verified
- add quickstart.md documentation
- add research.md and data-model.md with theoretical grounding and typing
- generate tasks.md with analytical reasoning models and MECE breakdown
- update plan.md with standardized header
- update requirements checklist status to clarified & approved
- update spec with clarify decisions and plan
- add research and data model documentation for WIP Aging Chart (Feature 020)
- add tasks breakdown with analytical reasoning models for WIP Aging Chart (Feature 020)
- add implementation plan for WIP Aging Chart (Feature 020)
- update checklist with clarified drawer and pace percentiles decisions
- record clarifications for aging wip chart (drawers and stage-based pace percentiles)
- converge feature 019 and add quickstart verification guide
- add tasks breakdown with analytical reasoning models for monte carlo simulation
- add research and data model documentation for monte carlo simulation
- add implementation plan for monte carlo simulation feature
- expand specification quality checklist for monte carlo feature
- converge and ratify Feature 016 documentation
- converge specifications, technical plan, and task records for Feature 015

### Tests

- accept a samples directory in the parity comparator
- cover inline subtask create/toggle/remove (T005)
- add jest-axe accessibility audit for core surfaces
- add cross-browser parity measurement harness for T023/T024

### Maintenance

- adopt Prettier and format the codebase
- add ESLint 9 gate and wire it into CI
- add coverage gate and GitHub Actions CI
- scope vitest to project tests
- add multimodal-prompt-master skill
- upgrade to 1.0.11 and configure agy integration
- overhaul kanban card design with glassmorphism and modern micro-badge aesthetics
- quote descriptions in skilltdd and tdd frontmatter
- update constitution to v1.4.0 and strengthen governance
- update constitution to v1.2.0 and polish cfd specs

### Other

- generate dependency-ordered tasks for feature 029 with mandatory Constitution VI models
- complete implementation plan and design artifacts for feature 029 (plan.md, research.md, data-model.md, contracts, quickstart)
- incorporate clarifications into feature 029 (navigation, full-view settings, brownfield migration)
- specify feature 029 workspace hub and settings (spec.md and requirements checklist)
- Create README.md with project details and setup instructions
- initial commit: initialize Metrik project with specify-cli and constitution

