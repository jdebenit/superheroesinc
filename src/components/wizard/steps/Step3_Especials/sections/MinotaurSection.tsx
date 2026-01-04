import React from 'react';
import { ORIGIN_CATEGORIES } from '../../../../../data/originDefinitions';

export default function MinotaurSection() {
    const arcano = ORIGIN_CATEGORIES['Arcano'];
    const minotauroEffects = arcano?.subtypes?.['Minotauro'] || [];
    const arcanoEffects = arcano?.defaultEffects || [];

    return (
        <div className="bg-amber-50 border-4 border-amber-900 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
            <div className="p-4 border-b-4 border-amber-900 bg-amber-100 flex items-center gap-3">
                <h3 className="text-xl font-black text-amber-900 uppercase italic font-comic">
                    Rasgos de Minotauro
                </h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="bg-white border-2 border-amber-200 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-amber-800 mb-2 uppercase text-sm border-b border-amber-100 pb-1">Rasgo Físico Distintivo</h4>
                    <p className="text-gray-800 font-bold text-lg">Tienes cuernos que actuan como arma blanca, se puede adquirir la habilidad de arma especial para usarlos o usarlo directamente con la maniobra de Embestida.</p>
                </div>

                <div className="bg-white border-2 border-amber-200 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-amber-800 mb-2 uppercase text-sm border-b border-amber-100 pb-1">Efectos Pasivos (Arcano / Minotauro)</h4>
                    <ul className="list-none space-y-2 text-gray-700">
                        {arcanoEffects.map((effect: string, idx: number) => (
                            <li key={`arc-${idx}`} className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">Proof</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                        {minotauroEffects.map((effect: string, idx: number) => (
                            <li key={`min-${idx}`} className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">⚡</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
