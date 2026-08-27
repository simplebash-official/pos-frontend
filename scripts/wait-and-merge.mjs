import fs from 'fs';

const interval = setInterval(() => {
  if (fs.existsSync('scripts/missing-si-all.json')) {
    clearInterval(interval);

    // Read the newly translated strings
    const translated = JSON.parse(fs.readFileSync('scripts/missing-si-all.json', 'utf8'));

    // Read the main si.json
    const mainPath = 'src/shared/i18n/dictionaries/si.json';
    const mainDict = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

    // Add the 4 manual strings
    translated['Good morning'] = 'සුබ උදෑසනක්';
    translated['Good afternoon'] = 'සුබ දහවලක්';
    translated['Good evening'] = 'සුබ සන්ධ්‍යාවක්';
    translated['Store Cashier'] = 'අයකැමි';

    // Merge
    for (const key in translated) {
      if (!mainDict[key] || mainDict[key] === '') {
        mainDict[key] = translated[key];
      }
    }

    fs.writeFileSync(mainPath, JSON.stringify(mainDict, null, 2));
    console.log('Successfully merged all new translations into si.json');
  }
}, 2000);
