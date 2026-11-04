#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SPECS_DIR = path.join(ROOT_DIR, 'specs');

const canonicalVerifiedRegex = /^\*\*Status\*\*:\s*Implemented & Verified\s*\(\d{4}-\d{2}-\d{2}\)/m;
const canonicalDraftRegex = /^\*\*Status\*\*:\s*Draft/m;

export function auditSpecHeaders(options = {}) {
  const activeDraftFeatures = options.activeDraftFeatures || [];
  const specDirs = fs
    .readdirSync(SPECS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
    .map((d) => ({
      num: parseInt(d.name.substring(0, 3), 10),
      name: d.name,
      dirPath: path.join(SPECS_DIR, d.name),
    }))
    .sort((a, b) => a.num - b.num);

  const results = {
    total: specDirs.length,
    verified: [],
    drafts: [],
    divergent: [],
  };

  for (const spec of specDirs) {
    const specFilePath = path.join(spec.dirPath, 'spec.md');
    if (!fs.existsSync(specFilePath)) {
      results.divergent.push({
        num: spec.num,
        name: spec.name,
        error: 'Arquivo spec.md ausente',
      });
      continue;
    }

    const content = fs.readFileSync(specFilePath, 'utf-8');
    const isVerified = canonicalVerifiedRegex.test(content);
    const isDraft = canonicalDraftRegex.test(content);

    if (activeDraftFeatures.includes(spec.num)) {
      if (isDraft) {
        results.drafts.push({ num: spec.num, name: spec.name });
      } else {
        results.divergent.push({
          num: spec.num,
          name: spec.name,
          error: `Feature ativa esperada como Draft, mas possui outro status`,
        });
      }
    } else {
      if (isVerified) {
        results.verified.push({ num: spec.num, name: spec.name });
      } else {
        results.divergent.push({
          num: spec.num,
          name: spec.name,
          error: `Feature entregue não possui cabeçalho canônico 'Implemented & Verified (YYYY-MM-DD)'`,
        });
      }
    }
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const audit = auditSpecHeaders();
  console.log(`[Metrik Governance] Auditoria de Cabeçalhos de Especificação:`);
  console.log(`- Total de specs auditadas: ${audit.total}`);
  console.log(`- Ratificadas ('Implemented & Verified'): ${audit.verified.length}`);
  console.log(`- Em desenvolvimento ('Draft'): ${audit.drafts.length}`);

  if (audit.divergent.length > 0) {
    console.error(`\n❌ Divergências encontradas (${audit.divergent.length}):`);
    audit.divergent.forEach((d) => {
      console.error(`  - Feature ${String(d.num).padStart(3, '0')} (${d.name}): ${d.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\n✅ 100% das especificações estão em conformidade canônica.`);
    process.exit(0);
  }
}

