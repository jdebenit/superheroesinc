import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to skip (Category C - require manual review)
const SKIP_FILES = ['leon-rojo.json'];

// Wizard format template (based on initialCharacterState)
const WIZARD_DEFAULTS = {
    alias: "",
    notes: "",
    totalCost: "",
    level: 1,
    origin: { items: [] },
    combatstats: [
        "Acciones por asalto: -",
        "Iniciativa y Reflejos: -",
        "Puntos de Vida: -",
        "Equilibrio Mental: -"
    ],
    otherstats: [
        "Inconsciencia: -",
        "Recuperación: - PV/h",
        "Resistencia a gases y venenos: -",
        "Modificador de fuerza: -",
        "Peso Levantado: -",
        "Daño absorbido físico: -",
        "Daño absorbido mental: -",
        "Modificador de impacto: -",
        "Modificador Psionico: -",
        "Parada Fisica: -",
        "Parada mental: -",
        "Salto (alto / largo): -"
    ],
    attributes: {
        values: {
            "Fuerza": 40,
            "Constitución": 40,
            "Agilidad": 40,
            "Inteligencia": 40,
            "Percepción": 40,
            "Apariencia": 40,
            "Voluntad": 40
        },
        breakdown: {
            fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 }
        },
        manualBonuses: {
            Fuerza: 0,
            Agilidad: 0,
            Constitución: 0,
            Inteligencia: 0,
            Percepción: 0,
            Voluntad: 0,
            Apariencia: 0
        }
    },
    skills: {
        generalItems: [],
        specialItems: [],
        generalManualMods: {},
        manualBases: {},
        selected: {},
        specified: {}
    },
    specialskills: { items: [] },
    background: {
        items: [],
        prejudiceResistance: 50,
        economicStatus: 'clase_media',
        legalStatus: 'sin_antecedentes',
        socialStatus: 'anonimo',
        friendsAndAssociates: 'conocido'
    },
    equipment: { items: [] },
    weapons: { items: [] },
    artifacts: { items: [] },
    magicObjects: { items: [] },
    vehicles: { items: [] },
    spells: {
        selected: [],
        emFormula: { divisor: 4, pcCost: 0 }
    },
    powers: {
        selected: []
    },
    magicalBonds: [],
    magicalBondsCustomName: "",
    magicalBondsCustomDescription: "",
    enteParams: {
        formType: null,
        visualEffect: null
    },
    malditoParams: {
        magnitude: null,
        source: null
    },
    poseidoParams: {
        formType: null
    },
    alteradoParams: null,
    mutanteParams: null,
    guardianParams: null,
    magicTableRolls: [],
    divineParams: null,
    techModules: {
        installed: []
    },
    techParams: { incomeSource: 'agencia_priv' },
    exoskeletonConfig: "",
    exoskeletonArmorConfig: null,
    technoSuitStrengthConfig: null,
    cyborgImplants: [],
    isParahumanoHybrid: false,
};

interface MigrationReport {
    file: string;
    status: 'success' | 'skipped' | 'error';
    changes: string[];
    error?: string;
}

const attributeNameMap: Record<string, string> = {
    'Fuerza': 'fuerza',
    'Constitución': 'constitucion',
    'Agilidad': 'agilidad',
    'Inteligencia': 'inteligencia',
    'Percepción': 'percepcion',
    'Apariencia': 'apariencia',
    'Voluntad': 'voluntad'
};

function generateAttributeBreakdown(values: any, existingBreakdown?: any): any {
    const breakdown: any = {};

    for (const [attrName, attrValue] of Object.entries(values)) {
        const key = attributeNameMap[attrName] || attrName.toLowerCase();

        if (existingBreakdown && existingBreakdown[key]) {
            // Preserve existing breakdown
            breakdown[key] = existingBreakdown[key];
        } else {
            // Generate new breakdown with all values in base
            breakdown[key] = {
                base: attrValue,
                originMod: 0,
                specialtyMod: 0,
                powerMod: 0
            };
        }
    }

    return breakdown;
}

function convertOldPowerFormat(power: any, originName: string): any {
    // Convert rank to number if needed
    let rank = 1;
    if (power.rank !== undefined) {
        if (typeof power.rank === 'number') {
            // Already a number, use as is
            rank = power.rank;
        } else if (typeof power.rank === 'string') {
            // Extract number from "Bajo(01)", "Medio(21)", "Alto(81)", "Cosmico(100)"
            const match = power.rank.match(/\((\d+)\)/);
            if (match) {
                rank = parseInt(match[1], 10);
            }
        }
    }

    // Clean up power ID (ALWAYS clean, even if already migrated)
    let cleanId = power.id || power.name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';

    // Remove "power_" prefix if present
    if (cleanId.startsWith('power_')) {
        cleanId = cleanId.substring(6);
    }

    // Remove everything after colon (e.g., "ataque_especial:arma_natural_garras" -> "ataque_especial")
    // This is important because the power catalog only has base IDs
    if (cleanId.includes(':')) {
        cleanId = cleanId.split(':')[0];
    }

    // Remove leading/trailing underscores and clean up
    cleanId = cleanId.trim().replace(/^_+|_+$/g, '');

    return {
        id: cleanId,
        origin: power.origin || originName || 'Mutante',
        rank: rank,
        customizations: power.customizations || [],
        skillValue: power.skillValue || 0
    };
}

function migrateJSON(data: any): { migrated: any; changes: string[] } {
    const changes: string[] = [];
    const migrated = { ...data };

    // 1. Add missing basic fields
    if (!migrated.alias) {
        migrated.alias = "";
        changes.push("Added 'alias' field");
    }
    if (!migrated.notes) {
        migrated.notes = "";
        changes.push("Added 'notes' field");
    }
    if (!migrated.totalCost) {
        migrated.totalCost = "";
        changes.push("Added 'totalCost' field");
    }
    if (!migrated.level) {
        migrated.level = 1;
        changes.push("Added 'level' field");
    }

    // 2. Ensure origin structure
    if (!migrated.origin) {
        migrated.origin = { items: [] };
        changes.push("Added 'origin' structure");
    } else if (!migrated.origin.items) {
        migrated.origin.items = [];
        changes.push("Added 'origin.items' array");
    }

    // 3. Migrate attributes
    if (migrated.attributes) {
        if (!migrated.attributes.breakdown) {
            migrated.attributes.breakdown = generateAttributeBreakdown(
                migrated.attributes.values || WIZARD_DEFAULTS.attributes.values
            );
            changes.push("Generated 'attributes.breakdown' from values");
        }

        if (!migrated.attributes.manualBonuses) {
            migrated.attributes.manualBonuses = { ...WIZARD_DEFAULTS.attributes.manualBonuses };
            changes.push("Added 'attributes.manualBonuses'");
        }
    } else {
        migrated.attributes = { ...WIZARD_DEFAULTS.attributes };
        changes.push("Added complete 'attributes' structure");
    }

    // 4. Migrate skills
    if (migrated.skills) {
        if (!migrated.skills.generalManualMods) {
            migrated.skills.generalManualMods = {};
            changes.push("Added 'skills.generalManualMods'");
        }
        if (!migrated.skills.manualBases) {
            migrated.skills.manualBases = {};
            changes.push("Added 'skills.manualBases'");
        }
        if (!migrated.skills.selected) {
            migrated.skills.selected = {};
            changes.push("Added 'skills.selected'");
        }
        if (!migrated.skills.specified) {
            migrated.skills.specified = {};
            changes.push("Added 'skills.specified'");
        }
        if (!migrated.skills.generalItems) {
            migrated.skills.generalItems = [];
        }
        if (!migrated.skills.specialItems) {
            migrated.skills.specialItems = [];
        }
    } else {
        migrated.skills = { ...WIZARD_DEFAULTS.skills };
        changes.push("Added complete 'skills' structure");
    }

    // 5. Migrate powers (convert old format to new)
    if (migrated.powers && migrated.powers.selected) {
        const originName = migrated.origin?.items?.[0]
            ? Object.keys(migrated.origin.items[0])[0]
            : 'Mutante';

        let convertedAny = false;
        migrated.powers.selected = migrated.powers.selected.map((power: any) => {
            const converted = convertOldPowerFormat(power, originName);
            if (JSON.stringify(converted) !== JSON.stringify(power)) {
                convertedAny = true;
            }
            return converted;
        });

        if (convertedAny) {
            changes.push("Converted powers from old format to new format");
        }
    } else if (!migrated.powers) {
        migrated.powers = { selected: [] };
        changes.push("Added 'powers' structure");
    }

    // 6. Add missing background fields
    if (!migrated.background) {
        migrated.background = { ...WIZARD_DEFAULTS.background };
        changes.push("Added complete 'background' structure");
    } else {
        if (!migrated.background.items) migrated.background.items = [];
        if (migrated.background.prejudiceResistance === undefined) {
            migrated.background.prejudiceResistance = 50;
        }
        if (!migrated.background.economicStatus) {
            migrated.background.economicStatus = 'clase_media';
        }
        if (!migrated.background.legalStatus) {
            migrated.background.legalStatus = 'sin_antecedentes';
        }
        if (!migrated.background.socialStatus) {
            migrated.background.socialStatus = 'anonimo';
        }
        if (!migrated.background.friendsAndAssociates) {
            migrated.background.friendsAndAssociates = 'conocido';
        }
    }

    // 7. Add missing equipment structures
    if (!migrated.equipment) {
        migrated.equipment = { items: [] };
        changes.push("Added 'equipment' structure");
    }
    if (!migrated.weapons) {
        migrated.weapons = { items: [] };
        changes.push("Added 'weapons' structure");
    }
    if (!migrated.artifacts) {
        migrated.artifacts = { items: [] };
        changes.push("Added 'artifacts' structure");
    }
    if (!migrated.magicObjects) {
        migrated.magicObjects = { items: [] };
        changes.push("Added 'magicObjects' structure");
    }
    if (!migrated.vehicles) {
        migrated.vehicles = { items: [] };
        changes.push("Added 'vehicles' structure");
    }

    // 8. Add missing special params
    if (!migrated.spells) {
        migrated.spells = { selected: [], emFormula: { divisor: 4, pcCost: 0 } };
        changes.push("Added 'spells' structure");
    }
    if (!migrated.magicalBonds) {
        migrated.magicalBonds = [];
    }
    if (!migrated.magicalBondsCustomName) {
        migrated.magicalBondsCustomName = "";
    }
    if (!migrated.magicalBondsCustomDescription) {
        migrated.magicalBondsCustomDescription = "";
    }
    if (!migrated.specialskills) {
        migrated.specialskills = { items: [] };
    }

    // 9. Add origin-specific params (set to null if not present)
    const paramsToAdd = [
        'enteParams', 'malditoParams', 'poseidoParams', 'alteradoParams',
        'mutanteParams', 'guardianParams', 'divineParams', 'techParams',
        'exoskeletonArmorConfig', 'technoSuitStrengthConfig'
    ];

    for (const param of paramsToAdd) {
        if (!(param in migrated)) {
            if (param === 'enteParams') {
                migrated[param] = { formType: null, visualEffect: null };
            } else if (param === 'malditoParams') {
                migrated[param] = { magnitude: null, source: null };
            } else if (param === 'poseidoParams') {
                migrated[param] = { formType: null };
            } else if (param === 'techParams') {
                migrated[param] = { incomeSource: 'agencia_priv' };
            } else {
                migrated[param] = null;
            }
        }
    }

    // exoskeletonConfig must be string, not null
    if (!migrated.exoskeletonConfig) {
        migrated.exoskeletonConfig = "";
    }

    if (!migrated.magicTableRolls) {
        migrated.magicTableRolls = [];
    }
    // techModules must be object with installed array, not plain array
    if (!migrated.techModules || Array.isArray(migrated.techModules)) {
        migrated.techModules = { installed: Array.isArray(migrated.techModules) ? migrated.techModules : [] };
    }
    if (!migrated.cyborgImplants) {
        migrated.cyborgImplants = [];
    }
    if (migrated.isParahumanoHybrid === undefined) {
        migrated.isParahumanoHybrid = false;
    }

    return { migrated, changes };
}

function main() {
    const rpgDir = path.join(__dirname, '..', 'src', 'content', 'rpg');
    const files = fs.readdirSync(rpgDir).filter(f => f.endsWith('.json'));

    const reports: MigrationReport[] = [];

    console.log('🚀 Starting RPG JSON Migration...\n');
    console.log(`📁 Directory: ${rpgDir}`);
    console.log(`📄 Found ${files.length} JSON files\n`);

    for (const file of files) {
        const report: MigrationReport = {
            file,
            status: 'success',
            changes: []
        };

        try {
            // Skip Category C files
            if (SKIP_FILES.includes(file)) {
                report.status = 'skipped';
                report.changes.push('Category C - requires manual review');
                reports.push(report);
                console.log(`⏭️  Skipped: ${file} (Category C)`);
                continue;
            }

            const filePath = path.join(rpgDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            const { migrated, changes } = migrateJSON(data);

            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2), 'utf-8');

            report.changes = changes;
            reports.push(report);

            console.log(`✅ Migrated: ${file} (${changes.length} changes)`);

        } catch (error) {
            report.status = 'error';
            report.error = error instanceof Error ? error.message : String(error);
            reports.push(report);
            console.error(`❌ Error: ${file} - ${report.error}`);
        }
    }

    // Generate summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    const successful = reports.filter(r => r.status === 'success').length;
    const skipped = reports.filter(r => r.status === 'skipped').length;
    const errors = reports.filter(r => r.status === 'error').length;

    console.log(`✅ Successfully migrated: ${successful}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📁 Total files: ${files.length}\n`);

    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2), 'utf-8');
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

    // Show files that were skipped
    if (skipped > 0) {
        console.log('⚠️  Skipped files (require manual review):');
        reports.filter(r => r.status === 'skipped').forEach(r => {
            console.log(`   - ${r.file}`);
        });
        console.log();
    }

    // Show errors if any
    if (errors > 0) {
        console.log('❌ Files with errors:');
        reports.filter(r => r.status === 'error').forEach(r => {
            console.log(`   - ${r.file}: ${r.error}`);
        });
        console.log();
    }
}

main();
