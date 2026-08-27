import fs from 'fs';
import path from 'path';

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else if (filePath.endsWith('.tsx')) {
      files.push(filePath);
    }
  }
  return files;
}

const files = getFiles('src');
let fixedFiles = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(/t\('([^'\\]*(?:\\.[^'\\]*)*)'\)/gs, (match, p1) => {
    if (p1.includes('\n') || p1.includes('\r')) {
      changed = true;
      const fixedContent = p1.replace(/\r/g, '').replace(/\n/g, '\\n');
      return `t('${fixedContent}')`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    fixedFiles++;
  }
});

console.log(`Fixed newlines in ${fixedFiles} files.`);
