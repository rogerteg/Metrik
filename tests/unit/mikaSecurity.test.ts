import { describe, it, expect } from 'vitest';
import {
  obfuscateApiKey,
  deobfuscateApiKey,
  maskApiKey,
  isValidGeminiApiKey,
} from '../../src/utils/mikaSecurity';

describe('mikaSecurity', () => {
  const sampleKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q';

  it('deve ofuscar e desofuscar uma chave com integridade bidirecional', () => {
    const obfuscated = obfuscateApiKey(sampleKey);
    expect(obfuscated).not.toBe(sampleKey);
    expect(typeof obfuscated).toBe('string');

    const deobfuscated = deobfuscateApiKey(obfuscated);
    expect(deobfuscated).toBe(sampleKey);
  });

  it('deve lidar graciosamente com strings vazias e nulas', () => {
    expect(obfuscateApiKey('')).toBe('');
    expect(deobfuscateApiKey('')).toBe('');
    // @ts-expect-error teste com valor inválido
    expect(obfuscateApiKey(null)).toBe('');
    // @ts-expect-error teste com valor inválido
    expect(deobfuscateApiKey(undefined)).toBe('');
  });

  it('deve mascarar a chave de API na interface visual preservando o prefixo', () => {
    const masked = maskApiKey(sampleKey);
    expect(masked).toBe('AIzaSy...••••');
    expect(masked).not.toContain(sampleKey.slice(6));
  });

  it('deve mascarar chaves curtas com bullet points', () => {
    expect(maskApiKey('12345')).toBe('••••••••');
    expect(maskApiKey('')).toBe('');
  });

  it('deve validar o formato de chave do Google Gemini', () => {
    expect(isValidGeminiApiKey(sampleKey)).toBe(true);
    expect(isValidGeminiApiKey('AIzaSy123456789012345')).toBe(true);
    expect(isValidGeminiApiKey('curta')).toBe(false);
    expect(isValidGeminiApiKey('AIza com espaco 1234567890')).toBe(false);
    expect(isValidGeminiApiKey('')).toBe(false);
  });
});
