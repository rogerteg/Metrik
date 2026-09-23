import { describe, it, expect } from 'vitest';
import { formatActivityTimestamp, formatActivityActionText } from '../../src/utils/activityFormatter';

describe('activityFormatter utilities', () => {
  describe('formatActivityTimestamp', () => {
    it('formats ISO timestamps into concise Portuguese format (month day às hh:mm am/pm)', () => {
      const isoDate = '2026-06-26T10:26:00.000Z';
      const formatted = formatActivityTimestamp(isoDate);
      expect(formatted).toContain('jun 26 às');
      expect(formatted).toMatch(/jun 26 às \d{1,2}:\d{2} (am|pm)/);
    });

    it('handles afternoon/evening times with pm suffix', () => {
      const isoDate = '2026-07-16T14:36:00.000Z';
      const formatted = formatActivityTimestamp(isoDate);
      expect(formatted).toContain('jul 16 às');
      expect(formatted).toMatch(/jul 16 às \d{1,2}:\d{2} (am|pm)/);
    });

    it('returns empty string when given empty input', () => {
      expect(formatActivityTimestamp('')).toBe('');
    });
  });

  describe('formatActivityActionText', () => {
    it('formats creation event correctly', () => {
      const result = formatActivityActionText({
        actorName: 'Luis Eduardo Ferreira Santos',
        type: 'creation',
      });
      expect(result).toBe('Luis Eduardo Ferreira Santos criou esta tarefa');
    });

    it('formats unassignment event with previous value', () => {
      const result = formatActivityActionText({
        actorName: 'Danillo Barbosa',
        type: 'unassignment',
        previousValue: 'Antonio Carlos Ferreira Batista',
      });
      expect(result).toBe('Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista');
    });

    it('formats status change event with new value', () => {
      const result = formatActivityActionText({
        actorName: 'Maria Silva',
        type: 'status_change',
        newValue: 'Em Progresso',
      });
      expect(result).toBe('Maria Silva alterou o status para: Em Progresso');
    });

    it('falls back to custom actionText if type is unhandled', () => {
      const result = formatActivityActionText({
        actorName: 'Carlos',
        actionText: 'Carlos editou o título',
      });
      expect(result).toBe('Carlos editou o título');
    });
  });
});
