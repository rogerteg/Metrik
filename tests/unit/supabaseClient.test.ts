import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  getSupabaseClient,
  _resetSupabaseClientForTesting,
  _setSupabaseEnvForTesting,
} from '../../src/services/supabase/client';

describe('Supabase Client (Local-First Sovereignty)', () => {
  beforeEach(() => {
    _setSupabaseEnvForTesting({ url: null, anonKey: null });
    _resetSupabaseClientForTesting(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    _setSupabaseEnvForTesting(null);
  });

  it('reports unconfigured when environment variables are not set', () => {
    const status = getSupabaseConfigStatus();
    expect(status.isConfigured).toBe(false);
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns null gracefully and does not throw when credentials are not configured', () => {
    const client = getSupabaseClient();
    expect(client).toBeNull();
  });

  it('allows injecting a mock client for testing and returns the singleton', () => {
    const mockClient = { from: vi.fn() } as any;
    _resetSupabaseClientForTesting(mockClient);

    const client = getSupabaseClient();
    expect(client).toBe(mockClient);
  });

  it('reports configured when valid credentials are set', () => {
    _setSupabaseEnvForTesting({
      url: 'https://kmvjtitcberfjsreolhr.supabase.co',
      anonKey: 'sample-anon-key-metrik',
    });
    expect(isSupabaseConfigured()).toBe(true);
    const status = getSupabaseConfigStatus();
    expect(status.isConfigured).toBe(true);
    expect(status.url).toBe('https://kmvjtitcberfjsreolhr.supabase.co');
  });
});

