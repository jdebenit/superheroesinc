import React from 'react';

interface Step5Props {
    data: {
        background: { items: string[] };
    };
    onChange: (updates: any) => void;
}

export default function Step5_Background({ data, onChange }: Step5Props) {
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

    return (
        <div className="space-y-6">
            <div className="bg-indigo-50 border-2 border-indigo-600 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">📖 Trasfondo del Personaje</h3>
                <p className="text-sm text-gray-700">
                    Define la historia y contexto de tu personaje. ¿Qué hacía antes? ¿Cómo vive?
                </p>
            </div>

            <div className="space-y-4">
                {data.background.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => updateBackgroundItem(index, e.target.value)}
                            className="flex-1 p-3 border-2 border-gray-300 rounded"
                            placeholder="Ej: Trabajo medio/bajo: mecánico"
                        />
                        <button
                            onClick={() => removeBackgroundItem(index)}
                            className="bg-red-600 text-white font-bold px-4 rounded hover:bg-red-700"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                <button
                    onClick={addBackgroundItem}
                    className="w-full py-3 border-2 border-dashed border-gray-400 rounded font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                    + Añadir Elemento de Trasfondo
                </button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
                <p className="font-bold mb-2">💡 Ejemplos de trasfondo:</p>
                <ul className="space-y-1 ml-4">
                    <li>• Trabajo alto: Ejecutivo de empresa</li>
                    <li>• Trabajo medio: Profesor universitario</li>
                    <li>• Trabajo bajo: Taxista</li>
                    <li>• Solitario / Sociable</li>
                    <li>• Familia numerosa / Huérfano</li>
                </ul>
            </div>
        </div>
    );
}
