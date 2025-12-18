import React from 'react';

interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step4_GeneralSkills({ data, onChange }: Step4Props) {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-600 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">🎯 Habilidades Generales</h3>
                <p className="text-sm text-gray-700">
                    Las habilidades generales son capacidades básicas que todos los personajes poseen.
                    Algunas se calculan automáticamente basándose en los atributos.
                </p>
            </div>

            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                <p className="text-2xl font-bold mb-4">🚧 En Desarrollo</p>
                <p className="text-gray-600 mb-4">
                    Este paso incluirá:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
                    <li>• Acechar/Discrección</li>
                    <li>• Combate cuerpo a cuerpo</li>
                    <li>• Conocimientos generales</li>
                    <li>• Esconderse</li>
                    <li>• Idea / Influencia</li>
                    <li>• Idioma nativo</li>
                    <li>• Y más...</li>
                </ul>
                <p className="text-sm text-blue-600 font-bold mt-4">
                    Con opción de auto-cálculo basado en atributos
                </p>
            </div>
        </div>
    );
}
