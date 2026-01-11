import React from 'react';
import { MAGICAL_BONDS } from '../../../data/magicalBonds';

interface MagicalBondsSectionProps {
    character: any;
}

export const MagicalBondsSection: React.FC<MagicalBondsSectionProps> = ({ character }) => {
    if (!character.magicalBonds?.length && !character.magicalBondsCustomName && !character.magicalBondsCustom) return null;

    return (
        <div className="sheet-section magical-bonds">
            <div className="section-header">
                <h4>Vinculaciones Mágicas</h4>
            </div>
            <ul className="clean-list">
                {character.magicalBonds?.map((bondId: string, idx: number) => {
                    const bond = MAGICAL_BONDS.find(b => b.id === bondId);
                    if (!bond) return null;
                    return (
                        <li key={bondId} className="magical-bond-item">
                            <span className="magical-bond-title">{bond.name}</span>
                            <span className="magical-bond-desc">
                                {bond.description}
                            </span>
                        </li>
                    );
                })}
                {/* New Custom Bond Structure */}
                {character.magicalBondsCustomName && (
                    <li className="magical-bond-item">
                        <span className="magical-bond-title">
                            {character.magicalBondsCustomName} <span className="text-xs-gray">(Personalizada)</span>
                        </span>
                        <span className="magical-bond-desc">
                            {character.magicalBondsCustomDescription}
                        </span>
                    </li>
                )}
                {/* Legacy Custom Bond (Fallback) */}
                {!character.magicalBondsCustomName && character.magicalBondsCustom && (
                    <li className="magical-bond-item" style={{ marginTop: '0.5rem' }}>
                        <span className="magical-bond-title">Vinculación Personalizada</span>
                        <span className="magical-bond-desc-italic">
                            "{character.magicalBondsCustom}"
                        </span>
                    </li>
                )}
            </ul>
        </div>
    );
};
