const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../server/data/algorithms.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const correctedContent = lines.slice(0, 1896).join('\n');
    fs.writeFileSync(filePath, correctedContent, 'utf8');
    console.log('Fixed algorithms.json by truncating to 1896 lines');
} catch (e) {
    console.error(e);
}
