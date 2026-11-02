import React from 'react';
import {
    getPowerTransformationConfig,
    WEREWOLF_TRANSITION_FORM_ID,
    type CharacterForm
} from '../../../utils/calculations/formCalculations';

interface SheetFormSwitcherProps {
    availableForms: CharacterForm[];
    effectiveFormId: string;
    onSelectForm: (formId: string) => void;
}

export const SheetFormSwitcher: React.FC<SheetFormSwitcherProps> = ({
    availableForms,
    effectiveFormId,
    onSelectForm
}) => {
    if (!availableForms || availableForms.length === 0) return null;

    return (
        <div className="sheet-form-switcher">
            <span className="sheet-form-switcher-label">🔄 Forma Activa:</span>
            <div className="sheet-form-switcher-buttons">
                <button
                    type="button"
                    onClick={() => onSelectForm('base')}
                    className={`sheet-form-btn ${effectiveFormId === 'base' ? 'active' : ''}`}
                >
                    👤 Forma Base / Humana
                </button>
                {availableForms.map(form => {
                    const powerCfg = getPowerTransformationConfig(form.id);
                    const icon = form.id === WEREWOLF_TRANSITION_FORM_ID ? '🐺' : (powerCfg?.icon || '🔄');
                    return (
                        <button
                            key={form.id}
                            type="button"
                            onClick={() => onSelectForm(form.id)}
                            className={`sheet-form-btn ${effectiveFormId === form.id ? 'active' : ''}`}
                        >
                            {icon} {form.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
