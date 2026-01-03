import React, { useEffect } from 'react';
import { calculateDerivedStats } from '../../../utils/characterCalculations';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS } from '../../../data/specialSkills';

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
        vehicles: { items: any[] };
        skills?: any;
        // We'll update combat/other stats in data directly if we want to save them
        combatstats?: string[];
        otherstats?: string[];
    };
    onChange: (updates: any) => void;
    totalPCs?: string | number;
}

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

    // --- EQUIPO ---
    const addEquipment = () => {
        onChange({
            equipment: {
                items: [...(data.equipment?.items || []), { name: "Nuevo equipo", notes: "", cost: 0 }]
            }
        });
    };

    const updateEquipment = (index: number, field: string, value: string) => {
        const newItems = [...(data.equipment?.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ equipment: { items: newItems } });
    };

    const removeEquipment = (index: number) => {
        const newItems = [...(data.equipment?.items || [])];
        newItems.splice(index, 1);
        onChange({ equipment: { items: newItems } });
    };

    // --- ARMAS ---
    const addWeapon = () => {
        onChange({
            weapons: {
                items: [...(data.weapons?.items || []), { name: "Nueva arma", damage: "", dxa: "", car: "", notes: "", cost: 0 }]
            }
        });
    };

    const updateWeapon = (index: number, field: string, value: string) => {
        const newItems = [...(data.weapons?.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ weapons: { items: newItems } });
    };

    const removeWeapon = (index: number) => {
        const newItems = [...(data.weapons?.items || [])];
        newItems.splice(index, 1);
        onChange({ weapons: { items: newItems } });
    };

    // --- ARTEFACTOS ---
    const addArtifact = () => {
        onChange({
            artifacts: {
                items: [...(data.artifacts?.items || []), { name: "Nuevo artefacto", reliability: "", value: "", cost: 0 }]
            }
        });
    };

    const updateArtifact = (index: number, field: string, value: string) => {
        const newItems = [...(data.artifacts?.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ artifacts: { items: newItems } });
    };

    const removeArtifact = (index: number) => {
        const newItems = [...(data.artifacts?.items || [])];
        newItems.splice(index, 1);
        onChange({ artifacts: { items: newItems } });
    };

    // --- VEHÍCULOS ---
    const addVehicle = () => {
        onChange({
            vehicles: {
                items: [...(data.vehicles?.items || []), { name: "Nuevo vehículo", armor: "", pe: "", speed: "", range: "" }]
            }
        });
    };

    const updateVehicle = (index: number, field: string, value: string) => {
        const newItems = [...(data.vehicles?.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ vehicles: { items: newItems } });
    };

    const removeVehicle = (index: number) => {
        const newItems = [...(data.vehicles?.items || [])];
        newItems.splice(index, 1);
        onChange({ vehicles: { items: newItems } });
    };

    const sectionStyle = {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '1rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: '0.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        marginBottom: '1rem',
        transition: 'border-color 0.2s',
        outline: 'none'
    };

    const buttonStyle = {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.2s'
    };

    const weaponSkills = [
        ...GENERAL_SKILLS.filter(s => ['combate', 'lanzar'].includes(s.id)),
        ...SPECIAL_SKILLS.filter(s => s.category === 'combat')
    ];

    return (
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>

            {/* Header Description */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
                color: '#1e40af'
            }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    📝 Detalles Finales
                </h3>
                <p style={{ margin: 0 }}>
                    Define la identidad de tu personaje y equipalo.
                </p>
            </div>

            {/* IDENTITY SECTION */}
            <div style={sectionStyle}>
                <h3 style={titleStyle}>👤 Identidad</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Nombre del Personaje</label>
                        <input
                            type="text"
                            value={data.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            style={inputStyle}
                            placeholder="Ej: Alex Mercer"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Alias / Nombre en Clave</label>
                        <input
                            type="text"
                            value={data.alias || ''}
                            onChange={(e) => updateField('alias', e.target.value)}
                            style={inputStyle}
                            placeholder="Ej: Prototype"
                        />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Profesión</label>
                        <input
                            type="text"
                            value={data.profession || ''}
                            onChange={(e) => updateField('profession', e.target.value)}
                            style={inputStyle}
                            placeholder="Ej: Periodista, Mecánico..."
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Identidad Sexual</label>
                        <input
                            type="text"
                            value={data.sexualIdentity || ''}
                            onChange={(e) => updateField('sexualIdentity', e.target.value)}
                            style={inputStyle}
                            placeholder="Ej: Heterosexual, Bisexual..."
                        />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Descripción y Notas</label>
                    <textarea
                        value={data.notes || ''}
                        onChange={(e) => updateField('notes', e.target.value)}
                        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                        placeholder="Describe la apariencia, personalidad, trasfondo breve..."
                    />
                </div>
            </div>

            {/* COMBAT STATS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#dc2626', borderBottomColor: '#fecaca' }}>
                    ⚔️ Estadísticas de Combate
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {data.combatstats?.map((stat, index) => {
                        const [label, val] = stat.split(': ');
                        return (
                            <div key={index} style={{
                                backgroundColor: '#fef2f2',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #fee2e2'
                            }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {label}
                                </span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>
                                    {val || '-'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* OTHER STATS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#7c3aed', borderBottomColor: '#ddd6fe' }}>
                    🧠 Otras Estadísticas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {data.otherstats?.map((stat, index) => {
                        const [label, val] = stat.split(': ');
                        return (
                            <div key={index} style={{
                                backgroundColor: '#f5f3ff',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #ede9fe'
                            }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#5b21b6', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {label}
                                </span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#7c3aed' }}>
                                    {val || '-'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* WEAPONS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#b91c1c', borderBottomColor: '#fecaca' }}>
                    ⚔️ Armas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.weapons?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1.5fr 0.8fr 0.8fr 0.8fr 1.5fr 80px auto',
                            gap: '0.5rem',
                            alignItems: 'start',
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateWeapon(index, 'name', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Nombre del arma"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Habilidad</label>
                                <select
                                    value={item.skillId || ''}
                                    onChange={(e) => updateWeapon(index, 'skillId', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0, paddingRight: '2rem' }}
                                >
                                    <option value="">Seleccionar...</option>
                                    {weaponSkills.map(skill => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Daño</label>
                                <input
                                    type="text"
                                    value={item.damage || ''}
                                    onChange={(e) => updateWeapon(index, 'damage', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Ej: 1d8+2"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>DxA</label>
                                <input
                                    type="text"
                                    value={item.dxa || ''}
                                    onChange={(e) => updateWeapon(index, 'dxa', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="DxA"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>CAR</label>
                                <input
                                    type="text"
                                    value={item.car || ''}
                                    onChange={(e) => updateWeapon(index, 'car', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="CAR"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Notas / Propiedades</label>
                                <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => updateWeapon(index, 'notes', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Alcance, Munición..."
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Coste (PCs)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(e) => updateWeapon(index, 'cost', Math.max(0, parseInt(e.target.value) || 0).toString())}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="0"
                                />
                            </div>
                            <button
                                onClick={() => removeWeapon(index)}
                                style={{
                                    ...buttonStyle,
                                    marginTop: '1.5rem',
                                    backgroundColor: '#dc2626',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addWeapon}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #fca5a5',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Añadir Arma
                    </button>
                </div>
            </div>

            {/* ARTIFACTS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#7c3aed', borderBottomColor: '#ddd6fe' }}>
                    ✨ Artefactos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.artifacts?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 100px auto',
                            gap: '1rem',
                            alignItems: 'start',
                            padding: '0.75rem',
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #ede9fe',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateArtifact(index, 'name', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Nombre del artefacto"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Fiabilidad</label>
                                <input
                                    type="text"
                                    value={item.reliability || ''}
                                    onChange={(e) => updateArtifact(index, 'reliability', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Ej: 95%"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Valor</label>
                                <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => updateArtifact(index, 'value', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Valor"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Coste (PCs)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(e) => updateArtifact(index, 'cost', Math.max(0, parseInt(e.target.value) || 0).toString())}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="0"
                                />
                            </div>
                            <button
                                onClick={() => removeArtifact(index)}
                                style={{
                                    ...buttonStyle,
                                    marginTop: '1.5rem',
                                    backgroundColor: '#7c3aed',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addArtifact}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #c4b5fd',
                            backgroundColor: '#f5f3ff',
                            color: '#7c3aed',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Añadir Artefacto
                    </button>
                </div>
            </div>

            {/* VEHICLES SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#0891b2', borderBottomColor: '#a5f3fc' }}>
                    🚗 Vehículos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.vehicles?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                            gap: '0.75rem',
                            alignItems: 'start',
                            padding: '0.75rem',
                            backgroundColor: '#ecfeff',
                            border: '1px solid #cffafe',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Nombre del vehículo"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Blindaje</label>
                                <input
                                    type="text"
                                    value={item.armor || ''}
                                    onChange={(e) => updateVehicle(index, 'armor', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Blindaje"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>PE</label>
                                <input
                                    type="text"
                                    value={item.pe || ''}
                                    onChange={(e) => updateVehicle(index, 'pe', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="PE"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Velocidad</label>
                                <input
                                    type="text"
                                    value={item.speed || ''}
                                    onChange={(e) => updateVehicle(index, 'speed', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Velocidad"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Autonomía</label>
                                <input
                                    type="text"
                                    value={item.range || ''}
                                    onChange={(e) => updateVehicle(index, 'range', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Autonomía"
                                />
                            </div>
                            <button
                                onClick={() => removeVehicle(index)}
                                style={{
                                    ...buttonStyle,
                                    marginTop: '1.5rem',
                                    backgroundColor: '#0891b2',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addVehicle}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #67e8f9',
                            backgroundColor: '#ecfeff',
                            color: '#0891b2',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Añadir Vehículo
                    </button>
                </div>
            </div>

            {/* EQUIPMENT SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#b45309', borderBottomColor: '#fcd34d' }}>
                    🎒 Equipo
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.equipment?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr 100px auto',
                            gap: '1rem',
                            alignItems: 'start',
                            padding: '0.75rem',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Nombre del objeto"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Descripción / Efectos</label>
                                <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => updateEquipment(index, 'notes', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Descripción o efectos"
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Coste (PCs)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.cost || 0}
                                    onChange={(e) => updateEquipment(index, 'cost', Math.max(0, parseInt(e.target.value) || 0).toString())}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="0"
                                />
                            </div>
                            <button
                                onClick={() => removeEquipment(index)}
                                style={{
                                    ...buttonStyle,
                                    marginTop: '1.5rem',
                                    backgroundColor: '#d97706',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addEquipment}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #fcd34d',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Añadir Equipo
                    </button>
                </div>
            </div>

            {/* EXPORT PDF BUTTON */}
            <div style={{
                marginTop: '3rem',
                textAlign: 'center',
                borderTop: '2px solid #e5e7eb',
                paddingTop: '2rem'
            }}>
                <button
                    onClick={async () => {
                        try {
                            // Using dynamic import to avoid SSR issues if any, though pdf-lib works in browser
                            const { generateCharacterSheetPDF, downloadPDF } = await import('../../../utils/pdfExport');
                            const pdfBytes = await generateCharacterSheetPDF('/ficha_template.pdf', data, totalPCs || 0);
                            downloadPDF(pdfBytes, `Ficha_SHI_${data.name.replace(/\s+/g, '_') || 'Personaje'}.pdf`);
                        } catch (error) {
                            console.error('Error generando PDF:', error);
                            alert('Error al generar el PDF. Asegúrate de que el template "ficha_template.pdf" está en la carpeta public.');
                        }
                    }}
                    style={{
                        padding: '1rem 3rem',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#047857';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#059669'
                    }}
                >
                    📥 Exportar Ficha PDF (Alpha)
                </button>
            </div>

        </div>
    );
}
