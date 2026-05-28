import React from 'react';
import { SPELLS } from '../../../data/spells';
import { calculateEM, hasSubtype } from '../../../components/wizard/steps/Step3_Especials/utils';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

const normalizeId = (id: string): string => {
    if (!id) return '';
    return id
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

const SPELL_ERRATA_MAP: { [key: string]: string } = {
    "pesudopsi": "pseudo_psi",
    "proyecciconastral": "proyeccion_del_cuerpo_astral",
    "proyeccionastral": "proyeccion_del_cuerpo_astral",
    "percercionmagica": "percepcion_magica",
    "proyeccionenergiamagica": "proyeccion_de_energia_magica",
    "proyecciondeenergiamagicadefensa": "proyeccion_de_energia_magica",
    "cadenasdeltartaro": "cadenas_del_tartaro",
    "escantarobjetos": "encantar_objetos"
};

const parseSpellRank = (rankVal: any, maxRank: number = 5): number => {
    if (rankVal === undefined || rankVal === null) return 1;
    if (typeof rankVal === 'number') return rankVal;
    const str = String(rankVal).toLowerCase().trim();
    if (str === 'maestria') return maxRank;
    const digits = str.replace(/\D/g, '');
    if (digits) {
        const parsed = parseInt(digits, 10);
        if (!isNaN(parsed)) return parsed;
    }
    return 1;
};

interface SpellsSectionProps {
    character: any;
}

export const SpellsSection: React.FC<SpellsSectionProps> = ({ character }) => {
    let selectedSpells = character.spells?.selected || [];
    if (selectedSpells.length === 0 && character.spells?.items && Array.isArray(character.spells.items)) {
        selectedSpells = [];
        character.spells.items.forEach((s: any) => {
            const nameOrId = s.id || s.name;
            if (!nameOrId) return;
            const cleanNameOrId = nameOrId.replace(/\([^)]+\)/g, '').trim();
            const norm = normalizeId(cleanNameOrId);
            let correctId = norm;
            if (SPELL_ERRATA_MAP[norm]) {
                correctId = normalizeId(SPELL_ERRATA_MAP[norm]);
            }
            const spellDef = SPELLS.find(def => normalizeId(def.id) === correctId || normalizeId(def.name) === norm);
            if (spellDef) {
                const rank = parseSpellRank(s.rank, spellDef.maxRank);
                
                let selectedOption = s.selectedOption || '';
                if (!selectedOption) {
                    const optionMatch = nameOrId.match(/\(([^)]+)\)/);
                    if (optionMatch) {
                        const rawOpt = optionMatch[1].trim().toLowerCase();
                        const matchedOpt = spellDef.options?.find(o => o.toLowerCase() === rawOpt);
                        if (matchedOpt) {
                            selectedOption = matchedOpt;
                        } else {
                            selectedOption = optionMatch[1].trim();
                        }
                    }
                }

                selectedSpells.push({
                    id: spellDef.id,
                    rank: rank,
                    selectedOption: selectedOption
                });
            }
        });
    }

    if (selectedSpells.length === 0) return null;

    return (
        <SheetSection title="Hechizos" className="spells">
            <div className="section-subheader" style={{ marginTop: '-10px', marginBottom: '10px' }}>
                {(() => {
                    // 1. Try to use stored value
                    if (character.spells?.calculatedEM !== undefined) {
                        return (
                            <span className="cost spells-em-cost">
                                ({character.spells.calculatedEM} EM)
                            </span>
                        );
                    }

                    // 2. Fallback: Calculate Base EM
                    const isMago = hasSubtype(character, 'Arcano', 'Mago');
                    // Default to 4 if not set, unless Mago (1)
                    let divisor = character.spells?.emFormula?.divisor || 4;
                    if (isMago) divisor = 1;

                    if (divisor === 0) return null;

                    const calculatedEM = calculateEM(character, character.powers?.selected || [], divisor);

                    return (
                        <span className="cost spells-em-cost">
                            ({calculatedEM} EM)
                        </span>
                    );
                })()}
            </div>
            <ul className="clean-list">
                {selectedSpells.map((spell: any, idx: number) => {
                    const spellData = SPELLS.find(s => normalizeId(s.id) === normalizeId(spell.id) || normalizeId(s.name) === normalizeId(spell.name || spell.id));
                    if (!spellData) return null;

                    const maxRank = spellData.maxRank || 1;
                    const rankDisplay = spell.rank > maxRank
                        ? `Maestría (${spell.rank})`
                        : `Rango ${spell.rank}`;

                    return (
                        <li key={`${spell.id}-${idx}`} className="spell-item">
                            <DetailRow
                                label={
                                    <span className="spell-name">
                                        {spellData.name}
                                        {spell.selectedOption && (
                                            <span className="spell-option">
                                                ({spell.selectedOption})
                                            </span>
                                        )}
                                    </span>
                                }
                                value={
                                    <span className={`spell-rank ${spell.rank > maxRank ? 'master' : 'normal'}`}>
                                        {rankDisplay}
                                    </span>
                                }
                            />
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
