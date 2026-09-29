#!/usr/bin/env node
/**
 * Gerador de CHANGELOG (Keep a Changelog) a partir dos commits convencionais.
 *
 * Uso:
 *   node scripts/changelog.mjs            # gera a seção [Unreleased] desde a última tag
 *   node scripts/changelog.mjs v0.2.0     # rotula a seção com a versão informada
 *
 * Regras:
 *   - Agrupa commits por tipo (feat/fix/perf/refactor/docs/test/chore).
 *   - Substitui apenas a seção [Unreleased] do CHANGELOG.md, preservando o histórico.
 *   - Nunca inventa commits: a fonte é `git log`.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SECTION_BY_TYPE = {
  feat: 'Added',
  fix: 'Fixed',
  perf: 'Performance',
  refactor: 'Changed',
  docs: 'Docs',
  test: 'Tests',
  chore: 'Maintenance',
  build: 'Maintenance',
  ci: 'Maintenance',
  style: 'Maintenance',
};
const SECTION_ORDER = [
  'Added',
  'Changed',
  'Fixed',
  'Performance',
  'Docs',
  'Tests',
  'Maintenance',
  'Other',
];

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function lastTag() {
  try {
    return sh('git describe --tags --abbrev=0');
  } catch {
    return '';
  }
}

function commits(range) {
  const raw = sh(`git log ${range} --no-merges --pretty=format:%s`);
  return raw ? raw.split('\n').filter(Boolean) : [];
}

function groupCommits(list) {
  const groups = new Map();
  for (const subject of list) {
    const match = subject.match(/^(\w+)(?:\([^)]+\))?!?:\s*(.+)$/);
    const type = match ? match[1].toLowerCase() : 'other';
    const text = sanitize(match ? match[2] : subject);
    const section = SECTION_BY_TYPE[type] ?? 'Other';
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(text);
  }
  return groups;
}

/** Independência de marca (Constituição VII): remove nomes de produtos de terceiros. */
function sanitize(text) {
  const replacements = [
    [/businessmap/gi, 'Metrik'],
    [/actionable\s*agile/gi, 'Metrik'],
    [/actionableagile/gi, 'Metrik'],
    [/clickup[- ]inspired\s*/gi, ''],
    [/clickup/gi, 'Metrik'],
  ];
  return replacements.reduce((acc, [re, value]) => acc.replace(re, value), text);
}

function renderSection(heading, groups) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [`## [${heading}] - ${today}`, ''];
  const ordered = SECTION_ORDER.filter((name) => groups.has(name));
  if (ordered.length === 0) {
    lines.push('- (sem alterações registradas)', '');
    return lines.join('\n');
  }
  for (const name of ordered) {
    lines.push(`### ${name}`, '');
    for (const item of groups.get(name)) lines.push(`- ${item}`);
    lines.push('');
  }
  return lines.join('\n');
}

const heading = process.argv[2] || 'Unreleased';
const tag = lastTag();
const range = tag ? `${tag}..HEAD` : 'HEAD';
const list = commits(range);
const block = renderSection(heading, groupCommits(list));

const header =
  '# Changelog\n\n' +
  'Todas as mudanças relevantes do Metrik. Formato: [Keep a Changelog]\n' +
  '(https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento semântico.\n\n';

let sections = [];
if (existsSync('CHANGELOG.md')) {
  const current = readFileSync('CHANGELOG.md', 'utf8');
  const firstIdx = current.indexOf('## [');
  if (firstIdx >= 0) {
    const parts = current
      .slice(firstIdx)
      .split(/(?=^## \[)/m)
      .map((s) => s.trim())
      .filter(Boolean);
    const dropHeading = new RegExp(`^## \\[(Unreleased|${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\]`);
    sections = parts.filter((part) => !dropHeading.test(part));
  }
}

const output = `${header}${block}\n\n${sections.join('\n\n')}\n`;
writeFileSync('CHANGELOG.md', output.replace(/\n{3,}/g, '\n\n'), 'utf8');

console.log(`CHANGELOG.md atualizado — seção [${heading}] com ${list.length} commit(s).`);
if (!tag) {
  console.log('Dica: nenhuma tag encontrada; a seção inclui todo o histórico. Crie tags para releases futuros.');
}
