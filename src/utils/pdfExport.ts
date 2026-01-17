import { PDFDocument } from 'pdf-lib';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../data/backgroundTables';
import { ORIGIN_CATEGORIES } from '../data/originDefinitions';
import { SPECIAL_SKILLS } from '../data/specialSkills';
import Logger from './Logger';

// ... (helpers removed)

/**
 * Rellena el PDF de la ficha de personaje con los datos proporcionados.
 * @param pdfUrl La URL relativa o absoluta del template PDF.
 * @param character Los datos del personaje.
 * @param totalPCs El total de puntos de creación (opcional, si no viene en character).
 * @returns Un Uint8Array con los bytes del PDF generado.
 */
export async function generateCharacterSheetPDF(
    pdfUrl: string,
    character: any,
    totalPCs: string | number,
    preCalculatedData?: {
        derivedStats: any;
        generalSkillsData: any;
        specialSkillsData: any;
        powersData?: any[];
        spellsData?: any[];
        techData?: any[];
        weaponsData?: any[];
        artifactsData?: any[];
        vehiclesData?: any[];
        equipmentData?: any[];
    }
): Promise<Uint8Array> {
    // 1. Cargar el PDF
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Obtener el formulario
    const form = pdfDoc.getForm();
    Logger.log('--- DEBUG: PDF Form Fields ---');
    Logger.log(form.getFields().map(f => f.getName()).sort());
    Logger.log('------------------------------');

    const stats = preCalculatedData?.derivedStats || {
        combat: { acciones: '', iniciativa: '', pv: '', equilibrio: '' },
        other: { inconsciencia: '', recuperacion: '', resistenciaGases: '', modFuerza: '', pesoLevantado: '', daAbsorbidoFisico: '', daAbsorbidoMental: '', modImpacto: '', modPsionico: '', paradaFisica: '', paradaMental: '', salto: '' }
    };

    // Default empty structures if missing
    const generalSkillsData = preCalculatedData?.generalSkillsData || { skills: {} };
    const specialSkillsData = preCalculatedData?.specialSkillsData || { standard: {}, specified: {} };

    // Lookup functions for background
    const getLabel = (list: any[], id: string) => list.find(i => i.id === id)?.label || id;

    // 3. Mapear campos
    const fields: Record<string, string> = {
        'info.name': character.name,
        'info.alias': character.alias,
        'info.profession': character.profession,
        'info.identity': character.sexualIdentity,
        'info.notes': character.notes,
        'info.cost': totalPCs.toString(),

        // Origen
        'info.origin': (() => {
            if (!character.origin?.items) return '';
            return character.origin.items.map((item: any) => {
                const name = Object.keys(item)[0];
                const details = item[name] || [];
                const originDef = ORIGIN_CATEGORIES[name];
                // Filter for subtypes (details that are keys in originDef.subtypes)
                const subtypes = details.filter((d: string) => originDef?.subtypes && originDef.subtypes[d]);
                if (subtypes.length > 0) {
                    return subtypes.join(', ');
                }
                return name;
            }).join(' / ');
        })(),

        // Características
        'attr.fue': character.attributes?.values?.["Fuerza"]?.toString(),
        'attr.con': character.attributes?.values?.["Constitución"]?.toString(),
        'attr.agi': character.attributes?.values?.["Agilidad"]?.toString(),
        'attr.int': character.attributes?.values?.["Inteligencia"]?.toString(),
        'attr.per': character.attributes?.values?.["Percepción"]?.toString(),
        'attr.apa': character.attributes?.values?.["Apariencia"]?.toString(),
        'attr.vol': character.attributes?.values?.["Voluntad"]?.toString(),

        // Combate
        'combat.actions': stats.combat.acciones,
        'combat.initiative': stats.combat.iniciativa,
        'combat.hp': stats.combat.pv,
        'combat.mental': stats.combat.equilibrio,

        // Energia Magica
        'combat.energy': (() => {
            if (character.spells?.calculatedEM !== undefined) {
                return character.spells.calculatedEM.toString();
            }
            return '0';
        })(),

        // Otras Estadísticas
        'stats.unconscious': stats.other.inconsciencia,
        'stats.recovery': stats.other.recuperacion,
        'stats.poison_res': stats.other.resistenciaGases,
        'stats.lift': stats.other.pesoLevantado,
        'stats.phys_absorb': stats.other.daAbsorbidoFisico,
        'stats.ment_absorb': stats.other.daAbsorbidoMental,
        'stats.phys_block': stats.other.paradaFisica,
        'stats.ment_block': stats.other.paradaMental,
        'stats.jump': stats.other.salto,
        'stats.impact': stats.other.modImpacto,
        'stats.psionic': stats.other.modPsionico,
        'stats.strength_mod': stats.other.modFuerza,

        // Trasfondo
        'bg.prejudice': character.background?.prejudiceResistance?.toString(),
        'bg.economic': getLabel(ECONOMIC_STATUS, character.background?.economicStatus),
        'bg.legal': getLabel(LEGAL_STATUS, character.background?.legalStatus),
        'bg.social': getLabel(SOCIAL_STATUS, character.background?.socialStatus),
        'bg.friends': getLabel(FRIENDS_AND_ASSOCIATES, character.background?.friendsAndAssociates),
    };

    // Mapear General Skills (Fixed names)
    Object.entries(generalSkillsData.skills).forEach(([skillId, skillData]: [string, any]) => {
        if (skillId === 'idioma') {
            fields[`skill.${skillId}.val`] = skillData.total.toString();
            if (character.skills?.nativeLanguage) {
                fields[`skill.${skillId}.name`] = character.skills.nativeLanguage;
            }
        } else {
            fields[`skill.${skillId}`] = skillData.total.toString();
        }
    });

    // ========================================================================
    // SPECIAL SKILLS - USE ONLY JSON DATA, NOT PRE-CALCULATED
    // ========================================================================

    Logger.log('--- SPECIAL SKILLS EXPORT ---');
    Logger.log('Source: character.skills.specialItems');
    Logger.log('Data:', character.skills?.specialItems);

    // Get special skills DIRECTLY from character JSON
    const specialSkillsFromJSON = character.skills?.specialItems || [];

    Logger.log(`Found ${specialSkillsFromJSON.length} special skills in JSON`);

    // STEP 1: Clear ALL possible special skill fields (predefined + generic)
    const predefinedSkillFields = [
        'Arcos / Ballestas',
        'Armas cortas',
        'Armas largas',
        'Armas militares',
        'Armas blancas',
        'Explosivos',
        'Trampas',
        'Farmacología',
        'Medicina',
        'Cerrajería',
        'Cibernética',
        'Computadoras / Comunicaciones',
        'Mecánica'
    ];

    // Clear predefined fields
    predefinedSkillFields.forEach(fieldName => {
        try {
            const field = form.getTextField(fieldName);
            if (field) {
                field.setText('');
            }
        } catch (e) {
            // Field doesn't exist, ignore
        }
    });

    // Clear ALL generic Texto fields (up to 26 for 13 pairs)
    for (let i = 1; i <= 26; i++) {
        try {
            const field = form.getTextField(`Texto${i}`);
            if (field) {
                field.setText('');
            }
        } catch (e) {
            // Field doesn't exist, ignore
        }
    }

    // STEP 2: Map ONLY the skills from JSON
    for (let i = 0; i < 13; i++) {
        const nameField = `Texto${(i * 2) + 1}`;
        const valField = `Texto${(i * 2) + 2}`;

        if (i < specialSkillsFromJSON.length) {
            const skill = specialSkillsFromJSON[i];
            const skillName = skill.name || '';
            const skillVal = skill.value || '';

            Logger.log(`Mapping skill ${i}: "${skillName}" = ${skillVal}`);

            fields[nameField] = skillName;
            fields[valField] = skillVal;
            fields[`skill.special.${i + 1}.name`] = skillName;
            fields[`skill.special.${i + 1}.val`] = skillVal;
        } else {
            // Clear unused slots
            fields[nameField] = '';
            fields[valField] = '';
            fields[`skill.special.${i + 1}.name`] = '';
            fields[`skill.special.${i + 1}.val`] = '';
        }
    }

    Logger.log('--- END SPECIAL SKILLS EXPORT ---');

    // --- MAPPING FROM PRE-CALCULATED LISTS ---

    // Powers (10 slots)
    // IMPORTANT: Template might support up to 10 or 7. Loop used 7 before. 
    // Checking previous code was 7. Sticking to 7. Wait, user might want 10? 
    // I will check constant logic. Preview generates 10. `pdfExport` loop used to have 7.
    // If template has 10 lines, I should try 10.
    // I will increase to 10 to be safe, matching Preview generation.
    const powerList = preCalculatedData?.powersData || [];
    for (let i = 0; i < 10; i++) {
        if (i < powerList.length) {
            const p = powerList[i];
            fields[`power.${i + 1}.name`] = p.name;
            fields[`power.${i + 1}.cost`] = p.cost;
            fields[`power.${i + 1}.val`] = p.val;
            fields[`power.${i + 1}.rank`] = p.rank;
            fields[`power.${i + 1}.notes`] = p.notes;
        } else {
            fields[`power.${i + 1}.name`] = '';
            fields[`power.${i + 1}.cost`] = '';
            fields[`power.${i + 1}.val`] = '';
            fields[`power.${i + 1}.rank`] = '';
            fields[`power.${i + 1}.notes`] = '';
        }
    }

    // Spells (15 slots)
    const spellList = preCalculatedData?.spellsData || [];
    for (let i = 0; i < 15; i++) {
        if (i < spellList.length) {
            const s = spellList[i];
            fields[`spell.${i + 1}.name`] = s.name;
            fields[`spell.${i + 1}.rank`] = s.rank;
            fields[`spell.${i + 1}.cost`] = s.cost;
            fields[`spell.${i + 1}.notes`] = s.notes;
        } else {
            fields[`spell.${i + 1}.name`] = '';
            fields[`spell.${i + 1}.rank`] = '';
            fields[`spell.${i + 1}.cost`] = '';
            fields[`spell.${i + 1}.notes`] = '';
        }
    }

    // Tech Modules (12 slots)
    const techList = preCalculatedData?.techData || [];
    for (let i = 0; i < 12; i++) {
        if (i < techList.length) {
            const t = techList[i];
            fields[`tech.${i + 1}.name`] = t.name;
            fields[`tech.${i + 1}.location`] = t.location;
            fields[`tech.${i + 1}.notes`] = t.notes;
        } else {
            fields[`tech.${i + 1}.name`] = '';
            fields[`tech.${i + 1}.location`] = '';
            fields[`tech.${i + 1}.notes`] = '';
        }
    }

    // Weapons (7 slots)
    const weaponList = preCalculatedData?.weaponsData || [];
    for (let i = 0; i < 7; i++) {
        if (i < weaponList.length) {
            const w = weaponList[i];
            fields[`weapon.${i + 1}.name`] = w.name;
            fields[`weapon.${i + 1}.damage`] = w.damage;
            fields[`weapon.${i + 1}.dxa`] = w.dxa || '';
            fields[`weapon.${i + 1}.car`] = w.car || '';
            fields[`weapon.${i + 1}.notes`] = w.notes;
        } else {
            fields[`weapon.${i + 1}.name`] = '';
            fields[`weapon.${i + 1}.damage`] = '';
            fields[`weapon.${i + 1}.dxa`] = '';
            fields[`weapon.${i + 1}.car`] = '';
            fields[`weapon.${i + 1}.notes`] = '';
        }
    }

    // Artifacts (7 slots)
    const artifactList = preCalculatedData?.artifactsData || [];
    for (let i = 0; i < 7; i++) {
        if (i < artifactList.length) {
            const a = artifactList[i];
            fields[`artifact.${i + 1}.name`] = a.name;
            fields[`artifact.${i + 1}.reliability`] = a.reliability || '';
            fields[`artifact.${i + 1}.value`] = a.value || '';
            fields[`artifact.${i + 1}.cost`] = a.cost || '';
        } else {
            fields[`artifact.${i + 1}.name`] = '';
            fields[`artifact.${i + 1}.reliability`] = '';
            fields[`artifact.${i + 1}.value`] = '';
            fields[`artifact.${i + 1}.cost`] = '';
        }
    }

    // Vehicles (5 slots)
    const vehicleList = preCalculatedData?.vehiclesData || [];
    for (let i = 0; i < 5; i++) {
        if (i < vehicleList.length) {
            const v = vehicleList[i];
            fields[`vehicle.${i + 1}.name`] = v.name;
            fields[`vehicle.${i + 1}.armor`] = v.armor || '';
            fields[`vehicle.${i + 1}.pe`] = v.pe || '';
            fields[`vehicle.${i + 1}.speed`] = v.speed || '';
            // Note: range is not in the PDF according to user, only name, speed, armor, pe
        } else {
            fields[`vehicle.${i + 1}.name`] = '';
            fields[`vehicle.${i + 1}.armor`] = '';
            fields[`vehicle.${i + 1}.pe`] = '';
            fields[`vehicle.${i + 1}.speed`] = '';
        }
    }

    // Equipment (20 slots)
    const equipList = preCalculatedData?.equipmentData || [];
    for (let i = 0; i < 20; i++) {
        if (i < equipList.length) {
            const e = equipList[i];
            fields[`equip.${i + 1}.name`] = e.name;
            fields[`equip.${i + 1}.notes`] = e.notes;
        } else {
            fields[`equip.${i + 1}.name`] = '';
            fields[`equip.${i + 1}.notes`] = '';
        }
    }

    // 4. Rellenar campos
    for (const [fieldName, value] of Object.entries(fields)) {
        try {
            const field = form.getTextField(fieldName);
            if (field) {
                field.setText(value || '');
            }
        } catch (e) {

        }
    }

    // 5. Devolver bytes
    return await pdfDoc.save();
}

/**
 * Descarga el PDF generado en el navegador del usuario.
 * @param pdfBytes Los bytes del PDF.
 * @param filename El nombre del archivo a descargar.
 */
export async function downloadPDF(pdfBytes: Uint8Array, filename: string) {
    // Try using the File System Access API
    if ('showSaveFilePicker' in window) {
        try {
            // @ts-ignore
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'PDF Document',
                    accept: { 'application/pdf': ['.pdf'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(pdfBytes);
            await writable.close();
            return;
        } catch (err: any) {
            // User cancelled or API error
            if (err.name === 'AbortError') return;
            // For other errors, fallback to classic
            Logger.warn('File Picker failed, falling back to download link:', err);
        }
    }

    // Fallback
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
