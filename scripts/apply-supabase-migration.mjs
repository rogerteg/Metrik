#!/usr/bin/env node
/**
 * Aplica a migração de Sprint/Story Points no Supabase via Management API.
 *
 * Pré-requisito: `SUPABASE_ACCESS_TOKEN` (Personal Access Token `sbp_...`) no `.env`.
 *   Supabase → Account → Access Tokens → Generate new token.
 *   Nunca faça commit do token; revogue-o após o uso.
 *
 * Uso: npm run supabase:migrate
 */
import { readFileSync, existsSync } from 'node:fs';

const SQL = `
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS sprints JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS active_sprint_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimation INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS last_moved_at TIMESTAMPTZ;
NOTIFY pgrst, 'reload schema';
`;

if (!existsSync('.env')) {
  console.error('.env não encontrado.');
  process.exit(2);
}
const env = readFileSync('.env', 'utf8');
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '\\s*=\\s*(.+)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};

const url = get('VITE_SUPABASE_URL');
const token = get('SUPABASE_ACCESS_TOKEN');
if (!url) {
  console.error('VITE_SUPABASE_URL ausente no .env.');
  process.exit(2);
}
if (!token || !token.startsWith('sbp_')) {
  console.error(
    'SUPABASE_ACCESS_TOKEN ausente/inválido no .env.\n' +
      'Gere em Supabase → Account → Access Tokens (sbp_...) e adicione ao .env.',
  );
  process.exit(2);
}

const ref = new URL(url).host.split('.')[0];
console.log(`Aplicando migração no projeto ${ref} via Management API...`);

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: SQL }),
});

const text = await response.text();
if (!response.ok) {
  console.error(`Falha (HTTP ${response.status}): ${text.slice(0, 400)}`);
  process.exit(1);
}

console.log('Migração aplicada com sucesso. Agora rode: npm run supabase:check');
