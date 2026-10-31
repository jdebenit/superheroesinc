import React from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';
import { WizardGrid } from '../../../shared/layout/WizardGrid';
import { DynamicList } from '../../../shared/layout/DynamicList';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';

interface EquipmentSectionProps {
    weapons?: { items: any[] };
    equipment?: { items: any[] };
    varios?: { items: any[] };
    addItem: (category: string, defaultItem: any) => void;
    updateItem: (category: string, index: number, field: string, value: any) => void;
    removeItem: (category: string, index: number) => void;
}

export function EquipmentSection({
    weapons,
    equipment,
    varios,
    addItem,
    updateItem,
    removeItem
}: EquipmentSectionProps) {
    return (
        <>
            <WizardSection
                title="Armas"
                collapsible
                defaultCollapsed={(weapons?.items?.length ?? 0) === 0}
                rightContent={
                    (weapons?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={weapons?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={weapons?.items || []}
                    onAdd={() => addItem('weapons', { name: "Nueva arma", damage: "", dxa: "", car: "", notes: "", cost: 0 })}
                    onRemove={(idx) => removeItem('weapons', idx)}
                    addButtonLabel="Añadir Arma"
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <div className="weapon-card">
                            <WizardGrid
                                columns="2fr 1fr 1fr 1fr 120px"
                                headers={['Nombre', 'Daño', 'DxA', 'CAR', 'Coste PC']}
                            >
                                <WizardField
                                    label="Nombre"
                                    value={item.name}
                                    onChange={(val: string) => updateItem('weapons', index, 'name', val)}
                                    noMargin
                                    placeholder="Nombre del arma"
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    label="Daño"
                                    value={item.damage || ''}
                                    onChange={(val: string) => updateItem('weapons', index, 'damage', val)}
                                    noMargin
                                    placeholder="Ej: 1d8+2"
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    label="DxA"
                                    value={item.dxa || ''}
                                    onChange={(val: string) => updateItem('weapons', index, 'dxa', val)}
                                    noMargin
                                    placeholder="DxA"
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    label="CAR"
                                    value={item.car || ''}
                                    onChange={(val: string) => updateItem('weapons', index, 'car', val)}
                                    noMargin
                                    placeholder="CAR"
                                    hideLabelDesktop={true}
                                />
                                <WizardField
                                    type="number"
                                    label="Coste PC"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(val: string) => updateItem('weapons', index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                    noMargin
                                    hideLabelDesktop={true}
                                />
                            </WizardGrid>
                            <WizardField
                                label="Notas / Propiedades"
                                value={item.notes || ''}
                                onChange={(val: string) => updateItem('weapons', index, 'notes', val)}
                                noMargin
                                placeholder="Alcance, cadencia, efectos especiales..."
                            />
                        </div>
                    )}
                />
            </WizardSection>

            <WizardSection
                title="Equipo"
                collapsible
                defaultCollapsed={(equipment?.items?.length ?? 0) === 0}
                rightContent={
                    (equipment?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={equipment?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={equipment?.items || []}
                    onAdd={() => addItem('equipment', { name: "Nuevo equipo", notes: "", cost: 0 })}
                    onRemove={(idx) => removeItem('equipment', idx)}
                    addButtonLabel="Añadir Equipo"
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <WizardGrid
                            columns="2fr 3fr 120px"
                            headers={['Nombre', 'Notas / Descripción', 'Coste']}
                        >
                            <WizardField
                                label="Nombre"
                                value={item.name}
                                onChange={(val: string) => updateItem('equipment', index, 'name', val)}
                                noMargin
                                placeholder="Nombre del objeto"
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                label="Notas / Descripción"
                                value={item.notes || ''}
                                onChange={(val: string) => updateItem('equipment', index, 'notes', val)}
                                noMargin
                                placeholder="Descripción corta..."
                                hideLabelDesktop={true}
                            />
                            <WizardField
                                type="number"
                                label="Coste"
                                min="0"
                                value={item.cost || 0}
                                onChange={(val: string) => updateItem('equipment', index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                noMargin
                                hideLabelDesktop={true}
                            />
                        </WizardGrid>
                    )}
                />
            </WizardSection>

            <WizardSection
                title="Varios"
                collapsible
                defaultCollapsed={(varios?.items?.length ?? 0) === 0}
                rightContent={
                    (varios?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={varios?.items?.reduce((acc: number, item: any) => acc + (parseFloat(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={varios?.items || []}
                    onAdd={() => addItem('varios', { description: "Nuevo concepto", cost: 0 })}
                    onRemove={(idx) => removeItem('varios', idx)}
                    addButtonLabel="Añadir..."
                    color="#3b82f6"
                    renderItem={(item, index) => (
                        <WizardGrid
                            columns="3fr 120px"
                            headers={['Descripción', 'Coste']}
                        >
                            <WizardField
                                type="textarea"
                                label="Descripción"
                                value={item.description || ''}
                                onChange={(val: string) => updateItem('varios', index, 'description', val)}
                                noMargin
                                placeholder="Descripción..."
                                hideLabelDesktop={true}
                                className="step6-textarea-field"
                            />
                            <WizardField
                                type="number"
                                label="Coste"
                                min="-200"
                                step="0.1"
                                value={item.cost || 0}
                                onChange={(val: string) => updateItem('varios', index, 'cost', val)}
                                noMargin
                                hideLabelDesktop={true}
                            />
                        </WizardGrid>
                    )}
                />
            </WizardSection>
        </>
    );
}
