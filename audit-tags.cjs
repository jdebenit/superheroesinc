const fs = require('fs');
const path = require('path');

const charactersDir = path.join('d:', 'dev', 'shi', 'src', 'content', 'characters');
const files = fs.readdirSync(charactersDir);

let missingTags = [];
let emptyTags = [];
let tagCounts = {};

files.forEach(file => {
    if (!file.endsWith('.md')) return;

    const filePath = path.join(charactersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const tagsMatch = content.match(/^tags:\s*(.*)$/m);

    if (!tagsMatch) {
        missingTags.push(file);
    } else {
        const tagsValue = tagsMatch[1].trim();
        // Check for empty array []
        if (tagsValue === '[]' || tagsValue === '') {
            emptyTags.push(file);
        } else {
            // Parse tags to count
            if (tagsValue.startsWith('[') && tagsValue.endsWith(']')) {
                const inner = tagsValue.substring(1, tagsValue.length - 1);
                const tags = inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            }
        }
    }
});

console.log('--- Missing Tags ---');
console.log(missingTags.join('\n'));
console.log('\n--- Empty Tags ---');
console.log(emptyTags.join('\n'));
console.log('\n--- Tag Counts ---');
console.log(JSON.stringify(tagCounts, null, 2));
