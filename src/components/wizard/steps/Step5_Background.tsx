import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS } from '../../../data/backgroundTables';

interface Step5Props {
    data: {
        background: { items: string[] };
        prejudiceResistance?: number;
        economicStatus?: string;
        legalStatus?: string;
        socialStatus?: string;
    };
    onChange: (updates: any) => void;
}

export default function Step5_Background({ data, onChange }: Step5Props) {
    const resistanceValue = data.prejudiceResistance || 50;
    const resistanceCost = (resistanceValue - 50) * 0.1;

    // Get current selections (defaulting if undefined)
    const currentEconomic = ECONOMIC_STATUS.find(e => e.id === data.economicStatus) || ECONOMIC_STATUS[3];
    const currentLegal = LEGAL_STATUS.find(l => l.id === data.legalStatus) || LEGAL_STATUS[0];
    const currentSocial = SOCIAL_STATUS.find(s => s.id === data.socialStatus) || SOCIAL_STATUS[2];

    const addBackgroundItem = () => {
        onChange({
            background: {
                items: [...data.background.items, "Nuevo elemento de trasfondo"]
            }
        });
    };

    const updateBackgroundItem = (index: number, value: string) => {
        const newItems = [...data.background.items];
        newItems[index] = value;
        onChange({ background: { items: newItems } });
    };

    const removeBackgroundItem = (index: number) => {
        const newItems = [...data.background.items];
        newItems.splice(index, 1);
        onChange({ background: { items: newItems } });
    };

    const handleResistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= 100) {
            onChange({ prejudiceResistance: val });
        }
    };

    // --- STYLES ---
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

    const cardStyle = {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
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

    const renderStatusSelect = (
        title: string,
        options: any[],
        currentValue: string | undefined,
        field: string,
        currentObj: any
    ) => (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{title}</h4>
                <div style={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: currentObj.cost > 0 ? '#dc2626' : currentObj.cost < 0 ? '#16a34a' : '#6b7280'
                }}>
                    {currentObj.cost > 0 ? '+' : ''}{currentObj.cost} PC
                </div>
            </div>
            <select
                value={currentValue || options[0].id}
                onChange={(e) => onChange({ [field]: e.target.value })}
                style={{ ...inputStyle, marginBottom: '0.5rem', padding: '0.5rem' }}
            >
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.cost > 0 ? '+' : ''}{opt.cost} PC)
                    </option>
                ))}
            </select>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                {currentObj.description}
            </p>
        </div>
    );

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
                    📖 Trasfondo y Personalidad
                </h3>
                <p style={{ margin: 0 }}>
                    Define la historia, contexto, estatus social y resistencia psicológica de tu personaje.
                </p>
            </div>

            {/* PREJUDICE RESISTANCE */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ ...titleStyle, borderBottom: 'none', marginBottom: 0 }}>🛡️ Resistencia a Prejuicios</h3>
                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: resistanceCost > 0 ? '#dc2626' : resistanceCost < 0 ? '#16a34a' : '#6b7280'
                    }}>
                        Coste: {resistanceCost > 0 ? '+' : ''}{resistanceCost.toFixed(1)} PC
                    </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    La capacidad del personaje para resistir la influencia de prejuicios y estereotipos.
                    <br />
                    <strong>50</strong> es el valor promedio. Subir cuesta PC, bajar devuelve PC.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 'bold', color: '#64748b' }}>1</span>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={resistanceValue}
                        onChange={handleResistanceChange}
                        style={{ flex: 1, cursor: 'pointer', height: '8px', borderRadius: '4px', accentColor: '#4f46e5' }}
                    />
                    <span style={{ fontWeight: 'bold', color: '#64748b' }}>100</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={resistanceValue}
                            onChange={handleResistanceChange}
                            style={{
                                width: '70px',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                color: '#1e293b'
                            }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>%</span>
                    </div>
                </div>
            </div>

            {/* ADVANCED STATUS OPTIONS */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#0f766e', borderBottomColor: '#99f6e4' }}>🏛️ Estatus Social y Legal</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {renderStatusSelect("Posición Económica", ECONOMIC_STATUS, data.economicStatus, 'economicStatus', currentEconomic)}
                    {renderStatusSelect("Situación Legal", LEGAL_STATUS, data.legalStatus, 'legalStatus', currentLegal)}
                    {renderStatusSelect("Posición Social", SOCIAL_STATUS, data.socialStatus, 'socialStatus', currentSocial)}
                </div>
            </div>

            {/* BACKGROUND ITEMS */}
            <div style={sectionStyle}>
                <h3 style={{ ...titleStyle, color: '#4338ca', borderBottomColor: '#c7d2fe' }}>📝 Notas de Trasfondo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.background.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateBackgroundItem(index, e.target.value)}
                                style={inputStyle}
                                placeholder="Ej: Trabajo medio/bajo: mecánico"
                            />
                            <button
                                onClick={() => removeBackgroundItem(index)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: '#dc2626',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addBackgroundItem}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px dashed #a5b4fc',
                            backgroundColor: '#eef2ff',
                            color: '#4338ca',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        + Añadir Elemento de Trasfondo
                    </button>
                </div>
            </div>

            <div style={{
                fontSize: '0.9rem',
                color: '#475569',
                backgroundColor: '#f1f5f9',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Ejemplos de trasfondo:</p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyleType: 'disc' }}>
                    <li>Trabajo alto: Ejecutivo de empresa</li>
                    <li>Trabajo medio: Profesor universitario</li>
                    <li>Trabajo bajo: Taxista</li>
                    <li>Solitario / Sociable</li>
                    <li>Familia numerosa / Huérfano</li>
                </ul>
            </div>
        </div>
    );
}
