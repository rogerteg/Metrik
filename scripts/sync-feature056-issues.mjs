#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REPO = 'rogerteg/Metrik';

const tasksFilePath = path.join(
  ROOT_DIR,
  'specs',
  '056-monte-carlo-backlog-forecast',
  'tasks.md'
);

if (!fs.existsSync(tasksFilePath)) {
  console.error(`❌ tasks.md não encontrado em ${tasksFilePath}`);
  process.exit(1);
}

const content = fs.readFileSync(tasksFilePath, 'utf-8').replace(/\r/g, '');
const lines = content.split('\n');
let currentPhase = '';
const tasks = [];

for (const line of lines) {
  const phaseMatch = line.match(/^##\s+(Phase\s+\d+:.*?)$/);
  if (phaseMatch) {
    currentPhase = phaseMatch[1].trim();
    continue;
  }

  const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(T\d+)\s+(?:\[P\]\s+)?(?:\[US\d+\]\s+)?(.*)$/);
  if (taskMatch) {
    tasks.push({
      taskId: taskMatch[2],
      phase: currentPhase,
      isCompleted: taskMatch[1].toLowerCase() === 'x',
      description: taskMatch[3].trim(),
    });
  }
}

console.log(`[Feature 056 Issue Sync] Encontradas ${tasks.length} tarefas para processar.`);

// Fetch existing issues for deduplication
let existingIssuesOutput = '';
try {
  existingIssuesOutput = execSync(
    `gh issue list --repo ${REPO} --search "Feature 056" --state all --json number,title --limit 100`,
    { encoding: 'utf-8' }
  );
} catch (err) {
  console.warn(`[Feature 056 Issue Sync] Aviso ao buscar issues existentes: ${err.message}`);
  existingIssuesOutput = '[]';
}

let existingIssues = [];
try {
  existingIssues = JSON.parse(existingIssuesOutput);
} catch {
  existingIssues = [];
}

const existingTaskIds = new Set();
for (const issue of existingIssues) {
  const match = issue.title.match(/\[Feature 056\]\s+(T\d{3,})/);
  if (match) {
    existingTaskIds.add(match[1]);
  }
}

console.log(`[Feature 056 Issue Sync] ${existingTaskIds.size} tarefas já possuem issue cadastrada.`);

const scratchDir = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\Rogerio Teixeira\\.gemini\\antigravity',
  'antigravity',
  'brain',
  'f79e5a8e-bd40-4cf6-a47c-20febdd44bb0',
  'scratch'
);
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

let createdCount = 0;
let skippedCount = 0;

for (const task of tasks) {
  if (existingTaskIds.has(task.taskId)) {
    console.log(`- Tarefa ${task.taskId} já possui issue vinculada. Pulando.`);
    skippedCount++;
    continue;
  }

  const title = `[Feature 056] ${task.taskId}: ${task.description}`;
  const statusStr = task.isCompleted ? 'Concluída ([x])' : 'Em Aberto ([ ])';

  const body = `### Feature 056: Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Task ID**: ${task.taskId}  
**Phase**: ${task.phase}  
**Spec**: [specs/056-monte-carlo-backlog-forecast/spec.md](https://github.com/rogerteg/Metrik/blob/056-monte-carlo-backlog-forecast/specs/056-monte-carlo-backlog-forecast/spec.md)  
**Plan**: [specs/056-monte-carlo-backlog-forecast/plan.md](https://github.com/rogerteg/Metrik/blob/056-monte-carlo-backlog-forecast/specs/056-monte-carlo-backlog-forecast/plan.md)  
**Status**: ${statusStr}

#### Descrição da Tarefa
${task.description}
`;

  const tmpBodyPath = path.join(scratchDir, `sync_056_${task.taskId}.txt`);
  fs.writeFileSync(tmpBodyPath, body, 'utf-8');

  const sanitizedTitle = title.replace(/"/g, "'");
  try {
    const createCmd = `gh issue create --repo ${REPO} --title "${sanitizedTitle}" --body-file "${tmpBodyPath}"`;
    const issueUrl = execSync(createCmd, { encoding: 'utf-8' }).trim();
    console.log(`✓ Criada: ${issueUrl} (${task.taskId})`);

    if (task.isCompleted) {
      const closeCmd = `gh issue close "${issueUrl}" --repo ${REPO} --comment "Concluída e verificada conforme especificações da Feature 056."`;
      execSync(closeCmd, { encoding: 'utf-8' });
      console.log(`  ✓ Fechada: ${issueUrl}`);
    }
    createdCount++;
  } catch (err) {
    console.error(`❌ Erro ao sincronizar ${task.taskId}:`, err.message);
  } finally {
    if (fs.existsSync(tmpBodyPath)) {
      fs.unlinkSync(tmpBodyPath);
    }
  }
}

console.log(`\n[Feature 056 Issue Sync] Concluído: ${createdCount} criadas/fechadas, ${skippedCount} já existentes.`);
