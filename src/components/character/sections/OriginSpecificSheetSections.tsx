import React from 'react';
import { HybridSection } from './HybridSection';
import { EnteSection } from './EnteSection';
import { AlteradoSection } from './AlteradoSection';
import { HibridoSheetSection } from './HibridoSheetSection';
import { MutanteSection } from './MutanteSection';
import { PoseidoSection } from './PoseidoSection';
import { GuardianSection } from './GuardianSection';
import { DivineSection } from './DivineSection';
import { MalditoSection } from './MalditoSection';
import { LiberadoSection } from './LiberadoSection';
import { WerewolfSheetSection } from './WerewolfSheetSection';
import { TechParamsSection } from './TechParamsSection';
import { TechModulesSection } from './TechModulesSection';
import { ExoskeletonSection } from './ExoskeletonSection';
import { TechnifiedSection } from './TechnifiedSection';
import { MagicalBondsSection } from './MagicalBondsSection';
import { TraumasSection } from './TraumasSection';

interface OriginSpecificSheetSectionsProps {
    activeCharacter: any;
    baseCharacter: any;
}

/**
 * Agrupador declarativo de secciones de parámetros especiales de origen para CharacterSheet.
 * Homólogo a `Step3_Especials/sections/OriginSpecificSections.tsx` en el Wizard.
 */
export const OriginSpecificSheetSections: React.FC<OriginSpecificSheetSectionsProps> = ({
    activeCharacter,
    baseCharacter
}) => {
    return (
        <>
            <HybridSection character={activeCharacter} />
            <EnteSection character={activeCharacter} />
            <AlteradoSection character={activeCharacter} />
            <HibridoSheetSection character={activeCharacter} />
            <MutanteSection character={activeCharacter} />
            <PoseidoSection character={activeCharacter} />
            <GuardianSection character={activeCharacter} />
            <DivineSection character={activeCharacter} />
            <MalditoSection character={activeCharacter} />
            <LiberadoSection character={activeCharacter} />
            <WerewolfSheetSection character={activeCharacter} baseCharacter={baseCharacter} />
            <TechParamsSection character={activeCharacter} />
            <TechModulesSection techModules={activeCharacter.techModules || []} />
            <ExoskeletonSection character={activeCharacter} />
            <TechnifiedSection character={activeCharacter} />
            <MagicalBondsSection character={activeCharacter} />
            <TraumasSection character={activeCharacter} />
        </>
    );
};
