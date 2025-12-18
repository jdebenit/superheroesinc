import React from 'react';

interface Step6Props {
    data: {
        specialskills: { items: any[] };
        equipment: { items: any[] };
    };
    onChange: (updates: any) => void;
}

export default function Step6_SpecialSkills({ data, onChange }: Step6Props) {
    const addSpecialSkill = () => {
        onChange({
            specialskills: {
                items: [...data.specialskills.items, { name: "Nueva habilidad", value: "0%" }]
            }
        });
    };

    const updateSpecialSkill = (index: number, field: string, value: string) => {
        const newItems = [...data.specialskills.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ specialskills: { items: newItems } });
    };

    const removeSpecialSkill = (index: number) => {
        const newItems = [...data.specialskills.items];
        newItems.splice(index, 1);
        onChange({ specialskills: { items: newItems } });
    };

    const addEquipment = () => {
        onChange({
            equipment: {
                items: [...data.equipment.items, { name: "Nuevo equipo", notes: "" }]
            }
        });
    };

    const updateEquipment = (index: number, field: string, value: string) => {
        const newItems = [...data.equipment.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ equipment: { items: newItems } });
    };

    const removeEquipment = (index: number) => {
        const newItems = [...data.equipment.items];
        newItems.splice(index, 1);
        onChange({ equipment: { items: newItems } });
    };

    return (
        <div className="space-y-8">
            <div className="bg-orange-50 border-2 border-orange-600 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">⚔️ Habilidades Especiales y Equipo</h3>
                <p className="text-sm text-gray-700">
                    Añade habilidades especializadas y el equipo que porta tu personaje.
                </p>
            </div>

            {/* Habilidades Especiales */}
            <div>
                <h3 className="font-bold text-xl mb-4 bg-purple-200 inline-block px-3 py-1">Habilidades Especiales</h3>
                <div className="space-y-3">
                    {data.specialskills.items.map((skill, index) => (
                        <div key={index} className="flex gap-2 border-b pb-2">
                            <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateSpecialSkill(index, 'name', e.target.value)}
                                placeholder="Nombre"
                                className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="text"
                                value={skill.value || ''}
                                onChange={(e) => updateSpecialSkill(index, 'value', e.target.value)}
                                placeholder="Valor %"
                                className="w-32 p-2 border border-gray-300 rounded"
                            />
                            <button
                                onClick={() => removeSpecialSkill(index)}
                                className="bg-red-600 text-white font-bold px-3 rounded hover:bg-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addSpecialSkill}
                        className="w-full py-2 border-2 border-dashed border-gray-400 rounded font-bold text-gray-600 hover:bg-gray-50"
                    >
                        + Añadir Habilidad Especial
                    </button>
                </div>
            </div>

            {/* Equipo */}
            <div>
                <h3 className="font-bold text-xl mb-4 bg-yellow-200 inline-block px-3 py-1">Equipo</h3>
                <div className="space-y-3">
                    {data.equipment.items.map((item, index) => (
                        <div key={index} className="flex gap-2 border-b pb-2">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                                placeholder="Nombre del equipo"
                                className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => updateEquipment(index, 'notes', e.target.value)}
                                placeholder="Notas/Descripción"
                                className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <button
                                onClick={() => removeEquipment(index)}
                                className="bg-red-600 text-white font-bold px-3 rounded hover:bg-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addEquipment}
                        className="w-full py-2 border-2 border-dashed border-gray-400 rounded font-bold text-gray-600 hover:bg-gray-50"
                    >
                        + Añadir Equipo
                    </button>
                </div>
            </div>
        </div>
    );
}
