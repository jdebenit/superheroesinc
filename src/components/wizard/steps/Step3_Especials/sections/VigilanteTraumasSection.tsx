import React from 'react';

interface VigilanteTraumasSectionProps {
    vigilanteSpecialties: string[];
    traumas: Record<string, string>;
    onUpdateTrauma: (specialty: string, text: string) => void;
}

export default function VigilanteTraumasSection({
    vigilanteSpecialties,
    traumas,
    onUpdateTrauma
}: VigilanteTraumasSectionProps) {
    if (vigilanteSpecialties.length === 0) return null;

    return (
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
                                value={traumas?.[specialty] || ''}
                                onChange={(e) => onUpdateTrauma(specialty, e.target.value)}
                                placeholder={`Describe el trauma que te convirtió en ${specialty}...`}
                                className="w-full h-32 p-4 border-2 border-red-200 rounded-lg focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 resize-y font-comic text-gray-700 text-lg leading-relaxed placeholder-red-200 block"
                                style={{ minWidth: '100%', maxWidth: '100%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
