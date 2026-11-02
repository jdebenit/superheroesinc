import { useState } from 'react';
import CharacterSheet from '../../../character/CharacterSheet';
import { STEPS } from '../../../../data/wizardConfig';
import { APP_VERSIONS } from '../../../../data/appVersions';
import type { CharacterData } from '../../../../types/character';
import type { ToastType } from './WizardDialogs';

interface WizardHeaderProps {
    currentStep: number;
    character: CharacterData;
    totalPCs: number;
    onStepClick: (stepId: number) => void;
    onImportJSON: () => void;
    onReset: () => void;
    onShowToast: (message: string, type?: ToastType) => void;
}

export function WizardHeader({
    currentStep,
    character,
    totalPCs,
    onStepClick,
    onImportJSON,
    onReset,
    onShowToast
}: WizardHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* ── TOP BAR ─────────────────────────────── */}
            <div className="wizard-topbar">
                <div
                    className="wizard-topbar-brand"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    role="button"
                    tabIndex={0}
                >
                    <span className="wizard-topbar-title">
                        <span className="desktop-title">Generador de Fichas</span>
                        <span className="mobile-title">
                            {currentStep}: {STEPS[currentStep - 1].name}{' '}
                            <span className="dropdown-caret">{isMobileMenuOpen ? '▲' : '▼'}</span>
                        </span>
                    </span>
                    <span className="wizard-topbar-version">{APP_VERSIONS.WIZARD}</span>
                </div>

                <div className="pc-counter">
                    <span className="pc-val">{totalPCs}</span> PC
                </div>

                <div className="wizard-topbar-actions">
                    {/* Preview / CharacterSheet */}
                    <CharacterSheet
                        character={character}
                        totalPCs={totalPCs}
                        onShowToast={onShowToast}
                        renderTrigger={(open) => (
                            <button onClick={open} className="btn-base btn-preview" title="Visualizar Ficha">
                                📋 <span className="btn-topbar-label">Ficha</span>
                            </button>
                        )}
                    />

                    {/* Import JSON */}
                    <button onClick={onImportJSON} className="btn-base btn-import" title="Importar JSON">
                        📥 <span>Importar</span>
                    </button>

                    {/* Reset */}
                    <button onClick={onReset} className="btn-base btn-reset" title="Reiniciar personaje">
                        🔄 <span>Reiniciar</span>
                    </button>
                </div>
            </div>

            {/* ── TABS NAV (Desktop) ────────────────────────────── */}
            <div className="wizard-tabs" role="tablist">
                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    let cls = 'wizard-tab';
                    if (isActive) cls += ' active';
                    if (isCompleted) cls += ' completed';

                    return (
                        <button
                            key={step.id}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onStepClick(step.id)}
                            className={cls}
                            title={step.name}
                        >
                            <span className="tab-icon">
                                {isCompleted ? '✓' : step.icon}
                            </span>
                            <span className="tab-label">{step.name}</span>
                            {isCompleted && <span className="tab-check" />}
                        </button>
                    );
                })}
            </div>

            {/* ── MOBILE DROPDOWN ───────────────────────────────── */}
            {isMobileMenuOpen && (
                <>
                    <div className="mobile-dropdown-overlay" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="mobile-dropdown-menu">
                        {STEPS.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;
                            let cls = 'mobile-menu-item';
                            if (isActive) cls += ' active';

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => {
                                        onStepClick(step.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cls}
                                >
                                    <span className="menu-icon">{isCompleted ? '✓' : step.icon}</span>
                                    <span className="menu-text">{step.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}
