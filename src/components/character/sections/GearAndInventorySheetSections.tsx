import React from 'react';
import { WeaponsSection } from './WeaponsSection';
import { ArtifactsSection } from './ArtifactsSection';
import { MagicObjectsSection } from './MagicObjectsSection';
import { VehiclesSection } from './VehiclesSection';
import { EquipmentSection } from './EquipmentSection';
import { VariosSection } from './VariosSection';
import { NotesSection } from './NotesSection';

interface GearAndInventorySheetSectionsProps {
    character: any;
}

/**
 * Agrupador declarativo de secciones de inventario, armamento, artefactos, vehículos y notas.
 */
export const GearAndInventorySheetSections: React.FC<GearAndInventorySheetSectionsProps> = ({
    character
}) => {
    return (
        <>
            <WeaponsSection weapons={character.weapons} />
            <ArtifactsSection artifacts={character.artifacts} />
            <MagicObjectsSection
                magicObjects={character.magicObjects}
                magicTableRolls={character.magicTableRolls}
            />
            <VehiclesSection vehicles={character.vehicles} />
            <EquipmentSection equipment={character.equipment} />
            <VariosSection varios={character.varios} />
            <NotesSection character={character} />
        </>
    );
};
