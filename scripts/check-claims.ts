import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const bannedWords = [
  'passionate',
  'enthusiastic',
  'cutting-edge',
  'seamless',
  'leverage',
  'robust',
  'crafting',
  'journey',
  'innovative',
  'solutions',
  'production-ready',
  'intelligent'
];

const phoneRegex = /(\+91[\s-]?)?[6-9]\d{9}/g;
const devanagariRegex = /[ऀ-ॿ]/g;

function parseFrontmatter(content: string) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('Missing frontmatter block');
  }

  return match[1];
}

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.ok;
  } catch {
    return false;
  }
}

function listMdxFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMdxFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const snapshotPath = './src/data/github.snapshot.json';
  if (!existsSync(snapshotPath)) {
    throw new Error('GitHub snapshot file not found');
  }

  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  if (!snapshot || !Array.isArray(snapshot.repos)) {
    throw new Error('GitHub snapshot is invalid');
  }

  const projectFiles = listMdxFiles('./src/content/work');
  const contentFiles = [
    ...projectFiles,
    './src/content/experience/index.mdx',
    './src/content/profile/index.mdx'
  ];

  for (const file of projectFiles) {
    const content = readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(content);

    for (const required of ['title:', 'summary:', 'year:', 'role:', 'status:', 'tier:', 'authorship:', 'stack:', 'links:', 'order:']) {
      if (!frontmatter.includes(required)) {
        throw new Error(`Missing required field in ${file}: ${required}`);
      }
    }

    const repoMatch = frontmatter.match(/repo:\s*['"]?([^\n'"\s]+)['"]?/);
    if (!repoMatch) {
      throw new Error(`Missing repository link in ${file}`);
    }

    const repoOk = await checkUrl(repoMatch[1]);
    if (!repoOk) {
      throw new Error(`Repository link not accessible in ${file}: ${repoMatch[1]}`);
    }
  }

  for (const file of contentFiles) {
    const content = readFileSync(file, 'utf8');
    const lowerContent = content.toLowerCase();

    for (const banned of bannedWords) {
      if (lowerContent.includes(banned)) {
        throw new Error(`Banned word found in ${file}: ${banned}`);
      }
    }

    const phoneMatches = content.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      throw new Error(`Phone number found in ${file}: ${phoneMatches.join(', ')}`);
    }

    if (devanagariRegex.test(content) && !content.includes('lang="hi"')) {
      throw new Error(`Devanagari text found without lang="hi" in ${file}`);
    }
  }

  console.log('All checks passed successfully');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});