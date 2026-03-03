const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');
const dirsToScan = [
    'components', 'pages', 'stores', 'services', 'hooks', 'utils', 'constants'
].map(d => path.join(srcDir, d));

function getAllFiles(dirPath, arrayOfFiles) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });
    return arrayOfFiles;
}

let allFiles = [];
dirsToScan.forEach(d => {
    allFiles = allFiles.concat(getAllFiles(d));
});

const exportData = {}; // filepath -> { default: boolean, named: [] }

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = file.substring(srcDir.length + 1).replace(/\\/g, '/');

    // Quick regex for exports
    const hasDefault = /export\s+default\s+/.test(content);

    const named = [];

    // export const/let/var Foo
    let match;
    const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_]+)/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
        named.push(match[1]);
    }

    // export { Foo, Bar }
    const bracketExportRegex = /export\s+\{([^}]+)\}/g;
    while ((match = bracketExportRegex.exec(content)) !== null) {
        const parts = match[1].split(',').map(p => p.trim()).filter(p => !p.startsWith('type ') && p.length > 0);
        parts.forEach(p => {
            // Handle 'A as B'
            const splitAs = p.split(/\s+as\s+/);
            named.push(splitAs[splitAs.length - 1]);
        });
    }

    // Handle 'export * from ...' simply by ignoring or logging it if needed

    exportData[relPath] = {
        hasDefault,
        named: [...new Set(named)]
    };
});

let report = "--- EXPORT REPORT ---\n";
for (const [file, data] of Object.entries(exportData)) {
    report += `\n1. File: ${file}\n`;
    report += `2. Uses "export default": ${data.hasDefault ? 'Yes' : 'No'}, Uses "export const/function": ${data.named.length > 0 ? 'Yes' : 'No'}\n`;
    report += `3. Exported names: ${data.named.join(', ')}${data.hasDefault ? ' (plus default)' : ''}\n`;
}

fs.writeFileSync('export-report.txt', report);
console.log("Report generated at export-report.txt.");
