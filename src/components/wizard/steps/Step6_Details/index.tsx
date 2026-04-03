import React from 'react';
import { MAGIC_OBJECTS } from '../../../../data/magicObjects';
import { ARTIFACTS } from '../../../../data/artifacts';
import { WizardSection } from '../../shared/layout/WizardSection';
import { WizardField } from '../../shared/forms/WizardField';
import { WizardGrid } from '../../shared/layout/WizardGrid';
import { DynamicList } from '../../shared/layout/DynamicList';
import { FormSelect } from '../../shared/forms/FormSelect';
import { InfoBox } from '../../shared/ui/InfoBox';
import { CostBadge } from '../../shared/ui/CostBadge';
import { SectionHeaderBadge } from '../../shared/ui/SectionHeaderBadge';
import { StatItem } from '../../shared/ui/StatItem';
import { useStep6Logic } from './useStep6Logic';
import '../../shared/layout/WizardStep.css';
import './Step6_Details.css';

interface Step6Props {
    data: {
        attributes: { values: { [key: string]: number } };
        origin?: any;
        name: string;
        alias: string;
        profession?: string;
        sexualIdentity?: string;
        notes: string;
        equipment: { items: any[] };
        weapons: { items: any[] };
        artifacts: { items: any[] };
        magicObjects: { items: any[] };
        vehicles: { items: any[] };
        skills?: any;
        combatstats?: Record<string, string>;
        otherstats?: Record<string, string>;
    };
    onChange: (updates: any) => void;
    totalPCs?: string | number;
    onShowHelp?: () => void;
}

export default function Step6_Details({ data, onChange, totalPCs, onShowHelp }: Step6Props) {
    const {
        updateField,
        addItem,
        updateItem,
        removeItem,
        applyArtifactPreset,
        applyMagicPreset
    } = useStep6Logic(data, onChange);

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Detalles Finales"
                description="Define la identidad de tu personaje y equipalo."
                onHelp={onShowHelp}
            />

            <WizardSection title="Identidad">
                <div className="step6-identity-grid step6-identity-row">
                    <WizardField
                        label="Nombre del Personaje"
                        value={data.name || ''}
                        onChange={(val) => updateField('name', val)}
                        placeholder="Ej: Alex Mercer"
                    />
                    <WizardField
                        label="Alias / Nombre en Clave"
                        value={data.alias || ''}
                        onChange={(val) => updateField('alias', val)}
                        placeholder="Ej: Prototype"
                    />
                </div>
                <div className="step6-identity-grid">
                    <WizardField
                        label="Profesión"
                        value={data.profession || ''}
                        onChange={(val) => updateField('profession', val)}
                        placeholder="Ej: Periodista, Mecánico..."
                    />
                    <WizardField
                        label="Identidad Sexual"
                        value={data.sexualIdentity || ''}
                        onChange={(val) => updateField('sexualIdentity', val)}
                        placeholder="Ej: Heterosexual, Bisexual..."
                    />
                </div>
            </WizardSection>

            <WizardSection title="Descripción y Notas">
                <p className="step6-notes-description">
                    Describe la apariencia física, carácter, historia personal y cualquier nota relevante del personaje.
                </p>
                <WizardField
                    type="textarea"
                    label=""
                    value={data.notes || ''}
                    onChange={(val) => updateField('notes', val)}
                    placeholder="Describe la apariencia, personalidad, trasfondo breve..."
                    noMargin
                />
            </WizardSection>

            <WizardSection title="Estadísticas de Combate">
                <div className="step6-margin-bottom">
                    <InfoBox variant="info" icon="🔒">
                        Calculadas automáticamente a partir de tus características — no son editables.
                    </InfoBox>
                </div>
                <div className="step6-combat-stats-grid">
                    {data.combatstats && Object.entries(data.combatstats).map(([label, val], index) => (
                        <StatItem key={index} label={label} value={val} theme="red" />
                    ))}
                </div>
            </WizardSection>

            <WizardSection title="Otras Estadísticas">
                <div className="step6-margin-bottom">
                    <InfoBox variant="info" icon="🔒">
                        Calculadas automáticamente a partir de tus características — no son editables.
                    </InfoBox>
                </div>
                <div className="step6-other-stats-container">
                    {data.otherstats && Object.entries(data.otherstats).map(([label, val], index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={index} className={`step6-other-stat-row ${isEven ? 'even' : 'odd'}`}>
                                <span className="step6-other-stat-label">{label}</span>
                                <span className="step6-other-stat-value">{val || '-'}</span>
                            </div>
                        );
                    })}
                </div>
            </WizardSection>


            <WizardSection
                title="Armas"
                collapsible
                defaultCollapsed={(data.weapons?.items?.length ?? 0) === 0}
                rightContent={
                    (data.weapons?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={data.weapons?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={data.weapons?.items || []}
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
                defaultCollapsed={(data.equipment?.items?.length ?? 0) === 0}
                rightContent={
                    (data.equipment?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={data.equipment?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={data.equipment?.items || []}
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
                title="Vehículos"
                collapsible
                defaultCollapsed={(data.vehicles?.items?.length ?? 0) === 0}
                rightContent={
                    (data.vehicles?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={data.vehicles?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={data.vehicles?.items || []}
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
                defaultCollapsed={(data.artifacts?.items?.length ?? 0) === 0}
                rightContent={
                    (data.artifacts?.items?.length ?? 0) > 0 ? (
                        <SectionHeaderBadge
                            cost={data.artifacts?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                            label="PC"
                            variant="default"
                            className="text-white"
                        />
                    ) : undefined
                }
            >
                <DynamicList
                    items={data.artifacts?.items || []}
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
                defaultCollapsed={(data.magicObjects?.items?.length ?? 0) === 0}
            >
                <DynamicList
                    items={data.magicObjects?.items || []}
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
        </div>
    );
}
