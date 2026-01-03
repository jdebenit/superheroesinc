import { PDFDocument } from 'pdf-lib';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../data/backgroundTables';
import { ORIGIN_CATEGORIES } from '../data/originDefinitions';
import { SPECIAL_SKILLS } from '../data/specialSkills';

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
        equipmentData?: any[];
    }
): Promise<Uint8Array> {
    // 1. Cargar el PDF
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Obtener el formulario
    const form = pdfDoc.getForm();

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

    // Mapear Special Skills (Variable slots: 13)
    const flattenedSpecialSkills: any[] = [];

    // Add standard special skills
    Object.entries(specialSkillsData.standard).forEach(([skillId, skillData]: [string, any]) => {
        const def = SPECIAL_SKILLS.find(s => s.id === skillId);
        flattenedSpecialSkills.push({
            name: def?.name || skillId,
            val: skillData.total
        });
    });

    // Add specified special skills (e.g. pilot with spec)
    Object.values(specialSkillsData.specified).forEach((skillData: any) => {
        const def = SPECIAL_SKILLS.find(s => s.id === skillData.skillId);
        flattenedSpecialSkills.push({
            name: `${def?.name || skillData.skillId}: ${skillData.specification}`,
            val: skillData.total
        });
    });

    for (let i = 0; i < 13; i++) {
        if (i < flattenedSpecialSkills.length) {
            fields[`skill.special.${i + 1}.name`] = flattenedSpecialSkills[i].name;
            fields[`skill.special.${i + 1}.val`] = flattenedSpecialSkills[i].val.toString();
        }
    }

    // --- MAPPING FROM PRE-CALCULATED LISTS ---

    // Powers (10 slots)
    const powerList = preCalculatedData?.powersData || [];
    for (let i = 0; i < 10; i++) {
        if (i < powerList.length) {
            const p = powerList[i];
            fields[`power.${i + 1}.name`] = p.name;
            fields[`power.${i + 1}.cost`] = p.cost;
            fields[`power.${i + 1}.val`] = p.val;
            fields[`power.${i + 1}.rank`] = p.rank;
            fields[`power.${i + 1}.notes`] = p.notes;
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
        }
    }

    // Weapons (7 slots)
    const weaponList = preCalculatedData?.weaponsData || [];
    for (let i = 0; i < 7; i++) {
        if (i < weaponList.length) {
            const w = weaponList[i];
            fields[`weapon.${i + 1}.name`] = w.name;
            fields[`weapon.${i + 1}.damage`] = w.damage;
            fields[`weapon.${i + 1}.notes`] = w.notes;
        }
    }

    // Equipment (20 slots)
    const equipList = preCalculatedData?.equipmentData || [];
    for (let i = 0; i < 20; i++) {
        if (i < equipList.length) {
            const e = equipList[i];
            fields[`equip.${i + 1}.name`] = e.name;
            fields[`equip.${i + 1}.notes`] = e.notes;
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
            // console.warn(`Campo '${fieldName}' no encontrado en el PDF o no es un campo de texto.`);
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
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
