import { Project, SyntaxKind, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

// We'll run this on all features and shared components
project.addSourceFilesAtPaths('src/**/*.tsx');
project.addSourceFilesAtPaths('src/**/*.ts');

const stringsExtracted = new Set<string>();

const TARGET_ATTRIBUTES = [
  'label',
  'placeholder',
  'title',
  'description',
  'message',
  'confirmLabel',
  'cancelLabel',
  'aria-label',
];

let filesModified = 0;

for (const sourceFile of project.getSourceFiles()) {
  let madeChanges = false;

  // Skip the i18n files themselves
  if (sourceFile.getFilePath().includes('/i18n/')) continue;

  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const jsxText of jsxTexts) {
    const text = jsxText.getLiteralText();
    const trimmed = text.trim();
    // Ignore empty text, pure numbers, or text with only punctuation
    if (trimmed && !/^\d+$/.test(trimmed) && trimmed.match(/[a-zA-Z]/)) {
      stringsExtracted.add(trimmed);

      // We must handle spaces correctly. A JsxText might have spaces around it.
      // E.g. "  Hello World  "
      // If we replace the whole node with a JsxExpression, we lose the spacing unless we are careful.
      // E.g. {t('Hello World')}
      // A safe way is to replace the text node.
      // Actually, ts-morph `jsxText.replaceWithText` replaces the whole thing.
      // Let's preserve leading and trailing whitespace that was in the original literal text.
      const leadingSpace = text.match(/^\s*/)?.[0] || '';
      const trailingSpace = text.match(/\s*$/)?.[0] || '';

      jsxText.replaceWithText(
        `${leadingSpace}{t('${trimmed.replace(/'/g, "\\'")}')}${trailingSpace}`
      );
      madeChanges = true;
    }
  }

  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttributes) {
    const name = attr.getNameNode().getText();
    if (TARGET_ATTRIBUTES.includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const strLit = init as StringLiteral;
        const text = strLit.getLiteralValue();
        const trimmed = text.trim();
        if (trimmed && !/^\d+$/.test(trimmed) && trimmed.match(/[a-zA-Z]/)) {
          stringsExtracted.add(trimmed);
          attr.setInitializer(`{t('${trimmed.replace(/'/g, "\\'")}')}`);
          madeChanges = true;
        }
      }
    }
  }

  if (madeChanges) {
    // Add import if not exists
    const imports = sourceFile.getImportDeclarations();
    const hasImport = imports.some((imp) => imp.getModuleSpecifierValue() === '@/shared/i18n/t');
    if (!hasImport) {
      sourceFile.insertImportDeclaration(0, {
        namedImports: ['t'],
        moduleSpecifier: '@/shared/i18n/t',
      });
    }
    filesModified++;
  }
}

console.log(`Modified ${filesModified} files.`);

// Save files
project.saveSync();

// Write extracted strings
const extractedMap: Record<string, string> = {};
Array.from(stringsExtracted)
  .sort()
  .forEach((str) => {
    extractedMap[str] = '';
  });

fs.writeFileSync('scripts/extracted-strings.json', JSON.stringify(extractedMap, null, 2));
console.log(`Extracted ${stringsExtracted.size} strings to scripts/extracted-strings.json`);
