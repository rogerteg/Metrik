import { describe, it, expect } from 'vitest';
import { FLOW_RULE_TEMPLATES } from '../../src/utils/flowRulesTemplates';
import { exportFlowRulesAsJson, importFlowRulesFromJson } from '../../src/utils/flowRulesStorage';
import { FlowRule } from '../../src/types/flowRules';

describe('flowRulesPortability — Templates e Exportação/Importação JSON', () => {
  it('deve fornecer catálogo com pelo menos 4 modelos pré-configurados válidos', () => {
    expect(FLOW_RULE_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    for (const tmpl of FLOW_RULE_TEMPLATES) {
      expect(tmpl.id).toBeTruthy();
      expect(tmpl.name).toBeTruthy();
      expect(tmpl.description).toBeTruthy();
      expect(tmpl.ruleTemplate.trigger).toBeDefined();
      expect(tmpl.ruleTemplate.actions.length).toBeGreaterThan(0);
    }
  });

  it('deve exportar regras em formato JSON estruturado com metadados', () => {
    const rules: FlowRule[] = [
      {
        id: 'r1',
        boardId: 'b-orig',
        name: 'Regra Exportada',
        enabled: true,
        trigger: { type: 'card_moved', config: {} },
        conditions: [],
        actions: [{ id: 'a1', type: 'add_tag', payload: { tag: 'tag-1' } }],
        createdAt: '2026-11-01T00:00:00Z',
        updatedAt: '2026-11-01T00:00:00Z',
        executionCount: 5,
      },
    ];

    const jsonStr = exportFlowRulesAsJson(rules);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.metrikVersion).toBe('1.0');
    expect(parsed.ruleCount).toBe(1);
    expect(parsed.rules).toHaveLength(1);
    expect(parsed.rules[0].name).toBe('Regra Exportada');
  });

  it('deve importar regras reatribuindo IDs e vinculando ao quadro de destino', () => {
    const rawJson = JSON.stringify({
      rules: [
        {
          id: 'old-id',
          name: 'Regra para Importar',
          enabled: true,
          trigger: { type: 'card_moved', config: {} },
          conditions: [],
          actions: [{ id: 'a1', type: 'add_tag', payload: { tag: 'imported' } }],
        },
      ],
    });

    const targetBoardId = 'board-destination';
    const imported = importFlowRulesFromJson(rawJson, targetBoardId);

    expect(imported).toHaveLength(1);
    expect(imported[0].name).toBe('Regra para Importar');
    expect(imported[0].boardId).toBe(targetBoardId);
    expect(imported[0].id).not.toBe('old-id');
    expect(imported[0].executionCount).toBe(0);
  });

  it('deve lançar erro ao tentar importar JSON corrompido ou inválido', () => {
    expect(() => importFlowRulesFromJson('not a json', 'b-dest')).toThrow();
    expect(() => importFlowRulesFromJson('{"invalid": true}', 'b-dest')).toThrow();
  });
});
