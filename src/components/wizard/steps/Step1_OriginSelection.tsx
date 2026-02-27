import React, { useState, useEffect } from 'react';
import { ORIGIN_CATEGORIES } from '../../../data/originDefinitions';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../shared/stepStyles';

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

    // Sync local state with data prop whenever it changes (e.g. on load from localStorage)
    useEffect(() => {
        const items = data.origin?.items || [];
        const origins: string[] = [];
        const subtypes: { [originId: string]: string[] } = {};

        if (items.length > 0) {
            items.forEach((item: any) => {
                const originName = Object.keys(item)[0];
                const origin = ORIGINS.find(o => o.name === originName);

                if (origin) {
                    origins.push(origin.id);
                    const subtypeList = item[originName];
                    if (Array.isArray(subtypeList) && subtypeList.length > 0) {
                        subtypes[origin.id] = subtypeList;
                    }
                }
            });
        }

        // Only update if actually different to avoid infinite loops
        // (JSON.stringify is cheap here given the small data size)
        if (JSON.stringify(origins) !== JSON.stringify(selectedOrigins)) {
            setSelectedOrigins(origins);
        }

        // Use deep comparison for subtypes object as well
        if (JSON.stringify(subtypes) !== JSON.stringify(selectedSubtypes)) {
            setSelectedSubtypes(subtypes);
        }

    }, [JSON.stringify(data.origin?.items)]); // Run whenever the origin items structure changes

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
        const isSingleSelection = originId === 'divinos' || originId === 'cosmicos' || originId === 'parahumanos' || originId === 'mutantes';

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
            <h2 style={stepPageTitleStyle}>
                Selecciona los Orígenes del Personaje
            </h2>
            <p style={stepPageSubtitleStyle}>
                Divino, Cósmico y Parahumano solo pueden elegir un tipo. Los demás pueden elegir múltiples tipos.
            </p>

            {/* ── SELECTED ORIGINS PANEL (above grid) ──────── */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                marginBottom: '1.25rem',
                padding: '0.85rem 1rem',
                backgroundColor: selectedOrigins.length > 0 ? '#f0f9ff' : '#f8fafc',
                border: `2px solid ${selectedOrigins.length > 0 ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '10px',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: selectedOrigins.length > 0 ? '0.6rem' : 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedOrigins.length > 0 ? '#1e40af' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {selectedOrigins.length > 0
                            ? `✓ Seleccionados (${selectedOrigins.length})`
                            : '↓ Selecciona un origen a continuación'}
                    </span>
                </div>

                {selectedOrigins.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedOrigins.map(id => {
                            const origin = ORIGINS.find(o => o.id === id);
                            const subtypes = selectedSubtypes[id] || [];
                            const category = getOriginCategory(id);
                            const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;
                            const visibleSubtypes = subtypes.filter(s => !category?.defaultEffects?.includes(s));

                            return (
                                <div
                                    key={id}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.35rem 0.75rem',
                                        backgroundColor: 'white',
                                        borderRadius: '999px',
                                        border: '2px solid #bfdbfe',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <span style={{
                                        padding: '0.15rem 0.6rem',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {origin?.name}
                                    </span>
                                    {visibleSubtypes.map(subtype => (
                                        <span key={subtype} style={{
                                            padding: '0.15rem 0.6rem',
                                            backgroundColor: '#60a5fa',
                                            color: 'white',
                                            borderRadius: '999px',
                                            fontSize: '0.78rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {subtype}
                                        </span>
                                    ))}
                                    {hasSubtypes && subtypes.length === 0 && (
                                        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontStyle: 'italic' }}>
                                            ⚠️ elige {id === 'vigilantes' ? 'especialización' : 'tipo'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── ORIGINS GRID ──────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                {ORIGINS.map((origin) => {
                    const isSelected = selectedOrigins.includes(origin.id);
                    const category = getOriginCategory(origin.id);
                    const isDisabled = category?.disabled;
                    const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;

                    if (!category) return null;

                    return (
                        <div key={origin.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                onClick={() => !isDisabled && handleToggleOrigin(origin.id)}
                                disabled={isDisabled}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    border: '3px solid',
                                    borderColor: isDisabled ? '#e5e7eb' : (isSelected ? '#2563eb' : '#e5e7eb'),
                                    borderRadius: '12px',
                                    backgroundColor: isDisabled ? '#f3f4f6' : (isSelected ? '#eff6ff' : 'white'),
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isDisabled ? 0.6 : 1,
                                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
                                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                                    position: 'relative',
                                    width: '100%'
                                }}
                            >
                                {/* Checkbox indicator */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    border: '2px solid',
                                    borderColor: isSelected ? '#2563eb' : '#d1d5db',
                                    backgroundColor: isSelected ? '#2563eb' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}>
                                    {isSelected && '✓'}
                                </div>

                                {/* Logo */}
                                <img
                                    src={origin.logo}
                                    alt={origin.name}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'contain',
                                        filter: isSelected ? 'none' : 'grayscale(50%)',
                                        transition: 'filter 0.2s ease'
                                    }}
                                />

                                {/* Name */}
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: isSelected ? '#1e40af' : '#4b5563',
                                    textAlign: 'center'
                                }}>
                                    {origin.name}
                                </span>
                            </button>

                            {/* Subtypes */}
                            {isSelected && hasSubtypes && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.35rem',
                                    padding: '0.6rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '2px solid #bfdbfe'
                                }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        marginBottom: '0.15rem'
                                    }}>
                                        {origin.id === 'vigilantes' ? 'Especializaciones:' : 'Tipos:'}
                                        {(origin.id === 'divinos' || origin.id === 'cosmicos' || origin.id === 'parahumanos' || origin.id === 'mutantes') &&
                                            <span style={{ fontSize: '0.6rem', color: '#9ca3af', marginLeft: '0.35rem' }}>(solo uno)</span>
                                        }
                                    </span>
                                    {Object.keys(category!.subtypes!)
                                        .filter(subtype => !category?.disabledSubtypes?.includes(subtype))
                                        .map(subtype => {
                                            const isSingleSelection = origin.id === 'divinos' || origin.id === 'cosmicos' || origin.id === 'parahumanos' || origin.id === 'mutantes';
                                            const isChecked = selectedSubtypes[origin.id]?.includes(subtype) || false;
                                            const isSubSelected = isSingleSelection ? (selectedSubtypes[origin.id]?.[0] === subtype) : isChecked;

                                            return (
                                                <label key={subtype} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    cursor: 'pointer',
                                                    padding: '0.3rem 0.4rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: isSubSelected ? '#dbeafe' : 'transparent',
                                                    transition: 'background-color 0.15s'
                                                }}>
                                                    <input
                                                        type={isSingleSelection ? 'radio' : 'checkbox'}
                                                        name={isSingleSelection ? `origin-${origin.id}` : undefined}
                                                        checked={isSubSelected}
                                                        onChange={() => handleToggleSubtype(origin.id, subtype)}
                                                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                                    />
                                                    <span style={{
                                                        fontSize: '0.82rem',
                                                        fontWeight: isSubSelected ? 'bold' : 'normal',
                                                        color: isSubSelected ? '#1e40af' : '#4b5563'
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
        </div>
    );
}

