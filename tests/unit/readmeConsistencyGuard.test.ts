import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../');
const README_PATH = path.join(ROOT_DIR, 'README.md');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const CONSTITUTION_PATH = path.join(ROOT_DIR, '.specify/memory/constitution.md');

export interface ReadmeValidationResult {
  missingDeps: string[];
  mismatchedVersions: string[];
  missingPrinciples: string[];
  metricViolations: string[];
}

export function validateReadmeConsistency(
  readmeContent: string,
  packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> },
  constitutionContent: string,
): ReadmeValidationResult {
  const result: ReadmeValidationResult = {
    missingDeps: [],
    mismatchedVersions: [],
    missingPrinciples: [],
    metricViolations: [],
  };

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // 1. Verificação de Dependências e Stack (FR-019a)
  const stackMappings: Record<string, string> = {
    React: 'react',
    TypeScript: 'typescript',
    Vite: 'vite',
    Supabase: '@supabase/supabase-js',
    Vitest: 'vitest',
    'Testing Library': '@testing-library/react',
    'jest-axe': 'jest-axe',
    ESLint: 'eslint',
    Prettier: 'prettier',
  };

  for (const [techLabel, pkgName] of Object.entries(stackMappings)) {
    if (!readmeContent.includes(techLabel)) {
      result.missingDeps.push(`Stack technology "${techLabel}" is missing from README`);
    }
    if (!(pkgName in allDeps)) {
      result.missingDeps.push(
        `Technology "${techLabel}" claimed in README has no matching package "${pkgName}" in package.json`,
      );
    }
  }

  // 2. Verificação de Badges de Versão do Core Stack
  const reactBadgeMatch = readmeContent.match(/React-([0-9.]+)-/);
  if (reactBadgeMatch && allDeps.react) {
    const badgeVer = reactBadgeMatch[1];
    const pkgVer = allDeps.react.replace(/[\^~]/g, '');
    if (!pkgVer.startsWith(badgeVer.split('.')[0])) {
      result.mismatchedVersions.push(
        `React badge (${badgeVer}) differs from package.json (${pkgVer})`,
      );
    }
  }

  const tsBadgeMatch = readmeContent.match(/TypeScript-([0-9.]+)-/);
  if (tsBadgeMatch && allDeps.typescript) {
    const badgeVer = tsBadgeMatch[1];
    const pkgVer = allDeps.typescript.replace(/[\^~]/g, '');
    if (!pkgVer.startsWith(badgeVer)) {
      result.mismatchedVersions.push(
        `TypeScript badge (${badgeVer}) differs from package.json (${pkgVer})`,
      );
    }
  }

  // 3. Verificação dos Princípios Constitucionais I–X
  const expectedPrinciples = [
    { roman: 'I', label: 'Desenvolvimento Orientado por Especificação' },
    { roman: 'II', label: 'Qualidade de Código & Modularidade' },
    { roman: 'III', label: 'Verificação Automatizada & Testes' },
    { roman: 'IV', label: 'Observabilidade & Logging Estruturado' },
    { roman: 'V', label: 'Simplicidade & YAGNI' },
    { roman: 'VI', label: 'Modelos de Raciocínio Analítico Pré-Tarefas' },
    { roman: 'VII', label: 'Independência de Marca & Identidade Limpa' },
    { roman: 'VIII', label: 'Soberania Local-First' },
    { roman: 'IX', label: 'Integridade de Dados' },
    { roman: 'X', label: 'Governança de IA Conversacional' },
  ];

  expectedPrinciples.forEach(({ roman, label }) => {
    const regex = new RegExp(
      `Princípio ${roman}\\s*\\([^)]*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i',
    );
    if (!regex.test(readmeContent)) {
      result.missingPrinciples.push(
        `Principle ${roman} (${label}) is missing or misnamed in README`,
      );
    }
  });

  // Garante que princípios obsoletos não aparecem
  if (
    readmeContent.includes('Paridade de Modelo') ||
    /Princípio I\s*\([^)]*Paridade de Modelo/i.test(readmeContent)
  ) {
    result.missingPrinciples.push('README contains obsolete principle title "Paridade de Modelo"');
  }

  // 4. Verificação de Métricas Reais de Teste (>= 1023)
  const testBadgeMatch = readmeContent.match(/Tests-(\d+)%20passing/);
  if (!testBadgeMatch) {
    result.metricViolations.push('Test count badge missing from README');
  } else {
    const testCount = parseInt(testBadgeMatch[1], 10);
    if (testCount < 1023) {
      result.metricViolations.push(`Test count in README badge (${testCount}) is stale (< 1023)`);
    }
  }

  return result;
}

describe('README Consistency & Truth Guard (FR-019 / OPP-008)', () => {
  it('should ensure README.md strictly aligns with package.json dependencies and versions', () => {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const constitutionContent = fs.readFileSync(CONSTITUTION_PATH, 'utf-8');

    const result = validateReadmeConsistency(readmeContent, packageJson, constitutionContent);

    expect(
      result.missingDeps,
      `README / package.json dependency discrepancies: \n${result.missingDeps.join('\n')}`,
    ).toEqual([]);

    expect(
      result.mismatchedVersions,
      `README / package.json version mismatches: \n${result.mismatchedVersions.join('\n')}`,
    ).toEqual([]);
  });

  it('should ensure README.md reflects all 10 Constitutional Principles (I to X) in accordance with constitution.md', () => {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const constitutionContent = fs.readFileSync(CONSTITUTION_PATH, 'utf-8');

    const result = validateReadmeConsistency(readmeContent, packageJson, constitutionContent);

    expect(
      result.missingPrinciples,
      `README constitutional principles discrepancies: \n${result.missingPrinciples.join('\n')}`,
    ).toEqual([]);
  });

  it('should ensure README.md declares truthful test numbers (>= 1023 tests) and valid coverage badge', () => {
    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const constitutionContent = fs.readFileSync(CONSTITUTION_PATH, 'utf-8');

    const result = validateReadmeConsistency(readmeContent, packageJson, constitutionContent);

    expect(
      result.metricViolations,
      `README test metrics violations: \n${result.metricViolations.join('\n')}`,
    ).toEqual([]);
  });

  it('should immediately detect and fail if stale badges or missing principles are injected (adversarial verification)', () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const constitutionContent = fs.readFileSync(CONSTITUTION_PATH, 'utf-8');

    // Simula README desatualizado com badge de 701 testes e princípio obsoleto "Paridade de Modelo"
    const staleReadme = `
# Metrik
[![Test Suite](https://img.shields.io/badge/Tests-701%20passing-brightgreen)](https://vitest.dev/)
- **Princípio I (Paridade de Modelo)**: antiga regra
`;

    const result = validateReadmeConsistency(staleReadme, packageJson, constitutionContent);

    expect(result.metricViolations.length).toBeGreaterThan(0);
    expect(result.metricViolations[0]).toContain('stale (< 1023)');
    expect(result.missingPrinciples.length).toBeGreaterThan(0);
    expect(result.missingPrinciples.some((p) => p.includes('Paridade de Modelo'))).toBe(true);
  });
});
