import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import UnifiedRollModal from './UnifiedRollModal';

interface PrejudiceResistancePanelProps {
    otherstats?: string[];
    background?: {
        prejudiceResistance?: number;
        [key: string]: any;
    };
}

export default function PrejudiceResistancePanel({ otherstats, background }: PrejudiceResistancePanelProps) {
    const [showRollModal, setShowRollModal] = useState(false);

    // Extract prejudice resistance value from background or otherstats
    const getPrejudiceResistance = (): number => {
        // First try to get it from background (primary source)
        if (background?.prejudiceResistance !== undefined) {
            return background.prejudiceResistance;
        }

        // Fallback to otherstats (calculated value)
        if (otherstats) {
            const resistanceStat = otherstats.find(s =>
                s.toLowerCase().includes('resistencia a prejuicios')
            );

            if (resistanceStat) {
                // Extract the percentage value (e.g., "Resistencia a prejuicios: 100%" -> 100)
                const match = resistanceStat.match(/(\d+)%/);
                if (match) return parseInt(match[1]);
            }
        }

        return 0;
    };

    const resistanceValue = getPrejudiceResistance();

    // Don't render if no resistance value
    if (resistanceValue === 0) return null;

    return (
        <div className="terminal-section">
            <h3 className="terminal-section-title">RESISTENCIA A PREJUICIOS</h3>
            <div className="attributes-grid">
                <div
                    className="attribute-card clickable"
                    onClick={() => setShowRollModal(true)}
                >
                    <div className="attribute-label">RESISTENCIA</div>
                    <div className="attribute-value">{resistanceValue}%</div>
                </div>
            </div>

            {showRollModal && (
                <UnifiedRollModal
                    isOpen={showRollModal}
                    onClose={() => setShowRollModal(false)}
                    title="Resistencia a prejuicios"
                    targetValue={resistanceValue}
                    initialMode="basic"
                    skillType="cac"
                />
            )}
        </div>
    );
}
