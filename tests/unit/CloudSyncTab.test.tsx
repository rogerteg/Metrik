import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CloudSyncTab } from '../../src/components/Settings/CloudSyncTab';
import {
  _resetSupabaseClientForTesting,
  _setSupabaseEnvForTesting,
} from '../../src/services/supabase/client';

describe('CloudSyncTab Component', () => {
  beforeEach(() => {
    _setSupabaseEnvForTesting({ url: null, anonKey: null });
    _resetSupabaseClientForTesting(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    _setSupabaseEnvForTesting(null);
  });

  it('renders the status card indicating Local-First mode when not configured', () => {
    render(
      <CloudSyncTab
        workspaces={[]}
        boards={[]}
      />
    );

    expect(screen.getByText('Modo Local-First Ativo (Sem Nuvem)')).toBeInTheDocument();
    expect(screen.getByText(/Seus dados estão seguros e salvos exclusivamente no armazenamento local/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Testar Conexão/i })).toBeInTheDocument();
  });

  it('disables sync and test buttons when not configured', () => {
    render(
      <CloudSyncTab
        workspaces={[]}
        boards={[]}
      />
    );

    const testBtn = screen.getByRole('button', { name: /Testar Conexão/i });
    const pushBtn = screen.getByRole('button', { name: /Enviar Dados Locais/i });
    const pullBtn = screen.getByRole('button', { name: /Baixar Dados da Nuvem/i });

    expect(testBtn).toBeDisabled();
    expect(pushBtn).toBeDisabled();
    expect(pullBtn).toBeDisabled();
  });

  it('renders the setup guide with instructions for .env and schema.sql', () => {
    render(
      <CloudSyncTab
        workspaces={[]}
        boards={[]}
      />
    );

    expect(screen.getByText(/Como Conectar seu Projeto Supabase/i)).toBeInTheDocument();
    expect(screen.getByText(/supabase\/schema.sql/i)).toBeInTheDocument();
    expect(screen.getByText(/VITE_SUPABASE_URL=/i)).toBeInTheDocument();
  });
});
