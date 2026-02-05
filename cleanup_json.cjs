const fs = require('fs');
const path = './backend/server/data/algorithms.json';

try {
    const raw = fs.readFileSync(path, 'utf8');
    const lines = raw.split(/\r?\n/);
    // Line 1896 is where the array should end (based on previous view_file)
    // In JS index, that is 1895.
    // We want to KEEP lines up to 1896 (inclusive).
    // slice(0, 1896) will keep indices 0 to 1895.
    const correctedContent = lines.slice(0, 1896).join('\n');
    fs.writeFileSync(path, correctedContent, 'utf8');
    console.log('Fixed algorithms.json by truncating to 1896 lines');
} catch (e) {
    console.error(e);
}
