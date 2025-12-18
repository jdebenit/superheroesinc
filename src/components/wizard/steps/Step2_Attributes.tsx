import React from 'react';

interface Step2Props {
    data: {
        name: string;
        level: number;
        totalCost: string;
        attributes: { values: { [key: string]: number } };
    };
    onChange: (updates: any) => void;
}

export default function Step2_Attributes({ data, onChange }: Step2Props) {
    const updateAttribute = (attr: string, value: number) => {
        onChange({
            attributes: {
                values: {
                    ...data.attributes.values,
                    [attr]: value
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-600 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">⚡ Atributos del Personaje</h3>
                <p className="text-sm text-gray-700">
                    Define las características base de tu personaje. Estos valores determinarán sus capacidades.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block font-bold mb-1">Nombre del Personaje</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        className="w-full p-3 border-2 border-black rounded font-bold text-lg"
                        placeholder="Ej: El Invencible"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold mb-1">Nivel</label>
                        <input
                            type="number"
                            value={data.level}
                            onChange={(e) => onChange({ level: parseInt(e.target.value) || 1 })}
                            className="w-full p-3 border-2 border-black rounded"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Coste Total</label>
                        <input
                            type="text"
                            value={data.totalCost}
                            onChange={(e) => onChange({ totalCost: e.target.value })}
                            className="w-full p-3 border-2 border-black rounded"
                            placeholder="50+0"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000]">
                <h3 className="font-bold text-2xl mb-4 uppercase border-b-2 border-black pb-2">
                    Atributos Principales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data.attributes.values).map(([attr, value]) => (
                        <div key={attr} className="space-y-2">
                            <label className="block font-bold text-lg">{attr}</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => updateAttribute(attr, parseInt(e.target.value) || 0)}
                                className="w-full p-3 border-2 border-gray-400 rounded text-center text-2xl font-bold"
                                min="0"
                                max="999"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
                <p><strong>💡 Consejo:</strong> Los valores típicos van de 30-70 para humanos normales, 70-100 para superhéroes, y más de 100 para seres poderosos.</p>
            </div>
        </div>
    );
}
