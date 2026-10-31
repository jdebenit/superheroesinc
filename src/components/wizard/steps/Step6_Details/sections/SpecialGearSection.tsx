import React from 'react';
import { ARTIFACTS } from '../../../../../data/artifacts';
import { MAGIC_OBJECTS } from '../../../../../data/magicObjects';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';
import { WizardGrid } from '../../../shared/layout/WizardGrid';
import { DynamicList } from '../../../shared/layout/DynamicList';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';

interface SpecialGearSectionProps {
    vehicles?: { items: any[] };
    artifacts?: { items: any[] };
    magicObjects?: { items: any[] };
    addItem: (category: string, defaultItem: any) => void;
    updateItem: (category: string, index: number, field: string, value: any) => void;
    removeItem: (category: string, index: number) => void;
    applyArtifactPreset: (index: number, presetId: string) => void;
    applyMagicPreset: (index: number, presetId: string) => void;
}

export function SpecialGearSection({
    vehicles,
    artifacts,
    magicObjects,
    addItem,
    updateItem,
    removeItem,
    applyArtifactPreset,
    applyMagicPreset
}: SpecialGearSectionProps) {
    return (
        <>
            <WizardSection
                title="Vehículos"
                collapsible
                defaultCollapsed={(vehicles?.items?.length ?? 0) === 0}
                rightContent={
                    (vehicles?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={vehicles?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={vehicles?.items || []}
                    onAdd={() => addItem('vehicles', { name: "Nuevo vehículo", armor: "", pe: "", speed: "", range: "", cost: 0 })}
                    onRemove={(idx) => removeItem('vehicles', idx)}
                    addButtonLabel="Añadir Vehículo"
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <WizardGrid
                            columns="2fr 1fr 1fr 1fr 1fr 1fr 120px"
                            headers={['Modelo', 'Blind.', 'PE', 'Vel.', 'Alc.', 'Man.', 'Coste']}
                        >
                            <WizardField
                                label="Modelo / Fabricante"
                                value={item.name}
                                onChange={(val: string) => updateItem('vehicles', index, 'name', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                label="Blindaje"
                                value={item.armor || ''}
                                onChange={(val: string) => updateItem('vehicles', index, 'armor', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                label="PE"
                                value={item.pe || ''}
                                onChange={(val: string) => updateItem('vehicles', index, 'pe', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                label="Velocidad"
                                value={item.speed || ''}
                                onChange={(val: string) => updateItem('vehicles', index, 'speed', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                label="Alcance/Autonomía"
                                value={item.range || ''}
                                onChange={(val: string) => updateItem('vehicles', index, 'range', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                type="number"
                                label="Maniobrabilidad"
                                min="0"
                                value={item.maneuverability ?? 0}
                                onChange={(val: string) => updateItem('vehicles', index, 'maneuverability', Math.max(0, parseInt(val) || 0))}
                                noMargin
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                type="number"
                                label="Coste"
                                min="0"
                                value={item.cost || 0}
                                onChange={(val: string) => updateItem('vehicles', index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                noMargin
                                hideLabelDesktop={true}
                            />
                        </WizardGrid>
                    )}
                />
            </WizardSection>

            <WizardSection
                title="Artefactos"
                collapsible
                defaultCollapsed={(artifacts?.items?.length ?? 0) === 0}
                rightContent={
                    (artifacts?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={artifacts?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={artifacts?.items || []}
                    onAdd={() => addItem('artifacts', { name: "Nuevo artefacto", reliability: "", value: "", cost: 0 })}
                    onRemove={(idx) => removeItem('artifacts', idx)}
                    addButtonLabel="Añadir Artefacto"
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <div className="inventory-card">
                            <FormSelect
                                label="Cargar Predefinido (Opcional)"
                                value=""
                                onChange={(val) => applyArtifactPreset(index, val)}
                                placeholder="Seleccionar de la lista..."
                                options={ARTIFACTS.map((obj: any) => ({
                                    id: obj.id,
                                    label: `${obj.name} (Fiabilidad: ${obj.reliability})`,
                                    cost: obj.pcCost,
                                    description: obj.description
                                }))}
                            />

                            <WizardGrid
                                columns="2fr 1fr 1fr 120px"
                                headers={['Nombre', 'Fiabilidad', 'Valor', 'Coste']}
                            >
                                <WizardField
                                    label="Nombre"
                                    value={item.name}
                                    onChange={(val: string) => updateItem('artifacts', index, 'name', val)}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    label="Fiabilidad"
                                    value={item.reliability || ''}
                                    onChange={(val: string) => updateItem('artifacts', index, 'reliability', val)}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    label="Valor"
                                    value={item.value || ''}
                                    onChange={(val: string) => updateItem('artifacts', index, 'value', val)}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    type="number"
                                    label="Coste"
                                    value={item.cost || 0}
                                    onChange={(val: string) => updateItem('artifacts', index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                            </WizardGrid>
                            <WizardField
                                type="textarea"
                                label="Descripción / Efectos"
                                value={item.notes || ''}
                                onChange={(val: string) => updateItem('artifacts', index, 'notes', val)}
                                noMargin
                                className="step6-textarea-field"
                            />
                        </div>
                    )}
                />
            </WizardSection>

            <WizardSection
                title="Objetos Mágicos"
                collapsible
                defaultCollapsed={(magicObjects?.items?.length ?? 0) === 0}
            >
                <DynamicList
                    items={magicObjects?.items || []}
                    onAdd={() => addItem('magicObjects', { name: "Nuevo objeto mágico", description: "", em: 0 })}
                    onRemove={(idx) => removeItem('magicObjects', idx)}
                    addButtonLabel="Añadir Objeto Mágico"
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <div className="inventory-card">
                            <FormSelect
                                label="Cargar Predefinido (Opcional)"
                                value=""
                                onChange={(val: string) => applyMagicPreset(index, val)}
                                placeholder="Seleccionar de la lista..."
                                options={MAGIC_OBJECTS.map((obj: any) => ({
                                    id: obj.id,
                                    label: `${obj.name} (EM: ${obj.em})`,
                                    description: obj.description
                                }))}
                                showCostInOption={false}
                            />

                            <WizardGrid
                                columns="3fr 120px"
                                headers={['Nombre', 'Coste EM']}
                            >
                                <WizardField
                                    label="Nombre"
                                    value={item.name}
                                    onChange={(val: string) => updateItem('magicObjects', index, 'name', val)}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    type="number"
                                    label="Coste EM"
                                    value={item.em || 0}
                                    onChange={(val: string) => updateItem('magicObjects', index, 'em', Math.max(0, parseInt(val) || 0))}
                                    hideLabelDesktop={true}
                                />
                            </WizardGrid>
                            <WizardField
                                type="textarea"
                                label="Descripción"
                                value={item.description || ''}
                                onChange={(val: string) => updateItem('magicObjects', index, 'description', val)}
                                className="step6-margin-top"
                            />
                        </div>
                    )}
                />
            </WizardSection>
        </>
    );
}
