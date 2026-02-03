const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    const index = lines.findIndex(l => l.includes('GARBAGE_HERE'));

    if (index !== -1) {
        console.log('Found marker at ' + (index + 1));
        const start = index - 1; // const steps = []

        const combine = lines.findIndex((l, i) => i > index && l.includes('Combine all generators'));

        if (combine !== -1) {
            console.log('Found combine at ' + (combine + 1));
            const count = combine - start; // Start to combine (exclusive)
            // Wait, combine starts with comments above it?
            // "3384: // Combine all generators"
            // "3382: }" (End of garbage)
            // "3383: " (Empty line)

            // So we want to delete from start up to combine.
            // lines.splice(start, count); matches from start, count elements.
            // Elements: start, ..., combine-1.

            lines.splice(start, count);
            fs.writeFileSync(path, lines.join('\n'));
            console.log('DELETED ' + count + ' lines.');
        } else {
            console.log('Combine not found.');
        }
    } else {
        console.log('Marker not found.');
    }
} catch (e) {
    console.error(e);
}
