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


            {/* ── ORIGINS GRID — cards only, no subtypes inside ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {ORIGINS.map((origin) => {
                    const isSelected = selectedOrigins.includes(origin.id);
                    const category = getOriginCategory(origin.id);
                    const isDisabled = category?.disabled;
                    const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;
                    const needsSubtype = isSelected && hasSubtypes && (selectedSubtypes[origin.id] || []).filter(s => !category?.defaultEffects?.includes(s)).length === 0;

                    if (!category) return null;

                    return (
                        <button
                            key={origin.id}
                            onClick={() => !isDisabled && handleToggleOrigin(origin.id)}
                            disabled={isDisabled}
                            title={isDisabled ? 'Próximamente disponible' : origin.name}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.9rem 0.75rem',
                                border: '3px solid',
                                borderColor: isDisabled ? '#e5e7eb' : needsSubtype ? '#f59e0b' : (isSelected ? '#2563eb' : '#e5e7eb'),
                                borderRadius: '12px',
                                backgroundColor: isDisabled ? '#f3f4f6' : (isSelected ? '#eff6ff' : 'white'),
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isDisabled ? 0.5 : 1,
                                boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 1px 3px rgba(0,0,0,0.07)',
                                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                                position: 'relative',
                                width: '100%'
                            }}
                        >
                            {/* Check / warning indicator */}
                            <div style={{
                                position: 'absolute',
                                top: '0.4rem',
                                right: '0.4rem',
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: '2px solid',
                                borderColor: needsSubtype ? '#f59e0b' : (isSelected ? '#2563eb' : '#d1d5db'),
                                backgroundColor: needsSubtype ? '#fef3c7' : (isSelected ? '#2563eb' : 'white'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: needsSubtype ? '#92400e' : 'white',
                                fontWeight: 'bold',
                                fontSize: '11px'
                            }}>
                                {needsSubtype ? '!' : (isSelected && '✓')}
                            </div>

                            {/* Logo */}
                            <img
                                src={origin.logo}
                                alt={origin.name}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    objectFit: 'contain',
                                    filter: isDisabled ? 'grayscale(100%)' : (isSelected ? 'none' : 'grayscale(40%)'),
                                    transition: 'filter 0.2s ease'
                                }}
                            />

                            {/* Name */}
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: isDisabled ? '#9ca3af' : (isSelected ? '#1e40af' : '#4b5563'),
                                textAlign: 'center',
                                lineHeight: 1.2
                            }}>
                                {origin.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── SUBTYPES PANEL — below the grid, one card per selected origin ── */}
            {selectedOrigins.some(id => {
                const cat = getOriginCategory(id);
                return cat?.subtypes && Object.keys(cat.subtypes).length > 0;
            }) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Tipo / Especialización
                        </span>
                        {selectedOrigins.map(id => {
                            const origin = ORIGINS.find(o => o.id === id);
                            const category = getOriginCategory(id);
                            if (!category?.subtypes || Object.keys(category.subtypes).length === 0) return null;

                            const isSingleSelection = ['divinos', 'cosmicos', 'parahumanos', 'mutantes'].includes(id);
                            const availableSubtypes = Object.keys(category.subtypes).filter(s => !category.disabledSubtypes?.includes(s));
                            const needsWarning = (selectedSubtypes[id] || []).filter(s => !category.defaultEffects?.includes(s)).length === 0;

                            return (
                                <div
                                    key={id}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        backgroundColor: needsWarning ? '#fffbeb' : '#f0f9ff',
                                        border: `2px solid ${needsWarning ? '#fcd34d' : '#bfdbfe'}`,
                                        borderRadius: '10px',
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <img src={origin?.logo} alt={origin?.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e40af' }}>{origin?.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {id === 'vigilantes' ? '— Elige especializaciones' : (isSingleSelection ? '— Elige uno' : '— Elige uno o varios')}
                                        </span>
                                        {needsWarning && (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>
                                                ⚠️ Pendiente de elegir
                                            </span>
                                        )}
                                    </div>

                                    {/* Subtype chips */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {availableSubtypes.map(subtype => {
                                            const isChecked = selectedSubtypes[id]?.includes(subtype) || false;
                                            const isSubSelected = isSingleSelection ? (selectedSubtypes[id]?.[0] === subtype) : isChecked;

                                            return (
                                                <label
                                                    key={subtype}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.4rem 0.9rem',
                                                        borderRadius: '999px',
                                                        border: '2px solid',
                                                        borderColor: isSubSelected ? '#2563eb' : '#d1d5db',
                                                        backgroundColor: isSubSelected ? '#dbeafe' : 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s',
                                                        fontSize: '0.875rem',
                                                        fontWeight: isSubSelected ? 700 : 400,
                                                        color: isSubSelected ? '#1e40af' : '#374151',
                                                        userSelect: 'none'
                                                    }}
                                                >
                                                    <input
                                                        type={isSingleSelection ? 'radio' : 'checkbox'}
                                                        name={isSingleSelection ? `subtype-${id}` : undefined}
                                                        checked={isSubSelected}
                                                        onChange={() => handleToggleSubtype(id, subtype)}
                                                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    {isSubSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                                                    {subtype}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
}

