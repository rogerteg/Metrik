import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkSprintMigration } from '../../src/services/supabase/syncService';
import {
  _resetSupabaseClientForTesting,
  _setSupabaseEnvForTesting,
} from '../../src/services/supabase/client';

describe('Supabase Schema Migration Guard (OPP-005 / Features 038 & 040)', () => {
  beforeEach(() => {
    _setSupabaseEnvForTesting(null);
    _resetSupabaseClientForTesting(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    _setSupabaseEnvForTesting(null);
    _resetSupabaseClientForTesting(null);
  });

  it('returns applied: false when Supabase client is not configured', async () => {
    _setSupabaseEnvForTesting({ url: null, anonKey: null });
    const result = await checkSprintMigration();

    expect(result.applied).toBe(false);
    expect(result.error).toContain('não está configurado');
  });

  it('detects migration as applied when sprint_id column exists without error', async () => {
    _setSupabaseEnvForTesting({
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key',
    });

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    _resetSupabaseClientForTesting(mockClient as any);

    const result = await checkSprintMigration();

    expect(result.applied).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockClient.from).toHaveBeenCalledWith('tasks');
  });

  it('detects migration as pending when PostgREST returns column does not exist error (42703)', async () => {
    _setSupabaseEnvForTesting({
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key',
    });

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          error: { message: 'column tasks.sprint_id does not exist (code 42703)' },
        }),
      }),
    };
    _resetSupabaseClientForTesting(mockClient as any);

    const result = await checkSprintMigration();

    expect(result.applied).toBe(false);
    expect(result.error).toBe('MIGRATION_PENDING');
  });

  it('handles unexpected network error gracefully during schema check', async () => {
    _setSupabaseEnvForTesting({
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key',
    });

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Network timeout')),
      }),
    };
    _resetSupabaseClientForTesting(mockClient as any);

    const result = await checkSprintMigration();

    expect(result.applied).toBe(false);
    expect(result.error).toBe('Network timeout');
  });
});
