import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './src/content';
const PUBLIC_DIR = './public';

function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    }
    return fileList;
}

function parseFrontmatter(content) {
    const lines = content.split('\n');
    const fmLines = [];
    let inFM = false;
    let bodyStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].replace(/\r$/, '').trim();
        if (line === '---') {
            if (!inFM) {
                inFM = true;
            } else {
                inFM = false;
                bodyStartIndex = i + 1;
                break;
            }
        } else if (inFM) {
            fmLines.push(lines[i].replace(/\r$/, ''));
        }
    }

    const data = {};
    let currentKey = null;
    for (const line of fmLines) {
        // Match key: value
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
        if (match) {
            const key = match[1];
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(val) && val !== '') val = Number(val);

            data[key] = val;
            currentKey = key;
        } else if (line.trim().startsWith('-') && currentKey) {
            let val = line.trim().substring(1).trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            
            if (!Array.isArray(data[currentKey])) {
                data[currentKey] = [];
            }
            data[currentKey].push(val);
        }
    }

    const body = lines.slice(bodyStartIndex).join('\n').trim();
    return { data, body };
}

function analyze() {
    let outputText = '=== INICIANDO ANÁLISIS DE CONTENIDO ===\n\n';

    // 1. Cargar datos RPG
    const rpgFiles = getFiles(path.join(CONTENT_DIR, 'rpg')).filter(f => f.endsWith('.json'));
    const rpgIds = new Set();
    const rpgData = {};
    for (const f of rpgFiles) {
        const id = path.basename(f, '.json');
        rpgIds.add(id);
        try {
            const content = fs.readFileSync(f, 'utf8');
            rpgData[id] = JSON.parse(content);
        } catch (e) {
            outputText += `Error al parsear archivo RPG: ${f} - ${e.message}\n`;
        }
    }
    outputText += `- Cargadas ${rpgIds.size} fichas RPG.\n`;

    // 2. Analizar Personajes
    const charFiles = getFiles(path.join(CONTENT_DIR, 'characters')).filter(f => f.endsWith('.md'));
    outputText += `- Cargados ${charFiles.length} personajes.\n`;

    const issues = {
        brokenRpgRefs: [],
        brokenImageRefs: [],
        emptyOrShortBodies: [],
        duplicateOrSimilarNames: [],
        missingMetadata: []
    };

    const characterNames = {};

    for (const f of charFiles) {
        const fileContent = fs.readFileSync(f, 'utf8');
        const filename = path.basename(f);
        const { data, body } = parseFrontmatter(fileContent);

        // Validar rpgId
        if (data.rpgId) {
            if (!rpgIds.has(data.rpgId)) {
                issues.brokenRpgRefs.push({
                    file: filename,
                    rpgId: data.rpgId,
                    type: 'El rpgId referenciado no existe en src/content/rpg/'
                });
            }
        } else {
            issues.missingMetadata.push({
                file: filename,
                field: 'rpgId',
                type: 'Falta rpgId (hoja de estadísticas de rol)'
            });
        }

        // Validar imágenes
        if (data.image) {
            const imagePath = path.join(PUBLIC_DIR, data.image);
            if (!fs.existsSync(imagePath)) {
                issues.brokenImageRefs.push({
                    file: filename,
                    image: data.image,
                    type: 'La imagen referenciada en el frontmatter no existe'
                });
            }
        } else {
            issues.missingMetadata.push({
                file: filename,
                field: 'image',
                type: 'Falta imagen'
            });
        }

        // Validar campos básicos
        if (!data.name) {
            issues.missingMetadata.push({
                file: filename,
                field: 'name',
                type: 'Falta nombre'
            });
        } else {
            const nameLower = data.name.toLowerCase();
            if (characterNames[nameLower]) {
                issues.duplicateOrSimilarNames.push({
                    files: [characterNames[nameLower], filename],
                    name: data.name,
                    type: 'Duplicado de nombre de personaje'
                });
            } else {
                characterNames[nameLower] = filename;
            }
        }

        if (!data.description || data.description.trim().length === 0) {
            issues.missingMetadata.push({
                file: filename,
                field: 'description',
                type: 'Falta descripción breve'
            });
        }

        // Validar cuerpo vacío o muy corto
        const wordCount = body.split(/\s+/).filter(Boolean).length;
        if (wordCount === 0) {
            issues.emptyOrShortBodies.push({
                file: filename,
                words: 0,
                type: 'Archivo de personaje completamente vacío'
            });
        } else if (wordCount < 30) {
            issues.emptyOrShortBodies.push({
                file: filename,
                words: wordCount,
                text: body,
                type: 'Contenido del personaje extremadamente breve (< 30 palabras)'
            });
        }
    }

    // 3. Fichas RPG sin personajes
    const unusedRpgs = [];
    const charRpgIds = new Set(charFiles.map(f => {
        const fileContent = fs.readFileSync(f, 'utf8');
        return parseFrontmatter(fileContent).data.rpgId;
    }).filter(Boolean));

    for (const id of rpgIds) {
        if (!charRpgIds.has(id)) {
            unusedRpgs.push(id);
        }
    }

    // 4. Analizar Lore
    const loreFiles = getFiles(path.join(CONTENT_DIR, 'lore')).filter(f => f.endsWith('.md'));
    const loreIssues = {
        emptyOrShort: [],
        missingMetadata: []
    };
    outputText += `- Cargados ${loreFiles.length} archivos de lore.\n`;

    for (const f of loreFiles) {
        const content = fs.readFileSync(f, 'utf8');
        const filename = path.relative(CONTENT_DIR, f);
        const { data, body } = parseFrontmatter(content);

        if (!data.title) {
            loreIssues.missingMetadata.push({ file: filename, field: 'title' });
        }
        if (!data.description) {
            loreIssues.missingMetadata.push({ file: filename, field: 'description' });
        }
        if (!data.category) {
            loreIssues.missingMetadata.push({ file: filename, field: 'category' });
        }

        const wordCount = body.split(/\s+/).filter(Boolean).length;
        if (wordCount < 20) {
            loreIssues.emptyOrShort.push({ file: filename, words: wordCount });
        }
    }

    // 5. Analizar Timeline
    const timelineFiles = getFiles(path.join(CONTENT_DIR, 'timeline')).filter(f => f.endsWith('.md'));
    const timelineIssues = {
        duplicates: [],
        short: [],
        weirdDates: []
    };
    outputText += `- Cargados ${timelineFiles.length} eventos del timeline.\n`;

    // Check for similar timeline file names (accents or hyphen duplicates)
    const normalizedTimelineNames = {};
    for (const f of timelineFiles) {
        const basename = path.basename(f);
        const norm = basename.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-_]/g, '').toLowerCase();
        if (normalizedTimelineNames[norm]) {
            timelineIssues.duplicates.push({
                files: [normalizedTimelineNames[norm], basename],
                normalized: norm,
                type: 'Nombres de archivos del timeline casi idénticos (posible duplicado)'
            });
        } else {
            normalizedTimelineNames[norm] = basename;
        }

        const content = fs.readFileSync(f, 'utf8');
        const { data, body } = parseFrontmatter(content);

        if (!data.date) {
            timelineIssues.weirdDates.push({ file: basename, error: 'Falta la fecha (field "date")' });
        }
        const wordCount = body.split(/\s+/).filter(Boolean).length;
        if (wordCount < 10) {
            timelineIssues.short.push({ file: basename, words: wordCount });
        }
    }

    // IMPRIMIR RESULTADOS
    outputText += '\n======================================\n';
    outputText += '=== RESULTADOS DE LA VALIDACIÓN ===\n';
    outputText += '======================================\n\n';

    outputText += `## 1. Referencias Rotas de RPG en Personajes (${issues.brokenRpgRefs.length}):\n`;
    if (issues.brokenRpgRefs.length === 0) outputText += '   Ninguna.\n';
    else issues.brokenRpgRefs.forEach(i => outputText += `   - [${i.file}]: rpgId "${i.rpgId}" no existe en src/content/rpg/\n`);

    outputText += `\n## 2. Referencias Rotas de Imagen (${issues.brokenImageRefs.length}):\n`;
    if (issues.brokenImageRefs.length === 0) outputText += '   Ninguna.\n';
    else issues.brokenImageRefs.forEach(i => outputText += `   - [${i.file}]: imagen "${i.image}" no existe en public/\n`);

    outputText += `\n## 3. Personajes sin Ficha RPG vinculada (${issues.missingMetadata.filter(m => m.field === 'rpgId').length}):\n`;
    const missingRpg = issues.missingMetadata.filter(m => m.field === 'rpgId');
    if (missingRpg.length === 0) outputText += '   Ninguno.\n';
    else missingRpg.forEach(i => outputText += `   - [${i.file}]\n`);

    outputText += `\n## 4. Fichas RPG huérfanas (sin personaje vinculado) (${unusedRpgs.length}):\n`;
    if (unusedRpgs.length === 0) outputText += '   Ninguna.\n';
    else unusedRpgs.forEach(i => outputText += `   - [${i}.json]\n`);

    outputText += `\n## 5. Personajes con descripción o contenido muy breve/vacío (${issues.emptyOrShortBodies.length}):\n`;
    if (issues.emptyOrShortBodies.length === 0) outputText += '   Ninguno.\n';
    else issues.emptyOrShortBodies.forEach(i => outputText += `   - [${i.file}]: (${i.words} palabras)\n`);

    outputText += `\n## 6. Duplicados del Timeline o nombres sospechosos (${timelineIssues.duplicates.length}):\n`;
    if (timelineIssues.duplicates.length === 0) outputText += '   Ninguno.\n';
    else timelineIssues.duplicates.forEach(i => outputText += `   - Archivos: "${i.files[0]}" y "${i.files[1]}"\n`);

    outputText += `\n## 7. Lore incompleto o muy breve (${loreIssues.emptyOrShort.length}):\n`;
    if (loreIssues.emptyOrShort.length === 0) outputText += '   Ninguno.\n';
    else loreIssues.emptyOrShort.forEach(i => outputText += `   - [${i.file}]: (${i.words} palabras)\n`);

    outputText += `\n## 8. Elementos de Timeline muy breves o sin fecha (${timelineIssues.short.length} breves, ${timelineIssues.weirdDates.length} sin fecha):\n`;
    if (timelineIssues.short.length > 0) {
        outputText += '   - Eventos muy cortos:\n';
        timelineIssues.short.forEach(i => outputText += `     - [${i.file}] (${i.words} palabras)\n`);
    }
    if (timelineIssues.weirdDates.length > 0) {
        outputText += '   - Errores de fecha:\n';
        timelineIssues.weirdDates.forEach(i => outputText += `     - [${i.file}]: ${i.error}\n`);
    }

    if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp');
    }
    fs.writeFileSync('./tmp/validation_results.txt', outputText, 'utf8');
    console.log('Análisis completo. Escrito en ./tmp/validation_results.txt');
}

analyze();
