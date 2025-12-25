import React from 'react';

interface Step6Props {
    data: {
        name: string;
        alias: string;
        notes: string;
        equipment: { items: any[] };
        weapons: { items: any[] };
    };
    onChange: (updates: any) => void;
}

export default function Step6_Details({ data, onChange }: Step6Props) {
    const updateField = (field: string, value: string) => {
        onChange({ [field]: value });
    };

    // --- EQUIPO ---
    const addEquipment = () => {
        onChange({
            equipment: {
                items: [...(data.equipment?.items || []), { name: "Nuevo equipo", notes: "" }]
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
                items: [...(data.weapons?.items || []), { name: "Nueva arma", damage: "", notes: "" }]
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
                    Define la identidad de tu personaje y equipalo para la aventura.
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

            {/* WEAPONS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#b91c1c', borderBottomColor: '#fecaca' }}>
                    ⚔️ Armas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.weapons?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 2fr auto',
                            gap: '1rem',
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
                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Notas / Propiedades</label>
                                <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => updateWeapon(index, 'notes', e.target.value)}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    placeholder="Alcance, Munición..."
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

            {/* EQUIPMENT SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#b45309', borderBottomColor: '#fcd34d' }}>
                    🎒 Equipo
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.equipment?.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr auto',
                            gap: '1rem',
                            alignItems: 'center',
                            padding: '0.75rem',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                            borderRadius: '8px'
                        }}>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                                style={{ ...inputStyle, marginBottom: 0 }}
                                placeholder="Nombre del objeto"
                            />
                            <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => updateEquipment(index, 'notes', e.target.value)}
                                style={{ ...inputStyle, marginBottom: 0 }}
                                placeholder="Descripción o efectos"
                            />
                            <button
                                onClick={() => removeEquipment(index)}
                                style={{
                                    ...buttonStyle,
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

        </div>
    );
}
