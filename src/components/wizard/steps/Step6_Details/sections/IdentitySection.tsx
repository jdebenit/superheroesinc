import React from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';

interface IdentitySectionProps {
    data: {
        name: string;
        alias: string;
        profession?: string;
        sexualIdentity?: string;
        notes: string;
    };
    updateField: (field: string, value: string) => void;
}

export function IdentitySection({ data, updateField }: IdentitySectionProps) {
    return (
        <>
            <WizardSection title="Identidad">
                <div className="step6-identity-grid step6-identity-row">
                    <WizardField
                        label="Nombre del Personaje"
                        value={data.name || ''}
                        onChange={(val) => updateField('name', val)}
                        placeholder="Ej: Alex Mercer"
                    />
                    <WizardField
                        label="Alias / Nombre en Clave"
                        value={data.alias || ''}
                        onChange={(val) => updateField('alias', val)}
                        placeholder="Ej: Prototype"
                    />
                </div>
                <div className="step6-identity-grid">
                    <WizardField
                        label="Profesión"
                        value={data.profession || ''}
                        onChange={(val) => updateField('profession', val)}
                        placeholder="Ej: Periodista, Mecánico..."
                    />
                    <WizardField
                        label="Identidad Sexual"
                        value={data.sexualIdentity || ''}
                        onChange={(val) => updateField('sexualIdentity', val)}
                        placeholder="Ej: Heterosexual, Bisexual..."
                    />
                </div>
            </WizardSection>

            <WizardSection title="Descripción y Notas">
                <p className="step6-notes-description">
                    Describe la apariencia física, carácter, historia personal y cualquier nota relevante del personaje.
                </p>
                <WizardField
                    type="textarea"
                    label=""
                    value={data.notes || ''}
                    onChange={(val) => updateField('notes', val)}
                    placeholder="Describe la apariencia, personalidad, trasfondo breve..."
                    noMargin
                />
            </WizardSection>
        </>
    );
}
