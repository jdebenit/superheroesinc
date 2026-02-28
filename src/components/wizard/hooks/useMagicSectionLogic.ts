import { SPELLS, type Spell } from '../../../data/spells';
import { calculateEM, hasSubtype } from '../steps/Step3_Especials/utils';
import type { SelectedPower } from '../steps/Step3_Especials/types';

const TERRANO_TABLE_OPTIONS = [
    { id: 'guardian_power', label: 'Acceso a Poder de Guardián', cost: 2, costText: '+2 PC' },
    { id: '180_EM', label: 'Acceso a objetos de 180 EM', cost: 1, costText: '+1 PC' },
    { id: '120_EM', label: 'Acceso a objetos de 120 EM', cost: 0, costText: '+0 PC' },
    { id: '60_EM', label: 'Acceso a objetos de 60 EM', cost: -1, costText: '-1 PC' },
    { id: 'none', label: 'Ningún objeto', cost: -2, costText: '-2 PC' },
];

const EM_FORMULA_OPTIONS_DOTADO = [
    { id: '2|8', label: 'Dotado: (PER+INT+VOL)/2 → +8 PCs', cost: 8 },
    { id: '3|3', label: 'Dotado: (PER+INT+VOL)/3 → +3 PCs', cost: 3 },
    { id: '4|0', label: 'Dotado: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
];
const EM_FORMULA_OPTIONS_HIBRIDO = [
    { id: '2|15', label: 'Híbrido: (PER+INT+VOL)/2 → +15 PCs', cost: 15 },
    { id: '3|10', label: 'Híbrido: (PER+INT+VOL)/3 → +10 PCs', cost: 10 },
    { id: '4|7', label: 'Híbrido: (PER+INT+VOL)/4 → +7 PCs', cost: 7 },
    { id: '0|0', label: 'Híbrido: No EM', cost: 0 },
];
const EM_FORMULA_OPTIONS_TERRANO = [
    { id: '4|0', label: 'Terrano: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
    { id: '0|-5', label: 'Terrano Ajeno: No EM → -5 PCs', cost: -5 },
];
const EM_FORMULA_OPTIONS_POSEIDO = [
    { id: '2|3', label: 'Poseído: (INT+PER+VOL)/2 → +3 PCs', cost: 3 },
    { id: '0|0', label: 'Poseído: No accede a hechizos → +0 PCs', cost: 0 },
];

export interface UseMagicSectionLogicProps {
    data: any;
    selectedSpells: Array<Spell & { rank: number; selectedOption?: string }>;
    selectedPowers: SelectedPower[];
    emFormula: { divisor: number; pcCost: number };
    isMago: boolean;
    isDotado: boolean;
    isHibrido: boolean;
    isTerrano: boolean;
    isPoseido?: boolean;
    isElfoMagico?: boolean;
    isHadaEter?: boolean;
}

export function useMagicSectionLogic({
    data,
    selectedSpells,
    selectedPowers,
    emFormula,
    isMago,
    isDotado,
    isHibrido,
    isTerrano,
    isPoseido,
    isElfoMagico,
    isHadaEter
}: UseMagicSectionLogicProps) {

    const getRollLabel = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.label || id;
    const getRollCost = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.costText || '';

    // Build em formula options for FormSelect
    const emFormulaOptions = isDotado
        ? EM_FORMULA_OPTIONS_DOTADO
        : isHibrido
            ? EM_FORMULA_OPTIONS_HIBRIDO
            : isTerrano
                ? EM_FORMULA_OPTIONS_TERRANO
                : isPoseido
                    ? EM_FORMULA_OPTIONS_POSEIDO
                    : [];

    const emFormulaValue = `${emFormula.divisor}|${emFormula.pcCost}`;

    const totalCost = selectedSpells.reduce((acc, s) => {
        const baseCost = parseInt(s.cost, 10) || 0;
        return acc + baseCost * s.rank;
    }, 0);

    let divisor = emFormula.divisor;
    if (isMago || isElfoMagico) divisor = 1;
    else if (isHadaEter) divisor = 2;
    const maxEM = emFormula.divisor !== 0 ? calculateEM(data, selectedPowers, divisor) : 0;

    const emExceeded = totalCost > maxEM;
    const pcPenalty = emExceeded ? (totalCost - maxEM) / 10 : 0;

    return {
        TERRANO_TABLE_OPTIONS,
        getRollLabel,
        getRollCost,
        emFormulaOptions,
        emFormulaValue,
        totalCost,
        maxEM,
        emExceeded,
        pcPenalty
    };
}
