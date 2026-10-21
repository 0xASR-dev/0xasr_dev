import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Create or update snapshot
const OUTPUT_PATH = './src/data/github.snapshot.json';

// Check if file exists
if (!execSync('test -f ' + OUTPUT_PATH, { encoding: 'utf8' }).trim()) {
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    repos: []
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log('Created GitHub snapshot:', OUTPUT_PATH);
} else {
  console.log('GitHub snapshot exists:', OUTPUT_PATH);
  console.log('Using existing snapshot');
}