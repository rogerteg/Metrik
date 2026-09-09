import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataPortability } from '../../src/hooks/useDataPortability';
import { INITIAL_SEED_TASKS } from '../../src/utils/seedData';

describe('useDataPortability Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports data by creating a blob and triggering download', () => {
    // Mock URL methods
    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const { result } = renderHook(() => useDataPortability());

    result.current.exportData(INITIAL_SEED_TASKS);

    // Verify Blob creation
    expect(createObjectURLMock).toHaveBeenCalled();
    
    // Verify interaction
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
  });

  it('imports valid JSON and calls onSuccess', async () => {
    const { result } = renderHook(() => useDataPortability());
    
    const validJson = JSON.stringify(INITIAL_SEED_TASKS);
    const mockFile = new File([validJson], 'backup.json', { type: 'application/json' });
    
    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Mock FileReader to be synchronous for tests
    const fileReaderMock = {
      readAsText: function(this: any, _file: Blob) {
        this.onload({ target: { result: validJson } } as any);
      }
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => fileReaderMock as any);

    result.current.importData(mockFile, onSuccess, onError);

    expect(onSuccess).toHaveBeenCalledWith(INITIAL_SEED_TASKS);
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError for invalid JSON syntax', async () => {
    const { result } = renderHook(() => useDataPortability());
    
    const invalidJson = '{ corrupted JSON, ';
    const mockFile = new File([invalidJson], 'backup.json', { type: 'application/json' });
    
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const fileReaderMock = {
      readAsText: function(this: any, _file: Blob) {
        this.onload({ target: { result: invalidJson } } as any);
      }
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => fileReaderMock as any);

    result.current.importData(mockFile, onSuccess, onError);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('Erro ao ler o arquivo. Certifique-se de que é um JSON válido.');
  });

  it('calls onError for valid JSON but invalid schema', async () => {
    const { result } = renderHook(() => useDataPortability());
    
    const invalidSchema = JSON.stringify({ wrongProp: true });
    const mockFile = new File([invalidSchema], 'backup.json', { type: 'application/json' });
    
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const fileReaderMock = {
      readAsText: function(this: any, _file: Blob) {
        this.onload({ target: { result: invalidSchema } } as any);
      }
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => fileReaderMock as any);

    result.current.importData(mockFile, onSuccess, onError);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('Formato de arquivo inválido. O JSON não corresponde ao esquema esperado (Metrik V2).');
  });
});
