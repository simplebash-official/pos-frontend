import fs from 'fs';

const mainPath = 'src/shared/i18n/dictionaries/si.json';
const mainDict = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

const translations = {
  "Goods": "භාණ්ඩ",
  "Goods & Inventory": "භාණ්ඩ සහ තොග",
  "Jobs": "සේවා",
  "Service Jobs": "සේවා කාර්යයන්"
};

for (const key in translations) {
  if (!mainDict[key] || mainDict[key] === '') {
    mainDict[key] = translations[key];
  }
}

fs.writeFileSync(mainPath, JSON.stringify(mainDict, null, 2));
console.log('Successfully merged new translations into si.json');
