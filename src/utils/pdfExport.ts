import { PDFDocument } from 'pdf-lib';
import { calculateDerivedStats } from './characterCalculations';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from './calculations/skillCalculations';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../data/backgroundTables';
import { ORIGIN_CATEGORIES } from '../data/originDefinitions';
import { POWERS } from '../data/powers';
import { SPECIAL_SKILLS } from '../data/specialSkills';
import { SPELLS } from '../data/spells';

// Helper to get characteristic value safely
const getCharacteristicValue = (character: any, charName: string): number => {
    return character.attributes?.values?.[charName] || 0;
}

// Helper to check subtypes
const hasSubtype = (character: any, originName: string, subtypeName: string): boolean => {
    return character.origin?.items?.some((item: any) => {
        const key = Object.keys(item)[0];
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
};

// Helper to calculate skill base
const calculateSkillBase = (character: any, formula: string): number => {
    if (!formula) return 0;
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        return getCharacteristicValue(character, map[abbr] || '');
    };
    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)());
    } catch (e) {
        return 0;
    }
};

/**
 * Rellena el PDF de la ficha de personaje con los datos proporcionados.
 * @param pdfUrl La URL relativa o absoluta del template PDF.
 * @param character Los datos del personaje.
 * @param totalPCs El total de puntos de creación (opcional, si no viene en character).
 * @returns Un Uint8Array con los bytes del PDF generado.
 */
export async function generateCharacterSheetPDF(pdfUrl: string, character: any, totalPCs: string | number): Promise<Uint8Array> {
    // 1. Cargar el PDF
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Obtener el formulario
    const form = pdfDoc.getForm();

    // Calcular estadísticas y habilidades
    const stats = calculateDerivedStats(character.attributes?.values || {}, character.origin?.items || [], character.skills || {});

    const generalSkillsData = calculateGeneralSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.generalManualMods || {},
        character.skills?.manualBases || {}
    );

    const specialSkillsData = calculateSpecialSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.learning?.selected || {},
        character.skills?.learning?.specified || {}
    );

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
            const int = getCharacteristicValue(character, 'Inteligencia');
            const per = getCharacteristicValue(character, 'Percepción');
            const vol = getCharacteristicValue(character, 'Voluntad');
            const con = getCharacteristicValue(character, 'Constitución');

            // Determine effective characteristics for EM
            const isSemidemonio = hasSubtype(character, 'Sobrenatural', 'Semidemonio');
            const conVal = isSemidemonio ? con : 0;

            // Apply power mods to characteristics for EM calculation
            let modInt = int;
            let modPer = per;
            let modVol = vol;
            let modCon = conVal;

            (character.powers?.selected || []).forEach((p: any) => {
                const powerData = POWERS.find(power => power.id === p.id);
                if (powerData?.characteristic && p.powerMod) {
                    switch (powerData.characteristic) {
                        case 'INT': modInt += p.powerMod; break;
                        case 'PER': modPer += p.powerMod; break;
                        case 'VOL': modVol += p.powerMod; break;
                        case 'CON': if (isSemidemonio) modCon += p.powerMod; break;
                    }
                }
            });

            const isMago = hasSubtype(character, 'Arcano', 'Mago');
            const divisor = isMago ? 1 : (character.spells?.emFormula?.divisor || 4); // Default 4 for Terrano/others

            // Safety check for divisor 0
            if (divisor === 0) return '0';

            let maxEM = 0;
            if (character.spells?.calculatedEM !== undefined) {
                maxEM = character.spells.calculatedEM;
            } else {
                maxEM = Math.floor((modInt + modPer + modVol + modCon) / divisor);
            }

            // Calculate Required EM by spells
            const selectedSpells = character.spells?.selected || [];
            const requiredEM = selectedSpells.reduce((acc: number, spell: any) => {
                const s = SPELLS.find((sp: any) => sp.id === spell.id);
                const baseCost = s ? (parseInt(s.cost, 10) || 0) : 0;
                const rank = spell.rank || 1;
                return acc + (baseCost * rank);
            }, 0);

            // Return only the Max/Calculated EM, ignoring spell costs (as requested by user for Preview)
            return maxEM.toString();
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
    Object.entries(generalSkillsData.skills).forEach(([skillId, skillData]) => {
        if (skillId === 'idioma') {
            fields[`skill.${skillId}.val`] = skillData.total.toString();
            // Export native language name if available
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
    Object.entries(specialSkillsData.standard).forEach(([skillId, skillData]) => {
        const def = SPECIAL_SKILLS.find(s => s.id === skillId);
        flattenedSpecialSkills.push({
            name: def?.name || skillId,
            val: skillData.total
        });
    });

    // Add specified special skills (e.g. pilot with spec)
    Object.values(specialSkillsData.specified).forEach((skillData) => {
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

    // Mapear Powers (7 slots)
    const powers = character.powers?.selected || [];
    for (let i = 0; i < 7; i++) {
        if (i < powers.length) {
            const p = powers[i];
            const powerData = POWERS.find(data => data.id === p.id);
            const baseName = powerData ? powerData.name : (p.name || '');
            const displayName = p.selectedOption ? `${baseName} (${p.selectedOption})` : baseName;

            fields[`power.${i + 1}.name`] = displayName;

            // Cost calculation
            const isHybridPenalty = character.isParahumanoHybrid && p.origin === 'Alterado';
            let costVal = 0;
            if (powerData) {
                const baseCost = powerData.cost;
                const penalty = isHybridPenalty ? 3 : 0;
                if (!powerData.characteristic) {
                    // Skill type
                    const rank = p.rank || 1;
                    const minVal = powerData.skillCalc ? calculateSkillBase(character, powerData.skillCalc) : 0;
                    const currentVal = p.skillValue || minVal;
                    const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                    costVal = baseCost + penalty + (rank * 0.1) + extraCost;
                } else {
                    // Attribute type
                    const powerMod = p.powerMod || 0;
                    costVal = baseCost + penalty + (powerMod / 10);
                }
            } else {
                costVal = (p.cost || 0);
            }

            fields[`power.${i + 1}.cost`] = costVal.toFixed(1);
            fields[`power.${i + 1}.rank`] = (p.rank || '').toString();

            // Power Value
            if (powerData?.skillCalc) {
                const minVal = calculateSkillBase(character, powerData.skillCalc);
                const currentVal = p.skillValue !== undefined ? p.skillValue : minVal;
                fields[`power.${i + 1}.val`] = currentVal.toString();
            } else if (powerData?.characteristic) {
                fields[`power.${i + 1}.val`] = (p.powerMod || '').toString();
            } else {
                fields[`power.${i + 1}.val`] = (p.skillValue || '').toString();
            }

            fields[`power.${i + 1}.notes`] = p.effect || '';
        }
    }

    // Mapear Spells (15 slots)
    const spells = character.spells?.selected || [];
    for (let i = 0; i < 15; i++) {
        if (i < spells.length) {
            const s = spells[i];
            const spellDef = SPELLS.find(def => def.id === s.id);

            fields[`spell.${i + 1}.name`] = spellDef?.name || s.name || '';

            // Rank
            const maxRank = spellDef?.maxRank || 5;
            const isMaestria = s.rank === maxRank + 2;
            fields[`spell.${i + 1}.rank`] = isMaestria ? 'Maestría' : (s.rank || '').toString();

            // Costo
            const baseCost = spellDef ? (parseInt(spellDef.cost, 10) || 0) : 0;
            const effectiveRank = s.rank || 1;
            fields[`spell.${i + 1}.cost`] = (baseCost * effectiveRank).toString();

            fields[`spell.${i + 1}.notes`] = spellDef?.requirements || s.effect || s.description || '';
        }
    }

    // Mapear Tech Modules (12 slots)
    const techModules = character.techModules?.installed || [];
    for (let i = 0; i < 12; i++) {
        if (i < techModules.length) {
            const m = techModules[i];
            fields[`tech.${i + 1}.name`] = m.name || m.definitionId || '';
            fields[`tech.${i + 1}.location`] = m.location || '';
            fields[`tech.${i + 1}.notes`] = m.notes || '';
        }
    }

    // Mapear Weapons (7 slots)
    const weapons = character.equipment?.weapons || [];
    for (let i = 0; i < 7; i++) {
        if (i < weapons.length) {
            const w = weapons[i];
            fields[`weapon.${i + 1}.name`] = w.name || '';
            fields[`weapon.${i + 1}.damage`] = w.damage || '';
            fields[`weapon.${i + 1}.notes`] = w.notes || w.special || '';
        }
    }

    // Mapear Equipment (20 slots)
    const equipment = character.equipment?.items || [];
    const equipLimit = 20;
    for (let i = 0; i < equipLimit; i++) {
        if (i < equipment.length) {
            const e = equipment[i];
            fields[`equip.${i + 1}.name`] = e.name || '';
            fields[`equip.${i + 1}.notes`] = e.notes || '';
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
