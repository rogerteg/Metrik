import React, { useState, useEffect } from 'react';
import { getSupabaseConfigStatus } from '../../services/supabase/client';
import {
  testConnection,
  pushToSupabase,
  pullFromSupabase,
  ConnectionTestResult,
} from '../../services/supabase/syncService';
import { Workspace } from '../../types/workspace';
import { BoardModel, BoardState } from '../../types/kanban';

export interface CloudSyncTabProps {
  workspaces: Workspace[];
  boards: BoardModel[];
  onShowToast?: (message: string, type: 'success' | 'warning' | 'error') => void;
  onApplyRemoteData?: (payload: {
    workspaces: Workspace[];
    boards: BoardModel[];
    tasksByBoardId: Record<string, BoardState>;
  }) => void;
}

export const CloudSyncTab: React.FC<CloudSyncTabProps> = ({
  workspaces,
  boards,
  onShowToast,
  onApplyRemoteData,
}) => {
  const [configStatus, setConfigStatus] = useState(getSupabaseConfigStatus());
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    setConfigStatus(getSupabaseConfigStatus());
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testConnection();
    setTestResult(result);
    setIsTesting(false);

    if (onShowToast) {
      onShowToast(result.message, result.ok ? 'success' : 'warning');
    }
  };

  const handlePushToCloud = async () => {
    if (!configStatus.isConfigured) {
      if (onShowToast) onShowToast('Configure as credenciais do Supabase no .env antes de sincronizar.', 'warning');
      return;
    }

    setIsPushing(true);

    // Coletar tasks locais de todos os boards no localStorage
    const tasksByBoardId: Record<string, BoardState> = {};
    for (const board of boards) {
      try {
        const raw = localStorage.getItem(`metrik-tasks-${board.id}`);
        if (raw) {
          tasksByBoardId[board.id] = JSON.parse(raw);
        }
      } catch (err) {
        console.warn(`[Metrik] Could not load local tasks for board ${board.id}`, err);
      }
    }

    const result = await pushToSupabase({
      workspaces,
      boards,
      tasksByBoardId,
    });

    setIsPushing(false);

    if (result.ok) {
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncTime(nowStr);
      const msg = `Sincronização concluída: ${result.syncedCount.workspaces} espaços, ${result.syncedCount.boards} quadros e ${result.syncedCount.tasks} tarefas salvas na nuvem.`;
      if (onShowToast) onShowToast(msg, 'success');
    } else {
      if (onShowToast) onShowToast(`Falha no envio: ${result.error}`, 'error');
    }
  };

  const handlePullFromCloud = async () => {
    if (!configStatus.isConfigured) {
      if (onShowToast) onShowToast('Configure as credenciais do Supabase no .env antes de sincronizar.', 'warning');
      return;
    }

    if (!window.confirm('Baixar os dados da nuvem atualizará seu armazenamento local com os dados remotos. Deseja continuar?')) {
      return;
    }

    setIsPulling(true);

    const result = await pullFromSupabase();
    setIsPulling(false);

    if (result.ok && result.data) {
      const { workspaces: remoteWs, boards: remoteBoards, tasksByBoardId: remoteTasks } = result.data;

      // Salvar no localStorage
      try {
        if (remoteWs.length > 0) {
          localStorage.setItem('metrik_workspaces', JSON.stringify(remoteWs));
        }
        if (remoteBoards.length > 0) {
          localStorage.setItem('metrik-boards-index', JSON.stringify(remoteBoards));
        }
        for (const [boardId, boardState] of Object.entries(remoteTasks)) {
          localStorage.setItem(`metrik-tasks-${boardId}`, JSON.stringify(boardState));
        }
      } catch (err) {
        console.error('[Metrik] Failed to save remote data locally:', err);
      }

      const nowStr = new Date().toLocaleTimeString();
      setLastSyncTime(nowStr);

      if (onApplyRemoteData) {
        onApplyRemoteData({
          workspaces: remoteWs,
          boards: remoteBoards,
          tasksByBoardId: remoteTasks,
        });
      }

      if (onShowToast) {
        onShowToast('Dados remotos baixados e aplicados com sucesso!', 'success');
      }
    } else {
      if (onShowToast) onShowToast(`Falha ao baixar dados: ${result.error}`, 'error');
    }
  };

  return (
    <div className="settings-tab-content cloud-sync-tab" role="tabpanel" aria-label="Nuvem & Supabase">
      {/* Banner de Status */}
      <div className="cloud-status-card">
        <div className="cloud-status-header">
          <div className="cloud-status-indicator">
            <span
              className={`status-dot ${
                configStatus.isConfigured
                  ? testResult?.ok
                    ? 'status-connected'
                    : testResult
                    ? 'status-error'
                    : 'status-configured'
                  : 'status-unconfigured'
              }`}
            />
            <div>
              <h3 className="cloud-status-title">
                {configStatus.isConfigured
                  ? testResult?.ok
                    ? 'Conectado ao Supabase'
                    : testResult
                    ? 'Falha de Conexão'
                    : 'Configurado (Pronto para Testar)'
                  : 'Modo Local-First Ativo (Sem Nuvem)'}
              </h3>
              <p className="cloud-status-subtitle">
                {configStatus.isConfigured
                  ? `Projeto: ${configStatus.url}`
                  : 'Seus dados estão seguros e salvos exclusivamente no armazenamento local do navegador.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="settings-action-btn secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !configStatus.isConfigured}
            id="btn-test-supabase"
          >
            {isTesting ? 'Testando Conexão...' : 'Testar Conexão'}
          </button>
        </div>

        {testResult && (
          <div className={`connection-feedback-box ${testResult.ok ? 'success' : 'error'}`}>
            <span className="feedback-icon">{testResult.ok ? '✓' : '⚠️'}</span>
            <span className="feedback-text">{testResult.message}</span>
            {testResult.latencyMs && (
              <span className="feedback-latency">({testResult.latencyMs}ms)</span>
            )}
          </div>
        )}

        {lastSyncTime && (
          <div className="last-sync-tag">
            Última sincronização realizada às {lastSyncTime}
          </div>
        )}
      </div>

      {/* Seção de Sincronização Sob Demanda */}
      <div className="cloud-sync-section">
        <h4 className="cloud-section-heading">Sincronização de Dados</h4>
        <p className="cloud-section-description">
          Envie o estado completo dos seus espaços, quadros e cartões locais para a nuvem ou recupere o estado salvo no Supabase.
        </p>

        <div className="cloud-action-cards-grid">
          <div className="cloud-action-card">
            <div className="cloud-action-info">
              <div className="cloud-action-icon push-icon">☁️ ⬆️</div>
              <div>
                <h5>Enviar para o Supabase (Push)</h5>
                <p>Salva espaços, quadros e todas as tarefas locais no banco de dados PostgreSQL remoto.</p>
              </div>
            </div>
            <button
              type="button"
              className="settings-action-btn primary"
              onClick={handlePushToCloud}
              disabled={isPushing || !configStatus.isConfigured}
              id="btn-push-supabase"
            >
              {isPushing ? 'Enviando Dados...' : 'Enviar Dados Locais'}
            </button>
          </div>

          <div className="cloud-action-card">
            <div className="cloud-action-info">
              <div className="cloud-action-icon pull-icon">☁️ ⬇️</div>
              <div>
                <h5>Baixar do Supabase (Pull)</h5>
                <p>Recupera os dados remotos da nuvem e substitui o estado do seu navegador local.</p>
              </div>
            </div>
            <button
              type="button"
              className="settings-action-btn secondary"
              onClick={handlePullFromCloud}
              disabled={isPulling || !configStatus.isConfigured}
              id="btn-pull-supabase"
            >
              {isPulling ? 'Baixando Dados...' : 'Baixar Dados da Nuvem'}
            </button>
          </div>
        </div>
      </div>

      {/* Guia de Configuração e DDL */}
      <div className="cloud-guide-section">
        <h4 className="cloud-section-heading">Como Conectar seu Projeto Supabase</h4>
        <ol className="cloud-setup-steps">
          <li>
            <strong>1. Crie seu projeto no Supabase:</strong> Acesse{' '}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              supabase.com
            </a>{' '}
            e crie um novo projeto.
          </li>
          <li>
            <strong>2. Crie as tabelas com o script SQL:</strong> No painel do seu projeto no Supabase, abra o <em>SQL Editor</em> e execute o conteúdo do arquivo{' '}
            <code>supabase/schema.sql</code> gerado no repositório.
          </li>
          <li>
            <strong>3. Configure suas variáveis de ambiente:</strong> Crie um arquivo <code>.env</code> na raiz do projeto com as chaves encontradas em <em>Project Settings &gt; API</em>:
            <pre className="env-code-block">
{`VITE_SUPABASE_URL=https://seu-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon`}
            </pre>
          </li>
          <li>
            <strong>4. Reinicie o servidor local:</strong> Execute <code>npm run dev</code> para que o Vite carregue as novas variáveis e clique em <em>Testar Conexão</em> acima.
          </li>
        </ol>
      </div>
    </div>
  );
};
