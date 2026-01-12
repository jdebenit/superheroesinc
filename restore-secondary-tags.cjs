const fs = require('fs');
const path = require('path');

const charactersDir = path.join('d:', 'dev', 'shi', 'src', 'content', 'characters');
const files = fs.readdirSync(charactersDir);

let updatedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.md')) return;

    const filePath = path.join(charactersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if tags field exists
    const hasTags = /^tags:/m.test(content);

    if (!hasTags) {
        // Find end of frontmatter
        const frontmatterRegex = /^(---\r?\n[\s\S]*?)(\r?\n---)/;
        const match = content.match(frontmatterRegex);

        if (match) {
            const frontmatterBody = match[1];
            const frontmatterClose = match[2];

            // Append tags: ["Secundarios"] before closing ---
            // Ensure newline
            const newFrontmatterBody = `${frontmatterBody.trimEnd()}\ntags: ["Secundarios"]`;

            const newContent = content.replace(frontmatterRegex, `${newFrontmatterBody}${frontmatterClose}`);

            fs.writeFileSync(filePath, newContent, 'utf8');
            updatedCount++;
            console.log(`Restored tags for ${file}`);
        }
    }
});

console.log(`Restored tags for ${updatedCount} files.`);
