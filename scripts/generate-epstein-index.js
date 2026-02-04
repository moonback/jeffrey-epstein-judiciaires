
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const EPSTEIN_DIR = path.join(PUBLIC_DIR, 'epstein');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'epstein-index.json');

const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.toLowerCase().endsWith('.pdf')) {
                const fullPath = path.join(dirPath, file);
                const relativePath = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');

                arrayOfFiles.push({
                    name: file,
                    path: '/' + relativePath,
                    directory: path.relative(EPSTEIN_DIR, dirPath).replace(/\\/g, '/') || 'root',
                    size: fs.statSync(fullPath).size
                });
            }
        }
    });

    return arrayOfFiles;
}

try {
    console.log(`Scanning ${EPSTEIN_DIR}...`);
    if (!fs.existsSync(EPSTEIN_DIR)) {
        console.error(`Directory not found: ${EPSTEIN_DIR}`);
        process.exit(1);
    }

    const pdfFiles = getAllFiles(EPSTEIN_DIR, []);
    console.log(`Found ${pdfFiles.length} PDF files.`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pdfFiles, null, 2));
    console.log(`Index saved to ${OUTPUT_FILE}`);

} catch (e) {
    console.error(e);
}
