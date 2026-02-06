const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

    const commentLine = lines.findIndex(l => l.trim() === '// Data is expected to be array representing binary tree (level order)');
    if (commentLine !== -1) {
        console.log('Found garbage comment at ' + (commentLine + 1));
        const start = commentLine - 1;

        const combineLine = lines.findIndex(l => l.includes('// Combine all generators'));
        if (combineLine !== -1) {
            console.log('Found combine at ' + (combineLine + 1));
           

            const count = combineLine - start;
            console.log(`Deleting ${count} lines from ${start + 1} to ${combineLine}.`);

            lines.splice(start, count);
            fs.writeFileSync(path, lines.join('\n'));
            console.log('Success.');
        } else {
            console.log('Could not find combine line.');
        }
    } else {
        console.log('Could not find garbage comment.');
    }
} catch (e) {
    console.error(e);
}
