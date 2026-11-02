import { WizardSection } from '../../shared/layout/WizardSection';
import { ORIGINS, SINGLE_SELECTION_ORIGINS, useStep1Logic } from './useStep1Logic';
import type { BaseStepProps } from '../../../../types/character';
import './Step1_OriginSelection.css';
import '../../shared/layout/WizardStep.css';

export type Step1Props = BaseStepProps;

export default function Step1_OriginSelection({ data, onChange, onShowHelp }: Step1Props) {
    const {
        selectedOrigins,
        selectedSubtypes,
        getOriginCategory,
        handleToggleOrigin,
        handleToggleSubtype
    } = useStep1Logic(data, onChange);

    const hasOriginsWithSubtypes = selectedOrigins.some(id => {
        const cat = getOriginCategory(id);
        return cat?.subtypes && Object.keys(cat.subtypes).length > 0;
    });

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Selecciona los Orígenes del Personaje"
                description="Divino, Cósmico y Parahumano solo pueden elegir un tipo. Los demás pueden elegir múltiples tipos."
                onHelp={onShowHelp}
            >
                <div className="step1-origins-grid">
                    {ORIGINS.map((origin) => {
                        const isSelected = selectedOrigins.includes(origin.id);
                        const category = getOriginCategory(origin.id);
                        const isDisabled = category?.disabled;
                        const hasSubtypes = category?.subtypes && Object.keys(category.subtypes).length > 0;
                        const needsSubtype = isSelected && hasSubtypes && (selectedSubtypes[origin.id] || []).filter(s => !category?.defaultEffects?.includes(s)).length === 0;

                        if (!category) return null;

                        return (
                            <button
                                key={origin.id}
                                onClick={() => !isDisabled && handleToggleOrigin(origin.id)}
                                disabled={isDisabled}
                                title={isDisabled ? 'Próximamente disponible' : origin.name}
                                className={`step1-origin-card ${isDisabled ? 'disabled' : needsSubtype ? 'needs-subtype' : isSelected ? 'selected' : 'default'}`}
                            >
                                <div className={`step1-origin-indicator ${needsSubtype ? 'needs-subtype' : isSelected ? 'selected' : 'default'}`}>
                                    {needsSubtype ? '!' : (isSelected && '✓')}
                                </div>

                                <img
                                    src={origin.logo}
                                    alt={origin.name}
                                    className={`step1-origin-logo ${isDisabled ? 'disabled' : isSelected ? 'selected' : 'default'}`}
                                />

                                <span className={`step1-origin-name ${isDisabled ? 'disabled' : isSelected ? 'selected' : 'default'}`}>
                                    {origin.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {hasOriginsWithSubtypes && (
                    <div className="step1-subtypes-inline-panel">
                        <div className="step1-subtypes-inline-divider">
                            <span>Tipo / Especialización</span>
                        </div>
                        <div className="step1-subtypes-panel">
                            {selectedOrigins.map(id => {
                                const origin = ORIGINS.find(o => o.id === id);
                                const category = getOriginCategory(id);
                                if (!category?.subtypes || Object.keys(category.subtypes).length === 0) return null;

                                const isSingleSelection = SINGLE_SELECTION_ORIGINS.includes(id);
                                const availableSubtypes = Object.keys(category.subtypes).filter(s => !category.disabledSubtypes?.includes(s));
                                const needsWarning = (selectedSubtypes[id] || []).filter(s => !category.defaultEffects?.includes(s)).length === 0;

                                return (
                                    <div
                                        key={id}
                                        className={`step1-subtype-card ${needsWarning ? 'warning' : 'normal'}`}
                                    >
                                        <div className="step1-subtype-card-header">
                                            <img src={origin?.logo} alt={origin?.name} className="step1-subtype-origin-logo" />
                                            <span className="step1-subtype-origin-name">{origin?.name}</span>
                                            <span className="step1-subtype-instruction">
                                                {id === 'vigilantes' ? '— Elige especializaciones' : (isSingleSelection ? '— Elige uno' : '— Elige uno o varios')}
                                            </span>
                                            {needsWarning && (
                                                <span className="step1-subtype-warning-text">
                                                    ⚠️ Pendiente de elegir
                                                </span>
                                            )}
                                        </div>

                                        <div className="step1-subtype-chips-container">
                                            {availableSubtypes.map(subtype => {
                                                const isChecked = selectedSubtypes[id]?.includes(subtype) || false;
                                                const isSubSelected = isSingleSelection ? (selectedSubtypes[id]?.[0] === subtype) : isChecked;

                                                return (
                                                    <label
                                                        key={subtype}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.4rem 0.9rem',
                                                            borderRadius: '999px',
                                                            border: '2px solid',
                                                            borderColor: isSubSelected ? '#2563eb' : '#d1d5db',
                                                            backgroundColor: isSubSelected ? '#dbeafe' : 'white',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                            fontSize: '0.875rem',
                                                            fontWeight: isSubSelected ? 700 : 400,
                                                            color: isSubSelected ? '#1e40af' : '#374151',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        <input
                                                            type={isSingleSelection ? 'radio' : 'checkbox'}
                                                            name={isSingleSelection ? `subtype-${id}` : undefined}
                                                            checked={isSubSelected}
                                                            onChange={() => handleToggleSubtype(id, subtype)}
                                                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                                        />
                                                        {isSubSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                                                        {subtype}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </WizardSection>
        </div>
    );
}
