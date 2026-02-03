const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

    // Index 3267 is line 3268.
    if (lines.length > 3267 && lines[3267].trim() === 'const steps = []') {
        console.log('Confirmed start at 3268: ' + lines[3267]);

        // Check end at 3382 (index 3381)
        if (lines.length > 3381) {
            console.log('End Check at 3382: ' + lines[3381]);
        }

        // Delete 3268 to 3382
        // Count = 115
        const start = 3267;
        const count = 115;

        lines.splice(start, count);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Deleted 115 lines starting at 3268.');
    } else {
        console.log('Mismatch at 3268. Content: ' + (lines[3267] || 'EOF'));
        // log nearby
        for (let i = -5; i < 5; i++) {
            if (lines[3267 + i]) console.log((3268 + i) + ': ' + lines[3267 + i]);
        }
    }
} catch (e) {
    console.error(e);
}
