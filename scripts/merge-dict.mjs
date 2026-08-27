import fs from 'fs';
import path from 'path';

const extractedPath = 'scripts/extracted-strings.json';
const outPath = 'src/shared/i18n/dictionaries/si.json';

const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
let merged = {};

// Load translated chunks
['aa', 'ab', 'ac', 'ad'].forEach((chunk) => {
  const chunkFile = `scripts/si-chunk-${chunk}.json`;
  if (fs.existsSync(chunkFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
      merged = { ...merged, ...data };
    } catch (e) {
      console.log(`Failed to parse ${chunkFile}`);
    }
  }
});

const outDict = {};

// Fill in the final dictionary, using the translation if it exists, otherwise stubbing it
for (const key of Object.keys(extracted)) {
  if (merged[key]) {
    outDict[key] = merged[key];
  } else {
    outDict[key] = key + ' [SI]';
  }
}

fs.writeFileSync(outPath, JSON.stringify(outDict, null, 2), 'utf8');
console.log('Successfully merged si.json dictionary!');
