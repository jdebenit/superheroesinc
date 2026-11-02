import { useMemo, useState } from 'react';
import { calculateSpecialtyAllowedCharacteristics } from '../../../../utils/characterCalculations';
import { useStep2Logic } from './useStep2Logic';
import { TransitionFormSection } from './TransitionFormSection';
import { FormTabsBar, type FormTabOption } from './sections/FormTabsBar';
import { OriginBonusSelectors } from './sections/OriginBonusSelectors';
import { CharacteristicsGridSection } from './sections/CharacteristicsGridSection';
import {
    hasHombreLobo,
    WEREWOLF_TRANSITION_FORM_ID,
    getWerewolfSubtypeConfig,
    getActivePowerTransformations
} from '../../../../data/werewolfOptions';
import type { BaseStepProps } from '../../../../types/character';
import '../../shared/layout/WizardStep.css';
import './Step2_Characteristics.css';

export type Step2Props = BaseStepProps;

export default function Step2_Characteristics({ data, onChange, onShowHelp }: Step2Props) {
    const [activeFormTab, setActiveFormTab] = useState<'base' | string>('base');

    const {
        characteristics,
        chosenBonusCharacteristic,
        chosenCharacteristics,
        choosableEntries,
        setChosenCharacteristic,
        isDistributableMode,
        pointsInfo,
        specialtyPointsInfo,
        pcValues,
        totalPC,
        getTotal,
        handleCharacteristicChange,
        origins,
        unlockManualMod,
        setUnlockManualMod
    } = useStep2Logic(data, onChange);

    const allowedSpecialtyChars = useMemo(() => {
        return calculateSpecialtyAllowedCharacteristics(origins);
    }, [origins]);

    const isWerewolf = useMemo(() => hasHombreLobo(data), [data]);
    const activePowerTransformations = useMemo(() => getActivePowerTransformations(data), [data]);

    const wwSubtypeConfig = useMemo(() => {
        return getWerewolfSubtypeConfig(data.werewolfParams?.subtype);
    }, [data.werewolfParams?.subtype]);

    const formTabs = useMemo<FormTabOption[]>(() => {
        const tabs: FormTabOption[] = [];
        const formsList: any[] = Array.isArray(data.forms) ? data.forms : [];

        if (isWerewolf) {
            const wwForm = formsList.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
            tabs.push({
                id: WEREWOLF_TRANSITION_FORM_ID,
                icon: '🐺',
                title: `Forma de Transición (${wwSubtypeConfig.shortName})`,
                cost: wwForm?.cost || 0
            });
        }

        activePowerTransformations.forEach(cfg => {
            const pForm = formsList.find(f => f.id === cfg.formId);
            tabs.push({
                id: cfg.formId,
                icon: cfg.icon,
                title: cfg.name,
                cost: pForm?.cost || 0
            });
        });

        return tabs;
    }, [isWerewolf, wwSubtypeConfig.shortName, activePowerTransformations, data.forms]);

    const hasAlternativeForms = formTabs.length > 0;
    const effectiveTab = (activeFormTab !== 'base' && !formTabs.some(t => t.id === activeFormTab))
        ? 'base'
        : activeFormTab;

    return (
        <div className="wizard-step-container">
            <FormTabsBar
                effectiveTab={effectiveTab}
                totalPC={totalPC}
                formTabs={formTabs}
                onSelectTab={setActiveFormTab}
            />

            {effectiveTab !== 'base' ? (
                <TransitionFormSection
                    data={data}
                    onChange={onChange}
                    unlockManualMod={unlockManualMod}
                    setUnlockManualMod={setUnlockManualMod}
                    humanBreakdown={characteristics}
                    formId={effectiveTab}
                />
            ) : (
                <>
                    <OriginBonusSelectors
                        isDistributableMode={isDistributableMode}
                        hasSpecialtyPoints={Boolean(specialtyPointsInfo)}
                        choosableEntries={choosableEntries}
                        chosenCharacteristics={chosenCharacteristics}
                        chosenBonusCharacteristic={chosenBonusCharacteristic}
                        onSelectCharacteristic={setChosenCharacteristic}
                        onShowHelp={onShowHelp}
                    />

                    <CharacteristicsGridSection
                        hasAlternativeForms={hasAlternativeForms}
                        isDistributableMode={isDistributableMode}
                        pointsInfo={pointsInfo}
                        specialtyPointsInfo={specialtyPointsInfo}
                        totalPC={totalPC}
                        unlockManualMod={unlockManualMod}
                        setUnlockManualMod={setUnlockManualMod}
                        characteristics={characteristics}
                        origins={origins}
                        chosenCharacteristics={chosenCharacteristics}
                        liberadoParams={data.liberadoParams}
                        allowedSpecialtyChars={allowedSpecialtyChars}
                        pcValues={pcValues}
                        getTotal={getTotal}
                        onCharacteristicChange={handleCharacteristicChange}
                    />
                </>
            )}
        </div>
    );
}
