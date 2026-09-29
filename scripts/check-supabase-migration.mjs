#!/usr/bin/env node
/**
 * Verifica se a migração de Sprint/Story Points foi aplicada no Supabase.
 *
 * Uso: npm run supabase:check
 *
 * Lê `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` do `.env` (não imprime segredos)
 * e testa a existência das colunas via REST (PostgREST). Sai com código 1 se faltar.
 */
import { readFileSync, existsSync } from 'node:fs';

const envPath = '.env';
if (!existsSync(envPath)) {
  console.error('Arquivo .env não encontrado. Copie .env.example e preencha as credenciais.');
  process.exit(2);
}

const env = readFileSync(envPath, 'utf8');
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '\\s*=\\s*(.+)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};
const url = get('VITE_SUPABASE_URL');
const key = get('VITE_SUPABASE_ANON_KEY');
if (!url || !key) {
  console.error('Credenciais do Supabase ausentes no .env.');
  process.exit(2);
}

console.log('Projeto:', new URL(url).host, '\n');

const checks = [
  ['boards?select=sprints&limit=1', 'boards.sprints'],
  ['boards?select=active_sprint_id&limit=1', 'boards.active_sprint_id'],
  ['tasks?select=sprint_id&limit=1', 'tasks.sprint_id'],
  ['tasks?select=estimation&limit=1', 'tasks.estimation'],
  ['tasks?select=assignee&limit=1', 'tasks.assignee'],
  ['tasks?select=last_moved_at&limit=1', 'tasks.last_moved_at'],
];

const results = await Promise.all(
  checks.map(async ([pathname, label]) => {
    const res = await fetch(`${url}/rest/v1/${pathname}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const ok = res.status === 200 || res.status === 206;
    console.log(`${ok ? 'OK ' : 'X  '} ${label}`);
    return ok;
  }),
);

const applied = results.every(Boolean);
console.log('\nMIGRAÇÃO:', applied ? 'APLICADA ✅' : 'PENDENTE ❌ — rode a seção 8 de supabase/schema.sql');
process.exit(applied ? 0 : 1);
