import fs from 'fs';
import path from 'path';

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      files.push(filePath);
    }
  }
  return files;
}

const files = getFiles('src');
const foundStrings = new Set();

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  // Match `header: '...'` or `header: "..."`
  const headerRegex = /header:\s*(['"])(.*?)\1/g;
  // Match `label: '...'` or `label: "..."`
  const labelRegex = /label:\s*(['"])(.*?)\1/g;

  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    foundStrings.add(match[2]);
  }
  while ((match = labelRegex.exec(content)) !== null) {
    foundStrings.add(match[2]);
  }
});

const existingExtracted = JSON.parse(fs.readFileSync('scripts/extracted-strings.json', 'utf8'));

const newStrings = Array.from(foundStrings).filter(
  (s) => !existingExtracted.hasOwnProperty(s) && s.match(/[a-zA-Z]/)
);

fs.writeFileSync('scripts/missing-strings-2.json', JSON.stringify(newStrings, null, 2));
console.log(`Found ${newStrings.length} additional missing strings.`);
