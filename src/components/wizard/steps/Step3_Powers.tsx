import React from 'react';

interface Step3Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step3_Powers({ data, onChange }: Step3Props) {
    return (
        <div className="space-y-6">
            <div className="bg-purple-50 border-2 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">🌟 Poderes, Magia y Tecnología</h3>
                <p className="text-sm text-gray-700">
                    Aquí definirás los poderes especiales, hechizos o tecnología que posee tu personaje.
                    Esta sección varía según tu origen.
                </p>
            </div>

            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                <p className="text-2xl font-bold mb-4">🚧 En Desarrollo</p>
                <p className="text-gray-600">
                    Este paso será completado según los orígenes seleccionados
                </p>
                <ul className="text-left max-w-md mx-auto mt-4 space-y-2 text-sm text-gray-600">
                    <li>• <strong>Arcano:</strong> Selección de hechizos</li>
                    <li>• <strong>Tecnológico:</strong> Tech-modules y dispositivos</li>
                    <li>• <strong>Otros:</strong> Superpoderes y habilidades especiales</li>
                    <li>• <strong>Vigilante:</strong> Este paso se salta automáticamente</li>
                </ul>
            </div>
        </div>
    );
}
