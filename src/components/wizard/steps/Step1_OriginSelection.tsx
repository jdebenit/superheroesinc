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

import './Step1_OriginSelection.css';

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
        <div className="step1-container">
            <h2 style={stepPageTitleStyle}>
                Selecciona los Orígenes del Personaje
            </h2>
            <p style={stepPageSubtitleStyle}>
                Divino, Cósmico y Parahumano solo pueden elegir un tipo. Los demás pueden elegir múltiples tipos.
            </p>


            {/* ── ORIGINS GRID — cards only, no subtypes inside ── */}
            <div className="step1-origins-grid">
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
                            className={`step1-origin-card ${isDisabled ? 'disabled' : needsSubtype ? 'needs-subtype' : isSelected ? 'selected' : 'default'}`}
                        >
                            {/* Check / warning indicator */}
                            <div className={`step1-origin-indicator ${needsSubtype ? 'needs-subtype' : isSelected ? 'selected' : 'default'}`}>
                                {needsSubtype ? '!' : (isSelected && '✓')}
                            </div>

                            {/* Logo */}
                            <img
                                src={origin.logo}
                                alt={origin.name}
                                className={`step1-origin-logo ${isDisabled ? 'disabled' : isSelected ? 'selected' : 'default'}`}
                            />

                            {/* Name */}
                            <span className={`step1-origin-name ${isDisabled ? 'disabled' : isSelected ? 'selected' : 'default'}`}>
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
                    <div className="step1-subtypes-panel">
                        <span className="step1-subtypes-header">
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
                                    className={`step1-subtype-card ${needsWarning ? 'warning' : 'normal'}`}
                                >
                                    {/* Header */}
                                    <div className="step1-subtype-card-header">
                                        <img src={origin?.logo} alt={origin?.name} className="step1-subtype-origin-logo" />
                                        <span className="step1-subtype-origin-name">{origin?.name}</span>
                                        <span className="step1-subtype-instruction">
                                            {id === 'vigilantes' ? '— Elige especializaciones' : (isSingleSelection ? '— Elige uno' : '— Elige uno o varios')}
                                        </span>
                                        {needsWarning && (
                                            <span className="step1-subtype-warning-text">
                                                ⚠️ Pendiente de elegir
                                            </span>
                                        )}
                                    </div>

                                    {/* Subtype chips */}
                                    <div className="step1-subtype-chips-container">
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

