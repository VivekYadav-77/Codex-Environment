const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    let modified = false;

   
    const garbageIndex = lines.findIndex((l, i) => l.trim() === '// GARBAGE_HERE' && i > 0 && lines[i - 1].trim() === 'const steps = []');

    if (garbageIndex !== -1) {
        console.log('Found Garbage Block at ' + (garbageIndex + 1));
        const start = garbageIndex - 1;
        const endLimit = lines.findIndex((ln, idx) => idx > garbageIndex && ln.includes('// Combine all generators'));

        if (endLimit !== -1) {
            console.log('End at ' + (endLimit + 1));
            const count = endLimit - start;
            console.log(`Deleting ${count} lines.`);
            lines.splice(start, count);
            modified = true;
        }
    } else {
        console.log('Garbage Block marker not found in context.');
    }

    lines.forEach((l, i) => {
        if (l.includes('// GARBAGE_HERE') && l.includes('just array (fallback)')) {
            lines[i] = '        // Data is expected to be { nodes: [], edges: [] } or just array (fallback)';
            console.log('Restored graph-bfs comment at ' + (i + 1));
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(path, lines.join('\n'));
        console.log('File updated.');
    } else {
        console.log('No changes made.');
    }

} catch (e) {
    console.error(e);
}
