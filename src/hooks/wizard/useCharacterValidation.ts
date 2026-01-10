import { POWERS } from '../../data/powers';
import { hasSubtype } from '../../components/wizard/steps/Step3_Especials/utils';

export function useCharacterValidation(data: any) {
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isEnano = hasSubtype(data, 'Arcano', 'Enano');
    const emFormula = data.spells?.emFormula || { divisor: 4 };
    const selectedPowers = data.powers?.selected || [];
    const magicTableRolls = data.magicTableRolls || [];

    const validatePowerSelection = (powerId: string, originFilter: string) => {
        // Terrano Restriction Logic
        if (isTerrano && originFilter === 'Guardian') {
            const isAjeno = emFormula.divisor === 0;
            const maxGuardianPowers = isAjeno ? 2 : 1;

            const isAlreadySelected = selectedPowers.some((p: any) => p.id === powerId && p.origin === 'Guardian');

            if (!isAlreadySelected) {
                const currentGuardianCount = selectedPowers.filter((p: any) => p.origin === 'Guardian').length;
                const allowedGuardianCount = magicTableRolls.filter((r: string) => r === 'guardian_power').length;

                // For Terrano, access to Guardian power must be "bought" via magic table
                if (currentGuardianCount >= allowedGuardianCount) {
                    return {
                        allowed: false,
                        message: `Para seleccionar un Poder de Guardián, debes gastar un slot en la "Tabla de Objetos Mágicos" seleccionando la opción "Acceso a Poder de Guardián". Tienes ${allowedGuardianCount} accesos y ya usas ${currentGuardianCount}.`
                    };
                }
            }
        }

        // Enano Restriction Logic
        if (isEnano && originFilter === 'Guardian') {
            const isAlreadySelected = selectedPowers.some((p: any) => p.id === powerId && p.origin === 'Guardian');
            if (!isAlreadySelected) {
                const currentGuardianCount = selectedPowers.filter((p: any) => p.origin === 'Guardian').length;
                if (currentGuardianCount >= 1) {
                    return {
                        allowed: false,
                        message: `Los Enanos solo pueden elegir un único poder de Guardián.`
                    };
                }
            }
        }

        return { allowed: true };
    };

    const validateMagicTableRoll = () => {
        if (!isTerrano) return { allowed: false, message: "No eres Terrano." };

        const divisor = emFormula.divisor;
        const isAjeno = divisor === 0;
        const maxSlots = isAjeno ? 2 : 1;
        const rollCount = magicTableRolls.length;

        if (rollCount >= maxSlots) {
            return {
                allowed: false,
                message: `Los Terranos solo tienen ${maxSlots} slots disponibles en la Tabla de Objetos.`
            };
        }
        return { allowed: true };
    };

    return {
        validatePowerSelection,
        validateMagicTableRoll
    };
}
