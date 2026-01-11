#!/usr/bin/env node
/**
 * Script to convert RPG JSON files from web format to wizard format
 * This eliminates the need for runtime conversion using adaptWebCharacter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to RPG content directory
const RPG_DIR = path.join(__dirname, '../src/content/rpg');

// General skills list (from src/data/generalSkills.ts)
const GENERAL_SKILLS = [
    'Acechar/Discrección',
    'Comb. cuerpo a cuerpo',
    'Comb. a distancia',
    'Conocimientos generales',
    'Conducir',
    'Esconderse',
    'Idea',
    'Idioma nativo',
    'Influencia',
    'Investigar',
    'Lanzar',
    'Primeros auxilios',
    'Suerte',
    'Trepar y Saltar'
];

/**
 * Adapt a web character to wizard format
 */
function adaptWebCharacter(webChar) {
    // Start with base structure
    const adapted = {
        ...webChar,
        skills: {
            generalItems: [],
            specialItems: [],
            ...webChar.skills
        },
        powers: {
            selected: [],
            ...webChar.powers
        }
    };

    // Adapt SKILLS
    if (webChar.skills?.items && Array.isArray(webChar.skills.items)) {
        const generalItems = [];
        const specialItems = [];

        webChar.skills.items.forEach((item) => {
            const isGeneral = GENERAL_SKILLS.some(gs =>
                item.name.includes(gs) || gs.includes(item.name.split(' - ')[0])
            );

            const skillObj = {
                name: item.name,
                value: item.value,
                math: item.math
            };

            if (isGeneral) {
                generalItems.push(skillObj);
            } else {
                specialItems.push(skillObj);
            }
        });

        adapted.skills = {
            generalItems,
            specialItems,
            cost: webChar.skills.cost
        };

        // Remove old items array
        delete adapted.skills.items;
    }

    // Merge specialskills into skills.specialItems
    if (webChar.specialskills?.items && Array.isArray(webChar.specialskills.items)) {
        if (!adapted.skills.specialItems) {
            adapted.skills.specialItems = [];
        }

        webChar.specialskills.items.forEach((item) => {
            adapted.skills.specialItems.push({
                name: item.name,
                value: item.value,
                math: item.math
            });
        });

        // Remove specialskills section
        delete adapted.specialskills;
    }

    // Adapt POWERS
    if (webChar.powers?.items && Array.isArray(webChar.powers.items)) {
        adapted.powers = {
            selected: webChar.powers.items.map((p) => ({
                id: p.id || `power_${p.name.toLowerCase().replace(/\s+/g, '_')}`,
                name: p.name,
                rank: p.rank || 1,
                skillValue: 0,
                powerMod: 0,
                selectedOption: p.selectedOption || '',
                customizations: p.customizations || [],
                effect: p.notes || p.effect || '',
                value: p.value // Keep original value for display
            })),
            cost: webChar.powers.cost
        };
    }

    // Adapt TECH MODULES (handle both cases)
    const rawTech = webChar.techModules?.items || webChar.techmodules?.items;
    if (rawTech && Array.isArray(rawTech)) {
        adapted.techModules = {
            installed: rawTech.map((tm) => ({
                id: tm.id || `tm_${Math.random().toString(36).substr(2, 9)}`,
                name: tm.name,
                location: tm.location || '',
                notes: tm.notes || '',
                pcCost: tm.pcCost || 0
            }))
        };

        // Remove old techmodules (lowercase)
        delete adapted.techmodules;
    }

    // Ensure arrays exist for other sections
    if (webChar.weapons?.items) {
        adapted.weapons = { items: webChar.weapons.items, cost: webChar.weapons.cost };
    }
    if (webChar.equipment?.items) {
        adapted.equipment = { items: webChar.equipment.items, cost: webChar.equipment.cost };
    }
    if (webChar.artifacts?.items) {
        adapted.artifacts = { items: webChar.artifacts.items, cost: webChar.artifacts.cost };
    }
    if (webChar.vehicles?.items) {
        adapted.vehicles = { items: webChar.vehicles.items, cost: webChar.vehicles.cost };
    }

    return adapted;
}

/**
 * Convert all JSON files in the RPG directory
 */
async function convertAllFiles() {
    console.log('🔄 Converting RPG JSON files to wizard format...\n');

    const files = fs.readdirSync(RPG_DIR).filter(f => f.endsWith('.json'));

    let converted = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
        const filePath = path.join(RPG_DIR, file);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Check if already converted (has skills.generalItems)
            if (data.skills?.generalItems) {
                console.log(`⏭️  Skipped: ${file} (already converted)`);
                skipped++;
                continue;
            }

            // Convert
            const adapted = adaptWebCharacter(data);

            // Write back
            fs.writeFileSync(filePath, JSON.stringify(adapted, null, 2), 'utf-8');

            console.log(`✅ Converted: ${file}`);
            converted++;

        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error.message);
            errors++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Converted: ${converted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📁 Total files: ${files.length}`);
}

// Run conversion
convertAllFiles().catch(console.error);
