const fs = require('fs');
const path = 'd:\\web devfiles\\Code-Odyssey\\src\\pages\\Algorithms\\AlgorithmViewer.jsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);
    fs.writeFileSync('d:\\web devfiles\\Code-Odyssey\\line_check.txt',
        `Total: ${lines.length}\n` +
        `3265: ${lines[3264]}\n` +
        `3266: ${lines[3265]}\n` +
        `3267: ${lines[3266]}\n` +
        `3268: ${lines[3267]}\n` +
        `3269: ${lines[3268]}\n` +
        `3270: ${lines[3269]}`
    );
    console.log("Written line_check.txt");
} catch (e) {
    console.error(e);
}
