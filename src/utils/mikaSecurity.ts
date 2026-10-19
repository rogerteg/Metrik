/**
 * Utilitários de segurança e ofuscação de credenciais da Mika (Feature 048)
 * Atende às especificações em specs/048-mika-ai-flow-copilot/spec.md (Clarification Q5)
 * Princípio de Privacidade: Evitar armazenamento de chaves de API em texto puro no localStorage.
 */

const SALT = 'metrik_mika_flow_2026';

/**
 * Ofusca uma chave de API aplicando XOR simples com salt e codificação Base64.
 */
export function obfuscateApiKey(key: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';

  try {
    const chars = [];
    for (let i = 0; i < trimmed.length; i++) {
      const charCode = trimmed.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length);
      chars.push(String.fromCharCode(charCode));
    }
    return btoa(chars.join(''));
  } catch {
    // Fallback simples se btoa falhar em ambiente atípico
    return btoa(trimmed);
  }
}

/**
 * Desofusca a chave armazenada para permitir requisições ao provedor de IA.
 */
export function deobfuscateApiKey(obfuscated: string): string {
  if (!obfuscated || typeof obfuscated !== 'string') return '';
  const trimmed = obfuscated.trim();
  if (!trimmed) return '';

  try {
    const decoded = atob(trimmed);
    const chars = [];
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length);
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join('');
  } catch {
    try {
      return atob(trimmed);
    } catch {
      return '';
    }
  }
}

/**
 * Mascara a chave de API para exibição segura na interface visual (ex: "AIzaSy...****").
 */
export function maskApiKey(key: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';

  if (trimmed.length <= 8) {
    return '••••••••';
  }

  const prefix = trimmed.slice(0, 6);
  return `${prefix}...••••`;
}

/**
 * Validação básica de formato para chaves do Google Gemini API.
 */
export function isValidGeminiApiKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // Chaves do Google normalmente começam com AIzaSy e têm ~39 caracteres
  return trimmed.length >= 20 && !trimmed.includes(' ');
}
