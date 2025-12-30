import React, { useState, useMemo } from 'react';
import { POWERS, type Power, type PowerType } from '../../../data/powers';
import { SPELLS, type Spell } from '../../../data/spells';
import { TECH_MODULES, type TechModuleDefinition } from '../../../data/techModules';

interface Step3Props {
    data: any;
    onChange: (updates: any) => void;
}

interface SelectedPower {
    id: string;
    origin: string;
    rank: number; // 1-100, adds 0.1 PC per unit
    powerMod?: number; // For powers with characteristics, max total 200
    skillValue?: number; // Input for skill calculation base
}

interface TechModule {
    id: string;
    definitionId: string; // ID from TECH_MODULES
    name: string;
    location: string;
    pcCost: number;
}

// Helpers for data access
const hasOrigin = (data: any, originName: string) => {
    return data.origin?.items?.some((item: any) => Object.keys(item)[0] === originName);
};

const hasSubtype = (data: any, originName: string, subtypeName: string) => {
    return data.origin?.items?.some((item: any) => {
        const key = Object.keys(item)[0];
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
};

const getCharacteristicValue = (data: any, charName: string) => {
    return data.attributes?.values?.[charName] || 0;
};

const calculateEM = (data: any, selectedPowers: any[] = [], divisor: number = 1) => {
    let int = Number(getCharacteristicValue(data, 'Inteligencia')) || 0;
    let per = Number(getCharacteristicValue(data, 'Percepción')) || 0;
    let vol = Number(getCharacteristicValue(data, 'Voluntad')) || 0;
    let con = Number(getCharacteristicValue(data, 'Constitución')) || 0;

    // Apply power modifiers
    if (selectedPowers) {
        selectedPowers.forEach(p => {
            const powerData = POWERS.find(power => power.id === p.id);
            if (powerData?.characteristic && p.powerMod) {
                switch (powerData.characteristic) {
                    case 'INT': int += p.powerMod; break;
                    case 'PER': per += p.powerMod; break;
                    case 'VOL': vol += p.powerMod; break;
                    case 'CON': con += p.powerMod; break;
                }
            }
        });
    }

    // If Semidemonio, add CON to the formula
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const conVal = isSemidemonio ? con : 0;

    return Math.floor((int + per + vol + conVal) / divisor);
};

const calculateSkillBase = (data: any, formula: string): number => {
    if (!formula) return 0;

    // Map abbreviations to full names
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        return getCharacteristicValue(data, map[abbr] || '');
    };

    try {
        // Replace abbreviations with values
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        // Safe evaluation of simple math formula
        return Math.floor(new Function('return ' + evalFormula)());
    } catch (e) {
        return 0;
    }
};

const getRankLevel = (rank: number): string => {
    if (rank <= 20) return 'Bajo';
    if (rank <= 40) return 'Medio';
    if (rank <= 70) return 'Elevado';
    if (rank <= 95) return 'Alto';
    return 'Cósmico';
};

const getMutantPowerTypes = (data: any): PowerType[] => {
    const mutantOrigin = data.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (!mutantOrigin) return [];

    const subtypes = mutantOrigin['Mutante'];
    if (!Array.isArray(subtypes) || subtypes.length === 0) return [];

    const subtype = subtypes[0]; // El primer subtipo seleccionado

    // Mapear subtipo a tipos de poderes
    if (subtype === 'Psíquico') return ['Psíquico'];
    if (subtype === 'Energético') return ['Energético'];
    if (subtype === 'Físico') return ['Físico'];
    if (subtype === 'Psíquico/Energético') return ['Psíquico', 'Energético'];
    if (subtype === 'Energético/Físico') return ['Energético', 'Físico'];
    if (subtype === 'Psíquico/Físico') return ['Psíquico', 'Físico'];

    return [];
};

const POWER_TYPES = ["Todos", "Físico", "Psíquico", "Energético"];

const ORIGIN_ICONS: Record<string, string> = {
    'Guardián': '/logos/guardianes.png',
    'Alterado': '/logos/alterados.png',
    'Arcano': '/logos/arcanos.png',
    'Mago': '/logos/arcanos.png',
    'Dotado': '/logos/arcanos.png',
};

export default function Step3_Especials({ data, onChange }: Step3Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'powers' | 'spells' | 'techModules' | null>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    // Modal State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("Todos");
    const [selectedTechTypeFilter, setSelectedTechTypeFilter] = useState<'General' | 'Mejora Interna' | 'All'>('All');
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Powers are now stored as objects { id, origin }
    // We handle potential migration from string[] by filtering or mapping if needed, 
    // but strict typing assumes the new structure.
    const selectedPowers: SelectedPower[] = useMemo(() => {
        if (!Array.isArray(data.powers?.selected)) return [];
        // Safety check if we have legacy strings, though we'll assume clear state for now or filter them out/migrate
        return data.powers.selected.filter((p: any) => typeof p === 'object' && p.id && p.origin);
    }, [data.powers?.selected]);

    // Spells are now stored as objects { id, rank }
    const selectedSpellsWithRank: Array<{ id: string, rank: number }> = useMemo(() => {
        if (!Array.isArray(data.spells?.selected)) return [];
        return data.spells.selected.filter((s: any) => typeof s === 'object' && s.id && s.rank);
    }, [data.spells?.selected]);

    const updatePowers = (newSelected: SelectedPower[]) => {
        onChange({ ...data, powers: { ...data.powers, selected: newSelected } });
    };

    const updateSpells = (newSelected: Array<{ id: string, rank: number }>) => {
        onChange({ ...data, spells: { ...data.spells, selected: newSelected } });
    };

    const updateEMFormula = (divisor: number, pcCost: number) => {
        onChange({
            ...data,
            spells: {
                ...data.spells,
                emFormula: { divisor, pcCost },
                // If "No EM" selected (divisor 0), clear spells
                selected: divisor === 0 ? [] : data.spells.selected
            }
        });
    };

    const openPowerModal = (originContext: string) => {
        setModalType('powers');
        setModalOriginFilter(originContext);
        setSearchTerm("");
        setSelectedTypeFilter("Todos");
        setModalOpen(true);
    };

    const openSpellModal = () => {
        setModalType('spells');
        setModalOriginFilter(null);
        setSearchTerm("");
        setSelectedTypeFilter("Todos");
        setModalOpen(true);
    };

    const openTechModuleModal = () => {
        setModalType('techModules');
        setModalOriginFilter(null);
        setSearchTerm("");
        setSelectedTypeFilter("Todos");
        setSelectedTechTypeFilter("All"); // Reset tech type filter
        setModalOpen(true);
    };

    const togglePowerSelection = (powerId: string) => {
        if (!modalOriginFilter) return; // Should not happen for powers

        const existingIndex = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);

        let newSelected: SelectedPower[];
        if (existingIndex >= 0) {
            // Remove
            newSelected = [...selectedPowers];
            newSelected.splice(existingIndex, 1);
        } else {
            // Add with default rank 1
            newSelected = [...selectedPowers, { id: powerId, origin: modalOriginFilter, rank: 1 }];
        }
        updatePowers(newSelected);
    };

    const updatePowerRank = (powerId: string, origin: string, newRank: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, rank: Math.max(1, Math.min(100, newRank)) } // Clamp between 1-100
                : p
        );
        updatePowers(updated);
    };

    const updatePowerMod = (powerId: string, origin: string, newMod: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, powerMod: newMod }
                : p
        );
        updatePowers(updated);
    };
    const updatePowerSkillValue = (powerId: string, origin: string, newValue: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, skillValue: newValue }
                : p
        );
        updatePowers(updated);
    };

    const toggleSpellSelection = (id: string) => {
        const existingIndex = selectedSpellsWithRank.findIndex(s => s.id === id);
        let newSelected: Array<{ id: string, rank: number }>;

        if (existingIndex >= 0) {
            // Remove
            newSelected = [...selectedSpellsWithRank];
            newSelected.splice(existingIndex, 1);
        } else {
            // Add with rank 1
            newSelected = [...selectedSpellsWithRank, { id, rank: 1 }];
        }
        updateSpells(newSelected);
    };

    const updateSpellRank = (id: string, rank: number) => {
        const newSelected = selectedSpellsWithRank.map(s =>
            s.id === id ? { ...s, rank } : s
        );
        updateSpells(newSelected);
    };

    // Filter items for the modal
    const modalItems = useMemo(() => {
        if (!modalType) return [];
        const lowerSearch = searchTerm.toLowerCase();

        if (modalType === 'powers') {
            return POWERS.filter(p => {
                // Must belong to the origin context 
                if (modalOriginFilter && !p.origins.includes(modalOriginFilter)) return false;

                // Special filtering for Mutant powers by type
                if (modalOriginFilter === 'Mutante') {
                    const allowedTypes = getMutantPowerTypes(data);
                    if (allowedTypes.length > 0 && !p.types.some(t => allowedTypes.includes(t))) {
                        return false;
                    }
                }

                if (selectedTypeFilter !== "Todos" && !p.types.includes(selectedTypeFilter as any)) {
                    return false;
                }

                const matchesSearch = p.name.toLowerCase().includes(lowerSearch);
                return matchesSearch;
            });
        } else if (modalType === 'spells') {
            return SPELLS.filter(s => {
                return s.name.toLowerCase().includes(lowerSearch);
            });
        } else if (modalType === 'techModules') {
            let itemsToFilter = TECH_MODULES;
            if (selectedTechTypeFilter !== 'All') {
                itemsToFilter = itemsToFilter.filter(m => m.type === selectedTechTypeFilter);
            }
            return itemsToFilter.filter(m => {
                return m.name.toLowerCase().includes(lowerSearch);
            });
        }
        return [];
    }, [modalType, modalOriginFilter, searchTerm, selectedTypeFilter, selectedTechTypeFilter, data]);

    // Derived State for Display
    const isGuardian = hasOrigin(data, 'Guardián');
    const isAlterado = hasOrigin(data, 'Alterado');
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');

    // New origin-specific power access
    const isVampiro = hasSubtype(data, 'Sobrenatural', 'Vampiro');
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const isThals = hasOrigin(data, 'Thals');
    const isDivino = hasOrigin(data, 'Divino'); // Any Divine subtype
    const isCosmico = hasOrigin(data, 'Cósmico');
    const isMutante = hasOrigin(data, 'Mutante');
    const isVigilante = hasOrigin(data, 'Vigilante');

    // Technological
    const isTecnoarmadura = hasSubtype(data, 'Tecnológico', 'Tecnoarmadura');
    const isCyborg = hasSubtype(data, 'Tecnológico', 'Cyborg');
    const isTecnovehiculo = hasSubtype(data, 'Tecnológico', 'Tecnovehículo');
    const isTechnological = isTecnoarmadura || isCyborg || isTecnovehiculo;

    // Get Vigilante specialties
    const vigilanteSpecialties = useMemo(() => {
        if (!isVigilante) return [];
        const vigItem = data.origin?.items?.find((item: any) => Object.keys(item)[0] === 'Vigilante');
        if (!vigItem) return [];
        return vigItem['Vigilante'] || [];
    }, [data.origin, isVigilante]);

    const updateTrauma = (specialty: string, text: string) => {
        onChange({
            ...data,
            traumas: {
                ...data.traumas,
                [specialty]: text
            }
        });
    };

    // Tech Modules Logic
    const techModules: TechModule[] = data.techModules || [];


    const toggleTechModule = (defId: string) => {
        // Check if already selected (by definitionId)
        // Allowing multiples of same module? Usually modules are unique or stackable. 
        // For simplicity, let's allow multiples but maybe warn? Or just standard toggle for now.
        // Actually for modules like "Cuchilla" having two is valid (one per arm).
        // So maybe we don't toggle, just Add?
        // But for modal consistency, usually it is toggle. 
        // Let's implementation ADDING, not toggling for modules, or just simple toggle for unique ones.
        // Given the previous manual system, duplication was possible.
        // Let's assume unique for now to keep it simple with the grid view.

        const existingIndex = techModules.findIndex(m => m.definitionId === defId);

        let newModules: TechModule[];
        if (existingIndex >= 0) {
            // Remove
            newModules = [...techModules];
            newModules.splice(existingIndex, 1);
        } else {
            const def = TECH_MODULES.find(m => m.id === defId);
            if (!def) return;

            const newModule: TechModule = {
                id: Date.now().toString(),
                definitionId: def.id,
                name: def.name,
                location: def.locations[0] || 'Integrado',
                pcCost: def.cost
            };
            newModules = [...techModules, newModule];
        }
        onChange({
            ...data,
            techModules: newModules
        });
    };

    const updateModuleLocation = (id: string, newLocation: string) => {
        onChange({
            ...data,
            techModules: techModules.map(m => m.id === id ? { ...m, location: newLocation } : m)
        });
    };

    const updateModuleCost = (id: string, newCost: number) => {
        onChange({
            ...data,
            techModules: techModules.map(m => m.id === id ? { ...m, pcCost: newCost } : m)
        });
    };

    const removeTechModule = (id: string) => {
        onChange({
            ...data,
            techModules: techModules.filter(m => m.id !== id)
        });
    };

    // EM Formula state
    const emFormula = data.spells?.emFormula || { divisor: 4, pcCost: 0 };
    const hasEMFormula = !isMago && (isDotado || isHibrido || isTerrano);
    const hasEM = isMago || isDotado || isHibrido || isTerrano; // Show section for all magic users
    const canSelectSpells = hasEM && emFormula.divisor !== 0; // Only allow spell selection if divisor > 0

    // Spells - enrich with full spell data and rank
    const selectedSpells = selectedSpellsWithRank.map(sw => {
        const spell = SPELLS.find(s => s.id === sw.id);
        return spell ? { ...spell, rank: sw.rank } : null;
    }).filter((s): s is (Spell & { rank: number }) => s !== null);

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-black mb-8 uppercase text-center font-comic tracking-wide text-gray-800">
                Poderes y Habilidades Especiales
            </h2>



            {
                !isGuardian && !isAlterado && !hasEM && !isVampiro && !isSemidemonio && !isThals && !isDivino && !isCosmico && !isMutante && !isVigilante && !isTechnological && (
                    <div className="text-center py-12 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-xl text-gray-500 font-bold">
                            No has seleccionado ningún origen que actualmente tenga habilitado este paso. Recuerda es una Alpha.
                        </p>
                        <p className="text-gray-400 mt-2 font-comic">Prueba con Guardián, Alterado, Arcano, Sobrenatural, Thals, Divino, Cósmico, Mutante o Tecnológico</p>
                    </div>
                )
            }

            {/* VIGILANTE TRAUMAS SECTION */}
            {
                isVigilante && vigilanteSpecialties.length > 0 && (
                    <div className="bg-red-50 border-4 border-red-900 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
                        <div className="p-6 border-b-4 border-red-900 bg-white">
                            <h3 className="text-2xl font-black text-red-900 uppercase italic font-comic">Traumas del Vigilante</h3>
                            <p className="text-gray-600 mt-2">
                                Como Vigilante, cada especialidad proviene de un trauma profundo. Describe el evento trágico que te llevó a desarrollar estas habilidades.
                            </p>
                        </div>
                        <div className="p-6 bg-red-50/50 space-y-6">
                            {vigilanteSpecialties.map((specialty: string) => (
                                <div key={specialty} className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-lg font-black text-red-900 uppercase font-comic tracking-wide flex items-center gap-2">
                                            <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
                                            Trauma: {specialty}
                                        </label>
                                        <textarea
                                            value={data.traumas?.[specialty] || ''}
                                            onChange={(e) => updateTrauma(specialty, e.target.value)}
                                            placeholder={`Describe el trauma que te convirtió en ${specialty}...`}
                                            className="w-full h-32 p-4 border-2 border-red-200 rounded-lg focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 resize-y font-comic text-gray-700 text-lg leading-relaxed placeholder-red-200 block"
                                            style={{ minWidth: '100%', maxWidth: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* TECHNOLOGICAL MODULES SECTION */}
            {
                isTechnological && (
                    <div className="bg-slate-50 border-4 border-slate-700 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
                        <div className="p-6 border-b-4 border-slate-700 bg-white">
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic font-comic">Módulos Tecnológicos</h3>
                            <p className="text-gray-600 mt-2">
                                Instala módulos para aumentar tus capacidades.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-100">
                            {/* Add Module Form */}
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-600 italic">
                                    Selecciona los módulos tecnológicos instalados en la tecnoarmadura o tus tecnoimplantes.
                                </p>
                                <button
                                    onClick={openTechModuleModal}
                                    className="pixel-button bg-slate-700 text-white hover:bg-slate-800 text-sm flex items-center gap-2"
                                >
                                    <span>+</span> Seleccionar Módulos
                                </button>
                            </div>

                            {/* Modules List - Table Format */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb',
                                marginTop: '1.5rem'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Módulo</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Tipo</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Localización</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Coste</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {techModules.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                                    No hay módulos instalados.<br />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Pulsa en "Seleccionar Módulos" para añadir mejoras.</span>
                                                </td>
                                            </tr>
                                        ) : (
                                            techModules.map((module, index) => {
                                                const definition = TECH_MODULES.find(d => d.id === module.definitionId);
                                                const type = definition?.type || 'General';
                                                const isEven = index % 2 === 0;

                                                return (
                                                    <tr key={module.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                            {module.name}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <span className="type-tag" style={{
                                                                backgroundColor: type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                                color: type === 'Mejora Interna' ? '#be123c' : undefined,
                                                                borderColor: type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                            }}>
                                                                {type}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <input
                                                                type="text"
                                                                value={module.location}
                                                                onChange={(e) => updateModuleLocation(module.id, e.target.value)}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: 'white',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#4f46e5',
                                                                    width: '100%',
                                                                    textAlign: 'center'
                                                                }}
                                                                placeholder="Ubicación"
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            {(module.definitionId === 'equipacion_combate' || module.definitionId === 'prototipo_alta_tecnologia') ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={module.pcCost}
                                                                        onChange={(e) => updateModuleCost(module.id, parseInt(e.target.value) || 0)}
                                                                        style={{
                                                                            width: '60px',
                                                                            padding: '2px 4px',
                                                                            border: '1px solid #d1d5db',
                                                                            borderRadius: '4px',
                                                                            textAlign: 'center',
                                                                            fontWeight: 'bold',
                                                                            color: '#4f46e5'
                                                                        }}
                                                                    />
                                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>PC</span>
                                                                </div>
                                                            ) : (
                                                                <span style={{
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold',
                                                                    backgroundColor: '#eef2ff',
                                                                    color: '#4f46e5',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '9999px',
                                                                    border: '1px solid #e0e7ff',
                                                                    display: 'inline-block'
                                                                }}>
                                                                    {module.pcCost} PC
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => removeTechModule(module.id)}
                                                                style={{
                                                                    color: '#ef4444',
                                                                    padding: '8px',
                                                                    borderRadius: '9999px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                title="Desinstalar módulo"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                    {techModules.length > 0 && (
                                        <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                                            <tr>
                                                <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#374151' }}>
                                                    Total PCs Invertidos:
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                                                    {techModules.reduce((acc, m) => acc + m.pcCost, 0)} PC
                                                </td>
                                                <td colSpan={1}></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* UNIFIED POWERS SECTION (Guardian, Alterado, Vampírico, Sobrenatural, Thals, Divino, Terrano, Dotado, Cósmico, Mutante) */}
            {
                (isGuardian || isAlterado || isVampiro || isSemidemonio || isThals || isDivino || isTerrano || isDotado || isCosmico || isMutante) && (
                    <div className="bg-gray-50 border-4 border-gray-800 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)]">
                        <div className="p-6 border-b-4 border-gray-800 bg-white flex flex-col md:flex-row justify-between items-center gap-4">

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800 uppercase italic font-comic text-center sm:text-left">Poderes Especiales</h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {isGuardian && (
                                    <button onClick={() => openPowerModal('Guardian')} className="pixel-button bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-2">
                                        <span>+</span> Guardián
                                    </button>
                                )}
                                {isAlterado && (
                                    <button onClick={() => openPowerModal('Alterado')} className="pixel-button bg-purple-600 text-white hover:bg-purple-700 text-sm flex items-center gap-2">
                                        <span>+</span> Alterado
                                    </button>
                                )}
                                {isVampiro && (
                                    <button onClick={() => openPowerModal('Vampírico')} className="pixel-button bg-red-700 text-white hover:bg-red-800 text-sm flex items-center gap-2">
                                        <span>+</span> Vampírico
                                    </button>
                                )}
                                {isSemidemonio && (
                                    <button onClick={() => openPowerModal('Sobrenatural')} className="pixel-button bg-orange-600 text-white hover:bg-orange-700 text-sm flex items-center gap-2">
                                        <span>+</span> Sobrenatural
                                    </button>
                                )}
                                {isThals && (
                                    <button onClick={() => openPowerModal('Thals')} className="pixel-button bg-teal-600 text-white hover:bg-teal-700 text-sm flex items-center gap-2">
                                        <span>+</span> Thals
                                    </button>
                                )}
                                {isDivino && (
                                    <button onClick={() => openPowerModal('Divino')} className="pixel-button bg-yellow-500 text-white hover:bg-yellow-600 text-sm flex items-center gap-2">
                                        <span>+</span> Divino
                                    </button>
                                )}
                                {isTerrano && (
                                    <button onClick={() => openPowerModal('Guardian')} className="pixel-button bg-emerald-600 text-white hover:bg-emerald-700 text-sm flex items-center gap-2">
                                        <span>+</span> Terrano (Guardian)
                                    </button>
                                )}
                                {isDotado && (
                                    <button onClick={() => openPowerModal('Sobrenatural')} className="pixel-button bg-amber-600 text-white hover:bg-amber-700 text-sm flex items-center gap-2">
                                        <span>+</span> Dotado (Sobrenatural)
                                    </button>
                                )}
                                {isCosmico && (
                                    <button onClick={() => openPowerModal('Cósmico')} className="pixel-button bg-indigo-600 text-white hover:bg-indigo-700 text-sm flex items-center gap-2">
                                        <span>+</span> Cósmico
                                    </button>
                                )}
                                {isMutante && (
                                    <button onClick={() => openPowerModal('Mutante')} className="pixel-button bg-pink-600 text-white hover:bg-pink-700 text-sm flex items-center gap-2">
                                        <span>+</span> Mutante
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            border: '1px solid #e5e7eb',
                            marginBottom: '3rem'
                        }}>
                            {selectedPowers.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Poder</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Base / Rango / PCs</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Base Hab.</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Origen</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPowers.map((selection, idx) => {
                                            const p = POWERS.find(power => power.id === selection.id);
                                            if (!p) return null;
                                            const isEven = idx % 2 === 0;

                                            return (
                                                <tr key={`${selection.id}-${selection.origin}-${idx}`} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                        {p.name}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        {!p.characteristic ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                                    <span style={{ color: '#6b7280', fontWeight: 'bold' }}>{p.cost}</span>
                                                                    <span style={{ color: '#9ca3af' }}>+</span>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max="100"
                                                                            value={selection.rank}
                                                                            onChange={(e) => updatePowerRank(selection.id, selection.origin, parseInt(e.target.value, 10))}
                                                                            style={{
                                                                                width: '50px',
                                                                                padding: '0.25rem',
                                                                                border: '1px solid #d1d5db',
                                                                                borderRadius: '4px',
                                                                                textAlign: 'center',
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: 'bold',
                                                                                color: '#4f46e5'
                                                                            }}
                                                                        />
                                                                        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Rango</span>
                                                                    </div>
                                                                    <span style={{ color: '#9ca3af' }}>/10</span>

                                                                    {(() => {
                                                                        const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                                                        const currentVal = selection.skillValue || minVal;
                                                                        const extraPoints = Math.max(0, currentVal - minVal);

                                                                        if (extraPoints > 0) {
                                                                            return (
                                                                                <>
                                                                                    <span style={{ color: '#9ca3af' }}>+</span>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                                        <span style={{ fontWeight: 'bold', color: '#d97706' }}>{extraPoints}</span>
                                                                                        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Hab.</span>
                                                                                    </div>
                                                                                    <span style={{ color: '#9ca3af' }}>/10</span>
                                                                                </>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}

                                                                    <span style={{ color: '#9ca3af' }}>=</span>
                                                                    <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>
                                                                        {(() => {
                                                                            const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                                                            const currentVal = selection.skillValue || minVal;
                                                                            const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                                                                            return (p.cost + (selection.rank / 10) + extraCost).toFixed(1);
                                                                        })()}
                                                                    </span>
                                                                    <span style={{ color: '#6b7280' }}>PCs</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>
                                                                    {getRankLevel(selection.rank)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                                    {/* Characteristic Value */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <span style={{ color: '#6b7280', fontWeight: 'bold' }}>
                                                                            {getCharacteristicValue(data, p.characteristic === 'FUE' ? 'Fuerza' :
                                                                                p.characteristic === 'AGI' ? 'Agilidad' :
                                                                                    p.characteristic === 'CON' ? 'Constitución' :
                                                                                        p.characteristic === 'INT' ? 'Inteligencia' :
                                                                                            p.characteristic === 'PER' ? 'Percepción' :
                                                                                                p.characteristic === 'VOL' ? 'Voluntad' : 'Apariencia')}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                                                            {p.characteristic}
                                                                        </span>
                                                                    </div>

                                                                    <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>+</span>

                                                                    {/* Power Mod Input */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="200"
                                                                            value={selection.powerMod || 0}
                                                                            onChange={(e) => {
                                                                                const charValue = getCharacteristicValue(data, p.characteristic === 'FUE' ? 'Fuerza' :
                                                                                    p.characteristic === 'AGI' ? 'Agilidad' :
                                                                                        p.characteristic === 'CON' ? 'Constitución' :
                                                                                            p.characteristic === 'INT' ? 'Inteligencia' :
                                                                                                p.characteristic === 'PER' ? 'Percepción' :
                                                                                                    p.characteristic === 'VOL' ? 'Voluntad' : 'Apariencia');
                                                                                const newMod = parseInt(e.target.value, 10) || 0;
                                                                                const total = charValue + newMod;
                                                                                // Limit total to 200
                                                                                if (total <= 200) {
                                                                                    updatePowerMod(selection.id, selection.origin, newMod);
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                width: '50px',
                                                                                padding: '0.25rem',
                                                                                border: '1px solid #d1d5db',
                                                                                borderRadius: '4px',
                                                                                textAlign: 'center',
                                                                                fontSize: '0.875rem',
                                                                                fontWeight: 'bold',
                                                                                color: '#10b981'
                                                                            }}
                                                                        />
                                                                        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                                                            Mod. Poder
                                                                        </span>
                                                                    </div>

                                                                    <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>=</span>

                                                                    {/* Total */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                                            {(() => {
                                                                                const charValue = getCharacteristicValue(data, p.characteristic === 'FUE' ? 'Fuerza' :
                                                                                    p.characteristic === 'AGI' ? 'Agilidad' :
                                                                                        p.characteristic === 'CON' ? 'Constitución' :
                                                                                            p.characteristic === 'INT' ? 'Inteligencia' :
                                                                                                p.characteristic === 'PER' ? 'Percepción' :
                                                                                                    p.characteristic === 'VOL' ? 'Voluntad' : 'Apariencia');
                                                                                return charValue + (selection.powerMod || 0);
                                                                            })()}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                                                            Total
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                                                    {p.cost} + {((selection.powerMod || 0) / 10).toFixed(1)} = {(p.cost + ((selection.powerMod || 0) / 10)).toFixed(1)} PCs
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        {p.skillCalc ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                                {(() => {
                                                                    const minVal = calculateSkillBase(data, p.skillCalc);
                                                                    return (
                                                                        <>
                                                                            <input
                                                                                type="number"
                                                                                min={minVal}
                                                                                value={selection.skillValue || minVal}
                                                                                onChange={(e) => {
                                                                                    const val = parseInt(e.target.value) || 0;
                                                                                    // Ensure value is at least the calculation base
                                                                                    updatePowerSkillValue(selection.id, selection.origin, Math.max(minVal, val));
                                                                                }}
                                                                                style={{
                                                                                    width: '60px',
                                                                                    textAlign: 'center',
                                                                                    padding: '0.25rem',
                                                                                    border: '1px solid #d1d5db',
                                                                                    borderRadius: '4px'
                                                                                }}
                                                                            />
                                                                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                                                                                {p.skillCalc} ({minVal})
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>N/A</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        {selection.origin === 'Guardian' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#dbeafe',
                                                                color: '#1d4ed8',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #bfdbfe'
                                                            }}>
                                                                Guardián
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Alterado' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#f3e8ff',
                                                                color: '#7e22ce',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #e9d5ff'
                                                            }}>
                                                                Alterado
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Vampírico' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#fee2e2',
                                                                color: '#991b1b',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #fecaca'
                                                            }}>
                                                                Vampírico
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Sobrenatural' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#ffedd5',
                                                                color: '#c2410c',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #fed7aa'
                                                            }}>
                                                                Sobrenatural
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Thals' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#ccfbf1',
                                                                color: '#115e59',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #99f6e4'
                                                            }}>
                                                                Thals
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Divino' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#fef3c7',
                                                                color: '#92400e',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #fde68a'
                                                            }}>
                                                                Divino
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Cósmico' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#e0e7ff',
                                                                color: '#4338ca',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #c7d2fe'
                                                            }}>
                                                                Cósmico
                                                            </span>
                                                        )}
                                                        {selection.origin === 'Mutante' && (
                                                            <span style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: '900',
                                                                letterSpacing: '0.05em',
                                                                backgroundColor: '#fce7f3',
                                                                color: '#be123c',
                                                                padding: '2px 8px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #fbcfe8'
                                                            }}>
                                                                Mutante
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newSelected = [...selectedPowers];
                                                                newSelected.splice(idx, 1);
                                                                updatePowers(newSelected);
                                                            }}
                                                            style={{
                                                                color: '#ef4444',
                                                                padding: '8px',
                                                                borderRadius: '9999px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            title="Eliminar poder"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                    No hay poderes seleccionados
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* MAGIC SECTION (Mago & Dotado) */}
            {
                hasEM && (
                    <div className="bg-indigo-50 border-4 border-indigo-600 rounded-xl overflow-hidden shadow-[8px_8px_0px_#4f46e5]">
                        <div className="p-6 border-b-4 border-indigo-600 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-900 uppercase italic font-comic">Magia</h3>
                                </div>
                            </div>
                            {/* Old EM display removed */}
                        </div>

                        <div className="p-6 bg-indigo-50/50">
                            {/* EM Formula Selector (for Dotado/Híbrido, not Mago) */}
                            {hasEMFormula && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4f46e5',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Fórmula de Energía Mágica
                                    </label>
                                    <select
                                        value={`${emFormula.divisor}-${emFormula.pcCost}`}
                                        onChange={(e) => {
                                            const [divisor, pcCost] = e.target.value.split('-').map(Number);
                                            updateEMFormula(divisor, pcCost);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #6366f1',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            color: '#4f46e5',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isDotado && (
                                            <>
                                                <option value="2-8">Dotado: (PER+INT+VOL)/2 → +8 PCs</option>
                                                <option value="3-3">Dotado: (PER+INT+VOL)/3 → +3 PCs</option>
                                                <option value="4-0">Dotado: (PER+INT+VOL)/4 → +0 PCs</option>
                                            </>
                                        )}
                                        {isHibrido && (
                                            <>
                                                <option value="2-15">Híbrido: (PER+INT+VOL)/2 → +15 PCs</option>
                                                <option value="3-10">Híbrido: (PER+INT+VOL)/3 → +10 PCs</option>
                                                <option value="4-7">Híbrido: (PER+INT+VOL)/4 → +7 PCs</option>
                                                <option value="0-0">Híbrido: No EM</option>
                                            </>
                                        )}
                                        {isTerrano && (
                                            <>
                                                <option value="4-0">Terrano: (PER+INT+VOL)/4 → +0 PCs</option>
                                                <option value="0--5">Terrano: No EM → -5 PCs</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}

                            <div style={{
                                marginBottom: '1.5rem',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <button
                                    onClick={openSpellModal}
                                    disabled={emFormula.divisor === 0}
                                    className="pixel-button bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap px-4 py-2"
                                    style={{ opacity: emFormula.divisor === 0 ? 0.5 : 1, cursor: emFormula.divisor === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    + Abrir Lista de Hechizos
                                </button>


                                {/* Counter Box - Step 4 Style - Only show if EM is available */}
                                {emFormula.divisor !== 0 && (
                                    <div style={{
                                        backgroundColor: '#eef2ff',
                                        border: '2px solid #6366f1',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        flex: 1
                                    }}>
                                        {(() => {
                                            const totalCost = selectedSpells.reduce((acc, s) => {
                                                const baseCost = parseInt(s.cost, 10) || 0;
                                                // Maestría uses maxRank + 2 as multiplier
                                                const effectiveRank = s.rank;
                                                return acc + (baseCost * effectiveRank);
                                            }, 0);
                                            const maxEM = calculateEM(data, selectedPowers, isMago ? 1 : emFormula.divisor);
                                            const isOver = totalCost > maxEM;
                                            const extraPC = isOver ? ((totalCost - maxEM) * 0.1).toFixed(1) : '0.0';

                                            // Build formula display
                                            const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
                                            const divisor = isMago ? 1 : emFormula.divisor;
                                            let formulaText = isSemidemonio ? '(PER+INT+VOL+CON)' : '(PER+INT+VOL)';
                                            if (divisor > 1) {
                                                formulaText += `/${divisor}`;
                                            }

                                            return (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <span style={{ fontSize: '1rem' }}>
                                                            Energía Mágica: {formulaText}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '1.125rem' }}>
                                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isOver ? '#ef4444' : '#6366f1' }}>
                                                                {totalCost}
                                                            </span>
                                                            <span style={{ color: '#9ca3af', margin: '0 0.25rem' }}>/</span>
                                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4b5563' }}>
                                                                {maxEM}
                                                            </span>
                                                            <span style={{ fontSize: '0.875rem', color: '#6366f1', marginLeft: '0.25rem', fontWeight: 'bold' }}>
                                                                EM
                                                            </span>
                                                        </span>
                                                        {isOver && (
                                                            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>
                                                                Coste Extra: +{extraPC} PC
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {selectedSpells.length > 0 ? (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    marginTop: '1.5rem'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Hechizo</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Rango</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Coste</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Requisitos</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSpells.map((s, idx) => {
                                                const isEven = idx % 2 === 0;
                                                const baseCost = parseInt(s.cost, 10) || 0;
                                                const maestriaValue = s.maxRank + 2;
                                                const isMaestria = s.rank === maestriaValue;
                                                const effectiveRank = isMaestria ? maestriaValue : s.rank;
                                                const totalCost = baseCost * effectiveRank;

                                                return (
                                                    <tr key={s.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                            {s.name}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <select
                                                                value={s.rank}
                                                                onChange={(e) => updateSpellRank(s.id, parseInt(e.target.value, 10))}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: 'white',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#4f46e5',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {Array.from({ length: s.maxRank }, (_, i) => i + 1).map(rank => (
                                                                    <option key={rank} value={rank}>{rank}</option>
                                                                ))}
                                                                <option key="maestria" value={s.maxRank + 2}>Maestría</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                fontSize: '0.875rem',
                                                                fontWeight: 'bold',
                                                                backgroundColor: isMaestria ? '#f3e8ff' : '#eef2ff',
                                                                color: isMaestria ? '#7c3aed' : '#4f46e5',
                                                                padding: '4px 12px',
                                                                borderRadius: '9999px',
                                                                border: isMaestria ? '1px solid #ddd6fe' : '1px solid #e0e7ff',
                                                                display: 'inline-block'
                                                            }}>
                                                                {baseCost} × {isMaestria ? `${maestriaValue} (M)` : effectiveRank} = {totalCost} EM
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                                            {s.requirements !== "No especificado" ? s.requirements : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newSelected = selectedSpellsWithRank.filter(spell => spell.id !== s.id);
                                                                    updateSpells(newSelected);
                                                                }}
                                                                style={{
                                                                    color: '#ef4444',
                                                                    padding: '8px',
                                                                    borderRadius: '9999px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                title="Olvidar hechizo"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                    No hay hechizos memorizados
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* MODAL */}
            {
                modalOpen && (
                    <div className="wizard-modal-overlay">
                        <div className="wizard-modal-content">

                            {/* Header */}
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {modalType === 'powers' ? `Seleccionar Poderes (${modalOriginFilter})` :
                                        modalType === 'techModules' ? 'Seleccionar Módulos Tecnológicos' :
                                            'Seleccionar Hechizos'}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="modal-close">&times;</button>
                            </div>

                            {/* PowerList-like Controls */}
                            <div className="controls-section">
                                <div className="filters-primary">
                                    {modalType === 'powers' && (
                                        <div className="filter-group">
                                            <span className="filter-label">Tipo:</span>
                                            <div className="type-buttons">
                                                {POWER_TYPES.map(type => (
                                                    <button
                                                        key={type}
                                                        className={`filter-button type ${selectedTypeFilter === type ? 'active' : ''}`}
                                                        onClick={() => setSelectedTypeFilter(type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {modalType === 'techModules' && (
                                        <div className="filter-group">
                                            <span className="filter-label">Tipo:</span>
                                            <div className="type-buttons">
                                                <button
                                                    className={`filter-button type ${selectedTechTypeFilter === 'All' ? 'active' : ''}`}
                                                    onClick={() => setSelectedTechTypeFilter('All')}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    className={`filter-button type ${selectedTechTypeFilter === 'General' ? 'active' : ''}`}
                                                    onClick={() => setSelectedTechTypeFilter('General')}
                                                >
                                                    General
                                                </button>
                                                <button
                                                    className={`filter-button type ${selectedTechTypeFilter === 'Mejora Interna' ? 'active' : ''}`}
                                                    onClick={() => setSelectedTechTypeFilter('Mejora Interna')}
                                                >
                                                    Mejoras Internas
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="search-row">
                                        <input
                                            type="text"
                                            placeholder={modalType === 'powers' ? "Buscar poder..." : modalType === 'techModules' ? "Buscar módulo..." : "Buscar hechizo..."}
                                            className="search-input"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="view-controls">
                                    <div className="view-toggles">
                                        <button
                                            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                                            onClick={() => setViewMode('grid')}
                                            title="Vista en Cuadrícula"
                                        >⊞</button>
                                        <button
                                            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => setViewMode('table')}
                                            title="Vista en Tabla"
                                        >≡</button>
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="modal-scroll-area">
                                {viewMode === 'grid' ? (
                                    <div className="powers-grid">
                                        {modalItems.map((item: any) => {
                                            let isSelected = false;
                                            if (modalType === 'powers') {
                                                isSelected = selectedPowers.some(p => p.id === item.id && p.origin === modalOriginFilter);
                                            } else if (modalType === 'spells') {
                                                isSelected = selectedSpellsWithRank.some(s => s.id === item.id);
                                            } else if (modalType === 'techModules') {
                                                isSelected = techModules.some(m => m.definitionId === item.id);
                                            }

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`power-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        if (modalType === 'powers') togglePowerSelection(item.id);
                                                        else if (modalType === 'spells') toggleSpellSelection(item.id);
                                                        else if (modalType === 'techModules') toggleTechModule(item.id);
                                                    }}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <div className="power-details">
                                                        {modalType === 'techModules' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                                <span className="power-cost">{item.cost} PC</span>
                                                                <span className="type-tag" style={{
                                                                    width: 'fit-content',
                                                                    backgroundColor: item.type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                                    color: item.type === 'Mejora Interna' ? '#be123c' : undefined,
                                                                    borderColor: item.type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                                }}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="power-cost">
                                                                {modalType === 'powers' ? `${item.formula} PC` : `Coste: ${item.cost}`}
                                                            </span>
                                                        )}

                                                        {modalType === 'powers' && (
                                                            <div className="power-tags">
                                                                <div className="power-types">
                                                                    {item.types?.map((t: string) => (
                                                                        <span key={t} className="type-tag">{t}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {modalType === 'spells' && item.requirements && item.requirements !== "No especificado" && (
                                                            <div className="range-note" style={{ textAlign: 'left', color: 'red' }}>
                                                                Req: {item.requirements}
                                                            </div>
                                                        )}

                                                        {modalType === 'techModules' && (
                                                            <div className="range-note" style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.8em', marginTop: '4px', fontStyle: 'italic' }}>
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && <div className="selected-badge">✓</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="powers-table-wrapper">
                                        <table className="powers-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}></th>
                                                    <th>Nombre</th>
                                                    <th>Coste</th>
                                                    {modalType === 'powers' && <th>Tipos</th>}
                                                    {modalType === 'spells' && <th>Requisitos</th>}
                                                    {modalType === 'techModules' && <th>Tipo</th>}
                                                    {modalType === 'techModules' && <th>Descripción</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalItems.map((item: any) => {
                                                    let isSelected = false;
                                                    if (modalType === 'powers') {
                                                        isSelected = selectedPowers.some(p => p.id === item.id && p.origin === modalOriginFilter);
                                                    } else if (modalType === 'spells') {
                                                        isSelected = selectedSpellsWithRank.some(s => s.id === item.id);
                                                    } else if (modalType === 'techModules') {
                                                        isSelected = techModules.some(m => m.definitionId === item.id);
                                                    }

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => {
                                                                if (modalType === 'powers') togglePowerSelection(item.id);
                                                                else if (modalType === 'spells') toggleSpellSelection(item.id);
                                                                else if (modalType === 'techModules') toggleTechModule(item.id);
                                                            }}
                                                            className={isSelected ? 'selected-row' : ''}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    readOnly
                                                                    style={{ width: '20px', height: '20px' }}
                                                                />
                                                            </td>
                                                            <td className="col-name">{item.name}</td>
                                                            <td className="col-cost">
                                                                {modalType === 'powers' ? item.formula :
                                                                    modalType === 'techModules' ? `${item.cost} PC` :
                                                                        item.cost}
                                                            </td>
                                                            {modalType === 'powers' && (
                                                                <td className="col-types">
                                                                    <div className="table-types">
                                                                        {item.types?.map((t: string) => (
                                                                            <span key={t} className="type-tag tiny">{t}</span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            )}
                                                            {modalType === 'spells' && (
                                                                <td>
                                                                    {item.requirements === "No especificado" ? "-" : item.requirements}
                                                                </td>
                                                            )}
                                                            {modalType === 'techModules' && (
                                                                <>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <span className="type-tag" style={{
                                                                            backgroundColor: item.type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                                            color: item.type === 'Mejora Interna' ? '#be123c' : undefined,
                                                                            borderColor: item.type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                                        }}>
                                                                            {item.type}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ fontSize: '0.9em', color: '#666' }}>{item.description}</td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {modalItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="confirm-button"
                                >
                                    Confirmar Selección
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .pixel-button {
                    padding: 0.75rem 1.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    border: 4px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    cursor: pointer;
                    font-family: var(--font-comic, sans-serif);
                }
                .pixel-button:hover {
                    border-color: rgba(0,0,0,0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                .pixel-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Modal Overlay Styles */
                .wizard-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 1rem;
                }

                .wizard-modal-content {
                    background: white;
                    width: 100%;
                    max-width: 1200px;
                    max-height: 90vh;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 4px solid var(--color-secondary, #000);
                }

                .modal-header {
                    padding: 1rem 1.5rem;
                    background: var(--color-secondary, #000);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-family: var(--font-comic, sans-serif);
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                }

                .modal-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    background: #f5f5f5;
                }

                .modal-footer {
                    padding: 1rem;
                    background: white;
                    border-top: 2px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                }

                .confirm-button {
                    background: #22c55e;
                    color: white;
                    padding: 0.8rem 2rem;
                    border: 2px solid #166534;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 4px 4px 0px #166534;
                    transition: all 0.2s;
                    font-family: var(--font-comic, sans-serif);
                }

                .confirm-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 6px 6px 0px #166534;
                }

                .confirm-button:active {
                    transform: translateY(0);
                    box-shadow: 2px 2px 0px #166534;
                }

                /* PowerList Styles Adapted */
                .controls-section {
                    padding: 1.5rem;
                    background: #fff;
                    border-bottom: 2px solid #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                @media(min-width: 768px) {
                    .controls-section {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                .filters-primary {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex: 1;
                }

                 .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .filter-label {
                    font-weight: bold;
                    font-family: var(--font-comic, sans-serif);
                }

                .type-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .filter-button {
                    padding: 0.4rem 1rem;
                    border: 2px solid var(--color-secondary, #000);
                    background: white;
                    font-family: var(--font-comic, sans-serif);
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .filter-button.active {
                    background: var(--color-secondary, #000);
                    color: white;
                }

                .search-input {
                    padding: 0.6rem 1rem;
                    border: 2px solid var(--color-secondary, #000);
                    border-radius: 8px;
                    width: 100%;
                    max-width: 300px;
                }

                .view-toggles {
                    display: flex;
                    gap: 0.5rem;
                }

                .view-button {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--color-secondary, #000);
                    background: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    border-radius: 8px;
                }

                .view-button.active {
                    background: var(--color-secondary, #000);
                    color: white;
                }

                /* Grid & Card Styles */
                .powers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .power-card {
                    border: 2px solid var(--color-secondary, #000);
                    padding: 1.2rem;
                    background: white;
                    box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .power-card:hover {
                    box-shadow: 6px 6px 0px rgba(0,0,0,0.15);
                    transform: translateY(-2px);
                }

                .power-card.selected {
                    background: #ecfdf5; /* green-50 */
                    border-color: #059669;
                    box-shadow: 6px 6px 0px #059669;
                }

                .selected-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #059669;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }

                .power-card h3 {
                    margin: 0;
                    font-family: var(--font-comic, sans-serif);
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 0.5rem;
                    font-size: 1.1rem;
                    color: var(--color-primary, #000);
                }

                .power-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .power-cost {
                    font-weight: bold;
                    background: #f0f0f0;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                    align-self: flex-start;
                    font-size: 0.85rem;
                }

                .power-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                }

                .type-tag, .origin-tag {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    border: 1px solid #ccc;
                    background: #eee;
                }

                .type-tag {
                    background: #e3f2fd;
                    border-color: #90caf9;
                    color: #1565c0;
                }

                /* Table Styles */
                .powers-table-wrapper {
                    border: 2px solid var(--color-secondary, #000);
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                }

                .powers-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .powers-table th {
                    background: var(--color-secondary, #000);
                    color: white;
                    padding: 0.8rem;
                    text-align: left;
                    font-family: var(--font-comic, sans-serif);
                }

                .powers-table td {
                    padding: 0.8rem;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                }

                .powers-table tr:hover {
                    background: #f9f9f9;
                }

                .selected-row {
                    background: #ecfdf5 !important;
                }

                .col-name {
                    font-weight: bold;
                }

                .col-cost {
                    font-family: var(--font-mono, monospace);
                }
            `}</style>
        </div >
    );
}
