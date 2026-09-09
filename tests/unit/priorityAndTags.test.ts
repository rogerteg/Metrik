import { describe, it, expect } from 'vitest';
import { PRIORITY_CONFIG, getPriorityConfig } from '../../src/utils/priorityConfig';
import { getTagTheme } from '../../src/utils/tagColors';
import { PriorityLevel } from '../../src/types/kanban';

describe('Priority and Tag Utilities (Foundational)', () => {
  describe('PRIORITY_CONFIG and getPriorityConfig', () => {
    it('defines configs for all 4 priority levels', () => {
      const levels: PriorityLevel[] = ['urgent', 'high', 'medium', 'low'];
      levels.forEach((lvl) => {
        const config = PRIORITY_CONFIG[lvl];
        expect(config).toBeDefined();
        expect(config.level).toBe(lvl);
        expect(config.label).toBeTruthy();
        expect(config.color).toBeTruthy();
        expect(config.bg).toBeTruthy();
      });
    });

    it('returns correct config via getPriorityConfig and undefined for undefined input', () => {
      expect(getPriorityConfig('urgent')?.label).toBe('Urgente');
      expect(getPriorityConfig('high')?.label).toBe('Alta');
      expect(getPriorityConfig('medium')?.label).toBe('Média');
      expect(getPriorityConfig('low')?.label).toBe('Baixa');
      expect(getPriorityConfig(undefined)).toBeUndefined();
    });
  });

  describe('getTagTheme (Deterministic Tag Colors)', () => {
    it('returns consistent theme for identical tag names', () => {
      const theme1 = getTagTheme('Bug');
      const theme2 = getTagTheme('Bug');
      expect(theme1).toEqual(theme2);
    });

    it('is case-insensitive and trims whitespace', () => {
      const themeUpper = getTagTheme('FEATURE');
      const themeLower = getTagTheme('  feature  ');
      expect(themeUpper).toEqual(themeLower);
    });

    it('provides valid CSS color properties in theme object', () => {
      const theme = getTagTheme('DevOps');
      expect(theme.color).toBeTruthy();
      expect(theme.bg).toBeTruthy();
      expect(theme.border).toBeTruthy();
    });

    it('returns fallback theme for empty or whitespace tag', () => {
      const emptyTheme = getTagTheme('   ');
      expect(emptyTheme).toBeDefined();
      expect(emptyTheme.name).toBe('slate');
    });
  });
});
