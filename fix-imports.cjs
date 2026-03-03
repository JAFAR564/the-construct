const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(srcDir);

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    const dirname = path.dirname(file);

    const replacer = (match, p1, p2, p3) => {
        if (p2.startsWith('.')) {
            const absolutePath = path.resolve(dirname, p2);
            const relativeToSrc = path.relative(srcDir, absolutePath);
            let newPath = '@/' + relativeToSrc.replace(/\\/g, '/');
            // Fix potential issues where the file imports from a directory (index.ts)
            return p1 + newPath + p3;
        }
        return match;
    };

    content = content.replace(/(import\s+.*?from\s+['"])([^'"]+)(['"])/g, replacer);
    content = content.replace(/(import\s+type\s+.*?from\s+['"])([^'"]+)(['"])/g, replacer);
    content = content.replace(/(import\s+['"])([^'"]+)(['"])/g, replacer);
    content = content.replace(/(import\(['"])([^'"]+)(['"]\))/g, replacer);

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Modified: ${file.substring(srcDir.length + 1)}`);
    }
});

console.log("Total files modified: " + modifiedCount);
