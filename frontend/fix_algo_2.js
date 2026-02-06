const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);

    if (lines.length > 3267 && lines[3267].includes('const steps = []')) {
        console.log('Found garbage at line 3268: ' + lines[3267]);
        lines.splice(3267, 115);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Successfully removed lines 3268-3382.');
    } else {
        console.log('Mismatch at 3268: ' + lines[3267]);
        const index = lines.findIndex((l, i) => i > 3260 && l.trim() === 'const steps = []');
        if (index !== -1) console.log('Found at ' + (index + 1));
    }
} catch (e) {
    console.error(e);
}
