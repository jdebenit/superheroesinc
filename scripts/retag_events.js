import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORIES = [
    path.join(__dirname, '../src/content/timeline'),
    path.join(__dirname, '../src/content/lore/eventos')
];

const TRAMAS = {
    'gran-barrera': ['Gran Barrera', 'Orbe Sagrado', 'Dioses', 'Jóvenes Dioses', 'Thor', 'Ort', 'Reinos Divinos'],
    'guerras-gamadas': ['Guerras Gamadas', 'Nigalión', 'Castáphilo', 'Nazi', 'SGM', 'Antracita', 'Guerra de la Media Noche'],
    'flecha-roja': ['Flecha Roja', 'Koch', 'Ángel Carreras', 'Héroe dorado'],
    'invasion-ksser': ['K\'sser', 'K\'rnai', 'Enigma', 'Nexo', 'Invasión', 'Jewel'],
    'tecnoguerra': ['TecnoGuerra', 'TecnoRED', 'Euroman', 'Umbra', 'IDESS', 'Zortek', 'H4ck3r', 'Blue Royals', 'Westerners'],
    'política': ['CISS', 'Fundación Divina', 'Ley de Regulación', 'Registro', 'Superheroes Inc', 'Antihéroes Limited', 'Tratado', 'Naciones Unidas', 'ONU', 'CEAM'],
    'era-mitica': ['Avalon', 'Myrddin', 'Arturo', 'Alejandría', 'Pacto de las Edades', 'Giordano Bruno', 'Salém', 'Vórtice', 'Oculto']
};

function getYearFromDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr.getFullYear();
    const match = dateStr.toString().match(/^-?(\d{4})/);
    return match ? parseInt(match[1]) : null;
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) return;

    const frontmatterRaw = frontmatterMatch[1];
    const body = content.replace(frontmatterMatch[0], '');

    // Parse frontmatter manually to preserve comments/structure if possible, 
    // but regex is safer for simple replacements here.

    let title = '';
    const titleMatch = frontmatterRaw.match(/title:\s*["']?([^"\n]+)["']?/);
    if (titleMatch) title = titleMatch[1];

    let dateStr = '';
    const dateMatch = frontmatterRaw.match(/date:\s*([^\n]+)/);
    if (dateMatch) dateStr = dateMatch[1].trim();

    let tags = [];
    const tagsMatch = frontmatterRaw.match(/tags:\s*\[(.*?)\]/);
    let originalTags = [];
    if (tagsMatch) {
        originalTags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
    }

    // Determine new tags
    const newTags = new Set();

    // Preserve 'personaje'
    if (originalTags.includes('personaje')) {
        newTags.add('personaje');
    }

    // Add plot tags based on Title + Body keyword matching
    const fullText = (title + ' ' + body).toLowerCase();

    for (const [tag, keywords] of Object.entries(TRAMAS)) {
        if (keywords.some(k => fullText.includes(k.toLowerCase()))) {
            newTags.add(tag);
        }
    }

    // Add 'contemporaneo' if year >= 2001
    const year = getYearFromDate(dateStr);
    // Handle unquoted dates or negative dates in logic if needed, but simplistic regex usually catches standard YAML dates
    // Note: ancient dates like -1000 might just be strings.

    // Simple check for year in line
    if (year !== null && year >= 2001) {
        newTags.add('contemporaneo');
    }

    // If no tags found, stick to 'otros' or leave empty? User implies reducing tags.
    // If empty, let's leave it empty or map to 'general'

    const newTagsArray = Array.from(newTags);

    // Construct new tags string
    const newTagsString = `tags: [${newTagsArray.map(t => `"${t}"`).join(', ')}]`;

    let newFrontmatter = frontmatterRaw;
    if (tagsMatch) {
        newFrontmatter = newFrontmatter.replace(/tags:\s*\[.*?\]/, newTagsString);
    } else {
        newFrontmatter += `\n${newTagsString}`;
    }

    const newContent = `---\n${newFrontmatter}\n---${body}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Processed: ${path.basename(filePath)} -> [${newTagsArray.join(', ')}]`);
}

DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        files.forEach(f => processFile(path.join(dir, f)));
    } else {
        console.log(`Directory not found: ${dir}`);
    }
});
