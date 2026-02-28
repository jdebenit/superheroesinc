import React, { useEffect } from 'react';
import { calculateDerivedStats } from '../../../utils/characterCalculations';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS } from '../../../data/specialSkills';
import { MAGIC_OBJECTS } from '../../../data/magicObjects';
import { ARTIFACTS } from '../../../data/artifacts';
import { WizardSection } from '../shared/WizardSection';
import { WizardField } from '../shared/WizardField';
import { DynamicList } from '../shared/DynamicList';
import { FormSelect } from '../shared/FormSelect';
import { InfoBox } from '../shared/InfoBox';
import { CostBadge } from '../shared/CostBadge';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../shared/stepStyles';
import '../shared/WizardStep.css';
import './Step6_Details.css';


interface Step6Props {
    data: {
        attributes: { values: { [key: string]: number } };
        origin?: any; // To pass origins if needed in future
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
        // We'll update combat/other stats in data directly if we want to save them
        combatstats?: string[];
        otherstats?: string[];
    };
    onChange: (updates: any) => void;
    totalPCs?: string | number;
}

const StatItem = ({ label, value, theme }: { label: string, value: string, theme: 'red' | 'purple' }) => {
    return (
        <div className={`stat-item stat-item-${theme}`}>
            <span className="stat-item-label">{label}</span>
            <span className="stat-item-value">{value || '-'}</span>
        </div>
    );
};

export default function Step6_Details({ data, onChange, totalPCs }: Step6Props) {
    const updateField = (field: string, value: string) => {
        onChange({ [field]: value });
    };

    // Calculate derived stats on mount or when attributes change
    useEffect(() => {
        const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);

        // Format as strings for the output JSON
        const combatStatsList = [
            `Acciones por asalto: ${stats.combat.acciones}`,
            `Iniciativa y Reflejos: ${stats.combat.iniciativa}`,
            `Puntos de Vida: ${stats.combat.pv}`,
            `Equilibrio Mental: ${stats.combat.equilibrio}`
        ];

        const otherStatsList = [
            `Inconsciencia: ${stats.other.inconsciencia}`,
            `Recuperación: ${stats.other.recuperacion}`,
            `Resistencia a gases y venenos: ${stats.other.resistenciaGases}`,
            `Modificador de fuerza: ${stats.other.modFuerza}`,
            `Peso Levantado: ${stats.other.pesoLevantado}`,
            `Daño absorbido físico: ${stats.other.daAbsorbidoFisico}`,
            `Daño absorbido mental: ${stats.other.daAbsorbidoMental}`,
            `Modificador de impacto: ${stats.other.modImpacto}`,
            `Modificador Psionico: ${stats.other.modPsionico}`,
            `Parada Fisica: ${stats.other.paradaFisica}`,
            `Parada mental: ${stats.other.paradaMental}`,
            `Salto (alto / largo): ${stats.other.salto}`
        ];

        // Trigger onChange only if different to avoid loop (simple comparison)
        const currentCombat = JSON.stringify(data.combatstats);
        const newCombat = JSON.stringify(combatStatsList);
        const currentOther = JSON.stringify(data.otherstats);
        const newOther = JSON.stringify(otherStatsList);

        if (currentCombat !== newCombat || currentOther !== newOther) {
            onChange({
                combatstats: combatStatsList,
                otherstats: otherStatsList
            });
        }
    }, [data.attributes.values, data.origin?.items, data.skills]);

    // GENERIC LIST HELPERS
    const addItem = (key: string, initialItem: any) => {
        const items = data[key as keyof typeof data]?.items || [];
        onChange({
            [key]: {
                items: [...items, initialItem]
            }
        });
    };

    const updateItem = (key: string, index: number, field: string, value: any) => {
        const items = [...(data[key as keyof typeof data]?.items || [])];
        items[index] = { ...items[index], [field]: value };
        onChange({ [key]: { items } });
    };

    const removeItem = (key: string, index: number) => {
        const items = [...(data[key as keyof typeof data]?.items || [])];
        items.splice(index, 1);
        onChange({ [key]: { items } });
    };

    // --- EQUIPO ---
    const addEquipment = () => addItem('equipment', { name: "Nuevo equipo", notes: "", cost: 0 });
    const updateEquipment = (index: number, field: string, value: any) => updateItem('equipment', index, field, value);
    const removeEquipment = (index: number) => removeItem('equipment', index);

    // --- ARMAS ---
    const addWeapon = () => addItem('weapons', { name: "Nueva arma", damage: "", dxa: "", car: "", notes: "", cost: 0 });
    const updateWeapon = (index: number, field: string, value: any) => updateItem('weapons', index, field, value);
    const removeWeapon = (index: number) => removeItem('weapons', index);

    // --- ARTEFACTOS ---
    const addArtifact = () => addItem('artifacts', { name: "Nuevo artefacto", reliability: "", value: "", cost: 0 });
    const updateArtifact = (index: number, field: string, value: any) => updateItem('artifacts', index, field, value);
    const removeArtifact = (index: number) => removeItem('artifacts', index);

    const applyArtifactPreset = (index: number, id: string) => {
        const preset = ARTIFACTS.find((a: any) => a.id === id);
        if (preset) {
            const items = [...(data.artifacts?.items || [])];
            items[index] = {
                ...items[index],
                name: preset.name,
                reliability: preset.reliability,
                cost: preset.pcCost,
                notes: preset.description
            };
            onChange({ artifacts: { items } });
        }
    };

    // --- OBJETOS MÁGICOS ---
    const addMagicObject = () => addItem('magicObjects', { name: "Nuevo objeto mágico", description: "", em: 0 });
    const updateMagicObject = (index: number, field: string, value: any) => updateItem('magicObjects', index, field, value);
    const removeMagicObject = (index: number) => removeItem('magicObjects', index);

    const applyMagicPreset = (index: number, id: string) => {
        const preset = MAGIC_OBJECTS.find((o: any) => o.id === id);
        if (preset) {
            const items = [...(data.magicObjects?.items || [])];
            items[index] = {
                ...items[index],
                name: preset.name,
                description: preset.description,
                em: preset.em
            };
            onChange({ magicObjects: { items } });
        }
    };

    // --- VEHÍCULOS ---
    const addVehicle = () => addItem('vehicles', { name: "Nuevo vehículo", armor: "", pe: "", speed: "", range: "", cost: 0 });
    const updateVehicle = (index: number, field: string, value: any) => updateItem('vehicles', index, field, value);
    const removeVehicle = (index: number) => removeItem('vehicles', index);


    const weaponSkills = [
        ...GENERAL_SKILLS.filter(s => ['combate', 'lanzar'].includes(s.id)),
        ...SPECIAL_SKILLS.filter(s => s.category === 'combat')
    ];

    return (
        <>
            <div className="wizard-step-container">


                {/* Header Description */}
                <WizardSection
                    title="Detalles Finales"
                    description="Define la identidad de tu personaje y equipalo."
                />


                {/* IDENTITY SECTION */}
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

                {/* DESCRIPTION SECTION — standalone for visibility */}
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
                        style={{ marginBottom: 0 }}
                    />
                </WizardSection>

                {/* COMBAT STATS SECTION */}
                <WizardSection title="Estadísticas de Combate">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoBox variant="info" icon="🔒">
                            Calculadas automáticamente a partir de tus características — no son editables.
                        </InfoBox>
                    </div>
                    <div className="step6-combat-stats-grid">
                        {data.combatstats?.map((stat, index) => {
                            const [label, val] = stat.split(': ');
                            return <StatItem key={index} label={label} value={val} theme="red" />;
                        })}
                    </div>
                </WizardSection>

                {/* OTHER STATS SECTION */}
                <WizardSection title="Otras Estadísticas">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoBox variant="info" icon="🔒">
                            Calculadas automáticamente a partir de tus características — no son editables.
                        </InfoBox>
                    </div>
                    <div className="step6-other-stats-container">
                        {data.otherstats?.map((stat, index) => {
                            const colonIdx = stat.indexOf(': ');
                            const label = colonIdx !== -1 ? stat.slice(0, colonIdx) : stat;
                            const val = colonIdx !== -1 ? stat.slice(colonIdx + 2) : '';
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

                {/* WEAPONS SECTION */}
                <WizardSection
                    title="Armas"
                    collapsible
                    defaultCollapsed={(data.weapons?.items?.length ?? 0) === 0}
                    rightContent={
                        (data.weapons?.items?.length ?? 0) > 0 ? (
                            <div className="section-header-badge">
                                <CostBadge
                                    cost={data.weapons?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                                    label="PC"
                                    variant="default"
                                    className="text-white"
                                />
                            </div>
                        ) : undefined
                    }
                >
                    <DynamicList
                        items={data.weapons?.items || []}
                        onAdd={addWeapon}
                        onRemove={removeWeapon}
                        addButtonLabel="Añadir Arma"
                        color="#3b82f6"
                        renderItem={(item, index) => (
                            <div className="weapon-card">
                                {/* Row 1: stats compactos */}
                                <div className="weapon-row-top">
                                    <WizardField
                                        label="Nombre"
                                        value={item.name}
                                        onChange={(val) => updateWeapon(index, 'name', val)}
                                        style={{ marginBottom: 0 }}
                                        placeholder="Nombre del arma"
                                    />
                                    <WizardField
                                        label="Daño"
                                        value={item.damage || ''}
                                        onChange={(val) => updateWeapon(index, 'damage', val)}
                                        style={{ marginBottom: 0 }}
                                        placeholder="Ej: 1d8+2"
                                    />
                                    <WizardField
                                        label="DxA"
                                        value={item.dxa || ''}
                                        onChange={(val) => updateWeapon(index, 'dxa', val)}
                                        style={{ marginBottom: 0 }}
                                        placeholder="DxA"
                                    />
                                    <WizardField
                                        label="CAR"
                                        value={item.car || ''}
                                        onChange={(val) => updateWeapon(index, 'car', val)}
                                        style={{ marginBottom: 0 }}
                                        placeholder="CAR"
                                    />
                                    <WizardField
                                        type="number"
                                        label="Coste PC"
                                        min="0"
                                        value={item.cost || 0}
                                        onChange={(val) => updateWeapon(index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                {/* Row 2: Notas full width */}
                                <WizardField
                                    label="Notas / Propiedades"
                                    value={item.notes || ''}
                                    onChange={(val) => updateWeapon(index, 'notes', val)}
                                    style={{ marginBottom: 0 }}
                                    placeholder="Alcance, cadencia, efectos especiales..."
                                />
                            </div>
                        )}
                    />
                </WizardSection>

                {/* EQUIPMENT SECTION (New) */}
                <WizardSection
                    title="Equipo"
                    collapsible
                    defaultCollapsed={(data.equipment?.items?.length ?? 0) === 0}
                    rightContent={
                        (data.equipment?.items?.length ?? 0) > 0 ? (
                            <div className="section-header-badge">
                                <CostBadge
                                    cost={data.equipment?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                                    label="PC"
                                    variant="default"
                                    className="text-white"
                                />
                            </div>
                        ) : undefined
                    }
                >
                    <DynamicList
                        items={data.equipment?.items || []}
                        onAdd={addEquipment}
                        onRemove={removeEquipment}
                        addButtonLabel="Añadir Equipo"
                        color="#3b82f6"
                        renderItem={(item, index) => (
                            <div className="inventory-card equipment-grid">
                                <WizardField
                                    label="Nombre"
                                    value={item.name}
                                    onChange={(val) => updateEquipment(index, 'name', val)}
                                    style={{ marginBottom: 0 }}
                                    placeholder="Nombre del objeto"
                                />
                                <WizardField
                                    label="Notas / Descripción"
                                    value={item.notes || ''}
                                    onChange={(val) => updateEquipment(index, 'notes', val)}
                                    style={{ marginBottom: 0 }}
                                    placeholder="Descripción corta..."
                                />
                                <WizardField
                                    type="number"
                                    label="Coste"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(val) => updateEquipment(index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        )}
                    />
                </WizardSection>

                {/* VEHICLES SECTION */}
                <WizardSection
                    title="Vehículos"
                    collapsible
                    defaultCollapsed={(data.vehicles?.items?.length ?? 0) === 0}
                    rightContent={
                        (data.vehicles?.items?.length ?? 0) > 0 ? (
                            <div className="section-header-badge">
                                <CostBadge
                                    cost={data.vehicles?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                                    label="PC"
                                    variant="default"
                                    className="text-white"
                                />
                            </div>
                        ) : undefined
                    }
                >
                    <DynamicList
                        items={data.vehicles?.items || []}
                        onAdd={addVehicle}
                        onRemove={removeVehicle}
                        addButtonLabel="Añadir Vehículo"
                        color="#3b82f6"
                        renderItem={(item, index) => (
                            <div className="inventory-card vehicle-grid">
                                <WizardField
                                    label="Modelo / Fabricante"
                                    value={item.name}
                                    onChange={(val) => updateVehicle(index, 'name', val)}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    label="Blindaje"
                                    value={item.armor || ''}
                                    onChange={(val) => updateVehicle(index, 'armor', val)}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    label="PE"
                                    value={item.pe || ''}
                                    onChange={(val) => updateVehicle(index, 'pe', val)}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    label="Velocidad"
                                    value={item.speed || ''}
                                    onChange={(val) => updateVehicle(index, 'speed', val)}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    label="Alcance/Autonomía"
                                    value={item.range || ''}
                                    onChange={(val) => updateVehicle(index, 'range', val)}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    type="number"
                                    label="Maniobrabilidad"
                                    min="0"
                                    value={item.maneuverability ?? 0}
                                    onChange={(val) => updateVehicle(index, 'maneuverability', Math.max(0, parseInt(val) || 0))}
                                    style={{ marginBottom: 0 }}
                                />
                                <WizardField
                                    type="number"
                                    label="Coste"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(val) => updateVehicle(index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        )}
                    />
                </WizardSection>

                {/* ARTIFACTS SECTION */}
                <WizardSection
                    title="Artefactos"
                    collapsible
                    defaultCollapsed={(data.artifacts?.items?.length ?? 0) === 0}
                    rightContent={
                        (data.artifacts?.items?.length ?? 0) > 0 ? (
                            <div className="section-header-badge">
                                <CostBadge
                                    cost={data.artifacts?.items?.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0) || 0}
                                    label="PC"
                                    variant="default"
                                    className="text-white"
                                />
                            </div>
                        ) : undefined
                    }
                >
                    <DynamicList
                        items={data.artifacts?.items || []}
                        onAdd={addArtifact}
                        onRemove={removeArtifact}
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

                                <div className="artifact-grid">
                                    <WizardField
                                        label="Nombre"
                                        value={item.name}
                                        onChange={(val) => updateArtifact(index, 'name', val)}
                                        style={{ marginBottom: 0 }}
                                    />
                                    <WizardField
                                        label="Fiabilidad"
                                        value={item.reliability || ''}
                                        onChange={(val) => updateArtifact(index, 'reliability', val)}
                                        style={{ marginBottom: 0 }}
                                    />
                                    <WizardField
                                        label="Valor"
                                        value={item.value || ''}
                                        onChange={(val) => updateArtifact(index, 'value', val)}
                                        style={{ marginBottom: 0 }}
                                    />
                                    <WizardField
                                        type="number"
                                        label="Coste"
                                        value={item.cost || 0}
                                        onChange={(val) => updateArtifact(index, 'cost', Math.max(0, parseInt(val) || 0).toString())}
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                <WizardField
                                    type="textarea"
                                    label="Descripción / Efectos"
                                    value={item.notes || ''}
                                    onChange={(val) => updateArtifact(index, 'notes', val)}
                                    style={{ marginBottom: 0, minHeight: '60px' }}
                                />
                            </div>
                        )}
                    />
                </WizardSection>

                {/* MAGIC OBJECTS SECTION */}
                <WizardSection
                    title="Objetos Mágicos"
                    collapsible
                    defaultCollapsed={(data.magicObjects?.items?.length ?? 0) === 0}
                >
                    <DynamicList
                        items={data.magicObjects?.items || []}
                        onAdd={addMagicObject}
                        onRemove={removeMagicObject}
                        addButtonLabel="Añadir Objeto Mágico"
                        color="#3b82f6"
                        renderItem={(item, index) => (
                            <div className="inventory-card">
                                <FormSelect
                                    label="Cargar Predefinido (Opcional)"
                                    value=""
                                    onChange={(val) => applyMagicPreset(index, val)}
                                    placeholder="Seleccionar de la lista..."
                                    options={MAGIC_OBJECTS.map((obj: any) => ({
                                        id: obj.id,
                                        label: `${obj.name} (EM: ${obj.em})`,
                                        description: obj.description
                                    }))}
                                    showCostInOption={false}
                                />

                                <div className="magic-grid">
                                    <WizardField
                                        label="Nombre"
                                        value={item.name}
                                        onChange={(val) => updateMagicObject(index, 'name', val)}
                                        style={{ marginBottom: 0 }}
                                    />
                                    <WizardField
                                        type="number"
                                        label="Coste EM"
                                        value={item.em || 0}
                                        onChange={(val) => updateMagicObject(index, 'em', Math.max(0, parseInt(val) || 0))}
                                    />
                                </div>
                                <WizardField
                                    type="textarea"
                                    label="Descripción"
                                    value={item.description || ''}
                                    onChange={(val) => updateMagicObject(index, 'description', val)}
                                />
                            </div>
                        )}
                    />
                </WizardSection>
            </div>
        </>
    );
}
