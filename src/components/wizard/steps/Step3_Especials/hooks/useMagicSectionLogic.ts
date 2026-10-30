import { type Spell } from '../../../../../data/spells';
import {
    calculateEM,
    calculateSelectedSpellsEMCost,
    TERRANO_TABLE_OPTIONS,
    getEMFormulaOptions
} from '../../../../../utils/calculations/magicCalculations';
import type { SelectedPower } from '../types';

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
    isLiberado?: boolean;
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
    isHadaEter,
    isLiberado
}: UseMagicSectionLogicProps) {

    const getRollLabel = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.label || id;
    const getRollCost = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.costText || '';

    // Build EM formula options combining all active EM-formula origins
    const emFormulaOptions = getEMFormulaOptions({
        isDotado,
        isHibrido,
        isTerrano,
        isPoseido
    });

    const emFormulaValue = `${emFormula.divisor}|${emFormula.pcCost}`;

    const totalCost = calculateSelectedSpellsEMCost(selectedSpells);

    const hasBaseEMOrigin = isMago || isElfoMagico || isHadaEter || isDotado || isHibrido || isTerrano || isPoseido;
    let maxEM = 0;
    if (hasBaseEMOrigin && emFormula.divisor !== 0) {
        let divisor = emFormula.divisor;
        if (isMago || isElfoMagico) divisor = 1;
        else if (isHadaEter) divisor = 2;
        maxEM = calculateEM(data, selectedPowers, divisor);
    }

    const isSpellAccessAllowed = (hasBaseEMOrigin && emFormula.divisor !== 0) || !!isLiberado;
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
        pcPenalty,
        hasBaseEMOrigin,
        isSpellAccessAllowed
    };
}
