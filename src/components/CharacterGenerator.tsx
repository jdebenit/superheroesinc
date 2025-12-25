import React, { useState, useEffect } from 'react';
import { ORIGIN_CATEGORIES, type OriginCategory } from '../data/originDefinitions';

// Interfaces based on the schema
interface SimpleItem {
    name: string;
    value?: string;
    math?: string;
    notes?: string;
}

interface CharacterState {
    name: string;
    totalCost: string;
    level: number;
    origin: { items: { [key: string]: string[] }[] };
    combatstats: string[];
    otherstats: string[];
    attributes: { values: { [key: string]: number } };
    skills: { items: SimpleItem[] };
    specialskills: { items: SimpleItem[] };
    background: { items: string[] };
    equipment: { items: SimpleItem[] };
}

const initialCharacterState: CharacterState = {
    name: "Nuevo Personaje",
    totalCost: "50+0",
    level: 1,
    origin: { items: [] },
    combatstats: [
        "Acciones por asalto: 2",
        "Iniciativa y Reflejos: 30",
        "Puntos de Vida: 40",
        "Equilibrio Mental: 40"
    ],
    otherstats: [
        "Inconsciencia: 4",
        "Recuperación: 2 PV/h",
        "Daño absorbido físico: 0",
        "Daño absorbido mental: 0",
        "Modificador de fuerza: 1d100",
        "Peso Levantado: 100kg",
        "Modificador de impacto: 0",
        "Modificador Psionico: 0",
        "Parada Fisica: 15",
        "Parada mental: 30",
        "Salto (alto / largo): 2m/4m"
    ],
    attributes: {
        values: {
            "Fuerza": 50,
            "Constitución": 50,
            "Agilidad": 50,
            "Inteligencia": 50,
            "Percepción": 50,
            "Apariencia": 50,
            "Voluntad": 50
        }
    },
    skills: { items: [] },
    specialskills: { items: [] },
    background: { items: [] },
    equipment: { items: [] }
};

export default function CharacterGenerator() {
    const [character, setCharacter] = useState<CharacterState>(initialCharacterState);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedSubtype, setSelectedSubtype] = useState<string>("");


    const updateField = (field: keyof CharacterState, value: any) => {
        setCharacter(prev => ({ ...prev, [field]: value }));
    };

    const updateAttribute = (attr: string, value: number) => {
        setCharacter(prev => ({
            ...prev,
            attributes: {
                values: {
                    ...prev.attributes.values,
                    [attr]: value
                }
            }
        }));
    };

    // Helper to add item to lists
    const addItem = (section: 'skills' | 'specialskills' | 'equipment') => {
        const newItem: SimpleItem = { name: "Nuevo Item", value: "0%" };
        if (section === 'equipment') {
            newItem.notes = "";
            delete newItem.value;
        }
        setCharacter(prev => ({
            ...prev,
            [section]: { items: [...prev[section].items, newItem] }
        }));
    };

    const updateItem = (section: 'skills' | 'specialskills' | 'equipment', index: number, field: keyof SimpleItem, value: string) => {
        setCharacter(prev => {
            const newItems = [...prev[section].items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, [section]: { items: newItems } };
        });
    };

    const removeItem = (section: 'skills' | 'specialskills' | 'equipment', index: number) => {
        setCharacter(prev => {
            const newItems = [...prev[section].items];
            newItems.splice(index, 1);
            return { ...prev, [section]: { items: newItems } };
        })
    }

    // Helper for string arrays (combatstats, otherstats, background)
    const updateStringArray = (section: 'combatstats' | 'otherstats' | 'background', index: number, value: string) => {
        setCharacter(prev => {
            const newArr = section === 'background' ? [...prev.background.items] : [...prev[section] as string[]];
            newArr[index] = value;
            if (section === 'background') return { ...prev, background: { items: newArr } };
            return { ...prev, [section]: newArr };
        });
    };

    const addStringItem = (section: 'combatstats' | 'otherstats' | 'background') => {
        setCharacter(prev => {
            const newArr = section === 'background' ? [...prev.background.items, "Nuevo dato"] : [...prev[section] as string[], "Nuevo dato"];
            if (section === 'background') return { ...prev, background: { items: newArr } };
            return { ...prev, [section]: newArr };
        });
    }
    const removeStringItem = (section: 'combatstats' | 'otherstats' | 'background', index: number) => {
        setCharacter(prev => {
            const newArr = section === 'background' ? [...prev.background.items] : [...prev[section] as string[]];
            newArr.splice(index, 1);
            if (section === 'background') return { ...prev, background: { items: newArr } };
            return { ...prev, [section]: newArr };
        });
    }


    // Origin Helpers
    const addOrigin = (originName: string) => {
        const items = [originName]; // Just add the name initially with empty effects
        setCharacter(prev => ({
            ...prev,
            origin: {
                items: [...prev.origin.items, { [originName]: items }]
            }
        }));
    };

    const addOriginFromCategory = () => {
        if (!selectedCategory) return;

        const category = ORIGIN_CATEGORIES[selectedCategory];
        let originName = selectedCategory;
        let effects: string[] = [];

        if (category.subtypes && selectedSubtype) {
            // Use subtype name and its effects
            originName = selectedSubtype;
            effects = [...category.subtypes[selectedSubtype]];
        } else if (category.defaultEffects) {
            // Use category name with default effects
            effects = [...category.defaultEffects];
        } else {
            // No subtype selected but category requires one
            alert("Por favor selecciona un subtipo primero");
            return;
        }

        setCharacter(prev => ({
            ...prev,
            origin: {
                items: [...prev.origin.items, { [originName]: effects }]
            }
        }));

        // Reset selections
        setSelectedCategory("");
        setSelectedSubtype("");
    };


    const removeOrigin = (index: number) => {
        setCharacter(prev => {
            const newItems = [...prev.origin.items];
            newItems.splice(index, 1);
            return { ...prev, origin: { items: newItems } };
        });
    };

    const updateOriginItem = (originIndex: number, itemIndex: number, val: string) => {
        setCharacter(prev => {
            const newOrigins = [...prev.origin.items];
            const originKey = Object.keys(newOrigins[originIndex])[0];
            const newItems = [...newOrigins[originIndex][originKey]];
            newItems[itemIndex] = val;
            newOrigins[originIndex] = { [originKey]: newItems };
            return { ...prev, origin: { items: newOrigins } };
        });
    }

    const addOriginDetail = (originIndex: number) => {
        setCharacter(prev => {
            const newOrigins = [...prev.origin.items];
            const originKey = Object.keys(newOrigins[originIndex])[0];
            const newItems = [...newOrigins[originIndex][originKey], "Nuevo detalle"];
            newOrigins[originIndex] = { [originKey]: newItems };
            return { ...prev, origin: { items: newOrigins } };
        });
    }

    const removeOriginDetail = (originIndex: number, itemIndex: number) => {
        setCharacter(prev => {
            const newOrigins = [...prev.origin.items];
            const originKey = Object.keys(newOrigins[originIndex])[0];
            const newItems = [...newOrigins[originIndex][originKey]];
            newItems.splice(itemIndex, 1);
            newOrigins[originIndex] = { [originKey]: newItems };
            return { ...prev, origin: { items: newOrigins } };
        });
    }


    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(character, null, 2));
        alert("JSON copiado al portapapeles!");
    };

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${character.name.toLowerCase().replace(/\s+/g, '-')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    return (
        <div className="character-generator flex flex-col md:flex-row gap-6 p-4">
            {/* Left Column: Form */}
            <div className="form-section w-full md:w-2/3 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <h2 className="text-3xl font-black mb-6 uppercase border-b-4 border-black pb-2">Generador de Personaje</h2>

                <div className="tabs flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['basic', 'stats', 'skills', 'background'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-bold border-2 border-black transition-all ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {activeTab === 'basic' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold mb-1">Nombre</label>
                            <input type="text" value={character.name} onChange={(e) => updateField('name', e.target.value)} className="w-full p-2 border-2 border-black font-comic" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold mb-1">Coste Total</label>
                                <input type="text" value={character.totalCost} onChange={(e) => updateField('totalCost', e.target.value)} className="w-full p-2 border-2 border-black font-comic" />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Nivel</label>
                                <input type="number" value={character.level} onChange={(e) => updateField('level', parseInt(e.target.value))} className="w-full p-2 border-2 border-black font-comic" />
                            </div>
                        </div>


                        <div>
                            <h3 className="font-bold text-xl mt-6 mb-2 bg-blue-600 text-white p-1 inline-block transform rotate-1">Orígenes</h3>
                            <div className="mb-4 p-4 border-2 border-dashed border-gray-400 bg-gray-50">
                                <label className="block font-bold text-sm mb-2">Seleccionar Categoría de Origen</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSelectedSubtype(""); // Reset subtype when category changes
                                    }}
                                    className="w-full p-2 border-2 border-black mb-3"
                                >
                                    <option value="">-- Seleccionar Categoría --</option>
                                    {Object.keys(ORIGIN_CATEGORIES).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>

                                {/* Show subtype selector if category has subtypes */}
                                {selectedCategory && ORIGIN_CATEGORIES[selectedCategory].subtypes && (
                                    <>
                                        <label className="block font-bold text-sm mb-2 mt-3">Seleccionar Subtipo</label>
                                        <select
                                            value={selectedSubtype}
                                            onChange={(e) => setSelectedSubtype(e.target.value)}
                                            className="w-full p-2 border-2 border-black mb-3"
                                        >
                                            <option value="">-- Seleccionar Subtipo --</option>
                                            {Object.keys(ORIGIN_CATEGORIES[selectedCategory].subtypes!).map(subtype => (
                                                <option key={subtype} value={subtype}>{subtype}</option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                <button
                                    onClick={addOriginFromCategory}
                                    disabled={!selectedCategory}
                                    className={`w-full py-2 px-4 font-bold ${selectedCategory ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    + Añadir Origen
                                </button>
                            </div>

                            <div className="space-y-4">
                                {character.origin.items.map((originObj, i) => {
                                    const name = Object.keys(originObj)[0];
                                    const details = originObj[name];
                                    return (
                                        <div key={i} className="border-2 border-black p-3 relative bg-white">
                                            <div className="flex justify-between items-center mb-2 border-b-2 border-gray-200 pb-1">
                                                <h4 className="font-bold text-lg">{name}</h4>
                                                <button onClick={() => removeOrigin(i)} className="text-red-600 font-bold hover:bg-red-100 px-2 rounded">Eliminar</button>
                                            </div>
                                            <div className="space-y-2 pl-2">
                                                {details.map((detail, j) => (
                                                    <div key={j} className="flex gap-2">
                                                        <input
                                                            value={detail}
                                                            onChange={(e) => updateOriginItem(i, j, e.target.value)}
                                                            className="w-full p-1 border border-gray-300 text-sm"
                                                        />
                                                        <button onClick={() => removeOriginDetail(i, j)} className="text-red-500 font-bold px-1">x</button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addOriginDetail(i)} className="text-xs font-bold text-blue-600 hover:underline">+ Añadir Efecto</button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {character.origin.items.length === 0 && <p className="text-gray-500 italic">No se han seleccionado orígenes.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-xl mb-4 bg-black text-white p-1 inline-block transform -rotate-1">Atributos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(character.attributes.values).map(([key, val]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-bold mb-1">{key}</label>
                                        <input type="number" value={val} onChange={(e) => updateAttribute(key, parseInt(e.target.value))} className="w-full p-2 border-2 border-black" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl mb-2 mt-4">Estadísticas de Combate</h3>
                            {character.combatstats.map((stat, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" value={stat} onChange={(e) => updateStringArray('combatstats', i, e.target.value)} className="w-full p-2 border border-gray-300" />
                                    <button onClick={() => removeStringItem('combatstats', i)} className="text-red-500 font-bold px-2">X</button>
                                </div>
                            ))}
                            <button onClick={() => addStringItem('combatstats')} className="bg-gray-200 px-3 py-1 font-bold text-sm">+ Añadir</button>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl mb-2 mt-4">Otras Estadísticas</h3>
                            {character.otherstats.map((stat, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" value={stat} onChange={(e) => updateStringArray('otherstats', i, e.target.value)} className="w-full p-2 border border-gray-300" />
                                    <button onClick={() => removeStringItem('otherstats', i)} className="text-red-500 font-bold px-2">X</button>
                                </div>
                            ))}
                            <button onClick={() => addStringItem('otherstats')} className="bg-gray-200 px-3 py-1 font-bold text-sm">+ Añadir</button>
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-xl mb-2 bg-yellow-300 p-1 inline-block">Habilidades</h3>
                            <div className="space-y-2">
                                {character.skills.items.map((skill, i) => (
                                    <div key={i} className="flex flex-col md:flex-row gap-2 border-b pb-2">
                                        <input placeholder="Nombre" value={skill.name} onChange={(e) => updateItem('skills', i, 'name', e.target.value)} className="flex-1 p-2 border border-gray-300" />
                                        <input placeholder="Fórmula (ej: INT/2)" value={skill.math || ''} onChange={(e) => updateItem('skills', i, 'math', e.target.value)} className="w-32 p-2 border border-gray-300" />
                                        <input placeholder="Valor (ej: 45%)" value={skill.value || ''} onChange={(e) => updateItem('skills', i, 'value', e.target.value)} className="w-24 p-2 border border-gray-300" />
                                        <button onClick={() => removeItem('skills', i)} className="text-red-500 font-bold px-2">X</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addItem('skills')} className="mt-2 bg-black text-white px-4 py-2 font-bold hover:bg-gray-800">+ Nueva Habilidad</button>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl mb-2 bg-purple-300 p-1 inline-block">Habilidades de Aprendizaje</h3>
                            <div className="space-y-2">
                                {character.specialskills.items.map((skill, i) => (
                                    <div key={i} className="flex gap-2 border-b pb-2">
                                        <input placeholder="Nombre" value={skill.name} onChange={(e) => updateItem('specialskills', i, 'name', e.target.value)} className="flex-1 p-2 border border-gray-300" />
                                        <input placeholder="Valor" value={skill.value || ''} onChange={(e) => updateItem('specialskills', i, 'value', e.target.value)} className="w-32 p-2 border border-gray-300" />
                                        <button onClick={() => removeItem('specialskills', i)} className="text-red-500 font-bold px-2">X</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addItem('specialskills')} className="mt-2 bg-black text-white px-4 py-2 font-bold hover:bg-gray-800">+ Nueva Especial</button>
                        </div>
                    </div>
                )}

                {activeTab === 'background' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-xl mb-2">Trasfondo</h3>
                            {character.background.items.map((bg, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" value={bg} onChange={(e) => updateStringArray('background', i, e.target.value)} className="w-full p-2 border border-gray-300" />
                                    <button onClick={() => removeStringItem('background', i)} className="text-red-500 font-bold px-2">X</button>
                                </div>
                            ))}
                            <button onClick={() => addStringItem('background')} className="bg-gray-200 px-3 py-1 font-bold text-sm">+ Añadir</button>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl mb-2">Equipo</h3>
                            <div className="space-y-2">
                                {character.equipment.items.map((item, i) => (
                                    <div key={i} className="flex gap-2 border-b pb-2">
                                        <input placeholder="Nombre" value={item.name} onChange={(e) => updateItem('equipment', i, 'name', e.target.value)} className="flex-1 p-2 border border-gray-300" />
                                        <input placeholder="Notas" value={item.notes || ''} onChange={(e) => updateItem('equipment', i, 'notes', e.target.value)} className="flex-1 p-2 border border-gray-300" />
                                        <button onClick={() => removeItem('equipment', i)} className="text-red-500 font-bold px-2">X</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addItem('equipment')} className="mt-2 bg-black text-white px-4 py-2 font-bold hover:bg-gray-800">+ Nuevo Equipo</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Preview */}
            <div className="preview-section w-full md:w-1/3">
                <div className="sticky top-4 bg-gray-900 text-green-400 p-4 rounded-lg shadow-xl font-mono text-xs overflow-auto max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4 border-b border-green-800 pb-2">
                        <span className="font-bold">LIVE JSON PREVIEW</span>
                        <div className="space-x-2">
                            <button onClick={copyToClipboard} className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded">COPIAR</button>
                            <button onClick={downloadJson} className="bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded">DESCARGAR</button>
                        </div>
                    </div>
                    <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(character, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
