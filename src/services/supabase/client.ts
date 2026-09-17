import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string | null;
  hasAnonKey: boolean;
}

let cachedClient: SupabaseClient | null = null;
let clientInitAttempted = false;
let envOverrideForTesting: { url: string | null; anonKey: string | null } | null = null;

/**
 * Permite fixar o ambiente nos testes independentemente de arquivos .env locais.
 */
export function _setSupabaseEnvForTesting(
  override: { url: string | null; anonKey: string | null } | null
): void {
  envOverrideForTesting = override;
  cachedClient = null;
  clientInitAttempted = false;
}

/**
 * Retorna as variáveis de ambiente do Supabase validadas.
 */
export function getSupabaseEnv(): { url: string | null; anonKey: string | null } {
  if (envOverrideForTesting) {
    return envOverrideForTesting;
  }

  let url = import.meta.env?.VITE_SUPABASE_URL?.trim() || null;
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || null;

  // Normalização defensiva: converte link de dashboard para endpoint de API
  if (url && url.includes('supabase.com/dashboard/project/')) {
    const match = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      url = `https://${match[1]}.supabase.co`;
    }
  }

  // Validação para evitar inicializar com placeholders do .env.example
  const isPlaceholderUrl = !url || url.includes('seu-projeto.supabase.co');
  const isPlaceholderKey = !anonKey || anonKey.includes('sua-anon-public-key');

  return {
    url: isPlaceholderUrl ? null : url,
    anonKey: isPlaceholderKey ? null : anonKey,
  };
}

/**
 * Verifica se as credenciais do Supabase foram configuradas no ambiente.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}

/**
 * Retorna o status detalhado da configuração do Supabase.
 */
export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const { url, anonKey } = getSupabaseEnv();
  return {
    isConfigured: Boolean(url && anonKey),
    url: url ? url : null,
    hasAnonKey: Boolean(anonKey),
  };
}

/**
 * Retorna o cliente Supabase singleton. Se as credenciais não estiverem
 * configuradas, retorna null com degradação graciosa (Local-First Sovereignty).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    if (!clientInitAttempted) {
      // Log estruturado conforme Princípio IV da Constituição
      console.info('[Metrik] Supabase credentials not provided. Operating in Local-First autonomous mode.');
      clientInitAttempted = true;
    }
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.info('[Metrik] Supabase client successfully initialized for:', url);
    return cachedClient;
  } catch (error) {
    console.error('[Metrik] Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Permite resetar ou injetar cliente customizado (útil para testes unitários).
 */
export function _resetSupabaseClientForTesting(mockClient: SupabaseClient | null = null): void {
  cachedClient = mockClient;
  clientInitAttempted = false;
}
