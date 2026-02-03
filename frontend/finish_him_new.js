const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    const index = lines.findIndex(l => l.includes('// DELETED'));

    if (index !== -1) {
        console.log('Found DELETED marker at ' + (index + 1));
        const start = index;

        const combine = lines.findIndex((l, i) => i > index && l.includes('Combine all generators'));
        if (combine !== -1) {
            console.log('Found combine at ' + (combine + 1));
            const count = combine - start;
            lines.splice(start, count);
            fs.writeFileSync(path, lines.join('\n'));
            console.log('CLEANUP COMPLETE.');
        } else {
            console.log('Combine marker not found.');
        }
    } else {
        console.log('DELETED marker not found.');
    }
} catch (e) {
    console.error(e);
}
