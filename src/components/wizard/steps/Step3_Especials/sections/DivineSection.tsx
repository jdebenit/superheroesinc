import React, { useMemo } from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../../../data/divineOptions';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { InfoBox } from '../../../shared/ui/InfoBox';

export interface DivineParams {
    focus: string | null;
    hasPhysicalAlteration?: boolean;
    physicalAlterationDescription?: string;
}

interface DivineSectionProps {
    divineParams: DivineParams;
    onChange: (updates: any) => void;
}

export default function DivineSection({ divineParams, onChange }: DivineSectionProps) {
    const { focus, hasPhysicalAlteration = false, physicalAlterationDescription = '' } = divineParams;

    const handleFocusChange = (value: string) => {
        onChange({
            divineParams: {
                ...divineParams,
                focus: value || null
            }
        });
    };

    const handleAlterationToggle = () => {
        onChange({
            divineParams: {
                ...divineParams,
                hasPhysicalAlteration: !hasPhysicalAlteration,
                physicalAlterationDescription: !hasPhysicalAlteration ? physicalAlterationDescription : ''
            }
        });
    };

    const handleAlterationDescriptionChange = (value: string) => {
        onChange({
            divineParams: {
                ...divineParams,
                physicalAlterationDescription: value
            }
        });
    };

    const selectedFocus = useMemo(() =>
        DIVINE_FOCUS_OPTIONS.find(f => f.id === focus),
        [focus]);

    return (
        <WizardSection
            title="Opciones de Origen: Divino / Semidiós"
            color="#b45309"
            description="Como entidad divina, debes determinar si tu poder requiere un foco para manifestarse o alcanzar su máximo potencial."
            rightContent={
                <SectionHeaderBadge
                    cost={(selectedFocus?.cost || 0) > 0 ? `+${selectedFocus?.cost}` : (selectedFocus?.cost || 0)}
                    label="PC"
                    variant={!(selectedFocus?.cost) ? "free" : (selectedFocus.cost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <FormSelect
                label="Foco del Poder"
                value={focus || ''}
                onChange={handleFocusChange}
                options={DIVINE_FOCUS_OPTIONS}
                placeholder="-- Selecciona una opción --"
                labelColor="#b45309"
                showDescription={false}
            />

            {selectedFocus && (
                <InfoBox variant="warning" icon="⚡">
                    <strong>Efecto:</strong> {selectedFocus.description}
                </InfoBox>
            )}

            {/* Physical Alteration toggle */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: hasPhysicalAlteration ? 'rgba(180, 83, 9, 0.08)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', border: `1px solid ${hasPhysicalAlteration ? '#b45309' : '#e5e7eb'}`, transition: 'all 0.2s' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={hasPhysicalAlteration}
                        onChange={handleAlterationToggle}
                        style={{ marginTop: '2px', accentColor: '#b45309', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>Alteración física destacable</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>
                            El personaje tiene una alteración física evidente que le delata inmediatamente como no humano (ej: torso de araña, cabeza de chacal…).
                            Al activar esta opción, se elimina el sobrecoste de <strong>+3 PC</strong> para elegir poderes fuera de la lista divina.
                        </div>
                    </div>
                </label>

                {hasPhysicalAlteration && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '0.4rem' }}>
                            Describe la alteración física <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <textarea
                            value={physicalAlterationDescription}
                            onChange={(e) => handleAlterationDescriptionChange(e.target.value)}
                            placeholder="Ej: tiene el torso de una araña y ocho ojos, la cabeza de un chacal, una corona de serpientes vivas que le salen de la cabeza…"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: `1px solid ${physicalAlterationDescription.trim() ? '#b45309' : '#fca5a5'}`,
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                resize: 'vertical',
                                background: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        {!physicalAlterationDescription.trim() && (
                            <p style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.25rem' }}>
                                Debes describir la alteración física para que sea válida.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {!hasPhysicalAlteration && (
                <InfoBox variant="info" icon="📋">
                    Sin alteración física, elegir poderes fuera de la lista divina tiene un sobrecoste de <strong>+3 PC por poder</strong>.
                    Activa la opción anterior para eliminarlo.
                </InfoBox>
            )}
        </WizardSection>
    );
}




