import React from 'react';
import { WizardSection } from '../../shared/layout/WizardSection';
import { useStep6Logic } from './useStep6Logic';
import type { BaseStepProps } from '../../../../types/character';
import { IdentitySection } from './sections/IdentitySection';
import { ManualStatsSection } from './sections/ManualStatsSection';
import { EquipmentSection } from './sections/EquipmentSection';
import { SpecialGearSection } from './sections/SpecialGearSection';
import '../../shared/layout/WizardStep.css';
import './Step6_Details.css';

export interface Step6Props extends BaseStepProps {
    totalPCs?: string | number;
}

export default function Step6_Details({ data, onChange, onShowHelp }: Step6Props) {
    const {
        updateField,
        addItem,
        updateItem,
        removeItem,
        applyArtifactPreset,
        applyMagicPreset,
        unlockCombatStats,
        setUnlockCombatStats,
        unlockOtherStats,
        setUnlockOtherStats,
        updateCombatStat,
        updateOtherStat
    } = useStep6Logic(data, onChange);

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Detalles Finales"
                description="Define la identidad de tu personaje y equipalo."
                onHelp={onShowHelp}
            />

            <IdentitySection
                data={data}
                updateField={updateField}
            />

            <ManualStatsSection
                combatstats={data.combatstats}
                otherstats={data.otherstats}
                unlockCombatStats={unlockCombatStats}
                setUnlockCombatStats={setUnlockCombatStats}
                unlockOtherStats={unlockOtherStats}
                setUnlockOtherStats={setUnlockOtherStats}
                updateCombatStat={updateCombatStat}
                updateOtherStat={updateOtherStat}
            />

            <EquipmentSection
                weapons={data.weapons}
                equipment={data.equipment}
                varios={data.varios}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
            />

            <SpecialGearSection
                vehicles={data.vehicles}
                artifacts={data.artifacts}
                magicObjects={data.magicObjects}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                applyArtifactPreset={applyArtifactPreset}
                applyMagicPreset={applyMagicPreset}
            />
        </div>
    );
}
