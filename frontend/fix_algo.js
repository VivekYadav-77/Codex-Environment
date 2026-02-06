const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);

    if (lines.length > 3140 && lines[3139].includes('const steps = []')) {
        console.log('Found garbage at line 3140: ' + lines[3139]);

        if (lines.length > 3253) {
            console.log('Garbage end at 3254: ' + lines[3253]);
        }

        lines.splice(3139, 115);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Successfully removed lines 3140-3254.');
    } else {
        console.log('Line 3140 does not match expected garbage start. Content: ' + lines[3139]);
        const index = lines.findIndex((l, i) => i > 3100 && l.trim() === 'const steps = []');
        if (index !== -1) {
            console.log('Found "const steps = []" at line ' + (index + 1));
        }
    }
} catch (e) {
    console.error(e);
}
