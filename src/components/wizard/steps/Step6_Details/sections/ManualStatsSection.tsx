import React from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';
import { InfoBox } from '../../../shared/ui/InfoBox';
import { StatItem } from '../../../shared/ui/StatItem';

interface ManualStatsSectionProps {
    combatstats?: Record<string, any>;
    otherstats?: Record<string, any>;
    unlockCombatStats: boolean;
    setUnlockCombatStats: (val: boolean) => void;
    unlockOtherStats: boolean;
    setUnlockOtherStats: (val: boolean) => void;
    updateCombatStat: (field: string, value: string) => void;
    updateOtherStat: (field: string, value: string) => void;
}

export function ManualStatsSection({
    combatstats,
    otherstats,
    unlockCombatStats,
    setUnlockCombatStats,
    unlockOtherStats,
    setUnlockOtherStats,
    updateCombatStat,
    updateOtherStat
}: ManualStatsSectionProps) {
    return (
        <>
            <WizardSection title="Estadísticas de Combate">
                <div className="wizard-unlock-container" style={{ marginBottom: '1rem' }}>
                    <div className="wizard-unlock-header">
                        <label className="wizard-unlock-label">
                            <input
                                type="checkbox"
                                checked={unlockCombatStats}
                                onChange={(e) => setUnlockCombatStats(e.target.checked)}
                                className="wizard-unlock-checkbox"
                            />
                            🔓 Desbloquear Combate (Libre)
                        </label>
                        <span className="wizard-unlock-badge">Avanzado</span>
                    </div>
                </div>

                <div className="step6-margin-bottom">
                    <InfoBox variant="info" icon={unlockCombatStats ? "✏️" : "🔒"}>
                        {unlockCombatStats
                            ? "Modo manual activado para combate. Los valores no se recalcularán automáticamente."
                            : "Calculadas automáticamente a partir de tus características — no son editables."
                        }
                    </InfoBox>
                </div>
                <div className="step6-combat-stats-grid">
                    {combatstats && Object.entries(combatstats).map(([label, val], index) => {
                        if (unlockCombatStats) {
                            const inputValue = (val && typeof val === 'object')
                                ? (val.personalizado !== undefined && val.personalizado !== null
                                    ? String(val.personalizado)
                                    : String(val.total ?? ''))
                                : String(val ?? '');

                            return (
                                <WizardField
                                    key={label}
                                    label={label}
                                    value={inputValue}
                                    onChange={(newVal) => updateCombatStat(label, newVal)}
                                    noMargin
                                    className="step6-manual-stat-field"
                                />
                            );
                        }

                        const displayVal = (val && typeof val === 'object')
                            ? (val.personalizado !== undefined && val.personalizado !== null && String(val.personalizado).trim() !== ''
                                ? String(val.personalizado)
                                : String(val.total ?? '-'))
                            : String(val || '-');

                        return (
                            <StatItem key={index} label={label} value={displayVal} theme="red" />
                        );
                    })}
                </div>
            </WizardSection>

            <WizardSection title="Otras Estadísticas">
                <div className="wizard-unlock-container" style={{ marginBottom: '1rem' }}>
                    <div className="wizard-unlock-header">
                        <label className="wizard-unlock-label">
                            <input
                                type="checkbox"
                                checked={unlockOtherStats}
                                onChange={(e) => setUnlockOtherStats(e.target.checked)}
                                className="wizard-unlock-checkbox"
                            />
                            🔓 Desbloquear Otros (Libre)
                        </label>
                        <span className="wizard-unlock-badge">Avanzado</span>
                    </div>
                </div>

                <div className="step6-margin-bottom">
                    <InfoBox variant="info" icon={unlockOtherStats ? "✏️" : "🔒"}>
                        {unlockOtherStats
                            ? "Modo manual activado para estadísticas secundarias. Los valores no se recalcularán automáticamente."
                            : "Calculadas automáticamente a partir de tus características — no son editables."
                        }
                    </InfoBox>
                </div>

                <div className="step6-other-stats-container">
                    {otherstats && Object.entries(otherstats).map(([label, val], index) => {
                        const isEven = index % 2 === 0;

                        if (unlockOtherStats) {
                            const inputValue = (val && typeof val === 'object')
                                ? (val.personalizado !== undefined && val.personalizado !== null
                                    ? String(val.personalizado)
                                    : String(val.total ?? ''))
                                : String(val ?? '');

                            return (
                                <div key={label} className="step6-manual-other-row">
                                    <WizardField
                                        label={label}
                                        value={inputValue}
                                        onChange={(newVal) => updateOtherStat(label, newVal)}
                                        noMargin
                                        inputWidth="100%"
                                    />
                                </div>
                            );
                        }

                        const displayVal = (val && typeof val === 'object')
                            ? (val.personalizado !== undefined && val.personalizado !== null && String(val.personalizado).trim() !== ''
                                ? String(val.personalizado)
                                : String(val.total ?? '-'))
                            : (val || '-');

                        return (
                            <div key={index} className={`step6-other-stat-row ${isEven ? 'even' : 'odd'}`}>
                                <span className="step6-other-stat-label">{label}</span>
                                <span className="step6-other-stat-value">{displayVal}</span>
                            </div>
                        );
                    })}
                </div>
            </WizardSection>
        </>
    );
}
