import React, { useState } from 'react';
import { ORIGIN_CATEGORIES } from '../../../data/originDefinitions';

interface Step1Props {
    data: any;
    onChange: (updates: any) => void;
}

const ORIGINS = [
    { id: 'divinos', name: 'Divino', logo: '/logos/divinos.png', categoryKey: 'Divino' },
    { id: 'cosmicos', name: 'Cósmico', logo: '/logos/cosmicos.png', categoryKey: 'Cósmico' },
    { id: 'guardianes', name: 'Guardián', logo: '/logos/guardianes.png', categoryKey: 'Guardian' },
    { id: 'alterados', name: 'Alterado', logo: '/logos/alterados.png', categoryKey: 'Alterado' },
    { id: 'sobrenaturales', name: 'Sobrenatural', logo: '/logos/sobrenaturales.png', categoryKey: 'Sobrenatural' },
    { id: 'arcanos', name: 'Arcano', logo: '/logos/arcanos.png', categoryKey: 'Arcano' },
    { id: 'parahumanos', name: 'Parahumano', logo: '/logos/parahumanos.png', categoryKey: 'Parahumano' },
    { id: 'tecnologicos', name: 'Tecnológico', logo: '/logos/tecnologicos.png', categoryKey: 'Tecnológico' },
    { id: 'mutantes', name: 'Mutante', logo: '/logos/mutantes.png', categoryKey: 'Mutante' },
    { id: 'vigilantes', name: 'Vigilante', logo: '/logos/vigilantes.png', categoryKey: 'Vigilante' }
];

export default function Step1_OriginSelection({ data, onChange }: Step1Props) {
    const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
    const [selectedSubtypes, setSelectedSubtypes] = useState<{ [originId: string]: string[] }>({});

    const handleToggleOrigin = (originId: string) => {
        const newSelection = selectedOrigins.includes(originId)
            ? selectedOrigins.filter(id => id !== originId)
            : [...selectedOrigins, originId];

        setSelectedOrigins(newSelection);

        // Si se deselecciona, limpiar subtipos
        if (!newSelection.includes(originId)) {
            const newSubtypes = { ...selectedSubtypes };
            delete newSubtypes[originId];
            setSelectedSubtypes(newSubtypes);
        }

        updateCharacterOrigins(newSelection, selectedSubtypes);
    };

    const handleToggleSubtype = (originId: string, subtype: string) => {
        const isSingleSelection = originId === 'divinos' || originId === 'cosmicos' || originId === 'parahumanos';

        if (isSingleSelection) {
            // Para orígenes de selección única, reemplazar la selección
            const newSubtypes = {
                ...selectedSubtypes,
                [originId]: [subtype]
            };
            setSelectedSubtypes(newSubtypes);
            updateCharacterOrigins(selectedOrigins, newSubtypes);
        } else {
            // Para orígenes de selección múltiple, toggle
            const current = selectedSubtypes[originId] || [];
            const newSubtypes = {
                ...selectedSubtypes,
                [originId]: current.includes(subtype)
                    ? current.filter(s => s !== subtype)
                    : [...current, subtype]
            };
            setSelectedSubtypes(newSubtypes);
            updateCharacterOrigins(selectedOrigins, newSubtypes);
        }
    };

    const updateCharacterOrigins = (origins: string[], subtypes: { [key: string]: string[] }) => {
        const items = origins.map(id => {
            const origin = ORIGINS.find(o => o.id === id);
            if (!origin) return null;

            const category = ORIGIN_CATEGORIES[origin.categoryKey];
            if (!category) return { [origin.name]: [] };

            // Si tiene subtipos seleccionados
            if (category.subtypes && subtypes[id] && subtypes[id].length > 0) {
                // Guardar como: { "Vigilante": ["Fanático", "Vengador"] }
                // No crear items separados por subtipo
                return { [origin.name]: subtypes[id] };
            }

            // Si no tiene subtipos, usa los efectos por defecto
            if (category.defaultEffects) {
                return { [origin.name]: category.defaultEffects };
            }

            // Si tiene subtipos pero no se ha seleccionado ninguno
            return null;
        }).filter(Boolean);

        onChange({
            ...data,
            origin: { items }
        });
    };

    const getOriginCategory = (originId: string) => {
        const origin = ORIGINS.find(o => o.id === originId);
        if (!origin) return null;
        return ORIGIN_CATEGORIES[origin.categoryKey];
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Selecciona los Orígenes del Personaje
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '3rem' }}>
                Selecciona los orígenes y sus tipos. Divino, Cósmico y Parahumano solo pueden elegir un tipo. Los demás pueden elegir múltiples tipos.
            </p>

            {/* Origins Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {ORIGINS.map((origin) => {
                    const isSelected = selectedOrigins.includes(origin.id);
                    const category = getOriginCategory(origin.id);

                    // Filter disabled origins
                    if (category?.disabled) return null;

                    const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;

                    return (
                        <div key={origin.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => handleToggleOrigin(origin.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    border: '4px solid',
                                    borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                                    borderRadius: '12px',
                                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Checkbox indicator */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    border: '2px solid',
                                    borderColor: isSelected ? '#2563eb' : '#d1d5db',
                                    backgroundColor: isSelected ? '#2563eb' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {isSelected && '✓'}
                                </div>

                                {/* Logo */}
                                <img
                                    src={origin.logo}
                                    alt={origin.name}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'contain',
                                        filter: isSelected ? 'none' : 'grayscale(50%)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                />

                                {/* Name */}
                                <span style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 'bold',
                                    color: isSelected ? '#1e40af' : '#4b5563',
                                    textAlign: 'center'
                                }}>
                                    {origin.name}
                                </span>
                            </button>

                            {/* Radio buttons o Checkboxes según el origen */}
                            {isSelected && hasSubtypes && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '2px solid #bfdbfe'
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {origin.id === 'vigilantes' ? 'Especializaciones:' : 'Tipos:'}
                                        {(origin.id === 'divinos' || origin.id === 'cosmicos' || origin.id === 'parahumanos') &&
                                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginLeft: '0.5rem' }}>(solo uno)</span>
                                        }
                                    </span>
                                    {Object.keys(category!.subtypes!)
                                        .filter(subtype => !category?.disabledSubtypes?.includes(subtype))
                                        .map(subtype => {
                                            const isSingleSelection = origin.id === 'divinos' || origin.id === 'cosmicos' || origin.id === 'parahumanos';
                                            const isChecked = selectedSubtypes[origin.id]?.includes(subtype) || false;
                                            const isSelected = isSingleSelection ? (selectedSubtypes[origin.id]?.[0] === subtype) : isChecked;

                                            return (
                                                <label
                                                    key={subtype}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        cursor: 'pointer',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: isSelected ? '#dbeafe' : 'transparent',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                >
                                                    <input
                                                        type={isSingleSelection ? 'radio' : 'checkbox'}
                                                        name={isSingleSelection ? `origin-${origin.id}` : undefined}
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSubtype(origin.id, subtype)}
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                    <span style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: isSelected ? 'bold' : 'normal',
                                                        color: isSelected ? '#1e40af' : '#4b5563'
                                                    }}>
                                                        {subtype}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Summary */}
            {selectedOrigins.length > 0 && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#f0f9ff',
                    border: '2px solid #2563eb',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e40af' }}>
                        Orígenes Seleccionados
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {selectedOrigins.map(id => {
                            const origin = ORIGINS.find(o => o.id === id);
                            const subtypes = selectedSubtypes[id] || [];
                            const category = getOriginCategory(id);
                            const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;

                            return (
                                <div
                                    key={id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        border: '2px solid #bfdbfe',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {origin?.name}
                                    </span>
                                    {subtypes.map(subtype => (
                                        <span
                                            key={subtype}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#60a5fa',
                                                color: 'white',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {subtype}
                                        </span>
                                    ))}
                                    {hasSubtypes && subtypes.length === 0 && (
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: '#dc2626',
                                            fontStyle: 'italic'
                                        }}>
                                            ⚠️ Selecciona al menos {id === 'vigilantes' ? 'una especialización' : 'un tipo'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
