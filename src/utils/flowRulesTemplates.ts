/**
 * Metrik — Catálogo de Templates Pré-Configurados de Regras de Fluxo
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { FlowRule } from '../types/flowRules';

export interface FlowRuleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'aging' | 'governance' | 'quality' | 'hygiene';
  ruleTemplate: Omit<
    FlowRule,
    'id' | 'boardId' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastTriggeredAt'
  >;
}

export const FLOW_RULE_TEMPLATES: FlowRuleTemplate[] = [
  {
    id: 'template_aging_in_progress',
    name: 'Sinalizar WIP Aging Crítico',
    description:
      'Eleva a prioridade para Urgente e adiciona tag de alerta quando um cartão passar mais de 3 dias em progresso.',
    category: 'aging',
    ruleTemplate: {
      name: 'Alerta de WIP Aging em Progresso',
      description:
        'Eleva prioridade para urgente e anexa a tag aging-alert após 3 dias em coluna de progresso',
      enabled: true,
      trigger: {
        type: 'aging_threshold_exceeded',
        config: {
          agingThresholdDays: 3,
          targetColumnCategory: 'in_progress',
        },
      },
      conditions: [],
      actions: [
        {
          id: 'action_set_urgent',
          type: 'set_priority',
          payload: { priority: 'urgent' },
        },
        {
          id: 'action_add_aging_tag',
          type: 'add_tag',
          payload: { tag: 'aging-alert' },
        },
        {
          id: 'action_toast_aging',
          type: 'notify_toast',
          payload: {
            toastMessage:
              'Atenção: Cartão excedeu 3 dias em progresso e teve a prioridade elevada.',
          },
        },
      ],
    },
  },
  {
    id: 'template_needs_qa_on_review',
    name: 'Adicionar Tag ao Mover para Revisão',
    description:
      'Anexa automaticamente a tag "needs-qa" sempre que um item for puxado para a etapa de revisão.',
    category: 'quality',
    ruleTemplate: {
      name: 'Adicionar Tag needs-qa em Revisão',
      description: 'Garante identificação visual imediata para revisores de qualidade',
      enabled: true,
      trigger: {
        type: 'card_moved',
        config: {
          targetColumnCategory: 'in_progress',
        },
      },
      conditions: [],
      actions: [
        {
          id: 'action_add_qa_tag',
          type: 'add_tag',
          payload: { tag: 'needs-qa' },
        },
      ],
    },
  },
  {
    id: 'template_high_priority_blocked',
    name: 'Elevar Prioridade se Bloqueado',
    description:
      'Eleva a prioridade do item para Alta e anexa a tag "impedimento" quando for marcado como bloqueado.',
    category: 'governance',
    ruleTemplate: {
      name: 'Elevar Prioridade em Bloqueio',
      description: 'Acelera a resolução de itens impedidos através de sinalização visual imediata',
      enabled: true,
      trigger: {
        type: 'block_status_changed',
        config: {
          blockStatus: 'blocked',
        },
      },
      conditions: [],
      actions: [
        {
          id: 'action_set_high',
          type: 'set_priority',
          payload: { priority: 'high' },
        },
        {
          id: 'action_add_impediment_tag',
          type: 'add_tag',
          payload: { tag: 'impedimento' },
        },
      ],
    },
  },
  {
    id: 'template_clean_triage_tags',
    name: 'Limpar Tags de Triagem ao Iniciar',
    description:
      'Remove tags temporárias como "triagem" ou "backlog" assim que o item entrar em desenvolvimento.',
    category: 'hygiene',
    ruleTemplate: {
      name: 'Remover Tag de Triagem ao Iniciar',
      description:
        'Mantém a higiene visual dos cartões removendo marcadores que não se aplicam a itens em execução',
      enabled: true,
      trigger: {
        type: 'card_moved',
        config: {
          targetColumnCategory: 'in_progress',
        },
      },
      conditions: [
        {
          id: 'cond_has_triage_tag',
          field: 'tags',
          operator: 'contains',
          value: 'triagem',
        },
      ],
      actions: [
        {
          id: 'action_remove_triage',
          type: 'remove_tag',
          payload: { tag: 'triagem' },
        },
      ],
    },
  },
];
